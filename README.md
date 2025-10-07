# ColDaw - Collaborative DAW Web Application

A web-based Digital Audio Workstation with version control and real-time collaboration features for Ableton Live projects.

## ✨ Features

- 🎵 **Upload Ableton Live Projects**: Direct upload from Ableton via VST3 plugin
- 🔐 **User Authentication**: Secure login system with token-based authentication
- 🔄 **Git-like Version Control**: Commit, branch, merge your music projects
- 👥 **Real-time Collaboration**: Figma-style collaborative editing
- 🎨 **Minimalist Dark UI**: Inspired by Teenage Engineering
- 🎚️ **Professional DAW Viewing**: Tracks, clips, mixer, effects visualization
- 📦 **Project Management**: Complete version history and project ownership

## 🎛️ VST Plugin Integration

ColDaw includes a VST3 plugin for Ableton Live that enables one-click project export:

- **Smart Project Detection**: Automatically finds recently saved projects
- **User Authentication**: Login directly from the plugin
- **Instant Upload**: Export and open projects in browser with one click
- **Auto-Export Mode**: Automatically upload on every save
- **Pre-configured**: Connects to https://coldawlab-production.up.railway.app

**Documentation**:
- [Installation & Usage](vst-plugin/README.md) - Complete plugin guide
- **Important**: Plugin must be rebuilt after code changes

## 🔐 Authentication System

User authentication ensures all projects are properly associated with accounts:

- Email/password login
- Token-based authentication
- Persistent login state
- Demo accounts for testing

See [vst-plugin/AUTHENTICATION.md](vst-plugin/AUTHENTICATION.md) for detailed documentation.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Zustand for state management
- Socket.io-client for real-time collaboration
- Styled-components for styling

### Backend
- Node.js with Express
- TypeScript
- Socket.io for real-time features
- Multer for file uploads
- LowDB for project/version storage
- Token-based authentication

### VST Plugin
- JUCE Framework 7.0+
- C++17
- VST3/AU/Standalone formats
- HTTP client for API integration

## Getting Started

### Quick Start

Use the convenience script to start both server and client:

```bash
cd ColDaw
./start.sh
```

This will:
- Start backend server on http://localhost:3001
- Start frontend client on http://localhost:5173
- Display demo login credentials

### Manual Setup

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ColDaw
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

### Development

#### Option 1: Use the Start Script (Recommended)

```bash
# Start both server and client
./start.sh

# Or start only server
./start.sh server

# Or start only client
./start.sh client
```

#### Option 2: Manual Start

1. Start the backend server (in one terminal):
```bash
cd server
npm run dev
```

The backend will run on http://localhost:3001

2. Start the frontend dev server (in another terminal):
```bash
cd client
npm run dev
```

The frontend will run on http://localhost:5173

### Demo Login Credentials

For testing the authentication system:

| Email | Password | Description |
|-------|----------|-------------|
| `demo@coldaw.com` | `demo123` | Demo user account |
| `test@coldaw.com` | `test123` | Test user account |

## 🎹 Using the VST Plugin

### Installation

1. Build the plugin:
```bash
cd vst-plugin
./build.sh
```

2. The plugin will be automatically installed to:
   - VST3: `~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3`
   - AU: `~/Library/Audio/Plug-Ins/Components/ColDaw Export.component`

3. Restart Ableton Live or rescan plugins

### Usage

1. **Start ColDaw servers** (backend + frontend)
2. **Add plugin** to any track in Ableton Live
3. **Login** with your credentials in the plugin window
4. **Save your project** (Cmd+S)
5. **Click "Export to ColDaw"** button
6. Your project will open automatically in the browser!

See [vst-plugin/QUICKSTART.md](vst-plugin/QUICKSTART.md) for detailed instructions.

## 🚀 Deployment

### Railway Deployment

ColDaw can be easily deployed to [Railway](https://railway.app) with PostgreSQL database support.

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Push your code to GitHub
2. Connect your repo to Railway
3. Add PostgreSQL service
4. Configure environment variables
5. Deploy!

### Development

3. Open http://localhost:5173 in your browser

### Quick Start

1. Click or drag-and-drop an Ableton Live `.als` file onto the upload area
2. Enter a project name and your name
3. Click "Create Project" to initialize
4. View your project with tracks, volume controls, and tempo
5. Use the top menu to commit new versions, create branches, or view history
6. Share the project URL with collaborators for real-time collaboration

## Project Structure

```
ColDaw/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── styles/
│   └── package.json
├── server/          # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   ├── uploads/     # Temporary file storage
│   ├── projects/    # Project data storage
│   └── package.json
└── README.md
```

## Usage Flow

1. **Initialize Project**: Upload your first .als file to create a new project
2. **View Project**: Visualize tracks, clips, mixer settings
3. **Version Control**: Commit changes, create branches, merge versions
4. **Collaborate**: Share project link for real-time collaboration
5. **Download**: Export any version of your project

## License

MIT
