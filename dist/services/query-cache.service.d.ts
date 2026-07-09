export declare class QueryCache {
    private static store;
    private static HITS;
    private static MISSES;
    static get<T>(key: string): T | null;
    static set<T>(key: string, data: T, ttlMs?: number): void;
    static invalidate(key: string): void;
    static invalidatePattern(prefix: string): void;
    static clear(): void;
    static stats(): {
        size: number;
        hits: number;
        misses: number;
    };
    static wrap<T>(key: string, fetchFn: () => Promise<T>, ttlMs?: number): Promise<T>;
}
//# sourceMappingURL=query-cache.service.d.ts.map