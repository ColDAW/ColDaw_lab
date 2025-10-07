# VST 插件构建指南

## ⚠️ 重要提示

**VST 插件必须重新编译才能使更改生效！**

插件已预配置连接到 **https://codaw.app** 生产环境。

---

## 🔨 快速构建

### macOS

```bash
cd vst-plugin
./build.sh
```

或者手动构建：

```bash
cd vst-plugin
mkdir -p build
cd build
cmake .. -DJUCE_PATH=../../JUCE
cmake --build . --config Release
```

### Windows

```powershell
cd vst-plugin
mkdir build
cd build
cmake .. -DJUCE_PATH=..\..\JUCE -G "Visual Studio 17 2022"
cmake --build . --config Release
```

### Linux

```bash
cd vst-plugin

# 安装依赖（仅首次）
sudo apt-get install libasound2-dev libcurl4-openssl-dev \
    libfreetype6-dev libx11-dev libxcomposite-dev libxcursor-dev \
    libxinerama-dev libxrandr-dev libxrender-dev

mkdir -p build
cd build
cmake .. -DJUCE_PATH=../../JUCE
cmake --build . --config Release
```

---

## 📍 安装位置

构建完成后，插件会自动复制到：

### macOS
- **VST3**: `~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3`
- **AU**: `~/Library/Audio/Plug-Ins/Components/ColDaw Export.component`

### Windows
- **VST3**: `C:\Program Files\Common Files\VST3\ColDaw Export.vst3`

### Linux
- **VST3**: `~/.vst3/ColDaw Export.vst3`

---

## 🔄 应用更新

构建并安装插件后：

1. **重启 DAW**（推荐）
   ```
   完全退出 Ableton Live 或其他 DAW
   然后重新启动
   ```

2. **或重新扫描插件**
   ```
   在 DAW 设置中找到 "扫描插件" 或 "Rescan Plugins"
   ```

---

## 🛠️ 开发者配置

### 连接本地服务器（开发环境）

如果需要连接到本地开发服务器：

1. **修改服务器 URL**:
   
   编辑 `vst-plugin/Source/PluginProcessor.cpp`:
   
   ```cpp
   // 找到这一行（约第 18 行）
   serverUrl = "https://codaw.app";
   
   // 改为
   serverUrl = "http://localhost:3001";
   ```

2. **重新编译**:
   ```bash
   cd vst-plugin/build
   cmake --build . --config Release
   ```

3. **重启 DAW**

### 切换回生产环境

```cpp
// 改回生产 URL
serverUrl = "https://codaw.app";
```

然后重新编译和重启。

---

## 🐛 常见问题

### Q: 修改代码后插件行为没变化？

**A**: 必须重新编译并重启 DAW！

```bash
cd vst-plugin
./build.sh
# 然后完全退出并重启 DAW
```

### Q: DAW 找不到插件？

**A**: 检查插件是否正确安装到插件目录：

```bash
# macOS
ls ~/Library/Audio/Plug-Ins/VST3/ColDaw\ Export.vst3
ls ~/Library/Audio/Plug-Ins/Components/ColDaw\ Export.component

# 如果不存在，手动复制
cp -r build/ColDaw_Export_artefacts/Release/VST3/ColDaw\ Export.vst3 \
     ~/Library/Audio/Plug-Ins/VST3/
```

### Q: 编译失败，找不到 JUCE？

**A**: 确保 JUCE 在正确位置：

```bash
# 项目结构应该是：
ColDaw_lab/
├── JUCE/              # JUCE 框架
├── vst-plugin/        # 插件代码
├── client/
└── server/

# 如果没有 JUCE，克隆它：
cd ..
git clone https://github.com/juce-framework/JUCE.git
cd ColDaw_lab
```

### Q: 插件连接不到服务器？

**A**: 
1. 检查 `PluginProcessor.cpp` 中的 URL 是否正确
2. 确认已重新编译
3. 确认已重启 DAW
4. 检查服务器是否运行（https://codaw.app 或 localhost:3001）

---

## 📋 构建检查清单

构建新版本时的完整流程：

- [ ] 修改代码（如果需要）
- [ ] 保存所有文件
- [ ] 运行 `./build.sh` 或手动构建
- [ ] 检查构建输出没有错误
- [ ] 确认插件文件已更新（查看时间戳）
- [ ] 完全退出 DAW
- [ ] 重新启动 DAW
- [ ] 重新加载插件
- [ ] 测试功能

---

## 🎯 生产构建

发布版本前：

1. **确认生产 URL**:
   ```cpp
   serverUrl = "https://codaw.app";
   ```

2. **Release 模式构建**:
   ```bash
   cmake --build . --config Release
   ```

3. **测试所有功能**:
   - 登录
   - 自动检测项目
   - 手动选择文件
   - 导出项目
   - 自动导出模式
   - 浏览器自动打开

4. **打包分发** (可选):
   ```bash
   # macOS - 创建 DMG 或压缩包
   cd build/ColDaw_Export_artefacts/Release
   zip -r ColDaw_Export_VST3.zip VST3/
   zip -r ColDaw_Export_AU.zip AU/
   ```

---

## 📚 相关文档

- [插件使用指南](./README.md)
- [认证文档](./AUTHENTICATION.md)
- [项目主 README](../README.md)

---

## ✅ 完成！

构建成功后，您的 VST 插件已经可以：
- ✅ 连接到 https://codaw.app
- ✅ 在 Ableton Live 中使用
- ✅ 一键导出项目
- ✅ 自动打开浏览器

享受创作！🎵
