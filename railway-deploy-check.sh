#!/bin/bash

# ColDaw Railway 部署预检查脚本
echo "🚀 ColDaw Railway 部署预检查开始..."

# 检查必要文件
echo "📋 检查必要文件..."
files_to_check=(
    "package.json"
    "Dockerfile" 
    "railway.json"
    ".env.example"
    "server/package.json"
    "client/package.json"
)

missing_files=()
for file in "${files_to_check[@]}"; do
    if [[ ! -f "$file" ]]; then
        missing_files+=("$file")
    else
        echo "✅ $file"
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    echo "❌ 缺少以下文件:"
    printf '   - %s\n' "${missing_files[@]}"
    exit 1
fi

# 检查依赖
echo ""
echo "📦 检查依赖..."

# 检查 Node.js 版本
if command -v node >/dev/null 2>&1; then
    node_version=$(node --version)
    echo "✅ Node.js: $node_version"
    
    # 检查版本是否 >= 18
    node_major_version=$(echo "$node_version" | sed 's/v\([0-9]*\).*/\1/')
    if [[ $node_major_version -lt 18 ]]; then
        echo "⚠️  警告: Node.js 版本应该 >= 18.0.0"
    fi
else
    echo "❌ Node.js 未安装"
fi

# 检查 npm
if command -v npm >/dev/null 2>&1; then
    npm_version=$(npm --version)
    echo "✅ npm: $npm_version"
else
    echo "❌ npm 未安装"
fi

echo ""
echo "🔍 检查配置文件..."

# 检查 Dockerfile
if grep -q "FROM node:18-alpine" Dockerfile; then
    echo "✅ Dockerfile 使用正确的 Node.js 版本"
else
    echo "⚠️  Dockerfile 可能需要更新 Node.js 版本"
fi

# 检查 railway.json
if jq empty railway.json 2>/dev/null; then
    echo "✅ railway.json 格式正确"
else
    echo "⚠️  railway.json 格式可能有问题"
fi

echo ""
echo "🧪 测试构建..."

# 测试客户端构建
echo "📱 测试客户端构建..."
cd client
if npm install --silent; then
    echo "✅ 客户端依赖安装成功"
else
    echo "❌ 客户端依赖安装失败"
    cd ..
    exit 1
fi

if npm run build --silent; then
    echo "✅ 客户端构建成功"
    rm -rf dist
else
    echo "❌ 客户端构建失败"
    cd ..
    exit 1
fi
cd ..

# 测试服务器构建
echo "🖥️  测试服务器构建..."
cd server
if npm install --silent; then
    echo "✅ 服务器依赖安装成功"
else
    echo "❌ 服务器依赖安装失败"
    cd ..
    exit 1
fi

if npm run build --silent; then
    echo "✅ 服务器构建成功"
    rm -rf dist
else
    echo "❌ 服务器构建失败"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "🎉 所有检查通过！项目已准备好部署到 Railway。"
echo ""
echo "📖 下一步:"
echo "1. 将代码推送到 Git 仓库"
echo "2. 在 Railway 中连接您的仓库"
echo "3. 配置环境变量 (参考 .env.example)"
echo "4. 部署！"
echo ""
echo "📚 详细说明请查看: RAILWAY_DEPLOYMENT.md"