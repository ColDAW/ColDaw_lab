# Authentication Fix - Status 401 Issue Resolved

## Problem
用户报告插件显示 "could not connect to server status: 401"

## Root Cause Analysis

### Issue 1: Poor Error Handling in Plugin
插件的 `login()` 方法对 HTTP 401 状态码处理不当：
- 401 (Unauthorized) 被当作"无法连接到服务器"
- 实际上 401 表示：连接成功，但凭据无效
- 未读取响应体中的错误信息

### Issue 2: Missing Authentication on Upload Endpoint  
后端 `/api/projects/init` 路由缺少认证保护：
- 路由没有使用 `requireAuth` 中间件
- userId 从 `req.body` 读取而不是从认证 token 提取
- 任何人都可以上传项目并指定任意 userId

## Solutions Implemented

### 1. Improved Plugin Error Handling

**File**: `vst-plugin/Source/PluginProcessor.cpp`

**Changes**:
```cpp
// Before: 只处理 2xx 状态码，其他都显示"could not connect"
if (stream != nullptr && statusCode >= 200 && statusCode < 300) {
    // parse success
} else {
    statusMessage = "Login failed: Could not connect to server (Status: " + statusCode + ")";
}

// After: 区分不同的错误状态码
if (stream != nullptr) {
    juce::String response = stream->readEntireStreamAsString();
    
    if (statusCode >= 200 && statusCode < 300) {
        // Parse success response
    }
    else if (statusCode == 401) {
        // Parse error message from response
        auto json = juce::JSON::parse(response);
        if (auto* obj = json.getDynamicObject()) {
            if (obj->hasProperty("error")) {
                statusMessage = "Login failed: " + obj->getProperty("error").toString();
            } else {
                statusMessage = "Login failed: Invalid email or password";
            }
        }
    }
    else {
        statusMessage = "Login failed: Server error (Status: " + statusCode + ")";
    }
}
```

**Benefits**:
- ✅ 明确区分连接失败 vs 认证失败
- ✅ 显示服务器返回的具体错误信息
- ✅ 401 错误现在显示"Invalid email or password"而不是"Could not connect"

### 2. Added Authentication to Upload Endpoint

**File**: `server/src/routes/project.ts`

**Changes**:
```typescript
// Import requireAuth middleware
import { requireAuth } from './auth';

// Before: 任何人都可以上传
router.post('/init', upload.single('alsFile'), async (req: any, res: any) => {
    const { projectName, author, userId } = req.body; // ❌ userId from request body
    // ...
});

// After: 需要认证，从 token 提取 userId
router.post('/init', requireAuth, upload.single('alsFile'), async (req: any, res: any) => {
    const { projectName, author } = req.body;
    const userId = req.userId; // ✅ userId from authenticated token
    // ...
});
```

**Benefits**:
- ✅ 只有登录用户可以上传项目
- ✅ 用户 ID 从认证 token 提取，无法伪造
- ✅ 项目自动关联到正确的用户账户

## Error Message Improvements

### Before
```
Login failed: Could not connect to server (Status: 401)
```
用户会认为是网络连接问题，但实际是密码错误。

### After
```
Login failed: Invalid email or password
```
清楚地告诉用户是凭据问题。

## Testing

### Test 1: Valid Credentials
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@coldaw.com","password":"demo123"}'

Response: ✅ 200 OK
{
  "token": "a64e346...af42-user-1",
  "userId": "user-1",
  "email": "demo@coldaw.com",
  "name": "Demo User"
}
```

### Test 2: Invalid Password
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@coldaw.com","password":"wrong"}'

Response: ✅ 401 Unauthorized
{
  "error": "Invalid email or password"
}
```

Plugin will now show:
```
Login failed: Invalid email or password
```

### Test 3: Upload Without Auth
```bash
curl -X POST http://localhost:3001/api/projects/init \
  -F "alsFile=@test.als"

Response: ✅ 401 Unauthorized
{
  "error": "Authentication required"
}
```

### Test 4: Upload With Valid Token
```bash
TOKEN="your-token-here"
curl -X POST http://localhost:3001/api/projects/init \
  -H "Authorization: Bearer $TOKEN" \
  -F "alsFile=@test.als" \
  -F "projectName=My Project"

Response: ✅ 200 OK
{
  "projectId": "uuid",
  "message": "Project created"
}
```

## Security Improvements

### Before
- ❌ 任何人都可以上传项目
- ❌ 可以伪造 userId
- ❌ 项目可能关联到错误的用户

### After
- ✅ 必须认证才能上传
- ✅ userId 从 token 提取，无法伪造
- ✅ 项目正确关联到登录用户

## User Experience Improvements

### Login Flow
1. **Before**: 用户输入错误密码 → 看到"无法连接到服务器" → 检查网络 → 困惑
2. **After**: 用户输入错误密码 → 看到"邮箱或密码无效" → 重新输入 → 成功

### Upload Flow
1. **Before**: 未登录用户可能上传成功但项目丢失
2. **After**: 未登录用户会被提示先登录

## Files Modified

1. `vst-plugin/Source/PluginProcessor.cpp`
   - 改进 login() 方法的错误处理
   - 添加 401 状态码的特殊处理
   - 从响应体解析错误信息

2. `server/src/routes/project.ts`
   - 导入 requireAuth 中间件
   - 在 /init 路由添加认证保护
   - 从 req.userId (token) 而不是 req.body.userId 获取用户 ID

## Commit Message

```
fix: Improve authentication error handling and secure upload endpoint

- Plugin: Parse 401 responses to show specific error messages
- Plugin: Distinguish between connection errors and auth errors
- Server: Add requireAuth middleware to /api/projects/init
- Server: Extract userId from token instead of request body

This fixes the confusing "could not connect to server" error when
credentials are invalid, and ensures projects are properly associated
with authenticated users.
```

## Next Steps

现在用户应该：
1. ✅ 能够清楚地看到登录失败原因
2. ✅ 只有在登录后才能上传项目
3. ✅ 上传的项目会正确关联到他们的账户

## Testing in Ableton Live

1. 打开 Ableton Live
2. 添加 "ColDaw Export" 插件
3. 尝试输入错误密码：
   - ✅ 应该显示 "Login failed: Invalid email or password"
   - ❌ 不应该显示 "could not connect"
4. 输入正确密码 (demo@coldaw.com / demo123):
   - ✅ 应该显示 "Logged in as: demo@coldaw.com"
5. 导出项目：
   - ✅ 应该成功上传
   - ✅ 项目应该出现在网站的用户历史中
