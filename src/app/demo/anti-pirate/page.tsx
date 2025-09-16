'use client'

import { useState } from 'react'
import { AntiPirateSystem } from '@/components/anti-pirate/anti-pirate-system'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Lock,
  Unlock,
  Download,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Headphones,
  Music,
  Clock,
  Coins,
  Crown,
  Star,
  Award,
  Zap,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Gift,
  CreditCard,
  Wallet,
  Key,
  Database,
  Globe,
  Smartphone as Phone,
  Laptop,
  Tablet,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  PieChart,
  ArrowUpDown,
  Activity,
  Timer,
  Layers,
  FileText,
  Gauge,
  RefreshCw
} from 'lucide-react'

export default function AntiPirateDemo() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: BarChart3 },
    { id: 'system', label: 'Система', icon: Shield },
    { id: 'passes', label: 'Пассы', icon: Key },
    { id: 'protection', label: 'Защита', icon: Lock }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🛡️ TIER 1: Anti-Pirate 2.0
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            «Бесплатно» = «в поле зрения». Хочешь фоном – плати 1 сат.
          </p>
          <Badge variant="outline" className="text-green-400 border-green-400">
            Fair Use + NFT-лицензии
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
                      ? 'bg-red-600 text-white'
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
            {/* Free Pool System */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Бесплатный пул = 7 треков / 24 ч</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <Gift className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">7 бесплатных треков</h3>
                    <p className="text-sm text-gray-400">
                      Счётчик привязан к device-ID + wallet address (anon, но уникален)
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-green-900/20 rounded-lg border border-green-500/30">
                    <Eye className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Только в foreground</h3>
                    <p className="text-sm text-gray-400">
                      После 7-го трека воспроизведение продолжается только в открытом приложении
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <AlertTriangle className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Background → pause</h3>
                    <p className="text-sm text-gray-400">
                      Background / lock-screen → instant pause + push: «Хочешь слушать дальше?»
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Implementation */}
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Техническая реализация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-4">События и действия</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Monitor className="h-5 w-5 text-blue-400" />
                        <div>
                          <div className="text-white font-semibold">onPause() / applicationDidEnterBackground()</div>
                          <div className="text-sm text-gray-400">player.stop() + сохранить тайм-код</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Play className="h-5 w-5 text-green-400" />
                        <div>
                          <div className="text-white font-semibold">onResume()</div>
                          <div className="text-sm text-gray-400">player.seekTo(savedTime) + продолжить, если лицензия есть</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Lock className="h-5 w-5 text-red-400" />
                        <div>
                          <div className="text-white font-semibold">screenLock</div>
                          <div className="text-sm text-gray-400">Аналогично onPause</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <WifiOff className="h-5 w-5 text-orange-400" />
                        <div>
                          <div className="text-white font-semibold">Airplane / Wi-Fi off</div>
                          <div className="text-sm text-gray-400">Проверка NFT-офлайн-пасса (хранится локально, подписан контрактом)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-4">Защита от пиратства</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Shield className="h-5 w-5 text-blue-400" />
                        <div>
                          <div className="text-white font-semibold">Медиа-файл</div>
                          <div className="text-sm text-gray-400">Потоковый, зашифрован AES-128, ключ = 5-минутный JWT</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Database className="h-5 w-5 text-green-400" />
                        <div>
                          <div className="text-white font-semibold">Off-line кэш</div>
                          <div className="text-sm text-gray-400">Доступен только внутри приложения, ключ хранится в Secure Hardware</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <EyeOff className="h-5 w-5 text-red-400" />
                        <div>
                          <div className="text-white font-semibold">Скрин-рекордер</div>
                          <div className="text-sm text-gray-400">Черный экран + watermark-ID поверх видео (DRM-level)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Metrics */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Конверсия в цифрах (пилот 3 мес)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-400 mb-1">11%</div>
                    <div className="text-sm text-gray-400">Free→paid конверсия</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <DollarSign className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-400 mb-1">0.34 TON</div>
                    <div className="text-sm text-gray-400">Средний чек</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <Award className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-400 mb-1">+34%</div>
                    <div className="text-sm text-gray-400">Доход артиста</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <Shield className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-400 mb-1">0</div>
                    <div className="text-sm text-gray-400">Пиратские APK</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="h-[800px]">
            <AntiPirateSystem />
          </div>
        )}

        {activeTab === 'passes' && (
          <div className="space-y-8">
            {/* NFT Passes Overview */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Лицензии = NFT-пассы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'Day-Pass',
                      price: '0.1 TON',
                      duration: '24 ч',
                      benefits: ['Фоновое воспроизведение', '1 устройство', '24 часа'],
                      icon: '📅',
                      color: 'text-blue-400'
                    },
                    {
                      name: 'Track-Pass',
                      price: '0.3 TON',
                      duration: '∞',
                      benefits: ['∞ фоновых прослушиваний', 'Конкретный трек', '1 год'],
                      icon: '🎵',
                      color: 'text-green-400'
                    },
                    {
                      name: 'Club-Pass',
                      price: '1 TON / мес',
                      duration: '1 месяц',
                      benefits: ['∞ фоновых прослушиваний', 'Все треки клуба', '1 месяц'],
                      icon: '🏛️',
                      color: 'text-purple-400'
                    },
                    {
                      name: 'Genre-Pass',
                      price: '3 TON / мес',
                      duration: '1 месяц',
                      benefits: ['∞ фоновых прослушиваний', 'Весь жанр', '1 месяц'],
                      icon: '🎧',
                      color: 'text-orange-400'
                    },
                    {
                      name: 'Olympic Pass',
                      price: '10 TON / год',
                      duration: '1 год',
                      benefits: ['∞ фоновых прослушиваний', 'Офлайн-кэш 100 треков', 'Голос x2 в Олимпиаде'],
                      icon: '🏆',
                      color: 'text-yellow-400'
                    }
                  ].map((pass, index) => (
                    <div key={index} className="p-6 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-3xl">{pass.icon}</span>
                        <div>
                          <h3 className="text-white font-semibold">{pass.name}</h3>
                          <p className="text-sm text-gray-400">{pass.price}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {pass.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-gray-400">{benefit}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {pass.duration}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pass Benefits */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Преимущества NFT-пассов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-700/30 rounded-lg">
                    <Wallet className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">Привязан к кошельку</h3>
                    <p className="text-sm text-gray-400">
                      Пасс привязан к кошельку, а не к подписке – можно продать в любой момент
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gray-700/30 rounded-lg">
                    <Award className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">90% артисту</h3>
                    <p className="text-sm text-gray-400">
                      Артист получает 90% от продажи любого пасса автоматически
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gray-700/30 rounded-lg">
                    <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">Защита от пиратства</h3>
                    <p className="text-sm text-gray-400">
                      Пиратство остаётся, но без удобства – значит без смысла
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moral Compromise */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Моральный компромисс</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-700/30 rounded-lg">
                    <Gift className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">7 бесплатных прослушиваний</h3>
                    <p className="text-sm text-gray-400">
                      «Fair use» для знакомства с платформой
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gray-700/30 rounded-lg">
                    <Eye className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">Фоном = плати</h3>
                    <p className="text-sm text-gray-400">
                      Выбор всегда виден и понятен пользователю
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gray-700/30 rounded-lg">
                    <Star className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">90% артисту</h3>
                    <p className="text-sm text-gray-400">
                      Автоматическое распределение доходов
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'protection' && (
          <div className="space-y-8">
            {/* DRM Protection */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">DRM защита</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">AES-128 шифрование</h3>
                    <p className="text-sm text-gray-400">
                      Медиа-файл потоковый, зашифрован AES-128, ключ = 5-минутный JWT
                    </p>
                  </div>
                  <div className="text-center p-6 bg-green-900/20 rounded-lg border border-green-500/30">
                    <Database className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">Secure Hardware</h3>
                    <p className="text-sm text-gray-400">
                      Off-line кэш доступен только внутри приложения, ключ в Secure Hardware
                    </p>
                  </div>
                  <div className="text-center p-6 bg-red-900/20 rounded-lg border border-red-500/30">
                    <EyeOff className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">Watermark защита</h3>
                    <p className="text-sm text-gray-400">
                      Скрин-рекордер → черный экран + watermark-ID поверх видео
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Why Pirates Don't Copy */}
            <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Почему пират не копирует</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-lg">
                    <Shield className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-2">Медиа-файл</h3>
                      <p className="text-sm text-gray-400">
                        Потоковый, зашифрован AES-128, ключ = 5-минутный JWT. Невозможно скачать и воспроизвести вне приложения.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-lg">
                    <Database className="h-8 w-8 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-2">Off-line кэш</h3>
                      <p className="text-sm text-gray-400">
                        Доступен только внутри приложения, ключ хранится в Secure Hardware (Android Keystore / iOS Secure Enclave).
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-lg">
                    <EyeOff className="h-8 w-8 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-2">Скрин-рекордер</h3>
                      <p className="text-sm text-gray-400">
                        Черный экран + watermark-ID поверх видео (DRM-level). Любая попытка записи экрана блокируется.
                      </p>
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
                    <strong>7 треков – gift.</strong><br/>
                    Дальше – только в открытом приложении.<br/>
                    Хочешь фон/офлайн – купи NFT-пасс за копейки.<br/>
                    90% уходит артисту сразу.<br/>
                    Пиратство остаётся, но без удобства – значит без смысла.
                  </p>
                  <footer className="text-gray-400">
                    — TIER 1: Anti-Pirate 2.0 Философия
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
