import { createClient, RedisClientType } from 'redis';

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    try {
      // Railway Redis URL format: redis://default:password@host:port
      const redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL || 'redis://localhost:6379';
      
      console.log('🔍 Redis connection attempt to:', redisUrl.replace(/\/\/.*@/, '//***:***@')); // [Comment removed]
      
      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 15000,  // [Comment removed]
          reconnectStrategy: (retries) => {
            if (retries > 5) {
              console.error('❌ Redis reconnection failed after 5 attempts');
              return false;
            }
            const delay = Math.min(retries * 1000, 5000);
            console.log(`🔄 Redis reconnection attempt ${retries} in ${delay}ms`);
            return delay;
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('⚠️ Redis Client Disconnected');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis Client Reconnecting...');
      });

      await this.client.connect();
      this.isConnected = true;
      console.log('✅ Redis connection established successfully');
    } catch (error: any) {
      console.error('❌ Failed to connect to Redis:', error.message);
      this.isConnected = false;
      
      // [Comment removed]
      if (process.env.NODE_ENV === 'development') {
        // console.log removed;
        // console.log removed;
        // console.log removed;
        // console.log removed;
      }
      
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('Redis disconnected');
    }
  }

  async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    if (expireInSeconds) {
      await this.client.setEx(key, expireInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    return await this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    const result = await this.client.exists(key);
    return result === 1;
  }

  async getTTL(key: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    return await this.client.ttl(key);
  }

  isHealthy(): boolean {
    return this.isConnected && this.client !== null;
  }
}

// [Comment removed]
export const redisService = new RedisService();

// [Comment removed]
process.on('SIGINT', async () => {
  console.log('Shutting down Redis connection...');
  await redisService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down Redis connection...');
  await redisService.disconnect();
  process.exit(0);
});