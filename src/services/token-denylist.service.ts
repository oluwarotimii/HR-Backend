import { redisService } from './redis.service';

// Session (jti) revocation store. Backed by Redis when enabled; when Redis is
// disabled or unreachable, revocation checks fail open (treated as "not
// revoked") — same graceful-degradation contract as the rest of redisService,
// so auth keeps working without Redis, it just loses the ability to revoke a
// session before its token naturally expires.
const KEY_PREFIX = 'auth:denylist:';

class TokenDenylistService {
  async revoke(jti: string, ttlSeconds: number): Promise<void> {
    if (!jti || ttlSeconds <= 0) return;
    await redisService.execute((client) => client.set(`${KEY_PREFIX}${jti}`, '1', { EX: ttlSeconds }));
  }

  async isRevoked(jti: string): Promise<boolean> {
    if (!jti) return false;
    const result = await redisService.execute((client) => client.get(`${KEY_PREFIX}${jti}`));
    return result !== null;
  }
}

export const tokenDenylistService = new TokenDenylistService();
