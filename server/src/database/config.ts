import { Pool } from 'pg';

let pgPool: Pool | null = null;

export const getDatabaseUrl = (): string => {
  // Railway and most hosting providers set DATABASE_URL
  return process.env.DATABASE_URL || 
    `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'coldaw'}`;
};

export const connectToDatabase = async (): Promise<Pool> => {
  if (pgPool) {
    return pgPool;
  }

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    
    pgPool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Test connection
    const client = await pgPool.connect();
    console.log('✅ Connected to PostgreSQL');
    client.release();

    return pgPool;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
};

export const getPgPool = (): Pool => {
  if (!pgPool) {
    throw new Error('Database not initialized. Call connectToDatabase first.');
  }
  return pgPool;
};