# Railway部署指南

## 问题修复

原来的部署错误已经修复：

### 1. Shell兼容性问题
- **问题**: `start.sh: 8: Bad substitution`
- **原因**: `BASH_SOURCE[0]` 在某些shell环境中不支持
- **修复**: 替换为更兼容的 `dirname "$0"`

### 2. npm not found问题
- **问题**: `start.sh: 37: npm: not found`
- **原因**: Railway容器环境中没有正确配置Node.js
- **修复**: 创建Dockerfile确保正确的Node.js环境

## 部署步骤

### 1. 推送代码到仓库
```bash
git add .
git commit -m "Fix Railway deployment configuration"
git push origin main
```

### 2. Railway配置

在Railway项目中设置以下环境变量：

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=https://your-frontend-url.railway.app
```

### 3. 构建配置

Railway将自动：
1. 检测到Dockerfile并使用它构建
2. 安装Node.js 18
3. 运行 `npm run build` 构建服务器
4. 使用 `npm run start` 启动应用

## 文件说明

### 新增文件：
- `package.json` (根目录) - Railway主配置
- `railway.json` - Railway部署配置
- `Dockerfile` - 容器化配置
- `.dockerignore` - Docker构建优化
- `.env.example` - 环境变量示例

### 修改文件：
- `start.sh` - 修复shell兼容性
- `server/package.json` - 添加postinstall脚本

## 部署架构

```
Railway部署 → Docker容器 → Node.js 18 → Express服务器 (端口由Railway自动分配)
```

## 重要注意事项

1. **端口配置**: 服务器已配置使用 `process.env.PORT`，Railway会自动分配端口
2. **环境变量**: 必须在Railway控制台设置JWT_SECRET
3. **CORS配置**: 如果有前端，需要设置CLIENT_URL环境变量
4. **文件存储**: 项目文件会存储在容器的`/app/server/projects`目录
5. **数据持久性**: 当前使用LowDB文件存储，重启后数据可能丢失，建议后续迁移到数据库

## 故障排除

如果部署仍有问题：

1. 检查Railway日志
2. 确认环境变量设置正确
3. 验证所有依赖都在package.json中
4. 检查TypeScript编译是否成功

## 下一步优化建议

1. 添加数据库支持（PostgreSQL/MongoDB）
2. 添加静态文件服务
3. 配置CDN for文件上传
4. 添加健康检查端点
5. 配置日志管理