// Простой мониторинг без внешних зависимостей
class SimpleMonitoring {
  private metrics: Map<string, number> = new Map()
  private errors: Array<{timestamp: number, error: string, context?: any}> = []
  
  // Метрики
  increment(metric: string, value = 1) {
    this.metrics.set(metric, (this.metrics.get(metric) || 0) + value)
  }
  
  // Ошибки
  captureError(error: Error | string, context?: any) {
    this.errors.push({
      timestamp: Date.now(),
      error: error.toString(),
      context
    })
    
    // Ограничиваем размер массива
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-500)
    }
    
    console.error('Error captured:', error, context)
  }
  
  // Производительность
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      this.increment(`${name}.success`)
      this.increment(`${name}.duration`, Date.now() - start)
      return result
    } catch (error) {
      this.increment(`${name}.error`)
      this.captureError(error as Error, { operation: name })
      throw error
    }
  }
  
  // Получение статистики
  getStats() {
    return {
      metrics: Object.fromEntries(this.metrics),
      recentErrors: this.errors.slice(-10),
      uptime: process.uptime?.() || 0
    }
  }
  
  // Здоровье системы
  getHealth() {
    const errorRate = this.errors.filter(e => 
      Date.now() - e.timestamp < 60000 // последняя минута
    ).length
    
    return {
      status: errorRate > 10 ? 'unhealthy' : 'healthy',
      errorRate,
      timestamp: Date.now()
    }
  }
}

export const monitor = new SimpleMonitoring()

// Хуки для React компонентов
export function useErrorBoundary() {
  return (error: Error, errorInfo: any) => {
    monitor.captureError(error, errorInfo)
  }
}

// Middleware для API
export function withMonitoring(handler: Function) {
  return async (req: any, res: any) => {
    return monitor.measure(`api.${req.url}`, () => handler(req, res))
  }
}