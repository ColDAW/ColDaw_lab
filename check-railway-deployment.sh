#!/bin/bash

# Railway 部署状态检查脚本
# 使用方法: ./check-railway-deployment.sh [YOUR_RAILWAY_URL]

RAILWAY_URL="${1:-https://your-app.railway.app}"

echo "🚀 检查 Railway 部署状态: $RAILWAY_URL"
echo ""

# 检查健康状态
echo "🏥 检查应用健康状态..."
health_response=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/api/health")

if [[ $health_response == "200" ]]; then
    echo "✅ 应用健康检查通过 (HTTP $health_response)"
else
    echo "❌ 应用健康检查失败 (HTTP $health_response)"
fi

# 检查前端
echo ""
echo "🌐 检查前端页面..."
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL")

if [[ $frontend_response == "200" ]]; then
    echo "✅ 前端页面加载成功 (HTTP $frontend_response)"
else
    echo "❌ 前端页面加载失败 (HTTP $frontend_response)"
fi

# 检查 API 端点
echo ""
echo "🔗 检查 API 端点..."
api_endpoints=(
    "/api/health"
    "/api/auth/me"
    "/api/projects"
)

for endpoint in "${api_endpoints[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL$endpoint")
    if [[ $response == "200" || $response == "401" ]]; then
        echo "✅ $endpoint (HTTP $response)"
    else
        echo "❌ $endpoint (HTTP $response)"
    fi
done

# 检查 WebSocket 连接
echo ""
echo "🔌 检查 WebSocket 支持..."
websocket_response=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/socket.io/")

if [[ $websocket_response == "200" ]]; then
    echo "✅ WebSocket 端点可访问 (HTTP $websocket_response)"
else
    echo "❌ WebSocket 端点不可访问 (HTTP $websocket_response)"
fi

echo ""
echo "📊 部署状态检查完成！"