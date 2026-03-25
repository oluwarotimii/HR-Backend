import { redisService } from './redis.service';
export class CacheService {
    static async get(key) {
        const result = await redisService.execute(async (client) => {
            const cached = await client.get(key);
            return cached ? JSON.parse(cached) : null;
        });
        return result !== null ? result : null;
    }
    static async set(key, value, ttl = 3600) {
        await redisService.execute(async (client) => {
            await client.setEx(key, ttl, JSON.stringify(value));
        });
    }
    static async del(key) {
        await redisService.execute(async (client) => {
            await client.del(key);
        });
    }
    static async invalidatePattern(pattern) {
        await redisService.execute(async (client) => {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
            }
        });
    }
    static async mget(keys) {
        const result = await redisService.execute(async (client) => {
            const values = await client.mGet(keys);
            return values.map((val) => val ? JSON.parse(val) : null);
        });
        return result !== null ? result : keys.map(() => null);
    }
    static async mset(data, ttl = 3600) {
        await redisService.execute(async (client) => {
            const multi = client.multi();
            Object.entries(data).forEach(([key, value]) => {
                multi.setEx(key, ttl, JSON.stringify(value));
            });
            await multi.exec();
        });
    }
    static isAvailable() {
        return redisService.isEnabled();
    }
    static async getStats() {
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
        const lines = info.split('\n');
        const stats = {};
        lines.forEach((line) => {
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
//# sourceMappingURL=cache.service.js.map