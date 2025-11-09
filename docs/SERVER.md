# Server Documentation

## Stack

- Node.js + Express + TypeScript
- PostgreSQL (database), Redis (cache/sessions)
- Socket.io (real-time), JWT (auth)

## Structure

```
server/src/
├── routes/       # API endpoints
├── database/     # PostgreSQL schemas
├── services/     # Business logic (email, auth)
├── socket/       # Socket.io handlers
└── utils/        # Helpers
```

## Setup

```bash
cd server
npm install
cp .env.example .env  # Configure DATABASE_URL, REDIS_URL, etc.
npm run dev           # http://localhost:3001
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/coldaw
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
ZOHO_API_KEY=Zoho-enczapikey_token
ZOHO_FROM_EMAIL=noreply@coldaw.com
PORT=3001
```

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password VARCHAR,  -- bcrypt hashed
  username VARCHAR,
  verified BOOLEAN DEFAULT false
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR,
  owner_id UUID REFERENCES users(id),
  file_path VARCHAR,
  metadata JSONB
);

-- Commits (version control)
CREATE TABLE commits (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  message TEXT,
  author_id UUID REFERENCES users(id),
  parent_commit_id UUID,
  snapshot_path VARCHAR
);

-- Branches
CREATE TABLE branches (
  id UUID PRIMARY KEY,
  name VARCHAR,
  project_id UUID REFERENCES projects(id),
  head_commit_id UUID REFERENCES commits(id)
);
```

## API Endpoints

### Authentication
```typescript
POST /api/auth/register
  Body: { email, password, username }
  Returns: { userId }

POST /api/auth/login
  Body: { email, password }
  Returns: { token, user }

POST /api/auth/send-verification
  Body: { email }
  Sends 6-digit code via email

POST /api/auth/verify-email
  Body: { email, code }
  Marks user as verified
```

### Projects
```typescript
GET /api/projects
  Headers: Authorization: Bearer <token>
  Returns: [ { id, name, metadata, updatedAt } ]

GET /api/projects/:id
  Returns: Full project data (tracks, clips, etc.)

POST /api/projects/upload
  Body: FormData with .als file
  Returns: { projectId }

POST /api/projects/:id/commit
  Body: { message }
  Creates version snapshot
```

## Authentication Middleware

```typescript
// middleware/auth.ts
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await db.getUserById(decoded.userId);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Usage
router.get('/api/projects', authenticate, getProjects);
```

## Socket.io Events

```typescript
// socket/handlers.ts

// User joins project
socket.on('join-project', ({ projectId }) => {
  socket.join(`project:${projectId}`);
  io.to(`project:${projectId}`).emit('user-joined', {
    userId: socket.userId,
    username: socket.username
  });
});

// Real-time edits
socket.on('project-update', ({ projectId, changes }) => {
  socket.to(`project:${projectId}`).emit('project-update', changes);
});

// Cursor tracking
socket.on('cursor-move', ({ x, y }) => {
  socket.to(`project:${projectId}`).emit('cursor-update', {
    userId: socket.userId,
    position: { x, y }
  });
});
```

## Email Service

```typescript
// services/email.ts
class EmailService {
  async sendVerificationEmail(to: string, code: string) {
    await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Authorization': process.env.ZOHO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: { address: process.env.ZOHO_FROM_EMAIL },
        to: [{ email_address: { address: to } }],
        subject: 'Verify Your Email',
        htmlbody: `<p>Your code: <strong>${code}</strong></p>`
      })
    });
  }
}
```

## Ableton Project Parser

```typescript
// services/abletonParser.ts
import * as xml2js from 'xml2js';

export const parseAbletonProject = async (filePath: string) => {
  const xml = await fs.readFile(filePath, 'utf-8');
  const parsed = await xml2js.parseStringPromise(xml);
  
  return {
    tempo: parsed.Ableton.LiveSet.MasterTrack.DeviceChain.Mixer.Tempo.Manual.Value,
    tracks: parsed.Ableton.LiveSet.Tracks.AudioTrack.map(t => ({
      name: t.Name.EffectiveName,
      clips: t.DeviceChain.MainSequencer.ClipTimeable
    }))
  };
};
```

## Redis Usage

```typescript
// Verification codes
await redis.set(
  `verification:${email}`,
  JSON.stringify({ code, attempts: 0 }),
  'EX', 600  // 10 min expiration
);

// Session storage
await redis.set(`session:${token}`, userId, 'EX', 604800);  // 7 days

// Online users
await redis.sadd(`online:project:${projectId}`, userId);
```

## File Upload

```typescript
// routes/projects.ts
import multer from 'multer';

const upload = multer({
  dest: './uploads',
  limits: { fileSize: 500 * 1024 * 1024 },  // 500MB
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.als')) {
      cb(null, true);
    } else {
      cb(new Error('Only .als files allowed'));
    }
  }
});

router.post('/upload', authenticate, upload.single('project'), async (req, res) => {
  const metadata = await parseAbletonProject(req.file.path);
  const project = await db.createProject({
    name: req.body.name,
    ownerId: req.user.id,
    filePath: req.file.path,
    metadata
  });
  res.json({ projectId: project.id });
});
```

## Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build  # Output: dist/
npm start      # Run built version
```

## Troubleshooting

**Database connection fails**: Check `DATABASE_URL` format

**Socket.io not working**: Ensure CORS configured for client URL

**File uploads fail**: Check upload directory permissions

**Email not sending**: Verify `ZOHO_API_KEY` starts with `Zoho-enczapikey_`
