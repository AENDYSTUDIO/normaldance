// Fallback для Redis при отсутствии подключения
export class RedisFallback {
  private cache = new Map<string, { value: any; expires: number }>()

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  async set(key: string, value: string, ttl = 300): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl * 1000
    })
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key)
  }
}

export const redisFallback = new RedisFallback()