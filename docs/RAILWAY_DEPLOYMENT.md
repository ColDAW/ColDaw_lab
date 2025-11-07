# Railway 部署 - Zoho Mail API 配置指南

## 🚀 在 Railway 上配置 Zoho Mail

### Step 1: 在 Railway Dashboard 中添加环境变量

1. **登录 Railway Dashboard**
   - 访问 https://railway.app/dashboard
   - 选择你的项目

2. **导航到环境变量**
   - 点击你的后端服务 (server)
   - 选择 **Variables** 标签

3. **添加 Zoho 环境变量**

点击 **+ Add Variable** 并添加以下变量：

```
ZOHO_API_KEY = your_oauth_token_here
ZOHO_ACCOUNT_ID = your_account_id_here
ZOHO_FROM_EMAIL = noreply@yourdomain.com
```

**完整的环境变量清单:**

```
# ===== Zoho Mail 配置 =====
ZOHO_API_KEY = your_oauth_token
ZOHO_ACCOUNT_ID = your_account_id
ZOHO_FROM_EMAIL = noreply@yourdomain.com

# ===== SMTP 备用配置 =====
SMTP_HOST = smtp.zoho.com
SMTP_PORT = 587
SMTP_SECURE = true
SMTP_USER = your_zoho_email@domain.com
SMTP_PASS = your_zoho_password

# ===== 其他配置 =====
NODE_ENV = production
JWT_SECRET = your_jwt_secret_key
DATABASE_URL = your_postgres_url
REDIS_URL = your_redis_url
FROM_EMAIL = noreply@coldaw.app
```

### Step 2: 部署新版本

```bash
# 方法 1: 通过 Git push (推荐)
git add .
git commit -m "chore: migrate from Mailgun to Zoho Mail API"
git push origin main
# Railway 会自动检测并部署

# 方法 2: 手动部署
# 在 Railway Dashboard 中点击 Deploy
```

### Step 3: 验证部署

1. **查看日志**
   - Railway Dashboard → Deployments → Logs
   - 查找以下日志信息：
   ```
   🔧 Using Zoho Mail API for email delivery
   ✅ Email service initialized with Zoho Mail API
   ```

2. **测试邮件发送**
   ```bash
   # 访问你的 Railway URL
   curl -X POST https://your-railway-url.railway.app/api/auth/send-verification \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

## 📋 Railway 环境变量最佳实践

### 保护敏感信息

✅ **使用 Railway 的 Secret 功能**:

1. 在 Variables 标签中，向下滚动到 **Secrets**
2. 添加以下敏感信息：
   - `ZOHO_API_KEY`
   - `SMTP_PASS`
   - `JWT_SECRET`
   - `DATABASE_URL`
   - `REDIS_URL`

✅ **好处**:
- 不会在日志中显示
- 自动加密
- 无法通过 Dashboard 查看 (仅显示为 `***`)

### 从本地测试到 Railway 部署

```bash
# 1. 在本地测试 (.env 文件)
ZOHO_API_KEY=test_token
ZOHO_ACCOUNT_ID=test_id
NODE_ENV=development

# 2. 在 Railway 上配置 (Dashboard)
ZOHO_API_KEY=production_token
ZOHO_ACCOUNT_ID=production_id
NODE_ENV=production

# 3. 验证日志
# Railway 会显示连接使用的是 Zoho API
```

## 🔧 常见 Railway 问题

### 问题 1: 邮件未发送，日志显示 SMTP 而非 Zoho

**原因**: Zoho 环境变量未在 Railway 上正确设置

**解决**:
1. 确认在 Railway Dashboard 中已添加 `ZOHO_API_KEY` 和 `ZOHO_ACCOUNT_ID`
2. 手动重新部署：
   ```bash
   # 强制重新部署
   git push origin main --force
   ```
3. 查看日志确认变量已加载

### 问题 2: 401 Unauthorized 错误

**原因**: OAuth Token 无效或过期

**解决**:
1. 重新生成 OAuth Token (见下方)
2. 在 Railway Dashboard 更新 `ZOHO_API_KEY`
3. 点击 **Redeploy** 重新部署

```bash
# 查看实时日志
railway logs --follow
```

### 问题 3: 环境变量未被应用

**原因**: 部署前的缓存

**解决**:
1. 在 Railway Dashboard 清除构建缓存
2. 重新部署：
   ```bash
   # 强制新的构建
   railway build --force
   railway deploy --force
   ```

### 问题 4: SMTP 连接超时

**原因**: Railway 网络限制或 SMTP 端口被阻止

**解决**:
1. 优先使用 Zoho API (无需 SMTP)
2. 检查 `ZOHO_API_KEY` 是否正确设置
3. 如果必须用 SMTP，尝试端口 2525（Railway 友好）

## 📊 Railway 部署架构

```
┌─────────────────┐
│  Railway App    │
├─────────────────┤
│   Node.js       │
│   Express       │
│   ColDAW Server │
├─────────────────┤
│ Environment:    │
│ - ZOHO_API_KEY  │
│ - ZOHO_ACCOUNT  │
│ - SMTP configs  │
├─────────────────┤
│  External APIs: │
│ - Zoho Mail API │
│ - SMTP Server   │
│ - PostgreSQL    │
│ - Redis         │
└─────────────────┘
```

## 🔄 完整的部署流程

### 第一次部署 Zoho

1. **获取 Zoho 凭证**
   ```bash
   # Account ID: 从 Zoho Mail 设置 > 账户
   # OAuth Token: 从 Zoho API Console 生成
   ```

2. **在本地验证** (可选)
   ```bash
   # .env 文件
   ZOHO_API_KEY=your_token
   ZOHO_ACCOUNT_ID=your_id
   npm run dev
   ```

3. **推送到 Railway**
   ```bash
   git add .
   git commit -m "feat: add Zoho Mail API support"
   git push origin main
   ```

4. **在 Railway Dashboard 配置**
   - 添加 `ZOHO_API_KEY`
   - 添加 `ZOHO_ACCOUNT_ID`
   - 添加 `ZOHO_FROM_EMAIL`

5. **监控部署**
   ```bash
   railway logs --follow
   # 看到 ✅ Email service initialized with Zoho Mail API
   ```

6. **测试**
   ```bash
   # 使用你的 Railway URL
   curl -X POST https://your-app.railway.app/api/auth/send-verification \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

### 从 Mailgun 迁移到 Zoho

1. **准备新的 Zoho 凭证**
   - 不要立即删除 Mailgun 变量

2. **在 Railway Dashboard 中**
   - 添加 `ZOHO_API_KEY`
   - 添加 `ZOHO_ACCOUNT_ID`
   - 保留 `MAILGUN_*` 变量（作为备用）

3. **推送代码更新**
   ```bash
   git push origin main
   # Railway 自动检测并部署
   ```

4. **验证 Zoho 优先级**
   - 检查日志是否显示 Zoho API 被使用

5. **（可选）移除 Mailgun 变量**
   - 确认 Zoho 运行无误后
   - 从 Railway Dashboard 删除 Mailgun 相关变量

## 🚨 生产环境检查清单

- [ ] `ZOHO_API_KEY` 已添加到 Railway
- [ ] `ZOHO_ACCOUNT_ID` 已添加到 Railway
- [ ] `ZOHO_FROM_EMAIL` 已添加到 Railway
- [ ] 代码已部署到 Railway
- [ ] 日志显示 "Email service initialized with Zoho Mail API"
- [ ] 测试邮件已成功发送
- [ ] 备用 SMTP 配置已添加 (可选)
- [ ] 敏感信息已标记为 Secrets
- [ ] 自动备份已启用
- [ ] 错误监控已配置 (Sentry/LogRocket)

## 📱 Railway CLI 命令

```bash
# 登录 Railway
railway login

# 链接项目
railway link

# 查看环境变量
railway variables

# 查看日志
railway logs --follow

# 重新部署
railway deploy

# 强制重新构建
railway build --force

# 执行命令
railway run npm run dev

# 检查状态
railway status
```

## 🔗 相关资源

- **Railway 文档**: https://docs.railway.app
- **Zoho Mail API**: https://www.zoho.com/mail/api/
- **本项目迁移指南**: `/docs/ZOHO_MIGRATION.md`
- **快速参考**: `/docs/ZOHO_QUICK_REFERENCE.md`
- **对比表**: `/docs/MAILGUN_VS_ZOHO.md`

## 💡 Railway 特定优化

### 1. 使用 Railway PostgreSQL 插件
```bash
# Railway 会自动注入 DATABASE_URL
# 无需手动配置
```

### 2. 使用 Railway Redis 插件
```bash
# Railway 会自动注入 REDIS_URL
# 无需手动配置
```

### 3. 自动日志收集
```bash
# 所有 console.log 都会被收集
# 可在 Dashboard Logs 标签查看
```

## 📞 遇到问题

1. **查看 Railway 日志**
   ```bash
   railway logs --follow
   ```

2. **检查部署状态**
   - Railway Dashboard → Deployments
   - 查看最新部署的状态和日志

3. **本地调试** (如果需要)
   ```bash
   # 使用相同的环境变量在本地测试
   export ZOHO_API_KEY=your_token
   export ZOHO_ACCOUNT_ID=your_id
   npm run dev
   ```

4. **联系支持**
   - Railway 支持: https://support.railway.app
   - 项目维护者: 查看 GitHub Issues

---

**部署状态**: ✅ 已为 Railway 生产环境优化
**最后更新**: 2025-11-07
