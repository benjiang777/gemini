# Developer Documentation

## Overview

This document provides detailed information about the internal structure, components, and functions of the Gemini Proxy service. It's intended for developers who want to understand, modify, or contribute to the codebase.

## Table of Contents

- [Architecture](#architecture)
- [Core Components](#core-components)
- [Request Processing Flow](#request-processing-flow)
- [Function Reference](#function-reference)
- [Data Transformations](#data-transformations)
- [WebSocket Implementation](#websocket-implementation)
- [Error Handling](#error-handling)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Architecture

The Gemini Proxy is designed as a lightweight service that translates OpenAI-compatible API calls to Google Gemini API format. It supports both Cloudflare Workers and Deno runtime environments.

### File Structure

```
├── src/
│   ├── index.js              # Cloudflare Workers entry point
│   ├── deno_index.ts         # Deno entry point
│   └── api_proxy/
│       └── worker.mjs        # Core API proxy logic
├── package.json              # Node.js dependencies
├── deno.json                 # Deno configuration
├── docker-compose.yml        # Docker deployment
├── Dockerfile               # Container configuration
└── deploy.sh                # Deployment script
```

## Core Components

### 1. Main Request Handler (`index.js`)

The Cloudflare Workers entry point that handles incoming requests and routes them appropriately.

#### Main Export Function

```javascript
export default {
  async fetch(request, env, ctx) {
    // Request routing logic
  }
}
```

**Parameters:**
- `request` (Request): Incoming HTTP request
- `env` (Object): Environment variables and bindings
- `ctx` (Object): Execution context

**Functionality:**
- Routes WebSocket upgrade requests to `handleWebSocket()`
- Routes API requests to `handleAPIRequest()`
- Serves static content from `__STATIC_CONTENT`
- Returns 404 for unmatched routes

### 2. Deno Request Handler (`deno_index.ts`)

TypeScript implementation for Deno runtime with similar functionality to the Cloudflare version.

#### Main Handler Function

```typescript
async function handleRequest(req: Request): Promise<Response>
```

**Parameters:**
- `req` (Request): Incoming HTTP request

**Returns:**
- `Promise<Response>`: HTTP response

### 3. API Proxy Worker (`api_proxy/worker.mjs`)

The core logic for handling API requests and transforming them between OpenAI and Gemini formats.

## Function Reference

### Core Request Handlers

#### `handleWebSocket(request, env)`

Handles WebSocket connections for real-time streaming.

**Location:** `src/index.js:54-175`

**Parameters:**
- `request` (Request): WebSocket upgrade request
- `env` (Object): Environment object

**Returns:**
- `Response`: WebSocket response with status 101

**Implementation Details:**
- Creates WebSocket pair using `new WebSocketPair()`
- Establishes connection to `wss://generativelanguage.googleapis.com`
- Implements message queueing for pending messages
- Handles bidirectional message forwarding
- Manages connection lifecycle and error handling

**Message Flow:**
1. Client connects to proxy
2. Proxy establishes connection to Gemini
3. Messages queued until Gemini connection is ready
4. Bidirectional message forwarding
5. Connection cleanup on close/error

#### `handleAPIRequest(request, env)`

Routes API requests to the proxy worker.

**Location:** `src/index.js:177-195`

**Parameters:**
- `request` (Request): API request
- `env` (Object): Environment object

**Returns:**
- `Promise<Response>`: API response

**Implementation:**
- Dynamically imports worker module
- Delegates request handling to worker
- Provides error handling and status code mapping

### API Proxy Functions

#### `handleCompletions(req, apiKey)`

Processes chat completion requests.

**Location:** `src/api_proxy/worker.mjs:128-163`

**Parameters:**
- `req` (Object): OpenAI-format request body
- `apiKey` (string): Gemini API key

**Returns:**
- `Promise<Response>`: Completion response

**Process Flow:**
1. Model name normalization
2. Request transformation using `transformRequest()`
3. API call to Gemini with appropriate endpoint
4. Response transformation for streaming/non-streaming
5. OpenAI-compatible response formatting

#### `handleEmbeddings(req, apiKey)`

Processes text embedding requests.

**Location:** `src/api_proxy/worker.mjs:96-126`

**Parameters:**
- `req` (Object): Embeddings request
- `apiKey` (string): Gemini API key

**Returns:**
- `Promise<Response>`: Embeddings response

**Process Flow:**
1. Input normalization (string → array)
2. Model validation and defaulting
3. Batch embedding request to Gemini
4. Response transformation to OpenAI format

#### `handleModels(apiKey)`

Lists available models.

**Location:** `src/api_proxy/worker.mjs:81-94`

**Parameters:**
- `apiKey` (string): Gemini API key

**Returns:**
- `Promise<Response>`: Models list response

**Implementation:**
- Fetches models from Gemini API
- Transforms model names (removes "models/" prefix)
- Returns OpenAI-compatible model list format

### Utility Functions

#### `getContentType(path)`

Determines MIME type based on file extension.

**Location:** `src/index.js:42-53`

**Parameters:**
- `path` (string): File path

**Returns:**
- `string`: MIME type

**Supported Types:**
- `js` → `application/javascript`
- `css` → `text/css`
- `html` → `text/html`
- `json` → `application/json`
- `png` → `image/png`
- `jpg/jpeg` → `image/jpeg`
- `gif` → `image/gif`
- Default → `text/plain`

#### `makeHeaders(apiKey, more)`

Creates headers for Gemini API requests.

**Location:** `src/api_proxy/worker.mjs:66-70`

**Parameters:**
- `apiKey` (string): API key
- `more` (Object): Additional headers

**Returns:**
- `Object`: Headers object

**Generated Headers:**
- `x-goog-api-client`: API client identifier
- `x-goog-api-key`: API key (if provided)
- Additional headers from `more` parameter

#### `fixCors(response)`

Adds CORS headers to responses.

**Location:** `src/api_proxy/worker.mjs:57-61`

**Parameters:**
- `response` (Object): Response object with headers, status, statusText

**Returns:**
- `Object`: Response object with CORS headers

**Added Headers:**
- `Access-Control-Allow-Origin: *`

## Data Transformations

### Request Transformation

#### `transformRequest(req)`

Converts OpenAI request format to Gemini format.

**Location:** `src/api_proxy/worker.mjs:352-356`

**Process:**
1. `transformMessages()` - Convert message format
2. Add safety settings
3. `transformConfig()` - Convert generation parameters

#### `transformMessages(messages)`

Transforms message array from OpenAI to Gemini format.

**Location:** `src/api_proxy/worker.mjs:325-350`

**Key Transformations:**
- `role: "assistant"` → `role: "model"`
- `role: "system"` → `system_instruction`
- Multi-modal content support (text, image, audio)

#### `transformMsg({ role, content })`

Transforms individual message content.

**Location:** `src/api_proxy/worker.mjs:295-323`

**Content Type Support:**
- `text`: Plain text content
- `image_url`: Image from URL or data URI
- `input_audio`: Base64 audio data

**Image Processing:**
- Supports HTTP/HTTPS URLs
- Supports data URIs
- Automatic MIME type detection
- Base64 encoding for external images

#### `transformConfig(req)`

Maps OpenAI parameters to Gemini parameters.

**Location:** `src/api_proxy/worker.mjs:191-230`

**Parameter Mapping:**
- `stop` → `stopSequences`
- `n` → `candidateCount`
- `max_tokens` → `maxOutputTokens`
- `max_completion_tokens` → `maxOutputTokens`
- `temperature` → `temperature`
- `top_p` → `topP`
- `top_k` → `topK`
- `frequency_penalty` → `frequencyPenalty`
- `presence_penalty` → `presencePenalty`

**Response Format Handling:**
- `json_object` → `application/json`
- `json_schema` → Schema validation + MIME type
- `text` → `text/plain`
- Schema with `enum` → `text/x.enum`

### Response Transformation

#### `processCompletionsResponse(data, model, id)`

Transforms Gemini response to OpenAI format.

**Location:** `src/api_proxy/worker.mjs:397-409`

**Generated Fields:**
- `id`: Generated chat completion ID
- `object`: "chat.completion"
- `created`: Unix timestamp
- `model`: Model name
- `choices`: Transformed candidates
- `usage`: Token usage statistics

#### `transformCandidatesMessage(cand)`

Transforms completion candidate for non-streaming response.

**Location:** `src/api_proxy/worker.mjs:384-387`

**Output Format:**
```javascript
{
  index: 0,
  message: {
    role: "assistant",
    content: "Response text"
  },
  logprobs: null,
  finish_reason: "stop"
}
```

#### Stream Processing Functions

##### `parseStream(chunk, controller)`

Parses Server-Sent Events from Gemini streaming response.

**Location:** `src/api_proxy/worker.mjs:411-422`

**Process:**
1. Accumulates chunks in buffer
2. Extracts complete SSE events
3. Forwards JSON data to transform stream

##### `toOpenAiStream(chunk, controller)`

Transforms Gemini streaming data to OpenAI format.

**Location:** `src/api_proxy/worker.mjs:449-481`

**Key Features:**
- First chunk includes role information
- Content chunks exclude role
- Error handling for malformed JSON
- Support for multiple candidates

### Utility Transformations

#### `generateChatcmplId()`

Generates unique chat completion IDs.

**Location:** `src/api_proxy/worker.mjs:358-362`

**Format:** `chatcmpl-` + 29 random alphanumeric characters

#### `transformUsage(data)`

Converts Gemini usage metadata to OpenAI format.

**Location:** `src/api_proxy/worker.mjs:389-395`

**Mapping:**
- `candidatesTokenCount` → `completion_tokens`
- `promptTokenCount` → `prompt_tokens`
- `totalTokenCount` → `total_tokens`

## WebSocket Implementation

### Cloudflare Workers WebSocket

The WebSocket implementation uses Cloudflare's `WebSocketPair` for client connections and standard WebSocket for Gemini connections.

**Key Features:**
- Message queuing for connection timing
- Bidirectional message forwarding
- Connection state management
- Error handling and cleanup

**Message Queue Logic:**
```javascript
if (targetWebSocket.readyState === WebSocket.OPEN) {
  targetWebSocket.send(event.data);
} else {
  pendingMessages.push(event.data);
}
```

### Deno WebSocket

Deno implementation uses `Deno.upgradeWebSocket()` for handling WebSocket connections.

**Differences from Cloudflare:**
- Uses Deno's native WebSocket upgrade
- Simplified event handling syntax
- Same core functionality as Cloudflare version

## Error Handling

### HttpError Class

Custom error class for API errors.

**Location:** `src/api_proxy/worker.mjs:48-54`

```javascript
class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}
```

### Error Processing

Main error handler in fetch function:

**Location:** `src/api_proxy/worker.mjs:15-18`

```javascript
const errHandler = (err) => {
  console.error(err);
  return new Response(err.message, fixCors({ status: err.status ?? 500 }));
};
```

**Features:**
- Automatic CORS header addition
- Status code preservation
- Console logging for debugging

### Common Error Scenarios

1. **Invalid API Key:** 401 status with authentication error
2. **Invalid Request Format:** 400 status with validation error
3. **Network Errors:** 500 status with connection error
4. **Rate Limiting:** Passed through from Gemini API

## Deployment

### Cloudflare Workers

**Requirements:**
- Cloudflare account
- Wrangler CLI
- Static assets binding (`__STATIC_CONTENT`)

**Configuration:**
```javascript
// wrangler.toml example
name = "gemini-proxy"
main = "src/index.js"
compatibility_date = "2023-10-30"

[site]
bucket = "./dist"
```

### Deno Deploy

**Requirements:**
- Deno Deploy account
- GitHub repository

**Configuration:**
- Entry point: `src/deno_index.ts`
- No additional configuration needed

### Docker Deployment

**Dockerfile Features:**
- Multi-stage build
- Node.js base image
- Production optimizations

**Usage:**
```bash
docker build -t gemini-proxy .
docker run -p 8000:8000 gemini-proxy
```

### Local Development

**Node.js:**
```bash
npm run dev
```

**Deno:**
```bash
deno run --allow-net --allow-read src/deno_index.ts
```

## Performance Considerations

### Memory Management

- Streaming responses to minimize memory usage
- Efficient string handling in stream processing
- Cleanup of WebSocket connections

### Connection Pooling

- Reuse of HTTP connections where possible
- WebSocket connection state management
- Proper resource cleanup

### Error Recovery

- Graceful degradation on network errors
- Retry logic for transient failures
- Circuit breaker patterns for reliability

## Security Considerations

### API Key Handling

- API keys passed through headers only
- No logging of sensitive information
- Secure transmission to Gemini API

### Content Safety

- Gemini's built-in safety filters applied
- Configurable safety thresholds
- Content filtering for inappropriate requests

### CORS Configuration

- Wildcard origin allowed for development
- Consider restricting origins in production
- Proper preflight request handling

## Contributing

### Code Style

- Use consistent indentation (2 spaces)
- Follow JavaScript/TypeScript conventions
- Add comments for complex logic
- Use descriptive variable names

### Testing

When adding new features:
1. Test with both Cloudflare and Deno environments
2. Verify OpenAI SDK compatibility
3. Test error scenarios
4. Validate stream processing

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request

### Development Setup

```bash
# Clone repository
git clone https://github.com/trueai-org/gemini.git
cd gemini

# Install dependencies (if using Node.js)
npm install

# Start development server
npm run dev
# OR
deno run --allow-net --allow-read src/deno_index.ts
```

## Debugging

### Logging

Add console.log statements for debugging:

```javascript
console.log('Request received:', {
  url: request.url,
  method: request.method,
  headers: Object.fromEntries(request.headers)
});
```

### Common Issues

1. **CORS Errors:** Check `fixCors()` implementation
2. **WebSocket Failures:** Verify connection state handling
3. **API Errors:** Check Gemini API key and rate limits
4. **Stream Processing:** Validate SSE parsing logic

### Development Tools

- Browser DevTools for client-side debugging
- Cloudflare Workers logs for production debugging
- Deno's built-in debugger for TypeScript issues