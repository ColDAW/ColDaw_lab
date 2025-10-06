# ⚡ 立即修复:无法登录注册问题

## 🚨 错误信息
```
POST http://localhost:3001/api/auth/register net::ERR_CONNECTION_REFUSED
```

## ✅ 3 分钟快速修复

### 步骤 1: 获取后端 URL (30 秒)

1. 打开 Railway → https://railway.app
2. 点击**后端服务**(Node.js/coldaw-server)
3. Settings → Domains
4. 复制 URL,例如:
   ```
   https://coldaw-production.up.railway.app
   ```

### 步骤 2: 配置前端 (1 分钟)

**如果前端在 Railway:**
1. 点击**前端服务**
2. Variables → New Variable
3. 添加:
   ```
   VITE_API_URL=<粘贴刚才复制的后端 URL>
   ```
4. 保存(自动重新部署)

**如果前端在 Vercel:**
1. Vercel 项目 → Settings → Environment Variables
2. 添加:
   ```
   VITE_API_URL=<粘贴后端 URL>
   ```
3. 保存并重新部署

**如果前端在本地:**
1. 打开 `client` 目录
2. 创建/编辑 `.env` 文件:
   ```bash
   VITE_API_URL=<粘贴后端 URL>
   ```
3. 重启前端:
   ```bash
   npm run dev
   ```

### 步骤 3: 验证 (30 秒)

1. 打开前端应用
2. 按 F12
3. 尝试注册
4. 在 Console 或 Network 标签查看
5. URL 应该是 Railway 地址,不是 localhost

## ✅ 成功标志

**Console 应该显示:**
```
POST https://your-app.up.railway.app/api/auth/register 200
```

**不应该显示:**
```
POST http://localhost:3001/api/auth/register ERR_CONNECTION_REFUSED
```

## 🔧 故障排除

### 还是连接 localhost?

1. **清除浏览器缓存:** Ctrl+Shift+R (强制刷新)
2. **检查环境变量:** 确认 `VITE_API_URL` 已保存
3. **重新构建:** 前端必须重新构建才能应用新的环境变量

### CORS 错误?

在后端 Railway Variables 中添加:
```bash
CLIENT_URL=<your-frontend-url>
```

### 后端找不到?

1. 检查后端服务状态(应该是绿色)
2. 查看后端部署日志
3. 测试后端健康检查:
   ```bash
   curl https://your-backend-url.up.railway.app/api/health
   ```

## 📝 示例配置

**后端 Railway 变量:**
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
JWT_SECRET=abc123xyz789...
CLIENT_URL=https://your-frontend.vercel.app
```

**前端环境变量:**
```bash
VITE_API_URL=https://coldaw-backend.up.railway.app
```

## 🎯 检查清单

- [ ] 复制了后端 Railway URL
- [ ] 在前端设置了 `VITE_API_URL`
- [ ] 保存了环境变量
- [ ] 重新部署/重启了前端
- [ ] 清除了浏览器缓存
- [ ] 测试注册/登录

---

**关键点:** Vite 的环境变量(`VITE_*`)在构建时被嵌入,所以必须重新构建前端才能生效!
