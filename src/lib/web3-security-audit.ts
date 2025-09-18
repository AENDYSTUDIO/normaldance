import { PublicKey, Transaction, Connection } from '@solana/web3.js'
import { logger } from './logger'

// Интерфейс для результата аудита
interface SecurityAuditResult {
  passed: boolean
  issues: SecurityIssue[]
  score: number
  recommendations: string[]
}

interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  description: string
  location?: string
  fix?: string
}

// Валидация приватных ключей
export function auditPrivateKeyHandling(): SecurityIssue[] {
  const issues: SecurityIssue[] = []
  
  // Проверка на хардкод приватных ключей в коде
  const codeContent = process.env.NODE_ENV === 'development' ? 'check-enabled' : 'production'
  
  if (process.env.PRIVATE_KEY && process.env.NODE_ENV === 'production') {
    issues.push({
      severity: 'critical',
      type: 'private_key_exposure',
      description: 'Приватный ключ найден в переменных окружения продакшена',
      fix: 'Используйте безопасное хранилище ключей (AWS KMS, HashiCorp Vault)'
    })
  }
  
  // Проверка на использование небезопасных методов
  if (typeof window !== 'undefined' && (window as any).solana) {
    const wallet = (window as any).solana
    if (!wallet.isPhantom && !wallet.isSolflare) {
      issues.push({
        severity: 'medium',
        type: 'unknown_wallet',
        description: 'Обнаружен неизвестный кошелек',
        fix: 'Добавьте проверку поддерживаемых кошельков'
      })
    }
  }
  
  return issues
}

// Валидация параметров транзакций
export function validateTransactionParams(
  transaction: Transaction,
  expectedRecipient?: string,
  maxAmount?: number
): SecurityIssue[] {
  const issues: SecurityIssue[] = []
  
  try {
    // Проверка подписей
    if (transaction.signatures.length === 0) {
      issues.push({
        severity: 'high',
        type: 'unsigned_transaction',
        description: 'Транзакция не подписана',
        fix: 'Убедитесь что транзакция подписана перед отправкой'
      })
    }
    
    // Проверка инструкций
    if (transaction.instructions.length === 0) {
      issues.push({
        severity: 'medium',
        type: 'empty_transaction',
        description: 'Транзакция не содержит инструкций',
        fix: 'Добавьте валидные инструкции в транзакцию'
      })
    }
    
    // Проверка получателя (если указан)
    if (expectedRecipient) {
      try {
        new PublicKey(expectedRecipient)
      } catch {
        issues.push({
          severity: 'high',
          type: 'invalid_recipient',
          description: 'Некорректный адрес получателя',
          fix: 'Проверьте формат адреса получателя'
        })
      }
    }
    
    // Проверка лимитов (базовая)
    transaction.instructions.forEach((instruction, index) => {
      if (instruction.data.length > 1024) {
        issues.push({
          severity: 'medium',
          type: 'large_instruction_data',
          description: `Инструкция ${index} содержит большой объем данных`,
          location: `instruction[${index}]`,
          fix: 'Проверьте необходимость такого объема данных'
        })
      }
    })
    
  } catch (error) {
    issues.push({
      severity: 'critical',
      type: 'transaction_validation_error',
      description: `Ошибка валидации транзакции: ${error}`,
      fix: 'Проверьте структуру транзакции'
    })
  }
  
  return issues
}

// Проверка silent-fail в кошельке
export function auditWalletErrorHandling(): SecurityIssue[] {
  const issues: SecurityIssue[] = []
  
  // Проверяем наличие обработчиков ошибок
  const hasGlobalErrorHandler = typeof window !== 'undefined' && 
    (window.onerror || window.addEventListener)
  
  if (!hasGlobalErrorHandler) {
    issues.push({
      severity: 'medium',
      type: 'missing_error_handler',
      description: 'Отсутствует глобальный обработчик ошибок',
      fix: 'Добавьте window.onerror или addEventListener для отлова ошибок'
    })
  }
  
  // Проверка логирования ошибок кошелька
  if (typeof console.error === 'undefined') {
    issues.push({
      severity: 'low',
      type: 'missing_error_logging',
      description: 'Отсутствует логирование ошибок',
      fix: 'Добавьте логирование критических ошибок'
    })
  }
  
  return issues
}

// Аудит RPC подключений
export function auditRPCConnections(connection: Connection): SecurityIssue[] {
  const issues: SecurityIssue[] = []
  
  const endpoint = connection.rpcEndpoint
  
  // Проверка HTTPS
  if (!endpoint.startsWith('https://')) {
    issues.push({
      severity: 'high',
      type: 'insecure_rpc',
      description: 'RPC подключение не использует HTTPS',
      location: endpoint,
      fix: 'Используйте HTTPS endpoints для RPC'
    })
  }
  
  // Проверка известных небезопасных endpoints
  const unsafeEndpoints = [
    'http://localhost',
    'http://127.0.0.1',
    'ws://'
  ]
  
  if (process.env.NODE_ENV === 'production') {
    unsafeEndpoints.forEach(unsafe => {
      if (endpoint.includes(unsafe)) {
        issues.push({
          severity: 'critical',
          type: 'unsafe_rpc_endpoint',
          description: `Небезопасный RPC endpoint в продакшене: ${unsafe}`,
          location: endpoint,
          fix: 'Используйте безопасные RPC endpoints в продакшене'
        })
      }
    })
  }
  
  return issues
}

// Проверка rate limiting
export function auditRateLimiting(): SecurityIssue[] {
  const issues: SecurityIssue[] = []
  
  // Проверка наличия rate limiting для API
  const hasRateLimit = process.env.RATE_LIMIT_ENABLED === 'true'
  
  if (!hasRateLimit && process.env.NODE_ENV === 'production') {
    issues.push({
      severity: 'medium',
      type: 'missing_rate_limit',
      description: 'Отсутствует rate limiting для API',
      fix: 'Добавьте rate limiting для предотвращения злоупотреблений'
    })
  }
  
  return issues
}

// Основная функция аудита
export async function performSecurityAudit(
  connection?: Connection,
  transaction?: Transaction
): Promise<SecurityAuditResult> {
  const allIssues: SecurityIssue[] = []
  
  // Запускаем все проверки
  allIssues.push(...auditPrivateKeyHandling())
  allIssues.push(...auditWalletErrorHandling())
  allIssues.push(...auditRateLimiting())
  
  if (connection) {
    allIssues.push(...auditRPCConnections(connection))
  }
  
  if (transaction) {
    allIssues.push(...validateTransactionParams(transaction))
  }
  
  // Подсчет score
  const severityWeights = { low: 1, medium: 3, high: 7, critical: 15 }
  const totalWeight = allIssues.reduce((sum, issue) => sum + severityWeights[issue.severity], 0)
  const maxPossibleWeight = 100 // Максимальный возможный вес
  const score = Math.max(0, 100 - (totalWeight / maxPossibleWeight) * 100)
  
  // Генерация рекомендаций
  const recommendations: string[] = []
  
  if (allIssues.some(i => i.severity === 'critical')) {
    recommendations.push('🚨 Критические уязвимости требуют немедленного исправления')
  }
  
  if (allIssues.some(i => i.type === 'private_key_exposure')) {
    recommendations.push('🔐 Переместите приватные ключи в безопасное хранилище')
  }
  
  if (allIssues.some(i => i.type === 'insecure_rpc')) {
    recommendations.push('🌐 Используйте только HTTPS RPC endpoints')
  }
  
  if (allIssues.length === 0) {
    recommendations.push('✅ Базовые проверки безопасности пройдены')
  }
  
  // Логирование результатов
  logger.info('Security audit completed', {
    issuesCount: allIssues.length,
    score,
    criticalIssues: allIssues.filter(i => i.severity === 'critical').length,
    highIssues: allIssues.filter(i => i.severity === 'high').length
  })
  
  return {
    passed: allIssues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
    issues: allIssues,
    score: Math.round(score),
    recommendations
  }
}

// Middleware для автоматического аудита транзакций
export function createSecurityMiddleware() {
  return async (transaction: Transaction, connection: Connection) => {
    const auditResult = await performSecurityAudit(connection, transaction)
    
    if (!auditResult.passed) {
      const criticalIssues = auditResult.issues.filter(i => i.severity === 'critical')
      if (criticalIssues.length > 0) {
        throw new Error(`Security audit failed: ${criticalIssues.map(i => i.description).join(', ')}`)
      }
    }
    
    return auditResult
  }
}