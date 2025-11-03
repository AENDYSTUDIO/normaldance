import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 📊 Advanced Analytics Dashboard 2025
 * 
 * Современный dashboard с реальным временем,
 * ML-прогнозами и интерактивными графиками
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger, Progress } from '@/components/ui'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Shield, 
  Zap, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from '@/components/icons'

interface DashboardData {
  market: Record<string, unknown>
  liquidity: Record<string, unknown>
  trading: Record<string, unknown>
  risk: Record<string, unknown>
  predictions: Record<string, unknown>
  arbitrage: Record<string, unknown>[]
  recommendations: string[]
  timestamp: number
}

export function AdvancedDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000) // Обновляем каждые 30 секунд
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard')
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      SecureLogger.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'TON'): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency === 'TON' ? 'USD' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (value: number): string => {
    if (value > 0) return 'text-green-500'
    if (value < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  const getRiskLevel = (value: number): { level: string, color: string } => {
    if (value < 5) return { level: 'Низкий', color: 'bg-green-500' }
    if (value < 15) return { level: 'Средний', color: 'bg-yellow-500' }
    if (value < 25) return { level: 'Высокий', color: 'bg-orange-500' }
    return { level: 'Критический', color: 'bg-red-500' }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Ошибка загрузки данных</h3>
        <p className="text-gray-600 mb-4">Не удалось загрузить данные dashboard</p>
        <Button onClick={fetchDashboardData}>Повторить попытку</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Advanced Analytics Dashboard</h1>
          <p className="text-gray-600">Реальное время • ML-прогнозы • Защита от волатильности</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={autoRefresh ? "default" : "secondary"}>
            {autoRefresh ? "🔄 Авто-обновление" : "⏸️ Пауза"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Пауза" : "Запуск"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Цена NDT</p>
                <p className="text-2xl font-bold">{data.market?.currentPrice?.toFixed(4)} TON</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(data.market?.priceChange24h || 0)}
                  <span className={`text-sm ml-1 ${getTrendColor(data.market?.priceChange24h || 0)}`}>
                    {formatPercentage(data.market?.priceChange24h || 0)}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Объем 24ч</p>
                <p className="text-2xl font-bold">{formatCurrency(data.market?.volume24h || 0)}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(data.market?.volumeChange24h || 0)}
                  <span className={`text-sm ml-1 ${getTrendColor(data.market?.volumeChange24h || 0)}`}>
                    {formatPercentage(data.market?.volumeChange24h || 0)}
                  </span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ликвидность</p>
                <p className="text-2xl font-bold">{formatCurrency(data.liquidity?.totalLiquidity || 0)}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(data.liquidity?.liquidityChange24h || 0)}
                  <span className={`text-sm ml-1 ${getTrendColor(data.liquidity?.liquidityChange24h || 0)}`}>
                    {formatPercentage(data.liquidity?.liquidityChange24h || 0)}
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Волатильность</p>
                <p className="text-2xl font-bold">{data.market?.volatility?.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm ml-1 text-gray-600">
                    Прогноз: {data.market?.volatilityForecast?.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">📊 Обзор</TabsTrigger>
          <TabsTrigger value="liquidity">💧 Ликвидность</TabsTrigger>
          <TabsTrigger value="trading">📈 Торговля</TabsTrigger>
          <TabsTrigger value="predictions">🔮 Прогнозы</TabsTrigger>
          <TabsTrigger value="protection">🛡️ Защита</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Рыночный обзор
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Рыночная капитализация</span>
                  <span className="font-semibold">{formatCurrency(data.market?.marketCap || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Доминирование</span>
                  <span className="font-semibold">{(data.market?.dominance * 100)?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Изменение за 7 дней</span>
                  <div className="flex items-center">
                    {getTrendIcon(data.market?.priceChange7d || 0)}
                    <span className={`ml-1 ${getTrendColor(data.market?.priceChange7d || 0)}`}>
                      {formatPercentage(data.market?.priceChange7d || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Метрики риска
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">VaR 95%</span>
                  <span className="font-semibold">{data.risk?.var95?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Макс. просадка</span>
                  <span className="font-semibold text-red-500">{data.risk?.maxDrawdown?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Коэффициент Шарпа</span>
                  <span className="font-semibold">{data.risk?.sharpeRatio?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Бета</span>
                  <span className="font-semibold">{data.risk?.beta?.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  ИИ-рекомендации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Liquidity Tab */}
        <TabsContent value="liquidity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>💧 Анализ ликвидности</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Провайдеры ликвидности</span>
                  <span className="font-semibold">{data.liquidity?.liquidityProviders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Средний размер позиции</span>
                  <span className="font-semibold">{formatCurrency(data.liquidity?.averagePositionSize || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Impermanent Loss</span>
                  <span className={`font-semibold ${(data.liquidity?.impermanentLoss || 0) > 5 ? 'text-red-500' : 'text-green-500'}`}>
                    {(data.liquidity?.impermanentLoss || 0).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Риск концентрации</span>
                  <span className="font-semibold">{(data.liquidity?.concentrationRisk || 0).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 Стратегии доходности</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.liquidity?.yieldOptimization?.map((strategy: Record<string, unknown>, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{strategy.name}</p>
                        <p className="text-sm text-gray-600">{strategy.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-500">{strategy.apy.toFixed(1)}% APY</p>
                        <Badge variant={strategy.risk === 'low' ? 'default' : strategy.risk === 'medium' ? 'secondary' : 'destructive'}>
                          {strategy.risk === 'low' ? 'Низкий риск' : strategy.risk === 'medium' ? 'Средний риск' : 'Высокий риск'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📈 Торговая статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Общий объем</span>
                  <span className="font-semibold">{formatCurrency(data.trading?.totalVolume || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Количество сделок</span>
                  <span className="font-semibold">{data.trading?.totalTrades?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Средний размер сделки</span>
                  <span className="font-semibold">{formatCurrency(data.trading?.averageTradeSize || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Успешность</span>
                  <span className="font-semibold text-green-500">{(data.trading?.successRate || 0).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Среднее проскальзывание</span>
                  <span className="font-semibold">{(data.trading?.averageSlippage || 0).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Эффективность газа</span>
                  <span className="font-semibold text-green-500">{(data.trading?.gasEfficiency || 0).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🏆 Топ-трейдеры</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.trading?.topTraders?.slice(0, 5).map((trader: Record<string, unknown>, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{trader.address}</p>
                          <p className="text-xs text-gray-600">{trader.trades} сделок</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(trader.volume)}</p>
                        <p className={`text-sm ${trader.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {trader.profit >= 0 ? '+' : ''}{formatCurrency(trader.profit)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(data.predictions || {}).map(([timeframe, prediction]: [string, any]) => (
              <Card key={timeframe}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Прогноз на {timeframe}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{prediction.price?.toFixed(4)} TON</p>
                    <p className="text-sm text-gray-600">Прогнозируемая цена</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Уверенность</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={prediction.confidence} className="w-20" />
                      <span className="text-sm font-semibold">{prediction.confidence?.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Точность</span>
                    <span className="font-semibold text-green-500">{prediction.accuracy?.toFixed(0)}%</span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Факторы влияния:</p>
                    {prediction.factors?.map((factor: Record<string, unknown>, index: number) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span>{factor.name}</span>
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-1 rounded ${
                            factor.impact === 'positive' ? 'bg-green-100 text-green-800' :
                            factor.impact === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {factor.impact === 'positive' ? '↑' : factor.impact === 'negative' ? '↓' : '→'}
                          </span>
                          <span>{(factor.weight * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Protection Tab */}
        <TabsContent value="protection" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Арбитражные возможности
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.arbitrage?.slice(0, 5).map((arb: Record<string, unknown>, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{arb.source} → {arb.target}</p>
                        <p className="text-sm text-gray-600">Объем: {formatCurrency(arb.volume)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-500">+{formatCurrency(arb.netProfit)}</p>
                        <Badge variant={arb.risk === 'low' ? 'default' : arb.risk === 'medium' ? 'secondary' : 'destructive'}>
                          {arb.risk === 'low' ? 'Низкий риск' : arb.risk === 'medium' ? 'Средний риск' : 'Высокий риск'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Статус защиты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Статус мониторинга</span>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Активен
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Последнее обновление</span>
                  <span className="text-sm font-semibold">
                    {new Date(data.timestamp).toLocaleTimeString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Уровень защиты</span>
                  <Badge variant="default" className="bg-blue-500">
                    Максимальный
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Активных механизмов</span>
                  <span className="font-semibold">4/4</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
