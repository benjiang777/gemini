# 开发指南

## 开发环境设置

### 1. 系统要求

- Node.js 16.0.0+
- npm 8.0.0+
- Git
- VS Code (推荐)

### 2. VS Code 扩展推荐

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode-remote.remote-containers",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### 3. 代码规范

#### ESLint 配置

项目使用 ESLint 进行代码检查，配置文件位于：
- 前端: `frontend/.eslintrc.json`
- 后端: `backend/.eslintrc.json`

#### Prettier 配置

代码格式化使用 Prettier，配置文件：
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### 4. Git 工作流

#### 分支命名规范

- `main` - 主分支
- `develop` - 开发分支
- `feature/feature-name` - 功能分支
- `bugfix/bug-description` - 修复分支
- `hotfix/critical-fix` - 热修复分支

#### 提交消息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型说明:**
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式调整
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建过程或辅助工具的变动

**示例:**
```
feat: 添加用户登录功能
fix(api): 修复数据获取错误
docs: 更新API文档
```

## 项目架构

### 前端架构

```
frontend/src/
├── components/     # 可复用组件
│   ├── common/    # 通用组件
│   └── ui/        # UI组件
├── pages/         # 页面组件
├── hooks/         # 自定义Hooks
├── utils/         # 工具函数
├── services/      # API服务
├── types/         # TypeScript类型定义
├── styles/        # 样式文件
└── assets/        # 静态资源
```

#### 组件开发规范

1. **组件命名**: 使用 PascalCase
2. **文件结构**: 一个组件一个文件
3. **Props接口**: 必须定义TypeScript接口
4. **导出方式**: 使用默认导出

```typescript
// components/UserCard.tsx
import React from 'react';

interface UserCardProps {
  name: string;
  email: string;
  onEdit?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ name, email, onEdit }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      {onEdit && <button onClick={onEdit}>编辑</button>}
    </div>
  );
};

export default UserCard;
```

### 后端架构

```
backend/src/
├── controllers/   # 控制器
├── routes/        # 路由
├── middleware/    # 中间件
├── models/        # 数据模型
├── services/      # 业务逻辑
├── utils/         # 工具函数
├── types/         # TypeScript类型
└── config/        # 配置文件
```

#### API开发规范

1. **路由命名**: 使用RESTful风格
2. **错误处理**: 统一错误处理中间件
3. **数据验证**: 使用express-validator
4. **响应格式**: 统一JSON响应格式

```typescript
// controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 业务逻辑
    const users = await userService.getAll();
    
    res.json({
      success: true,
      data: users,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};
```

## 状态管理

### 前端状态管理

项目使用React内置的状态管理：
- `useState` - 组件内部状态
- `useContext` - 跨组件状态共享
- `useReducer` - 复杂状态逻辑

### 自定义Hooks

创建可复用的状态逻辑：

```typescript
// hooks/useApi.ts
import { useState } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (url: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fetchData };
};
```

## 测试策略

### 前端测试

1. **单元测试**: Jest + React Testing Library
2. **组件测试**: 测试组件渲染和交互
3. **集成测试**: 测试组件组合

```typescript
// __tests__/UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from '../components/UserCard';

describe('UserCard', () => {
  const mockProps = {
    name: 'John Doe',
    email: 'john@example.com',
    onEdit: jest.fn()
  };

  test('renders user information', () => {
    render(<UserCard {...mockProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    render(<UserCard {...mockProps} />);
    
    fireEvent.click(screen.getByText('编辑'));
    expect(mockProps.onEdit).toHaveBeenCalled();
  });
});
```

### 后端测试

1. **单元测试**: Jest
2. **API测试**: Supertest
3. **集成测试**: 测试完整请求流程

```typescript
// __tests__/api.test.ts
import request from 'supertest';
import app from '../src/index';

describe('API Tests', () => {
  test('GET /health returns 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
      
    expect(response.body.status).toBe('OK');
  });

  test('GET /api/data returns data array', async () => {
    const response = await request(app)
      .get('/api/data')
      .expect(200);
      
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

## 性能优化

### 前端优化

1. **代码分割**: 使用React.lazy和Suspense
2. **组件优化**: 使用React.memo和useMemo
3. **图片优化**: 使用WebP格式和懒加载
4. **Bundle分析**: 使用webpack-bundle-analyzer

```typescript
// 代码分割示例
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### 后端优化

1. **响应缓存**: 使用Redis缓存频繁查询
2. **数据库优化**: 添加适当索引
3. **压缩**: 启用gzip压缩
4. **监控**: 使用性能监控工具

## 部署

### 开发环境

```bash
# 启动开发环境
npm run dev

# 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:3001
```

### 生产环境

```bash
# 构建应用
npm run build

# 启动生产服务器
npm start
```

### Docker部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 故障排除

### 常见问题

1. **端口占用**: 修改package.json中的端口配置
2. **依赖冲突**: 删除node_modules重新安装
3. **类型错误**: 检查TypeScript配置和类型定义

### 调试技巧

1. **浏览器开发工具**: 使用React DevTools
2. **网络请求**: 检查Network面板
3. **服务器日志**: 查看后端控制台输出
4. **断点调试**: 在VS Code中设置断点

### 日志记录

```typescript
// 使用结构化日志
console.log({
  level: 'info',
  message: '用户登录',
  userId: user.id,
  timestamp: new Date().toISOString()
});
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 编写代码和测试
4. 提交Pull Request
5. 代码审查
6. 合并到主分支

记住：好的代码不仅要能运行，还要易于理解和维护！