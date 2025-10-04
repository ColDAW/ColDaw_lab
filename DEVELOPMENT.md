# ColDaw Development Guide

## Architecture Overview

ColDaw is a full-stack collaborative DAW application built with:

### Backend (Node.js + TypeScript)
- **Express.js** - REST API server
- **Socket.io** - Real-time collaboration
- **Better-sqlite3** - Local database for project/version storage
- **Pako** - Gzip decompression for .als files
- **xml2js** - XML parsing
- **Multer** - File upload handling

### Frontend (React + TypeScript)
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Socket.io-client** - Real-time communication
- **Styled-components** - CSS-in-JS styling
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Key Features

### 1. ALS File Parsing
- Ableton Live `.als` files are gzipped XML
- Parser extracts: tracks, clips, devices, tempo, time signature
- Supports audio tracks, MIDI tracks, return tracks, and master track

### 2. Version Control System
- Git-like workflow with branches and commits
- Each version stores parsed project data as JSON
- Operations supported:
  - **Commit**: Upload new .als file to record version
  - **Branch**: Create divergent development paths
  - **Merge**: Combine branches (simplified merge strategy)
  - **History**: View commit timeline per branch

### 3. Real-time Collaboration
- WebSocket-based presence system
- Features:
  - User cursors with names
  - Color-coded collaborators
  - Live presence indicators
  - Future: Real-time editing

### 4. DAW Visualization
- Track list with volume, pan, mute, solo controls
- Timeline showing tempo and time signature
- Color-coded tracks from Ableton
- Minimalist dark UI inspired by Teenage Engineering

## Project Structure

```
ColDaw/
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/              # API client (axios)
│   │   │   └── api.ts
│   │   ├── components/       # React components
│   │   │   ├── MenuBar.tsx           # Top navigation
│   │   │   ├── Timeline.tsx          # Tempo/time display
│   │   │   ├── TrackList.tsx         # Track visualization
│   │   │   └── CollaboratorCursors.tsx
│   │   ├── pages/            # Route pages
│   │   │   ├── HomePage.tsx          # Project list & upload
│   │   │   └── ProjectPage.tsx       # DAW workspace
│   │   ├── store/            # Zustand state
│   │   │   └── useStore.ts
│   │   ├── styles/           # Styling
│   │   │   ├── global.css
│   │   │   └── theme.ts
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── database/         # SQLite setup
│   │   │   └── init.ts
│   │   ├── routes/           # API routes
│   │   │   ├── project.ts            # Project CRUD
│   │   │   └── version.ts            # Version control
│   │   ├── socket/           # WebSocket handlers
│   │   │   └── handlers.ts
│   │   ├── utils/            # Utilities
│   │   │   └── alsParser.ts          # ALS parsing logic
│   │   └── index.ts          # Server entry point
│   ├── uploads/              # Temporary file storage
│   ├── projects/             # Project data & database
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## API Endpoints

### Projects
- `POST /api/projects/init` - Initialize new project from .als file
- `GET /api/projects` - List all projects
- `GET /api/projects/:projectId` - Get project details
- `GET /api/projects/:projectId/version/:versionId` - Get version data
- `DELETE /api/projects/:projectId` - Delete project

### Versions
- `POST /api/versions/:projectId/commit` - Commit new version
- `POST /api/versions/:projectId/branch` - Create new branch
- `POST /api/versions/:projectId/merge` - Merge branches
- `GET /api/versions/:projectId/history` - Get version history
- `GET /api/versions/:projectId/branches` - Get all branches

## Database Schema

### projects
- `id` TEXT PRIMARY KEY
- `name` TEXT
- `created_at` INTEGER
- `updated_at` INTEGER
- `current_branch` TEXT

### versions
- `id` TEXT PRIMARY KEY
- `project_id` TEXT (FK)
- `branch` TEXT
- `parent_id` TEXT
- `message` TEXT
- `author` TEXT
- `timestamp` INTEGER
- `data_path` TEXT

### branches
- `id` TEXT PRIMARY KEY
- `project_id` TEXT (FK)
- `name` TEXT
- `head_version_id` TEXT (FK)
- `created_at` INTEGER

### collaborators
- `id` TEXT PRIMARY KEY
- `project_id` TEXT (FK)
- `user_name` TEXT
- `socket_id` TEXT
- `cursor_x` REAL
- `cursor_y` REAL
- `color` TEXT
- `last_seen` INTEGER

## WebSocket Events

### Client → Server
- `join-project` - Join project room
- `leave-project` - Leave project room
- `cursor-move` - Update cursor position
- `selection-change` - Update selection
- `edit-action` - Broadcast edit action

### Server → Client
- `collaborators-list` - Initial collaborator list
- `user-joined` - New user joined
- `user-left` - User disconnected
- `cursor-update` - Cursor position update
- `selection-update` - Selection update
- `remote-edit` - Remote edit action

## Design System

### Colors
- Background: `#0a0a0a`, `#141414`, `#1e1e1e`
- Text: `#ffffff`, `#b0b0b0`, `#707070`
- Accents: Orange `#ff5500`, Red `#ff0055`, Green `#00ff88`

### Typography
- Sans-serif: System fonts (SF Pro, Segoe UI, Roboto)
- Monospace: SF Mono, Monaco, Inconsolata

### Spacing
- XS: 4px, SM: 8px, MD: 16px, LG: 24px, XL: 32px

## Future Enhancements

1. **Advanced Version Control**
   - Diff visualization between versions
   - Cherry-pick commits
   - Revert to specific versions

2. **Real-time Editing**
   - Collaborative track editing
   - Live parameter changes
   - Conflict resolution

3. **Audio Playback**
   - Web Audio API integration
   - Sample preview
   - Mix playback

4. **Export Features**
   - Export modified .als files
   - Export stems
   - Export mix

5. **User Management**
   - Authentication
   - User profiles
   - Access control

6. **Cloud Storage**
   - Remote project storage
   - Cloud backup
   - Cross-device sync

## Troubleshooting

### TypeScript Errors
All TypeScript errors shown during development are expected until dependencies are installed. Run `npm install` in both `client` and `server` directories.

### Port Conflicts
- Backend uses port 3001
- Frontend uses port 5173
- Change in `.env` (server) or `vite.config.ts` (client) if needed

### ALS Parsing Issues
- Only Ableton Live 9+ .als files are supported
- Parser handles basic project structure
- Complex routing/automation may not be fully parsed

### Database Issues
- Database file is created in `server/projects/coldaw.db`
- Delete this file to reset all data
- Migrations are not implemented; schema changes require manual database reset

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow the Teenage Engineering design aesthetic
4. Test with real .als files
5. Document new features

## License

MIT
