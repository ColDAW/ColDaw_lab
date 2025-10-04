# ColDaw - Quick Start Guide

## 🎵 Welcome to ColDaw!

ColDaw is a web-based collaborative DAW (Digital Audio Workstation) for Ableton Live projects with Git-like version control and real-time collaboration.

## ✅ Installation Complete!

Your ColDaw application has been successfully set up with all dependencies installed.

## 🚀 Starting the Application

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd /Users/yifan/Documents/WebD/ColDaw/server
npm run dev
```

You should see:
```
🚀 ColDaw server running on port 3001
📁 Upload directory: /path/to/uploads
💾 Projects directory: /path/to/projects
✅ Database initialized
```

### Step 2: Start the Frontend

Open a **new terminal** (keep the backend running) and run:

```bash
cd /Users/yifan/Documents/WebD/ColDaw/client
npm run dev
```

You should see:
```
VITE v5.0.11  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 3: Open in Browser

Open your browser and navigate to: **http://localhost:5173**

## 📖 Using ColDaw

### Creating Your First Project

1. **Upload an .als file**
   - Click or drag-and-drop an Ableton Live `.als` file onto the upload area
   - Enter a project name (e.g., "My Track")
   - Enter your name (e.g., "Artist Name")
   - Click "Create Project"

2. **View Your Project**
   - See your tracks with volume controls
   - View tempo and time signature
   - Explore the minimalist dark interface

### Version Control Features

#### Commit a New Version
1. Click "Commit" in the top menu bar
2. Select a new `.als` file
3. Enter a commit message
4. The new version is saved

#### Create a Branch
1. Click "Branch" in the top menu
2. Enter a branch name
3. Work on different versions simultaneously

#### View History
1. Click "History" to see all commits
2. View commit messages, authors, and timestamps

### Real-time Collaboration

1. **Share the Project URL** with collaborators
   - Example: `http://localhost:5173/project/abc-123-def`
   
2. **See Collaborators**
   - View colored avatars in the top-right corner
   - See real-time cursor positions of other users
   - Each user has a unique color

3. **Enter Your Name**
   - You'll be prompted for your name when joining
   - Your cursor will be visible to others

## 🎨 Design Features

### Teenage Engineering Inspired UI
- **Minimalist Dark Mode**: Clean, distraction-free interface
- **High Contrast**: Easy-to-read text and controls
- **Monospace Typography**: Professional, technical aesthetic
- **Orange Accent Color**: Distinctive highlight color (#ff5500)

### Professional DAW Controls
- **Volume Sliders**: Control track volume (displayed in dB)
- **Mute/Solo Buttons**: Standard DAW controls
- **Track Colors**: Visual organization from Ableton
- **Timeline**: Shows tempo, time signature, and bars

## 📂 Project Structure

```
ColDaw/
├── client/              # React frontend (Port 5173)
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Routes
│   │   ├── store/       # State management
│   │   └── styles/      # Design system
│   └── package.json
│
├── server/              # Express backend (Port 3001)
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── socket/      # WebSocket handlers
│   │   ├── utils/       # ALS parser
│   │   └── database/    # JSON database
│   ├── uploads/         # Temporary uploads
│   ├── projects/        # Project data & database
│   └── package.json
│
└── README.md
```

## 🔧 Troubleshooting

### Port Already in Use

**Backend (Port 3001):**
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9
```

**Frontend (Port 5173):**
```bash
# Find and kill the process
lsof -ti:5173 | xargs kill -9
```

### File Upload Issues
- Make sure `.als` files are valid Ableton Live projects
- Supported: Ableton Live 9 and later
- File size limit: default ~10MB (configurable in server)

### Can't See Other Users
- Make sure both users are on the same project URL
- Check that WebSocket connection is established (look for socket logs in browser console)
- Ensure backend server is running

### Database Reset
To reset all data:
```bash
rm /Users/yifan/Documents/WebD/ColDaw/server/projects/db.json
rm -rf /Users/yifan/Documents/WebD/ColDaw/server/projects/*
```

## 🎯 Key Features

### ✨ Highlights

1. **ALS File Parsing**
   - Extracts tracks, clips, devices, tempo, time signature
   - Preserves track colors and names from Ableton

2. **Git-like Version Control**
   - Commit: Save new versions
   - Branch: Create parallel development paths
   - Merge: Combine branches
   - History: View all commits

3. **Real-time Collaboration**
   - See collaborators' cursors
   - Live presence indicators
   - Color-coded users

4. **Professional Visualization**
   - Track list with mixer controls
   - Volume, pan, mute, solo
   - Timeline with tempo and bars
   - Device list (coming soon)

## 📚 Next Steps

### Recommended Enhancements

1. **Audio Playback**
   - Integrate Web Audio API
   - Play back tracks and mixes

2. **Advanced Editing**
   - Modify track properties
   - Real-time parameter changes
   - Collaborative editing

3. **Export Features**
   - Download modified `.als` files
   - Export stems
   - Export mixdowns

4. **User Authentication**
   - User accounts
   - Project permissions
   - Access control

5. **Cloud Storage**
   - Remote project storage
   - Backup and sync
   - Cross-device access

## 💡 Tips

- **Keyboard Shortcuts**: Coming soon!
- **Track Organization**: Use colors to organize tracks visually
- **Commit Often**: Save versions frequently to track progress
- **Branching Strategy**: Use branches for experimental ideas

## 📞 Support

For issues or questions:
1. Check the `DEVELOPMENT.md` file for technical details
2. Review error logs in browser console and terminal
3. Check that all dependencies are installed

## 🎉 Enjoy ColDaw!

You're all set! Start uploading your Ableton Live projects and collaborate with your team in real-time.

Happy producing! 🎸🎹🎤
