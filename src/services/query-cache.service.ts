interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class QueryCache {
  private static store = new Map<string, CacheEntry<any>>();
  private static HITS = 0;
  private static MISSES = 0;

  static get<T>(key: string): T | null {
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

  static set<T>(key: string, data: T, ttlMs: number = 30000): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  static invalidate(key: string): void {
    this.store.delete(key);
  }

  static invalidatePattern(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  static clear(): void {
    this.store.clear();
  }

  static stats(): { size: number; hits: number; misses: number } {
    return { size: this.store.size, hits: this.HITS, misses: this.MISSES };
  }

  static async wrap<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMs: number = 30000
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const data = await fetchFn();
    this.set(key, data, ttlMs);
    return data;
  }
}
