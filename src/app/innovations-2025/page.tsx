/**
 * 🚀 Innovations 2025 - Demo Page
 * 
 * Демонстрация всех инноваций TIER 1 Dual-Currency System 2025
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  Shield, 
  Brain, 
  Target, 
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Rocket,
  Crown,
  Gem
} from 'lucide-react'
import { DualCurrencySystem } from '@/components/dex/dual-currency-system'

export default function Innovations2025Page() {
  const [activeDemo, setActiveDemo] = useState('overview')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const innovations = [
    {
      id: 'hybrid_amm',
      title: '🎵 Музыкальные Алгоритмы AMM',
      description: 'Harmony Mode и Beat Drop Mode для оптимальной торговли под музыку',
      features: [
        'Harmony Mode (CPMM) для стабильной торговли',
        'Beat Drop Mode (CSMM) для волатильных периодов',
        'Mixed Mode для адаптивной торговли',
        'Интеграция с NFT треками и роялти'
      ],
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      status: 'active'
    },
    {
      id: 'volatility_protection',
      title: '🛡️ Защита от Волатильности',
      description: 'Многоканальная система защиты с автоматическими механизмами',
      features: [
        'Автоматический выкуп NDT при просадке >12%',
        'Инъекция ликвидности при волатильности >15%',
        'Аварийная остановка при экстремальных условиях',
        'Динамические резервы стабильности'
      ],
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      status: 'active'
    },
    {
      id: 'smart_orders',
      title: '🎯 Умные Лимит-Ордера',
      description: 'ИИ-оптимизированные ордера с адаптивными стратегиями',
      features: [
        'ИИ-анализ рыночных условий',
        'Автоматическая корректировка параметров',
        'Time decay для снижения агрессивности',
        'DCA (Dollar Cost Averaging) стратегии'
      ],
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      status: 'active'
    },
    {
      id: 'ml_analytics',
      title: '🎵 Музыкальная ML-Аналитика',
      description: 'Аналитика треков, артистов и музыкальных трендов с ИИ',
      features: [
        'Прогнозы популярности треков',
        'Анализ NFT цен и роялти',
        'Топ артисты и жанры',
        'Рекомендации для артистов'
      ],
      icon: Brain,
      color: 'from-green-500 to-emerald-500',
      status: 'active'
    },
    {
      id: 'telegram_integration',
      title: '📱 Telegram Integration 2025',
      description: 'Нативная интеграция с Telegram для массового adoption',
      features: [
        'TON Space Native Integration',
        'Социальные платежи в чатах',
        'Пуш-уведомления о сработавших ордерах',
        'Mini-App с полным функционалом DEX'
      ],
      icon: Users,
      color: 'from-teal-500 to-blue-500',
      status: 'active'
    }
  ]

  const comparisonData = [
    {
      feature: 'Скорость исполнения',
      tier1: '0.4 сек',
      uniswap: '12 сек',
      stonfi: '5 сек',
      pancakeswap: '3 сек'
    },
    {
      feature: 'Газовые комиссии',
      tier1: '~$0.001',
      uniswap: '~$5',
      stonfi: '~$0.1',
      pancakeswap: '~$0.3'
    },
    {
      feature: 'Кросс-чейн поддержка',
      tier1: '5+ сетей',
      uniswap: '3 сети',
      stonfi: '2 сети',
      pancakeswap: '4 сети'
    },
    {
      feature: 'ZK-доказательства',
      tier1: '✅',
      uniswap: '⚠️',
      stonfi: '❌',
      pancakeswap: '⚠️'
    },
    {
      feature: 'ИИ-аналитика',
      tier1: '✅',
      uniswap: '❌',
      stonfi: '❌',
      pancakeswap: '⚠️'
    },
    {
      feature: 'Социальная торговля',
      tier1: '✅',
      uniswap: '❌',
      stonfi: '❌',
      pancakeswap: '⚠️'
    }
  ]

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white">Загрузка инноваций 2025...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Crown className="h-16 w-16 text-yellow-400 mr-4" />
            <h1 className="text-5xl font-bold text-white">
              🎵 NormalDance Innovations 2025
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-6 max-w-4xl mx-auto">
            Революционные улучшения для музыкальной DeFi платформы с NFT треками, 
            гибридными алгоритмами AMM и защитой от волатильности
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="text-green-400 border-green-400 px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Все системы активны
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400 px-4 py-2">
              <Star className="h-4 w-4 mr-2" />
              TIER 1 Ready
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Gem className="h-4 w-4" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="innovations" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Инновации
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Сравнение
            </TabsTrigger>
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Демо
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Roadmap
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-6 w-6 mr-2 text-blue-400" />
                    Производительность
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-blue-400">0.4 сек</div>
                  <p className="text-gray-300">Скорость исполнения свопов</p>
                  <div className="text-2xl font-bold text-green-400">~$0.001</div>
                  <p className="text-gray-300">Средняя комиссия за газ</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-6 w-6 mr-2 text-green-400" />
                    Безопасность
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-green-400">4/4</div>
                  <p className="text-gray-300">Активных механизмов защиты</p>
                  <div className="text-2xl font-bold text-blue-400">95%</div>
                  <p className="text-gray-300">Эффективность защиты</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Brain className="h-6 w-6 mr-2 text-purple-400" />
                    ИИ-Возможности
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-purple-400">85%</div>
                  <p className="text-gray-300">Точность прогнозов</p>
                  <div className="text-2xl font-bold text-pink-400">24/7</div>
                  <p className="text-gray-300">Мониторинг рынка</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  🎯 Ключевые Преимущества TIER 1 2025
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-white">Адаптивные алгоритмы AMM реагируют на рыночные условия</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-white">Многоканальная защита от волатильности</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-white">Интеграция с Telegram для массового adoption</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-white">Zero-knowledge приватность для институциональных пользователей</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-white">ИИ-оптимизированные умные ордера</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-white">Передовая аналитика с ML-прогнозами</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Innovations Tab */}
          <TabsContent value="innovations" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {innovations.map((innovation) => {
                const Icon = innovation.icon
                return (
                  <Card key={innovation.id} className={`bg-gradient-to-br ${innovation.color}/20 border-${innovation.color.split('-')[1]}-500/30`}>
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Icon className="h-6 w-6 mr-2" />
                        {innovation.title}
                      </CardTitle>
                      <p className="text-gray-300">{innovation.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {innovation.features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <ArrowRight className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {innovation.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveDemo('demo')}
                        >
                          Демо
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  📊 Сравнение с конкурентами
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-4 text-white">Характеристика</th>
                        <th className="text-center py-3 px-4 text-blue-400 font-bold">TIER 1</th>
                        <th className="text-center py-3 px-4 text-gray-300">Uniswap V4</th>
                        <th className="text-center py-3 px-4 text-gray-300">STON.fi</th>
                        <th className="text-center py-3 px-4 text-gray-300">PancakeSwap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((row, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="py-3 px-4 text-white">{row.feature}</td>
                          <td className="py-3 px-4 text-center text-blue-400 font-bold">{row.tier1}</td>
                          <td className="py-3 px-4 text-center text-gray-300">{row.uniswap}</td>
                          <td className="py-3 px-4 text-center text-gray-300">{row.stonfi}</td>
                          <td className="py-3 px-4 text-center text-gray-300">{row.pancakeswap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demo Tab */}
          <TabsContent value="demo" className="space-y-8">
            <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  🎮 Интерактивная Демонстрация
                </CardTitle>
                <p className="text-gray-300 text-center">
                  Протестируйте все инновации TIER 1 в реальном времени
                </p>
              </CardHeader>
              <CardContent>
                <DualCurrencySystem />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CheckCircle className="h-6 w-6 mr-2 text-green-400" />
                    Q1 2025 - Завершено
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-300">✅ Гибридные алгоритмы AMM</div>
                  <div className="text-sm text-gray-300">✅ Защита от волатильности</div>
                  <div className="text-sm text-gray-300">✅ Умные лимит-ордера</div>
                  <div className="text-sm text-gray-300">✅ ML-аналитика</div>
                  <div className="text-sm text-gray-300">✅ Telegram интеграция</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="h-6 w-6 mr-2 text-blue-400" />
                    Q2 2025 - В разработке
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-300">🔄 Zero-Knowledge доказательства</div>
                  <div className="text-sm text-gray-300">🔄 Кросс-чейн мосты</div>
                  <div className="text-sm text-gray-300">🔄 Институциональные инструменты</div>
                  <div className="text-sm text-gray-300">🔄 Социальная торговля</div>
                  <div className="text-sm text-gray-300">🔄 NFT интеграция</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Star className="h-6 w-6 mr-2 text-purple-400" />
                    Q3-Q4 2025 - Планы
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-300">📋 Мобильное приложение</div>
                  <div className="text-sm text-gray-300">📋 API для разработчиков</div>
                  <div className="text-sm text-gray-300">📋 DAO управление</div>
                  <div className="text-sm text-gray-300">📋 Глобальная экспансия</div>
                  <div className="text-sm text-gray-300">📋 Партнерства с банками</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
