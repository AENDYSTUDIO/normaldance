'use client'

import { useState } from 'react'
import { ChatMatrix } from '@/components/chat/chat-matrix'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  Users, 
  Globe, 
  Music, 
  Crown,
  Shield,
  Star,
  Zap,
  Vote,
  Send,
  MoreHorizontal,
  Flag,
  Trophy,
  Coins,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share,
  Pin,
  Hash,
  AtSign,
  Bot,
  TrendingUp,
  Target,
  Gift,
  Wallet,
  BarChart3,
  Settings,
  Award,
  Clock,
  DollarSign
} from 'lucide-react'

export default function ChatMatrixDemo() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: BarChart3 },
    { id: 'chat', label: 'Чат', icon: MessageCircle },
    { id: 'mechanics', label: 'Механика', icon: Settings },
    { id: 'roles', label: 'Роли', icon: Crown }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏁 Чат-матрица
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Каждый пользователь одновременно находится в трёх пересекающихся чатах – жанровом, клубном и страновом.
          </p>
          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
            DAO-управление в чатах
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
            {/* Chat Matrix Structure */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Структура чат-матрицы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <Music className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">ЖАНР</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>🎵 POP</div>
                      <div>🎧 BASS</div>
                      <div>🎼 ROOTS</div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                      Обсуждение жанров, треков, стилей
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-green-900/20 rounded-lg border border-green-500/30">
                    <Crown className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">КЛУБ</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>🏛️ Club-NFT #17</div>
                      <div>🏛️ Club-NFT #05</div>
                      <div>❌ не в клубе</div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                      Клубные обсуждения, турниры, финансы
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <Globe className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">СТРАНА</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>🇧🇷 Brazil</div>
                      <div>🇰🇷 Korea</div>
                      <div>🇦🇷 Argentina</div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                      Национальные команды, соревнования
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Vote className="h-5 w-5 mr-2 text-blue-400" />
                    On-Chain Голосования
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Голосования прямо в чате с мгновенным исполнением через смарт-контракты.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-400">/vote boost - ускорить релиз</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Music className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-400">/vote playlist - добавить в плейлист</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-400">/vote fund - перевести в клубный пул</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-400" />
                    Анти-спам Экономика
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Экономические механизмы предотвращают спам и поощряют качественные сообщения.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-400">0.001 T1 за сообщение</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-400">≤ 1 T1 в день возвращается</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-gray-400">0.01 T1 за жалобу</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integration with Competitions */}
            <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Интеграция с соревнованиями</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Music className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Жанровый чат</h3>
                    <p className="text-sm text-gray-400">
                      "Sprint Streams: BASS 31% | POP 29% | нужно +2%, чтобы догнать!"
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Клубный чат</h3>
                    <p className="text-sm text-gray-400">
                      "Наш пул 4,200 T1. До золота не хватает 300 T1. /vote fund 10"
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Flag className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Страновой чат</h3>
                    <p className="text-sm text-gray-400">
                      "🇧🇷 Взнос армия завершён! Мы 2-е в мире. Держим tempo!"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-[800px]">
            <ChatMatrix />
          </div>
        )}

        {activeTab === 'mechanics' && (
          <div className="space-y-8">
            {/* Voting Commands */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Команды голосования</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Основные команды:</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <code className="text-green-400">/vote boost &lt;track-id&gt;</code>
                          <p className="text-sm text-gray-400">Ускорить релиз участника</p>
                        </div>
                        <Badge variant="outline" className="text-green-400">Бесплатно</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <code className="text-blue-400">/vote playlist &lt;track-id&gt;</code>
                          <p className="text-sm text-gray-400">Добавить в жанровый плейлист</p>
                        </div>
                        <Badge variant="outline" className="text-blue-400">Бесплатно</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <code className="text-purple-400">/vote fund &lt;amount&gt;</code>
                          <p className="text-sm text-gray-400">Перевести T1 в клубный пул</p>
                        </div>
                        <Badge variant="outline" className="text-purple-400">Бесплатно</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Создание опросов:</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <code className="text-yellow-400">/poll</code>
                          <p className="text-sm text-gray-400">Создать опрос</p>
                        </div>
                        <Badge variant="outline" className="text-yellow-400">0.1 T1</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <code className="text-red-400">/report</code>
                          <p className="text-sm text-gray-400">Пожаловаться на спам</p>
                        </div>
                        <Badge variant="outline" className="text-red-400">0.01 T1</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Anti-Spam System */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Анти-спам система</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-4">Экономические механизмы:</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Сообщение</span>
                        <span className="text-green-400">0.001 T1</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Дневной лимит</span>
                        <span className="text-blue-400">1 T1</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Возврат (без жалоб)</span>
                        <span className="text-green-400">100%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Жалоба</span>
                        <span className="text-red-400">0.01 T1</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-4">Система наград:</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Подтверждение спама</span>
                        <span className="text-green-400">+0.02 T1</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Штраф спамера</span>
                        <span className="text-red-400">-0.1 T1</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Возврат жалобы</span>
                        <span className="text-blue-400">+0.01 T1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Storage */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Хранение данных</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-900/20 rounded-lg">
                    <Hash className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-2">История чата</h3>
                    <p className="text-sm text-gray-400">
                      Arweave/IPFS - никто не удалит, даже админ
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-900/20 rounded-lg">
                    <Zap className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-2">Хэш в Solana</h3>
                    <p className="text-sm text-gray-400">
                      Неизменяемая запись всех сообщений
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                    <Shield className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white mb-2">Прозрачность</h3>
                    <p className="text-sm text-gray-400">
                      Вся история доступна для аудита
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-8">
            {/* Role System */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Система ролей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      role: 'Голосующий',
                      condition: 'держит 1+ T1',
                      icon: <Users className="h-6 w-6 text-blue-400" />,
                      permissions: ['голоса в клубных/жанровых DAO-опросах'],
                      color: 'text-blue-400'
                    },
                    {
                      role: 'Капитан клуба',
                      condition: 'владелец Club-NFT ≥ 5% Supply',
                      icon: <Crown className="h-6 w-6 text-yellow-400" />,
                      permissions: ['может поднять опрос на уровень платформы'],
                      color: 'text-yellow-400'
                    },
                    {
                      role: 'Модератор страны',
                      condition: 'топ-10 по T1-донатам в нац-пул',
                      icon: <Shield className="h-6 w-6 text-green-400" />,
                      permissions: ['может мутить спам-ботов (на 24 ч)'],
                      color: 'text-green-400'
                    },
                    {
                      role: 'Артист',
                      condition: 'mint релиза в данном жанре',
                      icon: <Star className="h-6 w-6 text-purple-400" />,
                      permissions: ['может запустить голосование «ускорить ли релиз»'],
                      color: 'text-purple-400'
                    }
                  ].map((role, index) => (
                    <Card key={index} className="bg-gray-700/30">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          {role.icon}
                          <div>
                            <h3 className={`font-semibold ${role.color}`}>{role.role}</h3>
                            <p className="text-sm text-gray-400">{role.condition}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-300">
                          <strong>Возможности:</strong> {role.permissions.join(', ')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Why It Works */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Почему это работает</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Share className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Кросс-промо</h3>
                    <p className="text-sm text-gray-400">
                      Артист из 🇰🇷 в клубе POP видит, что 🇧🇷 фанаты ROOTS активно донатят – и делает коллаб
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Сетевой эффект</h3>
                    <p className="text-sm text-gray-400">
                      3 чата = 3× точек входа для новичка
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Аналитика</h3>
                    <p className="text-sm text-gray-400">
                      Данные на-chain → аналитика для лейблов и брендов без черных ящиков
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Quote */}
            <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
              <CardContent className="p-8">
                <blockquote className="text-center">
                  <p className="text-xl text-white mb-4">
                    <strong>3 чата = 3 DAO.</strong><br/>
                    Плати копейки – спам исчезает.<br/>
                    Голосуй в треде – результат в блокчейне.<br/>
                    Жанр, клуб, страна – три кольца, но одна олимпийская логика: <strong>A = A.</strong>
                  </p>
                  <footer className="text-gray-400">
                    — Чат-матрица Философия
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
