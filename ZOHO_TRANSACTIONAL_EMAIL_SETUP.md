# Zoho Transactional Email (ZeptoMail) 配置指南

## 重要更新

项目已从常规 Zoho Mail API 迁移到 **Zoho Transactional Email API (ZeptoMail)**,这是专门用于发送事务性邮件(如验证邮件)的服务。

## 为什么使用 ZeptoMail?

- ✅ 专为事务性邮件设计
- ✅ 更高的送达率
- ✅ 支持 OAuth 2.0 自动刷新 Token
- ✅ 更简单的 API 端点
- ✅ 每月免费 10,000 封邮件

## 错误修复

如果你遇到以下错误:
```
URL_RULE_NOT_CONFIGURED
```

这是因为使用了错误的 API 端点。正确的应该是 ZeptoMail API。

## 配置步骤

### 方式 1: 使用 Send Mail Token (ZeptoMail 推荐) ⭐

这是 ZeptoMail 最简单的配置方式，不需要 OAuth，Token 永不过期。

#### 1. 创建 ZeptoMail 账户

1. 访问: https://www.zoho.com/zeptomail/
2. 点击 "Sign Up" 注册账户
3. 验证你的邮箱地址

#### 2. 添加发送域名 (可选但推荐)

1. 登录 ZeptoMail: https://mailadmin.zoho.com/zeptomail/
2. 进入 "Mail Agents" → "Add Mail Agent"
3. 选择 "Send using REST API"
4. 添加你的域名并验证 DNS 记录
5. 或使用 ZeptoMail 提供的默认发送域名

#### 3. 获取 Send Mail Token

1. 在 ZeptoMail Dashboard 中找到你的 Mail Agent
2. 点击 Mail Agent 名称
3. 找到 "Send Mail Token" 部分
4. 点击 "Copy Token" 或 "Show Token"
5. 保存这个 Token（以 `Zoho-enczapikey_` 开头）

#### 4. 配置环境变量

只需要配置两个环境变量：

```env
# ZeptoMail Send Mail Token 方式 (推荐)
ZOHO_API_KEY=your_send_mail_token_here
ZOHO_FROM_EMAIL=noreply@yourdomain.com
```

**示例:**
```env
ZOHO_API_KEY=Zoho-enczapikey_xxxxxxxxxxxxxxxxxxxx
ZOHO_FROM_EMAIL=noreply@coldaw.app
```

⚠️ **重要**: 
- Send Mail Token 以 `Zoho-enczapikey_` 开头
- 不需要设置 `ZOHO_ACCOUNT_ID`
- Token 永不过期，无需刷新

---

### 方式 2: 使用 OAuth Refresh Token (高级用户)

如果你需要使用 OAuth 方式，可以按以下步骤配置：

#### 1. 获取 OAuth 凭证

1. 访问: https://api-console.zoho.com/
2. 点击 "Add Client"
3. 选择 "Server-based Applications"
4. 填写信息:
   - Client Name: `ColDAW Email Service`
   - Homepage URL: `https://yourdomain.com`
   - Authorized Redirect URIs: `https://yourdomain.com/oauth/callback`
5. 保存后获取:
   - `Client ID`
   - `Client Secret`

#### 2. 生成 Refresh Token

在浏览器中访问以下 URL (替换 CLIENT_ID):

```
https://accounts.zoho.com/oauth/v2/auth?scope=ZeptoMail.messages.CREATE&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=https://yourdomain.com/oauth/callback
```

1. 授权后会跳转到你的 redirect_uri,URL 中包含 `code` 参数
2. 使用这个 code 获取 refresh_token:

```bash
curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -d "code=YOUR_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://yourdomain.com/oauth/callback" \
  -d "grant_type=authorization_code"
```

3. 响应中包含 `refresh_token`,保存它

#### 3. 配置环境变量

```env
# ZeptoMail OAuth 方式
ZOHO_REFRESH_TOKEN=your_refresh_token_here
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_FROM_EMAIL=noreply@yourdomain.com
```

---

## 验证配置

启动服务后,应该看到以下日志:

### 使用 Send Mail Token (推荐):
```
🔧 Using ZeptoMail with Send Mail Token (recommended for ZeptoMail)
✅ Email service initialized with ZeptoMail API
```

### 使用 OAuth Refresh Token:
```
🔧 Using ZeptoMail/Zoho with OAuth Refresh Token (auto-refresh enabled)
✅ Email service initialized with ZeptoMail API (Production Mode - OAuth)
```

## 常见问题

### Q: 遇到 "Invalid API Token found" 错误
**A**: Token 格式或值不正确:

1. **检查 Token 格式**: Send Mail Token 应该以 `Zoho-enczapikey_` 开头
2. **确认 Token 来源**: 
   - 登录 https://mailadmin.zoho.com/zeptomail/
   - 进入 Mail Agents → 你的 Mail Agent
   - 重新复制 Send Mail Token
3. **检查环境变量**: 确保 `ZOHO_API_KEY` 完整复制,没有多余的空格或换行
4. **重新部署**: 在 Railway Dashboard 中更新环境变量后,点击 "Redeploy"

**正确的 Token 格式:**
```
ZOHO_API_KEY=Zoho-enczapikey_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Q: 我应该使用哪种方式?
**A**: 推荐使用方式:

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 🎯 **大多数用户** | Send Mail Token | 简单、永不过期、配置最少 |
| 🏢 **企业用户** | OAuth Refresh Token | 更安全、可审计、可撤销 |
| 🧪 **开发测试** | Send Mail Token | 快速开始、易于调试 |

**建议: 优先使用 Send Mail Token,除非有特殊的安全或审计需求。**

## API 端点变更

### ❌ 旧的 (错误):
```
https://mail.zoho.com/api/accounts/{accountId}/messages
```

### ✅ 新的 (正确):
```
https://api.zeptomail.com/v1.1/email
```

## Payload 格式

```json
{
  "from": {
    "address": "noreply@yourdomain.com"
  },
  "to": [
    {
      "email_address": {
        "address": "user@example.com"
      }
    }
  ],
  "subject": "Your Subject",
  "htmlbody": "<html>...</html>",
  "textbody": "Plain text version"
}
```

## Authorization Header

### 使用 OAuth Token:
```
Authorization: Zoho-enczapikey {access_token}
```

### 使用 Send Mail Token:
```
Authorization: Zoho-enczapikey {send_mail_token}
```

## 测试邮件发送

```bash
# 获取你的 Railway URL
railway status

# 发送测试邮件
curl -X POST https://your-railway-url/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@example.com"}'

# 应该返回:
# {"message":"Verification code sent successfully"}
```

## 常见问题

### Q: 遇到 URL_RULE_NOT_CONFIGURED 错误
**A**: 这是使用了错误的 API 端点。确保:
1. 已更新到最新代码
2. API 端点是 `https://api.zeptomail.com/v1.1/email`
3. 使用 ZeptoMail 而不是常规 Zoho Mail

### Q: 401 Unauthorized 错误
**A**: Token 问题:
1. 使用 Refresh Token 方式时,系统会自动刷新
2. 检查 `ZOHO_CLIENT_ID` 和 `ZOHO_CLIENT_SECRET` 是否正确
3. 确保 Refresh Token 有效

### Q: FROM_EMAIL 被拒绝
**A**: 确保:
1. 邮箱已在 ZeptoMail 中验证
2. `ZOHO_FROM_EMAIL` 与 ZeptoMail 中配置的一致

## 与之前配置的区别

| 项目 | 旧配置 (Mail API) | 新配置 (ZeptoMail) |
|------|------------------|-------------------|
| API 端点 | `mail.zoho.com/api/accounts/{id}/messages` | `api.zeptomail.com/v1.1/email` |
| Authorization | `Zoho-oauthtoken` | `Zoho-enczapikey` |
| 需要 Account ID | ✅ 是 | ❌ 否 |
| Payload 格式 | `fromAddress`, `toAddress` | `from.address`, `to[].email_address.address` |
| 免费额度 | 有限 | 10,000 封/月 |

## Railway 部署配置

在 Railway Dashboard 中配置以下环境变量:

### 推荐配置 (Send Mail Token):
```
ZOHO_API_KEY=Zoho-enczapikey_xxxxxxxxxxxxxxxxxxxxx
ZOHO_FROM_EMAIL=noreply@yourdomain.com
```

### 或使用 OAuth (高级):
```
ZOHO_REFRESH_TOKEN=1000.xxx
ZOHO_CLIENT_ID=1000.XXX.YYY
ZOHO_CLIENT_SECRET=xxx
ZOHO_FROM_EMAIL=noreply@yourdomain.com
```

⚠️ **重要**:
- 建议将 `ZOHO_API_KEY`、`ZOHO_CLIENT_SECRET` 标记为 "Secret"
- 不需要设置 `ZOHO_ACCOUNT_ID` (ZeptoMail 不需要)
- 如果之前设置了 `ZOHO_ACCOUNT_ID`,可以删除它

## 迁移检查清单

- [ ] 更新到最新代码 (包含 ZeptoMail 支持)
- [ ] 创建 ZeptoMail 账户
- [ ] 获取 OAuth 凭证或 Send Mail Token
- [ ] 在 Railway 中更新环境变量
- [ ] 重新部署应用
- [ ] 检查日志确认初始化成功
- [ ] 发送测试邮件验证

## 更多信息

- ZeptoMail 官网: https://www.zoho.com/zeptomail/
- ZeptoMail API 文档: https://www.zoho.com/zeptomail/help/api/
- OAuth 文档: https://www.zoho.com/accounts/protocol/oauth.html
