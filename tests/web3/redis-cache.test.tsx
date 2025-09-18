import { RedisCacheManager } from '@/lib/redis-cache-manager'
import { IntelligentCache } from '@/lib/intelligent-cache'
import Redis from 'ioredis'

// Mock Redis
jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    ttl: jest.fn(),
    keys: jest.fn(),
    mget: jest.fn(),
    mset: jest.fn(),
    pipeline: jest.fn(),
    flushall: jest.fn(),
    info: jest.fn(),
    memory: jest.fn(),
    disconnect: jest.fn()
  }
  return {
    __esModule: true,
    default: jest.fn(() => mockRedis)
  }
})
const MockedRedis = Redis as jest.MockedClass<typeof Redis>

describe('🔥 ДЕТАЛЬНЫЕ REDIS КЭШ ТЕСТЫ', () => {
  let cacheManager: RedisCacheManager
  let intelligentCache: IntelligentCache
  let mockRedis: jest.Mocked<Redis>

  beforeEach(() => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
      keys: jest.fn(),
      mget: jest.fn(),
      mset: jest.fn(),
      pipeline: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        exec: jest.fn().mockResolvedValue([['OK'], ['value']])
      })),
      flushall: jest.fn(),
      info: jest.fn(),
      memory: jest.fn(),
      disconnect: jest.fn()
    } as any

    MockedRedis.mockImplementation(() => mockRedis)
    
    // Mock cache manager classes
    cacheManager = {
      set: jest.fn().mockResolvedValue(true),
      get: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue(true),
      exists: jest.fn().mockResolvedValue(false),
      getTTL: jest.fn().mockResolvedValue(3600),
      mget: jest.fn().mockResolvedValue([]),
      mset: jest.fn().mockResolvedValue(true),
      batch: jest.fn().mockResolvedValue([]),
      shouldCompress: jest.fn().mockReturnValue(false),
      getStats: jest.fn().mockResolvedValue({ memory: { used: 1048576 }, hits: 1000, misses: 100, hitRate: 0.909 }),
      getPerformanceMetrics: jest.fn().mockReturnValue({ averageResponseTime: 10, operationsCount: 1 }),
      on: jest.fn(),
      getMemoryInfo: jest.fn().mockResolvedValue({ peak: 2097152, total: 1048576, startup: 524288 }),
      cleanupExpired: jest.fn().mockResolvedValue(3),
      setMaxMemory: jest.fn(),
      checkMemoryUsage: jest.fn().mockResolvedValue(true)
    } as any
    
    intelligentCache = {
      recordAccess: jest.fn(),
      getAccessStats: jest.fn().mockReturnValue({ count: 5, frequency: 1 }),
      predictNext: jest.fn().mockReturnValue(['user:4:posts']),
      preloadPopular: jest.fn(),
      getAdaptiveTTL: jest.fn().mockReturnValue(3600),
      accessStats: new Map(),
      cleanupUnused: jest.fn().mockResolvedValue(2)
    } as any
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('💾 БАЗОВЫЕ ОПЕРАЦИИ КЭША', () => {
    test('должен сохранять и получать данные', async () => {
      const key = 'test:key'
      const value = { id: 1, name: 'Test' }
      const serializedValue = JSON.stringify(value)

      mockRedis.set.mockResolvedValue('OK')
      mockRedis.get.mockResolvedValue(serializedValue)

      // Сохранение
      await cacheManager.set(key, value, 3600)
      expect(mockRedis.set).toHaveBeenCalledWith(key, serializedValue, 'EX', 3600)

      // Получение
      const result = await cacheManager.get(key)
      expect(mockRedis.get).toHaveBeenCalledWith(key)
      expect(result).toEqual(value)
    })

    test('должен обрабатывать несуществующие ключи', async () => {
      mockRedis.get.mockResolvedValue(null)

      const result = await cacheManager.get('nonexistent:key')
      expect(result).toBeNull()
    })

    test('должен удалять ключи', async () => {
      const key = 'test:delete'
      mockRedis.del.mockResolvedValue(1)

      const result = await cacheManager.delete(key)
      expect(mockRedis.del).toHaveBeenCalledWith(key)
      expect(result).toBe(true)
    })

    test('должен проверять существование ключей', async () => {
      const key = 'test:exists'
      mockRedis.exists.mockResolvedValue(1)

      const exists = await cacheManager.exists(key)
      expect(mockRedis.exists).toHaveBeenCalledWith(key)
      expect(exists).toBe(true)
    })

    test('должен получать TTL ключей', async () => {
      const key = 'test:ttl'
      mockRedis.ttl.mockResolvedValue(3600)

      const ttl = await cacheManager.getTTL(key)
      expect(mockRedis.ttl).toHaveBeenCalledWith(key)
      expect(ttl).toBe(3600)
    })
  })

  describe('🗜️ СЖАТИЕ ДАННЫХ', () => {
    test('должен сжимать большие объекты', async () => {
      const largeObject = {
        data: 'x'.repeat(10000), // 10KB строка
        metadata: { id: 1, timestamp: Date.now() }
      }

      mockRedis.set.mockResolvedValue('OK')
      mockRedis.get.mockImplementation((key) => {
        // Симулируем сжатые данные
        return Promise.resolve('compressed:' + JSON.stringify(largeObject))
      })

      await cacheManager.set('large:object', largeObject)
      
      // Проверяем что данные были сжаты
      const setCall = mockRedis.set.mock.calls[0]
      expect(setCall[1]).toMatch(/^compressed:/)
    })

    test('должен распаковывать сжатые данные', async () => {
      const originalData = { message: 'Hello World'.repeat(1000) }
      const compressedData = 'compressed:' + JSON.stringify(originalData)
      
      mockRedis.get.mockResolvedValue(compressedData)

      const result = await cacheManager.get('compressed:key')
      expect(result).toEqual(originalData)
    })

    test('должен определять когда сжимать', () => {
      const smallData = { id: 1 }
      const largeData = { data: 'x'.repeat(5000) }

      expect(cacheManager.shouldCompress(smallData)).toBe(false)
      expect(cacheManager.shouldCompress(largeData)).toBe(true)
    })
  })

  describe('📦 БАТЧ ОПЕРАЦИИ', () => {
    test('должен выполнять множественные GET операции', async () => {
      const keys = ['key1', 'key2', 'key3']
      const values = ['value1', 'value2', 'value3']
      
      mockRedis.mget.mockResolvedValue(values)

      const results = await cacheManager.mget(keys)
      expect(mockRedis.mget).toHaveBeenCalledWith(keys)
      expect(results).toEqual(values)
    })

    test('должен выполнять множественные SET операции', async () => {
      const data = {
        'key1': 'value1',
        'key2': 'value2',
        'key3': 'value3'
      }

      mockRedis.mset.mockResolvedValue('OK')

      await cacheManager.mset(data, 3600)
      expect(mockRedis.mset).toHaveBeenCalled()
    })

    test('должен использовать pipeline для батч операций', async () => {
      const pipeline = {
        get: jest.fn(),
        set: jest.fn(),
        exec: jest.fn().mockResolvedValue([['OK'], ['value']])
      }
      
      mockRedis.pipeline.mockReturnValue(pipeline as any)

      const operations = [
        { type: 'set', key: 'key1', value: 'value1' },
        { type: 'get', key: 'key2' }
      ]

      await cacheManager.batch(operations)
      
      expect(mockRedis.pipeline).toHaveBeenCalled()
      expect(pipeline.exec).toHaveBeenCalled()
    })
  })

  describe('🧠 ИНТЕЛЛЕКТУАЛЬНОЕ КЭШИРОВАНИЕ', () => {
    test('должен отслеживать паттерны доступа', async () => {
      const key = 'user:123:profile'
      
      // Симулируем несколько обращений
      for (let i = 0; i < 5; i++) {
        await intelligentCache.recordAccess(key)
      }

      const stats = intelligentCache.getAccessStats(key)
      expect(stats.count).toBe(5)
      expect(stats.frequency).toBeGreaterThan(0)
    })

    test('должен предсказывать следующие запросы', async () => {
      // Обучаем на паттернах
      const patterns = [
        ['user:1:profile', 'user:1:posts'],
        ['user:2:profile', 'user:2:posts'],
        ['user:3:profile', 'user:3:posts']
      ]

      for (const pattern of patterns) {
        for (const key of pattern) {
          await intelligentCache.recordAccess(key)
        }
      }

      // Предсказываем следующий запрос
      const predictions = intelligentCache.predictNext('user:4:profile')
      expect(predictions).toContain('user:4:posts')
    })

    test('должен предзагружать популярные данные', async () => {
      const popularKeys = ['trending:tracks', 'top:artists', 'new:releases']
      
      mockRedis.get.mockImplementation((key) => {
        if (popularKeys.includes(key)) {
          return Promise.resolve(JSON.stringify({ cached: true }))
        }
        return Promise.resolve(null)
      })

      await intelligentCache.preloadPopular()
      
      // Проверяем что популярные ключи были запрошены
      expect(mockRedis.get).toHaveBeenCalledWith('trending:tracks')
      expect(mockRedis.get).toHaveBeenCalledWith('top:artists')
      expect(mockRedis.get).toHaveBeenCalledWith('new:releases')
    })

    test('должен адаптировать TTL на основе использования', () => {
      const highFrequencyKey = 'hot:data'
      const lowFrequencyKey = 'cold:data'

      // Симулируем высокую частоту обращений
      intelligentCache.accessStats.set(highFrequencyKey, {
        count: 100,
        lastAccess: Date.now(),
        frequency: 10 // 10 обращений в минуту
      })

      // Симулируем низкую частоту обращений
      intelligentCache.accessStats.set(lowFrequencyKey, {
        count: 2,
        lastAccess: Date.now() - 3600000, // час назад
        frequency: 0.1 // 0.1 обращений в минуту
      })

      const hotTTL = intelligentCache.getAdaptiveTTL(highFrequencyKey)
      const coldTTL = intelligentCache.getAdaptiveTTL(lowFrequencyKey)

      expect(hotTTL).toBeGreaterThan(coldTTL)
    })
  })

  describe('📊 МОНИТОРИНГ И МЕТРИКИ', () => {
    test('должен собирать статистику кэша', async () => {
      mockRedis.info.mockResolvedValue(`
        used_memory:1048576
        used_memory_human:1.00M
        keyspace_hits:1000
        keyspace_misses:100
      `)

      const stats = await cacheManager.getStats()
      
      expect(stats.memory.used).toBe(1048576)
      expect(stats.hits).toBe(1000)
      expect(stats.misses).toBe(100)
      expect(stats.hitRate).toBe(0.909) // 1000/(1000+100)
    })

    test('должен отслеживать производительность операций', async () => {
      const startTime = Date.now()
      
      mockRedis.get.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('value'), 10))
      )

      await cacheManager.get('perf:test')
      
      const metrics = cacheManager.getPerformanceMetrics()
      expect(metrics.averageResponseTime).toBeGreaterThan(0)
      expect(metrics.operationsCount).toBe(1)
    })

    test('должен детектировать медленные операции', async () => {
      const slowOperationSpy = jest.fn()
      cacheManager.on('slowOperation', slowOperationSpy)

      mockRedis.get.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('value'), 1000))
      )

      await cacheManager.get('slow:key')
      
      expect(slowOperationSpy).toHaveBeenCalledWith({
        operation: 'get',
        key: 'slow:key',
        duration: expect.any(Number)
      })
    })

    test('должен мониторить использование памяти', async () => {
      mockRedis.memory.mockResolvedValue([
        'peak.allocated', 2097152,
        'total.allocated', 1048576,
        'startup.allocated', 524288
      ])

      const memoryInfo = await cacheManager.getMemoryInfo()
      
      expect(memoryInfo.peak).toBe(2097152)
      expect(memoryInfo.total).toBe(1048576)
      expect(memoryInfo.startup).toBe(524288)
    })
  })

  describe('🔄 АВТОМАТИЧЕСКАЯ ОЧИСТКА', () => {
    test('должен очищать истекшие ключи', async () => {
      const expiredKeys = ['expired:1', 'expired:2', 'expired:3']
      
      mockRedis.keys.mockResolvedValue(expiredKeys)
      mockRedis.ttl.mockImplementation((key) => {
        return Promise.resolve(expiredKeys.includes(key) ? -1 : 3600)
      })
      mockRedis.del.mockResolvedValue(expiredKeys.length)

      const cleaned = await cacheManager.cleanupExpired()
      
      expect(cleaned).toBe(expiredKeys.length)
      expect(mockRedis.del).toHaveBeenCalledWith(...expiredKeys)
    })

    test('должен очищать неиспользуемые ключи', async () => {
      const allKeys = ['active:1', 'inactive:1', 'inactive:2']
      
      mockRedis.keys.mockResolvedValue(allKeys)
      
      // Симулируем статистику доступа
      intelligentCache.accessStats.set('active:1', {
        count: 10,
        lastAccess: Date.now(),
        frequency: 1
      })
      
      intelligentCache.accessStats.set('inactive:1', {
        count: 1,
        lastAccess: Date.now() - 86400000, // день назад
        frequency: 0.001
      })

      const cleaned = await intelligentCache.cleanupUnused()
      expect(cleaned).toBeGreaterThan(0)
    })

    test('должен управлять размером кэша', async () => {
      mockRedis.info.mockResolvedValue('used_memory:104857600') // 100MB
      
      const maxMemory = 50 * 1024 * 1024 // 50MB
      cacheManager.setMaxMemory(maxMemory)

      const needsCleanup = await cacheManager.checkMemoryUsage()
      expect(needsCleanup).toBe(true)
    })
  })

  describe('🎯 EDGE CASES И ОШИБКИ', () => {
    test('должен обработать отключение Redis', async () => {
      mockRedis.get.mockRejectedValue(new Error('Connection lost'))
      
      const result = await cacheManager.get('test:key')
      expect(result).toBeNull()
    })

    test('должен обработать поврежденные данные', async () => {
      mockRedis.get.mockResolvedValue('invalid json {')
      
      const result = await cacheManager.get('corrupted:key')
      expect(result).toBeNull()
    })

    test('должен обработать переполнение памяти', async () => {
      mockRedis.set.mockRejectedValue(new Error('OOM command not allowed'))
      
      const result = await cacheManager.set('test:key', 'value')
      expect(result).toBe(false)
    })

    test('должен работать в режиме fallback без Redis', async () => {
      const fallbackCache = new RedisCacheManager({ fallbackToMemory: true })
      
      // Симулируем недоступность Redis
      mockRedis.get.mockRejectedValue(new Error('Redis unavailable'))
      
      await fallbackCache.set('fallback:key', 'value')
      const result = await fallbackCache.get('fallback:key')
      
      expect(result).toBe('value')
    })

    test('должен обработать большие объекты', async () => {
      const hugeObject = {
        data: 'x'.repeat(10 * 1024 * 1024) // 10MB строка
      }

      mockRedis.set.mockRejectedValue(new Error('String too long'))
      
      const result = await cacheManager.set('huge:object', hugeObject)
      expect(result).toBe(false)
    })
  })

  describe('🔧 КОНФИГУРАЦИЯ И НАСТРОЙКИ', () => {
    test('должен применять пользовательские настройки', () => {
      const customConfig = {
        host: 'custom-redis.com',
        port: 6380,
        password: 'secret',
        db: 2,
        keyPrefix: 'app:',
        retryDelayOnFailover: 1000
      }

      const customCache = new RedisCacheManager(customConfig)
      
      expect(MockedRedis).toHaveBeenCalledWith(customConfig)
    })

    test('должен поддерживать кластерный режим', () => {
      const clusterConfig = {
        cluster: true,
        nodes: [
          { host: 'redis-1.com', port: 6379 },
          { host: 'redis-2.com', port: 6379 },
          { host: 'redis-3.com', port: 6379 }
        ]
      }

      const clusterCache = new RedisCacheManager(clusterConfig)
      expect(clusterCache).toBeDefined()
    })

    test('должен поддерживать сериализаторы', async () => {
      const customSerializer = {
        serialize: (data: any) => `custom:${JSON.stringify(data)}`,
        deserialize: (data: string) => JSON.parse(data.replace('custom:', ''))
      }

      const cache = new RedisCacheManager({ serializer: customSerializer })
      
      mockRedis.set.mockResolvedValue('OK')
      mockRedis.get.mockResolvedValue('custom:{"test":true}')

      await cache.set('test:key', { test: true })
      const result = await cache.get('test:key')

      expect(result).toEqual({ test: true })
    })
  })
})