# 🚨 ZeptoMail "Invalid API Token" 快速修复

## 问题
```
Error: Invalid API Token found (SERR_157)
```

## 原因
你可能使用了错误类型的 Token。ZeptoMail 需要 **Send Mail Token**,而不是普通的 OAuth Access Token。

## ✅ 快速修复步骤 (5分钟)

### 第1步: 获取正确的 Send Mail Token

1. 访问: https://mailadmin.zoho.com/zeptomail/
2. 登录你的 ZeptoMail 账户
3. 点击左侧菜单 "Mail Agents"
4. 如果没有 Mail Agent:
   - 点击 "Add Mail Agent"
   - 选择 "Send using REST API"
   - 输入名称 (例如: "ColDAW Email")
   - 点击 "Add"
5. 点击你的 Mail Agent 名称进入详情页
6. 找到 **"Send Mail Token"** 部分
7. 点击 "Show Token" 或 "Copy Token"
8. 复制完整的 Token (应该以 `Zoho-enczapikey_` 开头)

### 第2步: 更新 Railway 环境变量

1. 访问: https://railway.app/dashboard
2. 选择你的项目 → "server" 服务
3. 点击 "Variables" 标签
4. 找到或添加 `ZOHO_API_KEY`
5. **重要**: 只粘贴 **Token 本身**，不包含 `Zoho-enczapikey` 前缀
   - ✅ 正确: `wSsVR60g+kL5W60uzWerIbw7z1lSB1ikFUwv21f0v3OoT6/Bpcc/lU2Y...`
   - ❌ 错误: `Zoho-enczapikey wSsVR60g+kL5W60uzWerIbw7z1lSB1ikFUwv...`
6. **删除以下变量** (如果存在):
   - `ZOHO_ACCOUNT_ID` (不再需要)
   - `ZOHO_REFRESH_TOKEN` (如果你选择使用 Send Mail Token)
   - `ZOHO_CLIENT_ID` (如果你选择使用 Send Mail Token)
   - `ZOHO_CLIENT_SECRET` (如果你选择使用 Send Mail Token)
7. 确保 `ZOHO_FROM_EMAIL` 设置正确
8. 点击 "Redeploy" 或等待自动部署

### 第3步: 验证修复

查看 Railway 日志,应该看到:
```
🔧 Using ZeptoMail with Send Mail Token (recommended for ZeptoMail)
✅ Email service initialized with ZeptoMail API
```

## 正确的环境变量配置

### ✅ 最简配置 (推荐)
```env
# 只需要 Token 本身，不包含 "Zoho-enczapikey" 前缀
ZOHO_API_KEY=wSsVR60g+kL5W60uzWerIbw7z1lSB1ikFUwv21f0v3OoT6/Bpcc/lU2YBgf2FKQaETZpFWcXob4qmhwC0zUO3d4lwl8CDiiF9mqRe1U4J3x17qnvhDzPWWhYkBGJLY8JzgtqkmVmGs0r+g==
ZOHO_FROM_EMAIL=noreply@yourdomain.com
```

**重要提示**: 
- ✅ 环境变量中只保存 **Token 本身**
- ✅ 代码会自动添加 `Zoho-enczapikey ` 前缀到 HTTP header
- ❌ 不要在环境变量中包含 `Zoho-enczapikey` 前缀

### ❌ 常见错误配置

**错误 1: 使用了 OAuth Access Token 而不是 Send Mail Token**
```env
# ❌ 错误 - 这是 OAuth token,会过期
ZOHO_API_KEY=1000.xxxxx.xxxxx
```

**错误 2: 设置了不需要的变量**
```env
# ❌ 不需要 - ZeptoMail 不需要 Account ID
ZOHO_ACCOUNT_ID=12345678901234567
```

**错误 3: Token 格式不完整**
```env
# ❌ 缺少前缀
ZOHO_API_KEY=xxxxxxxxxxxxxxxxxxxxx

# ✅ 正确 - 包含完整前缀
ZOHO_API_KEY=Zoho-enczapikey_xxxxxxxxxxxxxxxxxxxxx
```

## 验证 Token 格式

正确的 Send Mail Token 应该:
- ✅ 以 `Zoho-enczapikey_` 开头
- ✅ 长度约 40-60 字符
- ✅ 只包含字母、数字、下划线
- ✅ 从 ZeptoMail Dashboard 的 Mail Agents 页面获取

## 测试邮件发送

```bash
# 获取你的 Railway URL
curl -X POST https://your-app.railway.app/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@example.com"}'

# 成功响应:
# {"message":"Verification code sent successfully"}
```

## 还是不行?

### 检查清单

- [ ] Token 是从 ZeptoMail Mail Agents 页面复制的
- [ ] Token 以 `Zoho-enczapikey_` 开头
- [ ] Railway 环境变量已更新
- [ ] 已删除 `ZOHO_ACCOUNT_ID`
- [ ] 已重新部署应用
- [ ] `ZOHO_FROM_EMAIL` 已在 ZeptoMail 中验证

### 查看日志

```bash
# 使用 Railway CLI
railway logs --follow

# 或在 Railway Dashboard 查看
# Project → Service → Deployments → Latest → Logs
```

查找错误信息:
- `Invalid API Token` → Token 格式错误
- `Access Denied` → Token 无权限
- `From address not verified` → 发件地址未验证

## 需要帮助?

1. 确认 Send Mail Token 格式: `Zoho-enczapikey_xxxxx`
2. 确认从正确位置获取: Mail Agents → 你的 Agent → Send Mail Token
3. 确认环境变量名称: `ZOHO_API_KEY` (不是 `ZEPTOMAIL_API_KEY`)
4. 检查完整的错误日志

## 参考文档

- 完整配置指南: `ZOHO_TRANSACTIONAL_EMAIL_SETUP.md`
- ZeptoMail 文档: https://www.zoho.com/zeptomail/help/
- ZeptoMail Dashboard: https://mailadmin.zoho.com/zeptomail/
