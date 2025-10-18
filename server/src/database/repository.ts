import { Pool, QueryResult } from 'pg';
import { getPgPool } from './config';
import { v4 as uuidv4 } from 'uuid';

export interface Project {
  id: string;
  name: string;
  user_id?: string;
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

export interface Version {
  id: string;
  project_id: string;
  branch: string;
  message: string;
  user_id: string;
  parent_id?: string;
  timestamp: number;
  files?: any;
}

export interface Collaborator {
  id: string;
  project_id: string;
  user_id: string;
  socket_id: string;
  joined_at: number;
  last_activity: number;
}

export interface Branch {
  id: string;
  project_id: string;
  name: string;
  created_at: number;
  created_by: string;
}

export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  added_at: number;
}

export interface PendingChange {
  id: string;
  project_id: string;
  user_id: string;
  changes: any;
  timestamp: number;
}

class PostgresDatabase {
  private pool: Pool | null = null;

  constructor() {
    // Pool will be initialized lazily
  }

  private getPool(): Pool {
    if (!this.pool) {
      this.pool = getPgPool();
    }
    return this.pool;
  }

  // User methods
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.getPool().query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await this.getPool().query<User>(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.getPool().query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async insertUser(user: User): Promise<User> {
    const result = await this.getPool().query<User>(
      `INSERT INTO users (id, email, password, username, name, created_at, last_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user.id, user.email, user.password, user.username, user.name, user.created_at, user.last_login]
    );
    return result.rows[0];
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await this.getPool().query(
      'UPDATE users SET last_login = $1 WHERE id = $2',
      [Date.now(), id]
    );
  }

  async deleteUser(id: string): Promise<void> {
    await this.getPool().query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    const result = await this.getPool().query<Project>(
      'SELECT * FROM projects ORDER BY updated_at DESC'
    );
    return result.rows;
  }

  async getProjectById(id: string): Promise<Project | null> {
    try {
      const result = await this.getPool().query<Project>(
        'SELECT * FROM projects WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching project by id:', id, error);
      throw error;
    }
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    const result = await this.getPool().query<Project>(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    return result.rows;
  }

  async insertProject(project: Project): Promise<Project> {
    const result = await this.getPool().query<Project>(
      `INSERT INTO projects (id, name, user_id, created_at, updated_at, current_branch)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [project.id, project.name, project.user_id, project.created_at, project.updated_at, project.current_branch]
    );
    return result.rows[0];
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.current_branch !== undefined) {
      fields.push(`current_branch = $${paramCount++}`);
      values.push(updates.current_branch);
    }
    if (updates.updated_at !== undefined) {
      fields.push(`updated_at = $${paramCount++}`);
      values.push(updates.updated_at);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await this.getPool().query<Project>(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteProject(id: string): Promise<void> {
    await this.getPool().query('DELETE FROM projects WHERE id = $1', [id]);
  }

  // Version methods
  async getVersion(id: string): Promise<Version | null> {
    const result = await this.getPool().query<Version>(
      'SELECT * FROM versions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async getVersionsByProject(projectId: string, branch?: string): Promise<Version[]> {
    let query = 'SELECT * FROM versions WHERE project_id = $1';
    const params: any[] = [projectId];

    if (branch) {
      query += ' AND branch = $2';
      params.push(branch);
    }

    query += ' ORDER BY timestamp DESC';
    const result = await this.getPool().query<Version>(query, params);
    return result.rows;
  }

  async insertVersion(version: Version): Promise<Version> {
    const result = await this.getPool().query<Version>(
      `INSERT INTO versions (id, project_id, branch, message, user_id, parent_id, timestamp, files)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [version.id, version.project_id, version.branch, version.message, version.user_id, version.parent_id, version.timestamp, JSON.stringify(version.files)]
    );
    return result.rows[0];
  }

  // Branch methods
  async getBranch(projectId: string, name: string): Promise<Branch | null> {
    const result = await this.getPool().query<Branch>(
      'SELECT * FROM branches WHERE project_id = $1 AND name = $2',
      [projectId, name]
    );
    return result.rows[0] || null;
  }

  async getBranchesByProject(projectId: string): Promise<Branch[]> {
    const result = await this.getPool().query<Branch>(
      'SELECT * FROM branches WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    return result.rows;
  }

  async insertBranch(branch: Branch): Promise<Branch> {
    const result = await this.getPool().query<Branch>(
      `INSERT INTO branches (id, project_id, name, created_at, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [branch.id, branch.project_id, branch.name, branch.created_at, branch.created_by]
    );
    return result.rows[0];
  }

  // Collaborator methods
  async getCollaboratorsByProject(projectId: string): Promise<Collaborator[]> {
    const result = await this.getPool().query<Collaborator>(
      'SELECT * FROM collaborators WHERE project_id = $1',
      [projectId]
    );
    return result.rows;
  }

  async getCollaboratorBySocket(socketId: string): Promise<Collaborator | null> {
    const result = await this.getPool().query<Collaborator>(
      'SELECT * FROM collaborators WHERE socket_id = $1',
      [socketId]
    );
    return result.rows[0] || null;
  }

  async insertCollaborator(collaborator: Collaborator): Promise<Collaborator> {
    const result = await this.getPool().query<Collaborator>(
      `INSERT INTO collaborators (id, project_id, user_id, socket_id, joined_at, last_activity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [collaborator.id, collaborator.project_id, collaborator.user_id, collaborator.socket_id, collaborator.joined_at, collaborator.last_activity]
    );
    return result.rows[0];
  }

  async updateCollaborator(id: string, updates: Partial<Collaborator>): Promise<Collaborator | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.last_activity !== undefined) {
      fields.push(`last_activity = $${paramCount++}`);
      values.push(updates.last_activity);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await this.getPool().query<Collaborator>(
      `UPDATE collaborators SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteCollaborator(id: string): Promise<void> {
    await this.getPool().query('DELETE FROM collaborators WHERE id = $1', [id]);
  }

  async deleteCollaboratorsByUserAndProject(userId: string, projectId: string): Promise<void> {
    await this.getPool().query(
      'DELETE FROM collaborators WHERE user_id = $1 AND project_id = $2',
      [userId, projectId]
    );
  }

  async clearAllCollaborators(): Promise<void> {
    await this.getPool().query('DELETE FROM collaborators');
  }

  // Project Collaborator methods
  async getProjectCollaboratorsByUser(userId: string): Promise<ProjectCollaborator[]> {
    const result = await this.getPool().query<ProjectCollaborator>(
      'SELECT * FROM project_collaborators WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  }

  async insertProjectCollaborator(data: ProjectCollaborator): Promise<ProjectCollaborator> {
    const result = await this.getPool().query<ProjectCollaborator>(
      `INSERT INTO project_collaborators (id, project_id, user_id, role, added_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.id, data.project_id, data.user_id, data.role, data.added_at]
    );
    return result.rows[0];
  }

  // Pending Changes methods
  async getPendingChangesForProject(projectId: string): Promise<PendingChange[]> {
    const result = await this.getPool().query<PendingChange>(
      'SELECT * FROM pending_changes WHERE project_id = $1 ORDER BY timestamp ASC',
      [projectId]
    );
    return result.rows;
  }

  async getPendingChange(id: string): Promise<PendingChange | null> {
    const result = await this.getPool().query<PendingChange>(
      'SELECT * FROM pending_changes WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async insertPendingChange(change: PendingChange): Promise<PendingChange> {
    const result = await this.getPool().query<PendingChange>(
      `INSERT INTO pending_changes (id, project_id, user_id, changes, timestamp)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [change.id, change.project_id, change.user_id, JSON.stringify(change.changes), change.timestamp]
    );
    return result.rows[0];
  }

  async deletePendingChange(id: string): Promise<void> {
    await this.getPool().query('DELETE FROM pending_changes WHERE id = $1', [id]);
  }

  // Legacy method aliases for backward compatibility
  async getProject(id: string): Promise<Project | null> {
    return this.getProjectById(id);
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return this.getProjectsByUserId(userId);
  }

  async getAllProjects(): Promise<Project[]> {
    return this.getProjects();
  }

  // Stub methods for features not yet migrated
  async updateBranch(id: string, updates: any): Promise<void> {
    // Branch updates not implemented yet
    console.warn('Branch update not implemented:', id, updates);
  }
}

export const db = new PostgresDatabase();