import NodeCache from 'node-cache'

// Create cache instance with 5 minute TTL
const sessionCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every minute
  useClones: false // Better performance
})

export interface CachedSession {
  user: {
    id: string
    username: string
    email: string
    role: string
  }
  expires: string
}

export class SessionCacheService {
  private static cache = sessionCache

  static get(sessionId: string): CachedSession | null {
    return this.cache.get<CachedSession>(sessionId) || null
  }

  static set(sessionId: string, session: CachedSession): void {
    this.cache.set(sessionId, session)
  }

  static delete(sessionId: string): void {
    this.cache.del(sessionId)
  }

  static clear(): void {
    this.cache.flushAll()
  }

  static getStats() {
    return this.cache.getStats()
  }
}