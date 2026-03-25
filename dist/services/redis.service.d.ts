import { RedisClientType } from 'redis';
declare class RedisService {
    private client;
    private _isEnabled;
    constructor();
    connect(): Promise<void>;
    getClient(): RedisClientType | null;
    isEnabled(): boolean;
    disconnect(): Promise<void>;
    execute<T>(operation: (client: RedisClientType) => Promise<T>): Promise<T | null>;
}
export declare const redisService: RedisService;
export {};
//# sourceMappingURL=redis.service.d.ts.map