'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Crown, 
  Music, 
  Users, 
  Clock, 
  Star,
  Gift,
  Zap,
  Play,
  Award,
  Calendar,
  BarChart3,
  Target,
  Sparkles,
  Diamond
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChartEntry {
  id: string
  title: string
  artistName: string
  playCount: number
  likeCount: number
  coverImage?: string
  position: number
  positionChange: 'up' | 'down' | 'new' | 'same'
  streams: number
}

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  type: 'avatar' | 'badge' | 'title' | 'exclusive'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  image?: string
  category: 'profile' | 'achievements' | 'exclusive'
  limited?: boolean
  stock?: number
}

interface UserBalance {
  tokens: number
  gems: number
}

interface ChartsAndShopProps {
  className?: string
}

export function ChartsAndShop({ className }: ChartsAndShopProps) {
  const [activeChart, setActiveChart] = useState<'weekly' | 'monthly' | 'alltime'>('weekly')
  const [activeShopTab, setActiveShopTab] = useState<'all' | 'profile' | 'achievements' | 'exclusive'>('all')
  const [userBalance, setUserBalance] = useState<UserBalance>({ tokens: 1250, gems: 50 })
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)

  // Mock data - в реальном приложении это будет загружаться из API
  useEffect(() => {
    // Mock charts data
    const mockWeeklyCharts: ChartEntry[] = [
      {
        id: '1',
        title: 'Summer Vibes',
        artistName: 'DJ Melody',
        playCount: 45230,
        likeCount: 1234,
        position: 1,
        positionChange: 'up',
        streams: 15230
      },
      {
        id: '2',
        title: 'Midnight Dreams',
        artistName: 'Luna Star',
        playCount: 38920,
        likeCount: 987,
        position: 2,
        positionChange: 'down',
        streams: 8920
      },
      {
        id: '3',
        title: 'Urban Beats',
        artistName: 'Street Composer',
        playCount: 32150,
        likeCount: 756,
        position: 3,
        positionChange: 'new',
        streams: 7150
      },
      {
        id: '4',
        title: 'Electric Storm',
        artistName: 'Thunder Band',
        playCount: 29840,
        likeCount: 643,
        position: 4,
        positionChange: 'up',
        streams: 5840
      },
      {
        id: '5',
        title: 'Chill Vibes',
        artistName: 'Relax Masters',
        playCount: 26780,
        likeCount: 521,
        position: 5,
        positionChange: 'same',
        streams: 4780
      }
    ]

    const mockShopItems: ShopItem[] = [
      // Profile items
      {
        id: '1',
        name: 'Neon Avatar',
        description: 'Стильный неоновый аватар',
        price: 500,
        type: 'avatar',
        rarity: 'common',
        category: 'profile',
        image: '/placeholder-avatar.jpg'
      },
      {
        id: '2',
        name: 'Golden Crown',
        description: 'Королевская корона для профиля',
        price: 1500,
        type: 'avatar',
        rarity: 'rare',
        category: 'profile',
        image: '/placeholder-avatar.jpg'
      },
      // Achievement badges
      {
        id: '3',
        name: 'Music Master Badge',
        description: 'Бейдж для мастеров музыки',
        price: 800,
        type: 'badge',
        rarity: 'rare',
        category: 'achievements',
        image: '/placeholder-avatar.jpg'
      },
      {
        id: '4',
        name: 'Legendary Producer',
        description: 'Эксклюзивный бейдж продюсера',
        price: 2500,
        type: 'badge',
        rarity: 'legendary',
        category: 'achievements',
        image: '/placeholder-avatar.jpg'
      },
      // Titles
      {
        id: '5',
        name: 'VIP Title',
        description: 'Эксклюзивный титул VIP',
        price: 1000,
        type: 'title',
        rarity: 'epic',
        category: 'exclusive',
        image: '/placeholder-avatar.jpg'
      },
      // Exclusive items
      {
        id: '6',
        name: 'Diamond Profile Frame',
        description: 'Алмазная рамка для профиля',
        price: 5000,
        type: 'exclusive',
        rarity: 'legendary',
        category: 'exclusive',
        limited: true,
        stock: 10,
        image: '/placeholder-avatar.jpg'
      },
      {
        id: '7',
        name: 'Animated Avatar',
        description: 'Анимированный аватар с эффектами',
        price: 2000,
        type: 'avatar',
        rarity: 'epic',
        category: 'exclusive',
        image: '/placeholder-avatar.jpg'
      }
    ]

    // Set mock data
    setWeeklyCharts(mockWeeklyCharts)
    setShopItems(mockShopItems)
  }, [])

  const [weeklyCharts, setWeeklyCharts] = useState<ChartEntry[]>([])
  const [shopItems, setShopItems] = useState<ShopItem[]>([])

  const getPositionChangeIcon = (change: string) => {
    switch (change) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      case 'new': return <Star className="h-4 w-4 text-blue-600" />
      case 'same': return <Target className="h-4 w-4 text-gray-600" />
      default: return null
    }
  }

  const getPositionChangeColor = (change: string) => {
    switch (change) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      case 'new': return 'text-blue-600'
      case 'same': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const filteredShopItems = activeShopTab === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === activeShopTab)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* User balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Gift className="h-6 w-6 text-purple-600" />
              <span>Ваш баланс</span>
            </span>
            <Button variant="outline" size="sm">
              Пополнить
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{userBalance.tokens}</div>
                <div className="text-sm text-muted-foreground">Токенов NDT</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Diamond className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{userBalance.gems}</div>
                <div className="text-sm text-muted-foreground">Кристаллов</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <span>Чарты</span>
                </span>
                <div className="flex space-x-1">
                  <Button
                    variant={activeChart === 'weekly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveChart('weekly')}
                  >
                    Неделя
                  </Button>
                  <Button
                    variant={activeChart === 'monthly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveChart('monthly')}
                  >
                    Месяц
                  </Button>
                  <Button
                    variant={activeChart === 'alltime' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveChart('alltime')}
                  >
                    Все время
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weeklyCharts.map((track, index) => (
                  <div key={track.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-2 min-w-[60px]">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {track.position}
                      </div>
                      {getPositionChangeIcon(track.positionChange)}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={track.coverImage} />
                      <AvatarFallback>{track.title.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.artistName}</p>
                    </div>
                    
                    <div className="text-right min-w-[80px]">
                      <div className="text-sm font-medium">{formatNumber(track.streams)}</div>
                      <div className="text-xs text-muted-foreground">просмотров</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shop section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <span>Магазин наград</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Shop tabs */}
              <div className="flex space-x-1 mb-4">
                <Button
                  variant={activeShopTab === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveShopTab('all')}
                >
                  Все
                </Button>
                <Button
                  variant={activeShopTab === 'profile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveShopTab('profile')}
                >
                  Профиль
                </Button>
                <Button
                  variant={activeShopTab === 'achievements' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveShopTab('achievements')}
                >
                  Достижения
                </Button>
                <Button
                  variant={activeShopTab === 'exclusive' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveShopTab('exclusive')}
                >
                  Эксклюзив
                </Button>
              </div>

              {/* Shop items grid */}
              <div className="grid grid-cols-2 gap-3">
                {filteredShopItems.map((item) => (
                  <Card 
                    key={item.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-muted rounded-lg flex items-center justify-center">
                        {item.type === 'avatar' && <Users className="h-8 w-8 text-purple-600" />}
                        {item.type === 'badge' && <Award className="h-8 w-8 text-yellow-600" />}
                        {item.type === 'title' && <Crown className="h-8 w-8 text-blue-600" />}
                        {item.type === 'exclusive' && <Diamond className="h-8 w-8 text-pink-600" />}
                      </div>
                      
                      <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', getRarityColor(item.rarity))}
                        >
                          {item.rarity}
                        </Badge>
                        {item.limited && (
                          <Badge variant="secondary" className="text-xs">
                            {item.stock} шт.
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center space-x-1">
                        <Zap className="h-3 w-3 text-yellow-600" />
                        <span className="text-sm font-bold">{item.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purchase modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Подтверждение покупки</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 bg-muted rounded-lg flex items-center justify-center">
                  {selectedItem.type === 'avatar' && <Users className="h-10 w-10 text-purple-600" />}
                  {selectedItem.type === 'badge' && <Award className="h-10 w-10 text-yellow-600" />}
                  {selectedItem.type === 'title' && <Crown className="h-10 w-10 text-blue-600" />}
                  {selectedItem.type === 'exclusive' && <Diamond className="h-10 w-10 text-pink-600" />}
                </div>
                <h3 className="font-bold text-lg">{selectedItem.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Стоимость:</span>
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="font-bold">{selectedItem.price}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm">Ваш баланс:</span>
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="font-bold">{userBalance.tokens}</span>
                </div>
              </div>
              
              {selectedItem.price > userBalance.tokens && (
                <div className="text-center text-red-600 text-sm">
                  Недостаточно токенов для покупки
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedItem(null)}
                >
                  Отмена
                </Button>
                <Button 
                  className="flex-1"
                  disabled={selectedItem.price > userBalance.tokens}
                >
                  Купить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}