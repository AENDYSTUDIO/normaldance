import { SecureLogger } from '@/lib/security/secure-logger';
'use client'

// Note: This file needs full type refactoring - tracked in GitHub issue #XXX

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '@/components/ui'
import { 
  ArrowUpDown, 
  Coins, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Zap,
  Wallet,
  Clock,
  Target,
  DollarSign,
  BarChart3,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Lock,
  Unlock,
  Activity,
  PieChart,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Music
} from '@/components/icons'
import { cn } from '@/lib/utils'
import { AdvancedDashboard } from './advanced-dashboard'

interface CurrencyPair {
  from: 'TON' | 'NDT'
  to: 'TON' | 'NDT'
  rate: number
  inverseRate: number
  liquidity: number
  volume24h: number
  change24h: number
}

interface LiquidityPool {
  id: string
  tonAmount: number
  ndtAmount: number
  totalLiquidity: number
  apy: number
  fees24h: number
  providers: number
}

interface SwapTransaction {
  id: string
  from: 'TON' | 'NDT'
  to: 'TON' | 'NDT'
  amount: number
  rate: number
  fee: number
  timestamp: number
  status: 'pending' | 'completed' | 'failed'
}

interface LimitOrder {
  id: string
  type: 'buy' | 'sell'
  from: 'TON' | 'NDT'
  to: 'TON' | 'NDT'
  amount: number
  targetRate: number
  status: 'active' | 'filled' | 'cancelled'
  createdAt: number
}

interface DualCurrencySystemProps {
  className?: string
}

export function DualCurrencySystem({ className }: DualCurrencySystemProps) {
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity' | 'orders' | 'analytics' | 'music' | 'advanced'>('swap')
  const [swapDirection, setSwapDirection] = useState<'ton-to-ndt' | 'ndt-to-ton'>('ton-to-ndt')
  const [swapAmount, setSwapAmount] = useState('')
  const [autoStake, setAutoStake] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - в реальном приложении будет загружаться из API
  const currencyPair: CurrencyPair = {
    from: 'TON',
    to: 'NDT',
    rate: 42.7,
    inverseRate: 0.0234,
    liquidity: 1250000,
    volume24h: 45000,
    change24h: 2.3
  }

  const liquidityPool: LiquidityPool = {
    id: 'ton-ndt-pool',
    tonAmount: 25000,
    ndtAmount: 1067500,
    totalLiquidity: 1250000,
    apy: 12.5,
    fees24h: 125,
    providers: 127
  }

  const recentTransactions: SwapTransaction[] = [
    {
      id: '1',
      from: 'TON',
      to: 'NDT',
      amount: 100,
      rate: 42.7,
      fee: 0.25,
      timestamp: Date.now() - 300000,
      status: 'completed'
    },
    {
      id: '2',
      from: 'NDT',
      to: 'TON',
      amount: 5000,
      rate: 0.0234,
      fee: 12.5,
      timestamp: Date.now() - 600000,
      status: 'completed'
    }
  ]

  const limitOrders: LimitOrder[] = [
    {
      id: '1',
      type: 'buy',
      from: 'TON',
      to: 'NDT',
      amount: 1000,
      targetRate: 45,
      status: 'active',
      createdAt: Date.now() - 3600000
    }
  ]

  const handleSwap = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) return

    setIsLoading(true)
    try {
      const amount = parseFloat(swapAmount)
      const rate = swapDirection === 'ton-to-ndt' ? currencyPair.rate : currencyPair.inverseRate
      const fee = amount * 0.0025 // 0.25% fee
      const received = (amount - fee) * rate

      // Здесь будет API вызов для выполнения свопа
      SecureLogger.log('Swapping:', { amount, rate, fee, received, direction: swapDirection })
      
      // Симуляция успешного свопа
      setTimeout(() => {
        setIsLoading(false)
        setSwapAmount('')
      }, 2000)
    } catch (error) {
      SecureLogger.error('Error swapping:', error)
      setIsLoading(false)
    }
  }

  const handleAddLiquidity = async (tonAmount: number, ndtAmount: number) => {
    try {
      // Здесь будет API вызов для добавления ликвидности
      SecureLogger.log('Adding liquidity:', { tonAmount, ndtAmount })
    } catch (error) {
      SecureLogger.error('Error adding liquidity:', error)
    }
  }

  const handleCreateLimitOrder = async (order: Omit<LimitOrder, 'id' | 'createdAt'>) => {
    try {
      // Здесь будет API вызов для создания лимит-ордера
      SecureLogger.log('Creating limit order:', order)
    } catch (error) {
      SecureLogger.error('Error creating limit order:', error)
    }
  }

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: currency === 'TON' ? 2 : 0
    }).format(amount)
  }

  const formatRate = (rate: number): string => {
    return rate.toFixed(4)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          🎵 NormalDance: Музыкальная DeFi платформа
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          TON = деньги, NDT = власть + дефляция. Торгуйте под музыку с NFT треками.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="outline" className="text-green-400 border-green-400">
            TON + NDT только
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-400">
            🎵 NFT треки
          </Badge>
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            🎤 Артисты
          </Badge>
        </div>
      </div>

      {/* Currency Pair Info */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Coins className="h-5 w-5 mr-2" />
            Валютная пара
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {formatRate(currencyPair.rate)}
              </div>
              <div className="text-sm text-gray-400">1 TON = NDT</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {formatRate(currencyPair.inverseRate)}
              </div>
              <div className="text-sm text-gray-400">1 NDT = TON</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {formatCurrency(currencyPair.liquidity, 'USD')}
              </div>
              <div className="text-sm text-gray-400">Ликвидность</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold mb-2 flex items-center justify-center",
                currencyPair.change24h >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {currencyPair.change24h >= 0 ? (
                  <TrendingUp className="h-5 w-5 mr-1" />
                ) : (
                  <TrendingDown className="h-5 w-5 mr-1" />
                )}
                {Math.abs(currencyPair.change24h)}%
              </div>
              <div className="text-sm text-gray-400">24ч изменение</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
          {[
            { id: 'swap', label: 'Своп', icon: ArrowUpDown },
            { id: 'liquidity', label: 'Ликвидность', icon: PieChart },
            { id: 'orders', label: 'Ордера', icon: Target },
            { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
            { id: 'music', label: '🎵 Музыка', icon: Music },
            { id: 'advanced', label: 'Advanced 2025', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'swap' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Swap Interface */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ArrowUpDown className="h-5 w-5 mr-2" />
                Обмен валют
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Swap Direction */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant={swapDirection === 'ton-to-ndt' ? 'default' : 'outline'}
                  onClick={() => setSwapDirection('ton-to-ndt')}
                  className="flex items-center space-x-2"
                >
                  <span className="text-blue-400">TON</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-purple-400">NDT</span>
                </Button>
                <Button
                  variant={swapDirection === 'ndt-to-ton' ? 'default' : 'outline'}
                  onClick={() => setSwapDirection('ndt-to-ton')}
                  className="flex items-center space-x-2"
                >
                  <span className="text-purple-400">NDT</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-blue-400">TON</span>
                </Button>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Сумма {swapDirection === 'ton-to-ndt' ? 'TON' : 'NDT'}
                </label>
                <Input
                  type="number"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-gray-700 border-gray-600 text-white text-lg"
                />
              </div>

              {/* Rate Display */}
              {swapAmount && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Курс обмена</span>
                    <span className="text-white font-semibold">
                      {swapDirection === 'ton-to-ndt' 
                        ? `1 TON = ${formatRate(currencyPair.rate)} NDT`
                        : `1 NDT = ${formatRate(currencyPair.inverseRate)} TON`
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Комиссия (0.25%)</span>
                    <span className="text-yellow-400">
                      {formatCurrency(parseFloat(swapAmount) * 0.0025, 'USD')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Получите</span>
                    <span className="text-green-400 font-bold text-lg">
                      {swapDirection === 'ton-to-ndt' 
                        ? `${formatCurrency((parseFloat(swapAmount) - parseFloat(swapAmount) * 0.0025) * currencyPair.rate, 'NDT')} NDT`
                        : `${formatCurrency((parseFloat(swapAmount) - parseFloat(swapAmount) * 0.0025) * currencyPair.inverseRate, 'TON')} TON`
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Auto Stake Option */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoStake"
                  checked={autoStake}
                  onChange={(e) => setAutoStake(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoStake" className="text-sm text-gray-300">
                  Авто-стейк полученных NDT
                </label>
              </div>

              {/* Swap Button */}
              <Button
                onClick={handleSwap}
                disabled={!swapAmount || parseFloat(swapAmount) <= 0 || isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Обмен...' : 'Обменять'}
              </Button>

              {/* Advanced Options */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdvanced ? 'Скрыть' : 'Показать'} расширенные настройки
              </Button>

              {showAdvanced && (
                <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Slippage tolerance</span>
                    <span className="text-sm text-white">0.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Deadline</span>
                    <span className="text-sm text-white">20 minutes</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Последние обмены
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        tx.status === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                      )}>
                        {tx.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {formatCurrency(tx.amount, tx.from)} {tx.from} → {tx.to}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">
                        {formatRate(tx.rate)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Fee: {formatCurrency(tx.fee, 'USD')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'liquidity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pool Info */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Пул ликвидности
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatCurrency(liquidityPool.tonAmount, 'TON')}
                  </div>
                  <div className="text-sm text-gray-400">TON в пуле</div>
                </div>
                <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {formatCurrency(liquidityPool.ndtAmount, 'NDT')}
                  </div>
                  <div className="text-sm text-gray-400">NDT в пуле</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Общая ликвидность</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(liquidityPool.totalLiquidity, 'USD')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">APY</span>
                  <span className="text-green-400 font-semibold">
                    {liquidityPool.apy}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Комиссии за 24ч</span>
                  <span className="text-blue-400 font-semibold">
                    {formatCurrency(liquidityPool.fees24h, 'USD')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Провайдеры</span>
                  <span className="text-white font-semibold">
                    {liquidityPool.providers}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Liquidity */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Добавить ликвидность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">TON</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">NDT</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-2">Ваша доля в пуле</div>
                <div className="text-lg font-bold text-green-400">0.0%</div>
                <div className="text-xs text-gray-400 mt-1">
                  Получаете 0.25% от каждого свопа
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Добавить ликвидность
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Create Limit Order */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Лимит-ордер
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Тип</label>
                  <select className="w-full p-2 bg-gray-700 border-gray-600 text-white rounded">
                    <option value="buy">Купить NDT за TON</option>
                    <option value="sell">Продать NDT за TON</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Сумма</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Целевой курс</label>
                  <Input
                    type="number"
                    placeholder="45.00"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                <Target className="h-4 w-4 mr-2" />
                Создать ордер
              </Button>
            </CardContent>
          </Card>

          {/* Active Orders */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Активные ордера
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {limitOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        order.status === 'active' ? 'bg-green-500/20' : 'bg-gray-500/20'
                      )}>
                        <Target className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {order.type === 'buy' ? 'Купить' : 'Продать'} {order.amount} {order.from}
                        </div>
                        <div className="text-sm text-gray-400">
                          Целевой курс: {formatRate(order.targetRate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-green-400">
                        {order.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Объём торгов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">
                {formatCurrency(currencyPair.volume24h, 'USD')}
              </div>
              <div className="text-sm text-gray-400">За 24 часа</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Стаб-резерв
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {formatCurrency(12500, 'USD')}
              </div>
              <div className="text-sm text-gray-400">Защита от волатильности</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Скорость
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">TON</span>
                  <span className="text-blue-400">7 сек</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">NDT</span>
                  <span className="text-purple-400">0.4 сек</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Своп</span>
                  <span className="text-green-400">0.25%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Key Features */}
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white text-xl">Ключевые особенности</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Быстро</h3>
              <p className="text-sm text-gray-400">
                TON: 7 сек, NDT: 0.4 сек. Своп за 1 клик без выхода из приложения.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Безопасно</h3>
              <p className="text-sm text-gray-400">
                Open-source контракты, аудит OtterSec/CertiK, многоподписные кошельки.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Просто</h3>
              <p className="text-sm text-gray-400">
                Только TON и NDT. Никаких BTC, ETH и прочей суеты.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for using dual currency system
export function useDualCurrencySystem() {
  const [currencyPair, setCurrencyPair] = useState<CurrencyPair | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const swap = async (from: 'TON' | 'NDT', to: 'TON' | 'NDT', amount: number) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dex/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, amount })
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data.transaction
      }
      return null
    } catch (error) {
      SecureLogger.error('Error swapping:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const addLiquidity = async (tonAmount: number, ndtAmount: number) => {
    try {
      const response = await fetch('/api/dex/liquidity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tonAmount, ndtAmount })
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data.liquidity
      }
      return null
    } catch (error) {
      SecureLogger.error('Error adding liquidity:', error)
      return null
    }
  }

  return {
    currencyPair,
    isLoading,
    swap,
    addLiquidity
  }
}
