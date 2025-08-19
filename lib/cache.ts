// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

export function getCached<T>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null
  
  if (Date.now() - item.timestamp > item.ttl) {
    cache.delete(key)
    return null
  }
  
  return item.data
}

export function setCache<T>(key: string, data: T, ttlMs: number = 30000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  })
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    return
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}