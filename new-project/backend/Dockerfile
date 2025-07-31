# 开发阶段
FROM node:18-alpine as development

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3001

# 开发命令
CMD ["npm", "run", "dev"]

# 生产构建阶段
FROM node:18-alpine as build

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装所有依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建TypeScript
RUN npm run build

# 生产阶段
FROM node:18-alpine as production

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 复制package文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 复制构建产物
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动应用
CMD ["node", "dist/index.js"]