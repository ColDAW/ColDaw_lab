import { join } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import * as fs from 'fs';
import bcrypt from 'bcrypt';

const dbDir = join(__dirname, '..', '..', 'projects');
const dbPath = join(dbDir, 'db.json');

export interface Project {
  id: string;
  name: string;
  userId?: string; // User who created the project
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
  author: string;
  timestamp: number;
  data_path: string;
}

interface Branch {
  id: string;
  project_id: string;
  name: string;
  head_version_id: string | null;
  created_at: number;
}

interface Collaborator {
  id: string;
  project_id: string;
  user_name: string;
  socket_id: string;
  cursor_x?: number;
  cursor_y?: number;
  color: string;
  last_seen: number;
}

interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  added_at: number;
}

interface PendingChange {
  id: string;
  project_id: string;
  user_id: string;
  data_path: string; // Path to the temporary data file
  message: string;
  author: string;
  created_at: number;
}

export interface User {
  id: string;
  email: string;
  password: string; // In production, this should be hashed!
  name: string;
  created_at: number;
}

interface DatabaseSchema {
  projects: Project[];
  versions: Version[];
  branches: Branch[];
  collaborators: Collaborator[];
  projectCollaborators: ProjectCollaborator[];
  users: User[];
  pendingChanges: PendingChange[];
}

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const adapter = new JSONFile<DatabaseSchema>(dbPath);
export const db = new Low<DatabaseSchema>(adapter, {
  projects: [],
  versions: [],
  branches: [],
  collaborators: [],
  projectCollaborators: [],
  users: [],
  pendingChanges: [],
});

export async function initDatabase(): Promise<void> {
  await db.read();
  
  // Initialize db.data if it's completely empty
  if (!db.data) {
    db.data = {
      projects: [],
      versions: [],
      branches: [],
      collaborators: [],
      projectCollaborators: [],
      users: [],
      pendingChanges: [],
    };
  }
  
  // Backward compatibility: add missing fields if they don't exist
  if (!db.data.users) {
    db.data.users = [];
  }
  if (!db.data.versions) db.data.versions = [];
  if (!db.data.branches) db.data.branches = [];
  if (!db.data.collaborators) db.data.collaborators = [];
  if (!db.data.projectCollaborators) db.data.projectCollaborators = [];
  if (!db.data.pendingChanges) db.data.pendingChanges = [];

  // Migrate existing passwords to bcrypt (if not already hashed)
  await migratePasswords();

  // Seed demo users if database is empty
  if (db.data.users.length === 0) {
    const demoUsers: User[] = [
      {
        id: crypto.randomUUID(),
        email: 'demo@coldaw.com',
        password: await bcrypt.hash('demo123', 10),
        name: 'Demo User',
        created_at: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        email: 'test@coldaw.com',
        password: await bcrypt.hash('test123', 10),
        name: 'Test User',
        created_at: Date.now(),
      },
    ];
    
    db.data.users.push(...demoUsers);
  }

  await db.write();
  console.log('✅ Database initialized');
}

// Migrate existing plain-text passwords to bcrypt
async function migratePasswords() {
  if (!db.data.users) return;
  
  let migrated = 0;
  for (const user of db.data.users) {
    // Check if password is already hashed (bcrypt hashes start with $2b$)
    if (user.password && !user.password.startsWith('$2b$')) {
      user.password = await bcrypt.hash(user.password, 10);
      migrated++;
    }
  }
  
  if (migrated > 0) {
    await db.write();
    console.log(`✅ Migrated ${migrated} user passwords to bcrypt`);
  }
}

// Helper functions to mimic SQL operations
export const dbHelpers = {
  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    await db.read();
    return db.data.projects.find(p => p.id === id);
  },
  
  async getAllProjects(): Promise<Project[]> {
    await db.read();
    return db.data.projects.sort((a, b) => b.updated_at - a.updated_at);
  },
  
  async getProjectsByUser(userId: string): Promise<Project[]> {
    await db.read();
    return db.data.projects
      .filter(p => p.userId === userId)
      .sort((a, b) => b.updated_at - a.updated_at);
  },
  
  async insertProject(project: Project): Promise<void> {
    await db.read();
    db.data.projects.push(project);
    await db.write();
  },
  
  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    await db.read();
    const index = db.data.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      db.data.projects[index] = { ...db.data.projects[index], ...updates };
      await db.write();
    }
  },
  
  async deleteProject(id: string): Promise<void> {
    await db.read();
    db.data.projects = db.data.projects.filter(p => p.id !== id);
    db.data.versions = db.data.versions.filter(v => v.project_id !== id);
    db.data.branches = db.data.branches.filter(b => b.project_id !== id);
    db.data.collaborators = db.data.collaborators.filter(c => c.project_id !== id);
    await db.write();
  },
  
  // Versions
  async getVersion(id: string): Promise<Version | undefined> {
    await db.read();
    return db.data.versions.find(v => v.id === id);
  },
  
  async getVersionsByProject(projectId: string, branch?: string): Promise<Version[]> {
    await db.read();
    let versions = db.data.versions.filter(v => v.project_id === projectId);
    if (branch) {
      versions = versions.filter(v => v.branch === branch);
    }
    return versions.sort((a, b) => b.timestamp - a.timestamp);
  },
  
  async insertVersion(version: Version): Promise<void> {
    await db.read();
    db.data.versions.push(version);
    await db.write();
  },
  
  // Branches
  async getBranch(projectId: string, name: string): Promise<Branch | undefined> {
    await db.read();
    return db.data.branches.find(b => b.project_id === projectId && b.name === name);
  },
  
  async getBranchesByProject(projectId: string): Promise<Branch[]> {
    await db.read();
    return db.data.branches.filter(b => b.project_id === projectId).sort((a, b) => b.created_at - a.created_at);
  },
  
  async insertBranch(branch: Branch): Promise<void> {
    await db.read();
    db.data.branches.push(branch);
    await db.write();
  },
  
  async updateBranch(id: string, updates: Partial<Branch>): Promise<void> {
    await db.read();
    const index = db.data.branches.findIndex(b => b.id === id);
    if (index !== -1) {
      db.data.branches[index] = { ...db.data.branches[index], ...updates };
      await db.write();
    }
  },
  
  // Collaborators
  async getCollaboratorsByProject(projectId: string): Promise<Collaborator[]> {
    await db.read();
    return db.data.collaborators.filter(c => c.project_id === projectId);
  },
  
  async getCollaboratorBySocket(socketId: string): Promise<Collaborator | undefined> {
    await db.read();
    return db.data.collaborators.find(c => c.socket_id === socketId);
  },
  
  async insertCollaborator(collaborator: Collaborator): Promise<void> {
    await db.read();
    db.data.collaborators.push(collaborator);
    await db.write();
  },
  
  async updateCollaborator(socketId: string, updates: Partial<Collaborator>): Promise<void> {
    await db.read();
    const index = db.data.collaborators.findIndex(c => c.socket_id === socketId);
    if (index !== -1) {
      db.data.collaborators[index] = { ...db.data.collaborators[index], ...updates };
      await db.write();
    }
  },
  
  async deleteCollaborator(socketId: string): Promise<void> {
    await db.read();
    db.data.collaborators = db.data.collaborators.filter(c => c.socket_id !== socketId);
    await db.write();
  },
  
  // Clean up stale collaborators for a user in a project
  async deleteCollaboratorsByUserAndProject(userName: string, projectId: string): Promise<void> {
    await db.read();
    db.data.collaborators = db.data.collaborators.filter(
      c => !(c.user_name === userName && c.project_id === projectId)
    );
    await db.write();
  },

  // Project Collaborators
  async getProjectCollaboratorsByProject(projectId: string): Promise<ProjectCollaborator[]> {
    await db.read();
    return db.data.projectCollaborators.filter(pc => pc.project_id === projectId);
  },

  async getProjectCollaboratorsByUser(userId: string): Promise<ProjectCollaborator[]> {
    await db.read();
    return db.data.projectCollaborators.filter(pc => pc.user_id === userId);
  },

  async insertProjectCollaborator(collaborator: ProjectCollaborator): Promise<void> {
    await db.read();
    // Check if already exists
    const exists = db.data.projectCollaborators.find(
      pc => pc.project_id === collaborator.project_id && pc.user_id === collaborator.user_id
    );
    if (!exists) {
      db.data.projectCollaborators.push(collaborator);
      await db.write();
    }
  },

  async deleteProjectCollaborator(projectId: string, userId: string): Promise<void> {
    await db.read();
    db.data.projectCollaborators = db.data.projectCollaborators.filter(
      pc => !(pc.project_id === projectId && pc.user_id === userId)
    );
    await db.write();
  },

  // Users
  async getUserByEmail(email: string): Promise<User | undefined> {
    await db.read();
    if (!db.data || !db.data.users) {
      return undefined;
    }
    return db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  async getUserById(id: string): Promise<User | undefined> {
    await db.read();
    if (!db.data || !db.data.users) {
      return undefined;
    }
    return db.data.users.find(u => u.id === id);
  },

  async insertUser(user: User): Promise<void> {
    await db.read();
    if (!db.data.users) {
      db.data.users = [];
    }
    db.data.users.push(user);
    await db.write();
  },

  // Pending Changes
  async getPendingChange(pendingId: string): Promise<PendingChange | undefined> {
    await db.read();
    if (!db.data.pendingChanges) {
      db.data.pendingChanges = [];
    }
    return db.data.pendingChanges.find(pc => pc.id === pendingId);
  },

  async getPendingChangesForProject(projectId: string): Promise<PendingChange[]> {
    await db.read();
    if (!db.data.pendingChanges) {
      db.data.pendingChanges = [];
    }
    return db.data.pendingChanges.filter(pc => pc.project_id === projectId);
  },

  async insertPendingChange(change: PendingChange): Promise<void> {
    await db.read();
    if (!db.data.pendingChanges) {
      db.data.pendingChanges = [];
    }
    // Remove existing pending change for same project/user
    db.data.pendingChanges = db.data.pendingChanges.filter(
      pc => !(pc.project_id === change.project_id && pc.user_id === change.user_id)
    );
    db.data.pendingChanges.push(change);
    await db.write();
  },

  async deletePendingChange(pendingId: string): Promise<void> {
    await db.read();
    if (!db.data.pendingChanges) {
      db.data.pendingChanges = [];
    }
    db.data.pendingChanges = db.data.pendingChanges.filter(pc => pc.id !== pendingId);
    await db.write();
  },

  async getAllUsers(): Promise<User[]> {
    await db.read();
    return db.data?.users || [];
  },
};

export default db;
