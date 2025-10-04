# ColDaw - Collaborative DAW Web Application

A web-based Digital Audio Workstation with version control and real-time collaboration features for Ableton Live projects.

## Features

- 🎵 Upload and visualize Ableton Live (.als) project files
- 🔄 Git-like version control (commit, branch, merge)
- 👥 Real-time collaboration (Figma-style)
- 🎨 Minimalist dark UI inspired by Teenage Engineering
- 🎚️ Professional DAW viewing: tracks, clips, mixer, effects
- 📦 Project management with version history

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
- SQLite for project/version storage

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

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
