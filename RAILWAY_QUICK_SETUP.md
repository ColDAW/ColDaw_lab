# ⚡ Railway 快速设置 - DATABASE_URL 缺失

## 🚨 问题诊断

如果看到:
```
🌐 Connecting to host: localhost
❌ PostgreSQL connection failed
```

**说明:** `DATABASE_URL` 环境变量未设置!

## ✅ 3 分钟快速修复

### 步骤 1: 找到数据库服务名称

1. 打开 Railway 项目
2. 查看数据库服务卡片顶部的名称
3. 记下名称(例如: `Postgres`)

### 步骤 2: 设置环境变量

1. 点击**应用服务**(不是数据库!)
2. 进入 **Variables** 标签
3. 点击 **"New Variable"** 或编辑现有的 `DATABASE_URL`

### 步骤 3: 添加正确的值

**方法 A: 使用引用(推荐)**
```
Name: DATABASE_URL
Value: ${{Postgres.DATABASE_URL}}
```
↑ 将 `Postgres` 替换为您的实际数据库服务名称

**方法 B: 使用公共 URL**
1. 数据库服务 → Settings → Networking → 启用 Public Networking
2. 数据库服务 → Connect → 复制 URL
3. 粘贴到 DATABASE_URL:
```
Name: DATABASE_URL
Value: postgresql://postgres:xxx@xxx.proxy.rlwy.net:5432/railway
```

### 步骤 4: 添加其他必需变量

确保还有这些:
```
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
JWT_SECRET=<随机字符串>
```

生成 JWT_SECRET:
```bash
openssl rand -hex 32
```

### 步骤 5: 保存并验证

1. 保存变量
2. 等待 Railway 自动重新部署(约 2-3 分钟)
3. 查看部署日志

## ✅ 成功标志

日志应该显示:
```
🔌 Connecting to PostgreSQL...
📊 Environment: production
🔐 SSL enabled: true
🌐 Connecting to host: <不是 localhost!>
🔄 Attempting to connect...
✅ Connected to PostgreSQL
💾 PostgreSQL database initialized
```

## ❌ 失败标志

如果还看到:
```
🌐 Connecting to host: localhost
```
说明 `DATABASE_URL` 还是没设置正确!

## 🔍 故障排除

### 问题: 引用不工作

**症状:** 设置了 `${{Postgres.DATABASE_URL}}` 但还是连 localhost

**原因:**
- 服务名称拼写错误
- 大小写不匹配
- 引用语法错误

**解决:** 使用方法 B(公共 URL)

### 问题: 找不到 DATABASE_URL

**症状:** 数据库服务的 Variables 中没有 `DATABASE_URL`

**解决:**
1. 查找 `POSTGRES_URL` 或 `PGDATABASE`
2. 或者重新创建数据库服务:
   - 删除当前数据库
   - New → Database → PostgreSQL
   - 等待初始化

### 问题: SSL 错误

**症状:** 连接主机正确但还是 SSL 错误

**检查:**
```
NODE_ENV=production  ← 必须设置为 production!
```

## 📋 完整的环境变量清单

```bash
# 在应用服务中设置:
DATABASE_URL=${{Postgres.DATABASE_URL}}  # 或实际 URL
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
JWT_SECRET=<32+ 字符随机字符串>

# 可选:
CLIENT_URL=<前端 URL>
```

## 🎯 常见错误对照表

| 日志显示 | 问题 | 解决方案 |
|---------|------|---------|
| `Connecting to host: localhost` | DATABASE_URL 未设置 | 设置 DATABASE_URL |
| `Connecting to host: postgres.railway.internal` | 私有网络问题 | 启用公共网络 |
| `SSL enabled: false` | NODE_ENV 未设置 | 设置 NODE_ENV=production |
| `ENOTFOUND` | 主机名错误 | 检查 DATABASE_URL |
| `authentication failed` | 凭证错误 | 复制正确的 URL |

## 🆘 还是不行?

提供以下信息:
1. 数据库服务的名称(从 Railway 卡片)
2. 应用服务的 DATABASE_URL 设置(隐藏密码)
3. 完整的部署日志
4. 截图: 显示两个服务的项目概览

---

**关键点:** Railway 容器中没有 PostgreSQL!必须通过 `DATABASE_URL` 连接到 Railway 提供的数据库服务。
