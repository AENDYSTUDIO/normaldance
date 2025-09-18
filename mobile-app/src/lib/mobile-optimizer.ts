import * as FileSystem from 'expo-file-system'
import NetInfo from '@react-native-async-storage/async-storage'
import { Audio } from 'expo-av'

// Интерфейсы для мобильной оптимизации
interface CacheConfig {
  maxSize: number // MB
  maxAge: number // ms
  compressionLevel: number
}

interface OfflineData {
  tracks: any[]
  playlists: any[]
  userProfile: any
  lastSync: number
}

// Менеджер кеша медиа файлов
export class MobileMediaCache {
  private cacheDir: string
  private config: CacheConfig
  private cacheIndex = new Map<string, { size: number; lastAccess: number; path: string }>()

  constructor(config: CacheConfig = {
    maxSize: 500, // 500MB
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    compressionLevel: 0.8
  }) {
    this.config = config
    this.cacheDir = `${FileSystem.cacheDirectory}media/`
    this.initializeCache()
  }

  // Инициализация кеша
  private async initializeCache(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir)
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true })
      }
      
      // Загружаем индекс кеша
      await this.loadCacheIndex()
      
      // Очищаем устаревшие файлы
      await this.cleanupExpiredFiles()
    } catch (error) {
      console.error('Failed to initialize media cache:', error)
    }
  }

  // Загрузка индекса кеша
  private async loadCacheIndex(): Promise<void> {
    try {
      const indexPath = `${this.cacheDir}index.json`
      const indexInfo = await FileSystem.getInfoAsync(indexPath)
      
      if (indexInfo.exists) {
        const indexData = await FileSystem.readAsStringAsync(indexPath)
        const index = JSON.parse(indexData)
        
        for (const [key, value] of Object.entries(index)) {
          this.cacheIndex.set(key, value as any)
        }
      }
    } catch (error) {
      console.warn('Failed to load cache index:', error)
    }
  }

  // Сохранение индекса кеша
  private async saveCacheIndex(): Promise<void> {
    try {
      const indexPath = `${this.cacheDir}index.json`
      const indexData = Object.fromEntries(this.cacheIndex)
      await FileSystem.writeAsStringAsync(indexPath, JSON.stringify(indexData))
    } catch (error) {
      console.error('Failed to save cache index:', error)
    }
  }

  // Кеширование медиа файла
  async cacheMedia(url: string, key: string): Promise<string | null> {
    try {
      const filePath = `${this.cacheDir}${key}`
      
      // Проверяем есть ли уже в кеше
      const cached = this.cacheIndex.get(key)
      if (cached) {
        const fileInfo = await FileSystem.getInfoAsync(cached.path)
        if (fileInfo.exists) {
          // Обновляем время доступа
          cached.lastAccess = Date.now()
          this.cacheIndex.set(key, cached)
          return cached.path
        }
      }

      // Проверяем размер кеша
      await this.ensureCacheSpace()

      // Загружаем файл
      const downloadResult = await FileSystem.downloadAsync(url, filePath)
      
      if (downloadResult.status === 200) {
        const fileInfo = await FileSystem.getInfoAsync(filePath)
        
        this.cacheIndex.set(key, {
          size: fileInfo.size || 0,
          lastAccess: Date.now(),
          path: filePath
        })
        
        await this.saveCacheIndex()
        return filePath
      }
      
      return null
    } catch (error) {
      console.error('Failed to cache media:', error)
      return null
    }
  }

  // Получение медиа из кеша
  async getCachedMedia(key: string): Promise<string | null> {
    const cached = this.cacheIndex.get(key)
    if (!cached) return null

    const fileInfo = await FileSystem.getInfoAsync(cached.path)
    if (!fileInfo.exists) {
      this.cacheIndex.delete(key)
      return null
    }

    // Обновляем время доступа
    cached.lastAccess = Date.now()
    this.cacheIndex.set(key, cached)
    
    return cached.path
  }

  // Обеспечение места в кеше
  private async ensureCacheSpace(): Promise<void> {
    const currentSize = Array.from(this.cacheIndex.values())
      .reduce((sum, item) => sum + item.size, 0)
    
    const maxSizeBytes = this.config.maxSize * 1024 * 1024
    
    if (currentSize > maxSizeBytes * 0.8) { // Начинаем очистку при 80%
      await this.evictLRU()
    }
  }

  // Удаление наименее используемых файлов
  private async evictLRU(): Promise<void> {
    const entries = Array.from(this.cacheIndex.entries())
      .sort(([, a], [, b]) => a.lastAccess - b.lastAccess)
    
    const toEvict = entries.slice(0, Math.floor(entries.length * 0.2)) // Удаляем 20%
    
    for (const [key, item] of toEvict) {
      try {
        await FileSystem.deleteAsync(item.path, { idempotent: true })
        this.cacheIndex.delete(key)
      } catch (error) {
        console.warn(`Failed to evict ${key}:`, error)
      }
    }
    
    await this.saveCacheIndex()
  }

  // Очистка устаревших файлов
  private async cleanupExpiredFiles(): Promise<void> {
    const now = Date.now()
    const expiredKeys: string[] = []
    
    for (const [key, item] of this.cacheIndex.entries()) {
      if (now - item.lastAccess > this.config.maxAge) {
        expiredKeys.push(key)
      }
    }
    
    for (const key of expiredKeys) {
      const item = this.cacheIndex.get(key)!
      try {
        await FileSystem.deleteAsync(item.path, { idempotent: true })
        this.cacheIndex.delete(key)
      } catch (error) {
        console.warn(`Failed to cleanup ${key}:`, error)
      }
    }
    
    if (expiredKeys.length > 0) {
      await this.saveCacheIndex()
    }
  }

  // Получение статистики кеша
  getCacheStats() {
    const totalSize = Array.from(this.cacheIndex.values())
      .reduce((sum, item) => sum + item.size, 0)
    
    return {
      filesCount: this.cacheIndex.size,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      maxSizeMB: this.config.maxSize,
      usagePercent: ((totalSize / (this.config.maxSize * 1024 * 1024)) * 100).toFixed(1)
    }
  }
}

// Менеджер offline-first данных
export class OfflineDataManager {
  private storageKey = 'offline_data'
  
  // Сохранение данных для offline
  async saveOfflineData(data: Partial<OfflineData>): Promise<void> {
    try {
      const existing = await this.getOfflineData()
      const updated = { ...existing, ...data, lastSync: Date.now() }
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save offline data:', error)
    }
  }

  // Получение offline данных
  async getOfflineData(): Promise<OfflineData> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey)
      if (data) {
        return JSON.parse(data)
      }
    } catch (error) {
      console.error('Failed to get offline data:', error)
    }
    
    return {
      tracks: [],
      playlists: [],
      userProfile: null,
      lastSync: 0
    }
  }

  // Проверка актуальности данных
  async isDataStale(maxAge: number = 24 * 60 * 60 * 1000): Promise<boolean> {
    const data = await this.getOfflineData()
    return Date.now() - data.lastSync > maxAge
  }

  // Синхронизация с сервером
  async syncWithServer(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch()
      if (!netInfo.isConnected) {
        return false
      }

      // Здесь должна быть логика синхронизации с API
      // Пока заглушка
      const mockData = {
        tracks: [], // Данные с сервера
        playlists: [],
        userProfile: {}
      }
      
      await this.saveOfflineData(mockData)
      return true
    } catch (error) {
      console.error('Failed to sync with server:', error)
      return false
    }
  }
}

// Оптимизатор производительности
export class MobilePerformanceOptimizer {
  private mediaCache: MobileMediaCache
  private offlineManager: OfflineDataManager
  
  constructor() {
    this.mediaCache = new MobileMediaCache()
    this.offlineManager = new OfflineDataManager()
  }

  // Предзагрузка критических ресурсов
  async preloadCriticalResources(resources: { url: string; key: string }[]): Promise<void> {
    const preloadPromises = resources.map(async (resource) => {
      try {
        await this.mediaCache.cacheMedia(resource.url, resource.key)
      } catch (error) {
        console.warn(`Failed to preload ${resource.key}:`, error)
      }
    })

    await Promise.allSettled(preloadPromises)
  }

  // Оптимизированная загрузка аудио
  async loadOptimizedAudio(url: string, trackId: string): Promise<Audio.Sound | null> {
    try {
      // Сначала проверяем кеш
      const cachedPath = await this.mediaCache.getCachedMedia(trackId)
      const audioUrl = cachedPath || url

      // Если нет в кеше и есть сеть - кешируем
      if (!cachedPath) {
        const netInfo = await NetInfo.fetch()
        if (netInfo.isConnected) {
          this.mediaCache.cacheMedia(url, trackId) // Асинхронно
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false, isLooping: false }
      )

      return sound
    } catch (error) {
      console.error('Failed to load optimized audio:', error)
      return null
    }
  }

  // Измерение производительности
  measurePerformance<T>(operation: () => Promise<T>, name: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const startTime = Date.now()
      
      try {
        const result = await operation()
        const endTime = Date.now()
        
        console.log(`Performance [${name}]: ${endTime - startTime}ms`)
        resolve(result)
      } catch (error) {
        const endTime = Date.now()
        console.error(`Performance [${name}] failed after ${endTime - startTime}ms:`, error)
        reject(error)
      }
    })
  }

  // Получение статистики производительности
  getPerformanceStats() {
    return {
      cache: this.mediaCache.getCacheStats(),
      memory: {
        // В React Native нет прямого доступа к памяти
        // Можно использовать библиотеки типа react-native-device-info
      }
    }
  }
}

// Глобальные экземпляры
export const mobileMediaCache = new MobileMediaCache()
export const offlineDataManager = new OfflineDataManager()
export const mobileOptimizer = new MobilePerformanceOptimizer()

// React Native хук для мобильной оптимизации
export function useMobileOptimization() {
  const [isOnline, setIsOnline] = useState(true)
  const [cacheStats, setCacheStats] = useState(mobileMediaCache.getCacheStats())

  useEffect(() => {
    // Подписка на изменения сети
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false)
    })

    // Обновление статистики кеша
    const interval = setInterval(() => {
      setCacheStats(mobileMediaCache.getCacheStats())
    }, 10000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  return {
    isOnline,
    cacheStats,
    preloadResources: mobileOptimizer.preloadCriticalResources.bind(mobileOptimizer),
    loadAudio: mobileOptimizer.loadOptimizedAudio.bind(mobileOptimizer),
    syncOfflineData: offlineDataManager.syncWithServer.bind(offlineDataManager)
  }
}