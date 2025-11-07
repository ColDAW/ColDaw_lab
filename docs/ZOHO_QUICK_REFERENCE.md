# Zoho Mail API 快速参考

## 🚀 快速开始 (5分钟)

### 1. 获取必要的信息
```bash
# 需要从 Zoho 获取:
ZOHO_API_KEY=oauth_token        # OAuth Token
ZOHO_ACCOUNT_ID=account_id      # Account ID
ZOHO_FROM_EMAIL=sender@domain   # 发送邮箱 (已验证)
```

### 2. 配置环境变量
```bash
# .env 或系统环境变量中设置
export ZOHO_API_KEY="your_token"
export ZOHO_ACCOUNT_ID="your_id"
export ZOHO_FROM_EMAIL="noreply@yourdomain.com"
```

### 3. 启动应用
```bash
npm run dev
# 查看日志: ✅ Email service initialized with Zoho Mail API
```

## 📋 环境变量

| 变量名 | 必需 | 说明 | 示例 |
|------|------|------|------|
| `ZOHO_API_KEY` | ✅ | OAuth Token | `1234567890.abcdefg...` |
| `ZOHO_ACCOUNT_ID` | ✅ | 账户 ID | `12345678901234567890` |
| `ZOHO_FROM_EMAIL` | ❌ | 发送邮箱 | `noreply@coldaw.com` |
| `SMTP_HOST` | ❌ | 备用 SMTP 主机 | `smtp.zoho.com` |
| `SMTP_PORT` | ❌ | 备用 SMTP 端口 | `587` |
| `SMTP_USER` | ❌ | 备用 SMTP 用户 | `email@domain.com` |
| `SMTP_PASS` | ❌ | 备用 SMTP 密码 | `password` |

## 🔄 工作流程

```
用户注册 → 发送验证码
    ↓
检查 ZOHO_API_KEY 是否存在
    ↓
YES → 使用 Zoho Mail API ✅
    ↓
NO → 使用 SMTP (备用) ✅
    ↓
NO → 返回错误 ❌
```

## 🐛 调试

### 查看详细日志
```typescript
// 应用启动时会看到
🔧 Using Zoho Mail API for email delivery
✅ Email service initialized with Zoho Mail API

// 发送邮件时会看到
📧 Sending verification email via Zoho Mail API to: user@example.com
✅ Verification email sent successfully via Zoho Mail API
Message ID: msg_12345
```

### 常见错误

| 错误 | 原因 | 解决方案 |
|-----|------|--------|
| `Zoho Mail API not configured` | 环境变量未设置 | 检查 `ZOHO_API_KEY` 和 `ZOHO_ACCOUNT_ID` |
| `401 Unauthorized` | Token 无效或过期 | 重新生成 OAuth Token |
| `403 Forbidden` | 权限不足 | 检查 OAuth 应用权限 scope |
| `404 Not Found` | Account ID 错误 | 验证 `ZOHO_ACCOUNT_ID` |

## 📞 获取 Zoho 凭证

### Account ID
1. 登录 https://mail.zoho.com
2. 设置 → 账户信息 → 复制 Account ID

### OAuth Token (使用 Client Credentials)
```bash
curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=client_credentials" \
  -d "scope=Zoho.mail.messages.CREATE"
```

返回格式:
```json
{
  "access_token": "1234567890abcdefg",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

复制 `access_token` 的值作为 `ZOHO_API_KEY`

## 📝 应用级信息

| 项目 | 值 |
|-----|-----|
| API 端点 | `https://mail.zoho.com/api/accounts/{accountId}/messages` |
| 认证方式 | `Authorization: Zoho-oauthtoken {token}` |
| Content-Type | `application/json` |
| 支持功能 | 发送文本/HTML 邮件 |

## 🔗 相关文件

- 实现代码: `/server/src/services/email.ts`
- 迁移指南: `/docs/ZOHO_MIGRATION.md`
- 环境示例: `/.env.zoho.example`
- 使用地点: `/server/src/routes/auth.ts` (路由: `/api/auth/send-verification`)

## ✅ 测试清单

- [ ] 环境变量已配置
- [ ] 日志显示 "Email service initialized with Zoho Mail API"
- [ ] 可以发送验证邮件
- [ ] 邮件包含正确的验证码
- [ ] 邮件未被标记为垃圾邮件
