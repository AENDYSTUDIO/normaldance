/**
 * Интеграция Sentry для мониторинга ошибок и производительности
 * Поддержка кастомных метрик, уведомлений и автоматического создания issue
 */

import * as Sentry from '@sentry/nextjs'

// Интерфейс для контекстной информации
export interface SentryContext {
  userId?: string
  userEmail?: string
  sessionId?: string
  environment: string
  release: string
  tags: Record<string, string>
  extra: Record<string, any>
}

// Интерфейс для кастомных метрик
export interface CustomMetric {
  name: string
  value: number
  unit?: string
  tags?: Record<string, string>
  timestamp?: number
}

// Интерфейс для уведомлений
export interface NotificationConfig {
  slack?: {
    webhookUrl: string
    channel?: string
    username?: string
  }
  email?: {
    to: string[]
    subject?: string
    template?: string
  }
  teams?: {
    webhookUrl: string
  }
  jira?: {
    baseUrl: string
    projectKey: string
    username: string
    apiToken: string
  }
  trello?: {
    apiKey: string
    token: string
    boardId: string
    listId: string
  }
}

// Интерфейс для правил алертинга
export interface AlertRule {
  id: string
  name: string
  condition: string
  threshold: number
  window: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  notifications: string[]
}

// Класс для интеграции Sentry
export class SentryIntegration {
  private context: SentryContext
  private notificationConfig: NotificationConfig
  private alertRules: AlertRule[]
  private isInitialized = false

  constructor(context: SentryContext, notificationConfig: NotificationConfig = {}) {
    this.context = context
    this.notificationConfig = notificationConfig
    this.alertRules = []
  }

  // Инициализация интеграции
  init(): void {
    if (this.isInitialized) return

    // Настройка контекста
    this.setupContext()

    // Настройка уведомлений
    this.setupNotifications()

    // Настройка правил алертинга
    this.setupAlertRules()

    this.isInitialized = true
  }

  // Настройка контекста
  private setupContext(): void {
    // Установка пользователя
    if (this.context.userId) {
      Sentry.setUser({
        id: this.context.userId,
        email: this.context.userEmail,
      })
    }

    // Установка тегов
    Object.entries(this.context.tags).forEach(([key, value]) => {
      Sentry.setTag(key, value)
    })

    // Установка дополнительной информации
    Object.entries(this.context.extra).forEach(([key, value]) => {
      Sentry.setExtra(key, value)
    })

    // Установка окружения и версии
    Sentry.setContext('environment', {
      name: this.context.environment,
      release: this.context.release,
    })
  }

  // Настройка уведомлений
  private setupNotifications(): void {
    // Настройка Slack уведомлений
    if (this.notificationConfig.slack) {
      this.setupSlackNotifications()
    }

    // Настройка Email уведомлений
    if (this.notificationConfig.email) {
      this.setupEmailNotifications()
    }

    // Настройка Teams уведомлений
    if (this.notificationConfig.teams) {
      this.setupTeamsNotifications()
    }

    // Настройка Jira интеграции
    if (this.notificationConfig.jira) {
      this.setupJiraIntegration()
    }

    // Настройка Trello интеграции
    if (this.notificationConfig.trello) {
      this.setupTrelloIntegration()
    }
  }

  // Настройка Slack уведомлений
  private setupSlackNotifications(): void {
    // Здесь можно настроить интеграцию с Slack через вебхуки
    // Для примера добавим breadcrumb для отслеживания
    Sentry.addBreadcrumb({
      category: 'notification',
      message: 'Slack notifications configured',
      level: 'info',
      data: {
        type: 'slack',
        webhookUrl: this.notificationConfig.slack?.webhookUrl,
        channel: this.notificationConfig.slack?.channel,
      },
    })
  }

  // Настройка Email уведомлений
  private setupEmailNotifications(): void {
    Sentry.addBreadcrumb({
      category: 'notification',
      message: 'Email notifications configured',
      level: 'info',
      data: {
        type: 'email',
        recipients: this.notificationConfig.email?.to,
      },
    })
  }

  // Настройка Teams уведомлений
  private setupTeamsNotifications(): void {
    Sentry.addBreadcrumb({
      category: 'notification',
      message: 'Teams notifications configured',
      level: 'info',
      data: {
        type: 'teams',
        webhookUrl: this.notificationConfig.teams?.webhookUrl,
      },
    })
  }

  // Настройка Jira интеграции
  private setupJiraIntegration(): void {
    Sentry.addBreadcrumb({
      category: 'integration',
      message: 'Jira integration configured',
      level: 'info',
      data: {
        type: 'jira',
        baseUrl: this.notificationConfig.jira?.baseUrl,
        projectKey: this.notificationConfig.jira?.projectKey,
      },
    })
  }

  // Настройка Trello интеграции
  private setupTrelloIntegration(): void {
    Sentry.addBreadcrumb({
      category: 'integration',
      message: 'Trello integration configured',
      level: 'info',
      data: {
        type: 'trello',
        boardId: this.notificationConfig.trello?.boardId,
        listId: this.notificationConfig.trello?.listId,
      },
    })
  }

  // Настройка правил алертинга
  private setupAlertRules(): void {
    // Пример правил алертинга
    this.alertRules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: 'error_rate > 0.1',
        threshold: 0.1,
        window: '5m',
        severity: 'high',
        enabled: true,
        notifications: ['slack', 'email'],
      },
      {
        id: 'critical-error',
        name: 'Critical Error',
        condition: 'severity == "critical"',
        threshold: 1,
        window: '1m',
        severity: 'critical',
        enabled: true,
        notifications: ['slack', 'email', 'teams'],
      },
      {
        id: 'performance-degradation',
        name: 'Performance Degradation',
        condition: 'response_time > 2000',
        threshold: 2000,
        window: '10m',
        severity: 'medium',
        enabled: true,
        notifications: ['slack'],
      },
    ]
  }

  // Отправка кастомной метрики
  trackMetric(metric: CustomMetric): void {
    if (process.env.NODE_ENV !== 'production') return

    // Отправка в Sentry как breadcrumb
    Sentry.addBreadcrumb({
      category: 'metric',
      message: `Custom metric: ${metric.name}`,
      level: 'info',
      data: {
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        tags: metric.tags,
        timestamp: metric.timestamp || Date.now(),
      },
    })

    // Отправка в Sentry как extra data
    Sentry.setExtra(`metric_${metric.name}`, {
      value: metric.value,
      unit: metric.unit,
      tags: metric.tags,
      timestamp: metric.timestamp || Date.now(),
    })
  }

  // Отправка кастомного события
  trackEvent(name: string, data?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'production') return

    Sentry.addBreadcrumb({
      category: 'event',
      message: `Custom event: ${name}`,
      level: 'info',
      data,
    })
  }

  // Отправка ошибки с контекстом
  captureError(error: Error | string, context?: Record<string, any>): void {
    Sentry.captureException(error, {
      extra: context,
    })
  }

  // Отправка сообщения
  captureMessage(message: string, level: Sentry.Severity = 'info'): void {
    Sentry.captureMessage(message, level)
  }

  // Проверка правил алертинга
  checkAlertRules(): void {
    // Здесь можно реализовать логику проверки правил алертинга
    // на основе собранных метрик и ошибок
    this.alertRules.forEach(rule => {
      if (rule.enabled) {
        this.evaluateAlertRule(rule)
      }
    })
  }

  // Оценка правила алертинга
  private evaluateAlertRule(rule: AlertRule): void {
    // Здесь должна быть логика оценки условия правила
    // Для примера просто добавляем breadcrumb
    Sentry.addBreadcrumb({
      category: 'alert-rule',
      message: `Evaluating alert rule: ${rule.name}`,
      level: 'info',
      data: {
        ruleId: rule.id,
        condition: rule.condition,
        threshold: rule.threshold,
        window: rule.window,
        severity: rule.severity,
        notifications: rule.notifications,
      },
    })
  }

  // Создание issue в Sentry
  async createIssueInSentry(
    title: string,
    description: string,
    severity: Sentry.Severity = 'error',
    tags: Record<string, string> = {}
  ): Promise<void> {
    try {
      // Здесь должна быть логика создания issue в Sentry
      // Для примера просто отправляем сообщение
      Sentry.captureMessage(`Creating issue: ${title}`, severity)
      
      // Добавляем контекст для issue
      Sentry.setExtra('issue', {
        title,
        description,
        severity,
        tags,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Failed to create Sentry issue:', error)
    }
  }

  // Создание тикета в Jira
  async createJiraTicket(
    summary: string,
    description: string,
    priority: string = 'Medium',
    issueType: string = 'Bug'
  ): Promise<void> {
    if (!this.notificationConfig.jira) {
      console.warn('Jira integration not configured')
      return
    }

    try {
      const jiraData = {
        fields: {
          project: { key: this.notificationConfig.jira.projectKey },
          summary,
          description,
          priority: { name: priority },
          issueType: { name: issueType },
          labels: ['sentry', 'monitoring'],
        },
      }

      // Здесь должна быть логика создания тикета в Jira
      // Для примера просто отправляем сообщение
      Sentry.captureMessage(`Creating Jira ticket: ${summary}`, 'info')
      
      // Добавляем контекст для тикета
      Sentry.setExtra('jira_ticket', {
        summary,
        description,
        priority,
        issueType,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Failed to create Jira ticket:', error)
    }
  }

  // Создание карточки в Trello
  async createTrelloCard(
    name: string,
    description: string,
    labels: string[] = []
  ): Promise<void> {
    if (!this.notificationConfig.trello) {
      console.warn('Trello integration not configured')
      return
    }

    try {
      const trelloData = {
        name,
        desc: description,
        idLabels: labels,
        pos: 'top',
      }

      // Здесь должна быть логика создания карточки в Trello
      // Для примера просто отправляем сообщение
      Sentry.captureMessage(`Creating Trello card: ${name}`, 'info')
      
      // Добавляем контекст для карточки
      Sentry.setExtra('trello_card', {
        name,
        description,
        labels,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Failed to create Trello card:', error)
    }
  }

  // Отправка уведомления в Slack
  async sendSlackNotification(
    message: string,
    channel?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    if (!this.notificationConfig.slack) {
      console.warn('Slack integration not configured')
      return
    }

    try {
      const slackData = {
        text: message,
        channel: channel || this.notificationConfig.slack.channel,
        username: this.notificationConfig.slack.username || 'Sentry Bot',
        attachments: [
          {
            color: this.getSeverityColor(severity),
            text: message,
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      }

      // Здесь должна быть логика отправки сообщения в Slack
      // Для примера просто отправляем сообщение в Sentry
      Sentry.captureMessage(`Slack notification: ${message}`, 'info')
      
      // Добавляем контекст для уведомления
      Sentry.setExtra('slack_notification', {
        message,
        channel,
        severity,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
    }
  }

  // Отправка уведомления в Teams
  async sendTeamsNotification(
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    if (!this.notificationConfig.teams) {
      console.warn('Teams integration not configured')
      return
    }

    try {
      const teamsData = {
        type: 'message',
        attachments: [
          {
            contentType: 'application/vnd.microsoft.card.adaptive',
            contentUrl: null,
            content: {
              type: 'AdaptiveCard',
              body: [
                {
                  type: 'TextBlock',
                  text: message,
                  weight: 'Bolder',
                  size: 'Medium',
                  color: this.getSeverityColor(severity),
                },
              ],
              $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
              version: '1.2',
            },
          },
        ],
      }

      // Здесь должна быть логика отправки сообщения в Teams
      // Для примера просто отправляем сообщение в Sentry
      Sentry.captureMessage(`Teams notification: ${message}`, 'info')
      
      // Добавляем контекст для уведомления
      Sentry.setExtra('teams_notification', {
        message,
        severity,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Failed to send Teams notification:', error)
    }
  }

  // Получение цвета для уровня серьезности
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low':
        return 'good'
      case 'medium':
        return 'warning'
      case 'high':
        return 'warning'
      case 'critical':
        return 'danger'
      default:
        return 'default'
    }
  }

  // Получение статистики по ошибкам
  getErrorStats(): Record<string, any> {
    // Здесь должна быть логика получения статистики по ошибкам
    // Для примера возвращаем пустой объект
    return {}
  }

  // Получение статистики по метрикам
  getMetricStats(): Record<string, any> {
    // Здесь должна быть логика получения статистики по метрикам
    // Для примера возвращаем пустой объект
    return {}
  }

  // Очистка контекста
  clearContext(): void {
    Sentry.configureScope(scope => {
      scope.setUser(null)
      scope.clear()
    })
  }

  // Обновление контекста
  updateContext(context: Partial<SentryContext>): void {
    this.context = { ...this.context, ...context }
    this.setupContext()
  }
}

// Создаем экземпляр интеграции
const sentryIntegration = new SentryIntegration(
  {
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.1',
    tags: {
      project: 'normaldance',
      version: process.env.npm_package_version || '1.0.1',
    },
    extra: {
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    },
  }
)

// Инициализация при загрузке модуля
if (typeof window !== 'undefined') {
  sentryIntegration.init()
}

export default sentryIntegration
export { SentryIntegration }