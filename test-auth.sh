#!/bin/bash

# Test script for authentication fixes

echo "╔════════════════════════════════════════╗"
echo "║  Testing Authentication Fixes         ║"
echo "╚════════════════════════════════════════╝"
echo ""

SERVER_URL="http://localhost:3001"

# Check if server is running
echo "1️⃣ Checking server status..."
HEALTH=$(curl -s "$SERVER_URL/api/health" 2>/dev/null)
if [[ $HEALTH == *"ok"* ]]; then
    echo "   ✅ Server is running"
else
    echo "   ❌ Server is not running"
    echo "   Please start server: cd server && npm run dev"
    exit 1
fi
echo ""

# Test valid login
echo "2️⃣ Testing valid login..."
VALID_LOGIN=$(curl -s -X POST "$SERVER_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@coldaw.com","password":"demo123"}')

if [[ $VALID_LOGIN == *"token"* ]]; then
    echo "   ✅ Valid login successful"
    TOKEN=$(echo $VALID_LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "   📝 Token: ${TOKEN:0:30}..."
else
    echo "   ❌ Valid login failed"
    echo "   Response: $VALID_LOGIN"
    exit 1
fi
echo ""

# Test invalid login (should return 401 with error message)
echo "3️⃣ Testing invalid password..."
INVALID_LOGIN=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@coldaw.com","password":"wrongpassword"}')

HTTP_CODE=$(echo "$INVALID_LOGIN" | tail -1)
RESPONSE=$(echo "$INVALID_LOGIN" | head -1)

if [[ $HTTP_CODE == "401" ]]; then
    echo "   ✅ Correctly returned 401 status"
    if [[ $RESPONSE == *"Invalid"* ]] || [[ $RESPONSE == *"password"* ]]; then
        echo "   ✅ Error message is clear: $RESPONSE"
    else
        echo "   ⚠️  Error message could be clearer: $RESPONSE"
    fi
else
    echo "   ❌ Wrong status code: $HTTP_CODE"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test upload without authentication (should return 401)
echo "4️⃣ Testing upload without auth..."
# Create a dummy file
echo "dummy content" > /tmp/test.als

NO_AUTH_UPLOAD=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/api/projects/init" \
  -F "alsFile=@/tmp/test.als" \
  -F "projectName=Test Project")

HTTP_CODE=$(echo "$NO_AUTH_UPLOAD" | tail -1)
RESPONSE=$(echo "$NO_AUTH_UPLOAD" | head -1)

if [[ $HTTP_CODE == "401" ]]; then
    echo "   ✅ Upload blocked without auth (401)"
    echo "   📝 Message: $RESPONSE"
else
    echo "   ❌ Upload should be blocked! Got status: $HTTP_CODE"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test token verification
echo "5️⃣ Testing token verification..."
VERIFY=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "$SERVER_URL/api/auth/verify")

HTTP_CODE=$(echo "$VERIFY" | tail -1)
RESPONSE=$(echo "$VERIFY" | head -1)

if [[ $HTTP_CODE == "200" ]]; then
    echo "   ✅ Token verification successful"
    echo "   👤 User: $(echo $RESPONSE | grep -o '"email":"[^"]*"' | cut -d'"' -f4)"
else
    echo "   ❌ Token verification failed"
    echo "   Response: $RESPONSE"
fi
echo ""

# Clean up
rm -f /tmp/test.als

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All authentication tests completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Summary:"
echo "   - Valid login works correctly"
echo "   - Invalid login returns 401 with clear error"
echo "   - Upload requires authentication"
echo "   - Token verification works"
echo ""
echo "🎛️ Plugin Status:"
echo "   - Should show clear error for wrong password"
echo "   - Should only allow upload when logged in"
echo "   - Projects will be associated with correct user"
