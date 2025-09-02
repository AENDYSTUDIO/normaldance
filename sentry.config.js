import { nodeIntegration } from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

const config = {
  // Включаем Sentry только в production и staging
  enabled: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging',

  // DSN для Sentry
  dsn: SENTRY_DSN,

  // Настройки окружения
  environment: process.env.NODE_ENV || 'development',

  // Версия приложения
  release: process.env.npm_package_version || '1.0.1',

  // Отключаем telemetry для Sentry
  telemetry: false,

  // Настройки трассировки
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Настройки сессий
  sessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Настройки replay
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.0,

  // Интеграции
  integrations: [
    // Интеграция для Next.js
    nodeIntegration({
      // Настройка трассировки для определенных доменов
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/normaldance\.com/,
        /^https:\/\/dnb1st\.ru/,
        /^https:\/\/dnb1st\.store/,
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.NEXT_PUBLIC_API_URL,
      ],
    }),

    // Интеграция для браузерных ошибок
    new Sentry.BrowserTracing({
      // Настройка трассировки для браузера
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/normaldance\.com/,
        /^https:\/\/dnb1st\.ru/,
        /^https:\/\/dnb1st\.store/,
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.NEXT_PUBLIC_API_URL,
      ],
    }),

    // Интеграция для replay
    new Sentry.Replay({
      // Настройка replay
      maskAllText: true,
      blockAllMedia: false,
      networkDetailAllowHeaders: ['x-trace-id', 'x-session-id'],
      networkDetailDenyHeaders: [],
      maskDomMethodName: 'maskValue',
    }),

    // Интеграция для интеграции с Vercel Analytics
    new Sentry.Integrations.VercelAnalytics({
      enabled: process.env.VERCEL_ANALYTICS_ENABLED === 'true',
    }),
  ],

  // Настройки контекста
  initialScope: {
    tags: {
      project: 'normaldance',
      version: process.env.npm_package_version || '1.0.1',
      environment: process.env.NODE_ENV || 'development',
    },
    user: process.env.SENTRY_USER ? {
      id: process.env.SENTRY_USER,
      email: process.env.SENTRY_USER_EMAIL,
    } : undefined,
  },

  // Настройки фильтрации ошибок
  beforeSend(event, hint) {
    // Фильтрация известных ошибок
    if (event.exception) {
      const exception = event.exception.values[0]
      
      // Игнорируем ResizeObserver loop errors
      if (exception.type === 'ResizeObserver loop limit exceeded') {
        return null
      }
      
      // Игнорируем NetworkError при отключении интернета
      if (exception.type === 'NetworkError' && exception.value?.includes('Failed to fetch')) {
        return null
      }
      
      // Игнорируем AbortError при отмене запросов
      if (exception.type === 'AbortError') {
        return null
      }
      
      // Игнорируем ошибки при закрытии вкладки
      if (exception.type === 'TypeError' && exception.value?.includes('Cannot read properties of null')) {
        return null
      }
    }
    
    return event
  },

  // Настройки sampling
  sampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Настройки release
  release: {
    name: process.env.npm_package_version || '1.0.1',
    dist: process.env.VERCEL_GITHUB_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA,
  },

  // Настройки serverName
  serverName: process.env.VERCEL_URL || 'localhost',

  // Настройки debug
  debug: process.env.NODE_ENV === 'development',

  // Настройки maxBreadcrumbs
  maxBreadcrumbs: 100,

  // Настройки attachStacktrace
  attachStacktrace: true,

  // Настройки denyUrls
  denyUrls: [
    // Игнорируем webpack chunk loading
    /webpack\/buildin/,
    // Игнорируем socket.io
    /socket\.io/,
    // Игнорируем hot reload
    /hot-update\.js/,
  ],

  // Настройки allowUrls
  allowUrls: [
    // Разрешаем только наш домен
    /https:\/\/normaldance\.com/,
    /https:\/\/dnb1st\.ru/,
    /https:\/\/dnb1st\.store/,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ],

  // Настройки ignoreErrors
  ignoreErrors: [
    // Игнорируем ResizeObserver loop errors
    'ResizeObserver loop limit exceeded',
    // Игнорируем NetworkError при отключении интернета
    'NetworkError when attempting to fetch resource',
    // Игнорируем AbortError при отмене запросов
    'AbortError',
    // Игнорируем ошибки при закрытии вкладки
    'Cannot read properties of null',
    // Игнорируем ошибки при работе с localStorage
    'The operation is insecure',
  ],

  // Настройки beforeBreadcrumb
  beforeBreadcrumb(breadcrumb, hint) {
    // Фильтрация breadcrumb'ов
    if (breadcrumb.category === 'console') {
      // Ограничиваем количество console breadcrumb'ов
      return breadcrumb.message.length > 100 ? null : breadcrumb
    }
    
    if (breadcrumb.category === 'navigation') {
      // Фильтруем навигацию
      return breadcrumb
    }
    
    return breadcrumb
  },

  // Настройки beforeSendTransaction
  beforeSendTransaction(transaction) {
    // Фильтрация транзакций
    if (transaction.name.includes('webpack')) {
      return null
    }
    
    return transaction
  },

  // Настройки для Vercel
  vercel: {
    // Включаем автоматическую интеграцию с Vercel
    autoInstrument: true,
    // Включаем сбор метрик производительности
    performanceMonitoring: true,
    // Включаем сбор ошибок
    errorTracking: true,
    // Включаем сбор пользовательских взаимодействий
    userInteractionTracking: true,
  },

  // Настройки для разных окружений
  environmentSpecific: {
    production: {
      tracesSampleRate: 0.2,
      sessionSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    },
    staging: {
      tracesSampleRate: 0.5,
      sessionSampleRate: 0.2,
      replaysSessionSampleRate: 0.2,
      replaysOnErrorSampleRate: 1.0,
    },
    development: {
      tracesSampleRate: 1.0,
      sessionSampleRate: 1.0,
      replaysSessionSampleRate: 0.0,
      replaysOnErrorSampleRate: 0.0,
    },
  },
}

// Применяем настройки для текущего окружения
if (config.environmentSpecific[config.environment]) {
  Object.assign(config, config.environmentSpecific[config.environment])
}

export default config