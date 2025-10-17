# Railway 生产环境部署指南

## 邮箱验证功能配置

### 1. 添加 Redis 服务

在 Railway 项目中添加 Redis 服务：

1. 进入 Railway 项目控制台
2. 点击 "New Service" -> "Database" -> "Add Redis"
3. Redis 服务启动后，Railway 会自动提供 `REDIS_URL` 或 `REDISCLOUD_URL` 环境变量

### 2. 配置邮箱 SMTP 服务

在 Railway 项目的环境变量中添加以下配置：

#### Gmail 配置示例：
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # 使用应用专用密码，不是常规密码
```

#### 其他邮箱服务配置：

**Outlook/Hotmail:**
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

**QQ邮箱:**
```bash
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
```

**163邮箱:**
```bash
SMTP_HOST=smtp.163.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### 推荐的第三方邮件服务（更可靠）

如果传统邮箱服务连接有问题，建议使用专业邮件服务：

**SendGrid 配置:**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun 配置:**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### 3. 必要的环境变量

确保在 Railway 中设置以下环境变量：

```bash
# 数据库（Railway 自动提供）
DATABASE_URL=postgresql://...

# Redis（Railway 自动提供）  
REDIS_URL=redis://...

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 邮箱配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 应用配置
NODE_ENV=production
```

### 4. Gmail 应用专用密码设置

如果使用 Gmail，需要设置应用专用密码：

1. 登录 Google 账户
2. 进入账户设置 -> 安全性
3. 启用两步验证
4. 在"应用专用密码"中生成新密码
5. 使用生成的密码作为 `SMTP_PASS`

### 5. 部署流程

1. 确保所有环境变量都已设置
2. 推送代码到 GitHub
3. Railway 会自动构建和部署
4. 检查部署日志确认服务正常启动

### 6. 健康检查

部署完成后，访问 `https://your-app.railway.app/api/health` 检查服务状态：

```json
{
  "status": "ok",
  "timestamp": "2025-10-17T...",
  "message": "Server is running",
  "services": {
    "redis": "healthy",
    "email": "healthy"
  }
}
```

### 7. 测试邮箱验证功能

1. 在应用中尝试注册新账户
2. 检查是否收到验证邮件
3. 输入验证码完成注册

### 8. 故障排查

#### 常见错误码及解决方案

**409 Conflict - 用户已存在**
- 错误信息：用户尝试注册已存在的邮箱
- 解决方案：提示用户使用登录功能

**429 Too Many Requests - 频率限制**
- 错误信息：验证码发送过于频繁
- 解决方案：等待倒计时结束后重试（60秒）

**ECONNABORTED - 请求超时**
- 错误信息：邮件发送超过60秒超时
- 解决方案：检查SMTP服务器响应速度，可能需要更换邮箱服务商

**ETIMEDOUT - 连接超时**
- 错误信息：无法连接到SMTP服务器
- 解决方案：检查网络连接和SMTP服务器配置

#### 邮件发送问题

如果邮件发送失败：

1. **检查环境变量配置**
   ```bash
   # 确保所有必要的环境变量都已设置
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

2. **Gmail 特定问题**
   - 确保启用了两步验证
   - 使用应用专用密码，不是普通密码
   - 检查是否开启了"允许不够安全的应用访问"

3. **网络连接问题**
   - Railway 服务器可能被某些 SMTP 服务器阻止
   - 尝试使用不同的 SMTP 端口（25, 465, 587）
   - 考虑使用第三方邮件服务（SendGrid, Mailgun 等）

4. **推荐的邮箱服务商**
   - **Gmail**: 最常用，但可能有连接问题
   - **Outlook**: `smtp-mail.outlook.com:587`
   - **SendGrid**: 专业邮件服务，更稳定
   - **Mailgun**: 开发者友好的邮件API

5. **故障排查步骤**
   - 查看 Railway 部署日志中的具体错误
   - 测试本地环境是否能正常发送邮件
   - 尝试 `telnet smtp.gmail.com 587` 测试连接

#### Redis 连接问题

如果 Redis 连接失败：

1. 确认 Redis 服务是否正常运行
2. 检查 `REDIS_URL` 环境变量
3. 查看连接日志

### 9. 安全建议

- 使用强密码作为 JWT 密钥
- 定期更换邮箱应用专用密码
- 监控异常登录尝试
- 设置合理的验证码过期时间（当前为10分钟）

### 10. 监控与维护

- 定期检查服务健康状态
- 监控邮件发送成功率
- 备份 Redis 数据（如需要）
- 更新依赖包和安全补丁