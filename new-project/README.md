# 现代化全栈Web应用

一个使用 React + Node.js + TypeScript 构建的现代化全栈Web应用模板。

## ✨ 特性

- **前端**: React 18 + TypeScript + Material-UI
- **后端**: Node.js + Express + TypeScript
- **开发体验**: 热更新、ESLint、类型检查
- **容器化**: Docker + Docker Compose 支持
- **响应式设计**: 支持各种设备尺寸
- **API设计**: RESTful API 规范
- **安全性**: 内置安全最佳实践

## 🏗️ 项目结构

```
new-project/
├── frontend/              # React 前端应用
│   ├── public/           # 静态资源
│   ├── src/              # 源代码
│   │   ├── components/   # React 组件
│   │   ├── pages/        # 页面组件
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── utils/        # 工具函数
│   │   └── styles/       # 样式文件
│   ├── package.json      # 前端依赖
│   └── Dockerfile        # 前端容器配置
├── backend/               # Node.js 后端 API
│   ├── src/              # 源代码
│   │   ├── routes/       # API 路由
│   │   ├── middleware/   # 中间件
│   │   ├── controllers/  # 控制器
│   │   └── utils/        # 工具函数
│   ├── package.json      # 后端依赖
│   └── Dockerfile        # 后端容器配置
├── docs/                  # 项目文档
├── scripts/               # 构建脚本
├── docker-compose.yml     # Docker 编排配置
└── package.json          # 根项目配置
```

## 🚀 快速开始

### 前置要求

- Node.js 16.0.0 或更高版本
- npm 8.0.0 或更高版本
- 可选: Docker 和 Docker Compose

### 本地开发

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd new-project
   ```

2. **安装依赖**
   ```bash
   npm run install:all
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

   这将同时启动:
   - 前端开发服务器: http://localhost:3000
   - 后端API服务器: http://localhost:3001

### Docker 开发

```bash
# 构建并启动所有服务
npm run docker:up

# 停止所有服务
npm run docker:down
```

## 📝 可用脚本

### 根项目命令

- `npm run dev` - 同时启动前后端开发服务器
- `npm run build` - 构建前后端生产版本
- `npm run test` - 运行所有测试
- `npm run lint` - 检查代码规范
- `npm run clean` - 清理所有构建产物

### 前端命令 (在 frontend/ 目录下)

- `npm start` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm test` - 运行测试
- `npm run lint` - 检查代码规范

### 后端命令 (在 backend/ 目录下)

- `npm run dev` - 启动开发服务器 (nodemon)
- `npm run build` - 编译 TypeScript
- `npm start` - 启动生产服务器
- `npm test` - 运行测试

## 🔧 配置

### 环境变量

后端环境变量 (复制 `backend/.env.example` 到 `backend/.env`):

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

前端环境变量 (在 `frontend/` 目录下创建 `.env`):

```env
REACT_APP_API_URL=http://localhost:3001
```

## 📖 API 文档

### 健康检查

```http
GET /health
```

### 数据 API

```http
GET    /api/data      # 获取所有数据
GET    /api/data/:id  # 获取单个数据
POST   /api/data      # 创建数据
PUT    /api/data/:id  # 更新数据
DELETE /api/data/:id  # 删除数据
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行前端测试
npm run test:frontend

# 运行后端测试
npm run test:backend
```

## 📦 部署

### 生产构建

```bash
npm run build
```

### Docker 部署

```bash
# 构建生产镜像
docker-compose -f docker-compose.prod.yml build

# 启动生产环境
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 贡献

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- React 团队提供的优秀框架
- Material-UI 团队提供的组件库
- Express.js 团队提供的后端框架
- 所有开源贡献者

---

**Happy Coding! 🎉**