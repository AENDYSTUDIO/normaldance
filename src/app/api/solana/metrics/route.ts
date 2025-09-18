import { NextRequest } from 'next/server'
import { Connection } from '@solana/web3.js'
import { getTransactionMonitor } from '@/lib/transaction-monitoring'

// Mock данные для демонстрации (в реальном приложении данные из БД)
const generateMockMetrics = (timeRange: string, program: string) => {
  const now = Date.now()
  const ranges = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000
  }
  
  const timeWindow = ranges[timeRange as keyof typeof ranges] || ranges['24h']
  const startTime = now - timeWindow
  
  // Генерируем транзакции
  const transactionCount = timeRange === '1h' ? 50 : timeRange === '24h' ? 1200 : 8400
  const transactions = []
  
  for (let i = 0; i < transactionCount; i++) {
    const timestamp = startTime + (i / transactionCount) * timeWindow
    const programs = ['donation', 'staking', 'nft-mint', 'token-transfer', 'system']
    const selectedProgram = programs[Math.floor(Math.random() * programs.length)]
    
    // Фильтр по программе
    if (program !== 'all' && selectedProgram !== program) continue
    
    transactions.push({
      signature: `${Math.random().toString(36).substr(2, 88)}`,
      timestamp,
      status: Math.random() > 0.05 ? 'success' : 'failed', // 95% успешность
      program: selectedProgram,
      confirmationTime: Math.random() * 15 + 1, // 1-16 секунд
      amount: Math.random() > 0.7 ? Math.random() * 10 : undefined
    })
  }
  
  // Подсчет статистики
  const successfulTransactions = transactions.filter(tx => tx.status === 'success').length
  const failedTransactions = transactions.length - successfulTransactions
  const averageConfirmationTime = transactions.reduce((sum, tx) => sum + tx.confirmationTime, 0) / transactions.length
  
  // Статистика по программам
  const programStats: { [key: string]: number } = {}
  transactions.forEach(tx => {
    programStats[tx.program] = (programStats[tx.program] || 0) + 1
  })
  
  // Определение здоровья сети
  const successRate = successfulTransactions / transactions.length
  const networkHealth = successRate > 0.98 ? 'healthy' : successRate > 0.95 ? 'degraded' : 'down'
  
  return {
    totalTransactions: transactions.length,
    successfulTransactions,
    failedTransactions,
    averageConfirmationTime,
    programStats,
    recentTransactions: transactions.slice(-100), // Последние 100 транзакций
    networkHealth
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const timeRange = searchParams.get('range') || '24h'
    const program = searchParams.get('program') || 'all'
    
    // В реальном приложении здесь будет запрос к Solana RPC и базе данных
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com')
    
    // Получаем данные из монитора транзакций
    const monitor = getTransactionMonitor()
    let realMetrics = null
    
    if (monitor) {
      // Получаем реальные данные если монитор доступен
      const alerts = monitor.getAllAlerts()
      realMetrics = {
        activeAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length
      }
    }
    
    // Генерируем mock данные для демонстрации
    const metrics = generateMockMetrics(timeRange, program)
    
    // Добавляем реальные данные если доступны
    if (realMetrics) {
      metrics.activeAlerts = realMetrics.activeAlerts
      metrics.criticalAlerts = realMetrics.criticalAlerts
    }
    
    return Response.json(metrics)
    
  } catch (error) {
    console.error('Failed to fetch Solana metrics:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

// Получение детальной информации о транзакции
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { signature } = body
    
    if (!signature) {
      return new Response('Transaction signature required', { status: 400 })
    }
    
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com')
    
    // Получаем информацию о транзакции
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0
    })
    
    if (!transaction) {
      return new Response('Transaction not found', { status: 404 })
    }
    
    // Анализируем транзакцию
    const analysis = {
      signature,
      slot: transaction.slot,
      blockTime: transaction.blockTime,
      fee: transaction.meta?.fee,
      status: transaction.meta?.err ? 'failed' : 'success',
      computeUnitsConsumed: transaction.meta?.computeUnitsConsumed,
      logMessages: transaction.meta?.logMessages?.slice(0, 10), // Первые 10 логов
      accounts: transaction.transaction.message.accountKeys.map(key => key.toString()),
      instructions: transaction.transaction.message.instructions.length,
      innerInstructions: transaction.meta?.innerInstructions?.length || 0
    }
    
    return Response.json(analysis)
    
  } catch (error) {
    console.error('Failed to analyze transaction:', error)
    return new Response('Failed to analyze transaction', { status: 500 })
  }
}