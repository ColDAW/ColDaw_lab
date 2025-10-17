import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface Collaborator {
  id: string;
  userName: string;
  socketId: string;
  color: string;
  cursorX?: number;
  cursorY?: number;
}

interface Project {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
  current_branch: string;
}

interface Version {
  id: string;
  project_id: string;
  branch: string;
  parent_id: string | null;
  message: string;
  author?: string;
  user_id?: string;
  user_name?: string;
  timestamp?: number;
  created_at?: string;
  data_path: string;
}

interface Branch {
  id: string;
  project_id: string;
  name: string;
  head_version_id: string | null;
  created_at: number;
}

export interface Track {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'return' | 'master';
  color: number;
  volume: number;
  pan: number;
  isMuted: boolean;
  isSolo: boolean;
  clips: Clip[];
  devices: any[];
}

export interface Clip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  loopStart: number;
  loopEnd: number;
  isLooping: boolean;
  color: number;
  clipType?: 'audio' | 'midi'; // Differentiate between audio and MIDI clips
  samplePath?: string;
  pitchCoarse?: number;
  pitchFine?: number;
  gain?: number;
}

export interface ProjectData {
  name: string;
  tempo: number;
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  tracks: Track[];
  masterTrack?: Track;
}

interface AppState {
  // Project data
  currentProject: Project | null;
  projectData: ProjectData | null;
  currentVersion: Version | null;
  branches: Branch[];
  versions: Version[];
  
  // Uncommitted changes
  pendingData: ProjectData | null; // Data from imported file but not pushed yet
  hasPendingChanges: boolean;
  vstTempFileName: string | null; // Temp filename for VST imports
  
  // Collaboration
  socket: Socket | null;
  collaborators: Collaborator[];
  currentUser: string;
  
  // UI state
  selectedTrackId: string | null;
  isMenuOpen: boolean;
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  setProjectData: (data: ProjectData | null) => void;
  setCurrentVersion: (version: Version | null) => void;
  setBranches: (branches: Branch[]) => void;
  setVersions: (versions: Version[]) => void;
  setSelectedTrackId: (trackId: string | null) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  setCurrentUser: (userName: string) => void;
  setPendingData: (data: ProjectData | null) => void;
  setVSTTempFileName: (fileName: string | null) => void;
  clearPendingChanges: () => void;
  
  // Socket actions
  initSocket: (projectId: string, userName: string, userId: string) => void;
  disconnectSocket: () => void;
  addCollaborator: (collaborator: Collaborator) => void;
  removeCollaborator: (socketId: string) => void;
  updateCollaboratorCursor: (socketId: string, x: number, y: number) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : '');

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  currentProject: null,
  projectData: null,
  currentVersion: null,
  branches: [],
  versions: [],
  pendingData: null,
  hasPendingChanges: false,
  vstTempFileName: null,
  socket: null,
  collaborators: [],
  currentUser: 'Anonymous',
  selectedTrackId: null,
  isMenuOpen: false,
  
  // Setters
  setCurrentProject: (project) => set({ currentProject: project }),
  setProjectData: (data) => set({ projectData: data }),
  setCurrentVersion: (version) => set({ currentVersion: version }),
  setBranches: (branches) => set({ branches }),
  setVersions: (versions) => set({ versions }),
  setSelectedTrackId: (trackId) => set({ selectedTrackId: trackId }),
  setIsMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),
  setCurrentUser: (userName) => set({ currentUser: userName }),
  setPendingData: (data) => set({ pendingData: data, hasPendingChanges: !!data }),
  setVSTTempFileName: (fileName) => set({ vstTempFileName: fileName }),
  clearPendingChanges: () => set({ pendingData: null, hasPendingChanges: false, vstTempFileName: null }),
  
  // Socket methods
  initSocket: (projectId: string, userName: string, userId: string) => {
    console.log('initSocket called with:', { projectId, userName, userId });
    const socket = io(API_BASE_URL);
    
    socket.on('connect', () => {
      console.log('Socket connected, emitting join-project with:', { projectId, userName, userId });
      socket.emit('join-project', { projectId, userName, userId });
    });
    
    socket.on('collaborators-list', (collaborators: Collaborator[]) => {
      set({ collaborators });
    });
    
    socket.on('user-joined', (collaborator: Collaborator) => {
      set((state) => ({
        collaborators: [...state.collaborators, collaborator],
      }));
    });
    
    socket.on('user-left', (data: { id: string }) => {
      set((state) => ({
        collaborators: state.collaborators.filter((c) => c.id !== data.id),
      }));
    });
    
    socket.on('cursor-update', (data: { socketId: string; x: number; y: number }) => {
      get().updateCollaboratorCursor(data.socketId, data.x, data.y);
    });
    
    set({ socket, currentUser: userName });
  },
  
  disconnectSocket: () => {
    const { socket, currentProject } = get();
    if (socket && currentProject) {
      socket.emit('leave-project', { projectId: currentProject.id });
      socket.disconnect();
      set({ socket: null, collaborators: [] });
    }
  },
  
  addCollaborator: (collaborator) => {
    set((state) => ({
      collaborators: [...state.collaborators, collaborator],
    }));
  },
  
  removeCollaborator: (socketId) => {
    set((state) => ({
      collaborators: state.collaborators.filter((c) => c.socketId !== socketId),
    }));
  },
  
  updateCollaboratorCursor: (socketId, x, y) => {
    set((state) => ({
      collaborators: state.collaborators.map((c) =>
        c.socketId === socketId ? { ...c, cursorX: x, cursorY: y } : c
      ),
    }));
  },
}));
