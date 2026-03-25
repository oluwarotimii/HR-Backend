export declare class CacheService {
    static get<T>(key: string): Promise<T | null>;
    static set(key: string, value: any, ttl?: number): Promise<void>;
    static del(key: string): Promise<void>;
    static invalidatePattern(pattern: string): Promise<void>;
    static mget(keys: string[]): Promise<(any | null)[]>;
    static mset(data: {
        [key: string]: any;
    }, ttl?: number): Promise<void>;
    static isAvailable(): boolean;
    static getStats(): Promise<{
        isEnabled: boolean;
        connected: boolean;
        keyspaceHits?: number;
        keyspaceMisses?: number;
    }>;
}
//# sourceMappingURL=cache.service.d.ts.map