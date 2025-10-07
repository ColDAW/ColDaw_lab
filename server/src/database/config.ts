import { Pool } from 'pg';

let pgPool: Pool | null = null;

export const getDatabaseUrl = (): string => {
  // Railway and most hosting providers set DATABASE_URL
  let dbUrl = process.env.DATABASE_URL || 
    `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'coldaw'}`;
  
  // Remove sslmode parameter if present, as we'll handle SSL in the Pool config
  dbUrl = dbUrl.replace(/[?&]sslmode=[^&]+/, '');
  
  return dbUrl;
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
    
    // Log database host (without credentials)
    const urlMatch = databaseUrl.match(/@([^:\/]+)/);
    if (urlMatch) {
      console.log(`🌐 Connecting to host: ${urlMatch[1]}`);
    }
    
    // Railway PostgreSQL requires SSL with specific configuration
    // Try multiple SSL configurations for better compatibility
    const sslConfig = isProduction ? {
      rejectUnauthorized: false,
      // Additional SSL options for Railway compatibility
    } : false;
    
    pgPool = new Pool({
      connectionString: databaseUrl,
      ssl: sslConfig,
      // Connection pool settings optimized for Railway
      max: 10, // Reduced from 20 to avoid too many connections
      min: 2, // Keep minimum connections alive
      idleTimeoutMillis: 60000, // Increased to 60 seconds
      connectionTimeoutMillis: 20000, // Increased to 20 seconds
      statement_timeout: 30000, // 30 second query timeout
      query_timeout: 30000, // 30 second query timeout
    });

    // Handle pool errors
    pgPool.on('error', (err) => {
      console.error('❌ Unexpected database pool error:', err);
    });

    pgPool.on('connect', () => {
      console.log('🔗 New database connection established');
    });

    pgPool.on('remove', () => {
      console.log('🔌 Database connection removed from pool');
    });

    // Test connection
    console.log('🔄 Attempting to connect...');
    const client = await pgPool.connect();
    await client.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');
    client.release();

    return pgPool;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    
    // Additional debug info
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
};

export const getPgPool = (): Pool => {
  if (!pgPool) {
    throw new Error('Database not initialized. Call connectToDatabase first.');
  }
  return pgPool;
};