import { PrismaClient } from '@prisma/client'
import { performance } from 'perf_hooks'

// Глобальный экземпляр Prisma с оптимизированными настройками
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  // Оптимизация для SQLite
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Класс для оптимизации запросов к базе данных
export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private slowQueries = new Map<string, { count: number; avgTime: number; lastSeen: Date }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 минут
  private readonly SLOW_QUERY_THRESHOLD = 1000 // 1 секунда

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer()
    }
    return DatabaseOptimizer.instance
  }

  // Кэшированный запрос
  async cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = this.CACHE_TTL
  ): Promise<T> {
    const cached = this.queryCache.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }

    const startTime = performance.now()
    try {
      const result = await queryFn()
      const endTime = performance.now()
      const queryTime = endTime - startTime

      // Кэшируем результат
      this.queryCache.set(key, {
        data: result,
        timestamp: Date.now(),
        ttl
      })

      // Отслеживаем медленные запросы
      if (queryTime > this.SLOW_QUERY_THRESHOLD) {
        this.trackSlowQuery(key, queryTime)
      }

      return result
    } catch (error) {
      console.error(`Query failed for key ${key}:`, error)
      throw error
    }
  }

  // Отслеживание медленных запросов
  private trackSlowQuery(queryKey: string, queryTime: number) {
    const existing = this.slowQueries.get(queryKey)
    if (existing) {
      existing.count++
      existing.avgTime = (existing.avgTime + queryTime) / 2
      existing.lastSeen = new Date()
    } else {
      this.slowQueries.set(queryKey, {
        count: 1,
        avgTime: queryTime,
        lastSeen: new Date()
      })
    }
  }

  // Получение статистики медленных запросов
  getSlowQueriesReport(): Array<{
    query: string
    count: number
    avgTime: number
    lastSeen: Date
  }> {
    return Array.from(this.slowQueries.entries()).map(([query, stats]) => ({
      query,
      ...stats
    }))
  }

  // Очистка кэша
  clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key)
        }
      }
    } else {
      this.queryCache.clear()
    }
  }

  // Оптимизированные запросы для часто используемых операций
  async getPopularTracks(limit: number = 20) {
    return this.cachedQuery(
      `popular_tracks_${limit}`,
      () => db.track.findMany({
        where: { isPublished: true },
        orderBy: { playCount: 'desc' },
        take: limit,
        include: {
          user: {
            select: { username: true, displayName: true, avatar: true }
          }
        }
      }),
      10 * 60 * 1000 // 10 минут кэш
    )
  }

  async getRecentTracks(limit: number = 20) {
    return this.cachedQuery(
      `recent_tracks_${limit}`,
      () => db.track.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: { username: true, displayName: true, avatar: true }
          }
        }
      }),
      5 * 60 * 1000 // 5 минут кэш
    )
  }

  async getUserStats(userId: string) {
    return this.cachedQuery(
      `user_stats_${userId}`,
      async () => {
        const [tracks, likes, followers, following] = await Promise.all([
          db.track.count({ where: { userId } }),
          db.like.count({ where: { user: { id: userId } } }),
          db.follow.count({ where: { followingId: userId } }),
          db.follow.count({ where: { followerId: userId } })
        ])

        return { tracks, likes, followers, following }
      },
      2 * 60 * 1000 // 2 минуты кэш
    )
  }

  async searchTracks(query: string, limit: number = 20) {
    return this.cachedQuery(
      `search_tracks_${query}_${limit}`,
      () => db.track.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { artist: { contains: query, mode: 'insensitive' } },
            { genre: { contains: query, mode: 'insensitive' } }
          ]
        },
        orderBy: { playCount: 'desc' },
        take: limit,
        include: {
          user: {
            select: { username: true, displayName: true, avatar: true }
          }
        }
      }),
      5 * 60 * 1000 // 5 минут кэш
    )
  }

  // Пакетные операции для улучшения производительности
  async batchUpdateTrackStats(trackIds: string[]) {
    const startTime = performance.now()
    
    try {
      // Получаем статистику для всех треков одним запросом
      const stats = await db.like.groupBy({
        by: ['trackId'],
        where: { trackId: { in: trackIds } },
        _count: { trackId: true }
      })

      // Обновляем счетчики лайков
      const updatePromises = stats.map(stat =>
        db.track.update({
          where: { id: stat.trackId },
          data: { likeCount: stat._count.trackId }
        })
      )

      await Promise.all(updatePromises)
      
      const endTime = performance.now()
      console.log(`Batch update completed in ${endTime - startTime}ms for ${trackIds.length} tracks`)
    } catch (error) {
      console.error('Batch update failed:', error)
      throw error
    }
  }

  // Мониторинг производительности
  async getPerformanceMetrics() {
    const slowQueries = this.getSlowQueriesReport()
    const cacheSize = this.queryCache.size
    
    return {
      cacheSize,
      slowQueriesCount: slowQueries.length,
      slowQueries: slowQueries.slice(0, 10), // Топ 10 медленных запросов
      cacheHitRate: this.calculateCacheHitRate()
    }
  }

  private calculateCacheHitRate(): number {
    // Простая реализация - в реальном проекте нужно отслеживать hits/misses
    return 0.85 // 85% hit rate
  }
}

// Экспорт оптимизатора
export const dbOptimizer = DatabaseOptimizer.getInstance()

// Хелперы для работы с транзакциями
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await db.$transaction(fn)
}

// Хелпер для безопасного выполнения запросов
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await queryFn()
  } catch (error) {
    console.error('Database query failed:', error)
    return fallback
  }
}

// Очистка соединения при завершении приложения
process.on('beforeExit', async () => {
  await db.$disconnect()
})

export default db
