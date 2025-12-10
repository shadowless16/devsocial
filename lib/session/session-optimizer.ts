"use client";

// Session optimization utilities
class SessionOptimizer {
  private static instance: SessionOptimizer;
  private sessionCache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  static getInstance(): SessionOptimizer {
    if (!SessionOptimizer.instance) {
      SessionOptimizer.instance = new SessionOptimizer();
    }
    return SessionOptimizer.instance;
  }

  getCachedSession(userId: string): unknown | null {
    const cached = this.sessionCache.get(userId);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.sessionCache.delete(userId);
      return null;
    }

    return cached.data;
  }

  setCachedSession(userId: string, sessionData: unknown): void {
    this.sessionCache.set(userId, {
      data: sessionData,
      timestamp: Date.now(),
    });
  }

  clearCache(): void {
    this.sessionCache.clear();
  }

  // Prevent multiple simultaneous session fetches
  private fetchPromises = new Map<string, Promise<unknown>>();

  async fetchSessionOnce(userId: string, fetchFn: () => Promise<unknown>): Promise<unknown> {
    // Check cache first
    const cached = this.getCachedSession(userId);
    if (cached) return cached;

    // Check if already fetching
    const existingPromise = this.fetchPromises.get(userId);
    if (existingPromise) return existingPromise;

    // Create new fetch promise
    const promise = fetchFn().finally(() => {
      this.fetchPromises.delete(userId);
    });

    this.fetchPromises.set(userId, promise);
    return promise;
  }
}

export const sessionOptimizer = SessionOptimizer.getInstance();