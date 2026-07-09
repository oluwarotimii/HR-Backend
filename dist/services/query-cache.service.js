"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryCache = void 0;
class QueryCache {
    static store = new Map();
    static HITS = 0;
    static MISSES = 0;
    static get(key) {
        const entry = this.store.get(key);
        if (!entry) {
            this.MISSES++;
            return null;
        }
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            this.MISSES++;
            return null;
        }
        this.HITS++;
        return entry.data;
    }
    static set(key, data, ttlMs = 30000) {
        this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
    }
    static invalidate(key) {
        this.store.delete(key);
    }
    static invalidatePattern(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix))
                this.store.delete(key);
        }
    }
    static clear() {
        this.store.clear();
    }
    static stats() {
        return { size: this.store.size, hits: this.HITS, misses: this.MISSES };
    }
    static async wrap(key, fetchFn, ttlMs = 30000) {
        const cached = this.get(key);
        if (cached !== null)
            return cached;
        const data = await fetchFn();
        this.set(key, data, ttlMs);
        return data;
    }
}
exports.QueryCache = QueryCache;
//# sourceMappingURL=query-cache.service.js.map