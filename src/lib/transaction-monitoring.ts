import { Connection, PublicKey, TransactionSignature } from '@solana/web3.js'
import { logger } from './logger'
import { sendNotificationToUser } from './socket'
import { Server } from 'socket.io'

// Интерфейсы для мониторинга
interface TransactionPattern {
  userId: string
  address: string
  frequency: number // транзакций в минуту
  totalAmount: number // общая сумма за период
  uniqueRecipients: Set<string>
  timeWindow: number // окно времени в мс
  transactions: TransactionRecord[]
}

interface TransactionRecord {
  signature: string
  timestamp: number
  amount: number
  recipient: string
  type: 'donation' | 'staking' | 'nft_mint' | 'unknown'
  status: 'pending' | 'confirmed' | 'failed'
}

interface AnomalyAlert {
  type: 'high_frequency' | 'large_amount' | 'suspicious_recipient' | 'failed_pattern'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId: string
  description: string
  data: any
  timestamp: number
}

// Конфигурация лимитов
const LIMITS = {
  MAX_FREQUENCY_PER_MINUTE: 10,
  MAX_AMOUNT_PER_HOUR: 100, // SOL
  MAX_FAILED_ATTEMPTS: 5,
  SUSPICIOUS_AMOUNT_THRESHOLD: 50, // SOL
  TIME_WINDOW: 60 * 60 * 1000, // 1 час
}

class TransactionMonitor {
  private patterns = new Map<string, TransactionPattern>()
  private connection: Connection
  private io?: Server
  private alertCallbacks: ((alert: AnomalyAlert) => void)[] = []

  constructor(connection: Connection, io?: Server) {
    this.connection = connection
    this.io = io
    this.startCleanupInterval()
  }

  // Регистрация callback для алертов
  onAlert(callback: (alert: AnomalyAlert) => void) {
    this.alertCallbacks.push(callback)
  }

  // Отправка алерта
  private async sendAlert(alert: AnomalyAlert) {
    logger.warn('Transaction anomaly detected', alert)
    
    // Отправляем через Socket.IO
    if (this.io) {
      sendNotificationToUser(this.io, {
        id: `alert_${Date.now()}`,
        userId: alert.userId,
        type: 'security' as const,
        title: 'Подозрительная активность',
        message: alert.description,
        priority: alert.severity === 'critical' ? 'urgent' as const : 'high' as const,
        status: 'unread' as const,
        createdAt: new Date(),
        metadata: {
          actionUrl: '/security',
          timestamp: new Date()
        }
      })
    }
    
    // Вызываем callbacks
    this.alertCallbacks.forEach(callback => callback(alert))
  }

  // Добавление транзакции для мониторинга
  async addTransaction(
    userId: string,
    signature: string,
    amount: number,
    recipient: string,
    type: TransactionRecord['type'] = 'unknown'
  ) {
    const address = userId // Предполагаем что userId это адрес кошелька
    const now = Date.now()
    
    // Получаем или создаем паттерн для пользователя
    let pattern = this.patterns.get(userId)
    if (!pattern) {
      pattern = {
        userId,
        address,
        frequency: 0,
        totalAmount: 0,
        uniqueRecipients: new Set(),
        timeWindow: now,
        transactions: []
      }
      this.patterns.set(userId, pattern)
    }

    // Добавляем транзакцию
    const transaction: TransactionRecord = {
      signature,
      timestamp: now,
      amount,
      recipient,
      type,
      status: 'pending'
    }
    
    pattern.transactions.push(transaction)
    pattern.uniqueRecipients.add(recipient)
    
    // Очищаем старые транзакции (старше часа)
    const cutoff = now - LIMITS.TIME_WINDOW
    pattern.transactions = pattern.transactions.filter(tx => tx.timestamp > cutoff)
    
    // Пересчитываем метрики
    this.updatePatternMetrics(pattern)
    
    // Проверяем на аномалии
    await this.detectAnomalies(pattern)
    
    // Мониторим статус транзакции
    this.monitorTransactionStatus(signature, userId)
  }

  // Обновление метрик паттерна
  private updatePatternMetrics(pattern: TransactionPattern) {
    const now = Date.now()
    const oneMinuteAgo = now - 60 * 1000
    const oneHourAgo = now - LIMITS.TIME_WINDOW
    
    // Частота за последнюю минуту
    pattern.frequency = pattern.transactions.filter(tx => tx.timestamp > oneMinuteAgo).length
    
    // Общая сумма за последний час
    pattern.totalAmount = pattern.transactions
      .filter(tx => tx.timestamp > oneHourAgo)
      .reduce((sum, tx) => sum + tx.amount, 0)
  }

  // Детекция аномалий
  private async detectAnomalies(pattern: TransactionPattern) {
    const alerts: AnomalyAlert[] = []
    
    // 1. Высокая частота транзакций
    if (pattern.frequency > LIMITS.MAX_FREQUENCY_PER_MINUTE) {
      alerts.push({
        type: 'high_frequency',
        severity: 'high',
        userId: pattern.userId,
        description: `Обнаружена высокая частота транзакций: ${pattern.frequency}/мин`,
        data: { frequency: pattern.frequency, limit: LIMITS.MAX_FREQUENCY_PER_MINUTE },
        timestamp: Date.now()
      })
    }
    
    // 2. Большая сумма за период
    if (pattern.totalAmount > LIMITS.MAX_AMOUNT_PER_HOUR) {
      alerts.push({
        type: 'large_amount',
        severity: 'medium',
        userId: pattern.userId,
        description: `Превышен лимит суммы: ${pattern.totalAmount.toFixed(2)} SOL/час`,
        data: { amount: pattern.totalAmount, limit: LIMITS.MAX_AMOUNT_PER_HOUR },
        timestamp: Date.now()
      })
    }
    
    // 3. Подозрительно большая разовая сумма
    const lastTransaction = pattern.transactions[pattern.transactions.length - 1]
    if (lastTransaction && lastTransaction.amount > LIMITS.SUSPICIOUS_AMOUNT_THRESHOLD) {
      alerts.push({
        type: 'large_amount',
        severity: 'high',
        userId: pattern.userId,
        description: `Подозрительно большая транзакция: ${lastTransaction.amount.toFixed(2)} SOL`,
        data: { 
          amount: lastTransaction.amount, 
          threshold: LIMITS.SUSPICIOUS_AMOUNT_THRESHOLD,
          signature: lastTransaction.signature 
        },
        timestamp: Date.now()
      })
    }
    
    // 4. Много неудачных попыток
    const failedCount = pattern.transactions.filter(tx => tx.status === 'failed').length
    if (failedCount > LIMITS.MAX_FAILED_ATTEMPTS) {
      alerts.push({
        type: 'failed_pattern',
        severity: 'medium',
        userId: pattern.userId,
        description: `Много неудачных транзакций: ${failedCount}`,
        data: { failedCount, limit: LIMITS.MAX_FAILED_ATTEMPTS },
        timestamp: Date.now()
      })
    }
    
    // 5. Подозрительные получатели (новые адреса с большими суммами)
    if (lastTransaction && lastTransaction.amount > 10) {
      const recipientHistory = pattern.transactions.filter(tx => tx.recipient === lastTransaction.recipient)
      if (recipientHistory.length === 1) { // Первая транзакция на этот адрес
        alerts.push({
          type: 'suspicious_recipient',
          severity: 'low',
          userId: pattern.userId,
          description: `Первая транзакция на новый адрес: ${lastTransaction.recipient.slice(0, 8)}...`,
          data: { 
            recipient: lastTransaction.recipient, 
            amount: lastTransaction.amount 
          },
          timestamp: Date.now()
        })
      }
    }
    
    // Отправляем все алерты
    for (const alert of alerts) {
      await this.sendAlert(alert)
    }
  }

  // Мониторинг статуса транзакции
  private async monitorTransactionStatus(signature: string, userId: string) {
    const maxAttempts = 30 // 30 попыток = ~2 минуты
    let attempts = 0
    
    const checkStatus = async () => {
      try {
        const status = await this.connection.getSignatureStatus(signature)
        
        if (status.value) {
          // Обновляем статус в паттерне
          const pattern = this.patterns.get(userId)
          if (pattern) {
            const transaction = pattern.transactions.find(tx => tx.signature === signature)
            if (transaction) {
              transaction.status = status.value.err ? 'failed' : 'confirmed'
              
              // Если транзакция провалилась, проверяем на аномалии
              if (status.value.err) {
                await this.detectAnomalies(pattern)
              }
            }
          }
          
          logger.info('Transaction status updated', {
            signature,
            userId,
            status: status.value.err ? 'failed' : 'confirmed',
            error: status.value.err
          })
          
          return
        }
        
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 4000) // Проверяем каждые 4 секунды
        } else {
          logger.warn('Transaction status check timeout', { signature, userId })
        }
        
      } catch (error) {
        logger.error('Failed to check transaction status', { signature, userId, error })
      }
    }
    
    // Начинаем мониторинг через 2 секунды
    setTimeout(checkStatus, 2000)
  }

  // Получение статистики пользователя
  getUserStats(userId: string) {
    const pattern = this.patterns.get(userId)
    if (!pattern) {
      return null
    }
    
    const now = Date.now()
    const oneHourAgo = now - LIMITS.TIME_WINDOW
    const recentTransactions = pattern.transactions.filter(tx => tx.timestamp > oneHourAgo)
    
    return {
      totalTransactions: pattern.transactions.length,
      recentTransactions: recentTransactions.length,
      totalAmount: pattern.totalAmount,
      frequency: pattern.frequency,
      uniqueRecipients: pattern.uniqueRecipients.size,
      failedTransactions: pattern.transactions.filter(tx => tx.status === 'failed').length,
      lastActivity: Math.max(...pattern.transactions.map(tx => tx.timestamp))
    }
  }

  // Получение всех алертов
  getAllAlerts(): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = []
    
    for (const pattern of this.patterns.values()) {
      // Генерируем текущие алерты на основе паттернов
      if (pattern.frequency > LIMITS.MAX_FREQUENCY_PER_MINUTE) {
        alerts.push({
          type: 'high_frequency',
          severity: 'high',
          userId: pattern.userId,
          description: `Высокая частота: ${pattern.frequency}/мин`,
          data: { frequency: pattern.frequency },
          timestamp: Date.now()
        })
      }
      
      if (pattern.totalAmount > LIMITS.MAX_AMOUNT_PER_HOUR) {
        alerts.push({
          type: 'large_amount',
          severity: 'medium',
          userId: pattern.userId,
          description: `Большая сумма: ${pattern.totalAmount.toFixed(2)} SOL`,
          data: { amount: pattern.totalAmount },
          timestamp: Date.now()
        })
      }
    }
    
    return alerts
  }

  // Очистка старых данных
  private startCleanupInterval() {
    setInterval(() => {
      const now = Date.now()
      const cutoff = now - LIMITS.TIME_WINDOW * 2 // Храним данные 2 часа
      
      for (const [userId, pattern] of this.patterns.entries()) {
        pattern.transactions = pattern.transactions.filter(tx => tx.timestamp > cutoff)
        
        // Удаляем паттерны без транзакций
        if (pattern.transactions.length === 0) {
          this.patterns.delete(userId)
        } else {
          this.updatePatternMetrics(pattern)
        }
      }
      
      logger.info('Transaction monitoring cleanup completed', {
        activePatterns: this.patterns.size
      })
    }, 10 * 60 * 1000) // Каждые 10 минут
  }
}

// Глобальный экземпляр монитора
let globalMonitor: TransactionMonitor | null = null

export function initializeTransactionMonitor(connection: Connection, io?: Server) {
  globalMonitor = new TransactionMonitor(connection, io)
  return globalMonitor
}

export function getTransactionMonitor(): TransactionMonitor | null {
  return globalMonitor
}

export { TransactionMonitor, type AnomalyAlert, type TransactionRecord }