# ColDaw VST3 插件快速开始指南

## 第一步：安装 JUCE

```bash
# 进入项目根目录
cd /Users/yifan/Documents/WebD/ColDaw

# 克隆 JUCE 框架
git clone https://github.com/juce-framework/JUCE.git
```

## 第二步：构建插件

```bash
# 进入插件目录
cd vst-plugin

# 给构建脚本添加执行权限
chmod +x build.sh

# 运行构建脚本
./build.sh
```

或手动构建：

```bash
mkdir build
cd build
cmake .. -DJUCE_PATH=../../JUCE
cmake --build . --config Release
```

## 第三步：启动 ColDaw 服务

在新终端窗口中：

```bash
# 启动后端
cd /Users/yifan/Documents/WebD/ColDaw/server
npm install  # 首次运行
npm run dev
```

在另一个终端窗口中：

```bash
# 启动前端
cd /Users/yifan/Documents/WebD/ColDaw/client
npm install  # 首次运行
npm run dev
```

## 第四步：在 Ableton Live 中使用

1. 打开 Ableton Live
2. 在设置中重新扫描插件
3. 在任意音轨上添加 **ColDaw Export** 插件
4. 配置服务器地址（默认 `http://localhost:3000`）
5. 点击 "Export to ColDaw" 开始使用！

## 功能说明

### 手动导出
1. 在 Ableton Live 中保存项目
2. 打开 ColDaw Export 插件
3. 点击 "Export to ColDaw"
4. 项目将自动在浏览器中打开

### 自动导出
1. 勾选 "Auto-export on save"
2. 每次保存项目时自动上传到 ColDaw
3. 无需手动点击导出按钮

### 手动选择文件
1. 点击 "Select ALS File..."
2. 选择要上传的 .als 文件
3. 点击 "Export to ColDaw"

## 故障排除

### 插件未显示在 Ableton 中
```bash
# macOS 插件位置
~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3

# 检查插件是否存在
ls -la ~/Library/Audio/Plug-Ins/VST3/ColDaw*

# 在 Ableton Live 中重新扫描插件
# Preferences > Plug-ins > Rescan
```

### 无法连接服务器
- 确认后端正在运行：`curl http://localhost:3000/api/projects`
- 检查插件中的 Server URL 设置
- 查看防火墙设置

### 重新编译
```bash
cd /Users/yifan/Documents/WebD/ColDaw/vst-plugin
rm -rf build
./build.sh
```

## 系统要求

- macOS 10.13+ / Windows 10+ / Linux
- Xcode 12+ (macOS) / Visual Studio 2019+ (Windows) / GCC 9+ (Linux)
- CMake 3.15+
- Ableton Live 10/11/12 或其他 VST3 兼容 DAW

## 更多信息

详细文档请查看：[README.md](README.md)
