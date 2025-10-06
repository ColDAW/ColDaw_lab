# 🚂 Railway 完整部署指南 - 前端 + 后端

## 📊 当前状态

**问题:** 前端无法连接到后端
```
POST http://localhost:3001/api/auth/register net::ERR_CONNECTION_REFUSED
```

**原因:** 前端服务没有配置后端 URL 环境变量

---

## 🎯 完整解决方案

### 架构概览

```
Railway 项目
├── 后端服务 (coldaw-server)
│   ├── Node.js + Express
│   ├── 连接 PostgreSQL 数据库
│   └── 提供 API 端点
│
├── 前端服务 (coldaw-client)
│   ├── React + Vite
│   ├── 需要知道后端 URL
│   └── 提供用户界面
│
└── PostgreSQL 数据库
    └── 存储用户和项目数据
```

---

## ⚙️ 配置步骤

### 第 1 步: 配置数据库 (如已完成可跳过)

1. Railway 项目 → **New** → **Database** → **PostgreSQL**
2. 等待数据库创建完成

### 第 2 步: 配置后端服务

#### 2.1 设置后端环境变量

点击**后端服务** → **Variables** → 确保有以下变量:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
JWT_SECRET=<生成的密钥>
```

**生成 JWT_SECRET:**
```bash
openssl rand -hex 32
```

#### 2.2 获取后端 URL

1. 后端服务 → **Settings** → **Networking**
2. 在 **Domains** 部分,复制 Public Domain URL
3. 格式类似: `https://coldaw-production.up.railway.app`
4. **保存这个 URL,下一步需要用到!**

### 第 3 步: 配置前端服务 ⭐ (关键步骤)

#### 3.1 设置前端环境变量

点击**前端服务** → **Variables** → **New Variable**

添加:
```
Name:  VITE_API_URL
Value: https://your-backend-url.up.railway.app
```

**⚠️ 重要:**
- 将 `https://your-backend-url.up.railway.app` 替换为步骤 2.2 中复制的实际后端 URL
- 不要包含尾部斜杠 `/`
- 必须是完整的 URL,包括 `https://`

#### 3.2 触发重新部署

保存变量后,Railway 应该自动重新部署。如果没有:
1. 前端服务 → **Deployments** 标签
2. 点击 **Redeploy** 按钮

#### 3.3 等待部署完成

- 查看部署日志
- 确认构建成功
- 通常需要 2-3 分钟

### 第 4 步: 更新后端 CORS (可选但推荐)

为了允许前端跨域请求:

1. 后端服务 → **Variables**
2. 添加或更新:
```
Name:  CLIENT_URL
Value: https://your-frontend-url.up.railway.app
```

3. 保存后等待后端重新部署

---

## ✅ 验证部署

### 检查 1: 测试后端健康检查

```bash
curl https://your-backend-url.up.railway.app/api/health
```

应该返回:
```json
{"status":"ok","timestamp":"2025-10-06T..."}
```

### 检查 2: 打开前端并测试

1. 访问您的前端 URL
2. 按 F12 打开开发者工具
3. 切换到 **Network** 标签
4. 尝试注册/登录

**成功标志:**
```
POST https://your-backend-url.up.railway.app/api/auth/register
Status: 200 OK
```

**失败标志:**
```
POST http://localhost:3001/api/auth/register
Status: ERR_CONNECTION_REFUSED
```

如果还看到 `localhost`,说明:
- 环境变量没有保存
- 前端没有重新部署
- 浏览器缓存了旧代码 (Ctrl+Shift+R 强制刷新)

---

## 📋 完整的环境变量清单

### 后端服务 (coldaw-server)

```bash
# 数据库连接
DATABASE_URL=${{Postgres.DATABASE_URL}}

# 应用配置
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
JWT_SECRET=<32+ 字符的随机字符串>

# CORS 配置 (可选)
CLIENT_URL=https://your-frontend-url.up.railway.app
```

### 前端服务 (coldaw-client)

```bash
# API 端点
VITE_API_URL=https://your-backend-url.up.railway.app
```

### PostgreSQL 数据库

**无需配置** - Railway 自动生成所有必需变量

---

## 🐛 故障排除

### 问题 1: 前端还是连接 localhost

**症状:**
```
POST http://localhost:3001/...
```

**解决:**
1. 确认 `VITE_API_URL` 已保存
2. 强制重新部署前端
3. 清除浏览器缓存 (Ctrl+Shift+R)
4. 检查前端部署日志,确认构建成功

### 问题 2: CORS 错误

**症状:**
```
Access-Control-Allow-Origin blocked
```

**解决:**
在后端服务添加 `CLIENT_URL` 变量

### 问题 3: 502 Bad Gateway

**症状:**
```
502 Bad Gateway
```

**解决:**
1. 检查后端服务状态 (应该是绿色)
2. 查看后端部署日志
3. 确认数据库连接成功

### 问题 4: 找不到后端 URL

**位置:**
- 后端服务 → Settings → Networking → Public Domain
- 或者在部署日志中查找:
  ```
  Deployed to: https://...
  ```

---

## 🔍 调试清单

使用此清单确认所有配置正确:

### 后端服务 ✓
- [ ] DATABASE_URL 已设置
- [ ] NODE_ENV=production
- [ ] JWT_SECRET 已设置
- [ ] 服务状态为绿色
- [ ] 有公共域名 URL
- [ ] 部署日志显示 "Connected to PostgreSQL"

### 前端服务 ✓
- [ ] VITE_API_URL 已设置为后端 URL
- [ ] 环境变量已保存
- [ ] 已重新部署
- [ ] 服务状态为绿色
- [ ] 有公共域名 URL

### 数据库 ✓
- [ ] 服务状态为绿色
- [ ] 在同一个 Railway 项目中
- [ ] Public Networking 已启用 (如需要)

---

## 🚀 部署后

### 测试功能

1. **注册新用户**
   - 打开前端
   - 填写注册表单
   - 应该成功创建账户

2. **登录**
   - 使用注册的账户登录
   - 应该成功并跳转到主界面

3. **创建项目**
   - 登录后创建新项目
   - 验证项目保存到数据库

### 监控

Railway 提供:
- 部署日志
- 运行时日志
- 资源使用情况

在服务页面可以查看这些信息。

---

## 📞 需要帮助?

如果按照以上步骤操作后仍有问题,请提供:

1. **后端 Railway URL** (从 Settings → Networking)
2. **前端 Railway URL**
3. **前端服务的 VITE_API_URL 变量值** (隐藏不需要)
4. **浏览器 Network 标签截图** (显示请求 URL)
5. **前端/后端部署日志**

---

**最后更新:** 2025-10-06  
**状态:** 等待配置 `VITE_API_URL` 环境变量
