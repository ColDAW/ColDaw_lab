#!/bin/bash

# Railway 部署测试脚本
# 用于测试认证 API 是否正常工作

# 设置您的 Railway 应用 URL
RAILWAY_URL="${1:-https://your-app.railway.app}"

echo "🧪 测试 ColDaw Railway 部署"
echo "📍 URL: $RAILWAY_URL"
echo ""

# 测试 1: Health Check
echo "1️⃣ 测试健康检查..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$RAILWAY_URL/api/health")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HEALTH_CODE" = "200" ]; then
  echo "✅ 健康检查通过"
  echo "   响应: $HEALTH_BODY"
else
  echo "❌ 健康检查失败 (HTTP $HEALTH_CODE)"
  echo "   响应: $HEALTH_BODY"
  exit 1
fi
echo ""

# 测试 2: 注册新用户
echo "2️⃣ 测试用户注册..."
REGISTER_EMAIL="test-$(date +%s)@example.com"
REGISTER_PASSWORD="testpass123"

REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$RAILWAY_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$REGISTER_EMAIL\",\"password\":\"$REGISTER_PASSWORD\",\"name\":\"Test User\"}")

REGISTER_CODE=$(echo "$REGISTER_RESPONSE" | tail -n 1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | head -n -1)

if [ "$REGISTER_CODE" = "200" ]; then
  echo "✅ 用户注册成功"
  echo "   邮箱: $REGISTER_EMAIL"
  TOKEN=$(echo "$REGISTER_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:20}..."
else
  echo "❌ 用户注册失败 (HTTP $REGISTER_CODE)"
  echo "   响应: $REGISTER_BODY"
  exit 1
fi
echo ""

# 测试 3: 登录
echo "3️⃣ 测试用户登录..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$RAILWAY_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$REGISTER_EMAIL\",\"password\":\"$REGISTER_PASSWORD\"}")

LOGIN_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

if [ "$LOGIN_CODE" = "200" ]; then
  echo "✅ 用户登录成功"
  echo "   响应: $LOGIN_BODY"
else
  echo "❌ 用户登录失败 (HTTP $LOGIN_CODE)"
  echo "   响应: $LOGIN_BODY"
  exit 1
fi
echo ""

# 测试 4: Token 验证
echo "4️⃣ 测试 Token 验证..."
VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" "$RAILWAY_URL/api/auth/verify" \
  -H "Authorization: Bearer $TOKEN")

VERIFY_CODE=$(echo "$VERIFY_RESPONSE" | tail -n 1)
VERIFY_BODY=$(echo "$VERIFY_RESPONSE" | head -n -1)

if [ "$VERIFY_CODE" = "200" ]; then
  echo "✅ Token 验证成功"
  echo "   响应: $VERIFY_BODY"
else
  echo "❌ Token 验证失败 (HTTP $VERIFY_CODE)"
  echo "   响应: $VERIFY_BODY"
  exit 1
fi
echo ""

# 测试 5: CORS 检查
echo "5️⃣ 测试 CORS 配置..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$RAILWAY_URL/api/auth/login" \
  -H "Origin: https://your-frontend.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
  echo "✅ CORS 配置正确"
  echo "$CORS_RESPONSE" | grep "Access-Control"
else
  echo "⚠️  CORS 可能未正确配置"
  echo "$CORS_RESPONSE"
fi
echo ""

echo "🎉 所有测试完成!"
echo ""
echo "📝 使用方法:"
echo "   ./test-railway.sh https://your-app.railway.app"
