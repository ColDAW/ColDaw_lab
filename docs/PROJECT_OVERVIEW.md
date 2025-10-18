# Project Overview

## 📁 Directory Structure

```
ColDaw_lab/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Main application pages
│   │   ├── api/           # API service layer
│   │   ├── contexts/      # React contexts
│   │   ├── store/         # Zustand state management
│   │   ├── styles/        # Styling and themes
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
│
├── server/                # Backend Node.js Application
│   ├── src/
│   │   ├── routes/        # Express route handlers
│   │   ├── database/      # Database connections & schemas
│   │   ├── services/      # Business logic services
│   │   ├── socket/        # Socket.io event handlers
│   │   └── utils/         # Server utilities
│   ├── projects/          # Uploaded project storage
│   ├── package.json       # Backend dependencies
│   └── tsconfig.json      # TypeScript configuration
│
├── vst-plugin/            # JUCE VST3 Plugin
│   ├── Source/            # C++ source code
│   ├── build/             # Compiled binaries
│   ├── CMakeLists.txt     # Build configuration
│   ├── build.sh           # Build script
│   └── README.md          # Plugin documentation
│
├── docs/                  # Project Documentation
│   ├── API.md             # API documentation
│   ├── VST_PLUGIN.md      # VST plugin documentation
│   └── README_CN.md       # Chinese documentation
│
├── JUCE/                  # JUCE Framework (Git Submodule)
│   └── [JUCE Framework Files]
│
├── README.md              # Main project documentation
├── CONTRIBUTING.md        # Contribution guidelines
├── LICENSE                # MIT License
├── .gitignore            # Git ignore rules
└── package.json          # Root package.json (scripts)
```

## 🔄 Component Architecture

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Client App                           │
├─────────────────────────────────────────────────────────────┤
│  Pages          │  Components       │  Store & Context     │
│  ├─ Landing     │  ├─ MenuBar       │  ├─ Auth Context     │
│  ├─ Editor      │  ├─ Timeline      │  ├─ Modal Context    │
│  ├─ Project     │  ├─ Track View    │  └─ Zustand Store    │
│  └─ Account     │  └─ Version Hist  │                      │
├─────────────────────────────────────────────────────────────┤
│                    API & Services                           │
│  ├─ HTTP Client (Axios)                                     │
│  ├─ Socket.io Client                                        │
│  └─ Authentication Service                                  │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                       Server App                            │
├─────────────────────────────────────────────────────────────┤
│  Routes         │  Services         │  Database            │
│  ├─ Auth        │  ├─ User Service  │  ├─ PostgreSQL       │
│  ├─ Projects    │  ├─ Project Svc   │  ├─ Redis            │
│  ├─ Versions    │  ├─ Version Svc   │  └─ File Storage     │
│  └─ Health      │  └─ Email Service │                      │
├─────────────────────────────────────────────────────────────┤
│                 Real-time Layer                             │
│  ├─ Socket.io Server                                        │
│  ├─ Collaboration Handlers                                  │
│  └─ Presence Management                                     │
└─────────────────────────────────────────────────────────────┘
```

### VST Plugin Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      VST3 Plugin                           │
├─────────────────────────────────────────────────────────────┤
│  JUCE Framework                                             │
│  ├─ Audio Processor (Pass-through)                         │
│  ├─ Plugin Editor (UI)                                     │
│  └─ Parameter Management                                    │
├─────────────────────────────────────────────────────────────┤
│  ColDaw Integration                                         │
│  ├─ Project Detector                                       │
│  ├─ HTTP Client                                            │
│  ├─ Authentication                                         │
│  └─ File Upload                                            │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### Project Upload Flow
```
Ableton Live → VST Plugin → HTTP Upload → Server → Database
                    ↓
              Authentication → JWT Token → Session Storage
                    ↓
              Project Detection → File Selection → Parse .als
                    ↓
              Upload Progress → Success → Open in Browser
```

### Real-time Collaboration Flow
```
User A Edit → Frontend → Socket.io → Server → Broadcast
                                        ↓
Database Update ← Server Processing ← Validation
                                        ↓
User B/C/D ← Socket.io ← Server ← Real-time Event
```

### Version Control Flow
```
Project State → User Commit → Create Version → Store in DB
                    ↓
              Diff Calculation → Change Detection → History Update
                    ↓
              Branch Management → Merge Operations → Conflict Resolution
```

## 🛠️ Technology Stack Summary

### Frontend Technologies
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand + React Context
- **Styling**: Styled-components
- **Routing**: React Router
- **Real-time**: Socket.io-client
- **HTTP Client**: Axios

### Backend Technologies
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache/Session**: Redis
- **Real-time**: Socket.io
- **Authentication**: JWT
- **File Processing**: XML parsing, Multer
- **Email**: Nodemailer

### DevOps & Deployment
- **Hosting**: Railway.app
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions (planned)
- **Monitoring**: Built-in health checks
- **SSL**: Automatic HTTPS

### Development Tools
- **Package Manager**: npm
- **Type Checking**: TypeScript
- **Code Style**: ESLint + Prettier
- **Build**: Native TypeScript compiler
- **Testing**: Jest (planned)

## 🔑 Key Features Implementation

### 1. Ableton Live Integration
- **VST Plugin**: JUCE-based C++ plugin
- **Project Detection**: Monitors recent projects
- **Authentication**: Direct login from plugin
- **File Upload**: One-click export to web

### 2. Version Control System
- **Git-like Operations**: Commit, branch, merge
- **History Tracking**: Complete project timeline
- **Diff Visualization**: Show changes between versions
- **Conflict Resolution**: Smart merge algorithms

### 3. Real-time Collaboration
- **Socket.io**: Bi-directional communication
- **Presence System**: Live user cursors
- **Operational Transform**: Conflict-free edits
- **State Synchronization**: Instant updates

### 4. DAW Visualization
- **Track Rendering**: Visual audio/MIDI tracks
- **Timeline View**: Time-based clip arrangement
- **Mixer Interface**: Volume/pan/effects display
- **Responsive Design**: Scales to different screens

### 5. User Management
- **Authentication**: JWT-based security
- **Project Ownership**: User permissions
- **Collaboration**: Invite system
- **Session Management**: Persistent login

## 📊 Performance Characteristics

### Frontend Performance
- **Initial Load**: ~2-3 seconds
- **Route Transitions**: ~200ms
- **Real-time Updates**: ~50-100ms latency
- **Memory Usage**: ~50-100MB

### Backend Performance
- **API Response**: ~100-300ms
- **File Upload**: ~1MB/second
- **Database Queries**: ~10-50ms
- **Concurrent Users**: 50+ per project

### VST Plugin Performance
- **Startup Time**: ~500ms
- **Memory Footprint**: ~2-5MB
- **CPU Usage**: <0.1% (idle)
- **Audio Latency**: Pass-through only

## 🔐 Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with salt
- **Session Management**: Redis-based storage
- **Role-based Access**: Owner/editor/viewer permissions

### Data Security
- **HTTPS Only**: All communication encrypted
- **Input Validation**: Comprehensive sanitization
- **File Validation**: Strict .als file checking
- **Rate Limiting**: Prevent abuse

### Infrastructure Security
- **Environment Variables**: Secure configuration
- **Database Security**: Connection encryption
- **CORS Policy**: Proper cross-origin setup
- **Error Handling**: No sensitive data exposure

This overview provides a comprehensive understanding of the ColDaw project structure, architecture, and implementation details.