// CDN Manager для оптимизации доставки статики и аудио
export interface CDNConfig {
  primary: string
  fallbacks: string[]
  regions: { [region: string]: string }
  cacheControl: {
    audio: string
    images: string
    static: string
  }
}

// Конфигурация CDN
const CDN_CONFIG: CDNConfig = {
  primary: process.env.CDN_PRIMARY || 'https://normaldance.pages.dev',
  fallbacks: [
    'https://gateway.pinata.cloud',
    'https://cloudflare-ipfs.com',
    'https://ipfs.io'
  ],
  regions: {
    'us': 'https://us.normaldance.pages.dev',
    'eu': 'https://eu.normaldance.pages.dev',
    'asia': 'https://asia.normaldance.pages.dev'
  },
  cacheControl: {
    audio: 'public, max-age=31536000, immutable', // 1 год
    images: 'public, max-age=2592000', // 30 дней
    static: 'public, max-age=86400' // 1 день
  }
}

// Типы файлов
export type FileType = 'audio' | 'image' | 'static'

// Интерфейс для CDN ответа
export interface CDNResponse {
  url: string
  fallbackUrls: string[]
  cacheHeaders: { [key: string]: string }
  region?: string
}

class CDNManager {
  private config: CDNConfig
  private healthCache = new Map<string, { healthy: boolean; lastCheck: number }>()
  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000 // 5 минут

  constructor(config: CDNConfig = CDN_CONFIG) {
    this.config = config
    this.startHealthChecks()
  }

  // Получение оптимального URL для файла
  async getOptimalUrl(
    path: string, 
    type: FileType, 
    userRegion?: string
  ): Promise<CDNResponse> {
    // Определяем лучший CDN для региона пользователя
    const primaryCdn = this.selectPrimaryCDN(userRegion)
    
    // Проверяем здоровье основного CDN
    const isPrimaryHealthy = await this.checkCDNHealth(primaryCdn)
    
    let selectedCdn = primaryCdn
    if (!isPrimaryHealthy) {
      // Ищем здоровый fallback
      for (const fallback of this.config.fallbacks) {
        if (await this.checkCDNHealth(fallback)) {
          selectedCdn = fallback
          break
        }
      }
    }

    // Формируем URL
    const url = this.buildUrl(selectedCdn, path, type)
    
    // Формируем fallback URLs
    const fallbackUrls = this.config.fallbacks
      .filter(cdn => cdn !== selectedCdn)
      .map(cdn => this.buildUrl(cdn, path, type))

    return {
      url,
      fallbackUrls,
      cacheHeaders: this.getCacheHeaders(type),
      region: userRegion
    }
  }

  // Выбор основного CDN по региону
  private selectPrimaryCDN(userRegion?: string): string {
    if (userRegion && this.config.regions[userRegion]) {
      return this.config.regions[userRegion]
    }
    return this.config.primary
  }

  // Построение URL
  private buildUrl(cdn: string, path: string, type: FileType): string {
    // Убираем слеши в начале пути
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    
    // Для IPFS хешей
    if (cleanPath.startsWith('Qm') || cleanPath.startsWith('bafy')) {
      return `${cdn}/ipfs/${cleanPath}`
    }
    
    // Для обычных файлов
    return `${cdn}/${cleanPath}`
  }

  // Получение заголовков кеширования
  private getCacheHeaders(type: FileType): { [key: string]: string } {
    return {
      'Cache-Control': this.config.cacheControl[type],
      'CDN-Cache-Control': this.config.cacheControl[type],
      'Cloudflare-CDN-Cache-Control': this.config.cacheControl[type]
    }
  }

  // Проверка здоровья CDN
  private async checkCDNHealth(cdn: string): Promise<boolean> {
    const cached = this.healthCache.get(cdn)
    const now = Date.now()
    
    // Используем кешированный результат если он свежий
    if (cached && (now - cached.lastCheck) < this.HEALTH_CHECK_INTERVAL) {
      return cached.healthy
    }

    try {
      // Простая проверка доступности
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${cdn}/health`, {
        method: 'HEAD',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      const healthy = response.ok || response.status === 404 // 404 тоже OK для CDN
      this.healthCache.set(cdn, { healthy, lastCheck: now })
      
      return healthy
    } catch (error) {
      console.warn(`CDN health check failed for ${cdn}:`, error)
      this.healthCache.set(cdn, { healthy: false, lastCheck: now })
      return false
    }
  }

  // Запуск периодических проверок здоровья
  private startHealthChecks() {
    setInterval(async () => {
      const allCdns = [this.config.primary, ...this.config.fallbacks, ...Object.values(this.config.regions)]
      const uniqueCdns = [...new Set(allCdns)]
      
      for (const cdn of uniqueCdns) {
        await this.checkCDNHealth(cdn)
      }
      
      console.log('CDN health check completed', {
        healthy: Array.from(this.healthCache.entries())
          .filter(([_, health]) => health.healthy)
          .map(([cdn]) => cdn),
        unhealthy: Array.from(this.healthCache.entries())
          .filter(([_, health]) => !health.healthy)
          .map(([cdn]) => cdn)
      })
    }, this.HEALTH_CHECK_INTERVAL)
  }

  // Предзагрузка критических ресурсов
  async preloadCriticalResources(resources: { path: string; type: FileType }[]) {
    const preloadPromises = resources.map(async (resource) => {
      try {
        const cdnResponse = await this.getOptimalUrl(resource.path, resource.type)
        
        // Создаем link элемент для preload
        if (typeof document !== 'undefined') {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.href = cdnResponse.url
          link.as = resource.type === 'audio' ? 'audio' : 
                   resource.type === 'image' ? 'image' : 'fetch'
          link.crossOrigin = 'anonymous'
          document.head.appendChild(link)
        }
        
        return { resource, url: cdnResponse.url, success: true }
      } catch (error) {
        console.error(`Failed to preload ${resource.path}:`, error)
        return { resource, url: null, success: false }
      }
    })

    const results = await Promise.allSettled(preloadPromises)
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    
    console.log(`Preloaded ${successful}/${resources.length} critical resources`)
    return results
  }

  // Получение статистики CDN
  getStats() {
    const healthStats = Array.from(this.healthCache.entries()).reduce((acc, [cdn, health]) => {
      acc[cdn] = {
        healthy: health.healthy,
        lastCheck: new Date(health.lastCheck).toISOString()
      }
      return acc
    }, {} as { [cdn: string]: { healthy: boolean; lastCheck: string } })

    return {
      config: this.config,
      health: healthStats,
      totalCdns: this.healthCache.size,
      healthyCdns: Array.from(this.healthCache.values()).filter(h => h.healthy).length
    }
  }
}

// Глобальный экземпляр CDN менеджера
export const cdnManager = new CDNManager()

// Хелперы для разных типов файлов
export async function getAudioUrl(path: string, userRegion?: string): Promise<string> {
  const response = await cdnManager.getOptimalUrl(path, 'audio', userRegion)
  return response.url
}

export async function getImageUrl(path: string, userRegion?: string): Promise<string> {
  const response = await cdnManager.getOptimalUrl(path, 'image', userRegion)
  return response.url
}

export async function getStaticUrl(path: string, userRegion?: string): Promise<string> {
  const response = await cdnManager.getOptimalUrl(path, 'static', userRegion)
  return response.url
}

// Компонент для оптимизированной загрузки изображений
export function OptimizedImage({ 
  src, 
  alt, 
  className, 
  userRegion,
  ...props 
}: {
  src: string
  alt: string
  className?: string
  userRegion?: string
  [key: string]: any
}) {
  const [optimizedSrc, setOptimizedSrc] = useState(src)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getImageUrl(src, userRegion)
      .then(url => {
        setOptimizedSrc(url)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to get optimized image URL:', err)
        setError(true)
        setLoading(false)
      })
  }, [src, userRegion])

  if (loading) {
    return <div className={`bg-gray-200 animate-pulse ${className}`} />
  }

  if (error) {
    return <div className={`bg-gray-300 flex items-center justify-center ${className}`}>
      <span className="text-gray-500">Ошибка загрузки</span>
    </div>
  }

  return (
    <img 
      src={optimizedSrc} 
      alt={alt} 
      className={className}
      loading="lazy"
      {...props}
    />
  )
}

// Хук для React компонентов
export function useCDN() {
  const [stats, setStats] = useState(cdnManager.getStats())

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cdnManager.getStats())
    }, 60000) // Обновляем каждую минуту

    return () => clearInterval(interval)
  }, [])

  return {
    getAudioUrl: (path: string, region?: string) => getAudioUrl(path, region),
    getImageUrl: (path: string, region?: string) => getImageUrl(path, region),
    getStaticUrl: (path: string, region?: string) => getStaticUrl(path, region),
    preloadResources: cdnManager.preloadCriticalResources.bind(cdnManager),
    stats
  }
}

export default CDNManager