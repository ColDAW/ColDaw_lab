#!/bin/bash
# 快速检查 ColDaw 服务状态

echo "🔍 ColDaw 服务状态检查"
echo "===================="
echo ""

# 检查后端
if lsof -nP -iTCP:3001 -sTCP:LISTEN > /dev/null 2>&1; then
    BACKEND_PID=$(lsof -nP -iTCP:3001 -sTCP:LISTEN | tail -n 1 | awk '{print $2}')
    echo "✅ 后端服务运行中"
    echo "   端口: 3001"
    echo "   PID: $BACKEND_PID"
    echo "   地址: http://localhost:3001"
else
    echo "❌ 后端服务未运行 (端口 3001)"
fi

echo ""

# 检查前端
if lsof -nP -iTCP:5173 -sTCP:LISTEN > /dev/null 2>&1; then
    FRONTEND_PID=$(lsof -nP -iTCP:5173 -sTCP:LISTEN | tail -n 1 | awk '{print $2}')
    echo "✅ 前端服务运行中"
    echo "   端口: 5173"
    echo "   PID: $FRONTEND_PID"
    echo "   地址: http://localhost:5173"
else
    echo "❌ 前端服务未运行 (端口 5173)"
fi

echo ""
echo "===================="
echo "💡 在浏览器中访问: http://localhost:5173"
