# Railway 重新部署指南

## 🔧 问题说明

前端仍在尝试连接 `localhost:3001`，这是因为：
1. 前端在构建时将 API URL 编译进了代码
2. 之前的构建使用的是默认的 `localhost:3001`
3. 需要重新构建并部署，使用新的 `VITE_API_URL=https://www.coldaw.app`

## ✅ 已完成的修复

1. **更新 Dockerfile** - 添加了 `VITE_API_URL` 构建参数
2. **设置默认值** - 在 Dockerfile 中设置默认值为 `https://www.coldaw.app`

## 🚀 重新部署到 Railway

### 方法 1: 使用 Git Push（推荐）

```bash
# 1. 提交更改
git add Dockerfile client/.env vst-plugin/Source/PluginProcessor.cpp vst-plugin/README.md
git commit -m "Update server URL to www.coldaw.app"

# 2. 推送到远程仓库
git push origin main

# 3. Railway 会自动检测并重新部署
```

### 方法 2: 使用 Railway CLI

```bash
# 1. 确保已安装 Railway CLI
# npm install -g @railway/cli

# 2. 登录
railway login

# 3. 链接到项目
railway link

# 4. 部署
railway up
```

### 方法 3: 通过 Railway Dashboard

1. 访问 https://railway.app/dashboard
2. 选择你的项目
3. 点击 "Deployments" 标签
4. 点击 "Deploy" 按钮手动触发部署

## 📋 验证部署

### 1. 检查构建日志

在 Railway Dashboard 中：
- 点击最新的 Deployment
- 查看构建日志
- 确认看到：`VITE_API_URL=https://www.coldaw.app`

### 2. 检查环境变量

在 Railway Dashboard 中：
- 点击项目
- 转到 "Variables" 标签
- 确认（可选）添加：
  ```
  VITE_API_URL=https://www.coldaw.app
  ```

**注意**: Dockerfile 中已经设置了默认值，所以这个环境变量是可选的。

### 3. 测试前端

部署完成后：

```bash
# 检查前端构建的 API URL
curl https://www.coldaw.app | grep -o "localhost:3001\|www.coldaw.app"
```

应该只看到 `www.coldaw.app`，不应该出现 `localhost:3001`。

### 4. 测试功能

1. 访问 https://www.coldaw.app
2. 登录账户
3. 上传或更新 .als 文件
4. 点击 Push 按钮
5. 验证成功提交

## 🔍 故障排除

### 问题 1: 仍然显示 localhost:3001

**原因**: 浏览器缓存了旧的 JavaScript 文件

**解决方案**:
```
1. 打开浏览器开发者工具 (F12)
2. 右键点击刷新按钮
3. 选择 "清空缓存并硬性重新加载"

或者:
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows/Linux)
```

### 问题 2: Railway 构建失败

**检查事项**:
- Dockerfile 语法是否正确
- package.json 是否存在
- 构建命令是否正确

**查看日志**:
```bash
railway logs
```

### 问题 3: API 请求 CORS 错误

**确保后端配置了正确的 CORS 设置**:

检查 `server/src/index.ts` 或类似文件：
```typescript
app.use(cors({
  origin: [
    'https://www.coldaw.app',
    'http://localhost:5173' // 开发环境
  ],
  credentials: true
}));
```

### 问题 4: 环境变量未生效

**在 Railway 中设置构建参数**:

1. 进入 Railway Dashboard
2. 选择服务
3. Settings → Variables
4. 添加：
   ```
   VITE_API_URL=https://www.coldaw.app
   ```
5. 重新部署

## 📊 部署检查清单

- [ ] Dockerfile 已更新（包含 VITE_API_URL）
- [ ] 代码已提交到 Git
- [ ] 已推送到远程仓库
- [ ] Railway 检测到更改并开始构建
- [ ] 构建日志显示正确的 VITE_API_URL
- [ ] 部署成功完成
- [ ] 清除浏览器缓存
- [ ] 测试登录功能
- [ ] 测试 Push 功能
- [ ] 检查网络请求指向 www.coldaw.app

## 🎯 预期结果

部署成功后：

### 浏览器开发者工具（Network 标签）
```
✅ POST https://www.coldaw.app/api/versions/.../commit
❌ POST http://localhost:3001/... (不应该出现)
```

### 前端代码
```javascript
// 应该使用
const API_BASE_URL = "https://www.coldaw.app"

// 而不是
const API_BASE_URL = "http://localhost:3001"
```

## 📝 完整部署流程

```bash
# 1. 确认所有更改
git status

# 2. 提交更改
git add .
git commit -m "Fix: Update all URLs to www.coldaw.app"

# 3. 推送到远程仓库
git push origin main

# 4. 等待 Railway 自动部署（约 2-5 分钟）

# 5. 检查部署状态
# 访问 Railway Dashboard 查看部署日志

# 6. 测试部署
# 访问 https://www.coldaw.app
# 清除浏览器缓存（Cmd+Shift+R）
# 测试登录和 Push 功能
```

## 🔐 Railway 环境变量配置

确保 Railway 项目设置了以下环境变量：

### 后端服务
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
PORT=3001
NODE_ENV=production
```

### 构建时变量（可选，Dockerfile 中已有默认值）
```
VITE_API_URL=https://www.coldaw.app
```

---

**更新日期**: 2025年10月7日  
**状态**: 📝 等待重新部署  
**下一步**: 推送代码到 Git 并等待 Railway 自动部署
