#!/bin/bash

echo "=== ColDaw 系统测试 ==="
echo ""

# 测试健康检查
echo "1. 测试服务器健康检查..."
HEALTH=$(curl -s http://localhost:3001/api/health)
if [ $? -eq 0 ]; then
    echo "✅ 服务器运行正常"
    echo "   $HEALTH"
else
    echo "❌ 服务器未响应"
    exit 1
fi
echo ""

# 测试注册
echo "2. 测试用户注册..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test_$(date +%s)@example.com\",\"password\":\"testpass123\",\"name\":\"Test User\"}")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo "✅ 注册成功"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
    echo "   User ID: $USER_ID"
else
    echo "❌ 注册失败"
    echo "   Response: $REGISTER_RESPONSE"
fi
echo ""

# 测试登录
echo "3. 测试用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@coldaw.com","password":"demo123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✅ 登录成功"
    DEMO_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    DEMO_USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
    echo "   User ID: $DEMO_USER_ID"
else
    echo "❌ 登录失败"
    echo "   Response: $LOGIN_RESPONSE"
fi
echo ""

# 测试令牌验证
echo "4. 测试令牌验证..."
VERIFY_RESPONSE=$(curl -s -X GET http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer $DEMO_TOKEN")

if echo "$VERIFY_RESPONSE" | grep -q "userId"; then
    echo "✅ 令牌验证成功"
else
    echo "❌ 令牌验证失败"
    echo "   Response: $VERIFY_RESPONSE"
fi
echo ""

# 测试获取项目列表
echo "5. 测试获取项目列表..."
PROJECTS_RESPONSE=$(curl -s -X GET "http://localhost:3001/api/projects?userId=$DEMO_USER_ID" \
  -H "Authorization: Bearer $DEMO_TOKEN")

if echo "$PROJECTS_RESPONSE" | grep -q "\["; then
    PROJECT_COUNT=$(echo "$PROJECTS_RESPONSE" | grep -o '"id"' | wc -l | tr -d ' ')
    echo "✅ 获取项目列表成功"
    echo "   找到 $PROJECT_COUNT 个项目"
else
    echo "❌ 获取项目列表失败"
    echo "   Response: $PROJECTS_RESPONSE"
fi
echo ""

# 检查数据库用户数量
echo "6. 检查数据库用户数量..."
USER_COUNT=$(grep -c '"email"' /Users/yifan/Documents/WebD/ColDaw/server/projects/db.json)
echo "✅ 数据库中有 $USER_COUNT 个用户"
echo ""

# 检查前端是否运行
echo "7. 检查前端服务..."
if curl -s -m 2 http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ 前端服务运行正常 (http://localhost:5173)"
else
    echo "⚠️  前端服务未运行"
fi
echo ""

echo "=== 测试完成 ==="
echo ""
echo "📝 总结:"
echo "   - 后端 API: http://localhost:3001"
echo "   - 前端应用: http://localhost:5173"
echo "   - 演示账号: demo@coldaw.com / demo123"
