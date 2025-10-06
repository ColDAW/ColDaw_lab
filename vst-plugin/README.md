# ColDaw Export VST3 Plugin

一键将 Ableton Live 项目导出到 ColDaw 协作平台的 VST3 插件。

## 功能特性

- ✅ 一键导出 Ableton Live 项目到 ColDaw
- ✅ 自动检测当前打开的项目文件
- ✅ 自动监听项目保存并上传（可选）
- ✅ 手动选择 .als 文件上传
- ✅ 配置服务器地址、用户信息
- ✅ 导出成功后自动在浏览器中打开项目
- ✅ 实时状态反馈

## 系统要求

### 开发环境
- **C++ 编译器**: 
  - macOS: Xcode 12+ (支持 C++17)
  - Windows: Visual Studio 2019+ 或 MinGW
  - Linux: GCC 9+ 或 Clang 10+
- **CMake**: 3.15 或更高版本
- **JUCE Framework**: 7.0+ (需要单独下载)

### 运行环境
- **DAW**: Ableton Live 10/11/12 或其他支持 VST3 的 DAW
- **ColDaw 服务器**: 需要运行 ColDaw 后端服务

## 安装 JUCE 框架

```bash
# 克隆 JUCE 到项目父目录
cd /Users/yifan/Documents/WebD/ColDaw
git clone https://github.com/juce-framework/JUCE.git

# 或下载特定版本
# https://github.com/juce-framework/JUCE/releases
```

## 构建步骤

### macOS

```bash
cd /Users/yifan/Documents/WebD/ColDaw/vst-plugin

# 创建构建目录
mkdir build
cd build

# 配置 CMake (指定 JUCE 路径)
cmake .. -DJUCE_PATH=../../JUCE

# 编译
cmake --build . --config Release

# 插件将自动复制到:
# VST3: ~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3
# AU: ~/Library/Audio/Plug-Ins/Components/ColDaw Export.component
```

### Windows

```powershell
cd C:\path\to\ColDaw\vst-plugin

# 创建构建目录
mkdir build
cd build

# 配置 CMake
cmake .. -DJUCE_PATH=..\..\JUCE -G "Visual Studio 17 2022"

# 编译
cmake --build . --config Release

# 插件位置:
# VST3: C:\Program Files\Common Files\VST3\ColDaw Export.vst3
```

### Linux

```bash
cd /path/to/ColDaw/vst-plugin

# 安装依赖
sudo apt-get install libasound2-dev libcurl4-openssl-dev \
    libfreetype6-dev libx11-dev libxcomposite-dev libxcursor-dev \
    libxinerama-dev libxrandr-dev libxrender-dev

# 创建构建目录
mkdir build
cd build

# 配置并编译
cmake .. -DJUCE_PATH=../../JUCE
cmake --build . --config Release

# 插件位置:
# VST3: ~/.vst3/ColDaw Export.vst3
```

## 使用方法

### 1. 启动 ColDaw 服务器

```bash
# 启动后端
cd /Users/yifan/Documents/WebD/ColDaw/server
npm run dev

# 启动前端
cd /Users/yifan/Documents/WebD/ColDaw/client
npm run dev
```

### 2. 在 Ableton Live 中加载插件

1. 打开 Ableton Live
2. 在任意音轨上添加 "ColDaw Export" 插件
3. 双击打开插件界面

### 3. 配置插件

在插件界面中设置:
- **Server URL**: `http://localhost:3000` (ColDaw 后端地址)
- **User ID**: 您的用户名或邮箱
- **Author**: 作者名称

### 4. 导出项目

**方式一：手动导出**
1. 点击 "Export to ColDaw" 按钮
2. 插件会自动检测当前项目并上传
3. 成功后自动在浏览器中打开项目

**方式二：自动导出**
1. 勾选 "Auto-export on save"
2. 每次保存项目时自动上传到 ColDaw

**方式三：选择文件**
1. 点击 "Select ALS File..." 
2. 选择要上传的 .als 文件
3. 点击 "Export to ColDaw"

## 工作原理

### 文件检测
插件通过以下方式检测 Ableton 项目:
1. 扫描默认 Ableton 项目目录 (`~/Documents/Ableton/Projects`)
2. 查找最近修改的 .als 文件
3. 用户也可以手动选择文件

### 自动监听
当启用自动导出时:
1. 每 2 秒检查项目文件的修改时间
2. 检测到文件保存后等待 500ms (确保文件完全写入)
3. 自动上传到 ColDaw 服务器

### 上传流程
1. 读取 .als 文件内容
2. 构建 multipart/form-data 请求
3. POST 到 `/api/projects/init` 端点
4. 解析返回的 projectId
5. 在浏览器中打开 `http://localhost:5173/project/{projectId}`

## 插件界面

```
┌─────────────────────────────────────┐
│         ColDaw Export               │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │   Export to ColDaw           │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │   Select ALS File...         │  │
│  └──────────────────────────────┘  │
│  □ Auto-export on save             │
│                                     │
│  Status: Ready to export           │
├─────────────────────────────────────┤
│  Current Project: MyProject.als    │
│                                     │
│  Server URL:  [localhost:3000   ]  │
│  User ID:     [user@email.com   ]  │
│  Author:      [John Doe         ]  │
└─────────────────────────────────────┘
```

## 故障排除

### 插件无法加载
- 检查是否安装到正确目录
- 在 DAW 中重新扫描 VST3 插件
- 查看 DAW 日志文件

### 无法连接服务器
- 确认 ColDaw 后端正在运行 (`http://localhost:3000`)
- 检查防火墙设置
- 验证 Server URL 配置正确

### 文件检测失败
- 手动选择 .als 文件上传
- 确认项目已保存
- 检查文件路径权限

### 编译错误
- 确认 JUCE 路径正确
- 检查 C++ 编译器版本
- 安装所有必要的系统依赖

## 开发说明

### 项目结构
```
vst-plugin/
├── CMakeLists.txt          # CMake 构建配置
├── README.md               # 本文档
├── Source/
│   ├── PluginProcessor.h   # 插件处理器头文件
│   ├── PluginProcessor.cpp # 插件处理器实现
│   ├── PluginEditor.h      # GUI 编辑器头文件
│   └── PluginEditor.cpp    # GUI 编辑器实现
└── build/                  # 构建输出目录
```

### 关键类

**ColDawExportProcessor**
- 音频处理器主类
- 实现文件监听和上传逻辑
- 管理插件状态和设置

**ColDawExportEditor**
- GUI 界面类
- 处理用户交互
- 显示状态和配置选项

### API 端点

插件使用以下 ColDaw API:

```
POST /api/projects/init
Content-Type: multipart/form-data

Parameters:
- alsFile: .als 文件
- projectName: 项目名称
- author: 作者
- userId: 用户 ID

Response:
{
  "projectId": "uuid",
  "versionId": "uuid",
  "message": "Project initialized successfully"
}
```

## 未来改进

- [ ] 支持增量更新 (仅上传变更部分)
- [ ] 实时协作光标显示
- [ ] 冲突检测和合并
- [ ] 版本历史浏览
- [ ] 离线模式支持
- [ ] 压缩大文件
- [ ] 进度条显示
- [ ] 错误重试机制

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request!

## 联系方式

- GitHub: https://github.com/yourusername/coldaw
- Email: your.email@example.com
