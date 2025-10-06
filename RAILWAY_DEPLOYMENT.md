# Railway 部署指南

本指南将帮助您将 ColDaw 项目部署到 Railway 平台。

## 前置要求

1. [Railway](https://railway.app) 账户
2. Git 仓库（GitHub, GitLab 等）
3. 项目推送到仓库

## 部署步骤

### 1. 准备代码

确保您的项目包含以下文件：
- `package.json` (根目录)
- `Dockerfile`
- `railway.json`
- `.env.example`

### 2. 连接 Railway

1. 登录 [Railway Dashboard](https://railway.app/dashboard)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择您的 ColDaw 仓库

### 3. 配置环境变量

在 Railway 项目设置中添加以下环境变量：

#### 基础配置
```
NODE_ENV=production
PORT=${{RAILWAY_PORT}} # Railway 自动设置
JWT_SECRET=your-secure-jwt-secret-key
```

#### 数据库配置

**选项 A: 使用 LowDB (文件数据库)**
```
DATABASE_TYPE=lowdb
```

**选项 B: 使用 MongoDB**
```
DATABASE_TYPE=mongodb
MONGODB_URI=your-mongodb-connection-string
```

**选项 C: 使用 PostgreSQL**
```
DATABASE_TYPE=postgresql
DATABASE_URL=${{POSTGRES.DATABASE_URL}} # 如果使用 Railway PostgreSQL
```

### 4. 添加数据库服务 (可选)

如果选择使用外部数据库：

#### PostgreSQL
1. 在 Railway 项目中点击 "Add Service"
2. 选择 "PostgreSQL"
3. Railway 会自动设置 `DATABASE_URL` 环境变量

#### MongoDB
1. 使用 MongoDB Atlas 或其他 MongoDB 提供商
2. 将连接字符串设置为 `MONGODB_URI`

### 5. 部署配置

Railway 将自动：
1. 检测 `Dockerfile` 并构建容器
2. 运行构建脚本
3. 启动应用程序

### 6. 域名配置

1. 在 Railway 项目设置中
2. 点击 "Settings" → "Domains"
3. 生成域名或连接自定义域名

## 环境变量详细说明

### 必需变量
- `NODE_ENV`: 设置为 `production`
- `JWT_SECRET`: JWT 令牌加密密钥
- `DATABASE_TYPE`: 数据库类型 (`lowdb`, `mongodb`, `postgresql`)

### 数据库变量
- `MONGODB_URI`: MongoDB 连接字符串
- `DATABASE_URL`: PostgreSQL 连接字符串
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`: PostgreSQL 详细配置

### 可选变量
- `CLIENT_URL`: 前端 URL (CORS 配置)
- `MAX_FILE_SIZE`: 文件上传大小限制
- `UPLOAD_DIR`: 上传目录
- `PROJECTS_DIR`: 项目存储目录

## 构建过程

项目使用多阶段 Docker 构建：

1. **Client Build**: 构建 React 前端
2. **Server Build**: 编译 TypeScript 后端
3. **Production**: 组合前后端到单个容器

## 故障排除

### 构建失败
1. 检查 `package.json` 依赖
2. 确认 Node.js 版本兼容 (>=18.0.0)
3. 查看 Railway 构建日志

### 数据库连接问题
1. 验证环境变量设置
2. 检查数据库服务状态
3. 确认连接字符串格式

### 文件权限问题
```bash
# 如果遇到权限问题，确保 Dockerfile 中有：
RUN mkdir -p projects uploads
```

### CORS 问题
确保设置正确的 `CLIENT_URL` 环境变量

## 监控和日志

1. Railway Dashboard → 项目 → "Deployments"
2. 点击部署查看日志
3. 使用 "Metrics" 标签监控性能

## 扩展和优化

### 水平扩展
- Railway 支持自动扩展
- 在项目设置中配置扩展规则

### 性能优化
- 启用 Railway 的 CDN
- 优化 Docker 镜像大小
- 使用生产数据库服务

## 备份和恢复

### 文件备份 (LowDB)
- Railway 提供卷快照功能
- 定期下载 `projects/db.json`

### 数据库备份
- PostgreSQL: 使用 Railway 的自动备份
- MongoDB: 配置 MongoDB Atlas 备份

## 成本考虑

- Railway 提供免费额度
- 数据库服务可能产生额外费用
- 监控使用量和账单

---

需要帮助？查看 [Railway 文档](https://docs.railway.app) 或联系支持团队。