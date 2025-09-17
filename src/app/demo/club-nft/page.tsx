'use client'

import { useState } from 'react'
import { ClubNFTSystem } from '@/components/clubs/club-nft-system'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { 
  Trophy, 
  Medal, 
  Crown, 
  Users, 
  Star,
  Zap,
  Target,
  TrendingUp,
  Award,
  Shield,
  Flame,
  Sparkles,
  Gift,
  Coins,
  Wallet,
  UserPlus,
  Settings,
  BarChart3,
  Calendar,
  MapPin,
  Globe,
  Music,
  Play,
  Share
} from '@/components/icons'

export default function ClubNFTDemo() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: BarChart3 },
    { id: 'clubs', label: 'Клубы', icon: Users },
    { id: 'mechanics', label: 'Механика', icon: Settings },
    { id: 'benefits', label: 'Преимущества', icon: Trophy }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏛️ Клуб-арист Система
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Лейблы = Спортивные клубы. NFT-членство, прозрачная экономика, децентрализованное управление.
          </p>
          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
            Демо версия
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
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                    NFT-Членство
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Club-NFT как единый пропуск в клуб. Покупаешь NFT → автоматически входишь в клубный пул.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-400">Мастер-записи остаются у артиста</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Пул делится только прибылью</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-green-400" />
                    Клубные Бонусы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Членство в клубе даёт реальные преимущества в соревнованиях и доходах.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-400">+15% к голосам зрителей</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gift className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-400">+5% от клубного призового пула</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-purple-400" />
                    Репутация Клуба
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    CRT (Club Reputation Token) растёт с каждой медалью и влияет на все аспекты клуба.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-400">Скидки на вход для новых участников</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-400">Доступ к спонсорским фондам</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How It Works */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Как это работает</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">1. Покупка Club-NFT</h3>
                    <p className="text-sm text-gray-400">
                      Артист покупает Club-NFT за T1 токены и автоматически входит в клубный пул
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">2. Получение Бонусов</h3>
                    <p className="text-sm text-gray-400">
                      +15% к голосам, +5% от призового пула, доступ к клубным турнирам
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">3. Участие в Соревнованиях</h3>
                    <p className="text-sm text-gray-400">
                      Олимпиады, Евровидение, клубные турниры с призовыми пулами
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="h-8 w-8 text-yellow-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">4. Распределение Призов</h3>
                    <p className="text-sm text-gray-400">
                      20% призов идёт обратно в клуб, 70% активным участникам, 10% сжигается
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'clubs' && (
          <ClubNFTSystem />
        )}

        {activeTab === 'mechanics' && (
          <div className="space-y-8">
            {/* Smart Contract Logic */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Логика «Клуб-арист» (Smart Contract)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900/50 rounded-lg p-6 font-mono text-sm">
                  <div className="text-green-400 mb-4">// Smart Contract Logic</div>
                  <div className="space-y-2 text-gray-300">
                    <div><span className="text-blue-400">if</span> Club-NFT.balanceOf(artist) &gt; 0:</div>
                    <div className="ml-4">artist.club_boost = +15% к голосам зрителей</div>
                    <div className="ml-4">artist.club_royalty = +5% от клубного призового пула</div>
                    <div className="ml-4">artist.obligation = 20% призов → клубный пул</div>
                    <div className="mt-4 text-yellow-400">// Без NFT – участвует как «независимый»</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prize Pool Distribution */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Распределение Призового Пула</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-4">Источники пула:</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">20% от призов артистов</span>
                        <Badge variant="outline" className="text-blue-400">Автоматически</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">50% от вторичных продаж NFT</span>
                        <Badge variant="outline" className="text-green-400">При продаже</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">30% от стриминговой комиссии</span>
                        <Badge variant="outline" className="text-purple-400">Еженедельно</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-4">Распределение:</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">70% активным артистам</span>
                        <Badge variant="outline" className="text-green-400">Пропорционально</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">20% клубу</span>
                        <Badge variant="outline" className="text-blue-400">Организаторы</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">10% сжигается</span>
                        <Badge variant="outline" className="text-red-400">Дефляция T1</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Club Reputation System */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Система Репутации Клуба (CRT)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-yellow-900/20 rounded-lg">
                    <Medal className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-yellow-400">🥇 Золото</div>
                    <div className="text-sm text-gray-400">+500 CRT</div>
                  </div>
                  <div className="text-center p-4 bg-gray-600/20 rounded-lg">
                    <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-400">🥈 Серебро</div>
                    <div className="text-sm text-gray-400">+300 CRT</div>
                  </div>
                  <div className="text-center p-4 bg-orange-900/20 rounded-lg">
                    <Medal className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-orange-400">🥉 Бронза</div>
                    <div className="text-sm text-gray-400">+150 CRT</div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-white">CRT влияет на:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-gray-300">Стартовый буст новым артистам</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4 text-green-400" />
                      <span className="text-gray-300">Скидку на чеканку Club-NFT</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-300">Доступ к спонсорским фондам</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300">Приоритет в турнирах</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="space-y-8">
            {/* Benefits for Artists */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Преимущества для Артистов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Финансовые преимущества:</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">+15% к голосам в соревнованиях</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Gift className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300">+5% от клубного призового пула</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-purple-400" />
                        <span className="text-gray-300">Доступ к клубным турнирам</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-300">Спонсорские фонды</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Социальные преимущества:</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">Сообщество единомышленников</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300">Повышение репутации</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span className="text-gray-300">Защита прав на музыку</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-300">Глобальная аудитория</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits for Labels */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Преимущества для Лейблов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Экономические преимущества:</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">Нет капитало-ёмких авансов</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300">Прозрачная бухгалтерия на-chain</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                        <span className="text-gray-300">Деньги только после побед</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-300">Глобальный аудиторий</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Операционные преимущества:</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">A&R как «тренер» сборной</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300">Геймификация процесса</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-400" />
                        <span className="text-gray-300">Фокус на результатах</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-300">Автоматизация процессов</span>
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
                    «Артист свободен. Клуб – это просто <strong>спортивный стейкинг-пул</strong>. 
                    Чем больше медалей приносит команда – тем выше коэффициент клуба, 
                    тем выгоднее оставаться внутри, но в любой момент можно выйти – 
                    <strong> просто продать Club-NFT.</strong>»
                  </p>
                  <footer className="text-gray-400">
                    — Клуб-арист Философия
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
