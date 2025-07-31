# API 文档

## 基础信息

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **响应格式**: JSON

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": any,
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误信息"
}
```

## API 端点

### 1. 健康检查

**GET** `/health`

检查服务器状态。

**响应示例:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

### 2. API 信息

**GET** `/api`

获取API版本信息和可用端点。

**响应示例:**
```json
{
  "message": "现代化全栈应用 API",
  "version": "1.0.0",
  "status": "active",
  "endpoints": {
    "data": "/api/data",
    "health": "/health"
  }
}
```

### 3. 数据管理

#### 3.1 获取所有数据

**GET** `/api/data`

获取所有数据项列表。

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "示例标题",
      "content": "示例内容",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 3.2 获取单个数据

**GET** `/api/data/:id`

根据ID获取特定数据项。

**参数:**
- `id` (number) - 数据项ID

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "示例标题",
    "content": "示例内容",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**错误响应 (404):**
```json
{
  "success": false,
  "message": "数据不存在"
}
```

#### 3.3 创建数据

**POST** `/api/data`

创建新的数据项。

**请求体:**
```json
{
  "title": "新标题",
  "content": "新内容"
}
```

**字段验证:**
- `title` (string, required) - 标题不能为空
- `content` (string, required) - 内容不能为空

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "title": "新标题",
    "content": "新内容",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "创建成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**验证错误响应 (400):**
```json
{
  "success": false,
  "message": "数据验证失败",
  "errors": [
    {
      "msg": "标题不能为空",
      "param": "title",
      "location": "body"
    }
  ]
}
```

#### 3.4 更新数据

**PUT** `/api/data/:id`

更新指定ID的数据项。

**参数:**
- `id` (number) - 数据项ID

**请求体:**
```json
{
  "title": "更新的标题",
  "content": "更新的内容"
}
```

**字段验证:**
- `title` (string, optional) - 如果提供，不能为空
- `content` (string, optional) - 如果提供，不能为空

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "更新的标题",
    "content": "更新的内容",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "更新成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 3.5 删除数据

**DELETE** `/api/data/:id`

删除指定ID的数据项。

**参数:**
- `id` (number) - 数据项ID

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "被删除的标题",
    "content": "被删除的内容",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "删除成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 错误代码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 速率限制

- 每个IP地址每15分钟最多100个请求
- 超出限制将返回429状态码

## 示例代码

### JavaScript/TypeScript

```typescript
// 获取数据
const response = await fetch('http://localhost:3001/api/data');
const result = await response.json();

// 创建数据
const createResponse = await fetch('http://localhost:3001/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '新标题',
    content: '新内容'
  })
});
const createResult = await createResponse.json();
```

### curl

```bash
# 获取所有数据
curl -X GET http://localhost:3001/api/data

# 创建数据
curl -X POST http://localhost:3001/api/data \
  -H "Content-Type: application/json" \
  -d '{"title":"新标题","content":"新内容"}'

# 更新数据
curl -X PUT http://localhost:3001/api/data/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"更新的标题"}'

# 删除数据
curl -X DELETE http://localhost:3001/api/data/1
```