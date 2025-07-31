# Usage Examples

## Overview

This document provides comprehensive examples of how to use the Gemini Proxy service with various programming languages, frameworks, and AI tools. All examples assume you have the proxy running and accessible.

## Table of Contents

- [Basic API Usage](#basic-api-usage)
- [Programming Language Examples](#programming-language-examples)
- [Framework Integration](#framework-integration)
- [AI Tool Integration](#ai-tool-integration)
- [Advanced Use Cases](#advanced-use-cases)
- [WebSocket Examples](#websocket-examples)
- [Error Handling](#error-handling)

## Basic API Usage

### Authentication

All requests require an API key in the Authorization header:

```bash
# Replace YOUR_API_KEY with your actual Gemini API key
export API_KEY="your_gemini_api_key_here"
export BASE_URL="http://localhost:8000"  # or your deployed URL
```

### Simple Chat Completion

```bash
curl -X POST "$BASE_URL/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "gemini-1.5-pro-latest",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

### Streaming Response

```bash
curl -X POST "$BASE_URL/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "gemini-1.5-pro-latest",
    "messages": [
      {"role": "user", "content": "Tell me a story"}
    ],
    "stream": true
  }'
```

### List Available Models

```bash
curl -X GET "$BASE_URL/models" \
  -H "Authorization: Bearer $API_KEY"
```

### Text Embeddings

```bash
curl -X POST "$BASE_URL/embeddings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "input": "Hello, world!",
    "model": "text-embedding-004"
  }'
```

## Programming Language Examples

### Python

#### Basic Usage with Requests

```python
import requests
import json

BASE_URL = "http://localhost:8000"
API_KEY = "your_api_key_here"

def chat_completion(messages, stream=False):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    data = {
        "model": "gemini-1.5-pro-latest",
        "messages": messages,
        "stream": stream
    }
    
    response = requests.post(
        f"{BASE_URL}/chat/completions",
        headers=headers,
        json=data,
        stream=stream
    )
    
    if stream:
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    data = line[6:]
                    if data != '[DONE]':
                        chunk = json.loads(data)
                        if chunk['choices'][0]['delta'].get('content'):
                            yield chunk['choices'][0]['delta']['content']
    else:
        return response.json()

# Example usage
messages = [
    {"role": "user", "content": "What is the capital of France?"}
]

# Non-streaming
result = chat_completion(messages)
print(result['choices'][0]['message']['content'])

# Streaming
print("Streaming response:")
for content in chat_completion(messages, stream=True):
    print(content, end='', flush=True)
print()
```

#### Using OpenAI Python SDK

```python
from openai import OpenAI

# Initialize client with custom base URL
client = OpenAI(
    base_url="http://localhost:8000",
    api_key="your_gemini_api_key"
)

# Chat completion
response = client.chat.completions.create(
    model="gemini-1.5-pro-latest",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum computing in simple terms."}
    ],
    temperature=0.7,
    max_tokens=1000
)

print(response.choices[0].message.content)

# Streaming chat completion
stream = client.chat.completions.create(
    model="gemini-1.5-pro-latest",
    messages=[
        {"role": "user", "content": "Write a poem about the ocean"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")

# Embeddings
embeddings = client.embeddings.create(
    model="text-embedding-004",
    input="The quick brown fox jumps over the lazy dog"
)

print(f"Embedding dimension: {len(embeddings.data[0].embedding)}")
```

#### Multi-modal with Images

```python
import base64
import requests

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Image analysis
base64_image = encode_image("path/to/your/image.jpg")

response = client.chat.completions.create(
    model="gemini-1.5-pro-latest",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What's in this image? Describe it in detail."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ],
    max_tokens=500
)

print(response.choices[0].message.content)
```

### JavaScript/Node.js

#### Basic Usage with Fetch

```javascript
const BASE_URL = "http://localhost:8000";
const API_KEY = "your_api_key_here";

async function chatCompletion(messages, options = {}) {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gemini-1.5-pro-latest",
            messages: messages,
            ...options
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

async function streamChatCompletion(messages, options = {}) {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gemini-1.5-pro-latest",
            messages: messages,
            stream: true,
            ...options
        })
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') return;
                
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0]?.delta?.content;
                    if (content) {
                        process.stdout.write(content);
                    }
                } catch (e) {
                    // Skip malformed JSON
                }
            }
        }
    }
}

// Example usage
async function main() {
    const messages = [
        { role: "user", content: "What is machine learning?" }
    ];
    
    try {
        // Non-streaming
        const result = await chatCompletion(messages);
        console.log(result.choices[0].message.content);
        
        // Streaming
        console.log("\nStreaming response:");
        await streamChatCompletion(messages);
        console.log();
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
```

#### Using OpenAI SDK

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'http://localhost:8000',
    apiKey: 'your_gemini_api_key'
});

// Chat completion
async function basicChat() {
    const completion = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a helpful coding assistant.' },
            { role: 'user', content: 'Write a function to calculate fibonacci numbers in JavaScript' }
        ],
        model: 'gemini-1.5-pro-latest',
        temperature: 0.7
    });
    
    console.log(completion.choices[0].message.content);
}

// Streaming completion
async function streamingChat() {
    const stream = await openai.chat.completions.create({
        model: 'gemini-1.5-pro-latest',
        messages: [{ role: 'user', content: 'Explain async/await in JavaScript' }],
        stream: true,
    });
    
    for await (const chunk of stream) {
        process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }
}

// Function calling example
async function functionCalling() {
    const functions = [
        {
            name: "get_weather",
            description: "Get the current weather in a location",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "The city and state, e.g. San Francisco, CA"
                    }
                },
                required: ["location"]
            }
        }
    ];
    
    const response = await openai.chat.completions.create({
        model: 'gemini-1.5-pro-latest',
        messages: [
            { role: 'user', content: 'What is the weather like in Tokyo?' }
        ],
        functions: functions,
        function_call: "auto"
    });
    
    console.log(response.choices[0].message);
}

// Run examples
basicChat();
streamingChat();
```

### TypeScript

```typescript
interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

class GeminiClient {
    private baseURL: string;
    private apiKey: string;
    
    constructor(baseURL: string, apiKey: string) {
        this.baseURL = baseURL;
        this.apiKey = apiKey;
    }
    
    async chatCompletion(
        messages: ChatMessage[],
        options: {
            model?: string;
            temperature?: number;
            maxTokens?: number;
            stream?: boolean;
        } = {}
    ): Promise<ChatCompletionResponse> {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: options.model || 'gemini-1.5-pro-latest',
                messages,
                temperature: options.temperature,
                max_tokens: options.maxTokens,
                stream: options.stream || false
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        return await response.json();
    }
    
    async *streamChatCompletion(
        messages: ChatMessage[],
        options: { model?: string; temperature?: number } = {}
    ): AsyncGenerator<string, void, unknown> {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: options.model || 'gemini-1.5-pro-latest',
                messages,
                temperature: options.temperature,
                stream: true
            })
        });
        
        if (!response.body) throw new Error('No response body');
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') return;
                        
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                yield content;
                            }
                        } catch (e) {
                            // Skip malformed JSON
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }
}

// Usage example
async function example() {
    const client = new GeminiClient('http://localhost:8000', 'your_api_key');
    
    const messages: ChatMessage[] = [
        { role: 'user', content: 'Explain TypeScript generics' }
    ];
    
    // Non-streaming
    const response = await client.chatCompletion(messages, {
        temperature: 0.7,
        maxTokens: 500
    });
    console.log(response.choices[0].message.content);
    
    // Streaming
    console.log('\nStreaming response:');
    for await (const content of client.streamChatCompletion(messages)) {
        process.stdout.write(content);
    }
}

example().catch(console.error);
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "bufio"
    "strings"
)

type ChatMessage struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}

type ChatCompletionRequest struct {
    Model       string        `json:"model"`
    Messages    []ChatMessage `json:"messages"`
    Temperature *float64      `json:"temperature,omitempty"`
    MaxTokens   *int          `json:"max_tokens,omitempty"`
    Stream      bool          `json:"stream,omitempty"`
}

type ChatCompletionResponse struct {
    ID      string `json:"id"`
    Object  string `json:"object"`
    Created int64  `json:"created"`
    Model   string `json:"model"`
    Choices []struct {
        Index   int `json:"index"`
        Message struct {
            Role    string `json:"role"`
            Content string `json:"content"`
        } `json:"message"`
        FinishReason string `json:"finish_reason"`
    } `json:"choices"`
    Usage struct {
        PromptTokens     int `json:"prompt_tokens"`
        CompletionTokens int `json:"completion_tokens"`
        TotalTokens      int `json:"total_tokens"`
    } `json:"usage"`
}

type GeminiClient struct {
    BaseURL string
    APIKey  string
    Client  *http.Client
}

func NewGeminiClient(baseURL, apiKey string) *GeminiClient {
    return &GeminiClient{
        BaseURL: baseURL,
        APIKey:  apiKey,
        Client:  &http.Client{},
    }
}

func (c *GeminiClient) ChatCompletion(req ChatCompletionRequest) (*ChatCompletionResponse, error) {
    jsonData, err := json.Marshal(req)
    if err != nil {
        return nil, err
    }
    
    httpReq, err := http.NewRequest("POST", c.BaseURL+"/chat/completions", bytes.NewBuffer(jsonData))
    if err != nil {
        return nil, err
    }
    
    httpReq.Header.Set("Content-Type", "application/json")
    httpReq.Header.Set("Authorization", "Bearer "+c.APIKey)
    
    resp, err := c.Client.Do(httpReq)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        body, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("API request failed: %d %s", resp.StatusCode, string(body))
    }
    
    var response ChatCompletionResponse
    err = json.NewDecoder(resp.Body).Decode(&response)
    return &response, err
}

func (c *GeminiClient) StreamChatCompletion(req ChatCompletionRequest, callback func(string)) error {
    req.Stream = true
    jsonData, err := json.Marshal(req)
    if err != nil {
        return err
    }
    
    httpReq, err := http.NewRequest("POST", c.BaseURL+"/chat/completions", bytes.NewBuffer(jsonData))
    if err != nil {
        return err
    }
    
    httpReq.Header.Set("Content-Type", "application/json")
    httpReq.Header.Set("Authorization", "Bearer "+c.APIKey)
    
    resp, err := c.Client.Do(httpReq)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    scanner := bufio.NewScanner(resp.Body)
    for scanner.Scan() {
        line := scanner.Text()
        if strings.HasPrefix(line, "data: ") {
            data := strings.TrimPrefix(line, "data: ")
            if data == "[DONE]" {
                break
            }
            
            var chunk map[string]interface{}
            if err := json.Unmarshal([]byte(data), &chunk); err == nil {
                if choices, ok := chunk["choices"].([]interface{}); ok && len(choices) > 0 {
                    if choice, ok := choices[0].(map[string]interface{}); ok {
                        if delta, ok := choice["delta"].(map[string]interface{}); ok {
                            if content, ok := delta["content"].(string); ok {
                                callback(content)
                            }
                        }
                    }
                }
            }
        }
    }
    
    return scanner.Err()
}

func main() {
    client := NewGeminiClient("http://localhost:8000", "your_api_key")
    
    messages := []ChatMessage{
        {Role: "user", Content: "Explain how goroutines work in Go"},
    }
    
    req := ChatCompletionRequest{
        Model:    "gemini-1.5-pro-latest",
        Messages: messages,
    }
    
    // Non-streaming
    response, err := client.ChatCompletion(req)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("Response: %s\n", response.Choices[0].Message.Content)
    
    // Streaming
    fmt.Println("\nStreaming response:")
    err = client.StreamChatCompletion(req, func(content string) {
        fmt.Print(content)
    })
    if err != nil {
        fmt.Printf("Streaming error: %v\n", err)
    }
    fmt.Println()
}
```

### Java

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.io.BufferedReader;
import java.io.StringReader;

public class GeminiClient {
    private final String baseURL;
    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    public GeminiClient(String baseURL, String apiKey) {
        this.baseURL = baseURL;
        this.apiKey = apiKey;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }
    
    public static class ChatMessage {
        public String role;
        public String content;
        
        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }
    
    public static class ChatCompletionRequest {
        public String model = "gemini-1.5-pro-latest";
        public List<ChatMessage> messages;
        public Double temperature;
        public Integer maxTokens;
        public Boolean stream;
        
        public ChatCompletionRequest(List<ChatMessage> messages) {
            this.messages = messages;
        }
    }
    
    public JsonNode chatCompletion(ChatCompletionRequest request) throws Exception {
        String jsonBody = objectMapper.writeValueAsString(request);
        
        HttpRequest httpRequest = HttpRequest.newBuilder()
            .uri(URI.create(baseURL + "/chat/completions"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();
        
        HttpResponse<String> response = httpClient.send(httpRequest, 
            HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            throw new RuntimeException("API request failed: " + response.statusCode() + " " + response.body());
        }
        
        return objectMapper.readTree(response.body());
    }
    
    public void streamChatCompletion(ChatCompletionRequest request, 
                                   StreamCallback callback) throws Exception {
        request.stream = true;
        String jsonBody = objectMapper.writeValueAsString(request);
        
        HttpRequest httpRequest = HttpRequest.newBuilder()
            .uri(URI.create(baseURL + "/chat/completions"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();
        
        HttpResponse<String> response = httpClient.send(httpRequest, 
            HttpResponse.BodyHandlers.ofString());
        
        BufferedReader reader = new BufferedReader(new StringReader(response.body()));
        String line;
        
        while ((line = reader.readLine()) != null) {
            if (line.startsWith("data: ")) {
                String data = line.substring(6);
                if ("[DONE]".equals(data)) {
                    break;
                }
                
                try {
                    JsonNode chunk = objectMapper.readTree(data);
                    JsonNode choices = chunk.get("choices");
                    if (choices != null && choices.size() > 0) {
                        JsonNode delta = choices.get(0).get("delta");
                        if (delta != null && delta.has("content")) {
                            callback.onContent(delta.get("content").asText());
                        }
                    }
                } catch (Exception e) {
                    // Skip malformed JSON
                }
            }
        }
    }
    
    @FunctionalInterface
    public interface StreamCallback {
        void onContent(String content);
    }
    
    public static void main(String[] args) throws Exception {
        GeminiClient client = new GeminiClient("http://localhost:8000", "your_api_key");
        
        List<ChatMessage> messages = List.of(
            new ChatMessage("user", "Explain Java streams and lambda expressions")
        );
        
        ChatCompletionRequest request = new ChatCompletionRequest(messages);
        request.temperature = 0.7;
        
        // Non-streaming
        JsonNode response = client.chatCompletion(request);
        String content = response.get("choices").get(0).get("message").get("content").asText();
        System.out.println("Response: " + content);
        
        // Streaming
        System.out.println("\nStreaming response:");
        client.streamChatCompletion(request, content -> System.out.print(content));
        System.out.println();
    }
}
```

## Framework Integration

### React Application

```jsx
import React, { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';
const API_KEY = 'your_api_key';

const ChatComponent = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    const sendMessage = useCallback(async (userMessage) => {
        const newMessages = [
            ...messages,
            { role: 'user', content: userMessage }
        ];
        
        setMessages(newMessages);
        setLoading(true);
        
        try {
            const response = await axios.post(
                `${API_BASE_URL}/chat/completions`,
                {
                    model: 'gemini-1.5-pro-latest',
                    messages: newMessages,
                    temperature: 0.7,
                    max_tokens: 1000
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    }
                }
            );
            
            const assistantMessage = {
                role: 'assistant',
                content: response.data.choices[0].message.content
            };
            
            setMessages([...newMessages, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            // Handle error appropriately
        } finally {
            setLoading(false);
        }
    }, [messages]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !loading) {
            sendMessage(input);
            setInput('');
        }
    };
    
    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        <strong>{message.role}:</strong> {message.content}
                    </div>
                ))}
                {loading && <div className="loading">AI is thinking...</div>}
            </div>
            
            <form onSubmit={handleSubmit} className="input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !input.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatComponent;
```

### Vue.js Application

```vue
<template>
  <div class="chat-app">
    <div class="messages-container">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.role]"
      >
        <strong>{{ message.role }}:</strong> {{ message.content }}
      </div>
      <div v-if="loading" class="loading">AI is thinking...</div>
    </div>
    
    <form @submit.prevent="sendMessage" class="input-form">
      <input
        v-model="input"
        type="text"
        placeholder="Type your message..."
        :disabled="loading"
      />
      <button type="submit" :disabled="loading || !input.trim()">
        Send
      </button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ChatApp',
  data() {
    return {
      messages: [],
      input: '',
      loading: false,
      apiKey: 'your_api_key',
      baseURL: 'http://localhost:8000'
    };
  },
  methods: {
    async sendMessage() {
      if (!this.input.trim() || this.loading) return;
      
      const userMessage = { role: 'user', content: this.input };
      this.messages.push(userMessage);
      
      const inputValue = this.input;
      this.input = '';
      this.loading = true;
      
      try {
        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: 'gemini-1.5-pro-latest',
            messages: this.messages,
            temperature: 0.7
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            }
          }
        );
        
        const assistantMessage = {
          role: 'assistant',
          content: response.data.choices[0].message.content
        };
        
        this.messages.push(assistantMessage);
      } catch (error) {
        console.error('Error:', error);
        this.messages.push({
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.chat-app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.messages-container {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 20px;
}

.message {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
}

.message.user {
  background-color: #e3f2fd;
  text-align: right;
}

.message.assistant {
  background-color: #f5f5f5;
}

.input-form {
  display: flex;
  gap: 10px;
}

.input-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.input-form button {
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
```

### Express.js Backend

```javascript
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const GEMINI_PROXY_URL = 'http://localhost:8000';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your_api_key';

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, temperature = 0.7, maxTokens = 1000 } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }
        
        const response = await axios.post(
            `${GEMINI_PROXY_URL}/chat/completions`,
            {
                model: 'gemini-1.5-pro-latest',
                messages,
                temperature,
                max_tokens: maxTokens
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GEMINI_API_KEY}`
                }
            }
        );
        
        res.json({
            message: response.data.choices[0].message.content,
            usage: response.data.usage
        });
    } catch (error) {
        console.error('Chat API error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to process chat request',
            details: error.response?.data?.error || error.message
        });
    }
});

// Streaming chat endpoint
app.post('/api/chat/stream', async (req, res) => {
    try {
        const { messages, temperature = 0.7 } = req.body;
        
        // Set headers for Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        
        const response = await axios.post(
            `${GEMINI_PROXY_URL}/chat/completions`,
            {
                model: 'gemini-1.5-pro-latest',
                messages,
                temperature,
                stream: true
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GEMINI_API_KEY}`
                },
                responseType: 'stream'
            }
        );
        
        response.data.on('data', (chunk) => {
            res.write(chunk);
        });
        
        response.data.on('end', () => {
            res.end();
        });
        
        response.data.on('error', (error) => {
            console.error('Stream error:', error);
            res.end();
        });
        
    } catch (error) {
        console.error('Streaming chat error:', error);
        res.status(500).json({ error: 'Failed to start stream' });
    }
});

// Embeddings endpoint
app.post('/api/embeddings', async (req, res) => {
    try {
        const { text, model = 'text-embedding-004' } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        
        const response = await axios.post(
            `${GEMINI_PROXY_URL}/embeddings`,
            {
                input: text,
                model
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GEMINI_API_KEY}`
                }
            }
        );
        
        res.json({
            embedding: response.data.data[0].embedding,
            model: response.data.model
        });
    } catch (error) {
        console.error('Embeddings API error:', error);
        res.status(500).json({ error: 'Failed to generate embeddings' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## AI Tool Integration

### Cherry Studio

Cherry Studio is a popular AI client that supports OpenAI-compatible APIs.

**Setup Instructions:**

1. Open Cherry Studio
2. Go to Settings → Model Providers
3. Add new provider:
   - **Provider Type**: OpenAI Compatible
   - **Base URL**: `http://your-domain:8000` (or your deployed URL)
   - **API Key**: Your Gemini API key
   - **Model ID**: `gemini-1.5-pro-latest`

4. Save and test the connection

**Configuration Example:**
```json
{
  "provider": "openai-compatible",
  "baseURL": "http://localhost:8000",
  "apiKey": "your_gemini_api_key",
  "models": [
    {
      "id": "gemini-1.5-pro-latest",
      "name": "Gemini 1.5 Pro",
      "contextLength": 1000000
    },
    {
      "id": "gemini-1.5-flash",
      "name": "Gemini 1.5 Flash",
      "contextLength": 1000000
    }
  ]
}
```

### Cursor IDE

Cursor supports custom AI providers for code assistance.

**Setup Instructions:**

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Go to "AI" section
3. Add custom provider:
   - **Provider**: OpenAI Compatible
   - **Base URL**: `http://your-domain:8000`
   - **API Key**: Your Gemini API key
   - **Model**: `gemini-1.5-pro-latest`

**Custom Configuration:**
```json
{
  "ai.provider": "openai-compatible",
  "ai.baseURL": "http://localhost:8000",
  "ai.apiKey": "your_gemini_api_key",
  "ai.model": "gemini-1.5-pro-latest",
  "ai.temperature": 0.3,
  "ai.maxTokens": 2000
}
```

### Continue (VS Code Extension)

Continue is a VS Code extension for AI-powered coding assistance.

**Configuration file** (`~/.continue/config.json`):
```json
{
  "models": [
    {
      "title": "Gemini Pro",
      "provider": "openai",
      "model": "gemini-1.5-pro-latest",
      "apiKey": "your_gemini_api_key",
      "apiBase": "http://localhost:8000",
      "contextLength": 1000000
    }
  ],
  "customCommands": [
    {
      "name": "explain",
      "prompt": "Explain the following code:\n\n{{{input}}}"
    },
    {
      "name": "optimize",
      "prompt": "Optimize this code for better performance:\n\n{{{input}}}"
    }
  ]
}
```

### ChatBox

ChatBox is a desktop AI chat application.

**Setup Instructions:**

1. Open ChatBox
2. Go to Settings
3. Add API Provider:
   - **Provider**: Custom OpenAI API
   - **API Host**: `http://your-domain:8000`
   - **API Key**: Your Gemini API key
   - **Model**: `gemini-1.5-pro-latest`

### LangChain Integration

```python
from langchain.llms.base import LLM
from langchain.schema import LLMResult, Generation
import requests
import json
from typing import Optional, List, Any

class GeminiProxyLLM(LLM):
    base_url: str = "http://localhost:8000"
    api_key: str
    model: str = "gemini-1.5-pro-latest"
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    
    @property
    def _llm_type(self) -> str:
        return "gemini-proxy"
    
    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[Any] = None,
        **kwargs: Any,
    ) -> str:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        data = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "stop": stop
        }
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            raise Exception(f"API request failed: {response.status_code}")
        
        result = response.json()
        return result["choices"][0]["message"]["content"]

# Usage example
llm = GeminiProxyLLM(api_key="your_api_key")

# Basic usage
response = llm("Explain quantum computing in simple terms")
print(response)

# With LangChain chains
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

prompt = PromptTemplate(
    input_variables=["topic"],
    template="Write a detailed explanation about {topic}"
)

chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run(topic="machine learning")
print(result)
```

## Advanced Use Cases

### Multi-modal Processing

```python
import base64
import requests
from PIL import Image
import io

def analyze_image_with_text(image_path, question):
    # Read and encode image
    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
    
    # Get image format
    with Image.open(image_path) as img:
        format_name = img.format.lower()
    
    response = requests.post(
        "http://localhost:8000/chat/completions",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        },
        json={
            "model": "gemini-1.5-pro-latest",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": question
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/{format_name};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 1000
        }
    )
    
    return response.json()["choices"][0]["message"]["content"]

# Example usage
result = analyze_image_with_text(
    "chart.png", 
    "What trends can you see in this chart? Provide a detailed analysis."
)
print(result)
```

### Document Processing

```python
import PyPDF2
import requests
from typing import List

class DocumentProcessor:
    def __init__(self, api_key: str, base_url: str = "http://localhost:8000"):
        self.api_key = api_key
        self.base_url = base_url
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    def chunk_text(self, text: str, chunk_size: int = 4000) -> List[str]:
        """Split text into manageable chunks"""
        words = text.split()
        chunks = []
        current_chunk = []
        current_length = 0
        
        for word in words:
            if current_length + len(word) + 1 > chunk_size:
                chunks.append(" ".join(current_chunk))
                current_chunk = [word]
                current_length = len(word)
            else:
                current_chunk.append(word)
                current_length += len(word) + 1
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks
    
    def summarize_document(self, text: str) -> str:
        """Summarize a document"""
        chunks = self.chunk_text(text)
        summaries = []
        
        for chunk in chunks:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                },
                json={
                    "model": "gemini-1.5-pro-latest",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a helpful assistant that summarizes documents. Provide concise, accurate summaries."
                        },
                        {
                            "role": "user",
                            "content": f"Summarize this text:\n\n{chunk}"
                        }
                    ],
                    "temperature": 0.3
                }
            )
            
            summary = response.json()["choices"][0]["message"]["content"]
            summaries.append(summary)
        
        # Combine summaries
        if len(summaries) > 1:
            combined_text = "\n\n".join(summaries)
            final_response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                },
                json={
                    "model": "gemini-1.5-pro-latest",
                    "messages": [
                        {
                            "role": "user",
                            "content": f"Create a final summary from these section summaries:\n\n{combined_text}"
                        }
                    ],
                    "temperature": 0.3
                }
            )
            return final_response.json()["choices"][0]["message"]["content"]
        else:
            return summaries[0]

# Usage
processor = DocumentProcessor("your_api_key")
pdf_text = processor.extract_text_from_pdf("document.pdf")
summary = processor.summarize_document(pdf_text)
print(summary)
```

### Code Generation and Review

```python
import requests
import json

class CodeAssistant:
    def __init__(self, api_key: str, base_url: str = "http://localhost:8000"):
        self.api_key = api_key
        self.base_url = base_url
    
    def generate_code(self, description: str, language: str = "python") -> str:
        """Generate code based on description"""
        prompt = f"""
        Generate {language} code for the following requirement:
        {description}
        
        Please provide:
        1. Clean, well-commented code
        2. Error handling where appropriate
        3. Example usage if applicable
        
        Only return the code, no additional explanation.
        """
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            },
            json={
                "model": "gemini-1.5-pro-latest",
                "messages": [
                    {"role": "system", "content": "You are an expert programmer. Generate clean, efficient code."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3
            }
        )
        
        return response.json()["choices"][0]["message"]["content"]
    
    def review_code(self, code: str, language: str = "python") -> str:
        """Review code and provide suggestions"""
        prompt = f"""
        Review this {language} code and provide feedback:
        
        ```{language}
        {code}
        ```
        
        Please analyze:
        1. Code quality and best practices
        2. Potential bugs or issues
        3. Performance considerations
        4. Security concerns
        5. Suggestions for improvement
        """
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            },
            json={
                "model": "gemini-1.5-pro-latest",
                "messages": [
                    {"role": "system", "content": "You are a senior code reviewer. Provide constructive feedback."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2
            }
        )
        
        return response.json()["choices"][0]["message"]["content"]
    
    def explain_code(self, code: str, language: str = "python") -> str:
        """Explain what the code does"""
        prompt = f"""
        Explain this {language} code in detail:
        
        ```{language}
        {code}
        ```
        
        Please explain:
        1. What the code does
        2. How it works step by step
        3. Key concepts used
        4. Input and output
        """
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            },
            json={
                "model": "gemini-1.5-pro-latest",
                "messages": [
                    {"role": "system", "content": "You are a programming teacher. Explain code clearly and comprehensively."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3
            }
        )
        
        return response.json()["choices"][0]["message"]["content"]

# Usage examples
assistant = CodeAssistant("your_api_key")

# Generate code
code = assistant.generate_code(
    "Create a function that calculates the fibonacci sequence up to n terms",
    "python"
)
print("Generated code:")
print(code)

# Review code
review = assistant.review_code(code, "python")
print("\nCode review:")
print(review)

# Explain code
explanation = assistant.explain_code(code, "python")
print("\nCode explanation:")
print(explanation)
```

## WebSocket Examples

### JavaScript WebSocket Client

```javascript
class GeminiWebSocketClient {
    constructor(wsUrl) {
        this.wsUrl = wsUrl;
        this.ws = null;
        this.messageHandlers = new Set();
        this.connectionHandlers = new Set();
    }
    
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.wsUrl);
                
                this.ws.onopen = (event) => {
                    console.log('WebSocket connected');
                    this.connectionHandlers.forEach(handler => {
                        try {
                            handler('connected', event);
                        } catch (error) {
                            console.error('Connection handler error:', error);
                        }
                    });
                    resolve(event);
                };
                
                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.messageHandlers.forEach(handler => {
                            try {
                                handler(data);
                            } catch (error) {
                                console.error('Message handler error:', error);
                            }
                        });
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                };
                
                this.ws.onclose = (event) => {
                    console.log('WebSocket disconnected:', event.code, event.reason);
                    this.connectionHandlers.forEach(handler => {
                        try {
                            handler('disconnected', event);
                        } catch (error) {
                            console.error('Connection handler error:', error);
                        }
                    });
                };
                
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.connectionHandlers.forEach(handler => {
                        try {
                            handler('error', error);
                        } catch (error) {
                            console.error('Connection handler error:', error);
                        }
                    });
                    reject(error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            throw new Error('WebSocket is not connected');
        }
    }
    
    onMessage(handler) {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }
    
    onConnection(handler) {
        this.connectionHandlers.add(handler);
        return () => this.connectionHandlers.delete(handler);
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// Usage example
async function example() {
    const client = new GeminiWebSocketClient('ws://localhost:8000/ws');
    
    // Set up message handler
    const removeMessageHandler = client.onMessage((data) => {
        console.log('Received:', data);
        // Handle streaming response
        if (data.type === 'content') {
            document.getElementById('response').textContent += data.content;
        }
    });
    
    // Set up connection handler
    const removeConnectionHandler = client.onConnection((status, event) => {
        console.log('Connection status:', status);
        if (status === 'connected') {
            // Send initial message
            client.sendMessage({
                type: 'chat',
                message: 'Hello, how are you?',
                stream: true
            });
        }
    });
    
    try {
        await client.connect();
        
        // Send additional messages
        setTimeout(() => {
            client.sendMessage({
                type: 'chat',
                message: 'Tell me about quantum computing',
                stream: true
            });
        }, 5000);
        
    } catch (error) {
        console.error('Failed to connect:', error);
    }
    
    // Clean up after 30 seconds
    setTimeout(() => {
        removeMessageHandler();
        removeConnectionHandler();
        client.disconnect();
    }, 30000);
}

// Run example
example();
```

### Python WebSocket Client

```python
import asyncio
import websockets
import json
import logging

class GeminiWebSocketClient:
    def __init__(self, ws_url):
        self.ws_url = ws_url
        self.websocket = None
        self.message_handlers = []
        self.connection_handlers = []
        
    async def connect(self):
        """Connect to the WebSocket server"""
        try:
            self.websocket = await websockets.connect(self.ws_url)
            await self._notify_connection_handlers('connected')
            return True
        except Exception as error:
            logging.error(f"Failed to connect: {error}")
            await self._notify_connection_handlers('error', error)
            return False
    
    async def send_message(self, message):
        """Send a message to the server"""
        if self.websocket:
            await self.websocket.send(json.dumps(message))
        else:
            raise Exception("WebSocket is not connected")
    
    async def listen(self):
        """Listen for messages from the server"""
        try:
            async for message in self.websocket:
                try:
                    data = json.loads(message)
                    await self._notify_message_handlers(data)
                except json.JSONDecodeError as error:
                    logging.error(f"Failed to parse message: {error}")
                    
        except websockets.exceptions.ConnectionClosed:
            logging.info("WebSocket connection closed")
            await self._notify_connection_handlers('disconnected')
        except Exception as error:
            logging.error(f"WebSocket error: {error}")
            await self._notify_connection_handlers('error', error)
    
    def add_message_handler(self, handler):
        """Add a message handler"""
        self.message_handlers.append(handler)
    
    def add_connection_handler(self, handler):
        """Add a connection handler"""
        self.connection_handlers.append(handler)
    
    async def disconnect(self):
        """Disconnect from the server"""
        if self.websocket:
            await self.websocket.close()
            self.websocket = None
    
    async def _notify_message_handlers(self, data):
        """Notify all message handlers"""
        for handler in self.message_handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(data)
                else:
                    handler(data)
            except Exception as error:
                logging.error(f"Message handler error: {error}")
    
    async def _notify_connection_handlers(self, status, event=None):
        """Notify all connection handlers"""
        for handler in self.connection_handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(status, event)
                else:
                    handler(status, event)
            except Exception as error:
                logging.error(f"Connection handler error: {error}")

# Usage example
async def main():
    client = GeminiWebSocketClient('ws://localhost:8000/ws')
    
    # Define message handler
    async def handle_message(data):
        print(f"Received: {data}")
        if data.get('type') == 'content':
            print(data.get('content', ''), end='', flush=True)
    
    # Define connection handler
    async def handle_connection(status, event=None):
        print(f"Connection status: {status}")
        if status == 'connected':
            # Send initial message
            await client.send_message({
                'type': 'chat',
                'message': 'Hello, tell me about artificial intelligence',
                'stream': True
            })
    
    # Add handlers
    client.add_message_handler(handle_message)
    client.add_connection_handler(handle_connection)
    
    # Connect and listen
    if await client.connect():
        # Start listening in background
        listen_task = asyncio.create_task(client.listen())
        
        # Send messages periodically
        await asyncio.sleep(2)
        await client.send_message({
            'type': 'chat',
            'message': 'What are the latest developments in AI?',
            'stream': True
        })
        
        await asyncio.sleep(5)
        await client.send_message({
            'type': 'chat',
            'message': 'Explain machine learning in simple terms',
            'stream': True
        })
        
        # Wait for responses
        await asyncio.sleep(10)
        
        # Clean up
        listen_task.cancel()
        await client.disconnect()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
```

## Error Handling

### Robust Error Handling in Python

```python
import requests
import time
import logging
from typing import Optional, Dict, Any
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class GeminiProxyClient:
    def __init__(self, base_url: str, api_key: str, timeout: int = 30):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout
        
        # Configure session with retries
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Set default headers
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        })
    
    def chat_completion(self, messages: list, **kwargs) -> Optional[Dict[Any, Any]]:
        """Send chat completion request with error handling"""
        try:
            response = self._make_request('/chat/completions', {
                'model': kwargs.get('model', 'gemini-1.5-pro-latest'),
                'messages': messages,
                'temperature': kwargs.get('temperature', 0.7),
                'max_tokens': kwargs.get('max_tokens'),
                'stream': kwargs.get('stream', False)
            })
            
            if response:
                return response
            else:
                logging.error("Failed to get response from chat completion")
                return None
                
        except Exception as e:
            logging.error(f"Chat completion error: {e}")
            return None
    
    def _make_request(self, endpoint: str, data: dict, retries: int = 3) -> Optional[Dict[Any, Any]]:
        """Make HTTP request with error handling and retries"""
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(retries):
            try:
                response = self.session.post(
                    url, 
                    json=data, 
                    timeout=self.timeout
                )
                
                # Handle different status codes
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 401:
                    logging.error("Authentication failed - check API key")
                    raise Exception("Invalid API key")
                elif response.status_code == 429:
                    wait_time = 2 ** attempt
                    logging.warning(f"Rate limited, waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
                elif response.status_code == 500:
                    logging.error("Server error, retrying...")
                    if attempt < retries - 1:
                        time.sleep(1)
                        continue
                    else:
                        raise Exception("Server error after retries")
                else:
                    error_msg = f"HTTP {response.status_code}: {response.text}"
                    logging.error(error_msg)
                    raise Exception(error_msg)
                    
            except requests.exceptions.Timeout:
                logging.warning(f"Request timeout, attempt {attempt + 1}/{retries}")
                if attempt < retries - 1:
                    time.sleep(1)
                    continue
                else:
                    raise Exception("Request timeout after retries")
                    
            except requests.exceptions.ConnectionError:
                logging.warning(f"Connection error, attempt {attempt + 1}/{retries}")
                if attempt < retries - 1:
                    time.sleep(2)
                    continue
                else:
                    raise Exception("Connection error after retries")
                    
            except Exception as e:
                logging.error(f"Unexpected error: {e}")
                if attempt < retries - 1:
                    time.sleep(1)
                    continue
                else:
                    raise e
        
        return None

# Usage example with error handling
def safe_chat_example():
    client = GeminiProxyClient(
        base_url="http://localhost:8000",
        api_key="your_api_key",
        timeout=30
    )
    
    messages = [
        {"role": "user", "content": "What is the meaning of life?"}
    ]
    
    try:
        response = client.chat_completion(messages, temperature=0.7)
        
        if response and 'choices' in response:
            content = response['choices'][0]['message']['content']
            print(f"Response: {content}")
        else:
            print("Failed to get a valid response")
            
    except Exception as e:
        print(f"Error: {e}")
        # Implement fallback behavior
        print("Using fallback response...")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    safe_chat_example()
```

This comprehensive usage examples document should help users integrate the Gemini Proxy service into their applications using various programming languages, frameworks, and tools. The examples cover basic usage, advanced use cases, and proper error handling to ensure robust integration.