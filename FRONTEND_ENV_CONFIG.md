# 🌐 前端环境变量配置指南

## 问题

前端显示错误:
```
POST http://localhost:3001/api/auth/register net::ERR_CONNECTION_REFUSED
```

这是因为前端正在尝试连接本地开发服务器,而不是 Railway 上的后端。

## ✅ 解决方案

### 步骤 1: 获取 Railway 后端 URL

1. 登录 Railway → https://railway.app
2. 打开您的项目
3. 点击**后端服务**(Node.js 应用)
4. 进入 **Settings** 标签
5. 找到 **Domains** 部分
6. 复制生成的 URL,格式类似:
   ```
   https://your-app-name.up.railway.app
   ```
   或
   ```
   https://coldaw-production.up.railway.app
   ```

### 步骤 2A: Railway 前端部署配置

如果您在 Railway 上部署前端:

1. 点击**前端服务**
2. 进入 **Variables** 标签
3. 添加新变量:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```
   (替换为步骤 1 中复制的 URL)

4. 保存后 Railway 会自动重新部署前端

### 步骤 2B: 本地开发配置

如果在本地运行前端连接 Railway 后端:

1. 在 `client` 目录创建 `.env` 文件:
   ```bash
   cd client
   cp .env.example .env
   ```

2. 编辑 `.env` 文件:
   ```bash
   # API Base URL - Railway 后端地址
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```

3. 重启前端开发服务器:
   ```bash
   npm run dev
   ```

### 步骤 2C: Vercel/Netlify 部署配置

如果在 Vercel 或 Netlify 上部署前端:

**Vercel:**
1. 项目 → Settings → Environment Variables
2. 添加:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.up.railway.app`

**Netlify:**
1. Site settings → Build & deploy → Environment
2. 添加:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.up.railway.app`

## 🔍 验证配置

### 方法 1: 检查浏览器控制台

1. 打开前端应用
2. 按 F12 打开开发者工具
3. 切换到 Console 标签
4. 尝试注册/登录
5. 应该看到请求发送到正确的 Railway URL:
   ```
   POST https://your-backend-url.up.railway.app/api/auth/register
   ```

### 方法 2: 检查 Network 标签

1. F12 → Network 标签
2. 尝试注册
3. 查看请求的 URL
4. 应该是 Railway URL,而不是 localhost

## 🛠️ 代码修复

已修复的文件:
- ✅ `client/src/components/ProjectThumbnail.tsx` - 使用 `VITE_API_URL` 环境变量
- ✅ `client/src/store/useStore.ts` - 已配置
- ✅ `client/src/api/api.ts` - 已配置
- ✅ `client/src/components/MenuBar.tsx` - 已配置

## 📋 完整的环境变量清单

### 后端 (Railway)
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
JWT_SECRET=<your-secret-key>
CLIENT_URL=<your-frontend-url>  # 可选,用于 CORS
```

### 前端 (Railway/Vercel/Netlify)
```bash
VITE_API_URL=https://your-backend-url.up.railway.app
```

### 本地开发 (.env)
```bash
# 后端
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/coldaw
NODE_ENV=development
PORT=3001
JWT_SECRET=local-dev-secret
CLIENT_URL=http://localhost:5173

# 前端
VITE_API_URL=http://localhost:3001
```

## 🚀 部署架构

### 生产环境

```
用户浏览器
    ↓
前端 (Railway/Vercel)
https://coldaw-frontend.vercel.app
    ↓ API 请求
后端 (Railway)
https://coldaw-backend.up.railway.app
    ↓ 数据库连接
PostgreSQL (Railway)
```

### 本地开发

```
浏览器 (localhost:5173)
    ↓
Vite Dev Server
    ↓ API 请求
Node.js Server (localhost:3001)
    ↓
PostgreSQL (localhost:5432)
```

## 🐛 常见问题

### Q1: 还是显示 ERR_CONNECTION_REFUSED

**检查:**
1. 环境变量是否保存并重新部署?
2. 浏览器是否缓存了旧代码? (Ctrl+Shift+R 强制刷新)
3. VITE_API_URL 是否包含 `https://` 前缀?

### Q2: CORS 错误

**症状:**
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**解决:**
在后端 Railway Variables 中添加:
```bash
CLIENT_URL=https://your-frontend-url.com
```

### Q3: 404 Not Found

**检查:**
1. 后端 URL 是否正确?
2. 后端是否成功部署?
3. 后端服务是否正在运行? (Railway 显示绿色)

### Q4: 如何找到后端 URL?

Railway 后端服务 → Settings → Domains → 复制 URL

或者在部署日志中查找:
```
Deployed to: https://your-app.up.railway.app
```

## 📞 需要帮助?

提供以下信息:
1. Railway 后端 URL
2. 前端部署位置 (Railway/Vercel/本地)
3. 浏览器控制台的完整错误信息
4. Network 标签中失败请求的详细信息

---

**重要:** 每次修改 `VITE_` 开头的环境变量后,都需要重新构建前端!Vite 在构建时会将这些变量嵌入到代码中。
