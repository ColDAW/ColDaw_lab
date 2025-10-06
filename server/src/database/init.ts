import { join } from 'path';
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import * as fs from 'fs';
import { connectToDatabase, getDatabaseConfig, getPgPool } from './config';

const dbDir = join(__dirname, '..', '..', 'projects');
const dbPath = join(dbDir, 'db.json');

export interface Project {
  id: string;
  name: string;
  userId?: string;
  created_at: number;
  updated_at: number;
  current_branch: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  name?: string;
  created_at: number;
  last_login?: number;
}

interface DatabaseSchema {
  projects: Project[];
  versions: any[];
  branches: any[];
  collaborators: any[];
  projectCollaborators: any[];
  users: any[];
  pendingChanges: any[];
}

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const adapter = new JSONFileSync<DatabaseSchema>(dbPath);
export const db = new LowSync<DatabaseSchema>(adapter, {
  projects: [],
  versions: [],
  branches: [],
  collaborators: [],
  projectCollaborators: [],
  users: [],
  pendingChanges: [],
});

export async function initDatabase() {
  const config = getDatabaseConfig();
  
  try {
    await connectToDatabase();
    
    if (config.type === 'postgresql') {
      // Initialize PostgreSQL schema
      const pool = getPgPool();
      if (pool) {
        const schemaSQL = fs.readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
        await pool.query(schemaSQL);
        console.log('📋 PostgreSQL schema initialized');
      }
    }
    
    if (config.type === 'lowdb') {
      db.read();
      console.log('📁 LowDB initialized');
    }
    
    console.log('💾 Database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Database instance is already exported above

export const dbHelpers = {
  // Project methods
  createProject: (projectData: any) => {
    db.read();
    const project = { id: require('uuid').v4(), ...projectData, created_at: Date.now(), updated_at: Date.now() };
    db.data.projects.push(project);
    db.write();
    return project;
  },
  insertProject: (projectData: any) => dbHelpers.createProject(projectData),
  getProject: (id: string) => { db.read(); return db.data.projects.find(p => p.id === id); },
  getAllProjects: () => { db.read(); return db.data.projects.sort((a, b) => b.updated_at - a.updated_at); },
  getUserProjects: (userId: string) => { db.read(); return db.data.projects.filter(p => p.userId === userId).sort((a, b) => b.updated_at - a.updated_at); },
  getProjectsByUser: (userId: string) => dbHelpers.getUserProjects(userId),
  updateProject: (id: string, updates: any) => { db.read(); const i = db.data.projects.findIndex(p => p.id === id); if (i !== -1) { db.data.projects[i] = { ...db.data.projects[i], ...updates, updated_at: Date.now() }; db.write(); return db.data.projects[i]; } return null; },
  deleteProject: (id: string) => { db.read(); db.data.projects = db.data.projects.filter(p => p.id !== id); db.write(); },

  // User methods (stubs)
  getUserByEmail: (email: string) => Promise.resolve({ id: '1', email, password: '$2b$10$hash', username: email.split('@')[0], name: email.split('@')[0], created_at: Date.now() }),
  insertUser: (userData: any) => Promise.resolve({ id: require('uuid').v4(), ...userData, created_at: Date.now() }),
  getUserById: (id: string) => Promise.resolve({ id, email: 'demo@example.com', password: '$2b$10$hash', username: 'demo', name: 'Demo User', created_at: Date.now() }),
  
  // Version methods (stubs)
  getVersion: (id: string) => Promise.resolve({ id, project_id: '1', branch: 'main', parent_id: null, message: 'Initial', author: 'demo', timestamp: Date.now(), data_path: '/tmp/data.json' }),
  getVersionsByProject: (projectId: string, branch?: string) => Promise.resolve([{ id: '1', project_id: projectId, branch: branch || 'main', parent_id: null, message: 'Initial', author: 'demo', timestamp: Date.now(), data_path: '/tmp/data.json' }]),
  insertVersion: (versionData: any) => Promise.resolve({ id: require('uuid').v4(), ...versionData, timestamp: Date.now() }),
  
  // Branch methods (stubs)
  getBranch: (projectId: string, name: string) => Promise.resolve({ id: '1', project_id: projectId, name, head_version_id: '1', created_at: Date.now() }),
  getBranchesByProject: (projectId: string) => Promise.resolve([{ id: '1', project_id: projectId, name: 'main', head_version_id: '1', created_at: Date.now() }]),
  insertBranch: (branchData: any) => Promise.resolve({ id: require('uuid').v4(), ...branchData, created_at: Date.now() }),
  updateBranch: (id: string, updates: any) => Promise.resolve({ id, ...updates }),
  
  // Collaborator methods (stubs)
  getCollaboratorsByProject: (projectId: string) => Promise.resolve([]),
  getCollaboratorBySocket: (socketId: string) => Promise.resolve({ id: '1', project_id: '1', user_name: 'demo', socket_id: socketId, color: '#000', last_seen: Date.now() }),
  insertCollaborator: (collaboratorData: any) => Promise.resolve({ id: require('uuid').v4(), ...collaboratorData }),
  updateCollaborator: (id: string, updates: any) => Promise.resolve({ id, ...updates }),
  deleteCollaborator: (id: string) => Promise.resolve(null),
  deleteCollaboratorsByUserAndProject: (userName: string, projectId: string) => Promise.resolve(null),
  
  // Project Collaborator methods (stubs)
  getProjectCollaboratorsByUser: (userId: string) => Promise.resolve([{ id: '1', project_id: '1', user_id: userId, role: 'owner', joined_at: Date.now() }]),
  insertProjectCollaborator: (data: any) => Promise.resolve({ id: require('uuid').v4(), ...data }),
  
  // Pending Changes methods (stubs)
  getPendingChangesForProject: (projectId: string) => Promise.resolve([{ id: '1', project_id: projectId, user_id: '1', change_type: 'add', file_path: '/tmp/test.als', content: '{}', timestamp: Date.now(), message: 'Test change', author: 'demo', created_at: Date.now() }]),
  getPendingChange: (id: string) => Promise.resolve({ id, project_id: '1', user_id: '1', change_type: 'add', file_path: '/tmp/test.als', content: '{}', timestamp: Date.now(), message: 'Test change', author: 'demo', data_path: '/tmp/data.json' }),
  deletePendingChange: (id: string) => Promise.resolve(null)
};

export default db;
