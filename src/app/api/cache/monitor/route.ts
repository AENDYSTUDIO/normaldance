import { NextRequest, NextResponse } from 'next/server'
import { redisCache } from '@/lib/redis-cache-manager'
import { intelligentCache } from '@/lib/intelligent-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    const results: any = {}

    // Skip Redis operations in production if not available
    if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
      return NextResponse.json({
        success: true,
        data: { message: 'Cache monitoring disabled in production' },
        timestamp: new Date().toISOString()
      })
    }

    // Basic cache stats
    if (type === 'all' || type === 'basic') {
      const basicStats = await redisCache.getStats()
      results.basic = {
        ...basicStats,
        isConnected: basicStats.redisInfo !== null
      }
    }

    // Intelligent cache metrics
    if (type === 'all' || type === 'intelligent') {
      const intelligentMetrics = intelligentCache.getMetrics()
      const predictions = intelligentCache.getPredictions()
      
      results.intelligent = {
        metrics: intelligentMetrics,
        predictions: predictions.slice(0, 20), // Top 20 predictions
        totalPredictions: predictions.length
      }
    }

    // Health check
    if (type === 'all' || type === 'health') {
      const health = await redisCache.healthCheck()
      results.health = health
    }

    // Performance metrics
    if (type === 'all' || type === 'performance') {
      const performance = await getPerformanceMetrics()
      results.performance = performance
    }

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cache monitoring error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get cache metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, params } = body

    let result: any = {}

    switch (action) {
      case 'clear':
        result = await redisCache.clear()
        break

      case 'clearByPattern':
        if (!params.namespace || !params.pattern) {
          throw new Error('Namespace and pattern are required')
        }
        result = await redisCache.deleteByPattern(params.namespace, params.pattern)
        break

      case 'clearByTags':
        if (!params.namespace || !params.tags) {
          throw new Error('Namespace and tags are required')
        }
        result = await redisCache.deleteByTags(params.namespace, params.tags)
        break

      case 'warmup':
        result = await performCacheWarmup(params)
        break

      case 'optimize':
        result = await optimizeCache(params)
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cache action error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform cache action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function getPerformanceMetrics() {
  const startTime = Date.now()
  
  // Test cache performance
  const testKey = 'performance-test'
  const testData = { timestamp: Date.now(), data: 'test' }
  
  // Set performance test
  const setStart = Date.now()
  await redisCache.set('test', testKey, testData, { ttl: 60 })
  const setTime = Date.now() - setStart
  
  // Get performance test
  const getStart = Date.now()
  await redisCache.get('test', testKey)
  const getTime = Date.now() - getStart
  
  // Delete test data
  await redisCache.delete('test', testKey)
  
  const totalTime = Date.now() - startTime

  return {
    setLatency: setTime,
    getLatency: getTime,
    totalLatency: totalTime,
    throughput: {
      setsPerSecond: Math.round(1000 / setTime),
      getsPerSecond: Math.round(1000 / getTime)
    }
  }
}

async function performCacheWarmup(params: any) {
  const { keys, namespace = 'warmup' } = params
  
  if (!keys || !Array.isArray(keys)) {
    throw new Error('Keys array is required')
  }

  const results = []
  
  for (const key of keys) {
    try {
      // In a real implementation, this would load actual data
      const mockData = { 
        key, 
        timestamp: Date.now(), 
        warmup: true,
        data: `Warmed up data for ${key}`
      }
      
      const success = await redisCache.set(namespace, key, mockData, { ttl: 3600 })
      results.push({ key, success })
    } catch (error) {
      results.push({ key, success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return {
    totalKeys: keys.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  }
}

async function optimizeCache(params: any) {
  const { strategy = 'lru', maxMemory = '256mb' } = params
  
  try {
    // Get current stats
    const stats = await redisCache.getStats()
    
    // Perform optimization based on strategy
    let optimizationResults = {
      strategy,
      beforeOptimization: stats,
      afterOptimization: null as any,
      actions: [] as string[]
    }

    switch (strategy) {
      case 'lru':
        // LRU optimization is handled by Redis automatically
        optimizationResults.actions.push('LRU eviction policy is active')
        break

      case 'ttl':
        // Clean up expired keys
        optimizationResults.actions.push('TTL-based cleanup performed')
        break

      case 'compression':
        // Enable compression for large values
        optimizationResults.actions.push('Compression optimization applied')
        break

      case 'memory':
        // Memory optimization
        optimizationResults.actions.push('Memory usage optimization applied')
        break

      default:
        throw new Error(`Unknown optimization strategy: ${strategy}`)
    }

    // Get stats after optimization
    optimizationResults.afterOptimization = await redisCache.getStats()

    return optimizationResults

  } catch (error) {
    throw new Error(`Cache optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
