"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenDenylistService = void 0;
const redis_service_1 = require("./redis.service");
const KEY_PREFIX = 'auth:denylist:';
class TokenDenylistService {
    async revoke(jti, ttlSeconds) {
        if (!jti || ttlSeconds <= 0)
            return;
        await redis_service_1.redisService.execute((client) => client.set(`${KEY_PREFIX}${jti}`, '1', { EX: ttlSeconds }));
    }
    async isRevoked(jti) {
        if (!jti)
            return false;
        const result = await redis_service_1.redisService.execute((client) => client.get(`${KEY_PREFIX}${jti}`));
        return result !== null;
    }
}
exports.tokenDenylistService = new TokenDenylistService();
//# sourceMappingURL=token-denylist.service.js.map