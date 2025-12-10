// Simple in-memory cache utility
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<Record<string, unknown>>>();
  
  set<T = Record<string, unknown>>(key: string, data: T, ttlMs: number = 60000): void {
    this.cache.set(key, {
      data: data as Record<string, unknown>,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  get<T = Record<string, unknown>>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Clean expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new SimpleCache();

// Cleanup expired items every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);