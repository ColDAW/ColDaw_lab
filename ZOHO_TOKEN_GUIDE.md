# Zoho API Key 获取指南 - 重要说明

## ⚠️ 重要：ZOHO_API_KEY 不是 Client Secret！

**`ZOHO_API_KEY` = Refresh Token 或 Access Token**

**`Client Secret` ≠ `ZOHO_API_KEY`**

## 📊 Zoho OAuth 术语对比

| 术语 | 用途 | 在哪里使用 | 有效期 |
|------|------|-----------|--------|
| **Client ID** | 识别应用 | OAuth 授权流程 | 永久 |
| **Client Secret** | 验证应用 | OAuth 授权流程 | 永久 |
| **Access Token** | API 调用认证 | ✅ **这是 ZOHO_API_KEY** | 1小时 |
| **Refresh Token** | 刷新 Access Token | ✅ **或者用这个** | 长期有效 |

## 🎯 ZOHO_API_KEY 应该用什么？

### 方案 1: 使用 Self Client (推荐，最简单)

Zoho 提供了一个特殊的 "Self Client" 功能，可以直接生成长期有效的 token。

#### 步骤：

1. **访问 Zoho API Console**
   ```
   https://api-console.zoho.com/
   ```

2. **创建 Self Client**
   - 登录后，在左侧菜单找到 **"Self Client"**
   - 点击 **"Create Self Client"**
   - 选择 Scope: `ZohoMail.messages.CREATE`
   - 点击 **"Create"**

3. **生成 Token**
   - 创建后会看到一个 **"Generate Code"** 按钮
   - 点击后会生成一个 **Code**
   - 在下方输入这个 Code
   - 点击 **"Generate Token"**

4. **复制 Access Token**
   ```
   看到的结果：
   {
     "access_token": "1000.abc123def456...",  ← 这就是 ZOHO_API_KEY!
     "refresh_token": "1000.xyz789...",
     "expires_in": 3600
   }
   ```

5. **配置环境变量**
   ```bash
   # Railway Dashboard 中设置:
   ZOHO_API_KEY = 1000.abc123def456...
   # ☝️ 使用 access_token 的值
   ```

### 方案 2: 使用 Server-based 应用 (适合生产环境)

如果需要更好的控制和自动刷新，使用标准 OAuth 流程。

#### 步骤：

1. **创建 Server-based 应用**
   ```
   https://api-console.zoho.com/
   → Add Client → Server-based Applications
   ```

2. **配置应用**
   ```
   Client Name: ColDAW Mail Service
   Homepage URL: https://your-domain.com
   Authorized Redirect URIs: https://your-domain.com/oauth/callback
   ```

3. **获取凭证**
   ```
   Client ID: 1000.XXXXXXXXXX
   Client Secret: xxxxxxxxxxxxxxxx
   ```

4. **生成授权码**
   
   在浏览器中访问（替换你的 Client ID）:
   ```
   https://accounts.zoho.com/oauth/v2/auth?
     scope=ZohoMail.messages.CREATE&
     client_id=YOUR_CLIENT_ID&
     response_type=code&
     access_type=offline&
     redirect_uri=https://your-domain.com/oauth/callback
   ```

5. **授权后获取 Code**
   
   授权后会跳转到你的 redirect_uri，URL 中会包含 code:
   ```
   https://your-domain.com/oauth/callback?code=1000.abc123...
   ```

6. **用 Code 换取 Token**
   
   ```bash
   curl -X POST https://accounts.zoho.com/oauth/v2/token \
     -d "code=YOUR_CODE" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "redirect_uri=https://your-domain.com/oauth/callback" \
     -d "grant_type=authorization_code"
   ```

7. **响应**
   ```json
   {
     "access_token": "1000.abc123def456...",
     "refresh_token": "1000.xyz789...",
     "expires_in": 3600,
     "token_type": "Bearer"
   }
   ```

8. **配置环境变量**
   ```bash
   # 使用 Access Token (短期)
   ZOHO_API_KEY = 1000.abc123def456...
   
   # 或者使用 Refresh Token (长期)
   ZOHO_REFRESH_TOKEN = 1000.xyz789...
   # 然后在代码中用 Refresh Token 换取 Access Token
   ```

## 🔄 Access Token vs Refresh Token

### Access Token (推荐用于 ZOHO_API_KEY)

✅ **优点:**
- 直接可用，无需额外代码
- 适合简单场景

❌ **缺点:**
- 有效期 1 小时
- 过期后需要重新生成

**使用场景:** 测试、开发、低频发送

### Refresh Token

✅ **优点:**
- 长期有效（通常不会过期）
- 可以自动换取新的 Access Token

❌ **缺点:**
- 需要额外的代码逻辑来刷新 Token

**使用场景:** 生产环境、高频发送

## 💡 推荐方案

### 对于你的 Railway 部署（推荐）

**使用 Self Client 的 Access Token**

1. 最简单、最快
2. 适合中低频邮件发送
3. Token 过期（约 1 小时）后可以从 Self Client 重新生成

#### 具体步骤：

```bash
# 1. 访问
https://api-console.zoho.com/

# 2. Self Client → Create → Generate Code → Generate Token

# 3. 复制 access_token

# 4. 在 Railway Dashboard 中设置
ZOHO_API_KEY = 1000.abc123def456...  # access_token 的值
ZOHO_ACCOUNT_ID = 你的账户ID
```

## 🔍 如何验证你的 Token

```bash
# 测试 Token 是否有效
curl -X GET "https://mail.zoho.com/api/accounts/ACCOUNT_ID/folders" \
  -H "Authorization: Zoho-oauthtoken YOUR_ACCESS_TOKEN"

# 如果返回文件夹列表，说明 Token 有效
# 如果返回 401，说明 Token 无效或过期
```

## 📋 完整的环境变量示例

```bash
# Railway Dashboard Variables:

# 1. Zoho API Token (必需) - 使用 Self Client 生成的 Access Token
ZOHO_API_KEY = 1000.abc123def456...

# 2. Zoho Account ID (必需)
ZOHO_ACCOUNT_ID = 1234567890123456789

# 3. 发送邮箱 (可选)
ZOHO_FROM_EMAIL = noreply@yourdomain.com
```

## ⚠️ 常见错误

### 错误 1: 使用了 Client Secret
```bash
❌ 错误:
ZOHO_API_KEY = xxxxxxxxxxxxxxxx  # 这是 Client Secret

✅ 正确:
ZOHO_API_KEY = 1000.abc123def456...  # 这是 Access Token
```

### 错误 2: Token 格式不对
```bash
❌ 错误:
ZOHO_API_KEY = abc123  # 太短了

✅ 正确:
ZOHO_API_KEY = 1000.abc123def456...  # 以 "1000." 开头
```

### 错误 3: 使用过期的 Token
```bash
# Access Token 有效期约 1 小时
# 如果遇到 401 错误，重新生成一个新的 Token
```

## 🚀 快速开始（5分钟）

```bash
# 步骤 1: 打开 Self Client
https://api-console.zoho.com/

# 步骤 2: 点击左侧 "Self Client"

# 步骤 3: Create → 选择 Scope → Generate Code

# 步骤 4: Generate Token

# 步骤 5: 复制 access_token

# 步骤 6: 在 Railway 中设置
ZOHO_API_KEY = [复制的 access_token]
ZOHO_ACCOUNT_ID = [你的账户ID]

# 步骤 7: 部署并测试
git push origin main
```

## 🔗 相关资源

- Zoho API Console: https://api-console.zoho.com/
- Zoho OAuth 文档: https://www.zoho.com/accounts/protocol/oauth.html
- Zoho Mail API: https://www.zoho.com/mail/help/api/

## 📞 遇到问题？

### 问题：找不到 Self Client
- 确保已登录 Zoho 账户
- 在左侧菜单中查找 "Self Client" 或 "Personal Access Token"

### 问题：生成的 Token 不工作
- 确认选择了正确的 Scope: `ZohoMail.messages.CREATE`
- 检查 Token 格式是否以 `1000.` 开头
- 尝试重新生成一个新的 Token

### 问题：Token 频繁过期
- 考虑使用 Refresh Token 方案
- 或者使用 Zoho 的 API 来自动刷新 Token

---

**总结:**
- ✅ `ZOHO_API_KEY` = **Access Token** (从 Self Client 生成)
- ❌ `ZOHO_API_KEY` ≠ **Client Secret**
- 推荐使用 Self Client 方案（最简单）
