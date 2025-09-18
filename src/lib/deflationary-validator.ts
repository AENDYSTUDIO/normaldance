import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { logger } from './logger'

// Дефляционная модель NDT токена
export interface DeflationaryConfig {
  burnRate: number // % от транзакции
  maxSupply: number
  currentSupply: number
  burnAddress: string
  exemptAddresses: string[] // Адреса без комиссии
}

const NDT_CONFIG: DeflationaryConfig = {
  burnRate: 0.02, // 2% burn
  maxSupply: 1000000000, // 1B NDT
  currentSupply: 500000000, // 500M NDT
  burnAddress: '11111111111111111111111111111112', // System burn address
  exemptAddresses: [
    'StakeProgram11111111111111111111111111111', // Staking program
    'DonateProgram1111111111111111111111111111' // Donation program
  ]
}

export class DeflationaryValidator {
  private config: DeflationaryConfig
  private connection: Connection

  constructor(connection: Connection, config: DeflationaryConfig = NDT_CONFIG) {
    this.connection = connection
    this.config = config
  }

  // Валидация дефляционной логики в транзакции
  async validateTransaction(transaction: Transaction, amount: number, recipient: string): Promise<{
    valid: boolean
    burnAmount: number
    netAmount: number
    issues: string[]
  }> {
    const issues: string[] = []
    
    // Проверяем исключения
    const isExempt = this.config.exemptAddresses.includes(recipient)
    const burnAmount = isExempt ? 0 : amount * this.config.burnRate
    const netAmount = amount - burnAmount

    // Проверка максимального предложения
    if (this.config.currentSupply + amount > this.config.maxSupply) {
      issues.push(`Превышен максимальный supply: ${this.config.currentSupply + amount} > ${this.config.maxSupply}`)
    }

    // Проверка наличия burn инструкции
    if (burnAmount > 0) {
      const hasBurnInstruction = this.checkBurnInstruction(transaction, burnAmount)
      if (!hasBurnInstruction) {
        issues.push(`Отсутствует burn инструкция для ${burnAmount} NDT`)
      }
    }

    // Проверка корректности сумм
    const totalInstructions = this.analyzeTotalAmounts(transaction)
    if (totalInstructions.transferAmount !== netAmount) {
      issues.push(`Некорректная сумма перевода: ${totalInstructions.transferAmount} != ${netAmount}`)
    }

    logger.info('Deflationary validation', {
      amount,
      burnAmount,
      netAmount,
      recipient,
      isExempt,
      issues: issues.length
    })

    return {
      valid: issues.length === 0,
      burnAmount,
      netAmount,
      issues
    }
  }

  // Проверка наличия burn инструкции
  private checkBurnInstruction(transaction: Transaction, expectedBurnAmount: number): boolean {
    for (const instruction of transaction.instructions) {
      // Проверяем инструкции на burn address
      const accounts = instruction.keys.map(k => k.pubkey.toString())
      if (accounts.includes(this.config.burnAddress)) {
        // Простая проверка - в реальности нужен парсинг instruction data
        return true
      }
    }
    return false
  }

  // Анализ общих сумм в транзакции
  private analyzeTotalAmounts(transaction: Transaction): {
    transferAmount: number
    burnAmount: number
    totalAmount: number
  } {
    // Упрощенный анализ - в реальности нужен парсинг instruction data
    let transferAmount = 0
    let burnAmount = 0

    for (const instruction of transaction.instructions) {
      // Здесь должна быть логика парсинга instruction data
      // Пока возвращаем заглушку
    }

    return {
      transferAmount,
      burnAmount,
      totalAmount: transferAmount + burnAmount
    }
  }

  // Обновление текущего supply
  async updateCurrentSupply(): Promise<void> {
    try {
      // В реальности запрос к Solana для получения актуального supply
      const tokenSupply = await this.connection.getTokenSupply(new PublicKey('NDT_TOKEN_MINT'))
      if (tokenSupply.value) {
        this.config.currentSupply = parseInt(tokenSupply.value.amount)
        logger.info('Updated NDT supply', { supply: this.config.currentSupply })
      }
    } catch (error) {
      logger.error('Failed to update NDT supply', { error })
    }
  }

  // Получение статистики дефляции
  getDeflationStats(): {
    burnRate: number
    totalBurned: number
    remainingSupply: number
    deflationRatio: number
  } {
    const totalBurned = this.config.maxSupply - this.config.currentSupply
    const deflationRatio = totalBurned / this.config.maxSupply

    return {
      burnRate: this.config.burnRate,
      totalBurned,
      remainingSupply: this.config.currentSupply,
      deflationRatio
    }
  }

  // Расчет burn для суммы
  calculateBurn(amount: number, recipient: string): number {
    const isExempt = this.config.exemptAddresses.includes(recipient)
    return isExempt ? 0 : amount * this.config.burnRate
  }
}

// Глобальный валидатор
let globalValidator: DeflationaryValidator | null = null

export function initializeDeflationaryValidator(connection: Connection): DeflationaryValidator {
  globalValidator = new DeflationaryValidator(connection)
  return globalValidator
}

export function getDeflationaryValidator(): DeflationaryValidator | null {
  return globalValidator
}