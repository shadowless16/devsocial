import NodeCache from 'node-cache'

// Cache for 5 minutes by default
const cache = new NodeCache({ stdTTL: 300 })

export const getCached = <T>(key: string): T | undefined => {
  return cache.get<T>(key)
}

export const setCached = <T>(key: string, value: T, ttl?: number): void => {
  cache.set(key, value, ttl || 300)
}

export const deleteCached = (key: string): void => {
  cache.del(key)
}

export const flushCache = (): void => {
  cache.flushAll()
}