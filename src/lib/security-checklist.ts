import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

// Интерфейс для результата проверки безопасности
export interface SecurityCheckResult {
  passed: boolean
  issues: SecurityIssue[]
  score: number
  recommendations: string[]
}

interface SecurityIssue {
  category: 'keys' | 'cors' | 'headers' | 'logging' | 'validation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  fix: string
}

// Проверка приватных ключей в коде и env
export function checkPrivateKeys(): SecurityIssue[] {
  const issues: SecurityIssue[] = []
  
  // Проверка переменных окружения
  const dangerousEnvVars = [
    'PRIVATE_KEY',
    'SECRET_KEY', 
    'WALLET_PRIVATE_KEY',
    'SOLANA_PRIVATE_KEY'
  ]
  
  dangerousEnvVars.forEach(envVar => {
    if (process.env[envVar] && process.env.NODE_ENV === 'production') {
      issues.push({
        category: 'keys',
        severity: 'critical',
        description: `Приватный ключ найден в production env: ${envVar}`,
        fix: 'Используйте безопасное хранилище ключей (AWS KMS, HashiCorp Vault)'
      })
    }
  })
  
  // Проверка хардкода в коде (базовая)
  if (typeof window === 'undefined') {
    const suspiciousPatterns = [
      /[0-9a-fA-F]{64}/, // 64-символьные hex строки
      /[1-9A-HJ-NP-Za-km-z]{87,88}/, // Base58 приватные ключи
    ]
    
    // В реальности нужно сканировать файлы, здесь заглушка
    const hasHardcodedKeys = false // TODO: реальная проверка файлов
    
    if (hasHardcodedKeys) {
      issues.push({
        category: 'keys',
        severity: 'critical',
        description: 'Обнаружены потенциальные приватные ключи в коде',
        fix: 'Удалите приватные ключи из кода, используйте переменные окружения'
      })
    }
  }
  
  return issues
}

// Проверка CORS настроек
export function checkCORSSettings(): SecurityIssue[] {
  const issues: SecurityIssue[] = []
  
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  
  if (allowedOrigins.includes('*') && process.env.NODE_ENV === 'production') {
    issues.push({
      category: 'cors',
      severity: 'high',
      description: 'CORS настроен на * в production',
      fix: 'Укажите конкретные домены в ALLOWED_ORIGINS'
    })
  }
  
  if (allowedOrigins.length === 0) {
    issues.push({
      category: 'cors',
      severity: 'medium',
      description: 'CORS origins не настроены',
      fix: 'Настройте ALLOWED_ORIGINS для безопасности'
    })
  }
  
  return issues
}

// Проверка безопасных заголовков
export function checkSecurityHeaders(response: NextResponse): SecurityIssue[] {
  const issues: SecurityIssue[] = []
  
  const requiredHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': 'default-src \'self\''
  }
  
  Object.entries(requiredHeaders).forEach(([header, expectedValue]) => {
    const actualValue = response.headers.get(header)
    if (!actualValue) {
      issues.push({
        category: 'headers',
        severity: 'medium',
        description: `Отсутствует заголовок безопасности: ${header}`,
        fix: `Добавьте заголовок: ${header}: ${expectedValue}`
      })
    }
  })
  
  return issues
}

// Проверка логирования (отсутствие чувствительных данных)
export function checkLoggingSecurity(): SecurityIssue[] {
  const issues: SecurityIssue[] = []
  
  // Проверяем настройки логгера
  const sensitiveFields = [
    'password',
    'privateKey',
    'secret',
    'token',
    'apiKey',
    'signature'
  ]
  
  // В реальности нужно проверить конфигурацию логгера
  const loggerConfig = {
    redactFields: ['password', 'privateKey'] // Пример
  }
  
  sensitiveFields.forEach(field => {
    if (!loggerConfig.redactFields?.includes(field)) {
      issues.push({
        category: 'logging',
        severity: 'medium',
        description: `Поле ${field} может попасть в логи`,
        fix: `Добавьте ${field} в redactFields логгера`
      })
    }
  })
  
  return issues
}

// Middleware для безопасных заголовков
export function securityHeadersMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Устанавливаем безопасные заголовки
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // CSP для production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:;"
    )
  }
  
  // CORS
  const origin = request.headers.get('origin')
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  return response
}

// Основная функция проверки безопасности
export function performSecurityCheck(): SecurityCheckResult {
  const allIssues: SecurityIssue[] = []
  
  // Запускаем все проверки
  allIssues.push(...checkPrivateKeys())
  allIssues.push(...checkCORSSettings())
  allIssues.push(...checkLoggingSecurity())
  
  // Подсчет score
  const severityWeights = { low: 1, medium: 3, high: 7, critical: 15 }
  const totalWeight = allIssues.reduce((sum, issue) => sum + severityWeights[issue.severity], 0)
  const score = Math.max(0, 100 - totalWeight)
  
  // Генерация рекомендаций
  const recommendations: string[] = []
  
  if (allIssues.some(i => i.severity === 'critical')) {
    recommendations.push('🚨 Критические уязвимости требуют немедленного исправления')
  }
  
  if (allIssues.some(i => i.category === 'keys')) {
    recommendations.push('🔐 Проверьте управление приватными ключами')
  }
  
  if (allIssues.some(i => i.category === 'cors')) {
    recommendations.push('🌐 Настройте CORS для production')
  }
  
  if (allIssues.length === 0) {
    recommendations.push('✅ Базовые проверки безопасности пройдены')
  }
  
  // Логирование результатов
  logger.info('Security check completed', {
    issuesCount: allIssues.length,
    score,
    criticalIssues: allIssues.filter(i => i.severity === 'critical').length
  })
  
  return {
    passed: allIssues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
    issues: allIssues,
    score: Math.round(score),
    recommendations
  }
}

// API endpoint для проверки безопасности
export async function securityCheckAPI(): Promise<Response> {
  try {
    const result = performSecurityCheck()
    return Response.json(result)
  } catch (error) {
    logger.error('Security check failed', { error })
    return new Response('Security check failed', { status: 500 })
  }
}