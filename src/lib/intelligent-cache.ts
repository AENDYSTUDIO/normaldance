/**
 * Intelligent Cache System with Predictive Caching
 * Uses machine learning patterns to predict and preload data
 */

import { redisCache, RedisCacheManager } from './redis-cache-manager'

interface CachePrediction {
  key: string
  probability: number
  priority: number
  estimatedAccessTime: number
  dataSize: number
}

interface AccessPattern {
  key: string
  timestamp: number
  frequency: number
  recency: number
  userContext: string
  sessionId: string
}

interface CacheStrategy {
  name: string
  weight: number
  enabled: boolean
  config: any
}

interface IntelligentCacheConfig {
  enablePredictiveCaching: boolean
  enableAccessPatternAnalysis: boolean
  enableUserBehaviorTracking: boolean
  maxPredictionCacheSize: number
  predictionAccuracyThreshold: number
  cacheWarmupEnabled: boolean
  strategies: CacheStrategy[]
}

class IntelligentCache {
  private redis: RedisCacheManager
  private config: IntelligentCacheConfig
  private accessPatterns: Map<string, AccessPattern[]> = new Map()
  private predictions: Map<string, CachePrediction> = new Map()
  private userSessions: Map<string, string[]> = new Map()
  private cacheMetrics: {
    totalRequests: number
    cacheHits: number
    predictions: number
    successfulPredictions: number
    averageAccuracy: number
  } = {
    totalRequests: 0,
    cacheHits: 0,
    predictions: 0,
    successfulPredictions: 0,
    averageAccuracy: 0
  }

  constructor(redis: RedisCacheManager, config?: Partial<IntelligentCacheConfig>) {
    this.redis = redis
    this.config = {
      enablePredictiveCaching: true,
      enableAccessPatternAnalysis: true,
      enableUserBehaviorTracking: true,
      maxPredictionCacheSize: 1000,
      predictionAccuracyThreshold: 0.7,
      cacheWarmupEnabled: true,
      strategies: [
        {
          name: 'frequency',
          weight: 0.3,
          enabled: true,
          config: { windowSize: 1000, minFrequency: 2 }
        },
        {
          name: 'recency',
          weight: 0.2,
          enabled: true,
          config: { timeWindow: 3600000, decayFactor: 0.9 }
        },
        {
          name: 'user_similarity',
          weight: 0.25,
          enabled: true,
          config: { similarityThreshold: 0.8, maxUsers: 100 }
        },
        {
          name: 'temporal',
          weight: 0.25,
          enabled: true,
          config: { timePatterns: true, seasonalAdjustment: true }
        }
      ],
      ...config
    }

    this.initializePredictionEngine()
  }

  private initializePredictionEngine(): void {
    if (this.config.enablePredictiveCaching) {
      // Start background prediction process
      setInterval(() => {
        this.updatePredictions()
      }, 30000) // Update every 30 seconds

      // Start cache warmup process
      if (this.config.cacheWarmupEnabled) {
        setInterval(() => {
          this.performCacheWarmup()
        }, 300000) // Warmup every 5 minutes
      }
    }
  }

  /**
   * Get data with intelligent caching
   */
  async get<T>(
    namespace: string,
    key: string,
    options?: {
      userContext?: string
      sessionId?: string
      enablePrediction?: boolean
      fallbackData?: () => Promise<T>
    }
  ): Promise<T | null> {
    this.cacheMetrics.totalRequests++

    // Record access pattern
    if (this.config.enableAccessPatternAnalysis && options?.userContext) {
      this.recordAccessPattern(key, options.userContext, options.sessionId)
    }

    // Try to get from cache
    const cached = await this.redis.get<T>(namespace, key)
    
    if (cached) {
      this.cacheMetrics.cacheHits++
      
      // Trigger predictive caching for related data
      if (this.config.enablePredictiveCaching && options?.enablePrediction !== false) {
        this.triggerPredictiveCaching(key, options.userContext, options.sessionId)
      }
      
      return cached
    }

    // If not in cache and fallback provided, load and cache
    if (options?.fallbackData) {
      try {
        const data = await options.fallbackData()
        await this.redis.set(namespace, key, data, {
          ttl: this.calculateOptimalTTL(key, data),
          tags: this.generateTags(key, options.userContext)
        })
        return data
      } catch (error) {
        console.error('Fallback data loading failed:', error)
      }
    }

    return null
  }

  /**
   * Set data with intelligent caching
   */
  async set<T>(
    namespace: string,
    key: string,
    data: T,
    options?: {
      userContext?: string
      sessionId?: string
      ttl?: number
      priority?: 'low' | 'normal' | 'high'
    }
  ): Promise<boolean> {
    const cacheOptions = {
      ttl: options?.ttl || this.calculateOptimalTTL(key, data),
      tags: this.generateTags(key, options?.userContext),
      priority: options?.priority || 'normal'
    }

    const result = await this.redis.set(namespace, key, data, cacheOptions)

    // Update predictions based on new data
    if (result && this.config.enablePredictiveCaching) {
      this.updatePredictionsForKey(key, options?.userContext)
    }

    return result
  }

  /**
   * Record access pattern for analysis
   */
  private recordAccessPattern(key: string, userContext: string, sessionId?: string): void {
    const now = Date.now()
    const pattern: AccessPattern = {
      key,
      timestamp: now,
      frequency: 1,
      recency: now,
      userContext,
      sessionId: sessionId || 'anonymous'
    }

    // Update existing patterns
    const existingPatterns = this.accessPatterns.get(key) || []
    const existingPattern = existingPatterns.find(p => p.userContext === userContext)
    
    if (existingPattern) {
      existingPattern.frequency++
      existingPattern.recency = now
    } else {
      existingPatterns.push(pattern)
    }

    this.accessPatterns.set(key, existingPatterns)

    // Update user session
    if (sessionId) {
      const userKeys = this.userSessions.get(sessionId) || []
      if (!userKeys.includes(key)) {
        userKeys.push(key)
        this.userSessions.set(sessionId, userKeys)
      }
    }
  }

  /**
   * Update predictions based on access patterns
   */
  private updatePredictions(): void {
    if (!this.config.enablePredictiveCaching) return

    const now = Date.now()
    const newPredictions = new Map<string, CachePrediction>()

    // Analyze access patterns
    for (const [key, patterns] of this.accessPatterns) {
      const prediction = this.calculatePrediction(key, patterns, now)
      if (prediction.probability > this.config.predictionAccuracyThreshold) {
        newPredictions.set(key, prediction)
      }
    }

    // Apply strategy weights
    const weightedPredictions = this.applyStrategyWeights(newPredictions)
    
    // Update predictions
    this.predictions = weightedPredictions

    // Limit prediction cache size
    if (this.predictions.size > this.config.maxPredictionCacheSize) {
      const sortedPredictions = Array.from(this.predictions.entries())
        .sort(([, a], [, b]) => b.priority - a.priority)
        .slice(0, this.config.maxPredictionCacheSize)
      
      this.predictions = new Map(sortedPredictions)
    }
  }

  /**
   * Calculate prediction for a key
   */
  private calculatePrediction(key: string, patterns: AccessPattern[], now: number): CachePrediction {
    let totalScore = 0
    let totalWeight = 0

    // Frequency-based prediction
    const frequencyStrategy = this.config.strategies.find(s => s.name === 'frequency')
    if (frequencyStrategy?.enabled) {
      const frequency = patterns.reduce((sum, p) => sum + p.frequency, 0)
      const frequencyScore = Math.min(frequency / 10, 1) // Normalize to 0-1
      totalScore += frequencyScore * frequencyStrategy.weight
      totalWeight += frequencyStrategy.weight
    }

    // Recency-based prediction
    const recencyStrategy = this.config.strategies.find(s => s.name === 'recency')
    if (recencyStrategy?.enabled) {
      const latestAccess = Math.max(...patterns.map(p => p.recency))
      const recencyScore = Math.exp(-(now - latestAccess) / 3600000) // 1 hour decay
      totalScore += recencyScore * recencyStrategy.weight
      totalWeight += recencyStrategy.weight
    }

    // User similarity prediction
    const similarityStrategy = this.config.strategies.find(s => s.name === 'user_similarity')
    if (similarityStrategy?.enabled) {
      const similarityScore = this.calculateUserSimilarity(key, patterns)
      totalScore += similarityScore * similarityStrategy.weight
      totalWeight += similarityStrategy.weight
    }

    // Temporal prediction
    const temporalStrategy = this.config.strategies.find(s => s.name === 'temporal')
    if (temporalStrategy?.enabled) {
      const temporalScore = this.calculateTemporalScore(patterns)
      totalScore += temporalScore * temporalStrategy.weight
      totalWeight += temporalStrategy.weight
    }

    const probability = totalWeight > 0 ? totalScore / totalWeight : 0
    const priority = probability * 100 // Convert to priority score

    return {
      key,
      probability,
      priority,
      estimatedAccessTime: now + this.estimateNextAccessTime(patterns),
      dataSize: this.estimateDataSize(key)
    }
  }

  /**
   * Calculate user similarity score
   */
  private calculateUserSimilarity(key: string, patterns: AccessPattern[]): number {
    const userContexts = patterns.map(p => p.userContext)
    const uniqueUsers = new Set(userContexts)
    
    if (uniqueUsers.size <= 1) return 0

    // Find similar users based on access patterns
    let similarityScore = 0
    for (const sessionId of this.userSessions.keys()) {
      const userKeys = this.userSessions.get(sessionId) || []
      const commonKeys = userKeys.filter(k => k !== key && this.accessPatterns.has(k))
      
      if (commonKeys.length > 0) {
        similarityScore += commonKeys.length / userKeys.length
      }
    }

    return Math.min(similarityScore / this.userSessions.size, 1)
  }

  /**
   * Calculate temporal score based on time patterns
   */
  private calculateTemporalScore(patterns: AccessPattern[]): number {
    if (patterns.length < 2) return 0

    const timestamps = patterns.map(p => p.timestamp).sort()
    const intervals = []
    
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1])
    }

    if (intervals.length === 0) return 0

    // Calculate regularity of access intervals
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - averageInterval, 2), 0) / intervals.length
    const regularity = 1 / (1 + Math.sqrt(variance) / averageInterval)

    return regularity
  }

  /**
   * Apply strategy weights to predictions
   */
  private applyStrategyWeights(predictions: Map<string, CachePrediction>): Map<string, CachePrediction> {
    const weightedPredictions = new Map<string, CachePrediction>()

    for (const [key, prediction] of predictions) {
      const strategy = this.config.strategies.find(s => s.enabled)
      if (strategy) {
        const weightedPrediction = {
          ...prediction,
          priority: prediction.priority * strategy.weight
        }
        weightedPredictions.set(key, weightedPrediction)
      }
    }

    return weightedPredictions
  }

  /**
   * Trigger predictive caching for related data
   */
  private async triggerPredictiveCaching(key: string, userContext?: string, sessionId?: string): Promise<void> {
    if (!this.config.enablePredictiveCaching) return

    // Find related keys based on predictions
    const relatedKeys = this.findRelatedKeys(key, userContext)
    
    for (const relatedKey of relatedKeys) {
      const prediction = this.predictions.get(relatedKey)
      if (prediction && prediction.probability > 0.8) {
        // Preload data if not already cached
        const cached = await this.redis.get('predictive', relatedKey)
        if (!cached) {
          this.cacheMetrics.predictions++
          // In a real implementation, this would trigger data loading
          console.log(`Predictive caching triggered for: ${relatedKey}`)
        }
      }
    }
  }

  /**
   * Find related keys based on patterns
   */
  private findRelatedKeys(key: string, userContext?: string): string[] {
    const relatedKeys: string[] = []

    // Find keys accessed by same user
    if (userContext && this.userSessions.has(userContext)) {
      const userKeys = this.userSessions.get(userContext) || []
      relatedKeys.push(...userKeys.filter(k => k !== key))
    }

    // Find keys with similar access patterns
    const keyPatterns = this.accessPatterns.get(key) || []
    for (const [otherKey, otherPatterns] of this.accessPatterns) {
      if (otherKey !== key && this.calculatePatternSimilarity(keyPatterns, otherPatterns) > 0.7) {
        relatedKeys.push(otherKey)
      }
    }

    return relatedKeys.slice(0, 10) // Limit to top 10 related keys
  }

  /**
   * Calculate similarity between access patterns
   */
  private calculatePatternSimilarity(patterns1: AccessPattern[], patterns2: AccessPattern[]): number {
    if (patterns1.length === 0 || patterns2.length === 0) return 0

    const commonUsers = patterns1.filter(p1 => 
      patterns2.some(p2 => p1.userContext === p2.userContext)
    )

    return commonUsers.length / Math.max(patterns1.length, patterns2.length)
  }

  /**
   * Perform cache warmup based on predictions
   */
  private async performCacheWarmup(): Promise<void> {
    if (!this.config.cacheWarmupEnabled) return

    const topPredictions = Array.from(this.predictions.entries())
      .sort(([, a], [, b]) => b.priority - a.priority)
      .slice(0, 50) // Top 50 predictions

    for (const [key, prediction] of topPredictions) {
      const cached = await this.redis.get('warmup', key)
      if (!cached && prediction.probability > 0.9) {
        // In a real implementation, this would preload the data
        console.log(`Cache warmup for: ${key} (probability: ${prediction.probability})`)
      }
    }
  }

  /**
   * Calculate optimal TTL based on access patterns
   */
  private calculateOptimalTTL(key: string, data: any): number {
    const patterns = this.accessPatterns.get(key) || []
    
    if (patterns.length === 0) {
      return 3600 // Default 1 hour
    }

    // Calculate average time between accesses
    const timestamps = patterns.map(p => p.timestamp).sort()
    const intervals = []
    
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1])
    }

    if (intervals.length === 0) {
      return 3600
    }

    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    const optimalTTL = Math.max(300, Math.min(averageInterval / 1000, 86400)) // 5 minutes to 24 hours

    return Math.round(optimalTTL)
  }

  /**
   * Generate cache tags based on key and context
   */
  private generateTags(key: string, userContext?: string): string[] {
    const tags = ['intelligent-cache']
    
    // Add key-based tags
    if (key.includes(':')) {
      const parts = key.split(':')
      tags.push(parts[0]) // Add namespace as tag
    }

    // Add user context tags
    if (userContext) {
      tags.push(`user:${userContext}`)
    }

    return tags
  }

  /**
   * Estimate next access time
   */
  private estimateNextAccessTime(patterns: AccessPattern[]): number {
    if (patterns.length < 2) return 3600000 // 1 hour default

    const timestamps = patterns.map(p => p.timestamp).sort()
    const intervals = []
    
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1])
    }

    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    return averageInterval
  }

  /**
   * Estimate data size for a key
   */
  private estimateDataSize(key: string): number {
    // Simple estimation based on key type
    if (key.includes('track')) return 1024 * 1024 // 1MB for tracks
    if (key.includes('user')) return 1024 // 1KB for user data
    if (key.includes('playlist')) return 10 * 1024 // 10KB for playlists
    
    return 1024 // Default 1KB
  }

  /**
   * Update predictions for a specific key
   */
  private updatePredictionsForKey(key: string, userContext?: string): void {
    const patterns = this.accessPatterns.get(key) || []
    if (patterns.length > 0) {
      const prediction = this.calculatePrediction(key, patterns, Date.now())
      this.predictions.set(key, prediction)
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): typeof this.cacheMetrics {
    const hitRate = this.cacheMetrics.totalRequests > 0 
      ? this.cacheMetrics.cacheHits / this.cacheMetrics.totalRequests 
      : 0

    const predictionAccuracy = this.cacheMetrics.predictions > 0
      ? this.cacheMetrics.successfulPredictions / this.cacheMetrics.predictions
      : 0

    return {
      ...this.cacheMetrics,
      hitRate,
      predictionAccuracy
    }
  }

  /**
   * Get predictions
   */
  getPredictions(): CachePrediction[] {
    return Array.from(this.predictions.values())
      .sort((a, b) => b.priority - a.priority)
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    this.accessPatterns.clear()
    this.predictions.clear()
    this.userSessions.clear()
    this.cacheMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      predictions: 0,
      successfulPredictions: 0,
      averageAccuracy: 0
    }
  }
}

// Export singleton instance
export const intelligentCache = new IntelligentCache(redisCache)

// Export class for custom instances
export { IntelligentCache }
export type { CachePrediction, AccessPattern, CacheStrategy, IntelligentCacheConfig }
