import { Connection, PublicKey, TransactionSignature, SignatureResult } from '@solana/web3.js'
import { EventEmitter } from 'events'
import { logger } from './logger'

// Интерфейсы для событий транзакций
export interface TransactionEvent {
  signature: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  confirmationTime?: number
  slot?: number
  fee?: number
  error?: string
  programId?: string
  accounts?: string[]
}

export interface TransactionMetrics {
  tps: number // Транзакций в секунду
  confirmTimeP50: number // Медианное время подтверждения
  confirmTimeP95: number // 95-й перцентиль времени подтверждения
  failRate: number // Процент неудачных транзакций
  anomalies: number // Количество аномалий
}

// Провайдер событий транзакций
export class TransactionEventProvider extends EventEmitter {
  private connection: Connection
  private subscribedSignatures = new Map<string, { startTime: number; programId?: string }>()
  private recentTransactions: TransactionEvent[] = []
  private metrics: TransactionMetrics = {
    tps: 0,
    confirmTimeP50: 0,
    confirmTimeP95: 0,
    failRate: 0,
    anomalies: 0
  }
  private isRunning = false
  private maxHistorySize = 1000

  constructor(connection: Connection) {
    super()
    this.connection = connection
    this.startMetricsCalculation()
  }

  // Подписка на транзакцию
  subscribeToTransaction(signature: string, programId?: string): void {
    if (this.subscribedSignatures.has(signature)) {
      return // Уже подписаны
    }

    this.subscribedSignatures.set(signature, {
      startTime: Date.now(),
      programId
    })

    // Создаем событие pending
    const pendingEvent: TransactionEvent = {
      signature,
      timestamp: Date.now(),
      status: 'pending',
      programId
    }

    this.addTransaction(pendingEvent)
    this.emit('transaction:pending', pendingEvent)

    // Начинаем мониторинг
    this.monitorTransaction(signature)
  }

  // Мониторинг конкретной транзакции
  private async monitorTransaction(signature: string): Promise<void> {
    const subscriptionData = this.subscribedSignatures.get(signature)
    if (!subscriptionData) return

    const maxAttempts = 30 // 30 попыток = ~2 минуты
    let attempts = 0

    const checkStatus = async () => {
      try {
        attempts++
        const status = await this.connection.getSignatureStatus(signature)

        if (status.value) {
          const confirmationTime = Date.now() - subscriptionData.startTime
          
          const event: TransactionEvent = {
            signature,
            timestamp: Date.now(),
            status: status.value.err ? 'failed' : 'confirmed',
            confirmationTime,
            slot: status.value.slot,
            error: status.value.err ? JSON.stringify(status.value.err) : undefined,
            programId: subscriptionData.programId
          }

          // Получаем дополнительную информацию о транзакции
          try {
            const transaction = await this.connection.getTransaction(signature, {
              maxSupportedTransactionVersion: 0
            })
            
            if (transaction) {
              event.fee = transaction.meta?.fee
              event.accounts = transaction.transaction.message.accountKeys.map(k => k.toString())
            }
          } catch (error) {
            logger.warn('Failed to get transaction details', { signature, error })
          }

          this.updateTransaction(event)
          this.emit(`transaction:${event.status}`, event)
          this.subscribedSignatures.delete(signature)
          
          logger.info('Transaction status updated', {
            signature: signature.slice(0, 8),
            status: event.status,
            confirmationTime: event.confirmationTime
          })
          
          return
        }

        // Продолжаем проверку если транзакция еще не подтверждена
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 4000) // Проверяем каждые 4 секунды
        } else {
          // Таймаут
          const timeoutEvent: TransactionEvent = {
            signature,
            timestamp: Date.now(),
            status: 'failed',
            error: 'Transaction confirmation timeout',
            programId: subscriptionData.programId
          }

          this.updateTransaction(timeoutEvent)
          this.emit('transaction:timeout', timeoutEvent)
          this.subscribedSignatures.delete(signature)
          
          logger.warn('Transaction confirmation timeout', { signature })
        }

      } catch (error) {
        logger.error('Failed to check transaction status', { signature, error })
        
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 4000)
        } else {
          this.subscribedSignatures.delete(signature)
        }
      }
    }

    // Начинаем проверку через 2 секунды
    setTimeout(checkStatus, 2000)
  }

  // Добавление транзакции в историю
  private addTransaction(event: TransactionEvent): void {
    this.recentTransactions.push(event)
    
    // Ограничиваем размер истории
    if (this.recentTransactions.length > this.maxHistorySize) {
      this.recentTransactions = this.recentTransactions.slice(-this.maxHistorySize)
    }
  }

  // Обновление существующей транзакции
  private updateTransaction(event: TransactionEvent): void {
    const index = this.recentTransactions.findIndex(tx => tx.signature === event.signature)
    if (index !== -1) {
      this.recentTransactions[index] = event
    } else {
      this.addTransaction(event)
    }
  }

  // Расчет метрик
  private calculateMetrics(): void {
    const now = Date.now()
    const oneMinuteAgo = now - 60 * 1000
    const recentTxs = this.recentTransactions.filter(tx => tx.timestamp > oneMinuteAgo)
    
    // TPS (транзакций в секунду)
    this.metrics.tps = recentTxs.length / 60

    // Время подтверждения (только для подтвержденных транзакций)
    const confirmedTxs = recentTxs.filter(tx => 
      tx.status === 'confirmed' && tx.confirmationTime !== undefined
    )

    if (confirmedTxs.length > 0) {
      const confirmTimes = confirmedTxs
        .map(tx => tx.confirmationTime!)
        .sort((a, b) => a - b)

      // P50 (медиана)
      const p50Index = Math.floor(confirmTimes.length * 0.5)
      this.metrics.confirmTimeP50 = confirmTimes[p50Index] || 0

      // P95
      const p95Index = Math.floor(confirmTimes.length * 0.95)
      this.metrics.confirmTimeP95 = confirmTimes[p95Index] || 0
    }

    // Fail rate
    const failedTxs = recentTxs.filter(tx => tx.status === 'failed')
    this.metrics.failRate = recentTxs.length > 0 ? (failedTxs.length / recentTxs.length) * 100 : 0

    // Аномалии (простая эвристика)
    this.metrics.anomalies = this.detectAnomalies(recentTxs)
  }

  // Детекция аномалий
  private detectAnomalies(transactions: TransactionEvent[]): number {
    let anomalies = 0

    // Аномально долгое время подтверждения (>30 секунд)
    const slowTxs = transactions.filter(tx => 
      tx.confirmationTime && tx.confirmationTime > 30000
    )
    anomalies += slowTxs.length

    // Всплески неудач (>20% fail rate)
    if (this.metrics.failRate > 20) {
      anomalies += Math.floor(this.metrics.failRate / 10)
    }

    // Аномально высокий TPS (>100)
    if (this.metrics.tps > 100) {
      anomalies += 1
    }

    return anomalies
  }

  // Запуск расчета метрик
  private startMetricsCalculation(): void {
    if (this.isRunning) return

    this.isRunning = true
    
    const calculateInterval = setInterval(() => {
      this.calculateMetrics()
      this.emit('metrics:updated', this.metrics)
    }, 10000) // Каждые 10 секунд

    // Очистка при остановке
    this.on('stop', () => {
      clearInterval(calculateInterval)
      this.isRunning = false
    })
  }

  // Получение текущих метрик
  getMetrics(): TransactionMetrics {
    return { ...this.metrics }
  }

  // Получение истории транзакций
  getRecentTransactions(limit: number = 100): TransactionEvent[] {
    return this.recentTransactions.slice(-limit)
  }

  // Получение транзакций по программе
  getTransactionsByProgram(programId: string, limit: number = 100): TransactionEvent[] {
    return this.recentTransactions
      .filter(tx => tx.programId === programId)
      .slice(-limit)
  }

  // Остановка провайдера
  stop(): void {
    this.emit('stop')
    this.removeAllListeners()
    this.subscribedSignatures.clear()
  }
}

// Глобальный провайдер
let globalProvider: TransactionEventProvider | null = null

export function initializeTransactionProvider(connection: Connection): TransactionEventProvider {
  if (globalProvider) {
    globalProvider.stop()
  }
  
  globalProvider = new TransactionEventProvider(connection)
  return globalProvider
}

export function getTransactionProvider(): TransactionEventProvider | null {
  return globalProvider
}

// Хелпер для подписки на транзакцию
export function subscribeToTransaction(signature: string, programId?: string): void {
  if (globalProvider) {
    globalProvider.subscribeToTransaction(signature, programId)
  } else {
    logger.warn('Transaction provider not initialized')
  }
}