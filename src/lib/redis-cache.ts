// Fallback cache если Redis недоступен
const memoryCache = new Map<string, { value: any; expires: number }>()

let redis: any = null
try {
  const { Redis } = require('@upstash/redis')
  redis = Redis.fromEnv()
} catch {
  console.log('Redis not available, using memory cache')
}

export class FastCache {
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (redis) {
        const data = await redis.get(key)
        return data as T
      } else {
        // Memory fallback
        const cached = memoryCache.get(key)
        if (cached && cached.expires > Date.now()) {
          return cached.value as T
        }
        return null
      }
    } catch {
      return null
    }
  }
  
  static async set(key: string, value: any, ttl = 300): Promise<void> {
    try {
      if (redis) {
        await redis.set(key, value, { ex: ttl })
      } else {
        // Memory fallback
        memoryCache.set(key, {
          value,
          expires: Date.now() + (ttl * 1000)
        })
        
        // Cleanup old entries
        if (memoryCache.size > 1000) {
          const now = Date.now()
          for (const [k, v] of memoryCache.entries()) {
            if (v.expires < now) {
              memoryCache.delete(k)
            }
          }
        }
      }
    } catch (error) {
      console.error('Cache set failed:', error)
    }
  }
  
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete failed:', error)
    }
  }
  
  // Специальные методы для частых операций
  static async cacheTrack(trackId: string, track: any): Promise<void> {
    await this.set(`track:${trackId}`, track, 600) // 10 минут
  }
  
  static async getCachedTrack(trackId: string): Promise<any> {
    return this.get(`track:${trackId}`)
  }
  
  static async cacheUser(userId: string, user: any): Promise<void> {
    await this.set(`user:${userId}`, user, 1800) // 30 минут
  }
  
  static async getCachedUser(userId: string): Promise<any> {
    return this.get(`user:${userId}`)
  }
}

// Декоратор для кеширования функций
export function cached(ttl = 300) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`
      
      let result = await FastCache.get(key)
      if (result) return result
      
      result = await method.apply(this, args)
      await FastCache.set(key, result, ttl)
      
      return result
    }
  }
}