# ✅ Railway 部署检查清单

## 🎯 快速修复步骤

您的应用无法连接到数据库，按以下步骤操作：

### 第 1 步：添加 PostgreSQL 数据库 (1 分钟)

1. 在 Railway 项目页面点击 **"+ New"**
2. 选择 **"Database"** → **"PostgreSQL"**
3. 等待创建完成（会显示绿色运行状态）

### 第 2 步：配置环境变量 (2 分钟)

**在您的应用服务（不是数据库）中：**

1. 点击应用服务卡片
2. 进入 **"Variables"** 标签
3. 添加以下变量：

```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
NODE_ENV = production
JWT_SECRET = <运行命令生成：openssl rand -hex 32>
PORT = ${{RAILWAY_PUBLIC_PORT}}
```

**重要：** 将 `Postgres` 替换为您实际的数据库服务名称（在数据库卡片顶部显示）

### 第 3 步：生成 JWT 密钥

在本地终端运行：

```bash
openssl rand -hex 32
```

复制输出，粘贴到 Railway 的 `JWT_SECRET` 变量中。

### 第 4 步：等待重新部署

- Railway 会自动重新部署
- 大约需要 2-3 分钟
- 在 **"Deployments"** 标签查看进度

### 第 5 步：验证成功

在日志中查找以下内容：

```
✅ Connected to PostgreSQL
💾 PostgreSQL database initialized
🚀 ColDaw server running on port 8080
```

测试 API：

```bash
curl https://你的应用.railway.app/api/health
```

## 🎨 可视化指南

```
Railway 项目布局应该是：
┌─────────────────┐  ┌─────────────────┐
│   Your App      │  │   Postgres      │
│   (Node.js)     │──│   (Database)    │
└─────────────────┘  └─────────────────┘
      ↑
      │
  DATABASE_URL=${{Postgres.DATABASE_URL}}
```

## ⚠️ 常见错误

### 错误 1: `ECONNREFUSED ::1:5432`

**原因：** 没有添加 PostgreSQL 数据库

**解决：** 按第 1 步添加数据库

### 错误 2: `password authentication failed`

**原因：** DATABASE_URL 配置错误

**解决：** 确保使用 `${{Postgres.DATABASE_URL}}` 语法

### 错误 3: 服务无法启动

**原因：** 缺少必需的环境变量

**解决：** 确保设置了 NODE_ENV, JWT_SECRET, PORT

## 📋 完整环境变量列表

| 变量 | 值 | 必需? |
|------|-----|------|
| DATABASE_URL | `${{Postgres.DATABASE_URL}}` | ✅ 是 |
| NODE_ENV | `production` | ✅ 是 |
| JWT_SECRET | `<32位随机字符串>` | ✅ 是 |
| PORT | `${{RAILWAY_PUBLIC_PORT}}` | ✅ 是 |
| CLIENT_URL | `https://your-frontend.com` | ❌ 否 |

## 🚀 预期结果

配置正确后，您应该看到：

```
Starting Container
> coldaw-server@1.0.0 start
> node dist/index.js

🔌 Connecting to PostgreSQL...
✅ Connected to PostgreSQL
💾 PostgreSQL database initialized
🧹 Cleared all stale collaborators
🚀 ColDaw server running on port 8080
📁 Upload directory: /app/uploads
💾 Projects directory: /app/projects
```

## 🆘 仍然有问题？

1. 确认 PostgreSQL 服务状态为绿色（运行中）
2. 检查应用服务的环境变量是否全部设置
3. 查看完整的部署日志
4. 尝试手动触发重新部署

---

**预计总时间：** 5-10 分钟即可完成配置并成功部署！