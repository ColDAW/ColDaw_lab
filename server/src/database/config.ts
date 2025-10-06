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
    
    const databaseUrl = getDatabaseUrl();
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`🔐 SSL enabled: ${isProduction}`);
    
    // Railway PostgreSQL requires SSL with specific configuration
    // Always use SSL in production environments like Railway
    
    pgPool = new Pool({
      connectionString: databaseUrl,
      // Railway needs SSL enabled but without certificate verification
      ssl: isProduction ? {
        rejectUnauthorized: false
      } : false,
      // Connection pool settings
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Test connection
    const client = await pgPool.connect();
    await client.query('SELECT NOW()');
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