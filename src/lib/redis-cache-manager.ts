/**
 * Advanced Redis Cache Manager
 * Provides intelligent caching with multiple strategies, compression, and monitoring
 */

import Redis from 'ioredis'
import { createHash } from 'crypto'
import { gzip, gunzip } from 'zlib'
import { promisify } from 'util'

const gzipAsync = promisify(gzip)
const gunzipAsync = promisify(gunzip)

interface CacheConfig {
  host: string
  port: number
  password?: string
  db: number
  keyPrefix: string
  defaultTTL: number
  maxMemory: string
  compressionThreshold: number
  enableCompression: boolean
  enableClustering: boolean
  retryDelayOnFailover: number
  maxRetriesPerRequest: number
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  compressed: boolean
  size: number
  accessCount: number
  lastAccessed: number
  tags: string[]
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  compressionRatio: number
  memoryUsage: number
  keyCount: number
  averageResponseTime: number
}

interface CacheOptions {
  ttl?: number
  tags?: string[]
  compress?: boolean
  priority?: 'low' | 'normal' | 'high'
  namespace?: string
}

interface CachePattern {
  pattern: string
  strategy: 'exact' | 'prefix' | 'suffix' | 'contains'
}

class RedisCacheManager {
  private redis: Redis
  private config: CacheConfig
  private stats: CacheStats
  private responseTimes: number[] = []
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'normaldance:',
      defaultTTL: parseInt(process.env.REDIS_DEFAULT_TTL || '3600'),
      maxMemory: process.env.REDIS_MAX_MEMORY || '256mb',
      compressionThreshold: parseInt(process.env.REDIS_COMPRESSION_THRESHOLD || '1024'),
      enableCompression: process.env.REDIS_ENABLE_COMPRESSION === 'true',
      enableClustering: process.env.REDIS_ENABLE_CLUSTERING === 'true',
      retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
      ...config
    }

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      compressionRatio: 0,
      memoryUsage: 0,
      keyCount: 0,
      averageResponseTime: 0
    }

    this.initializeRedis()
  }

  private initializeRedis(): void {
    const redisConfig: any = {
      host: this.config.host,
      port: this.config.port,
      db: this.config.db,
      retryDelayOnFailover: this.config.retryDelayOnFailover,
      maxRetriesPerRequest: this.config.maxRetriesPerRequest,
      lazyConnect: true,
      keyPrefix: this.config.keyPrefix,
      maxmemoryPolicy: 'allkeys-lru'
    }

    if (this.config.password) {
      redisConfig.password = this.config.password
    }

    if (this.config.enableClustering) {
      this.redis = new Redis.Cluster([
        { host: this.config.host, port: this.config.port }
      ], {
        redisOptions: redisConfig,
        enableOfflineQueue: false
      })
    } else {
      this.redis = new Redis(redisConfig)
    }

    this.setupEventHandlers()
    this.connect()
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      console.log('Redis connected')
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.redis.on('error', (error) => {
      console.error('Redis error:', error)
      this.isConnected = false
    })

    this.redis.on('close', () => {
      console.log('Redis connection closed')
      this.isConnected = false
      this.handleReconnection()
    })

    this.redis.on('reconnecting', () => {
      console.log('Redis reconnecting...')
      this.reconnectAttempts++
    })
  }

  private async connect(): Promise<void> {
    try {
      await this.redis.connect()
      await this.configureRedis()
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
      this.handleReconnection()
    }
  }

  private async configureRedis(): Promise<void> {
    try {
      // Set max memory policy
      await this.redis.config('SET', 'maxmemory-policy', 'allkeys-lru')
      
      // Set max memory
      await this.redis.config('SET', 'maxmemory', this.config.maxMemory)
      
      // Enable compression for large values
      if (this.config.enableCompression) {
        await this.redis.config('SET', 'hash-max-ziplist-entries', '512')
        await this.redis.config('SET', 'hash-max-ziplist-value', '64')
      }
    } catch (error) {
      console.warn('Failed to configure Redis:', error)
    }
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.connect()
      }, this.reconnectAttempts * 1000)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  private generateKey(namespace: string, key: string, options?: CacheOptions): string {
    const fullKey = options?.namespace ? `${options.namespace}:${key}` : key
    return `${namespace}:${fullKey}`
  }

  private async compressData(data: any): Promise<{ data: Buffer, compressed: boolean }> {
    if (!this.config.enableCompression) {
      return { data: Buffer.from(JSON.stringify(data)), compressed: false }
    }

    const jsonString = JSON.stringify(data)
    const originalSize = Buffer.byteLength(jsonString, 'utf8')

    if (originalSize < this.config.compressionThreshold) {
      return { data: Buffer.from(jsonString), compressed: false }
    }

    try {
      const compressed = await gzipAsync(jsonString)
      return { data: compressed, compressed: true }
    } catch (error) {
      console.warn('Compression failed, using uncompressed data:', error)
      return { data: Buffer.from(jsonString), compressed: false }
    }
  }

  private async decompressData(data: Buffer, compressed: boolean): Promise<any> {
    if (!compressed) {
      return JSON.parse(data.toString('utf8'))
    }

    try {
      const decompressed = await gunzipAsync(data)
      return JSON.parse(decompressed.toString('utf8'))
    } catch (error) {
      console.error('Decompression failed:', error)
      throw new Error('Failed to decompress cached data')
    }
  }

  private updateStats(operation: keyof CacheStats, value: number = 1): void {
    this.stats[operation] += value
  }

  private recordResponseTime(startTime: number): void {
    const responseTime = Date.now() - startTime
    this.responseTimes.push(responseTime)
    
    // Keep only last 100 response times
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift()
    }
    
    this.stats.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
  }

  /**
   * Get data from cache
   */
  async get<T>(namespace: string, key: string, options?: CacheOptions): Promise<T | null> {
    if (!this.isConnected) {
      this.stats.misses++
      return null
    }

    const startTime = Date.now()
    const cacheKey = this.generateKey(namespace, key, options)

    try {
      const cached = await this.redis.get(cacheKey)
      
      if (!cached) {
        this.stats.misses++
        this.recordResponseTime(startTime)
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(cached)
      
      // Check if entry is expired
      if (Date.now() - entry.timestamp > entry.ttl * 1000) {
        await this.redis.del(cacheKey)
        this.stats.misses++
        this.recordResponseTime(startTime)
        return null
      }

      // Decompress if needed
      const data = await this.decompressData(Buffer.from(entry.data as any), entry.compressed)
      
      // Update access statistics
      entry.accessCount++
      entry.lastAccessed = Date.now()
      await this.redis.setex(cacheKey, entry.ttl, JSON.stringify(entry))

      this.stats.hits++
      this.recordResponseTime(startTime)
      
      return data
    } catch (error) {
      console.error('Cache get error:', error)
      this.stats.misses++
      this.recordResponseTime(startTime)
      return null
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(namespace: string, key: string, data: T, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isConnected) {
      return false
    }

    const startTime = Date.now()
    const cacheKey = this.generateKey(namespace, key, options)
    const ttl = options.ttl || this.config.defaultTTL

    try {
      // Compress data if needed
      const { data: compressedData, compressed } = await this.compressData(data)
      
      const entry: CacheEntry<T> = {
        data: compressedData as any,
        timestamp: Date.now(),
        ttl,
        compressed,
        size: compressedData.length,
        accessCount: 0,
        lastAccessed: Date.now(),
        tags: options.tags || []
      }

      await this.redis.setex(cacheKey, ttl, JSON.stringify(entry))
      
      // Add to tag index if tags are provided
      if (options.tags && options.tags.length > 0) {
        await this.addToTagIndex(cacheKey, options.tags)
      }

      this.stats.sets++
      this.recordResponseTime(startTime)
      
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      this.recordResponseTime(startTime)
      return false
    }
  }

  /**
   * Delete data from cache
   */
  async delete(namespace: string, key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.isConnected) {
      return false
    }

    const startTime = Date.now()
    const cacheKey = this.generateKey(namespace, key, options)

    try {
      const result = await this.redis.del(cacheKey)
      this.stats.deletes++
      this.recordResponseTime(startTime)
      
      return result > 0
    } catch (error) {
      console.error('Cache delete error:', error)
      this.recordResponseTime(startTime)
      return false
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(namespace: string, pattern: string): Promise<number> {
    if (!this.isConnected) {
      return 0
    }

    const startTime = Date.now()
    const searchPattern = this.generateKey(namespace, pattern)

    try {
      const keys = await this.redis.keys(searchPattern)
      if (keys.length === 0) {
        return 0
      }

      const result = await this.redis.del(...keys)
      this.stats.deletes += result
      this.recordResponseTime(startTime)
      
      return result
    } catch (error) {
      console.error('Cache delete by pattern error:', error)
      this.recordResponseTime(startTime)
      return 0
    }
  }

  /**
   * Delete by tags
   */
  async deleteByTags(namespace: string, tags: string[]): Promise<number> {
    if (!this.isConnected || tags.length === 0) {
      return 0
    }

    const startTime = Date.now()
    let deletedCount = 0

    try {
      for (const tag of tags) {
        const tagKey = `${this.config.keyPrefix}tag:${namespace}:${tag}`
        const keys = await this.redis.smembers(tagKey)
        
        if (keys.length > 0) {
          const result = await this.redis.del(...keys)
          deletedCount += result
          
          // Remove tag index
          await this.redis.del(tagKey)
        }
      }

      this.stats.deletes += deletedCount
      this.recordResponseTime(startTime)
      
      return deletedCount
    } catch (error) {
      console.error('Cache delete by tags error:', error)
      this.recordResponseTime(startTime)
      return 0
    }
  }

  /**
   * Add key to tag index
   */
  private async addToTagIndex(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagKey = `${this.config.keyPrefix}tag:${tag}`
      await this.redis.sadd(tagKey, key)
      await this.redis.expire(tagKey, this.config.defaultTTL)
    }
  }

  /**
   * Check if key exists
   */
  async exists(namespace: string, key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.isConnected) {
      return false
    }

    const cacheKey = this.generateKey(namespace, key, options)
    
    try {
      const result = await this.redis.exists(cacheKey)
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  /**
   * Get multiple keys at once
   */
  async mget<T>(namespace: string, keys: string[], options?: CacheOptions): Promise<(T | null)[]> {
    if (!this.isConnected || keys.length === 0) {
      return keys.map(() => null)
    }

    const startTime = Date.now()
    const cacheKeys = keys.map(key => this.generateKey(namespace, key, options))

    try {
      const results = await this.redis.mget(...cacheKeys)
      const parsedResults: (T | null)[] = []

      for (let i = 0; i < results.length; i++) {
        if (results[i]) {
          try {
            const entry: CacheEntry<T> = JSON.parse(results[i]!)
            
            // Check if entry is expired
            if (Date.now() - entry.timestamp > entry.ttl * 1000) {
              await this.redis.del(cacheKeys[i])
              parsedResults.push(null)
              continue
            }

            const data = await this.decompressData(Buffer.from(entry.data as any), entry.compressed)
            parsedResults.push(data)
            this.stats.hits++
          } catch (error) {
            console.error('Error parsing cached data:', error)
            parsedResults.push(null)
          }
        } else {
          parsedResults.push(null)
          this.stats.misses++
        }
      }

      this.recordResponseTime(startTime)
      return parsedResults
    } catch (error) {
      console.error('Cache mget error:', error)
      this.recordResponseTime(startTime)
      return keys.map(() => null)
    }
  }

  /**
   * Set multiple keys at once
   */
  async mset<T>(namespace: string, data: Record<string, T>, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isConnected || Object.keys(data).length === 0) {
      return false
    }

    const startTime = Date.now()
    const ttl = options.ttl || this.config.defaultTTL

    try {
      const pipeline = this.redis.pipeline()

      for (const [key, value] of Object.entries(data)) {
        const cacheKey = this.generateKey(namespace, key, options)
        const { data: compressedData, compressed } = await this.compressData(value)
        
        const entry: CacheEntry<T> = {
          data: compressedData as any,
          timestamp: Date.now(),
          ttl,
          compressed,
          size: compressedData.length,
          accessCount: 0,
          lastAccessed: Date.now(),
          tags: options.tags || []
        }

        pipeline.setex(cacheKey, ttl, JSON.stringify(entry))
      }

      await pipeline.exec()
      this.stats.sets += Object.keys(data).length
      this.recordResponseTime(startTime)
      
      return true
    } catch (error) {
      console.error('Cache mset error:', error)
      this.recordResponseTime(startTime)
      return false
    }
  }

  /**
   * Increment a numeric value
   */
  async increment(namespace: string, key: string, value: number = 1, options?: CacheOptions): Promise<number> {
    if (!this.isConnected) {
      return 0
    }

    const cacheKey = this.generateKey(namespace, key, options)
    
    try {
      const result = await this.redis.incrby(cacheKey, value)
      return result
    } catch (error) {
      console.error('Cache increment error:', error)
      return 0
    }
  }

  /**
   * Set expiration for a key
   */
  async expire(namespace: string, key: string, ttl: number, options?: CacheOptions): Promise<boolean> {
    if (!this.isConnected) {
      return false
    }

    const cacheKey = this.generateKey(namespace, key, options)
    
    try {
      const result = await this.redis.expire(cacheKey, ttl)
      return result === 1
    } catch (error) {
      console.error('Cache expire error:', error)
      return false
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats & { redisInfo: any }> {
    if (!this.isConnected) {
      return { ...this.stats, redisInfo: null }
    }

    try {
      const info = await this.redis.info('memory')
      const memoryInfo = this.parseRedisInfo(info)
      
      const keyCount = await this.redis.dbsize()
      
      return {
        ...this.stats,
        memoryUsage: memoryInfo.used_memory || 0,
        keyCount,
        redisInfo: memoryInfo
      }
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return { ...this.stats, redisInfo: null }
    }
  }

  private parseRedisInfo(info: string): Record<string, any> {
    const result: Record<string, any> = {}
    const lines = info.split('\r\n')
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':')
        result[key] = isNaN(Number(value)) ? value : Number(value)
      }
    }
    
    return result
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    if (!this.isConnected) {
      return false
    }

    try {
      await this.redis.flushdb()
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        evictions: 0,
        compressionRatio: 0,
        memoryUsage: 0,
        keyCount: 0,
        averageResponseTime: 0
      }
      return true
    } catch (error) {
      console.error('Cache clear error:', error)
      return false
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean, latency: number, error?: string }> {
    const startTime = Date.now()
    
    try {
      await this.redis.ping()
      const latency = Date.now() - startTime
      
      return {
        healthy: true,
        latency
      }
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit()
    } catch (error) {
      console.error('Error closing Redis connection:', error)
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCacheManager()

// Export class for custom instances
export { RedisCacheManager }
export type { CacheConfig, CacheEntry, CacheStats, CacheOptions, CachePattern }
