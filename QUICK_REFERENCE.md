# ColDaw 快速参考

## 🌐 生产环境

**服务器地址**: https://coldawlab-production.up.railway.app

## 🎛️ VST 插件

### 服务器配置
- ✅ **固定 URL**: `https://coldawlab-production.up.railway.app`
- ✅ **位置**: `vst-plugin/Source/PluginProcessor.cpp` 第 18 行
- ✅ **不可修改**: 用户界面中无配置选项

### 构建插件

```bash
cd vst-plugin
./build.sh
```

**⚠️ 重要**: 修改代码后必须重新编译并重启 DAW！

### 安装位置

**macOS**:
- VST3: `~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3`
- AU: `~/Library/Audio/Plug-Ins/Components/ColDaw Export.component`

**Windows**:
- VST3: `C:\Program Files\Common Files\VST3\ColDaw Export.vst3`

**Linux**:
- VST3: `~/.vst3/ColDaw Export.vst3`

## 🚀 启动项目

### 开发环境

```bash
# 快速启动（推荐）
./start.sh

# 或手动启动
cd server && npm run dev    # 后端: localhost:3001
cd client && npm run dev    # 前端: localhost:5173
```

### 生产环境

部署在 Railway: https://coldawlab-production.up.railway.app

## 📚 重要文档

| 文档 | 路径 |
|------|------|
| 项目主文档 | `README.md` |
| VST 使用指南 | `vst-plugin/README.md` |
| VST 构建指南 | `vst-plugin/BUILD_GUIDE.md` |
| Railway 部署 | `RAILWAY_DEPLOYMENT.md` |
| 开发指南 | `DEVELOPMENT.md` |
| 项目状态 | `PROJECT_FINAL_STATUS.md` |

## 🎯 快速工作流

```
1. 在 Ableton Live 中创作
   ↓
2. 保存项目 (Cmd+S)
   ↓
3. 打开 ColDaw VST 插件
   ↓
4. 登录（首次使用）
   ↓
5. 点击 "EXPORT TO ColDAW"
   ↓
6. 浏览器自动打开项目
```

## 🔧 开发者：切换到本地环境

编辑 `vst-plugin/Source/PluginProcessor.cpp`:

```cpp
// 生产环境
serverUrl = "https://coldawlab-production.up.railway.app";

// 改为本地环境
serverUrl = "http://localhost:3001";
```

然后重新编译：
```bash
cd vst-plugin
./build.sh
```

## 🐛 故障排除

### 插件连接不到服务器
1. 检查 URL 是否为 `https://coldawlab-production.up.railway.app`
2. 确认已重新编译插件
3. 确认已重启 DAW

### 修改代码无效
1. 必须运行 `./build.sh` 重新编译
2. 必须完全退出并重启 DAW
3. 检查插件文件时间戳是否更新

### 登录失败
1. 确认网络连接
2. 确认服务器在线: https://coldawlab-production.up.railway.app
3. 检查邮箱和密码是否正确

## 📊 项目结构

```
ColDaw_lab/
├── client/              # React 前端
├── server/              # Node.js 后端
├── vst-plugin/          # VST3 插件
│   ├── Source/
│   │   └── PluginProcessor.cpp  ← 服务器 URL 在这里
│   └── build.sh         # 构建脚本
├── JUCE/                # JUCE 框架
└── *.md                 # 文档
```

## 🎉 状态

✅ **生产就绪**  
✅ **VST 已配置**  
✅ **文档完整**  
✅ **代码已优化**

---

**生产 URL**: https://coldawlab-production.up.railway.app  
**更新日期**: 2025年10月7日
