import { redisService } from './redis.service';

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    const result = await redisService.execute(async (client) => {
      const cached = await client.get(key);
      return cached ? JSON.parse(cached) : null;
    });

    return result !== null ? result : null;
  }

  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await redisService.execute(async (client) => {
      await client.setEx(key, ttl, JSON.stringify(value));
    });
  }

  static async del(key: string): Promise<void> {
    await redisService.execute(async (client) => {
      await client.del(key);
    });
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    await redisService.execute(async (client) => {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    });
  }

  // Batch operations for better performance
  static async mget(keys: string[]): Promise<(any | null)[]> {
    const result = await redisService.execute(async (client) => {
      const values = await client.mGet(keys);
      return values.map((val: string | null) => val ? JSON.parse(val) : null);
    });

    return result !== null ? result : keys.map(() => null);
  }

  static async mset(data: { [key: string]: any }, ttl: number = 3600): Promise<void> {
    await redisService.execute(async (client) => {
      const multi = client.multi();
      
      Object.entries(data).forEach(([key, value]) => {
        multi.setEx(key, ttl, JSON.stringify(value));
      });
      
      await multi.exec();
    });
  }

  // Check if Redis is available
  static isAvailable(): boolean {
    return redisService.isEnabled();
  }

  // Get cache stats for monitoring
  static async getStats(): Promise<{
    isEnabled: boolean;
    connected: boolean;
    keyspaceHits?: number;
    keyspaceMisses?: number
  }> {
    const isEnabled = redisService.isEnabled();

    if (!isEnabled) {
      return { isEnabled, connected: false };
    }

    const info = await redisService.execute(async (client) => {
      return await client.info('stats');
    });

    if (!info) {
      return { isEnabled, connected: false };
    }

    // Parse Redis info to extract stats
    const lines = info.split('\n');
    const stats: any = {};

    lines.forEach((line: string) => {
      if (line.startsWith('keyspace_hits') || line.startsWith('keyspace_misses')) {
        const [key, value] = line.split(':');
        stats[key.trim()] = parseInt(value.trim());
      }
    });

    return {
      isEnabled,
      connected: true,
      keyspaceHits: stats.keyspace_hits,
      keyspaceMisses: stats.keyspace_misses
    };
  }
}