# 🚨 Railway PostgreSQL 配置指南

## 问题诊断

您的应用已成功部署到 Railway，但无法连接到数据库：

```
Error: connect ECONNREFUSED ::1:5432
```

这表示应用正在尝试连接到 `localhost## 🐛 常见问题

### Q1: SS### Q2: 如何找到### Q3: 变量引用不起### Q4: 部署后仍然连接失败?

**A:** 检查:
1. 数据库服务是否正在运行(绿色状态)
2. 环境变量是否正确保存
3. 查看完整的部署日志
4. SSL 配置是否正确(参见 Q1)

### Q5: 如何查看数据库内容?:** 确保:
1. 变量引用使用 `${{}}` 语法
2. 服务名称拼写正确(区分大小写)
3. 在应用服务中设置,不是在数据库服务中

### Q4: 部署后仍然连接失败?

**A:** 在 Railway 项目中,数据库服务的名称显示在卡片顶部。默认是 `Postgres`,但可能是 `postgres-123` 之类的。

使用时格式:`${{服务名称.变量名}}`

### Q3: 变量引用不起作用?"There was an error establishing an SSL connection"

**A:** Railway PostgreSQL 需要 SSL 连接。确保您的数据库配置包含:

```typescript
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false }
  : false;

const pgPool = new Pool({
  connectionString: databaseUrl,
  ssl: sslConfig,
  // ... 其他配置
});
```

**注意:** `rejectUnauthorized: false` 是 Railway 所需的,因为 Railway 使用自签名证书。

### Q2: 如何找到数据库服务名称?32`，但 Railway 容器中没有 PostgreSQL。

## ✅ 解决方案：添加 PostgreSQL 服务

### 步骤 1: 在 Railway 添加 PostgreSQL

1. 打开您的 Railway 项目
2. 点击 **"New"** 按钮
3. 选择 **"Database"** → **"Add PostgreSQL"**
4. Railway 会自动创建数据库并生成连接变量

### 步骤 2: 连接数据库到您的服务

Railway 会自动创建这些变量：
- `POSTGRES_URL` (或 `DATABASE_URL`)
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`

### 步骤 3: 配置环境变量

在您的应用服务（不是数据库）中，添加/检查以下变量：

#### 方式 A: 使用 DATABASE_URL (推荐)

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

#### 方式 B: 使用独立的连接参数

```bash
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGDATABASE=${{Postgres.PGDATABASE}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
```

### 步骤 4: 添加其他必需的环境变量

确保在您的应用服务中设置：

```bash
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
JWT_SECRET=<your-secret-key-here>
```

#### 生成强 JWT_SECRET

在本地终端运行：

```bash
openssl rand -hex 32
```

复制输出的字符串并设置为 `JWT_SECRET` 的值。

### 步骤 5: 重新部署

1. 保存所有环境变量
2. Railway 会自动重新部署应用
3. 查看部署日志，应该看到：

```
🔌 Connecting to PostgreSQL...
✅ Connected to PostgreSQL
💾 PostgreSQL database initialized
🧹 Cleared all stale collaborators
🚀 ColDaw server running on port 8080
```

## 🔍 验证部署

部署完成后：

```bash
# 替换为您的实际 Railway URL
curl https://your-app.railway.app/api/health
```

应该返回：

```json
{"status":"ok","timestamp":"2025-10-06T..."}
```

## 📸 Railway 界面截图说明

### 添加 PostgreSQL

1. **项目概览页面**
   ```
   [Your App Service]  [+ New]
   ```

2. **点击 New 后选择**
   ```
   Database
   ├── PostgreSQL  ← 选择这个
   ├── MySQL
   ├── MongoDB
   └── Redis
   ```

3. **创建后会看到**
   ```
   [Your App Service]  [Postgres]
   ```

### 配置环境变量

1. **点击您的应用服务（不是数据库）**
2. **切换到 "Variables" 标签**
3. **点击 "Add Variable"**
4. **添加以下变量：**

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | 引用 PostgreSQL 的连接字符串 |
| `NODE_ENV` | `production` | 生产环境标识 |
| `JWT_SECRET` | `<your-generated-secret>` | JWT 加密密钥（使用上面命令生成） |
| `PORT` | `${{RAILWAY_PUBLIC_PORT}}` | Railway 自动分配的端口 |

**注意：** `${{Postgres.DATABASE_URL}}` 中的 `Postgres` 是您的数据库服务名称，可能略有不同。

## 🐛 常见问题

### Q1: 如何找到数据库服务名称？

**A:** 在 Railway 项目中，数据库服务的名称显示在卡片顶部。默认是 `Postgres`，但可能是 `postgres-123` 之类的。

使用时格式：`${{服务名称.变量名}}`

### Q2: 变量引用不起作用？

**A:** 确保：
1. 变量引用使用 `${{}}` 语法
2. 服务名称拼写正确（区分大小写）
3. 在应用服务中设置，不是在数据库服务中

### Q3: 部署后仍然连接失败？

**A:** 检查：
1. 数据库服务是否正在运行（绿色状态）
2. 环境变量是否正确保存
3. 查看完整的部署日志

### Q4: 如何查看数据库内容？

**A:** 
1. 点击 PostgreSQL 服务
2. 切换到 "Data" 标签
3. 或使用 "Connect" 获取连接字符串，用 pgAdmin 或其他工具连接

## 📊 环境变量最终清单

在您的**应用服务**中应该有：

```bash
# 数据库连接
DATABASE_URL=${{Postgres.DATABASE_URL}}

# 应用配置
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
JWT_SECRET=<32字符或更长的随机字符串>

# 可选配置
CLIENT_URL=https://your-frontend-url.com
```

## 🎯 下一步

配置完成后：

1. ✅ 等待自动重新部署
2. ✅ 检查部署日志确认连接成功
3. ✅ 测试 API 端点
4. ✅ 测试用户注册/登录功能

## 📞 需要帮助？

如果配置后仍有问题：

1. 复制完整的部署日志
2. 截图环境变量配置
3. 检查 Railway 服务状态

---

**记住：** Railway 的环境变量使用 `${{ServiceName.VARIABLE_NAME}}` 语法来引用其他服务的变量。