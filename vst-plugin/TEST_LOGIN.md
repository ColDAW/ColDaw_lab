# VST 插件登录测试指南

## 🐛 问题
VST 插件输入正确的邮箱密码后无法登录

## ✅ 已修复
修复了 JUCE HTTP API 使用方式，确保 JSON Content-Type 正确发送到服务器

## 🔧 重新编译插件

```bash
# 进入插件构建目录
cd /Users/yifan/Documents/WebD/ColDaw/vst-plugin/build

# 重新编译
cmake --build . --config Release

# 插件会自动安装到:
# macOS: ~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3
```

如果 build 目录不存在：
```bash
cd /Users/yifan/Documents/WebD/ColDaw/vst-plugin
mkdir build
cd build
cmake .. -DJUCE_PATH=../../JUCE
cmake --build . --config Release
```

## 🧪 测试步骤

### 1. 确保服务器运行中
```bash
# 检查服务状态
lsof -nP -iTCP:3001 -sTCP:LISTEN  # 后端
lsof -nP -iTCP:5173 -sTCP:LISTEN  # 前端

# 如果没运行，启动服务
cd /Users/yifan/Documents/WebD/ColDaw
./start-services.sh
```

### 2. 在 DAW 中测试

1. **打开你的 DAW**（Ableton Live、Logic Pro、FL Studio 等）

2. **加载插件**：
   - 插件名称：`ColDaw Export`
   - 类型：效果器/工具
   - 分类：其他/实用工具

3. **测试登录**：
   ```
   Email: demo@coldaw.com
   Password: demo123
   ```
   
4. **期望结果**：
   - 状态显示："Logging in..."
   - 几秒后显示："Logged in as: demo@coldaw.com"
   - 登录按钮隐藏，登出按钮显示
   - Export 按钮变为可用（不再灰色）

### 3. 测试导出功能

1. 在 Ableton Live 中保存一个项目
2. 在插件中点击 "Export to ColDaw"
3. 应该显示："Successfully exported! Project ID: xxx"
4. 浏览器自动打开项目页面

## 🔍 调试信息

### 查看服务器日志
```bash
cd /Users/yifan/Documents/WebD/ColDaw/server
npm run dev

# 观察登录请求
# 应该看到: POST /api/auth/login 200
# 而不是: POST /api/auth/login 400
```

### 常见问题

#### 问题 1：插件列表中找不到 ColDaw Export
**解决**：
```bash
# 检查插件是否安装
ls -la ~/Library/Audio/Plug-Ins/VST3/ | grep ColDaw

# 重新扫描插件
# 在 DAW 设置中触发插件重新扫描
```

#### 问题 2：仍然显示 "Login failed"
**检查**：
1. 服务器是否运行在 3001 端口
2. Server URL 设置是否正确（默认 http://localhost:3001）
3. 邮箱密码是否正确

**调试**：
```bash
# 手动测试 API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@coldaw.com","password":"demo123"}'

# 应该返回包含 token 的 JSON
```

#### 问题 3：登录成功但导出失败
**可能原因**：
- Token 未正确保存
- 认证头未正确发送
- 服务器认证中间件问题

**检查插件状态**：
- 查看 "Login Status" 是否显示绿色
- 确认 Export 按钮已启用

## 📝 修改说明

### 修改的文件
- `vst-plugin/Source/PluginProcessor.cpp`

### 关键修改
```cpp
// 旧代码（❌ 不工作）
juce::URL postUrl = url.withPOSTData(postData);
stream = postUrl.createInputStream(..., "Content-Type: application/json", ...);

// 新代码（✅ 正确）
juce::URL::InputStreamOptions options = ...
    .withExtraHeaders("Content-Type: application/json")
    .withHttpRequestCmd("POST");
stream = url.createInputStream(options.withPostData(jsonString));
```

### 为什么旧代码不工作
1. `withPOSTData()` 自动设置 Content-Type 为 `application/x-www-form-urlencoded`
2. `extraHeaders` 参数无法覆盖这个设置
3. 服务器收到错误的 Content-Type，无法解析 JSON
4. `req.body` 为空，返回 400 错误

### 新代码如何解决
1. 使用现代的 `InputStreamOptions` API
2. 通过 `withExtraHeaders()` 正确设置 Content-Type
3. 直接传递 JSON 字符串作为 POST data
4. 服务器正确识别和解析 JSON

## 🎯 预期结果

### 成功的登录流程
```
1. 用户输入邮箱和密码
2. 点击 Login 按钮
3. 插件显示 "Logging in..."
4. 发送 POST 请求到 /api/auth/login
   - Content-Type: application/json
   - Body: {"email":"demo@coldaw.com","password":"demo123"}
5. 服务器验证凭据
6. 返回 200 + {"token":"...", "userId":"...", "email":"...", "name":"..."}
7. 插件保存 token
8. 显示 "Logged in as: demo@coldaw.com"
9. Export 按钮启用
```

### 成功的导出流程
```
1. 用户点击 Export 按钮
2. 插件读取 .als 文件
3. 创建 multipart/form-data
4. 发送 POST 请求到 /api/projects/init
   - Authorization: Bearer <token>
   - Content-Type: multipart/form-data; boundary=...
5. 服务器验证 token
6. 解析并保存项目
7. 返回 200 + {"projectId":"...", "versionId":"..."}
8. 插件显示成功消息
9. 浏览器打开项目页面
```

## 🆘 需要帮助？

如果仍有问题：
1. 查看 `/vst-plugin/VST_LOGIN_FIX.md` 了解详细技术信息
2. 检查服务器日志中的错误信息
3. 确认测试账号有效：`demo@coldaw.com` / `demo123`
4. 验证服务器和前端都在运行

## 📚 相关文档
- `VST_LOGIN_FIX.md` - 详细的修复说明
- `AUTHENTICATION.md` - 认证系统概述
- `README.md` - 插件使用指南
- `QUICKSTART.md` - 快速开始指南
