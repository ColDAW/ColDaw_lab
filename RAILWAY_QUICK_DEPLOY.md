# Railway 部署检查表 - Zoho Mail 配置

## ✅ 部署前准备 (5分钟)

### 1. 获取 Zoho 凭证
- [ ] 登录 https://mail.zoho.com
- [ ] 进入 **设置 > 账户信息**
- [ ] 复制 **Account ID** → `ZOHO_ACCOUNT_ID`
- [ ] 生成 OAuth Token → `ZOHO_API_KEY`
- [ ] 确认发送邮箱已验证 → `ZOHO_FROM_EMAIL`

### 2. 准备 Railway 环境变量
```
ZOHO_API_KEY = <paste your token>
ZOHO_ACCOUNT_ID = <paste your account id>
ZOHO_FROM_EMAIL = noreply@yourdomain.com
```

## 🚀 部署步骤 (5分钟)

### Step 1: 在 Railway Dashboard 中配置
1. 打开 https://railway.app/dashboard
2. 选择项目 → 选择 **server** 服务
3. 点击 **Variables** 标签
4. 添加三个变量：
   - `ZOHO_API_KEY` (设为 Secret)
   - `ZOHO_ACCOUNT_ID` (设为 Secret)
   - `ZOHO_FROM_EMAIL`

### Step 2: 推送代码更新
```bash
cd /Users/yifan/Documents/WebD/ColDaw_lab
git status
git add .
git commit -m "feat: migrate from Mailgun to Zoho Mail API for Railway deployment"
git push origin main
```

### Step 3: 等待自动部署
- Railway 会自动检测到 push
- 在 Dashboard 中查看部署进度
- 等待状态变为 ✅ **Success**

### Step 4: 验证日志
```bash
# 方法 1: Railway CLI (推荐)
railway login
railway link
railway logs --follow

# 查找日志中的以下消息:
# ✅ Email service initialized with Zoho Mail API
```

或者

```bash
# 方法 2: Railway Dashboard
# 点击 Deployments → 最新部署 → Logs
# 搜索 "Zoho Mail API"
```

## 🧪 部署后测试 (2分钟)

### 测试 1: 检查环境变量
```bash
railway run env | grep ZOHO
# 应该显示:
# ZOHO_API_KEY=***
# ZOHO_ACCOUNT_ID=***
# ZOHO_FROM_EMAIL=***
```

### 测试 2: 测试邮件发送
```bash
# 获取你的 Railway URL
# 在 Dashboard 中查看或:
railway status

# 测试 API
curl -X POST https://your-railway-url/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"your_test_email@gmail.com"}'

# 应返回:
# {"message":"Verification code sent successfully"}
```

### 测试 3: 检查邮件
- 检查你的邮箱收件箱 (包括垃圾邮件)
- 应该收到 ColDAW 验证邮件

## 🔍 故障排查

### 问题 1: 日志显示 "SMTP initialization" 而非 "Zoho Mail API"

```bash
# 原因: 环境变量未正确设置

# 解决:
# 1. 检查 Railway Dashboard 中的变量
# 2. 确认拼写完全正确 (包括大小写)
# 3. 手动重新部署

# 在 Railway Dashboard 中:
# 点击你的服务 → 右上角 "Redeploy" 按钮
```

### 问题 2: 返回 401 错误

```bash
# 原因: OAuth Token 无效或过期

# 检查日志:
railway logs | grep -i "401\|unauthorized"

# 解决:
# 1. 从 Zoho API Console 重新生成 Token
# 2. 在 Railway Dashboard 更新 ZOHO_API_KEY
# 3. 重新部署
railway deploy --force
```

### 问题 3: 返回 403 错误

```bash
# 原因: OAuth Token 权限不足

# 检查 Zoho OAuth 应用配置:
# https://api-console.zoho.com/
# 确保包含以下 scope:
# - Zoho.mail.messages.CREATE

# 解决:
# 1. 重新生成 Token (需要正确的权限)
# 2. 更新 Railway Dashboard 中的 ZOHO_API_KEY
railway deploy --force
```

### 问题 4: 邮件被标记为垃圾

```bash
# 原因: 发送地址未验证

# 解决:
# 1. 登录 Zoho Mail: https://mail.zoho.com
# 2. 设置 → 邮箱账户
# 3. 验证发送地址
# 4. 重新测试
```

### 问题 5: 超时错误

```bash
# 原因: Railway 网络限制 (可能)

# 查看日志
railway logs --follow | grep -i "timeout\|error"

# 解决:
# 1. 确认 Zoho API 地址正确: 
#    https://mail.zoho.com/api/accounts/{id}/messages
# 2. 尝试使用 SMTP 备用 (设置 SMTP_* 变量)
# 3. 检查 Railway 网络状态
```

## 📋 完整的 Railway 环境变量

复制下面的所有变量到 Railway Dashboard:

```
# ===== Zoho Mail API (必需) =====
ZOHO_API_KEY = your_oauth_token
ZOHO_ACCOUNT_ID = your_account_id
ZOHO_FROM_EMAIL = noreply@yourdomain.com

# ===== SMTP 备用 (推荐) =====
SMTP_HOST = smtp.zoho.com
SMTP_PORT = 587
SMTP_SECURE = true
SMTP_USER = your_zoho_email@domain.com
SMTP_PASS = your_zoho_password

# ===== 应用配置 =====
NODE_ENV = production
FROM_EMAIL = noreply@coldaw.app

# ===== Railway 自动注入 (无需手动设置) =====
# DATABASE_URL (PostgreSQL)
# REDIS_URL (Redis)
# PORT (自动分配)
```

## 🎯 快速命令参考

```bash
# 查看当前状态
railway status

# 查看实时日志 (30 秒内)
railway logs --follow

# 查看最后 100 行日志
railway logs --lines 100

# 重新部署 (立即)
railway deploy --force

# 打开 Railway Dashboard
railway open

# 在 Railway 环境中运行命令
railway run npm run build

# 查看部署历史
railway deployments
```

## 🔗 相关文件

- 详细部署指南: `/docs/RAILWAY_DEPLOYMENT.md`
- 迁移完整说明: `/docs/ZOHO_MIGRATION.md`
- 快速参考: `/docs/ZOHO_QUICK_REFERENCE.md`
- 对比表: `/docs/MAILGUN_VS_ZOHO.md`

## ✅ 完成标志

当你看到以下日志消息，说明部署成功：

```
🔧 Using Zoho Mail API for email delivery
✅ Email service initialized with Zoho Mail API
📧 Sending verification email via Zoho Mail API to: user@example.com
✅ Verification email sent successfully via Zoho Mail API
Message ID: msg_12345
```

## 💬 需要帮助?

1. **查看 Railway 日志**
   ```bash
   railway logs --follow
   ```

2. **检查 Railway 状态**
   - https://status.railway.app

3. **查看代码日志**
   - 在 `/server/src/services/email.ts` 第 170-210 行
   - 检查 `sendViaZohoAPI()` 方法

4. **本地测试** (如果需要)
   ```bash
   export ZOHO_API_KEY=your_token
   export ZOHO_ACCOUNT_ID=your_id
   npm run dev
   ```

---

**状态**: ✅ Railway 就绪
**最后更新**: 2025-11-07
**预计部署时间**: 3-5 分钟
