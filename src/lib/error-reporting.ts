/**
 * Система отчетности об ошибках для NORMALDANCE
 */

import { logger } from './logger'

export interface ErrorReport {
  id: string
  timestamp: string
  type: string
  message: string
  stack?: string
  context?: Record<string, any>
  userAgent?: string
  url?: string
  userId?: string
  sessionId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  tags?: Record<string, string>
}

export interface ErrorReporterConfig {
  enabled: boolean
  sampleRate: number
  maxReports: number
  ignorePatterns: RegExp[]
  beforeSend?: (report: ErrorReport) => ErrorReport | null
}

export class ErrorReporter {
  private config: ErrorReporterConfig
  private reports: ErrorReport[] = []
  private isReporting = false

  constructor(config: Partial<ErrorReporterConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      maxReports: 1000,
      ignorePatterns: [
        /ResizeObserver loop limit exceeded/i,
        /NetworkError/i,
        /AbortError/i,
        /The play() request was interrupted/i
      ],
      ...config
    }
  }

  /**
   * Отправка отчета об ошибке
   */
  async report(error: Error | string, context?: Record<string, any>): Promise<string | null> {
    if (!this.config.enabled) {
      return null
    }

    // Проверка rate limiting
    if (Math.random() > this.config.sampleRate) {
      return null
    }

    // Проверка игнорируемых ошибок
    const errorMessage = error instanceof Error ? error.message : String(error)
    const shouldIgnore = this.config.ignorePatterns.some(pattern => pattern.test(errorMessage))
    
    if (shouldIgnore) {
      return null
    }

    const report: ErrorReport = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: error instanceof Error ? error.constructor.name : 'UnknownError',
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      context: context || undefined,
      severity: this.determineSeverity(error),
      tags: this.extractTags(error) || undefined
    }

    // Применение пользовательского обработчика
    if (this.config.beforeSend) {
      const processedReport = this.config.beforeSend(report)
      if (!processedReport) {
        return null
      }
      Object.assign(report, processedReport)
    }

    // Сохранение отчета
    this.reports.push(report)
    
    // Ограничение количества отчетов
    if (this.reports.length > this.config.maxReports) {
      this.reports = this.reports.slice(-this.config.maxReports)
    }

    // Логирование
    logger.error('Error reported', {
      id: report.id,
      type: report.type,
      severity: report.severity,
      message: report.message
    })

    // Отправка на сервер (если настроено)
    await this.sendReport(report)

    return report.id
  }

  /**
   * Определение серьезности ошибки
   */
  private determineSeverity(error: Error | string): ErrorReport['severity'] {
    const message = error instanceof Error ? error.message : String(error)
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical'
    }
    
    if (message.includes('error') || message.includes('exception')) {
      return 'high'
    }
    
    if (message.includes('warning') || message.includes('warn')) {
      return 'medium'
    }
    
    return 'low'
  }

  /**
   * Извлечение тегов из ошибки
   */
  private extractTags(error: Error | string): Record<string, string> {
    const tags: Record<string, string> = {}
    const message = error instanceof Error ? error.message : String(error)
    
    // Извлечение тегов из сообщения
    const tagRegex = /@(\w+):([^@]+)/g
    let match
    
    while ((match = tagRegex.exec(message)) !== null) {
      tags[match[1]] = match[2]
    }
    
    return tags
  }

  /**
   * Генерация уникального ID
   */
  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Отправка отчета на сервер
   */
  private async sendReport(report: ErrorReport): Promise<void> {
    try {
      // Здесь можно добавить логику отправки на внешний сервер
      // Например, через fetch API или другой HTTP клиент
      logger.debug('Error report sent', { id: report.id })
    } catch (error) {
      logger.error('Failed to send error report', error as Error)
    }
  }

  /**
   * Получение отчетов
   */
  getReports(): ErrorReport[] {
    return [...this.reports]
  }

  /**
   * Очистка отчетов
   */
  clearReports(): void {
    this.reports = []
  }

  /**
   * Получение статистики
   */
  getStats(): {
    totalReports: number
    reportsByType: Record<string, number>
    reportsBySeverity: Record<string, number>
  } {
    const reportsByType: Record<string, number> = {}
    const reportsBySeverity: Record<string, number> = {}
    
    this.reports.forEach(report => {
      reportsByType[report.type] = (reportsByType[report.type] || 0) + 1
      reportsBySeverity[report.severity] = (reportsBySeverity[report.severity] || 0) + 1
    })
    
    return {
      totalReports: this.reports.length,
      reportsByType,
      reportsBySeverity
    }
  }

  /**
   * Включение/выключение отчетности
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
  }

  /**
   * Установка rate limiting
   */
  setSampleRate(rate: number): void {
    this.config.sampleRate = Math.max(0, Math.min(1, rate))
  }
}

// Создание singleton экземпляра
export const errorReporter = new ErrorReporter({
  enabled: process.env.NODE_ENV !== 'test',
  sampleRate: parseFloat(process.env['ERROR_REPORT_SAMPLE_RATE'] || '0.1'),
  maxReports: parseInt(process.env['ERROR_REPORT_MAX_REPORTS'] || '1000')
})

// Глобальный обработчик ошибок
export const setupGlobalErrorHandlers = () => {
  // Обработка необработанных исключений
  process.on('uncaughtException', (error) => {
    errorReporter.report(error, {
      source: 'uncaughtException',
      process: process.pid
    })
  })

  // Обработка необработанных промисов
  process.on('unhandledRejection', (reason) => {
    errorReporter.report(new Error(String(reason)), {
      source: 'unhandledRejection',
      process: process.pid
    })
  })
}

// Инициализация при загрузке модуля
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  setupGlobalErrorHandlers()
}

export default ErrorReporter