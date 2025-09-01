/**
 * Система мониторинга для NORMALDANCE
 */

import { logger } from './logger'

export interface MetricData {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

export interface MonitoringConfig {
  enabled: boolean
  metricsInterval: number
  maxMetrics: number
  enableAlerts: boolean
  alertThresholds: Record<string, number>
}

export class Monitoring {
  private config: MonitoringConfig
  private metrics: MetricData[] = []
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private isRunning = false

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      enabled: true,
      metricsInterval: 60000, // 1 минута
      maxMetrics: 1000,
      enableAlerts: true,
      alertThresholds: {
        memoryUsage: 0.8,
        cpuUsage: 0.8,
        responseTime: 5000,
        errorRate: 0.1
      },
      ...config
    }
  }

  /**
   * Запуск мониторинга
   */
  start(): void {
    if (this.isRunning) {
      return
    }

    this.isRunning = true
    logger.info('Monitoring started')

    // Запуск периодического сбора метрик
    this.collectMetrics()
    this.timers.set('metrics', setInterval(() => this.collectMetrics(), this.config.metricsInterval))
  }

  /**
   * Остановка мониторинга
   */
  stop(): void {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false
    logger.info('Monitoring stopped')

    // Остановка всех таймеров
    this.timers.forEach(timer => clearInterval(timer))
    this.timers.clear()
  }

  /**
   * Сбор метрик
   */
  private collectMetrics(): void {
    if (!this.config.enabled) {
      return
    }

    try {
      const memoryUsage = process.memoryUsage()
      const cpuUsage = process.cpuUsage()

      // Добавление метрик памяти
      this.recordMetric('memory.rss', memoryUsage.rss / 1024 / 1024) // MB
      this.recordMetric('memory.heapTotal', memoryUsage.heapTotal / 1024 / 1024) // MB
      this.recordMetric('memory.heapUsed', memoryUsage.heapUsed / 1024 / 1024) // MB
      this.recordMetric('memory.external', memoryUsage.external / 1024 / 1024) // MB

      // Добавление метрик CPU
      this.recordMetric('cpu.user', cpuUsage.user / 1000000) // seconds
      this.recordMetric('cpu.system', cpuUsage.system / 1000000) // seconds

      // Проверка пороговых значений
      this.checkThresholds()

    } catch (error) {
      logger.error('Failed to collect metrics', error as Error)
    }
  }

  /**
   * Запись метрики
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: MetricData = {
      name,
      value,
      timestamp: Date.now(),
      tags
    }

    this.metrics.push(metric)

    // Ограничение количества метрик
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics)
    }

    logger.debug('Metric recorded', { name, value, tags })
  }

  /**
   * Получение метрик
   */
  getMetrics(name?: string): MetricData[] {
    if (name) {
      return this.metrics.filter(metric => metric.name === name)
    }
    return [...this.metrics]
  }

  /**
   * Получение статистики по метрике
   */
  getMetricStats(name: string): {
    count: number
    min: number
    max: number
    avg: number
    latest: number
  } {
    const metrics = this.getMetrics(name)
    
    if (metrics.length === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        avg: 0,
        latest: 0
      }
    }

    const values = metrics.map(m => m.value)
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      latest: values[values.length - 1]
    }
  }

  /**
   * Проверка пороговых значений
   */
  private checkThresholds(): void {
    if (!this.config.enableAlerts) {
      return
    }

    const stats = {
      memory: this.getMetricStats('memory.heapUsed'),
      cpu: this.getMetricStats('cpu.user')
    }

    // Проверка использования памяти
    if (stats.memory.latest > this.config.alertThresholds.memoryUsage * 1024 * 1024) {
      logger.warn('Memory usage threshold exceeded', {
        current: stats.memory.latest / 1024 / 1024,
        threshold: this.config.alertThresholds.memoryUsage
      })
    }

    // Проверка использования CPU
    if (stats.cpu.latest > this.config.alertThresholds.cpuUsage) {
      logger.warn('CPU usage threshold exceeded', {
        current: stats.cpu.latest,
        threshold: this.config.alertThresholds.cpuUsage
      })
    }
  }

  /**
   * Очистка метрик
   */
  clearMetrics(): void {
    this.metrics = []
    logger.info('Metrics cleared')
  }

  /**
   * Получение статуса мониторинга
   */
  getStatus(): {
    isRunning: boolean
    metricsCount: number
    timersCount: number
    config: MonitoringConfig
  } {
    return {
      isRunning: this.isRunning,
      metricsCount: this.metrics.length,
      timersCount: this.timers.size,
      config: this.config
    }
  }
}

// Создание singleton экземпляра
export const monitoring = new Monitoring({
  enabled: process.env.NODE_ENV !== 'test',
  metricsInterval: parseInt(process.env.MONITORING_INTERVAL || '60000'),
  maxMetrics: parseInt(process.env.MONITORING_MAX_METRICS || '1000'),
  enableAlerts: process.env.MONITORING_ENABLE_ALERTS !== 'false'
})

// Инициализация при загрузке модуля
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  monitoring.start()
}

export default Monitoring