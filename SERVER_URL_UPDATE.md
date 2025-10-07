# Server URL 更新指南

## 🌐 新的服务器地址

所有组件现在使用统一的生产服务器地址：
```
https://www.coldaw.app
```

## ✅ 已更新的组件

### 1. VST 插件 (`vst-plugin/Source/PluginProcessor.cpp`)
- **第 18 行**: `serverUrl = "https://www.coldaw.app";`
- **状态**: ⚠️ 需要重新编译

### 2. 前端应用 (`client/.env`)
- **变量**: `VITE_API_URL=https://www.coldaw.app`
- **状态**: ✅ 已更新，需要重启开发服务器

### 3. 文档 (`vst-plugin/README.md`)
- **状态**: ✅ 已更新

## 🔧 下一步操作

### 重新编译 VST 插件

```bash
cd vst-plugin
./build.sh
```

这将：
1. 清理旧的构建文件
2. 使用 CMake 配置项目
3. 编译插件
4. 自动安装到系统目录：
   - VST3: `~/Library/Audio/Plug-Ins/VST3/ColDawLab.vst3`
   - AU: `~/Library/Audio/Plug-Ins/Components/ColDawLab.component`

### 重启前端开发服务器

```bash
cd client
npm run dev
```

或者如果已经在运行，按 `Ctrl+C` 停止，然后重新运行。

## 📋 验证步骤

### 1. 验证 VST 插件
- 在 Ableton Live 中重新扫描插件
- 加载 ColDawLab VST
- 检查是否能成功登录
- 尝试导入项目

### 2. 验证前端应用
- 访问 http://localhost:5173（开发环境）
- 或访问 https://www.coldaw.app（生产环境）
- 检查是否能正常登录和操作

### 3. 测试 Push 功能
- 上传或更新 .als 文件
- 点击 Push 按钮
- 验证是否成功提交

## 🔍 检查网络请求

打开浏览器开发者工具（F12），在 Network 标签中：
- 所有 API 请求应该指向 `https://www.coldaw.app`
- 不应该看到 `localhost:3001` 或 `coldawlab-production.up.railway.app`

## ⚙️ Railway 部署配置

确保 Railway 部署配置正确：

### 后端服务
- **Custom Domain**: `www.coldaw.app`
- **Environment Variables**: 
  - `DATABASE_URL`: Railway PostgreSQL 连接字符串
  - `JWT_SECRET`: JWT 密钥
  - `PORT`: 3001 (Railway 会自动映射)

### 前端服务（如果单独部署）
- **Custom Domain**: 可以使用子域名（如 `app.coldaw.app`）
- **Environment Variable**:
  - `VITE_API_URL=https://www.coldaw.app`

## 🌐 DNS 配置

确保域名 DNS 记录正确设置：
```
Type: CNAME
Name: www
Value: [Railway 提供的域名]
```

或使用 A 记录指向 Railway 的 IP 地址。

## 📝 相关文件

| 文件 | 更新内容 | 状态 |
|------|----------|------|
| `vst-plugin/Source/PluginProcessor.cpp` | serverUrl = "https://www.coldaw.app" | ⚠️ 需要重新编译 |
| `client/.env` | VITE_API_URL=https://www.coldaw.app | ✅ 已更新 |
| `vst-plugin/README.md` | 文档更新 | ✅ 已更新 |

## 🚀 快速启动命令

```bash
# 1. 重新编译 VST 插件
cd vst-plugin && ./build.sh && cd ..

# 2. 重启前端（在新终端）
cd client && npm run dev

# 3. 在 DAW 中重新扫描插件并测试
```

---

**更新日期**: 2025年10月7日  
**新服务器地址**: https://www.coldaw.app  
**状态**: ✅ 配置完成，需要重新编译和重启
