# 🔐 Railway PostgreSQL SSL 连接修复指南

## 问题描述

```
❌ PostgreSQL connection failed: Error: There was an error establishing an SSL connection
```

这个错误表示应用无法与 Railway PostgreSQL 建立 SSL 连接。

## ✅ 解决方案

### 步骤 1: 确认环境变量

在 Railway 中,打开您的**应用服务**(不是数据库服务),确认以下环境变量已正确设置:

#### 必需的环境变量:

```bash
# 数据库连接
DATABASE_URL=${{Postgres.DATABASE_URL}}

# 环境标识 (非常重要!)
NODE_ENV=production

# 应用配置
PORT=${{RAILWAY_PUBLIC_PORT}}
JWT_SECRET=<your-secret-key>
```

**关键点:** `NODE_ENV=production` 必须设置为 `production`,这样应用才会启用 SSL 连接。

### 步骤 2: 检查部署日志

保存环境变量后,Railway 会自动重新部署。查看部署日志,应该看到:

```
🔌 Connecting to PostgreSQL...
📊 Environment: production
🔐 SSL enabled: true
✅ Connected to PostgreSQL
💾 PostgreSQL database initialized
```

**如果看到 `SSL enabled: false`**,说明 `NODE_ENV` 没有设置为 `production`。

### 步骤 3: 验证数据库服务引用

确保 `DATABASE_URL` 正确引用了数据库服务:

1. 在 Railway 项目中,找到 PostgreSQL 服务的名称(通常是 `Postgres`)
2. 在应用服务的环境变量中,确认:
   ```bash
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
   或者如果服务名称不同:
   ```bash
   DATABASE_URL=${{你的数据库服务名称.DATABASE_URL}}
   ```

## 🔍 调试检查清单

### ✓ 数据库服务状态
- [ ] PostgreSQL 服务正在运行(显示绿色)
- [ ] 数据库服务有生成的连接变量

### ✓ 应用服务环境变量
- [ ] `DATABASE_URL` 正确引用数据库服务
- [ ] `NODE_ENV` 设置为 `production`
- [ ] `PORT` 设置为 `${{RAILWAY_PUBLIC_PORT}}`
- [ ] `JWT_SECRET` 已设置(任意强密码)

### ✓ 部署日志检查
- [ ] 看到 "📊 Environment: production"
- [ ] 看到 "🔐 SSL enabled: true"
- [ ] 看到 "✅ Connected to PostgreSQL"
- [ ] 没有 SSL 相关错误

## 🛠️ 技术细节

### SSL 配置代码

应用使用以下配置连接 Railway PostgreSQL:

```typescript
const isProduction = process.env.NODE_ENV === 'production';

const pgPool = new Pool({
  connectionString: databaseUrl,
  ssl: isProduction ? {
    rejectUnauthorized: false  // Railway 使用自签名证书
  } : false,
});
```

### 为什么需要 `rejectUnauthorized: false`?

Railway PostgreSQL 使用自签名 SSL 证书。设置 `rejectUnauthorized: false` 允许应用接受这些证书,同时仍然使用加密连接。

**注意:** 这仅用于连接 Railway 的托管 PostgreSQL,不会降低安全性。

## 🚨 常见错误

### 错误 1: NODE_ENV 未设置

**症状:**
```
📊 Environment: not set
🔐 SSL enabled: false
❌ PostgreSQL connection failed: SSL connection required
```

**解决方案:**
在应用服务中添加:
```bash
NODE_ENV=production
```

### 错误 2: 数据库引用错误

**症状:**
```
❌ PostgreSQL connection failed: getaddrinfo ENOTFOUND
```

**解决方案:**
检查 `DATABASE_URL` 是否正确引用数据库服务名称。

### 错误 3: 端口冲突

**症状:**
```
🚀 ColDaw server running on port 5432
```

**注意:** 5432 是 PostgreSQL 的默认端口,不是应用端口!

**解决方案:**
确保设置:
```bash
PORT=${{RAILWAY_PUBLIC_PORT}}
```

并且应该看到:
```
🚀 ColDaw server running on port 8080
```
(或其他由 Railway 分配的端口)

## 📝 快速修复步骤

1. **打开 Railway 项目**
2. **点击应用服务**(不是数据库)
3. **切换到 Variables 标签**
4. **确认/添加以下变量:**
   ```
   NODE_ENV = production
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   PORT = ${{RAILWAY_PUBLIC_PORT}}
   JWT_SECRET = <生成的密钥>
   ```
5. **保存并等待重新部署**
6. **检查部署日志**

## ✅ 成功指标

部署成功后,日志应该显示:

```
🔌 Connecting to PostgreSQL...
📊 Environment: production
🔐 SSL enabled: true
✅ Connected to PostgreSQL
💾 PostgreSQL database initialized
🧹 Cleared all stale collaborators
🚀 ColDaw server running on port 8080
```

## 🆘 还是不行?

如果按照上述步骤操作后仍有问题:

1. **截图环境变量配置页面**
2. **复制完整的部署日志**
3. **检查数据库服务的健康状态**
4. **确认应用和数据库在同一个 Railway 项目中**

---

**最后更新:** 2025-10-06
