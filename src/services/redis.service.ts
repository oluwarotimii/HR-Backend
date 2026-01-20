import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

class RedisService {
  private client: RedisClientType | null = null;
  private _isEnabled: boolean;

  constructor() {
    // Check if Redis is enabled via environment variable
    this._isEnabled = process.env.REDIS_ENABLED === 'true' || process.env.REDIS_ENABLED === '1';
  }

  async connect(): Promise<void> {
    if (!this._isEnabled) {
      console.log('Redis is disabled via environment variable');
      return;
    }

    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries: number) => {
            // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms, max 30s
            if (retries > 10) {
              console.error('Redis connection failed after 10 retries');
              return false;
            }
            return Math.min(1000 * Math.pow(2, retries), 30000);
          }
        }
      });

      this.client.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
        // Don't crash the app if Redis fails - just disable it
        this._isEnabled = false;
      });

      this.client.on('connect', () => {
        console.log('Connected to Redis');
      });

      this.client.on('reconnecting', () => {
        console.log('Reconnecting to Redis...');
      });

      await this.client.connect();
      console.log('Connected to Redis successfully');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      console.log('Redis functionality will be disabled');
      this._isEnabled = false;
    }
  }

  getClient(): RedisClientType | null {
    return this._isEnabled ? this.client : null;
  }

  isEnabled(): boolean {
    return this._isEnabled;
  }

  async disconnect(): Promise<void> {
    if (this.client && this._isEnabled) {
      try {
        await this.client.quit();
        console.log('Disconnected from Redis');
      } catch (error) {
        console.error('Error disconnecting from Redis:', error);
      }
    }
  }

  // Graceful fallback wrapper for Redis operations
  async execute<T>(operation: (client: RedisClientType) => Promise<T>): Promise<T | null> {
    if (!this._isEnabled || !this.client) {
      return null;
    }

    try {
      return await operation(this.client);
    } catch (error) {
      console.error('Redis operation failed:', error);
      // Disable Redis for this session to prevent repeated failures
      this._isEnabled = false;
      return null;
    }
  }
}

export const redisService = new RedisService();