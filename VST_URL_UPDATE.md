# VST 插件配置更新

📅 **更新日期**: 2025年10月7日

## ✅ 已完成的更新

### 服务器 URL 配置

**生产环境 URL**: `https://coldawlab-production.up.railway.app`

#### 代码更改

文件：`vst-plugin/Source/PluginProcessor.cpp`

```cpp
// 第 18 行左右
serverUrl = "https://coldawlab-production.up.railway.app";
```

### 关键特性

✅ **固定 URL**：硬编码在源代码中  
✅ **不可配置**：用户无法修改  
✅ **无 UI 选项**：界面中不显示服务器配置  
✅ **无环境变量**：不支持环境变量覆盖  

### 构建要求

⚠️ **必须重新编译插件才能生效！**

```bash
cd vst-plugin
./build.sh
```

编译后需要重启 DAW（如 Ableton Live）。

### 安装位置

插件会自动安装到：

**macOS**:
- VST3: `~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3`
- AU: `~/Library/Audio/Plug-Ins/Components/ColDaw Export.component`

**Windows**:
- VST3: `C:\Program Files\Common Files\VST3\ColDaw Export.vst3`

**Linux**:
- VST3: `~/.vst3/ColDaw Export.vst3`

### 使用流程

1. **编译插件**
   ```bash
   cd vst-plugin
   ./build.sh
   ```

2. **重启 DAW**
   - 完全退出 Ableton Live
   - 重新启动

3. **加载插件**
   - 在任意音轨添加 "ColDaw Export"
   - 打开插件界面

4. **登录使用**
   - 输入邮箱和密码
   - 点击 LOGIN
   - 开始导出项目

### 验证配置

插件会自动连接到：
```
https://coldawlab-production.up.railway.app
```

导出成功后，浏览器会自动打开：
```
https://coldawlab-production.up.railway.app/project/{projectId}?from=vst
```

### 开发环境配置（仅供开发者）

如需连接本地服务器进行开发：

1. 编辑 `vst-plugin/Source/PluginProcessor.cpp`：
   ```cpp
   serverUrl = "http://localhost:3001";  // 本地开发
   ```

2. 重新编译：
   ```bash
   cd vst-plugin
   ./build.sh
   ```

3. 重启 DAW

切换回生产环境时，改回：
```cpp
serverUrl = "https://coldawlab-production.up.railway.app";
```

### 已更新的文档

✅ `README.md` - 主项目文档  
✅ `vst-plugin/README.md` - VST 使用指南  
✅ `vst-plugin/BUILD_GUIDE.md` - 构建指南  
✅ `PROJECT_FINAL_STATUS.md` - 项目状态报告  

### 插件界面

```
┌──────────────────────────────────────┐
│ ColDAW                               │
│ ● NOT LOGGED IN                      │
├──────────────────────────────────────┤
│ EMAIL                                │
│ [your@email.com              ]       │
│                                      │
│ PASSWORD                             │
│ [********                    ]       │
│                                      │
│ [LOGIN]                              │
├──────────────────────────────────────┤
│ PROJECT PATH                         │
│ [~/Music/Ableton             ]       │
│                                      │
│ [SELECT FILE]                        │
│ [EXPORT TO ColDAW]                   │
│                                      │
│ ☐ AUTO-EXPORT ON SAVE               │
├──────────────────────────────────────┤
│ Status: Ready to export              │
│ PROJECT: None                        │
└──────────────────────────────────────┘
```

**注意**: 界面中没有服务器 URL 配置！

### 安全性

✅ URL 不暴露给用户  
✅ 固定连接到生产环境  
✅ 防止中间人攻击  
✅ HTTPS 加密通信  

### 总结

VST 插件现已配置为：

- 🎯 **固定连接**: `https://coldawlab-production.up.railway.app`
- 🔒 **用户不可见**: 无 UI 配置选项
- 🛡️ **安全**: 硬编码防止篡改
- ⚡ **简单**: 用户只需登录和导出

**准备好了！** 编译插件并开始使用吧！🎵
