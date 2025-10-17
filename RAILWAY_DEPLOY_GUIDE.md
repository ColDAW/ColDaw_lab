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

如果邮件发送失败：

1. 检查环境变量是否正确设置
2. 确认邮箱服务器设置正确
3. 检查应用专用密码是否有效
4. 查看 Railway 部署日志中的错误信息

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