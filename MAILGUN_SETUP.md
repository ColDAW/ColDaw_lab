# Mailgun 配置指南

## 🎯 Railway + Mailgun 完整配置

### 1. 获取Mailgun凭据

1. 注册/登录 [Mailgun](https://www.mailgun.com/)
2. 进入控制台 → Domains
3. 选择你的域名（或使用sandbox域名进行测试）
4. 获取以下信息：
   - **Domain**: 通常是 `sandbox-xxx.mailgun.org` 或你的自定义域名
   - **SMTP Hostname**: `smtp.mailgun.org`
   - **Default SMTP Login**: `postmaster@你的域名.mailgun.org`
   - **Default Password**: 在 "API Keys" 部分找到

### 2. Railway环境变量配置

在Railway控制台设置：

```bash
# Mailgun SMTP配置
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@你的域名.mailgun.org
SMTP_PASS=你的mailgun_smtp_密码

# 其他必需配置
FROM_EMAIL=joe.deng@coldaw.app
NODE_ENV=production
JWT_SECRET=你的jwt密钥

# Railway会自动提供这些
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### 3. Mailgun域名配置（可选）

#### 使用Sandbox域名（测试）
- 免费，但只能发送给已验证的邮箱地址
- 适合开发和测试

#### 配置自定义域名（生产）
1. 在Mailgun中添加你的域名
2. 设置DNS记录：
   ```
   TXT记录: @ → v=spf1 include:mailgun.org ~all
   MX记录: @ → mxa.mailgun.org (优先级10)
   MX记录: @ → mxb.mailgun.org (优先级10) 
   CNAME记录: email → mailgun.org
   ```
3. 等待DNS验证完成

### 4. 测试配置

部署后测试：

1. **健康检查**：
   ```
   GET https://你的域名.railway.app/api/health
   ```
   
   期望结果：
   ```json
   {
     "status": "ok",
     "services": {
       "redis": "healthy",
       "email": "healthy"
     }
   }
   ```

2. **发送验证码**：
   - 尝试注册新用户
   - 检查邮件是否收到

### 5. Mailgun优势

✅ **高送达率** - 专业邮件服务，避免垃圾邮件过滤
✅ **Railway兼容** - 587端口在云环境中稳定
✅ **详细日志** - Mailgun控制台可查看发送状态
✅ **免费额度** - 每月1000封邮件免费
✅ **API支持** - 也可以使用HTTP API而非SMTP

### 6. 故障排除

#### 如果仍有连接问题：
1. **检查凭据格式**：
   ```bash
   SMTP_USER=postmaster@sandbox-xxx.mailgun.org
   SMTP_PASS=你的32位密码字符串
   ```

2. **尝试HTTP API方式**（备选）：
   ```bash
   MAILGUN_API_KEY=key-xxx
   MAILGUN_DOMAIN=sandbox-xxx.mailgun.org
   ```

3. **查看Mailgun日志**：
   - 登录Mailgun控制台
   - 查看 Logs 部分的发送记录

### 7. 从Zoho迁移清单

- [ ] 获取Mailgun凭据
- [ ] 在Railway更新环境变量
- [ ] 重新部署应用
- [ ] 测试健康检查端点
- [ ] 测试用户注册流程
- [ ] 确认邮件正常接收