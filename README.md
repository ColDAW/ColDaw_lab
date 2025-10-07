# ColDaw - Collaborative Digital Audio Workstation# ColDaw - 协作式数字音频工作站# ColDaw - Collaborative DAW Web Application



A web-based Digital Audio Workstation with version control and real-time collaboration features designed for Ableton Live projects.



---一个基于 Web 的数字音频工作站（DAW），提供版本控制和实时协作功能，专为 Ableton Live 项目设计。A web-based Digital Audio Workstation with version control and real-time collaboration features for Ableton Live projects.



## 📖 Table of Contents



- [Features](#features)---## ✨ Features

- [Tech Stack](#tech-stack)

- [Quick Start](#quick-start)

- [Development Guide](#development-guide)

- [Deployment Guide](#deployment-guide)## 📖 目录- 🎵 **Upload Ableton Live Projects**: Direct upload from Ableton via VST3 plugin

- [VST Plugin](#vst-plugin)

- 🔐 **User Authentication**: Secure login system with token-based authentication

---

- [功能特性](#功能特性)- 🔄 **Git-like Version Control**: Commit, branch, merge your music projects

## ✨ Features

- [技术架构](#技术架构)- 👥 **Real-time Collaboration**: Figma-style collaborative editing

### Core Features

- 🎵 **Upload Ableton Live Projects**: Direct upload from Ableton via VST3 plugin- [快速开始](#快速开始)- 🎨 **Minimalist Dark UI**: Inspired by Teenage Engineering

- 🔐 **User Authentication**: Secure token-based authentication system

- 🔄 **Git-Style Version Control**: Commit, branch, and merge your music projects- [开发指南](#开发指南)- 🎚️ **Professional DAW Viewing**: Tracks, clips, mixer, effects visualization

- 👥 **Real-Time Collaboration**: Figma-style collaborative editing experience

- 🎨 **Minimalist Dark UI**: Inspired by Teenage Engineering design- [部署指南](#部署指南)- 📦 **Project Management**: Complete version history and project ownership

- 🎚️ **Professional DAW Visualization**: Track, clip, mixer, and effects visualization

- 📦 **Project Management**: Complete version history and project ownership- [VST 插件](#vst-插件)



### VST3 Plugin Integration## 🎛️ VST Plugin Integration

- **Smart Project Detection**: Automatically finds recently saved projects

- **User Authentication**: Login directly from the plugin---

- **One-Click Upload**: Export and open projects in browser with one click

- **Auto-Export Mode**: Automatically upload on every saveColDaw includes a VST3 plugin for Ableton Live that enables one-click project export:

- **Pre-configured**: Connects to `https://coldawlab-production.up.railway.app`

## ✨ 功能特性

See: [VST Plugin Documentation](#vst-plugin)

- **Smart Project Detection**: Automatically finds recently saved projects

---

### 核心功能- **User Authentication**: Login directly from the plugin

## 🏗️ Tech Stack

- 🎵 **上传 Ableton Live 项目**: 通过 VST3 插件直接从 Ableton 上传- **Instant Upload**: Export and open projects in browser with one click

### Frontend

- **React 18** - TypeScript- 🔐 **用户认证系统**: 基于 Token 的安全登录系统- **Auto-Export Mode**: Automatically upload on every save

- **Vite** - Fast development build tool

- **Zustand** - State management- 🔄 **Git 风格版本控制**: 提交、分支、合并音乐项目- **Pre-configured**: Connects to https://coldawlab-production.up.railway.app

- **Socket.io-client** - Real-time collaboration

- **Styled-components** - CSS-in-JS styling- 👥 **实时协作**: 类似 Figma 的协作编辑体验

- **React Router** - Client-side routing

- **Axios** - HTTP client- 🎨 **极简暗色界面**: 受 Teenage Engineering 启发的设计**Documentation**:



### Backend- 🎚️ **专业 DAW 可视化**: 音轨、片段、混音器、效果器可视化- [Installation & Usage](vst-plugin/README.md) - Complete plugin guide

- **Node.js + Express** - TypeScript

- **Socket.io** - Real-time features- 📦 **项目管理**: 完整的版本历史和项目所有权管理- **Important**: Plugin must be rebuilt after code changes

- **PostgreSQL** - Production database (Railway)

- **Multer** - File upload handling

- **Pako** - Gzip decompression (.als files)

- **xml2js** - XML parsing### VST3 插件集成## 🔐 Authentication System

- **JWT** - Token authentication

- **智能项目检测**: 自动查找最近保存的项目

### Database Structure (PostgreSQL)

```sql- **用户认证**: 直接从插件登录User authentication ensures all projects are properly associated with accounts:

users                  -- User authentication info

projects               -- Project metadata- **一键上传**: 一键导出并在浏览器中打开项目

versions               -- Version history (files stored as JSONB)

branches               -- Branch information- **自动导出模式**: 每次保存时自动上传- Email/password login

collaborators          -- Real-time collaboration sessions

project_collaborators  -- Project members- **预配置**: 连接到生产环境 `https://coldawlab-production.up.railway.app`- Token-based authentication

pending_changes        -- Pending changes

```- Persistent login state



---详见：[VST 插件文档](#vst-插件)- Demo accounts for testing



## 🚀 Quick Start



### Prerequisites---See [vst-plugin/AUTHENTICATION.md](vst-plugin/AUTHENTICATION.md) for detailed documentation.

- **Node.js** 18+

- **PostgreSQL** (production) or **LowDB** (local development)

- **npm** or **yarn**

## 🏗️ 技术架构## Tech Stack

### One-Click Startup



Use the convenience script to start both server and client:

### 前端技术栈### Frontend

```bash

cd ColDaw- **React 18** - TypeScript- React 18 with TypeScript

./start.sh

```- **Vite** - 快速开发构建工具- Vite for fast development



After startup:- **Zustand** - 状态管理- Zustand for state management

- Backend server: `http://localhost:3001`

- Frontend client: `http://localhost:5173`- **Socket.io-client** - 实时协作- Socket.io-client for real-time collaboration

- Demo account credentials will be displayed

- **Styled-components** - CSS-in-JS 样式- Styled-components for styling

### Manual Setup

- **React Router** - 客户端路由

#### 1. Clone Repository

```bash- **Axios** - HTTP 客户端### Backend

git clone <repository-url>

cd ColDaw- Node.js with Express

```

### 后端技术栈- TypeScript

#### 2. Install Backend Dependencies

```bash- **Node.js + Express** - TypeScript- Socket.io for real-time features

cd server

npm install- **Socket.io** - 实时功能- Multer for file uploads

```

- **PostgreSQL** - 生产环境数据库（Railway）- LowDB for project/version storage

#### 3. Install Frontend Dependencies

```bash- **Multer** - 文件上传处理- Token-based authentication

cd ../client

npm install- **Pako** - Gzip 解压缩（.als 文件）

```

- **xml2js** - XML 解析### VST Plugin

#### 4. Configure Environment Variables

- **JWT** - Token 认证- JUCE Framework 7.0+

Copy `.env.example` to `.env` and configure:

- C++17

```bash

# Backend configuration### 数据库结构（PostgreSQL）- VST3/AU/Standalone formats

NODE_ENV=development

PORT=3001```sql- HTTP client for API integration

JWT_SECRET=your-secret-key

users                  -- 用户认证信息

# Database configuration (LowDB optional for development)

DATABASE_TYPE=lowdbprojects               -- 项目元数据## Getting Started

# Or use PostgreSQL

# DATABASE_URL=postgresql://user:password@localhost:5432/coldawversions               -- 版本历史（文件存储为 JSONB）

```

branches               -- 分支信息### Quick Start

#### 5. Start Services

collaborators          -- 实时协作会话

**Backend**:

```bashproject_collaborators  -- 项目成员Use the convenience script to start both server and client:

cd server

npm run devpending_changes        -- 待提交的更改

```

``````bash

**Frontend**:

```bashcd ColDaw

cd client

npm run dev---./start.sh

```

```

### Demo Accounts

## 🚀 快速开始

Pre-configured test accounts:

This will:

| Email | Password | User ID |

|-------|----------|---------|### 前置要求- Start backend server on http://localhost:3001

| `demo@coldaw.com` | `demo123` | `user-1` |

| `test@coldaw.com` | `test123` | `user-2` |- **Node.js** 18+- Start frontend client on http://localhost:5173



---- **PostgreSQL** (生产环境) 或 **LowDB** (本地开发)- Display demo login credentials



## 💻 Development Guide- **npm** 或 **yarn**



### Project Structure### Manual Setup



```### 一键启动

ColDaw/

├── client/                 # React frontend#### Prerequisites

│   ├── src/

│   │   ├── components/    # React components使用便捷脚本同时启动服务器和客户端：- Node.js 18+

│   │   ├── pages/         # Page components

│   │   ├── store/         # Zustand state management- npm or yarn

│   │   ├── contexts/      # React Context

│   │   ├── api/           # API client```bash

│   │   └── styles/        # Global styles

│   └── package.jsoncd ColDaw#### Installation

│

├── server/                 # Node.js backend./start.sh

│   ├── src/

│   │   ├── routes/        # API routes```1. Clone the repository:

│   │   ├── database/      # Data access layer

│   │   ├── utils/         # Utility functions```bash

│   │   └── index.ts       # Server entry point

│   └── package.json启动后：git clone <repository-url>

│

├── vst-plugin/            # VST3 plugin- 后端服务器：`http://localhost:3001`cd ColDaw

│   └── See vst-plugin/README.md

│- 前端客户端：`http://localhost:5173````

└── package.json           # Root configuration

```- 将显示演示账户登录凭据



### Core Features Explained2. Install backend dependencies:



#### 1. ALS File Parsing### 手动安装步骤```bash

- Ableton Live `.als` files are gzipped XML

- Parser extracts: tracks, clips, devices, tempo, time signaturecd server

- Supports audio tracks, MIDI tracks, return tracks, and master track

#### 1. 克隆仓库npm install

#### 2. Version Control System

- Git-like workflow with branches and commits```bash```

- Each version stores parsed project data as JSON

- Supported operations:git clone <repository-url>

  - **Commit**: Upload new .als file to record version

  - **Branch**: Create divergent development pathscd ColDaw3. Install frontend dependencies:

  - **Merge**: Combine branches (simplified merge strategy)

  - **History**: View commit timeline per branch``````bash



#### 3. Real-Time Collaborationcd ../client

- WebSocket-based presence system

- Features:#### 2. 安装后端依赖npm install

  - Display user cursors with names

  - Color-coded collaborators```bash```

  - Live presence indicators

  - Future: Real-time editingcd server



#### 4. DAW Visualizationnpm install### Development

- Track list showing volume, pan, mute, solo controls

- Timeline displaying tempo and time signature```

- Clip view showing MIDI/audio regions

- Mixer panel displaying levels and effects#### Option 1: Use the Start Script (Recommended)



### Development Workflow#### 3. 安装前端依赖



#### Start Development Servers```bash```bash

```bash

# Terminal 1 - Backendcd ../client# Start both server and client

cd server

npm run devnpm install./start.sh



# Terminal 2 - Frontend```

cd client

npm run dev# Or start only server

```

#### 4. 配置环境变量./start.sh server

#### Build for Production

```bash

# Backend build

cd server复制 `.env.example` 到 `.env` 并配置：# Or start only client

npm run build

./start.sh client

# Frontend build

cd client```bash```

npm run build

```# 后端配置



### API EndpointsNODE_ENV=development#### Option 2: Manual Start



#### AuthenticationPORT=3001

- `POST /api/auth/login` - User login

- `POST /api/auth/register` - User registrationJWT_SECRET=your-secret-key1. Start the backend server (in one terminal):



#### Project Management```bash

- `GET /api/projects` - Get user's project list

- `GET /api/projects/:id` - Get project details# 数据库配置（开发环境可选 LowDB）cd server

- `POST /api/projects/init` - Initialize new project (upload .als file)

- `DELETE /api/projects/:id` - Delete projectDATABASE_TYPE=lowdbnpm run dev



#### Version Control# 或使用 PostgreSQL```

- `GET /api/projects/:id/versions` - Get version history

- `POST /api/projects/:id/commit` - Create new commit# DATABASE_URL=postgresql://user:password@localhost:5432/coldaw

- `GET /api/projects/:id/branches` - Get branch list

- `POST /api/projects/:id/branches` - Create new branch```The backend will run on http://localhost:3001

- `POST /api/projects/:id/merge` - Merge branches



#### Collaboration

- `WebSocket /` - Real-time collaboration communication#### 5. 启动服务2. Start the frontend dev server (in another terminal):

  - `join-project` - Join project room

  - `leave-project` - Leave project room```bash

  - `cursor-move` - Cursor movement

  - `user-presence` - User online status**后端**:cd client



---```bashnpm run dev



## 🚢 Deployment Guidecd server```



### Railway Deployment (Recommended)npm run dev



ColDaw is configured for direct deployment to Railway platform.```The frontend will run on http://localhost:5173



#### Prerequisites

1. [Railway](https://railway.app) account

2. GitHub repository (with project code pushed)**前端**:### Demo Login Credentials



#### Deployment Steps```bash



##### 1. Create Railway Projectcd clientFor testing the authentication system:

1. Login to [Railway Dashboard](https://railway.app/dashboard)

2. Click "New Project"npm run dev

3. Select "Deploy from GitHub repo"

4. Select your ColDaw repository```| Email | Password | Description |



##### 2. Add PostgreSQL Database|-------|----------|-------------|

1. In Railway project, click "New"

2. Select "Database" → "PostgreSQL"### 演示账户| `demo@coldaw.com` | `demo123` | Demo user account |

3. After creation, Railway automatically sets `DATABASE_URL` environment variable

| `test@coldaw.com` | `test123` | Test user account |

##### 3. Configure Environment Variables

服务器预配置了测试账户：

Add in Railway project settings:

## 🎹 Using the VST Plugin

```bash

# Basic configuration| 邮箱 | 密码 | 用户 ID |

NODE_ENV=production

PORT=${{RAILWAY_PORT}}  # Set by Railway automatically|------|------|---------|### Installation

JWT_SECRET=your-secure-jwt-secret-key-change-this

| `demo@coldaw.com` | `demo123` | `user-1` |

# Frontend URL (fill after deployment)

CLIENT_URL=https://your-app.railway.app| `test@coldaw.com` | `test123` | `user-2` |1. Build the plugin:



# CORS configuration```bash

CORS_ORIGIN=https://your-app.railway.app

```---cd vst-plugin



##### 4. Deploy./build.sh

Railway will automatically:

- Detect `Dockerfile` and build container## 💻 开发指南```

- Run database migrations

- Start application

- Provide HTTPS domain

### 项目结构2. The plugin will be automatically installed to:

##### 5. Initialize Database

   - VST3: `~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3`

After first deployment, run via Railway Shell:

```   - AU: `~/Library/Audio/Plug-Ins/Components/ColDaw Export.component`

```bash

npm run db:migrateColDaw/

```

├── client/                 # React 前端3. Restart Ableton Live or rescan plugins

#### Railway Configuration Files

│   ├── src/

Project includes the following configurations:

│   │   ├── components/    # React 组件### Usage

**`railway.json`**:

```json│   │   ├── pages/         # 页面组件

{

  "build": {│   │   ├── store/         # Zustand 状态管理1. **Start ColDaw servers** (backend + frontend)

    "builder": "DOCKERFILE",

    "dockerfilePath": "Dockerfile"│   │   ├── contexts/      # React Context2. **Add plugin** to any track in Ableton Live

  },

  "deploy": {│   │   ├── api/           # API 客户端3. **Login** with your credentials in the plugin window

    "startCommand": "npm start",

    "restartPolicyType": "ON_FAILURE"│   │   └── styles/        # 全局样式4. **Save your project** (Cmd+S)

  }

}│   └── package.json5. **Click "Export to ColDaw"** button

```

│6. Your project will open automatically in the browser!

**`Dockerfile`**:

- Multi-stage build for optimized image size├── server/                 # Node.js 后端

- Automatic frontend and backend builds

- Production environment optimization│   ├── src/See [vst-plugin/QUICKSTART.md](vst-plugin/QUICKSTART.md) for detailed instructions.



### Alternative Deployment Options│   │   ├── routes/        # API 路由



#### Docker Deployment│   │   ├── database/      # 数据访问层## 🚀 Deployment



```bash│   │   ├── utils/         # 工具函数

# Build image

docker build -t coldaw .│   │   └── index.ts       # 服务器入口### Railway Deployment



# Run container│   └── package.json

docker run -p 3001:3001 \

  -e DATABASE_URL=your-postgres-url \│ColDaw can be easily deployed to [Railway](https://railway.app) with PostgreSQL database support.

  -e JWT_SECRET=your-secret \

  coldaw├── vst-plugin/            # VST3 插件

```

│   └── 见 vst-plugin/README.mdSee [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for detailed deployment instructions.

#### Heroku Deployment

│

```bash

# Install Heroku CLI└── package.json           # 根配置Quick steps:

heroku login

```1. Push your code to GitHub

# Create app

heroku create coldaw-app2. Connect your repo to Railway



# Add PostgreSQL### 核心功能说明3. Add PostgreSQL service

heroku addons:create heroku-postgresql:mini

4. Configure environment variables

# Set environment variables

heroku config:set NODE_ENV=production#### 1. ALS 文件解析5. Deploy!

heroku config:set JWT_SECRET=your-secret

- Ableton Live `.als` 文件是 gzipped XML

# Push code

git push heroku main- 解析器提取：音轨、片段、设备、速度、拍号### Development

```

- 支持音频轨道、MIDI 轨道、返回轨道和主轨道

---

3. Open http://localhost:5173 in your browser

## 🎛️ VST Plugin

#### 2. 版本控制系统

ColDaw includes a VST3 plugin for one-click export from Ableton Live. See detailed documentation at `vst-plugin/README.md`

- 类似 Git 的工作流：分支和提交### Quick Start

### Features

- ✅ One-click export Ableton Live projects to ColDaw- 每个版本将解析后的项目数据存储为 JSON

- ✅ Auto-detect currently open project file

- ✅ Auto-monitor project saves and upload (optional)- 支持的操作：1. Click or drag-and-drop an Ableton Live `.als` file onto the upload area

- ✅ Manual .als file selection and upload

- ✅ User authentication (login/logout)  - **提交（Commit）**: 上传新 .als 文件记录版本2. Enter a project name and your name

- ✅ Server address configuration

- ✅ Auto-open project in browser after successful export  - **分支（Branch）**: 创建分叉的开发路径3. Click "Create Project" to initialize

- ✅ Real-time status feedback

  - **合并（Merge）**: 合并分支（简化合并策略）4. View your project with tracks, volume controls, and tempo

### Quick Start

  - **历史（History）**: 查看每个分支的提交时间线5. Use the top menu to commit new versions, create branches, or view history

#### System Requirements

- **Development**:6. Share the project URL with collaborators for real-time collaboration

  - C++ compiler (C++17 support)

  - CMake 3.15+#### 3. 实时协作

  - JUCE Framework 7.0+

- **Runtime**:- 基于 WebSocket 的在线状态系统## Project Structure

  - Ableton Live 10/11/12 or other VST3-compatible DAW

- 功能：

#### Install JUCE Framework

  - 显示用户光标和名称```

```bash

# Clone JUCE to project parent directory  - 颜色区分协作者ColDaw/

cd /path/to/ColDaw

git clone https://github.com/juce-framework/JUCE.git  - 实时在线指示器├── client/          # React frontend

```

  - 未来：实时编辑│   ├── src/

#### Build Plugin

│   │   ├── components/

**macOS**:

```bash#### 4. DAW 可视化│   │   ├── pages/

cd vst-plugin

./build.sh- 音轨列表，显示音量、声像、静音、独奏控制│   │   ├── store/



# Plugin will be automatically copied to:- 时间轴显示速度和拍号│   │   └── styles/

# VST3: ~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3

# AU: ~/Library/Audio/Plug-Ins/Components/ColDaw Export.component- 片段视图，显示 MIDI/音频区域│   └── package.json

```

- 混音器面板，显示电平和效果├── server/          # Express backend

**Windows**:

```powershell│   ├── src/

cd vst-plugin

mkdir build### 开发工作流│   │   ├── routes/

cd build

cmake .. -DJUCE_PATH=..\..\JUCE -G "Visual Studio 17 2022"│   │   ├── controllers/

cmake --build . --config Release

```#### 启动开发服务器│   │   ├── services/



**Linux**:```bash│   │   └── utils/

```bash

cd vst-plugin# 终端 1 - 后端│   ├── uploads/     # Temporary file storage



# Install dependencies (first time)cd server│   ├── projects/    # Project data storage

sudo apt-get install libasound2-dev libcurl4-openssl-dev \

    libfreetype6-dev libx11-dev libxcomposite-dev libxcursor-dev \npm run dev│   └── package.json

    libxinerama-dev libxrandr-dev libxrender-dev

└── README.md

mkdir build

cd build# 终端 2 - 前端```

cmake .. -DJUCE_PATH=../../JUCE

cmake --build . --config Releasecd client

```

npm run dev## Usage Flow

### Using the Plugin

```

1. **Load Plugin in Ableton Live**

   - Open Ableton Live1. **Initialize Project**: Upload your first .als file to create a new project

   - Add "ColDaw Export" plugin to any track

#### 构建生产版本2. **View Project**: Visualize tracks, clips, mixer settings

2. **Login**

   - Enter email and password```bash3. **Version Control**: Commit changes, create branches, merge versions

   - Click "Login" button

   - Use demo account: `demo@coldaw.com` / `demo123`# 后端构建4. **Collaborate**: Share project link for real-time collaboration



3. **Export Project**cd server5. **Download**: Export any version of your project

   - Click "Export Current Project" for one-click upload

   - Or enable "Auto Export" to automatically upload on every savenpm run build



4. **Configuration**## License

   - **Server URL**: Default `https://coldawlab-production.up.railway.app`

   - Can be changed to local dev server `http://localhost:3001`# 前端构建



### Important Notecd clientMIT



⚠️ **Plugin must be recompiled after changing server URL!**npm run build

```

Server address is written into code at compile time. To change default server address:

### API 端点

1. Edit `vst-plugin/Source/PluginProcessor.cpp`

2. Modify `serverUrl` default value#### 认证

3. Recompile plugin- `POST /api/auth/login` - 用户登录

- `POST /api/auth/register` - 用户注册

---

#### 项目管理

## 📝 License- `GET /api/projects` - 获取用户项目列表

- `GET /api/projects/:id` - 获取项目详情

MIT License- `POST /api/projects/init` - 初始化新项目（上传 .als 文件）

- `DELETE /api/projects/:id` - 删除项目

---

#### 版本控制

## 🤝 Contributing- `GET /api/projects/:id/versions` - 获取版本历史

- `POST /api/projects/:id/commit` - 创建新提交

Issues and Pull Requests are welcome!- `GET /api/projects/:id/branches` - 获取分支列表

- `POST /api/projects/:id/branches` - 创建新分支

---- `POST /api/projects/:id/merge` - 合并分支



## 📧 Contact#### 协作

- `WebSocket /` - 实时协作通信

For questions or suggestions, please create an Issue or contact project maintainers.  - `join-project` - 加入项目房间

  - `leave-project` - 离开项目房间

---  - `cursor-move` - 光标移动

  - `user-presence` - 用户在线状态

## 🎯 Roadmap

---

### Coming Soon

- [ ] More complex merge strategies## 🚢 部署指南

- [ ] Real-time audio collaborative editing

- [ ] Plugin effects support### Railway 部署（推荐）

- [ ] Mobile support

- [ ] More DAW support (Logic Pro, FL Studio)ColDaw 已配置为可直接部署到 Railway 平台。



### Completed#### 前置要求

- [x] Basic project upload and visualization1. [Railway](https://railway.app) 账户

- [x] Version control system2. GitHub 仓库（已推送项目代码）

- [x] User authentication

- [x] VST3 plugin#### 部署步骤

- [x] Real-time collaboration presence

- [x] PostgreSQL database integration##### 1. 创建 Railway 项目

- [x] Railway deployment configuration1. 登录 [Railway Dashboard](https://railway.app/dashboard)

2. 点击 "New Project"

---3. 选择 "Deploy from GitHub repo"

4. 选择您的 ColDaw 仓库

**Start your collaborative music creation journey now!** 🎵✨

##### 2. 添加 PostgreSQL 数据库
1. 在 Railway 项目中点击 "New"
2. 选择 "Database" → "PostgreSQL"
3. 数据库创建后，Railway 会自动设置 `DATABASE_URL` 环境变量

##### 3. 配置环境变量

在 Railway 项目设置中添加：

```bash
# 基础配置
NODE_ENV=production
PORT=${{RAILWAY_PORT}}  # Railway 自动设置
JWT_SECRET=your-secure-jwt-secret-key-change-this

# 前端 URL（部署后填写）
CLIENT_URL=https://your-app.railway.app

# CORS 配置
CORS_ORIGIN=https://your-app.railway.app
```

##### 4. 部署
Railway 会自动：
- 检测 `Dockerfile` 并构建容器
- 运行数据库迁移
- 启动应用程序
- 提供 HTTPS 域名

##### 5. 初始化数据库

首次部署后，通过 Railway Shell 运行：

```bash
npm run db:migrate
```

#### Railway 配置文件

项目包含以下配置：

**`railway.json`**:
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**`Dockerfile`**:
- 多阶段构建，优化镜像大小
- 自动构建前端和后端
- 生产环境优化

### 其他部署选项

#### Docker 部署

```bash
# 构建镜像
docker build -t coldaw .

# 运行容器
docker run -p 3001:3001 \
  -e DATABASE_URL=your-postgres-url \
  -e JWT_SECRET=your-secret \
  coldaw
```

#### Heroku 部署

```bash
# 安装 Heroku CLI
heroku login

# 创建应用
heroku create coldaw-app

# 添加 PostgreSQL
heroku addons:create heroku-postgresql:mini

# 设置环境变量
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# 推送代码
git push heroku main
```

---

## 🎛️ VST 插件

ColDaw 包含一个 VST3 插件，用于从 Ableton Live 一键导出项目。详细文档见 `vst-plugin/README.md`

### 功能特性
- ✅ 一键导出 Ableton Live 项目到 ColDaw
- ✅ 自动检测当前打开的项目文件
- ✅ 自动监听项目保存并上传（可选）
- ✅ 手动选择 .als 文件上传
- ✅ 用户认证（登录/登出）
- ✅ 配置服务器地址
- ✅ 导出成功后自动在浏览器中打开项目
- ✅ 实时状态反馈

### 快速开始

#### 系统要求
- **开发**:
  - C++ 编译器（支持 C++17）
  - CMake 3.15+
  - JUCE Framework 7.0+
- **运行**:
  - Ableton Live 10/11/12 或其他支持 VST3 的 DAW

#### 安装 JUCE 框架

```bash
# 克隆 JUCE 到项目父目录
cd /path/to/ColDaw
git clone https://github.com/juce-framework/JUCE.git
```

#### 构建插件

**macOS**:
```bash
cd vst-plugin
./build.sh

# 插件将自动复制到:
# VST3: ~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3
# AU: ~/Library/Audio/Plug-Ins/Components/ColDaw Export.component
```

**Windows**:
```powershell
cd vst-plugin
mkdir build
cd build
cmake .. -DJUCE_PATH=..\..\JUCE -G "Visual Studio 17 2022"
cmake --build . --config Release
```

**Linux**:
```bash
cd vst-plugin

# 安装依赖（首次）
sudo apt-get install libasound2-dev libcurl4-openssl-dev \
    libfreetype6-dev libx11-dev libxcomposite-dev libxcursor-dev \
    libxinerama-dev libxrandr-dev libxrender-dev

mkdir build
cd build
cmake .. -DJUCE_PATH=../../JUCE
cmake --build . --config Release
```

### 使用插件

1. **在 Ableton Live 中加载插件**
   - 打开 Ableton Live
   - 在任意轨道添加 "ColDaw Export" 插件

2. **登录**
   - 输入邮箱和密码
   - 点击 "Login" 按钮
   - 使用演示账户：`demo@coldaw.com` / `demo123`

3. **导出项目**
   - 点击 "Export Current Project" 一键上传
   - 或启用 "Auto Export" 在每次保存时自动上传

4. **配置**
   - **Server URL**: 默认 `https://coldawlab-production.up.railway.app`
   - 可修改为本地开发服务器 `http://localhost:3001`

### 重要提示

⚠️ **修改服务器 URL 后必须重新编译插件！**

插件中的服务器地址在编译时写入代码。要更改默认服务器地址：

1. 编辑 `vst-plugin/Source/PluginProcessor.cpp`
2. 修改 `serverUrl` 默认值
3. 重新编译插件

---

## 📝 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📧 联系方式

如有问题或建议，请创建 Issue 或联系项目维护者。

---

## 🎯 路线图

### 即将推出
- [ ] 更复杂的合并策略
- [ ] 实时音频协作编辑
- [ ] 插件效果器支持
- [ ] 移动端支持
- [ ] 更多 DAW 支持（Logic Pro, FL Studio）

### 已完成
- [x] 基础项目上传和可视化
- [x] 版本控制系统
- [x] 用户认证
- [x] VST3 插件
- [x] 实时协作在线状态
- [x] PostgreSQL 数据库集成
- [x] Railway 部署配置

---

**立即开始您的协作音乐创作之旅！** 🎵✨
