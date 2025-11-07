# Railway 生产环境部署 - Zoho Mail 完整指南

## 🎯 你现在要做的事情（15分钟）

这是**生产环境配置**，Token 会自动刷新，不需要手动更新。

---

## 📋 第1步：获取 Refresh Token（10分钟）

### 1.1 创建 Server-based 应用

1. 访问：https://api-console.zoho.com/
2. 点击：**Add Client**
3. 选择：**Server-based Applications**
4. 填写信息：
   ```
   Client Name: ColDAW Mail Service
   Homepage URL: https://www.coldaw.app
   Authorized Redirect URIs: https://www.coldaw.app/oauth/callback
   ```
5. 点击：**Create**
6. **保存这些信息到记事本：**
   ```
   Client ID: 1000.HVAGDDJLTT5XNP1ATH1E91YTIPLTOQ
   Client Secret: abec05613db83d0c1d0e180d052c259b7ca4fcd407
   ```

### 1.2 获取授权码（Code）

在浏览器中打开这个链接（我已经填好了你的 Client ID）：

```
https://accounts.zoho.com/oauth/v2/auth?scope=ZohoMail.messages.CREATE&client_id=1000.HVAGDDJLTT5XNP1ATH1E91YTIPLTOQ&response_type=code&access_type=offline&redirect_uri=https://www.coldaw.app/oauth/callback
```

**会跳转到：**
```
https://www.coldaw.app/oauth/callback?code=1000.xxxxxxxx...
```

**立即复制 `code` 参数的值**（只有10分钟有效）

### 1.3 用 Code 换取 Refresh Token

⏱️ **必须在获取 Code 后 10 分钟内执行！**

打开终端（VS Code 中的 Terminal），执行：

```bash
curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -d "code=你刚才复制的code" \
  -d "client_id=1000.HVAGDDJLTT5XNP1ATH1E91YTIPLTOQ" \
  -d "client_secret=abec05613db83d0c1d0e180d052c259b7ca4fcd407" \
  -d "redirect_uri=https://www.coldaw.app/oauth/callback" \
  -d "grant_type=authorization_code"
```

**响应示例：**
```json
{
  "access_token": "1000.short_lived...",
  "refresh_token": "1000.long_lived_token...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**保存 `refresh_token` 的值到记事本！** ← 这个很重要

### 1.4 获取 Account ID

1. 访问：https://mail.zoho.com
2. 点击：**设置** → **账户信息**
3. 复制：**Account ID**

---

## 📋 第2步：在 Railway 配置环境变量（3分钟）

### 2.1 打开 Railway Dashboard

```
https://railway.app/dashboard
```

### 2.2 配置环境变量

进入你的项目 → **server** 服务 → **Variables** 标签

**添加以下 5 个变量：**

| 变量名 | 值 | 说明 |
|-------|-----|------|
| `ZOHO_REFRESH_TOKEN` | 1000.long_lived... | 从步骤 1.3 获取 |
| `ZOHO_CLIENT_ID` | 1000.HVAGDDJLTT5XNP1ATH1E91YTIPLTOQ | 从步骤 1.1 获取 |
| `ZOHO_CLIENT_SECRET` | abec05613db... | 从步骤 1.1 获取 |
| `ZOHO_ACCOUNT_ID` | 你的账户ID | 从步骤 1.4 获取 |
| `ZOHO_FROM_EMAIL` | noreply@coldaw.app | 发送邮箱 |

### 2.3 标记为 Secret（推荐）

为了安全，将这些变量标记为 Secret：
- ☑️ `ZOHO_REFRESH_TOKEN`
- ☑️ `ZOHO_CLIENT_SECRET`
- ☑️ `ZOHO_CLIENT_ID`

---

## 📋 第3步：部署代码（2分钟）

```bash
cd /Users/yifan/Documents/WebD/ColDaw_lab

git add .
git commit -m "feat: add Zoho Mail with auto-refresh token support for production"
git push origin main
```

Railway 会自动检测并部署。

---

## 📋 第4步：验证部署

### 4.1 查看日志

```bash
railway login
railway link
railway logs --follow
```

**成功的日志：**
```
🔧 Using Zoho Mail API with Refresh Token (auto-refresh enabled)
✅ Email service initialized with Zoho Mail API (Production Mode)
```

### 4.2 测试邮件发送

```bash
# 获取 Railway URL
railway status

# 测试
curl -X POST https://your-railway-url/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@gmail.com"}'
```

**成功响应：**
```json
{"message":"Verification code sent successfully"}
```

**查看日志应该显示：**
```
🔄 Refreshing Zoho Access Token...
✅ Zoho Access Token refreshed successfully
Token expires in: 3600 seconds
📧 Sending verification email via Zoho Mail API to: user@example.com
✅ Verification email sent successfully via Zoho Mail API
```

---

## ✅ 完成！

### 🎉 你的配置优势

| 特性 | 状态 |
|------|------|
| ✅ Token 自动刷新 | 无需人工干预 |
| ✅ 长期稳定运行 | Refresh Token 不过期 |
| ✅ 生产环境就绪 | 24/7 可用 |
| ✅ 自动重试机制 | Token 过期自动重试 |
| ✅ 详细日志 | 方便监控和调试 |

### 📊 工作流程

```
邮件发送请求
    ↓
检查缓存的 Access Token
    ↓
Token 有效？
    ├─ YES → 直接使用
    └─ NO → 用 Refresh Token 自动获取新 Token
         ↓
      发送邮件
```

### 🔍 监控建议

**定期检查 Railway 日志：**
```bash
railway logs --follow
```

**关注这些日志：**
- ✅ Token refreshed successfully - Token 刷新成功
- ⚠️ Token may be expired - Token 可能过期（会自动重试）
- ❌ Failed to refresh token - Token 刷新失败（需要检查）

---

## 🆘 故障排查

### 问题 1: Token 刷新失败

**日志：**
```
❌ Failed to refresh Zoho Access Token
```

**原因：**
- Refresh Token 无效
- Client ID/Secret 错误
- Refresh Token 被撤销

**解决：**
重新执行第1步，获取新的 Refresh Token

### 问题 2: 401 错误

**日志：**
```
Zoho Mail API error: 401 Unauthorized
```

**解决：**
1. 检查 Railway 环境变量是否正确
2. 查看日志是否有 Token 刷新成功的消息
3. 手动触发重新部署

### 问题 3: Code 过期（invalid_code）

**原因：**
- Code 只能用一次
- Code 有效期 10 分钟

**解决：**
1. 重新访问授权 URL（步骤 1.2）
2. 获取新的 Code
3. **立即**执行步骤 1.3（不要等待）

---

## 📝 环境变量完整清单

```bash
# ===== Zoho Mail (生产环境 - Refresh Token) =====
ZOHO_REFRESH_TOKEN = 1000.long_lived_token...
ZOHO_CLIENT_ID = 1000.HVAGDDJLTT5XNP1ATH1E91YTIPLTOQ
ZOHO_CLIENT_SECRET = abec05613db83d0c1d0e180d052c259b7ca4fcd407
ZOHO_ACCOUNT_ID = 你的账户ID
ZOHO_FROM_EMAIL = noreply@coldaw.app

# ===== 其他 Railway 配置 =====
NODE_ENV = production
JWT_SECRET = your_jwt_secret
DATABASE_URL = (Railway 自动注入)
REDIS_URL = (Railway 自动注入)
```

---

## 🔗 相关文档

- Token 获取详细说明：`ZOHO_TOKEN_GUIDE.md`
- 完整迁移指南：`docs/ZOHO_MIGRATION.md`
- Railway 部署：`docs/RAILWAY_DEPLOYMENT.md`

---

## 💡 提示

### ✅ 优点（vs Self Client Access Token）

| 特性 | Self Client | Refresh Token (当前) |
|------|------------|---------------------|
| Token 有效期 | 1 小时 | 长期有效 |
| 自动刷新 | ❌ | ✅ |
| 生产环境 | ❌ | ✅ |
| 维护成本 | 高（手动更新） | 低（自动） |
| 适用场景 | 测试/开发 | 生产环境 |

### 🔄 从 Self Client 迁移

如果你之前用的是 Self Client Access Token：

1. 删除 Railway 中的 `ZOHO_API_KEY`
2. 添加上面的 5 个新变量
3. 重新部署
4. 完成！

---

**状态：** ✅ 生产环境就绪
**Token 管理：** ✅ 自动刷新
**维护成本：** ✅ 零维护
**部署时间：** 15 分钟
