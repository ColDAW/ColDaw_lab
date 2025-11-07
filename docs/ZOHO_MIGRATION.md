# Mailgun 到 Zoho Mail API 迁移指南

## 概述
本项目已从 Mailgun 邮件服务迁移到 Zoho Mail API，用于发送用户验证邮件。

## 主要变更

### 1. 配置接口变更
**之前 (Mailgun):**
```typescript
export interface MailgunConfig {
  apiKey: string;
  domain: string;
  region?: 'us' | 'eu';
}
```

**现在 (Zoho):**
```typescript
export interface ZohoConfig {
  apiKey: string;
  accountId: string;
}
```

### 2. 环境变量变更

**移除以下 Mailgun 环境变量：**
- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `MAILGUN_REGION`

**添加以下 Zoho 环境变量：**
- `ZOHO_API_KEY` - Zoho OAuth Token
- `ZOHO_ACCOUNT_ID` - Zoho 账户 ID
- `ZOHO_FROM_EMAIL` - 发送邮件的地址（可选，默认: noreply@coldaw.app）

### 3. API 端点变更

**Mailgun:**
```
https://api.mailgun.net/v3/{domain}/messages
或
https://api.eu.mailgun.net/v3/{domain}/messages (EU)
```

**Zoho Mail:**
```
https://mail.zoho.com/api/accounts/{accountId}/messages
```

### 4. 认证方式变更

**Mailgun - 基础认证:**
```
Authorization: Basic {base64(api:apiKey)}
```

**Zoho Mail - OAuth 认证:**
```
Authorization: Zoho-oauthtoken {apiKey}
```

## 迁移步骤

### Step 1: 准备 Zoho 账户

1. 访问 https://www.zoho.com/mail/ 注册或登录
2. 在 **设置 > 账户** 中获取你的 **Account ID**
3. 确保有一个已验证的邮箱用于发送验证邮件

### Step 2: 获取 OAuth Token

1. 访问 https://api-console.zoho.com/
2. 点击 **添加客户端**
3. 选择应用类型：**Web 应用**
4. 填写应用信息：
   - 客户端名称：例如 "ColDAW"
   - 重定向 URI：`https://yourdomain.com/callback`
5. 创建后获取 **Client ID** 和 **Client Secret**
6. 使用这些信息获取 OAuth Token
   
   通过以下 API 获取 Token：
   ```bash
   curl -X POST https://accounts.zoho.com/oauth/v2/token \
     -d "client_id={CLIENT_ID}" \
     -d "client_secret={CLIENT_SECRET}" \
     -d "grant_type=client_credentials" \
     -d "scope=Zoho.mail.messages.CREATE"
   ```

7. 响应中的 `access_token` 就是 `ZOHO_API_KEY`

### Step 3: 更新环境变量

编辑你的 `.env` 文件或环境配置：

```env
ZOHO_API_KEY=your_oauth_token
ZOHO_ACCOUNT_ID=your_account_id
ZOHO_FROM_EMAIL=noreply@yourdomain.com
```

### Step 4: 验证配置

启动服务器并检查日志：
```
✅ Email service initialized with Zoho Mail API
```

如果看到这条消息，说明配置成功。

## 备用方案 (SMTP 回退)

如果 Zoho API 不可用，系统会自动回退到 SMTP 方式。配置以下环境变量作为备用：

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your_zoho_email@yourdomain.com
SMTP_PASS=your_zoho_password
```

## 发送流程

1. **优先级 1**：Zoho Mail API
   - 条件：`ZOHO_API_KEY` 和 `ZOHO_ACCOUNT_ID` 都已设置
   - 使用方法：`sendViaZohoAPI()`

2. **优先级 2**：SMTP (回退)
   - 条件：Zoho API 不可用，但 SMTP 配置完整
   - 使用方法：通过 nodemailer 的 SMTP 连接

3. **错误处理**：如果两者都不可用，抛出错误

## 邮件模板

验证邮件使用同一个 HTML 模板（`generateVerificationEmailHTML()`），支持：
- 美观的 HTML 格式
- 纯文本备用内容
- 10 分钟过期的验证码

## 常见问题

### Q: Zoho API 返回 401 错误
A: 检查 `ZOHO_API_KEY` 是否有效，可能已过期需要重新生成

### Q: Zoho API 返回 403 错误
A: 检查 OAuth 应用的权限，确保包含 `Zoho.mail.messages.CREATE` scope

### Q: 邮件被标记为垃圾
A: 检查发送邮箱是否在 Zoho 中已验证

### Q: 切换回 Mailgun
A: 在 `.env` 中设置以下变量即可切回 Mailgun（系统会自动检测）：
```env
MAILGUN_API_KEY=your_key
MAILGUN_DOMAIN=your_domain
```

## 相关文件

- 主要实现：`/server/src/services/email.ts`
- 使用地点：`/server/src/routes/auth.ts` (发送验证码)
- 环境配置示例：`.env.zoho.example`

## 支持

如有问题，请联系技术支持或查看日志文件获取详细错误信息。
