# ColDaw - Collaborative Digital Audio Workstation

> Web-based DAW with git-style version control and real-time collaboration.

## Features

- **Ableton Integration**: VST3 plugin for one-click project export
- **Version Control**: Git-style commits, branches, and merging
- **Real-Time Collaboration**: Always synced between the cloud and the DAW
- **DAW Visualization**: Track view, mixer, effects chain
- **Secure Auth**: JWT-based authentication with email verification

## Tech Stack

```
Frontend:  React 18 + TypeScript + Vite + Zustand + Socket.io
Backend:   Node.js + Express + PostgreSQL + Redis + Socket.io
Plugin:    JUCE Framework + C++ (VST3)
Deploy:    Railway
```

## Quick Start

### Prerequisites
- Node.js 18+, PostgreSQL 14+, Redis 6+

### Setup

```bash
# Clone
git clone https://github.com/yifandeng2002/ColDaw_lab.git
cd ColDaw_lab
git submodule update --init --recursive

# Install & run backend
cd server
npm install
npm run dev  # http://localhost:3001

# Install & run frontend (new terminal)
cd client
npm install
npm run dev  # http://localhost:5173
```

### Environment Variables

**server/.env**:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/coldaw
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
ZOHO_API_KEY=Zoho-enczapikey_token
ZOHO_FROM_EMAIL=noreply@coldaw.com
PORT=3001
```

**client/.env**:
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## Project Structure

```
ColDaw_lab/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Routes
│   │   ├── api/          # API layer
│   │   └── store/        # Zustand stores
│   └── public/
├── server/           # Node.js backend
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── database/     # PostgreSQL schemas
│   │   ├── services/     # Business logic
│   │   └── socket/       # Socket.io handlers
│   └── projects/     # Uploaded files
├── vst-plugin/       # JUCE plugin
│   ├── Source/       # C++ code
│   └── build/        # Binaries
├── JUCE/             # Framework (submodule)
└── docs/             # Documentation
```

## Documentation

Comprehensive guides in `docs/`:

- **[CLIENT.md](./docs/CLIENT.md)** - React app, Zustand, Socket.io
- **[SERVER.md](./docs/SERVER.md)** - Express API, PostgreSQL, Redis
- **[DATA.md](./docs/DATA.md)** - Data flow and storage
- **[VST.md](./docs/VST.md)** - Plugin build and usage
- **[BRIDGING.md](./docs/BRIDGING.md)** - External platform integrations
- **[ZEPTOMAIL.md](./docs/ZEPTOMAIL.md)** - Email service setup
- **[RAILWAY.md](./docs/RAILWAY.md)** - Deployment guide

## API Overview

```typescript
// Authentication
POST /api/auth/register { email, password, username }
POST /api/auth/login { email, password }
POST /api/auth/verify-email { email, code }

// Projects
GET  /api/projects
GET  /api/projects/:id
POST /api/projects/upload
POST /api/projects/:id/commit { message }
POST /api/projects/:id/branch { name }

// Socket.io events
socket.emit('join-project', { projectId })
socket.on('project-update', (changes) => {...})
socket.emit('cursor-move', { x, y })
```

## Build & Deploy

### Production Build

```bash
# Frontend
cd client && npm run build  # → dist/

# Backend
cd server && npm run build  # → dist/

# VST Plugin (see docs/VST.md)
cd vst-plugin && ./build.sh
```

### Deploy to Railway

1. Connect GitHub repo to Railway
2. Configure environment variables (see [RAILWAY.md](./docs/RAILWAY.md))
3. Railway auto-deploys on push to `main`

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push: `git push origin feature/name`
5. Open Pull Request

## License

MIT License - see [LICENSE](./LICENSE)

## Links

- **Live Demo**: https://coldawlab-production.up.railway.app
- **Documentation**: [./docs/](./docs/)
- **Issues**: https://github.com/yifandeng2002/ColDaw_lab/issues
