# Client Documentation

## Stack

- React 18 + TypeScript + Vite
- Zustand (state), Socket.io (real-time), Styled-components (CSS)

## Structure

```
client/src/
├── components/    # Reusable UI (DAW, Auth, Project)
├── pages/         # Routes (Landing, Dashboard, ProjectPage)
├── api/           # API calls (auth, projects, versions)
├── store/         # Zustand stores
└── utils/         # Helpers
```

## Setup

```bash
cd client
npm install
cp .env.example .env  # Configure VITE_API_URL
npm run dev           # http://localhost:5173
```

## State Management

**Zustand Stores**:

```typescript
// store/authStore.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  login: (email, password) => Promise<void>;
  logout: () => void;
}

// store/projectStore.ts
interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  fetchProjects: () => Promise<void>;
  selectProject: (id) => void;
}
```

## Socket.io Integration

```typescript
// contexts/SocketContext.tsx
const socket = io(VITE_API_URL);

socket.on('project-update', (data) => {
  // Handle real-time updates
});

socket.emit('join-project', { projectId });
```

**Events**:
- `join-project` - Join collaboration room
- `project-update` - Receive edits
- `cursor-move` - Show user cursors
- `user-joined/left` - Track collaborators

## API Layer

```typescript
// api/projects.ts
export const projectAPI = {
  getAll: () => axios.get('/api/projects'),
  getById: (id) => axios.get(`/api/projects/${id}`),
  upload: (file) => axios.post('/api/projects/upload', formData),
  commit: (id, message) => axios.post(`/api/projects/${id}/commit`, { message }),
};
```

## Key Components

### DAW Component
```typescript
// components/DAW/DAWCanvas.tsx
interface Props {
  project: Project;
  onUpdate: (changes) => void;
}

// Renders tracks, clips, timeline
// Handles zoom, scroll, selection
```

### Authentication
```typescript
// pages/LoginPage.tsx
const handleLogin = async () => {
  const { token, user } = await authAPI.login(email, password);
  authStore.setAuth(token, user);
  navigate('/dashboard');
};
```

### Project Upload
```typescript
// components/Project/UploadProject.tsx
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('project', file);
  await projectAPI.upload(formData);
};
```

## Styling

**Theme**:
```typescript
// styles/theme.ts
export const theme = {
  colors: {
    background: '#0a0a0a',
    surface: '#141414',
    primary: '#d3d3d3',
    accent: '#ffffff',
  },
  fonts: {
    primary: 'Poppins, sans-serif',
  },
};
```

**Styled Components**:
```typescript
const Button = styled.button`
  background: ${p => p.theme.colors.accent};
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  
  &:hover {
    transform: translateY(-2px);
  }
`;
```

## Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build  # Output: dist/

# Preview build
npm run preview
```

Deploy `dist/` folder to:
- Railway (auto-deploy from GitHub)
- Vercel/Netlify (static hosting)

## Environment Variables

```env
# .env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

For production:
```env
VITE_API_URL=https://api.coldaw.com
VITE_WS_URL=wss://api.coldaw.com
```

## Common Tasks

**Add new page**:
1. Create component in `pages/`
2. Add route in `App.tsx`:
   ```typescript
   <Route path="/new-page" element={<NewPage />} />
   ```

**Add API endpoint**:
1. Add function to `api/*.ts`
2. Use in component:
   ```typescript
   const data = await projectAPI.newEndpoint();
   ```

**Add Zustand store**:
```typescript
// store/newStore.ts
export const useNewStore = create<State>((set) => ({
  data: null,
  fetch: async () => set({ data: await api.get() }),
}));
```

## Troubleshooting

**CORS errors**: Check `VITE_API_URL` matches server

**Socket not connecting**: Verify `VITE_WS_URL` and server is running

**Build fails**: Clear `node_modules` and reinstall

**Hot reload not working**: Restart Vite dev server
