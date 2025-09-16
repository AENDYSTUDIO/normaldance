'use client'

import { useState } from 'react'
import { DualCurrencySystem } from '@/components/dex/dual-currency-system'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
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
  ArrowUpDown,
  Globe,
  Star,
  Award,
  Gauge,
  Timer,
  Layers,
  Database,
  Key,
  FileText
} from 'lucide-react'

export default function DualCurrencyDemo() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: BarChart3 },
    { id: 'dex', label: 'DEX', icon: ArrowUpDown },
    { id: 'mechanics', label: 'Механика', icon: Settings },
    { id: 'security', label: 'Безопасность', icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            💎 Двойная валютная пара
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Внутри экосистемы только два актива — TON и NDT. Всё остальное = внешний мост.
          </p>
          <Badge variant="outline" className="text-green-400 border-green-400">
            TON + NDT только
          </Badge>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
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
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Currency Overview */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Что такое NDT и TON</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Coins className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-400">NDT</h3>
                        <p className="text-sm text-gray-400">Governance + дефляция</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Эмиссия:</span>
                        <span className="text-white">100 млн</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Сжигание:</span>
                        <span className="text-white">каждый стрим/донат</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Использование:</span>
                        <span className="text-white">Голосования, ускорение релизов</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-green-900/20 rounded-lg border border-green-500/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Globe className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-400">TON</h3>
                        <p className="text-sm text-gray-400">Средство платежа</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Эмиссия:</span>
                        <span className="text-white">∞ (внешняя сеть)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Скорость:</span>
                        <span className="text-white">7 секунд</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Использование:</span>
                        <span className="text-white">Покупка NFT, выплата призов</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DEX Module */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Встроенный DEX-модуль</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <ArrowUpDown className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-2">Пара</h3>
                    <p className="text-sm text-gray-400">NDT / TON</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <Gauge className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-2">Кривая</h3>
                    <p className="text-sm text-gray-400">Constant-product AMM</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <PieChart className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-2">Ликвидность</h3>
                    <p className="text-sm text-gray-400">0.25% комиссия LP</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      1 TON = 42.7 NDT ⟷ 1 NDT = 0.0234 TON
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Купить NDT за TON
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Продать NDT за TON
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Entry/Exit Flow */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Как попасть внутрь и выйти наружу</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white flex items-center">
                      <ArrowRight className="h-5 w-5 mr-2 text-green-400" />
                      Пополнение
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <span className="text-green-400 text-sm">1</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">Внешний TON → кошелёк NormalDance</div>
                          <div className="text-sm text-gray-400">Адрес = ваш username.ton</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <span className="text-green-400 text-sm">2</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">Авто-обмен TON → NDT</div>
                          <div className="text-sm text-gray-400">По рыночному курсу (если включён флаг «auto-stake»)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white flex items-center">
                      <ArrowLeft className="h-5 w-5 mr-2 text-red-400" />
                      Вывод
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                          <span className="text-red-400 text-sm">1</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">NDT → TON</div>
                          <div className="text-sm text-gray-400">Либо держите NDT для голосований</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                          <span className="text-red-400 text-sm">2</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">Вывод TON на любой кошелёк</div>
                          <div className="text-sm text-gray-400">За 7 секунд (Gas ≈ 0.005 TON)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Integration */}
            <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Где нужен обмен внутри платформы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      scenario: 'Голосование',
                      description: 'Авто-обмен TON → NDT, если баланса NDT недостаточно',
                      icon: <Target className="h-6 w-6 text-blue-400" />
                    },
                    {
                      scenario: 'Покупка NFT',
                      description: 'Продавец указывает валюту: TON или NDT. Если другая — автосвоп.',
                      icon: <Star className="h-6 w-6 text-purple-400" />
                    },
                    {
                      scenario: 'Клубный взнос',
                      description: 'Можно платить любой валютой → конвертация 50/50 в пул (LP получает комиссию)',
                      icon: <Award className="h-6 w-6 text-green-400" />
                    },
                    {
                      scenario: 'Призовой дроп',
                      description: 'Выплата в TON (стабильность), но можно выбрать NDT (-2% комиссия)',
                      icon: <Gift className="h-6 w-6 text-yellow-400" />
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{item.scenario}</h3>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'dex' && (
          <div className="h-[800px]">
            <DualCurrencySystem />
          </div>
        )}

        {activeTab === 'mechanics' && (
          <div className="space-y-8">
            {/* Volatility Protection */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Защита от волатильности</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Лимит-ордер в 1 клик</h3>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">Пример:</div>
                      <div className="text-white font-mono">
                        «Обменять 100 TON → NDT когда курс ≥ 45 NDT/TON»
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Страховой стейбл-коффер</h3>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">Механизм:</div>
                      <div className="text-white">
                        5% комиссии свопа идёт в «стаб-резерв», который автоматически выкупает NDT при просадке >15% за сутки.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Speed and Gas */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Газ и скорость</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-900/20 rounded-lg">
                    <Timer className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-2">TON</h3>
                    <div className="text-2xl font-bold text-blue-400 mb-1">7 сек</div>
                    <div className="text-sm text-gray-400">~0.005 TON газа</div>
                  </div>
                  <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                    <Zap className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-2">NDT</h3>
                    <div className="text-2xl font-bold text-purple-400 mb-1">0.4 сек</div>
                    <div className="text-sm text-gray-400">~0.0002 TON эквивалент</div>
                  </div>
                  <div className="text-center p-4 bg-green-900/20 rounded-lg">
                    <ArrowUpDown className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-2">Своп</h3>
                    <div className="text-2xl font-bold text-green-400 mb-1">0.25%</div>
                    <div className="text-sm text-gray-400">+ газ сети (авто-оплачивается)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auto-Swap Scenarios */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Авто-своп сценарии</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      trigger: 'Недостаточно NDT для голосования',
                      action: 'Автоматически обменивает TON → NDT по текущему курсу',
                      icon: <Target className="h-5 w-5 text-blue-400" />
                    },
                    {
                      trigger: 'Покупка NFT в другой валюте',
                      action: 'Автоматически конвертирует валюту перед покупкой',
                      icon: <Star className="h-5 w-5 text-purple-400" />
                    },
                    {
                      trigger: 'Клубный взнос в смешанной валюте',
                      action: 'Распределяет 50/50 между TON и NDT в пуле',
                      icon: <Award className="h-5 w-5 text-green-400" />
                    },
                    {
                      trigger: 'Выбор валюты для призового дропа',
                      action: 'TON (стабильность) или NDT (-2% комиссия)',
                      icon: <Gift className="h-5 w-5 text-yellow-400" />
                    }
                  ].map((scenario, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {scenario.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white mb-1">{scenario.trigger}</div>
                        <div className="text-sm text-gray-400">{scenario.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-8">
            {/* Security Architecture */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Архитектура безопасности</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-900/20 rounded-lg">
                    <Key className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">Ключи</h3>
                    <p className="text-sm text-gray-400">
                      Пользователь держит seed, NormalDance шифрует локально
                    </p>
                  </div>
                  <div className="text-center p-6 bg-green-900/20 rounded-lg">
                    <FileText className="h-8 w-8 text-green-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">Аудит DEX</h3>
                    <p className="text-sm text-gray-400">
                      Open-source контракт, отчёт OtterSec / CertiK в открытом доступе
                    </p>
                  </div>
                  <div className="text-center p-6 bg-purple-900/20 rounded-lg">
                    <Layers className="h-8 w-8 text-purple-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">Ликвидность</h3>
                    <p className="text-sm text-gray-400">
                      Многоподписные кошельки (3-of-5), ключи у независимых провайдеров
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Функции безопасности</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Защита средств</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-green-400" />
                        <span className="text-white">Многоподписные кошельки</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Lock className="h-5 w-5 text-blue-400" />
                        <span className="text-white">Локальное шифрование ключей</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-purple-400" />
                        <span className="text-white">Резервное копирование seed-фраз</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Аудит и прозрачность</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-green-400" />
                        <span className="text-white">Open-source контракты</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-blue-400" />
                        <span className="text-white">Аудит OtterSec/CertiK</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Eye className="h-5 w-5 text-purple-400" />
                        <span className="text-white">Публичные отчёты</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Quote */}
            <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
              <CardContent className="p-8">
                <blockquote className="text-center">
                  <p className="text-xl text-white mb-4">
                    <strong>TON = деньги, NDT = власть + дефляция.</strong><br/>
                    Встроенный своп NDT↔TON за 1 клик, 0.25% комиссия, 7 секунд.<br/>
                    Больше никаких BTC, ETH и прочей суеты — только чистая логика двух монет.
                  </p>
                  <footer className="text-gray-400">
                    — Двойная валютная пара Философия
                  </footer>
                </blockquote>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
