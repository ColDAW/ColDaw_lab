# 🔧 Railway 数据库连接修复 - ENOTFOUND postgres.railway.internal

## ✅ 好消息
SSL 配置已正确!日志显示:
```
📊 Environment: production
🔐 SSL enabled: true
```

## ❌ 当前问题

```
Error: getaddrinfo ENOTFOUND postgres.railway.internal
```

这表示应用无法找到数据库主机 `postgres.railway.internal`。

## 🎯 解决方案

### 选项 1: 使用 Private Networking (推荐)

Railway 的数据库使用私有网络连接。您需要确保应用和数据库在同一个项目中,并且正确引用。

#### 步骤:

1. **打开 Railway 项目**
2. **确认项目结构:**
   ```
   您的项目
   ├── [您的应用服务]
   └── [Postgres 数据库]
   ```
   
3. **点击应用服务**
4. **进入 Settings → Networking**
5. **确认 "Private Networking" 已启用**

6. **进入 Variables 标签**
7. **检查 `DATABASE_URL` 变量:**
   
   **正确的格式:**
   ```bash
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
   
   **注意:** `Postgres` 是您的数据库服务名称。如果名称不同(例如 `postgres-production`),请相应修改。

### 选项 2: 使用 Public Networking (备用方案)

如果私有网络不工作,可以使用公共连接:

1. **点击 PostgreSQL 服务**
2. **进入 Settings → Networking**
3. **启用 "Public Networking"**
4. **复制提供的公共 URL**
5. **在应用服务的 Variables 中:**
   ```bash
   DATABASE_URL=<粘贴公共 URL>
   ```

### 选项 3: 手动配置连接参数

使用单独的环境变量:

1. **点击 PostgreSQL 服务**
2. **进入 Variables 标签**
3. **记下以下变量:**
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

4. **在应用服务中设置:**
   ```bash
   PGHOST=${{Postgres.PGHOST}}
   PGPORT=${{Postgres.PGPORT}}
   PGDATABASE=${{Postgres.PGDATABASE}}
   PGUSER=${{Postgres.PGUSER}}
   PGPASSWORD=${{Postgres.PGPASSWORD}}
   ```

5. **移除或注释掉 `DATABASE_URL`**

## 🔍 诊断步骤

### 1. 验证数据库服务名称

在 Railway 项目中:
- 数据库服务的名称显示在卡片顶部
- 通常是 `Postgres`、`postgres`、`postgres-production` 等
- **名称区分大小写!**

### 2. 检查变量引用语法

Railway 的变量引用语法:
```bash
${{服务名称.变量名}}
```

**示例:**
```bash
# 如果数据库服务叫 "Postgres"
DATABASE_URL=${{Postgres.DATABASE_URL}}

# 如果数据库服务叫 "postgres-db"
DATABASE_URL=${{postgres-db.DATABASE_URL}}
```

### 3. 查看数据库服务的 Variables

1. **点击 PostgreSQL 服务**
2. **切换到 Variables 标签**
3. **确认以下变量存在:**
   - `DATABASE_URL` 或 `POSTGRES_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

如果这些变量不存在,可能需要重新创建数据库服务。

## 🛠️ 快速修复命令

### 检查应用服务环境变量

在您的应用服务中,确保有以下配置:

```bash
# 方式 A: 使用 DATABASE_URL (推荐)
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
JWT_SECRET=<your-secret>

# 方式 B: 使用单独的参数
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGDATABASE=${{Postgres.PGDATABASE}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
JWT_SECRET=<your-secret>
```

## 📸 Railway 界面操作

### 找到数据库服务名称:

1. **在项目概览页面**
2. **看到两个服务卡片:**
   ```
   ┌─────────────────┐  ┌─────────────────┐
   │  你的应用名      │  │  Postgres       │  ← 这是服务名称
   │  (Node.js)      │  │  (PostgreSQL)   │
   └─────────────────┘  └─────────────────┘
   ```

### 设置变量引用:

1. **点击应用服务卡片**
2. **Variables 标签**
3. **点击 "New Variable"**
4. **输入:**
   - **Name:** `DATABASE_URL`
   - **Value:** `${{Postgres.DATABASE_URL}}`
   
   **重要:** 将 `Postgres` 替换为您实际的数据库服务名称!

5. **保存**

## ✅ 验证连接

保存变量后,Railway 会自动重新部署。查看日志:

**成功的日志:**
```
🔌 Connecting to PostgreSQL...
📊 Environment: production
🔐 SSL enabled: true
✅ Connected to PostgreSQL
💾 PostgreSQL database initialized
🚀 ColDaw server running on port 8080
```

**失败的日志:**
```
❌ PostgreSQL connection failed: Error: getaddrinfo ENOTFOUND postgres.railway.internal
```

## 🚨 如果还是不行

### 检查清单:

- [ ] 数据库服务正在运行(绿色状态)
- [ ] 应用和数据库在同一个 Railway 项目中
- [ ] 变量引用的服务名称完全匹配(区分大小写)
- [ ] 使用了正确的变量引用语法 `${{...}}`
- [ ] Private Networking 已启用

### 最后的手段: 重新创建数据库连接

1. **在应用服务中删除 `DATABASE_URL`**
2. **点击数据库服务**
3. **切换到 Variables**
4. **找到 `DATABASE_URL` 的值**(应该是一个完整的连接字符串)
5. **复制整个 URL**
6. **回到应用服务的 Variables**
7. **直接粘贴完整的 URL:**
   ```bash
   DATABASE_URL=postgresql://postgres:password@host:5432/railway
   ```

**注意:** 这会暴露数据库凭证,但可以验证连接是否工作。

## 📞 需要具体帮助?

请提供:
1. **Railway 项目截图**(显示服务卡片)
2. **数据库服务的名称**(从卡片顶部)
3. **应用服务中 `DATABASE_URL` 的当前设置**(隐藏敏感信息)
4. **完整的部署日志**

---

**提示:** Railway 的私有网络有时需要几分钟才能完全配置。如果刚创建数据库,等待 2-3 分钟后重试。
