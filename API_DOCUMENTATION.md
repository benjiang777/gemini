# Gemini Proxy API Documentation

## Overview

The Gemini Proxy is a service that provides OpenAI-compatible API endpoints for Google's Gemini models. It supports both REST API and WebSocket connections, enabling seamless integration with existing OpenAI-compatible applications.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [REST API Endpoints](#rest-api-endpoints)
  - [Chat Completions](#chat-completions)
  - [Embeddings](#embeddings)
  - [Models](#models)
- [WebSocket API](#websocket-api)
- [Error Handling](#error-handling)
- [Response Formats](#response-formats)
- [Examples](#examples)

## Authentication

All API requests require authentication using an API key in the Authorization header:

```http
Authorization: Bearer YOUR_GEMINI_API_KEY
```

You can obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Base URL

The service runs on the deployed domain. For local deployment, the default URL is:
```
http://localhost:8000
```

For Deno deployment, use your assigned Deno project domain.

## REST API Endpoints

### Chat Completions

Creates a completion for the chat message.

**Endpoint:** `POST /chat/completions`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Request Body:**
```json
{
  "model": "gemini-1.5-pro-latest",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user", 
      "content": "Hello, how are you?"
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1000,
  "top_p": 1.0,
  "top_k": 40,
  "frequency_penalty": 0,
  "presence_penalty": 0,
  "stop": ["Human:", "AI:"],
  "n": 1
}
```

**Parameters:**
- `model` (string, optional): Model ID to use. Defaults to "gemini-1.5-pro-latest"
- `messages` (array): List of messages comprising the conversation
- `stream` (boolean, optional): Whether to stream responses. Defaults to false
- `temperature` (number, optional): Controls randomness (0-2). Defaults to 1
- `max_tokens` (integer, optional): Maximum tokens to generate
- `max_completion_tokens` (integer, optional): Alias for max_tokens
- `top_p` (number, optional): Nucleus sampling parameter (0-1)
- `top_k` (integer, optional): Top-k sampling parameter (Gemini-specific)
- `frequency_penalty` (number, optional): Frequency penalty (-2 to 2)
- `presence_penalty` (number, optional): Presence penalty (-2 to 2)
- `stop` (string/array, optional): Stop sequences
- `n` (integer, optional): Number of completions to generate
- `response_format` (object, optional): Response format specification

**Response Format Options:**
```json
{
  "response_format": {
    "type": "json_object"
  }
}

{
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "schema": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "age": {"type": "number"}
        }
      }
    }
  }
}

{
  "response_format": {
    "type": "text"
  }
}
```

**Message Content Types:**

Text message:
```json
{
  "role": "user",
  "content": "Hello"
}
```

Multi-modal message with image:
```json
{
  "role": "user",
  "content": [
    {
      "type": "text",
      "text": "What's in this image?"
    },
    {
      "type": "image_url",
      "image_url": {
        "url": "https://example.com/image.jpg"
      }
    }
  ]
}
```

Audio input:
```json
{
  "role": "user", 
  "content": [
    {
      "type": "input_audio",
      "input_audio": {
        "data": "base64_encoded_audio_data",
        "format": "wav"
      }
    }
  ]
}
```

**Response (Non-streaming):**
```json
{
  "id": "chatcmpl-8pMMaqXMK68B3nyDBrapTDrhkHBQK",
  "object": "chat.completion",
  "created": 1701234567,
  "model": "gemini-1.5-pro-latest",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking. How can I help you today?"
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 20,
    "total_tokens": 35
  }
}
```

**Response (Streaming):**
When `stream: true`, responses are sent as Server-Sent Events:

```
data: {"id":"chatcmpl-8pMMaqXMK68B3nyDBrapTDrhkHBQK","object":"chat.completion.chunk","created":1701234567,"model":"gemini-1.5-pro-latest","choices":[{"index":0,"delta":{"role":"assistant","content":""},"logprobs":null,"finish_reason":null}]}

data: {"id":"chatcmpl-8pMMaqXMK68B3nyDBrapTDrhkHBQK","object":"chat.completion.chunk","created":1701234567,"model":"gemini-1.5-pro-latest","choices":[{"index":0,"delta":{"content":"Hello"},"logprobs":null,"finish_reason":null}]}

data: {"id":"chatcmpl-8pMMaqXMK68B3nyDBrapTDrhkHBQK","object":"chat.completion.chunk","created":1701234567,"model":"gemini-1.5-pro-latest","choices":[{"index":0,"delta":{"content":"!"},"logprobs":null,"finish_reason":null}]}

data: {"id":"chatcmpl-8pMMaqXMK68B3nyDBrapTDrhkHBQK","object":"chat.completion.chunk","created":1701234567,"model":"gemini-1.5-pro-latest","choices":[{"index":0,"delta":{},"logprobs":null,"finish_reason":"stop"}]}

data: [DONE]
```

### Embeddings

Creates an embedding vector representing the input text.

**Endpoint:** `POST /embeddings`

**Request Body:**
```json
{
  "input": ["Hello world", "Another text"],
  "model": "text-embedding-004",
  "dimensions": 512
}
```

**Parameters:**
- `input` (string/array): Text(s) to embed
- `model` (string, optional): Embedding model. Defaults to "text-embedding-004"
- `dimensions` (integer, optional): Number of dimensions in output embeddings

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.123, -0.456, 0.789, ...]
    },
    {
      "object": "embedding", 
      "index": 1,
      "embedding": [0.321, -0.654, 0.987, ...]
    }
  ],
  "model": "text-embedding-004"
}
```

### Models

Lists available models.

**Endpoint:** `GET /models`

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "gemini-1.5-pro-latest",
      "object": "model",
      "created": 0,
      "owned_by": ""
    },
    {
      "id": "gemini-1.5-flash",
      "object": "model", 
      "created": 0,
      "owned_by": ""
    }
  ]
}
```

## WebSocket API

The service supports WebSocket connections for real-time streaming. WebSocket requests are proxied directly to Google's Gemini WebSocket endpoint.

**Connection:** 
```
ws://your-domain/ws
```

**Usage:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = function() {
    console.log('Connected to Gemini WebSocket');
    
    // Send message
    ws.send(JSON.stringify({
        type: 'message',
        content: 'Hello Gemini!'
    }));
};

ws.onmessage = function(event) {
    const response = JSON.parse(event.data);
    console.log('Received:', response);
};

ws.onclose = function(event) {
    console.log('Connection closed:', event.code, event.reason);
};

ws.onerror = function(error) {
    console.error('WebSocket error:', error);
};
```

## Error Handling

The API returns standard HTTP error codes with descriptive messages.

**Error Response Format:**
```json
{
  "error": {
    "message": "Error description",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

**Common Error Codes:**
- `400` - Bad Request: Invalid request format or parameters
- `401` - Unauthorized: Missing or invalid API key
- `404` - Not Found: Endpoint not found
- `500` - Internal Server Error: Server processing error

## Response Formats

### Finish Reasons

- `stop` - Natural completion or stop sequence reached
- `length` - Maximum token limit reached
- `content_filter` - Content filtered due to safety settings

### Content Safety

The service uses Gemini's built-in safety settings with the following categories disabled by default:
- `HARM_CATEGORY_HATE_SPEECH`
- `HARM_CATEGORY_SEXUALLY_EXPLICIT` 
- `HARM_CATEGORY_DANGEROUS_CONTENT`
- `HARM_CATEGORY_HARASSMENT`
- `HARM_CATEGORY_CIVIC_INTEGRITY`

All categories are set to `BLOCK_NONE` threshold.

## Examples

### Basic Chat Completion

```bash
curl -X POST "http://localhost:8000/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gemini-1.5-pro-latest",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'
```

### Streaming Chat Completion

```bash
curl -X POST "http://localhost:8000/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gemini-1.5-pro-latest", 
    "messages": [
      {"role": "user", "content": "Tell me a short story"}
    ],
    "stream": true
  }'
```

### Image Analysis

```bash
curl -X POST "http://localhost:8000/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gemini-1.5-pro-latest",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text", 
            "text": "What do you see in this image?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://example.com/image.jpg"
            }
          }
        ]
      }
    ]
  }'
```

### Text Embeddings

```bash
curl -X POST "http://localhost:8000/embeddings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "input": "The quick brown fox jumps over the lazy dog",
    "model": "text-embedding-004"
  }'
```

### Structured JSON Output

```bash
curl -X POST "http://localhost:8000/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gemini-1.5-pro-latest",
    "messages": [
      {"role": "user", "content": "Generate a person profile"}
    ],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "schema": {
          "type": "object",
          "properties": {
            "name": {"type": "string"},
            "age": {"type": "number"},
            "occupation": {"type": "string"}
          },
          "required": ["name", "age", "occupation"]
        }
      }
    }
  }'
```

### Using with OpenAI SDK

```python
import openai

client = openai.OpenAI(
    base_url="http://localhost:8000",
    api_key="YOUR_GEMINI_API_KEY"
)

response = client.chat.completions.create(
    model="gemini-1.5-pro-latest",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ]
)

print(response.choices[0].message.content)
```

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'http://localhost:8000',
  apiKey: 'YOUR_GEMINI_API_KEY'
});

const completion = await openai.chat.completions.create({
  messages: [{ role: 'user', content: 'Hello, how are you?' }],
  model: 'gemini-1.5-pro-latest',
});

console.log(completion.choices[0].message.content);
```

## Integration Examples

### Cherry Studio

1. Open Cherry Studio settings
2. Add new model service
3. Set Base URL: `http://your-domain`
4. Set API Key: Your Gemini API key
5. Add models and start chatting

### Cursor IDE

1. Open Cursor settings
2. Go to AI settings
3. Add custom model provider:
   - Provider: OpenAI Compatible
   - Base URL: `http://your-domain`
   - API Key: Your Gemini API key
   - Model: `gemini-1.5-pro-latest`

### ChatBox

1. Open ChatBox settings
2. Add API provider
3. Set OpenAI API endpoint: `http://your-domain`
4. Set API Key: Your Gemini API key
5. Select model and start chatting