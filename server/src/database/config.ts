import mongoose from 'mongoose';
import { Pool } from 'pg';

export interface DatabaseConfig {
  type: 'mongodb' | 'postgresql' | 'lowdb';
  mongodb?: {
    uri: string;
  };
  postgresql?: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
}

let mongoConnection: typeof mongoose | null = null;
let pgPool: Pool | null = null;

export const getDatabaseConfig = (): DatabaseConfig => {
  const dbType = process.env.DATABASE_TYPE as 'mongodb' | 'postgresql' | 'lowdb' || 'lowdb';
  
  switch (dbType) {
    case 'mongodb':
      return {
        type: 'mongodb',
        mongodb: {
          uri: process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/coldaw'
        }
      };
    case 'postgresql':
      return {
        type: 'postgresql',
        postgresql: {
          host: process.env.PGHOST || 'localhost',
          port: parseInt(process.env.PGPORT || '5432'),
          database: process.env.PGDATABASE || 'coldaw',
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || ''
        }
      };
    default:
      return {
        type: 'lowdb'
      };
  }
};

export const connectToDatabase = async (): Promise<void> => {
  const config = getDatabaseConfig();
  
  try {
    switch (config.type) {
      case 'mongodb':
        if (!mongoConnection && config.mongodb) {
          console.log('🔌 Connecting to MongoDB...');
          mongoConnection = await mongoose.connect(config.mongodb.uri);
          console.log('✅ Connected to MongoDB');
        }
        break;
        
      case 'postgresql':
        if (!pgPool && config.postgresql) {
          console.log('🔌 Connecting to PostgreSQL...');
          pgPool = new Pool(config.postgresql);
          await pgPool.connect();
          console.log('✅ Connected to PostgreSQL');
        }
        break;
        
      default:
        console.log('📁 Using LowDB (file-based database)');
        break;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const getMongoConnection = () => mongoConnection;
export const getPgPool = () => pgPool;