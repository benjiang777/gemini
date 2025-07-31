#!/bin/bash

# 现代化全栈应用安装脚本
echo "🚀 开始安装现代化全栈应用..."

# 检查Node.js版本
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ 未安装Node.js，请先安装Node.js 16+版本"
    exit 1
fi

echo "✅ Node.js版本: $NODE_VERSION"

# 检查npm版本
NPM_VERSION=$(npm -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ 未安装npm，请先安装npm"
    exit 1
fi

echo "✅ npm版本: $NPM_VERSION"

# 安装根目录依赖
echo "📦 安装根目录依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 根目录依赖安装失败"
    exit 1
fi

# 安装前端依赖
echo "📦 安装前端依赖..."
cd frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi

# 回到根目录
cd ..

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi

# 回到根目录
cd ..

# 复制环境变量示例文件
echo "⚙️  设置环境变量..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ 创建了 backend/.env 文件"
else
    echo "⚠️  backend/.env 文件已存在，跳过创建"
fi

# 创建前端环境变量文件
if [ ! -f frontend/.env ]; then
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:3001
EOF
    echo "✅ 创建了 frontend/.env 文件"
else
    echo "⚠️  frontend/.env 文件已存在，跳过创建"
fi

echo ""
echo "🎉 安装完成！"
echo ""
echo "📋 可用命令:"
echo "  npm run dev          - 启动开发环境(前后端)"
echo "  npm run build        - 构建生产版本"
echo "  npm run test         - 运行测试"
echo "  npm run lint         - 代码检查"
echo "  npm run docker:up    - Docker启动"
echo ""
echo "🌐 访问地址:"
echo "  前端: http://localhost:3000"
echo "  后端API: http://localhost:3001"
echo "  健康检查: http://localhost:3001/health"
echo ""
echo "🚀 现在可以运行 'npm run dev' 启动开发环境！"