import { join } from 'path';
import * as fs from 'fs';
import { connectToDatabase, getPgPool } from './config';
import { db } from './repository';

export { User, Project } from './repository';
export { db };

export async function initDatabase() {
  try {
    // Connect to PostgreSQL
    await connectToDatabase();
    
    // Initialize schema
    const pool = getPgPool();
    const schemaSQL = fs.readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSQL);
    
    console.log('💾 PostgreSQL database initialized');
    
    // Create system users if they don't exist
    await ensureSystemUsers();
    console.log('👤 System users ensured');
    
    // Clear stale collaborators on startup
    await db.clearAllCollaborators();
    console.log('🧹 Cleared all stale collaborators');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function ensureSystemUsers() {
  const pool = getPgPool();
  const now = Date.now();
  
  // Create vst-plugin-system user
  await pool.query(`
    INSERT INTO users (id, email, password, username, name, created_at, last_login)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (id) DO NOTHING
  `, ['vst-plugin-system', 'vst@system.local', '$2b$10$dummyHashForSystemUser', 'VST Plugin', 'VST Plugin System', now, now]);
  
  // Create anonymous-system user
  await pool.query(`
    INSERT INTO users (id, email, password, username, name, created_at, last_login)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (id) DO NOTHING
  `, ['anonymous-system', 'anonymous@system.local', '$2b$10$dummyHashForSystemUser', 'Anonymous', 'Anonymous User', now, now]);
}
