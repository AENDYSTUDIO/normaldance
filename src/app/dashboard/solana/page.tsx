'use client'

import { useState, useEffect } from 'react'

interface SolanaMetrics {
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  averageConfirmationTime: number
  programStats: { [program: string]: number }
  recentTransactions: TransactionData[]
  networkHealth: 'healthy' | 'degraded' | 'down'
}

interface TransactionData {
  signature: string
  timestamp: number
  status: 'success' | 'failed'
  program: string
  confirmationTime: number
  amount?: number
}

export default function SolanaDashboard() {
  const [metrics, setMetrics] = useState<SolanaMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [selectedProgram, setSelectedProgram] = useState<string>('all')

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [timeRange, selectedProgram])

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/solana/metrics?range=${timeRange}&program=${selectedProgram}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Failed to fetch Solana metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-6">
                <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">⚠️ Ошибка загрузки данных</div>
          <button 
            onClick={fetchMetrics}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Повторить
          </button>
        </div>
      </div>
    )
  }

  const successRate = metrics.totalTransactions > 0 
    ? (metrics.successfulTransactions / metrics.totalTransactions * 100).toFixed(1)
    : '0'

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Solana Dashboard</h1>
        <div className="flex gap-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          >
            <option value="1h">Последний час</option>
            <option value="24h">Последние 24 часа</option>
            <option value="7d">Последние 7 дней</option>
          </select>
          
          <select 
            value={selectedProgram} 
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          >
            <option value="all">Все программы</option>
            {Object.keys(metrics.programStats).map(program => (
              <option key={program} value={program}>{program}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
          metrics.networkHealth === 'healthy' ? 'bg-green-900 text-green-300' :
          metrics.networkHealth === 'degraded' ? 'bg-yellow-900 text-yellow-300' :
          'bg-red-900 text-red-300'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            metrics.networkHealth === 'healthy' ? 'bg-green-400' :
            metrics.networkHealth === 'degraded' ? 'bg-yellow-400' :
            'bg-red-400'
          }`}></div>
          Сеть: {
            metrics.networkHealth === 'healthy' ? 'Здорова' :
            metrics.networkHealth === 'degraded' ? 'Деградирована' :
            'Недоступна'
          }
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Всего транзакций" value={metrics.totalTransactions.toLocaleString()} icon="📊" />
        <MetricCard title="Успешность" value={`${successRate}%`} icon="✅" color={parseFloat(successRate) > 95 ? 'green' : 'yellow'} />
        <MetricCard title="Время подтверждения" value={`${metrics.averageConfirmationTime.toFixed(1)}с`} icon="⏱️" />
        <MetricCard title="Неудачные TX" value={metrics.failedTransactions.toLocaleString()} icon="❌" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Успешность транзакций</h3>
          <div className="h-64 flex items-end justify-between">
            {metrics.recentTransactions.slice(-24).map((tx, index) => {
              const height = tx.status === 'success' ? 100 : 20
              return (
                <div
                  key={index}
                  className={`w-2 ${tx.status === 'success' ? 'bg-green-500' : 'bg-red-500'} rounded-t`}
                  style={{ height: `${height}%` }}
                  title={`${new Date(tx.timestamp).toLocaleTimeString()}: ${tx.status}`}
                ></div>
              )
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Время подтверждения</h3>
          <div className="h-64 flex items-end justify-between">
            {metrics.recentTransactions.slice(-24).map((tx, index) => {
              const height = Math.min((tx.confirmationTime / 20) * 100, 100)
              return (
                <div
                  key={index}
                  className={`w-2 rounded-t ${
                    tx.confirmationTime < 5 ? 'bg-green-500' :
                    tx.confirmationTime < 10 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${new Date(tx.timestamp).toLocaleTimeString()}: ${tx.confirmationTime.toFixed(1)}s`}
                ></div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Статистика по программам</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(metrics.programStats).map(([program, count]) => (
            <div key={program} className="bg-gray-700 rounded p-4">
              <div className="text-sm text-gray-400">{program}</div>
              <div className="text-2xl font-bold">{count.toLocaleString()}</div>
              <div className="text-xs text-gray-500">
                {((count / metrics.totalTransactions) * 100).toFixed(1)}% от общего
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, color = 'blue' }: { 
  title: string; value: string; icon: string; color?: 'blue' | 'green' | 'yellow' | 'red'
}) {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-400',
    green: 'border-green-500 text-green-400', 
    yellow: 'border-yellow-500 text-yellow-400',
    red: 'border-red-500 text-red-400'
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}