# Railway邮件服务修复指南

## 问题原因
Railway平台对外部SMTP连接有严格限制，导致连接超时。你遇到的`ETIMEDOUT`错误就是因为这个原因。

## 解决方案

### 方案1：使用Mailgun API（推荐，最稳定）

在Railway环境变量中添加以下配置：

```bash
# Mailgun API配置（推荐）
MAILGUN_API_KEY="your-mailgun-api-key"
MAILGUN_DOMAIN="coldaw.app"
MAILGUN_REGION="us"

# 保留现有的SMTP配置作为后备
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="2525"
SMTP_SECURE="false"
SMTP_USER="joe.deng@coldaw.app"
SMTP_PASS="a280e7fad186e88f67db1b6f37ec5e15-5e1ffd43-3c5ae8e6"
FROM_EMAIL="joe.deng@coldaw.app"
```

**如何获取Mailgun API Key：**
1. 登录Mailgun控制台：https://app.mailgun.com/
2. 进入 Settings > API Keys
3. 复制 Private API key

### 方案2：优化SMTP配置（修改现有配置）

如果你想继续使用SMTP，请在Railway中修改以下环境变量：

```bash
# 修改端口为2525（Railway更友好）
SMTP_PORT="2525"

# 确保关闭安全连接
SMTP_SECURE="false"

# 保持其他配置不变
SMTP_HOST="smtp.mailgun.org"
SMTP_USER="joe.deng@coldaw.app"
SMTP_PASS="a280e7fad186e88f67db1b6f37ec5e15-5e1ffd43-3c5ae8e6"
FROM_EMAIL="joe.deng@coldaw.app"
```

### 方案3：使用Railway内置邮件服务

考虑使用其他邮件服务提供商：

#### Resend（推荐）
```bash
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="joe.deng@coldaw.app"
```

#### SendGrid
```bash
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="joe.deng@coldaw.app"
```

## 立即修复步骤

### 步骤1：更新Railway环境变量

1. 登录Railway控制台
2. 找到你的项目
3. 进入Variables标签
4. 添加或修改以下变量：

**如果选择方案1（Mailgun API）：**
```
MAILGUN_API_KEY=你的Mailgun API密钥
MAILGUN_DOMAIN=coldaw.app
SMTP_PORT=2525
```

**如果选择方案2（优化SMTP）：**
```
SMTP_PORT=2525
```

### 步骤2：重新部署

修改环境变量后，Railway会自动重新部署。等待部署完成后测试邮件发送。

### 步骤3：测试邮件发送

部署完成后，尝试注册一个新账户或请求验证码，检查是否能正常发送邮件。

## 故障排除

### 如果仍然超时：
1. 检查Mailgun域名是否正确配置
2. 确认Mailgun API密钥有效
3. 检查Mailgun账户是否有发送限制

### 如果API方案失败：
1. 检查Mailgun API密钥格式
2. 确认域名状态是否为"Active"
3. 检查API配额是否用完

### 检查日志：
在Railway控制台查看应用日志，寻找以下关键信息：
- `✅ Email service initialized with Mailgun API`（成功使用API）
- `📧 Sending verification email via Mailgun API`（API发送）
- `✅ Verification email sent successfully`（发送成功）

## 为什么这样修复？

1. **Mailgun API**：绕过SMTP连接限制，直接使用HTTP API
2. **端口2525**：Railway对此端口限制较少
3. **超时配置**：增加了连接和发送超时时间
4. **TLS配置**：禁用严格的TLS检查，适应Railway环境

## 验证成功标志

修复成功后，你应该看到这样的日志：
```
🔧 Using Mailgun API for email delivery
✅ Email service initialized with Mailgun API
📧 Sending verification email via Mailgun API to: user@example.com
✅ Verification email sent successfully via Mailgun API to: user@example.com
```

如果你需要帮助获取Mailgun API密钥或遇到其他问题，请告诉我！