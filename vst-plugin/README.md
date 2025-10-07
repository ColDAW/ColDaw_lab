# ColDaw Export VST3 Plugin - Complete Guide# ColDaw Export VST3 插件完整指南# ColDaw Export VST3 Plugin



One-click export VST3 plugin for uploading Ableton Live projects to the ColDaw collaboration platform.



---一键将 Ableton Live 项目导出到 ColDaw 协作平台的 VST3 插件。一键将 Ableton Live 项目导出到 ColDaw 协作平台的 VST3 插件。



## 📖 Table of Contents



- [Features](#features)---## 功能特性

- [System Requirements](#system-requirements)

- [Installation & Build](#installation--build)

- [Usage Guide](#usage-guide)

- [Architecture](#architecture)## 📖 目录- ✅ 一键导出 Ableton Live 项目到 ColDaw

- [Development & Debugging](#development--debugging)

- [Troubleshooting](#troubleshooting)- ✅ 自动检测当前打开的项目文件



---- [功能特性](#功能特性)- ✅ 自动监听项目保存并上传（可选）



## ✨ Features- [系统要求](#系统要求)- ✅ 手动选择 .als 文件上传



### Core Functionality- [安装与构建](#安装与构建)- ✅ 配置服务器地址、用户信息

- ✅ **One-Click Export**: Quickly upload Ableton Live projects to ColDaw

- ✅ **Smart Detection**: Automatically detect currently open project file- [使用指南](#使用指南)- ✅ 导出成功后自动在浏览器中打开项目

- ✅ **Auto-Monitor**: Optional auto-upload mode for every save

- ✅ **Manual Selection**: Support manual selection of any .als file- [架构说明](#架构说明)- ✅ 实时状态反馈

- ✅ **User Authentication**: Built-in login/logout functionality

- ✅ **Server Configuration**: Customizable server address- [开发与调试](#开发与调试)

- ✅ **Browser Integration**: Auto-open project in browser after successful export

- ✅ **Real-Time Feedback**: Detailed status display and error messages- [故障排除](#故障排除)## 系统要求



### User Interface

Plugin interface divided into three main areas:

---### 开发环境

1. **Login Area** (Top 240px)

   - Username/email input field- **C++ 编译器**: 

   - Password input field (masked)

   - Login/logout button## ✨ 功能特性  - macOS: Xcode 12+ (支持 C++17)

   - Login status label

  - Windows: Visual Studio 2019+ 或 MinGW

2. **Project Export Area** (Middle)

   - Current project file display### 核心功能  - Linux: GCC 9+ 或 Clang 10+

   - Export button (enabled after login)

   - Manual file selection button- ✅ **一键导出**: 将 Ableton Live 项目快速上传到 ColDaw- **CMake**: 3.15 或更高版本

   - Export status display

- ✅ **智能检测**: 自动检测当前打开的项目文件- **JUCE Framework**: 7.0+ (需要单独下载)

3. **Settings Area** (Bottom)

   - Server URL configuration- ✅ **自动监听**: 可选的自动上传模式，每次保存自动导出

   - Auto-export toggle

- ✅ **手动选择**: 支持手动选择任意 .als 文件上传### 运行环境

---

- ✅ **用户认证**: 内置登录/登出功能- **DAW**: Ableton Live 10/11/12 或其他支持 VST3 的 DAW

## 🔧 System Requirements

- ✅ **服务器配置**: 可自定义服务器地址- **ColDaw 服务器**: 需要运行 ColDaw 后端服务

### Development Environment

- **C++ Compiler**: - ✅ **浏览器集成**: 导出成功后自动在浏览器中打开项目

  - macOS: Xcode 12+ (C++17 support)

  - Windows: Visual Studio 2019+ or MinGW- ✅ **实时反馈**: 详细的状态显示和错误提示## 安装 JUCE 框架

  - Linux: GCC 9+ or Clang 10+

- **CMake**: 3.15 or higher

- **JUCE Framework**: 7.0+ (requires separate download)

### 用户界面```bash

### Runtime Environment

- **DAW**: Ableton Live 10/11/12 or other VST3-compatible DAW插件界面分为三个主要区域：# 克隆 JUCE 到项目父目录

- **ColDaw Server**: Running ColDaw backend service (local or remote)

cd /Users/yifan/Documents/WebD/ColDaw

---

1. **登录区域**（顶部 240px）git clone https://github.com/juce-framework/JUCE.git

## 🚀 Installation & Build

   - 用户名/邮箱输入框

### Step 1: Install JUCE Framework

   - 密码输入框（加密显示）# 或下载特定版本

JUCE is the C++ framework required for building VST plugins.

   - 登录/登出按钮# https://github.com/juce-framework/JUCE/releases

```bash

# Clone JUCE to project parent directory   - 登录状态标签```

cd /Users/yifan/Documents/WebD/ColDaw_lab

git clone https://github.com/juce-framework/JUCE.git



# Or download specific version2. **项目导出区域**（中间）## 构建步骤

# https://github.com/juce-framework/JUCE/releases

```   - 当前项目文件显示



**Directory structure should be:**   - 导出按钮（需登录后启用）### macOS

```

ColDaw_lab/   - 手动选择文件按钮

├── JUCE/              # JUCE framework

├── vst-plugin/        # VST plugin source   - 导出状态显示```bash

├── client/            # Web frontend

└── server/            # Backend servercd /Users/yifan/Documents/WebD/ColDaw/vst-plugin

```

3. **设置区域**（底部）

### Step 2: Build Plugin

   - 服务器 URL 配置# 创建构建目录

#### macOS Build

   - 自动导出开关mkdir build

Using the provided build script (recommended):

cd build

```bash

cd vst-plugin---

./build.sh

```# 配置 CMake (指定 JUCE 路径)



Or manual build:## 🔧 系统要求cmake .. -DJUCE_PATH=../../JUCE



```bash

cd vst-plugin

mkdir -p build### 开发环境# 编译

cd build

- **C++ 编译器**: cmake --build . --config Release

# Configure CMake (specify JUCE path)

cmake .. -DJUCE_PATH=../../JUCE  - macOS: Xcode 12+ (支持 C++17)



# Compile  - Windows: Visual Studio 2019+ 或 MinGW# 插件将自动复制到:

cmake --build . --config Release

```  - Linux: GCC 9+ 或 Clang 10+# VST3: ~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3



**Build artifacts location:**- **CMake**: 3.15 或更高版本# AU: ~/Library/Audio/Plug-Ins/Components/ColDaw Export.component

- VST3: `~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3`

- AU: `~/Library/Audio/Plug-Ins/Components/ColDaw Export.component`- **JUCE Framework**: 7.0+ (需要单独下载)```

- Standalone: `build/ColDaw Export_artefacts/Release/Standalone/ColDaw Export.app`



#### Windows Build

### 运行环境### Windows

```powershell

cd vst-plugin- **DAW**: Ableton Live 10/11/12 或其他支持 VST3 的 DAW

mkdir build

cd build- **ColDaw 服务器**: 需要运行 ColDaw 后端服务（本地或远程）```powershell



# Configure CMake (using Visual Studio 2022)cd C:\path\to\ColDaw\vst-plugin

cmake .. -DJUCE_PATH=..\..\JUCE -G "Visual Studio 17 2022"

---

# Compile

cmake --build . --config Release# 创建构建目录

```

## 🚀 安装与构建mkdir build

**Build artifacts location:**

- VST3: `C:\Program Files\Common Files\VST3\ColDaw Export.vst3`cd build

- Standalone: `build\ColDaw Export_artefacts\Release\Standalone\ColDaw Export.exe`

### 步骤 1: 安装 JUCE 框架

#### Linux Build

# 配置 CMake

```bash

cd vst-pluginJUCE 是构建 VST 插件所需的 C++ 框架。cmake .. -DJUCE_PATH=..\..\JUCE -G "Visual Studio 17 2022"



# Install dependencies (first time only)

sudo apt-get install libasound2-dev libcurl4-openssl-dev \

    libfreetype6-dev libx11-dev libxcomposite-dev libxcursor-dev \```bash# 编译

    libxinerama-dev libxrandr-dev libxrender-dev

# 克隆 JUCE 到项目父目录cmake --build . --config Release

# Create build directory

mkdir -p buildcd /Users/yifan/Documents/WebD/ColDaw_lab

cd build

git clone https://github.com/juce-framework/JUCE.git# 插件位置:

# Configure and compile

cmake .. -DJUCE_PATH=../../JUCE# VST3: C:\Program Files\Common Files\VST3\ColDaw Export.vst3

cmake --build . --config Release

```# 或下载特定版本```



**Build artifacts location:**# https://github.com/juce-framework/JUCE/releases

- VST3: `~/.vst3/ColDaw Export.vst3`

- Standalone: `build/ColDaw Export_artefacts/Release/Standalone/ColDaw Export````### Linux



### Step 3: Verify Installation



#### Verify Plugin Location**目录结构应该是：**```bash



**macOS**:```cd /path/to/ColDaw/vst-plugin

```bash

ls -la ~/Library/Audio/Plug-Ins/VST3/ | grep ColDawColDaw_lab/

```

├── JUCE/              # JUCE 框架# 安装依赖

**Windows**:

```powershell├── vst-plugin/        # VST 插件源码sudo apt-get install libasound2-dev libcurl4-openssl-dev \

dir "C:\Program Files\Common Files\VST3\" | findstr ColDaw

```├── client/            # Web 前端    libfreetype6-dev libx11-dev libxcomposite-dev libxcursor-dev \



**Linux**:└── server/            # 后端服务器    libxinerama-dev libxrandr-dev libxrender-dev

```bash

ls -la ~/.vst3/ | grep ColDaw```

```

# 创建构建目录

#### Test in DAW

### 步骤 2: 构建插件mkdir build

1. Launch Ableton Live (or other DAW)

2. Refresh plugin list (if needed)cd build

3. Add "ColDaw Export" plugin to any track

4. Verify plugin interface displays correctly#### macOS 构建



---# 配置并编译



## 📱 Usage Guide使用提供的构建脚本（推荐）：cmake .. -DJUCE_PATH=../../JUCE



### First-Time Setupcmake --build . --config Release



#### 1. Start ColDaw Server```bash



**Local Development**:cd vst-plugin# 插件位置:

```bash

cd ColDaw_lab./build.sh# VST3: ~/.vst3/ColDaw Export.vst3

./start.sh

`````````



Server will run at `http://localhost:3001`.



**Production Environment**:或手动构建：## 使用方法

Plugin is pre-configured to connect to: `https://coldawlab-production.up.railway.app`



#### 2. Load Plugin in Ableton Live

```bash### 1. 构建和安装插件

1. Open Ableton Live

2. Add effect to any trackcd vst-plugin

3. Select "Audio Effects" → "ColDaw Export"

4. Plugin interface will appearmkdir -p build**⚠️ 重要**: 修改代码后必须重新编译插件才能生效！



#### 3. Login to ColDawcd build



In plugin's top login area:```bash



1. Enter **Email**: `demo@coldaw.com`# 配置 CMake（指定 JUCE 路径）cd vst-plugin

2. Enter **Password**: `demo123`

3. Click **"Login"** buttoncmake .. -DJUCE_PATH=../../JUCE./build.sh  # 或参考下方的构建步骤

4. Wait for login status to show "✓ Logged in as: demo@coldaw.com"

```

**Demo Accounts:**

# 编译

| Email | Password |

|-------|----------|cmake --build . --config Release插件会自动安装到：

| `demo@coldaw.com` | `demo123` |

| `test@coldaw.com` | `test123` |```- **macOS VST3**: `~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3`



### Export Projects- **macOS AU**: `~/Library/Audio/Plug-Ins/Components/ColDaw Export.component`



#### Method 1: One-Click Export Current Project (Recommended)**构建产物位置：**



1. Ensure you are logged in- VST3: `~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3`安装后需要**重启 DAW** 或重新扫描插件。

2. Open or save a project in Ableton Live

3. Click **"Export Current Project"** button in plugin- AU: `~/Library/Audio/Plug-Ins/Components/ColDaw Export.component`

4. Plugin will:

   - Automatically detect currently open .als file- Standalone: `build/ColDaw Export_artefacts/Release/Standalone/ColDaw Export.app`### 2. 在 Ableton Live 中加载插件

   - Upload to ColDaw server

   - Auto-open project page in browser



#### Method 2: Manual File Selection#### Windows 构建1. 打开 Ableton Live



1. Ensure you are logged in2. 在任意音轨上添加 "ColDaw Export" 插件

2. Click **"Choose .als File"** button

3. Select .als file in file browser```powershell3. 双击打开插件界面

4. File will upload immediately

cd vst-plugin

#### Method 3: Auto-Export Mode

mkdir build### 3. 登录和使用

1. Ensure you are logged in

2. Check **"Auto Export on Save"** in settings areacd build

3. Every time you save project in Ableton Live, plugin auto-uploads

4. No need to manually click export button插件已预配置连接到 **https://www.coldaw.app**（生产环境）。



### Configure Server Address# 配置 CMake（使用 Visual Studio 2022）



#### Connect to Local Development Servercmake .. -DJUCE_PATH=..\..\JUCE -G "Visual Studio 17 2022"#### 使用步骤：



1. In plugin bottom "Server URL" input field, enter:

   ```

   http://localhost:3001# 编译1. **登录账户**：

   ```

2. Re-logincmake --build . --config Release   - 输入邮箱和密码

3. Plugin now connects to local server

```   - 点击 "LOGIN" 按钮

#### Connect to Production Server (Default)

   

Plugin default configuration:

```**构建产物位置：**2. **配置项目路径**（可选）：

https://coldawlab-production.up.railway.app

```- VST3: `C:\Program Files\Common Files\VST3\ColDaw Export.vst3`   - 默认路径: `~/Music/Ableton`



⚠️ **Important**: To permanently change default server address, must modify source code and recompile plugin.- Standalone: `build\ColDaw Export_artefacts\Release\Standalone\ColDaw Export.exe`   - 可以自定义 Ableton 项目的默认路径



### Logout



Click **"Logout"** button to sign out of current account.#### Linux 构建3. **开始导出**：



---   - 插件会自动检测最近保存的项目



## 🏗️ Architecture```bash   - 或手动选择 .als 文件



### Plugin Architecture Diagramcd vst-plugin   - 点击 "EXPORT TO ColDAW"



```

┌─────────────────────────────────────────────────────────────┐

│                     Ableton Live                             │# 安装依赖（仅首次）#### 开发环境配置（仅供开发者）：

│  ┌────────────────────────────────────────────────────┐     │

│  │           ColDaw Export Plugin (VST3)              │     │sudo apt-get install libasound2-dev libcurl4-openssl-dev \

│  │                                                     │     │

│  │  ┌──────────────┐         ┌──────────────┐        │     │    libfreetype6-dev libx11-dev libxcomposite-dev libxcursor-dev \如果你是开发者，需要连接到本地服务器：

│  │  │ GUI Editor   │◄────────┤ Processor    │        │     │

│  │  │              │         │              │        │     │    libxinerama-dev libxrandr-dev libxrender-dev

│  │  │ - Login UI   │         │ - File detect│        │     │

│  │  │ - Export btn │         │ - File watch │        │     │1. 在 `PluginProcessor.cpp` 中修改服务器 URL：

│  │  │ - Settings   │         │ - HTTP upload│        │     │

│  │  │ - Status     │         │ - Auth mgmt  │        │     │# 创建构建目录   ```cpp

│  │  └──────────────┘         └──────┬───────┘        │     │

│  │                                   │                │     │mkdir -p build   serverUrl = "http://localhost:3001";  // 开发环境

│  └───────────────────────────────────┼────────────────┘     │

│                                      │                      │cd build   ```

└──────────────────────────────────────┼──────────────────────┘

                                       │

                                       │ HTTP POST (multipart/form-data)

                                       │# 配置并编译2. 重新编译插件：

                                       ▼

                    ┌──────────────────────────────────┐cmake .. -DJUCE_PATH=../../JUCE   ```bash

                    │     ColDaw Server (Node.js)      │

                    │                                  │cmake --build . --config Release   cd vst-plugin

                    │  POST /api/auth/login            │

                    │  - Verify user credentials       │```   ./build.sh

                    │  - Return auth token             │

                    │                                  │   ```

                    │  POST /api/projects/init         │

                    │  - Receive .als file             │**构建产物位置：**

                    │  - Parse project data            │

                    │  - Store to PostgreSQL           │- VST3: `~/.vst3/ColDaw Export.vst3`3. 重启 DAW

                    │  - Return projectId              │

                    └──────────────────┬───────────────┘- Standalone: `build/ColDaw Export_artefacts/Release/Standalone/ColDaw Export`

                                       │

                                       ▼### 4. 导出项目

                    ┌──────────────────────────────────┐

                    │   ColDaw Web Client (React)      │### 步骤 3: 验证安装

                    │                                  │

                    │  /project/{projectId}            │**方式一：手动导出**

                    │  - Display project details       │

                    │  - Real-time collab editing      │#### 验证插件位置1. 点击 "Export to ColDaw" 按钮

                    │  - Version history               │

                    └──────────────────────────────────┘2. 插件会自动检测当前项目并上传

```

**macOS**:3. 成功后自动在浏览器中打开项目

### Core Components

```bash

#### 1. PluginProcessor (`PluginProcessor.cpp`)

ls -la ~/Library/Audio/Plug-Ins/VST3/ | grep ColDaw**方式二：自动导出**

**Responsibilities:**

- Audio processing (no-op, VST framework only)```1. 勾选 "Auto-export on save"

- File system interaction (detect and monitor .als files)

- HTTP client (upload files to server)2. 每次保存项目时自动上传到 ColDaw

- Authentication management (store and verify tokens)

- State management (login state, export state)**Windows**:



**Key Methods:**```powershell**方式三：选择文件**

```cpp

void uploadProject(const juce::File& alsFile)  // Upload project filedir "C:\Program Files\Common Files\VST3\" | findstr ColDaw1. 点击 "Select ALS File..." 

void loginUser(String email, String password) // User login

void logoutUser()                              // User logout```2. 选择要上传的 .als 文件

void checkForProjectChanges()                  // Monitor file changes

```3. 点击 "Export to ColDaw"



#### 2. PluginEditor (`PluginEditor.cpp`)**Linux**:



**Responsibilities:**```bash## 工作原理

- User interface rendering

- User input handlingls -la ~/.vst3/ | grep ColDaw

- Status display updates

```### 文件检测

**UI Components:**

```cpp插件通过以下方式检测 Ableton 项目:

juce::TextEditor usernameEditor;    // Username input

juce::TextEditor passwordEditor;    // Password input (masked)#### 在 DAW 中测试1. 扫描默认 Ableton 项目目录 (`~/Documents/Ableton/Projects`)

juce::TextButton loginButton;       // Login button

juce::TextButton exportButton;      // Export button2. 查找最近修改的 .als 文件

juce::TextButton chooseFileButton;  // Choose file button

juce::Label statusLabel;            // Status label1. 启动 Ableton Live（或其他 DAW）3. 用户也可以手动选择文件

juce::TextEditor serverUrlEditor;   // Server URL input

juce::ToggleButton autoExportToggle;// Auto-export toggle2. 刷新插件列表（如需要）

```

3. 在任意轨道上添加 "ColDaw Export" 插件### 自动监听

### File Detection Logic

4. 验证插件界面正常显示当启用自动导出时:

Plugin uses following strategy to detect currently open Ableton Live project:

1. 每 2 秒检查项目文件的修改时间

1. **Recently Modified Files**: Check recently modified .als files in Ableton Live project directory

2. **File Monitoring**: Check file modification timestamp every 2 seconds---2. 检测到文件保存后等待 500ms (确保文件完全写入)

3. **Auto-Upload**: If auto-export enabled and file changed, auto-upload

3. 自动上传到 ColDaw 服务器

**Project Detection Path (macOS):**

```## 📱 使用指南

~/Music/Ableton/User Library/

```### 上传流程



### HTTP Communication### 首次使用设置1. 读取 .als 文件内容



#### Login Request2. 构建 multipart/form-data 请求



```http#### 1. 启动 ColDaw 服务器3. POST 到 `/api/projects/init` 端点

POST /api/auth/login

Content-Type: application/json4. 解析返回的 projectId



{**本地开发**:5. 在浏览器中打开 `http://localhost:5173/project/{projectId}`

  "email": "demo@coldaw.com",

  "password": "demo123"```bash

}

```cd ColDaw_lab## 插件界面



**Response:**./start.sh

```json

{``````

  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

  "user": {┌─────────────────────────────────────┐

    "id": "user-1",

    "email": "demo@coldaw.com",服务器将在 `http://localhost:3001` 运行。│         ColDaw Export               │

    "username": "Demo User"

  }├─────────────────────────────────────┤

}

```**生产环境**:│  ┌──────────────────────────────┐  │



#### Project Upload Request插件已预配置连接到：`https://coldawlab-production.up.railway.app`│  │   Export to ColDaw           │  │



```http│  └──────────────────────────────┘  │

POST /api/projects/init

Authorization: Bearer <token>#### 2. 在 Ableton Live 中加载插件│  ┌──────────────────────────────┐  │

Content-Type: multipart/form-data

│  │   Select ALS File...         │  │

{

  "file": <binary .als file>,1. 打开 Ableton Live│  └──────────────────────────────┘  │

  "projectName": "My Project"

}2. 在任意轨道上添加效果器│  □ Auto-export on save             │

```

3. 选择 "Audio Effects" → "ColDaw Export"│                                     │

**Response:**

```json4. 插件界面将显示│  Status: Ready to export           │

{

  "projectId": "proj-123",├─────────────────────────────────────┤

  "projectName": "My Project",

  "url": "https://coldawlab-production.up.railway.app/project/proj-123"#### 3. 登录到 ColDaw│  Current Project: MyProject.als    │

}

```│                                     │



---在插件顶部的登录区域：│  Server URL:  [localhost:3000   ]  │



## 🔬 Development & Debugging│  User ID:     [user@email.com   ]  │



### Development Environment Setup1. 输入**邮箱**：`demo@coldaw.com`│  Author:      [John Doe         ]  │



#### 1. IDE Configuration2. 输入**密码**：`demo123`└─────────────────────────────────────┘



**Xcode (macOS)**:3. 点击 **"Login"** 按钮```

```bash

cd vst-plugin/build4. 等待登录状态显示 "✓ Logged in as: demo@coldaw.com"

cmake .. -DJUCE_PATH=../../JUCE -G Xcode

open ColDaw\ Export.xcodeproj## 故障排除

```

**演示账户：**

**Visual Studio (Windows)**:

```powershell### 插件无法加载

cd vst-plugin\build

cmake .. -DJUCE_PATH=..\..\JUCE -G "Visual Studio 17 2022"| 邮箱 | 密码 |- 检查是否安装到正确目录

start ColDaw Export.sln

```|------|------|- 在 DAW 中重新扫描 VST3 插件



#### 2. Debug Configuration| `demo@coldaw.com` | `demo123` |- 查看 DAW 日志文件



Set debug target in IDE to Ableton Live or standalone app:| `test@coldaw.com` | `test123` |



**macOS Xcode**:### 无法连接服务器

- Product → Scheme → Edit Scheme

- Run → Executable: `/Applications/Ableton Live 11 Suite.app`### 导出项目- 确认 ColDaw 后端正在运行 (`http://localhost:3000`)

- Or use Standalone version for quick testing

- 检查防火墙设置

**Windows Visual Studio**:

- Debug → Properties → Debugging#### 方法 1: 一键导出当前项目（推荐）- 验证 Server URL 配置正确

- Command: `C:\ProgramData\Ableton\Live 11 Suite\Program\Ableton Live 11 Suite.exe`



### Debug Logging

1. 确保已登录### 文件检测失败

Add debug output in code:

2. 在 Ableton Live 中打开或保存一个项目- 手动选择 .als 文件上传

```cpp

DBG("Upload started for file: " + alsFile.getFullPathName());3. 点击插件中的 **"Export Current Project"** 按钮- 确认项目已保存

DBG("Server response: " + responseString);

```4. 插件会：- 检查文件路径权限



View log output:   - 自动检测当前打开的 .als 文件

- **Xcode**: Debug Navigator → Console

- **Visual Studio**: Output Window   - 上传到 ColDaw 服务器### 编译错误

- **Standalone**: Terminal/console output

   - 在浏览器中自动打开项目页面- 确认 JUCE 路径正确

### Common Development Tasks

- 检查 C++ 编译器版本

#### Modify Default Server Address

#### 方法 2: 手动选择文件- 安装所有必要的系统依赖

Edit `Source/PluginProcessor.cpp`:



```cpp

// Find this line:1. 确保已登录## 开发说明

serverUrl = "https://coldawlab-production.up.railway.app";

2. 点击 **"Choose .als File"** 按钮

// Change to:

serverUrl = "http://localhost:3001";3. 在文件浏览器中选择 .als 文件### 项目结构

```

4. 文件将立即上传```

Then recompile.

vst-plugin/

#### Modify UI Styling

#### 方法 3: 自动导出模式├── CMakeLists.txt          # CMake 构建配置

Edit `paint()` method in `Source/PluginEditor.cpp`:

├── README.md               # 本文档

```cpp

void ColDawExportAudioProcessorEditor::paint(juce::Graphics& g)1. 确保已登录├── Source/

{

    g.fillAll(juce::Colour(0xff1a1a1a));  // Background color2. 在设置区域勾选 **"Auto Export on Save"**│   ├── PluginProcessor.h   # 插件处理器头文件

    // ... more styling code

}3. 每次在 Ableton Live 中保存项目时，插件会自动上传│   ├── PluginProcessor.cpp # 插件处理器实现

```

4. 无需手动点击导出按钮│   ├── PluginEditor.h      # GUI 编辑器头文件

#### Add New Feature Button

│   └── PluginEditor.cpp    # GUI 编辑器实现

1. Declare button in `PluginEditor.h`:

```cpp### 配置服务器地址└── build/                  # 构建输出目录

juce::TextButton myNewButton;

``````



2. Initialize in `PluginEditor.cpp` constructor:#### 连接到本地开发服务器

```cpp

addAndMakeVisible(myNewButton);### 关键类

myNewButton.setButtonText("My Button");

myNewButton.onClick = [this] { handleMyButton(); };1. 在插件底部的 "Server URL" 输入框中输入：

```

   ```**ColDawExportProcessor**

3. Set position in `resized()`:

```cpp   http://localhost:3001- 音频处理器主类

myNewButton.setBounds(20, 300, 360, 40);

```   ```- 实现文件监听和上传逻辑



---2. 重新登录- 管理插件状态和设置



## 🐛 Troubleshooting3. 现在插件将连接到本地服务器



### Common Issues**ColDawExportEditor**



#### 1. Plugin Not Showing in DAW#### 连接到生产服务器（默认）- GUI 界面类



**Solutions:**- 处理用户交互

- Confirm plugin successfully copied to correct directory

- Restart DAW插件默认配置为：- 显示状态和配置选项

- Manually scan plugin directory in DAW

- Check plugin file permissions```



**macOS Additional Steps:**https://coldawlab-production.up.railway.app### API 端点

```bash

# Remove quarantine attribute```

xattr -dr com.apple.quarantine ~/Library/Audio/Plug-Ins/VST3/ColDaw\ Export.vst3

```插件使用以下 ColDaw API:



#### 2. Login Failure⚠️ **重要提示**: 如果需要永久更改默认服务器地址，必须修改源码并重新编译插件。



**Possible Causes:**```

- Server not running

- Server address configuration error### 登出POST /api/projects/init

- Network connection issue

- Incorrect credentialsContent-Type: multipart/form-data



**Solution Steps:**点击 **"Logout"** 按钮即可退出当前账户。

1. Check if server running: visit `http://localhost:3001` or production URL

2. Verify server address configurationParameters:

3. Check firewall settings

4. Use demo account: `demo@coldaw.com` / `demo123`---- alsFile: .als 文件



#### 3. File Upload Failure- projectName: 项目名称



**Possible Causes:**## 🏗️ 架构说明- author: 作者

- Not logged in

- .als file corrupted- userId: 用户 ID

- File too large

- Server storage space insufficient### 插件架构图



**Solution Steps:**Response:

1. Confirm successful login

2. Re-save project in Ableton Live```{

3. Check file size (recommend < 100MB)

4. View plugin status message for detailed error┌─────────────────────────────────────────────────────────────┐  "projectId": "uuid",



#### 4. Auto-Export Not Working│                     Ableton Live                             │  "versionId": "uuid",



**Possible Causes:**│  ┌────────────────────────────────────────────────────┐     │  "message": "Project initialized successfully"

- "Auto Export on Save" not checked

- File path detection error│  │           ColDaw Export Plugin (VST3)              │     │}

- Permission issue

│  │                                                     │     │```

**Solution Steps:**

1. Confirm auto-export toggle checked│  │  ┌──────────────┐         ┌──────────────┐        │     │

2. Manually save project to trigger detection

3. Check macOS file access permissions│  │  │ GUI Editor   │◄────────┤ Processor    │        │     │## 未来改进

4. Try manual file selection to rule out path issues

│  │  │              │         │              │        │     │

#### 5. Compilation Errors

│  │  │ - 登录界面   │         │ - 文件检测    │        │     │- [ ] 支持增量更新 (仅上传变更部分)

**JUCE Path Not Found:**

```bash│  │  │ - 导出按钮   │         │ - 文件监听    │        │     │- [ ] 实时协作光标显示

CMake Error: Could not find JUCE

```│  │  │ - 设置界面   │         │ - HTTP 上传   │        │     │- [ ] 冲突检测和合并



**Solution:**│  │  │ - 状态显示   │         │ - 认证管理    │        │     │- [ ] 版本历史浏览

```bash

# Ensure JUCE in correct location│  │  └──────────────┘         └──────┬───────┘        │     │- [ ] 离线模式支持

ls ../JUCE

│  │                                   │                │     │- [ ] 压缩大文件

# Or explicitly specify path

cmake .. -DJUCE_PATH=/path/to/JUCE│  └───────────────────────────────────┼────────────────┘     │- [ ] 进度条显示

```

│                                      │                      │- [ ] 错误重试机制

**C++ Version Not Supported:**

```└──────────────────────────────────────┼──────────────────────┘

error: C++17 features required

```                                       │## 许可证



**Solution:**                                       │ HTTP POST (multipart/form-data)

- macOS: Update Xcode Command Line Tools

- Windows: Use Visual Studio 2019+                                       │MIT License

- Linux: Update GCC to 9+

                                       ▼

### Getting Help

                    ┌──────────────────────────────────┐## 贡献

If issue still unresolved:

                    │     ColDaw Server (Node.js)      │

1. **Check Logs**: Inspect DAW console output and plugin status messages

2. **Test Standalone Version**: Use standalone version to rule out DAW-related issues                    │                                  │欢迎提交 Issue 和 Pull Request!

3. **Check Server**: Directly test server API endpoints

4. **Submit Issue**: Create Issue in GitHub repo, including:                    │  POST /api/auth/login            │

   - System info (OS, DAW version)

   - Error messages and logs                    │  - 验证用户凭据                   │## 联系方式

   - Reproduction steps

                    │  - 返回认证 Token                │

---

                    │                                  │- GitHub: https://github.com/yourusername/coldaw

## 📚 Related Documentation

                    │  POST /api/projects/init         │- Email: your.email@example.com

- [ColDaw Main Documentation](../README.md) - Complete project documentation

- [CMakeLists.txt](CMakeLists.txt) - Build configuration                    │  - 接收 .als 文件                 │

- [build.sh](build.sh) - Build script                    │  - 解析项目数据                   │

                    │  - 存储到 PostgreSQL             │

---                    │  - 返回 projectId                │

                    └──────────────────┬───────────────┘

## 🔄 Changelog                                       │

                                       ▼

### v1.0.0 (Current)                    ┌──────────────────────────────────┐

- ✅ Basic export functionality                    │   ColDaw Web Client (React)      │

- ✅ User authentication system                    │                                  │

- ✅ Auto file detection                    │  /project/{projectId}            │

- ✅ Auto-export mode                    │  - 显示项目详情                   │

- ✅ Server configuration                    │  - 实时协作编辑                   │

- ✅ Browser integration                    │  - 版本历史                      │

                    └──────────────────────────────────┘

### Planned Features```

- [ ] Project metadata editing

- [ ] Batch upload### 核心组件

- [ ] Upload progress display

- [ ] Offline queue#### 1. PluginProcessor (`PluginProcessor.cpp`)

- [ ] Multi-server configuration

**职责：**

---- 音频处理（空操作，仅用于 VST 框架）

- 文件系统交互（检测和监听 .als 文件）

**Enjoy using ColDaw Export plugin!** 🎵🚀- HTTP 客户端（上传文件到服务器）

- 认证管理（存储和验证 Token）
- 状态管理（登录状态、导出状态）

**关键方法：**
```cpp
void uploadProject(const juce::File& alsFile)  // 上传项目文件
void loginUser(String email, String password) // 用户登录
void logoutUser()                              // 用户登出
void checkForProjectChanges()                  // 监听文件变化
```

#### 2. PluginEditor (`PluginEditor.cpp`)

**职责：**
- 用户界面渲染
- 用户输入处理
- 状态显示更新

**UI 组件：**
```cpp
juce::TextEditor usernameEditor;    // 用户名输入框
juce::TextEditor passwordEditor;    // 密码输入框
juce::TextButton loginButton;       // 登录按钮
juce::TextButton exportButton;      // 导出按钮
juce::TextButton chooseFileButton;  // 选择文件按钮
juce::Label statusLabel;            // 状态标签
juce::TextEditor serverUrlEditor;   // 服务器地址输入框
juce::ToggleButton autoExportToggle;// 自动导出开关
```

### 文件检测逻辑

插件使用以下策略检测当前打开的 Ableton Live 项目：

1. **最近修改的文件**: 检查 Ableton Live 项目目录中最近修改的 .als 文件
2. **文件监听**: 每 2 秒检查文件修改时间戳
3. **自动上传**: 如果启用自动导出且文件已更改，则自动上传

**项目检测路径（macOS）：**
```
~/Music/Ableton/User Library/
```

### HTTP 通信

#### 登录请求

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "demo@coldaw.com",
  "password": "demo123"
}
```

**响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1",
    "email": "demo@coldaw.com",
    "username": "Demo User"
  }
}
```

#### 项目上传请求

```http
POST /api/projects/init
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <binary .als file>,
  "projectName": "My Project"
}
```

**响应：**
```json
{
  "projectId": "proj-123",
  "projectName": "My Project",
  "url": "https://coldawlab-production.up.railway.app/project/proj-123"
}
```

---

## 🔬 开发与调试

### 开发环境设置

#### 1. IDE 配置

**Xcode (macOS)**:
```bash
cd vst-plugin/build
cmake .. -DJUCE_PATH=../../JUCE -G Xcode
open ColDaw\ Export.xcodeproj
```

**Visual Studio (Windows)**:
```powershell
cd vst-plugin\build
cmake .. -DJUCE_PATH=..\..\JUCE -G "Visual Studio 17 2022"
start ColDaw Export.sln
```

#### 2. 调试配置

在 IDE 中设置调试目标为 Ableton Live 或独立应用程序：

**macOS Xcode**:
- Product → Scheme → Edit Scheme
- Run → Executable: `/Applications/Ableton Live 11 Suite.app`
- 或使用 Standalone 版本进行快速测试

**Windows Visual Studio**:
- Debug → Properties → Debugging
- Command: `C:\ProgramData\Ableton\Live 11 Suite\Program\Ableton Live 11 Suite.exe`

### 日志调试

在代码中添加调试输出：

```cpp
DBG("Upload started for file: " + alsFile.getFullPathName());
DBG("Server response: " + responseString);
```

查看日志输出：
- **Xcode**: Debug Navigator → Console
- **Visual Studio**: Output Window
- **Standalone**: 终端/控制台输出

### 常见开发任务

#### 修改默认服务器地址

编辑 `Source/PluginProcessor.cpp`：

```cpp
// 查找这一行：
serverUrl = "https://coldawlab-production.up.railway.app";

// 修改为：
serverUrl = "http://localhost:3001";
```

然后重新编译。

#### 修改 UI 样式

编辑 `Source/PluginEditor.cpp` 中的 `paint()` 方法：

```cpp
void ColDawExportAudioProcessorEditor::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colour(0xff1a1a1a));  // 背景颜色
    // ... 更多样式代码
}
```

#### 添加新功能按钮

1. 在 `PluginEditor.h` 中声明按钮：
```cpp
juce::TextButton myNewButton;
```

2. 在 `PluginEditor.cpp` 构造函数中初始化：
```cpp
addAndMakeVisible(myNewButton);
myNewButton.setButtonText("My Button");
myNewButton.onClick = [this] { handleMyButton(); };
```

3. 在 `resized()` 中设置位置：
```cpp
myNewButton.setBounds(20, 300, 360, 40);
```

---

## 🐛 故障排除

### 常见问题

#### 1. 插件未在 DAW 中显示

**解决方案：**
- 确认插件已成功复制到正确的目录
- 重启 DAW
- 在 DAW 中手动扫描插件目录
- 检查插件文件权限

**macOS 额外步骤：**
```bash
# 移除隔离属性
xattr -dr com.apple.quarantine ~/Library/Audio/Plug-Ins/VST3/ColDaw\ Export.vst3
```

#### 2. 登录失败

**可能原因：**
- 服务器未运行
- 服务器地址配置错误
- 网络连接问题
- 凭据不正确

**解决步骤：**
1. 检查服务器是否运行：访问 `http://localhost:3001` 或生产 URL
2. 验证服务器地址配置
3. 检查防火墙设置
4. 使用演示账户：`demo@coldaw.com` / `demo123`

#### 3. 文件上传失败

**可能原因：**
- 未登录
- .als 文件损坏
- 文件过大
- 服务器存储空间不足

**解决步骤：**
1. 确认已成功登录
2. 在 Ableton Live 中重新保存项目
3. 检查文件大小（建议 < 100MB）
4. 查看插件状态消息获取详细错误

#### 4. 自动导出不工作

**可能原因：**
- 未勾选 "Auto Export on Save"
- 文件路径检测错误
- 权限问题

**解决步骤：**
1. 确认已勾选自动导出开关
2. 手动保存项目触发检测
3. 检查 macOS 文件访问权限
4. 尝试手动选择文件上传以排除路径问题

#### 5. 编译错误

**JUCE 路径未找到：**
```bash
CMake Error: Could not find JUCE
```

**解决方案：**
```bash
# 确保 JUCE 在正确位置
ls ../JUCE

# 或显式指定路径
cmake .. -DJUCE_PATH=/path/to/JUCE
```

**C++ 版本不支持：**
```
error: C++17 features required
```

**解决方案：**
- macOS: 更新 Xcode Command Line Tools
- Windows: 使用 Visual Studio 2019+
- Linux: 更新 GCC 到 9+

### 获取帮助

如果问题仍未解决：

1. **查看日志**: 检查 DAW 控制台输出和插件状态消息
2. **测试 Standalone 版本**: 使用独立版本排除 DAW 相关问题
3. **检查服务器**: 直接测试服务器 API 端点
4. **提交 Issue**: 在 GitHub 仓库创建 Issue，附上：
   - 系统信息（OS、DAW 版本）
   - 错误消息和日志
   - 复现步骤

---

## 📚 相关文档

- [ColDaw 主文档](../README.md) - 完整项目文档
- [ARCHITECTURE.md](ARCHITECTURE.md) - 详细架构说明
- [BUILD_GUIDE.md](BUILD_GUIDE.md) - 构建指南
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - 项目总结

---

## 🔄 更新记录

### v1.0.0 (当前)
- ✅ 基础导出功能
- ✅ 用户认证系统
- ✅ 自动文件检测
- ✅ 自动导出模式
- ✅ 服务器配置
- ✅ 浏览器集成

### 计划功能
- [ ] 项目元数据编辑
- [ ] 批量上传
- [ ] 上传进度显示
- [ ] 离线队列
- [ ] 多服务器配置

---

**享受使用 ColDaw Export 插件！** 🎵🚀
