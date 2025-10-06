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
    
    // Clear stale collaborators on startup
    await db.clearAllCollaborators();
    console.log('🧹 Cleared all stale collaborators');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
