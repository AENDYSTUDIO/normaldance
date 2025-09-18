'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  Database, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Trash2,
  Zap,
  BarChart3,
  Clock,
  Memory,
  Network,
  Target,
  Brain,
  Settings
} from '@/components/icons'

interface CacheStats {
  basic: {
    hits: number
    misses: number
    sets: number
    deletes: number
    evictions: number
    compressionRatio: number
    memoryUsage: number
    keyCount: number
    averageResponseTime: number
    isConnected: boolean
  }
  intelligent: {
    metrics: {
      totalRequests: number
      cacheHits: number
      predictions: number
      successfulPredictions: number
      hitRate: number
      predictionAccuracy: number
    }
    predictions: Array<{
      key: string
      probability: number
      priority: number
      estimatedAccessTime: number
      dataSize: number
    }>
    totalPredictions: number
  }
  health: {
    healthy: boolean
    latency: number
    error?: string
  }
  performance: {
    setLatency: number
    getLatency: number
    totalLatency: number
    throughput: {
      setsPerSecond: number
      getsPerSecond: number
    }
  }
}

export function CacheMonitor() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cache/monitor?type=all')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || 'Failed to fetch cache stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const performAction = useCallback(async (action: string, params: any = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cache/monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, params })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh stats after action
        await fetchStats()
      } else {
        setError(data.error || 'Action failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [fetchStats])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchStats, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchStats])

  // Initial fetch
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getHealthColor = (healthy: boolean) => {
    return healthy ? 'text-green-600' : 'text-red-600'
  }

  const getHealthIcon = (healthy: boolean) => {
    return healthy ? <Activity className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">Error loading cache stats</div>
            <div className="text-sm text-gray-600 mb-4">{error}</div>
            <Button onClick={fetchStats} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cache Monitor</h2>
          <p className="text-gray-600">Redis cache performance and intelligent caching metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Button>
          <Button onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Status */}
      {stats?.health && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getHealthIcon(stats.health.healthy)}
                <span className="font-medium">Cache Health</span>
                <Badge variant={stats.health.healthy ? 'default' : 'destructive'}>
                  {stats.health.healthy ? 'Healthy' : 'Unhealthy'}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Latency: {formatTime(stats.health.latency)}
              </div>
            </div>
            {stats.health.error && (
              <div className="mt-2 text-sm text-red-600">
                Error: {stats.health.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="intelligent">Intelligent Cache</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hit Rate */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hit Rate</p>
                    <p className="text-2xl font-bold">
                      {stats?.basic ? Math.round((stats.basic.hits / (stats.basic.hits + stats.basic.misses)) * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <Progress 
                  value={stats?.basic ? (stats.basic.hits / (stats.basic.hits + stats.basic.misses)) * 100 : 0} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                    <p className="text-2xl font-bold">
                      {stats?.basic ? formatBytes(stats.basic.memoryUsage) : '0 B'}
                    </p>
                  </div>
                  <Memory className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {stats?.basic.keyCount || 0} keys
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold">
                      {stats?.basic ? formatTime(stats.basic.averageResponseTime) : '0ms'}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {stats?.basic.sets || 0} sets, {stats?.basic.deletes || 0} deletes
                </div>
              </CardContent>
            </Card>

            {/* Compression Ratio */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Compression</p>
                    <p className="text-2xl font-bold">
                      {stats?.basic ? Math.round(stats.basic.compressionRatio * 100) : 0}%
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {stats?.basic.evictions || 0} evictions
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats?.basic.hits || 0}</div>
                  <div className="text-sm text-gray-600">Cache Hits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats?.basic.misses || 0}</div>
                  <div className="text-sm text-gray-600">Cache Misses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats?.basic.sets || 0}</div>
                  <div className="text-sm text-gray-600">Sets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats?.basic.deletes || 0}</div>
                  <div className="text-sm text-gray-600">Deletes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intelligent Cache Tab */}
        <TabsContent value="intelligent" className="space-y-4">
          {stats?.intelligent && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Prediction Accuracy</p>
                        <p className="text-2xl font-bold">
                          {Math.round(stats.intelligent.metrics.predictionAccuracy * 100)}%
                        </p>
                      </div>
                      <Brain className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {stats.intelligent.metrics.successfulPredictions} / {stats.intelligent.metrics.predictions} predictions
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Predictions</p>
                        <p className="text-2xl font-bold">{stats.intelligent.totalPredictions}</p>
                      </div>
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Active predictions
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Intelligent Hit Rate</p>
                        <p className="text-2xl font-bold">
                          {Math.round(stats.intelligent.metrics.hitRate * 100)}%
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {stats.intelligent.metrics.cacheHits} / {stats.intelligent.metrics.totalRequests} requests
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.intelligent.predictions.slice(0, 10).map((prediction, index) => (
                      <div key={prediction.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-mono text-sm">{prediction.key}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="text-gray-600">Probability:</span>
                            <span className="font-medium ml-1">
                              {Math.round(prediction.probability * 100)}%
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Priority:</span>
                            <span className="font-medium ml-1">{Math.round(prediction.priority)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Size:</span>
                            <span className="font-medium ml-1">{formatBytes(prediction.dataSize)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {stats?.performance && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Latency Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Set Latency</span>
                      <span className="font-medium">{formatTime(stats.performance.setLatency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Get Latency</span>
                      <span className="font-medium">{formatTime(stats.performance.getLatency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Latency</span>
                      <span className="font-medium">{formatTime(stats.performance.totalLatency)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Throughput</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sets per Second</span>
                      <span className="font-medium">{stats.performance.throughput.setsPerSecond}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gets per Second</span>
                      <span className="font-medium">{stats.performance.throughput.getsPerSecond}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => performAction('clear')}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Cache
                </Button>
                <Button 
                  onClick={() => performAction('optimize', { strategy: 'lru' })}
                  variant="outline"
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize Cache
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Warmup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => performAction('warmup', { 
                    keys: ['tracks:popular', 'users:active', 'playlists:featured'],
                    namespace: 'warmup'
                  })}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Warmup Popular Data
                </Button>
                <Button 
                  onClick={() => performAction('warmup', { 
                    keys: ['analytics:daily', 'stats:global'],
                    namespace: 'analytics'
                  })}
                  variant="outline"
                  className="w-full"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Warmup Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
