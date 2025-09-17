'use client'

import { useEffect, useState, Suspense, lazy, ComponentType, ReactNode } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Badge } from '@/components/ui'
import { 
  Zap, 
  Wifi, 
  WifiOff, 
  Battery, 
  BatteryCharging, 
  Smartphone, 
  Desktop,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from '@/components/icons'

interface PerformanceMetrics {
  loadTime: number
  memoryUsage: number
  networkType: string
  deviceType: string
  score: number
  recommendations: string[]
}

interface OptimizerProps {
  children: ReactNode
  enableOptimization?: boolean
  showMetrics?: boolean
}

// Ленивая загрузка тяжелых компонентов
const LazyComponent = lazy(() => import('./heavy-component'))

class PerformanceOptimizer {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    memoryUsage: 0,
    networkType: 'unknown',
    deviceType: 'unknown',
    score: 0,
    recommendations: []
  }

  private startTime = 0
  private isOptimizing = false

  constructor() {
    this.startTime = performance.now()
    this.detectEnvironment()
    this.startMonitoring()
  }

  /**
   * Определение окружения
   */
  private detectEnvironment(): void {
    // Определение типа сети
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        this.metrics.networkType = connection.effectiveType || 'unknown'
      }
    }

    // Определение типа устройства
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent
      if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        this.metrics.deviceType = 'mobile'
      } else {
        this.metrics.deviceType = 'desktop'
      }
    }

    // Расчет начального балла
    this.calculateScore()
  }

  /**
   * Начало мониторинга производительности
   */
  private startMonitoring(): void {
    // Мониторинг использования памяти
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        if (memory) {
          this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1048576) // MB
        }
      }, 5000)
    }

    // Мониторинг времени загрузки
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.startTime
      this.metrics.loadTime = Math.round(loadTime)
      this.calculateScore()
      this.generateRecommendations()
    })
  }

  /**
   * Расчет производительности
   */
  private calculateScore(): void {
    let score = 100

    // Штраф за время загрузки
    if (this.metrics.loadTime > 3000) {
      score -= Math.min(30, (this.metrics.loadTime - 3000) / 100)
    }

    // Штраф за использование памяти
    if (this.metrics.memoryUsage > 100) {
      score -= Math.min(20, (this.metrics.memoryUsage - 100) / 10)
    }

    // Штраф за медленную сеть
    if (this.metrics.networkType === 'slow-2g' || this.metrics.networkType === '2g') {
      score -= 25
    } else if (this.metrics.networkType === '3g') {
      score -= 15
    }

    // Штраф за мобильные устройства с низкой производительностью
    if (this.metrics.deviceType === 'mobile') {
      score -= 10
    }

    this.metrics.score = Math.max(0, Math.round(score))
  }

  /**
   * Генерация рекомендаций
   */
  private generateRecommendations(): void {
    const recommendations: string[] = []

    if (this.metrics.loadTime > 3000) {
      recommendations.push('Время загрузки превышает 3 секунды. Рекомендуется оптимизировать ресурсы.')
    }

    if (this.metrics.memoryUsage > 100) {
      recommendations.push('Использование памяти высокое. Рекомендуется оптимизировать компоненты.')
    }

    if (this.metrics.networkType === 'slow-2g' || this.metrics.networkType === '2g') {
      recommendations.push('Медленное соединение. Рекомендуется включить режим экономии трафика.')
    }

    if (this.metrics.score < 70) {
      recommendations.push('Производительность низкая. Рекомендуется проверить устройство и сеть.')
    }

    this.metrics.recommendations = recommendations
  }

  /**
   * Оптимизация загрузки ресурсов
   */
  optimizeResources(): void {
    if (this.isOptimizing) return

    this.isOptimizing = true

    // Отложенная загрузка изображений
    this.lazyLoadImages()

    // Оптимизация шрифтов
    this.optimizeFonts()

    // Отключение анимаций на медленных устройствах
    this.reduceAnimations()

    // Оптимизация CSS
    this.optimizeCSS()

    this.isOptimizing = false
  }

  /**
   * Ленивая загрузка изображений
   */
  private lazyLoadImages(): void {
    const images = document.querySelectorAll('img[data-src]')
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src!
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach(img => imageObserver.observe(img))
  }

  /**
   * Оптимизация шрифтов
   */
  private optimizeFonts(): void {
    // Предзагрузка критических шрифтов
    const fontLink = document.createElement('link')
    fontLink.rel = 'preload'
    fontLink.href = '/fonts/critical-font.woff2'
    fontLink.as = 'font'
    fontLink.crossOrigin = 'anonymous'
    document.head.appendChild(fontLink)
  }

  /**
   * Снижение анимаций
   */
  private reduceAnimations(): void {
    if (this.metrics.networkType === 'slow-2g' || this.metrics.networkType === '2g') {
      document.body.classList.add('reduce-motion')
    }
  }

  /**
   * Оптимизация CSS
   */
  private optimizeCSS(): void {
    // Отложенная загрузка некритического CSS
    const nonCriticalCSS = document.createElement('link')
    nonCriticalCSS.rel = 'preload'
    nonCriticalCSS.href = '/styles/non-critical.css'
    nonCriticalCSS.as = 'style'
    nonCriticalCSS.onload = function() {
      this.rel = 'stylesheet'
    }
    document.head.appendChild(nonCriticalCSS)
  }

  /**
   * Получение метрик
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Проверка необходимости оптимизации
   */
  needsOptimization(): boolean {
    return this.metrics.score < 80 || 
           this.metrics.loadTime > 3000 || 
           this.metrics.memoryUsage > 100
  }
}

// Глобальный экземпляр оптимизатора
const performanceOptimizer = new PerformanceOptimizer()

export function PerformanceOptimizer({ 
  children, 
  enableOptimization = true, 
  showMetrics = false 
}: OptimizerProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(performanceOptimizer.getMetrics())
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Обновление метрик
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceOptimizer.getMetrics())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Автоматическая оптимизация
  useEffect(() => {
    if (enableOptimization && performanceOptimizer.needsOptimization()) {
      setIsOptimizing(true)
      performanceOptimizer.optimizeResources()
      setTimeout(() => setIsOptimizing(false), 1000)
    }
  }, [enableOptimization])

  // Ручная оптимизация
  const handleManualOptimization = () => {
    setIsOptimizing(true)
    performanceOptimizer.optimizeResources()
    setTimeout(() => setIsOptimizing(false), 1000)
  }

  // Рендеринг индикатора оптимизации
  const renderOptimizationIndicator = () => {
    if (!showMetrics) return null

    return (
      <Card className="fixed bottom-4 right-4 w-80 z-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Производительность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Балл:</span>
            <span className={metrics.score > 80 ? 'text-green-600' : metrics.score > 60 ? 'text-yellow-600' : 'text-red-600'}>
              {metrics.score}/100
            </span>
          </div>
          
          <Progress value={metrics.score} className="h-2" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {metrics.networkType === 'unknown' ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
              {metrics.networkType}
            </span>
            <span className="flex items-center gap-1">
              {metrics.deviceType === 'mobile' ? <Smartphone className="h-3 w-3" /> : <Desktop className="h-3 w-3" />}
              {metrics.deviceType}
            </span>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Загрузка: {metrics.loadTime}ms</span>
            <span>Память: {metrics.memoryUsage}MB</span>
          </div>

          {isOptimizing && (
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Оптимизация...
            </div>
          )}

          {metrics.recommendations.length > 0 && (
            <div className="space-y-1">
              {metrics.recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className="flex items-start gap-1 text-xs text-yellow-600">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span className="truncate">{rec}</span>
                </div>
              ))}
            </div>
          )}

          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleManualOptimization}
            disabled={isOptimizing}
            className="w-full text-xs h-7"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Оптимизация...
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-1" />
                Оптимизировать
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {children}
      {renderOptimizationIndicator()}
    </>
  )
}

// Хук для использования в компонентах
export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(performanceOptimizer.getMetrics())

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceOptimizer.getMetrics())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return {
    metrics,
    optimize: () => performanceOptimizer.optimizeResources(),
    needsOptimization: performanceOptimizer.needsOptimization()
  }
}

// Обертка для ленивой загрузки компонентов
export function LazyComponentWrapper<T extends ComponentType<any>>({
  component: Component,
  fallback = <div className="animate-pulse h-32 bg-muted rounded" />,
  ...props
}: {
  component: T
  fallback?: ReactNode
  [key: string]: any
}) {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  )
}

// Компонент для предварительной загрузки ресурсов
export function ResourcePreloader() {
  useEffect(() => {
    // Предварительная загрузка критических ресурсов
    const criticalResources = [
      '/fonts/critical-font.woff2',
      '/images/placeholder-avatar.jpg',
      '/images/placeholder-album.jpg'
    ]

    criticalResources.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = url
      link.as = url.includes('.woff2') ? 'font' : 'image'
      if (url.includes('.woff2')) {
        link.crossOrigin = 'anonymous'
      }
      document.head.appendChild(link)
    })

    // Предварительная загрузка API
    const preloadAPI = async () => {
      try {
        await fetch('/api/health', { method: 'HEAD' })
      } catch (error) {
        console.warn('Failed to preload API:', error)
      }
    }

    preloadAPI()

    return () => {
      // Очистка
      criticalResources.forEach(url => {
        const link = document.querySelector(`link[href="${url}"]`)
        if (link) link.remove()
      })
    }
  }, [])

  return null
}

// Компонент для отображения состояния загрузки
export function LoadingState({ message = 'Загрузка...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// Компонент для отображения ошибок загрузки
export function ErrorState({ 
  message = 'Произошла ошибка', 
  onRetry 
}: { 
  message?: string 
  onRetry?: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <p className="text-sm text-muted-foreground text-center">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} size="sm">
          Попробовать снова
        </Button>
      )}
    </div>
  )
}

export default PerformanceOptimizer