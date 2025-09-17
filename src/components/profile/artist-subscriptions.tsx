'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '@/components/ui'
import { 
  Star, 
  Crown, 
  Users, 
  Gift, 
  TrendingUp, 
  Calendar,
  Bell,
  CreditCard,
  Check,
  X,
  Plus,
  Eye,
  MessageCircle,
  Play,
  Heart,
  Share,
  Zap,
  Diamond,
  Music,
  Radio,
  Award,
  Target
} from '@/components/icons'
import { cn } from '@/lib/utils'

interface ArtistSubscription {
  id: string
  artistId: string
  artistName: string
  artistAvatar: string
  level: 'basic' | 'premium' | 'vip'
  price: number
  benefits: Array<{
    type: 'exclusive_content' | 'early_access' | 'behind_scenes' | 'personal_shoutout' | 'discounts'
    description: string
  }>
  features: Array<{
    name: string
    included: boolean
  }>
  stats: {
    totalSubscribers: number
    monthlyRevenue: number
    contentCount: number
    nextRelease?: string
  }
  userStats?: {
    joinDate: string
    totalSpent: number
    contentAccessed: number
    nextBilling?: string
  }
}

interface SubscriptionTier {
  id: string
  name: string
  price: number
  duration: 'monthly' | 'quarterly' | 'yearly'
  features: string[]
  popular?: boolean
  savings?: number
}

interface ArtistSubscriptionsProps {
  className?: string
  artistId?: string
}

export function ArtistSubscriptions({ className, artistId }: ArtistSubscriptionsProps) {
  const [subscriptions, setSubscriptions] = useState<ArtistSubscription[]>([])
  const [selectedArtist, setSelectedArtist] = useState<ArtistSubscription | null>(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'artists' | 'my-subscriptions' | 'marketplace'>('artists')

  // Mock data - в реальном приложении это будет загружаться из API
  useEffect(() => {
    const mockSubscriptions: ArtistSubscription[] = [
      {
        id: '1',
        artistId: 'artist_1',
        artistName: 'DJ Melody',
        artistAvatar: '/placeholder-avatar.jpg',
        level: 'basic',
        price: 99,
        benefits: [
          { type: 'exclusive_content', description: 'Эксклюзивные треки' },
          { type: 'early_access', description: 'Ранний доступ к новым релизам' },
          { type: 'behind_scenes', description: 'Закулисье создания музыки' }
        ],
        features: [
          { name: 'Эксклюзивный контент', included: true },
          { name: 'Ранний доступ', included: true },
          { name: 'Персональные сообщения', included: false },
          { name: 'Скидки на мерч', included: false }
        ],
        stats: {
          totalSubscribers: 1250,
          monthlyRevenue: 123750,
          contentCount: 42,
          nextRelease: '2024-08-15'
        }
      },
      {
        id: '2',
        artistId: 'artist_2',
        artistName: 'Luna Beats',
        artistAvatar: '/placeholder-avatar.jpg',
        level: 'premium',
        price: 199,
        benefits: [
          { type: 'exclusive_content', description: 'Полный доступ к каталогу' },
          { type: 'early_access', description: 'Неделю раньше всех' },
          { type: 'behind_scenes', description: 'Студийные сессии' },
          { type: 'personal_shoutout', description: 'Персональное упоминание' },
          { type: 'discounts', description: '30% скидка на мерч' }
        ],
        features: [
          { name: 'Эксклюзивный контент', included: true },
          { name: 'Ранний доступ', included: true },
          { name: 'Персональные сообщения', included: true },
          { name: 'Скидки на мерч', included: true },
          { name: 'VIP события', included: false }
        ],
        stats: {
          totalSubscribers: 850,
          monthlyRevenue: 169150,
          contentCount: 67,
          nextRelease: '2024-08-10'
        }
      },
      {
        id: '3',
        artistId: 'artist_3',
        artistName: 'Electronic Masters',
        artistAvatar: '/placeholder-avatar.jpg',
        level: 'vip',
        price: 499,
        benefits: [
          { type: 'exclusive_content', description: 'Весь контент + NFT' },
          { type: 'early_access', description: 'Месяц раньше всех' },
          { type: 'behind_scenes', description: 'Полный доступ к студии' },
          { type: 'personal_shoutout', description: 'Персональные стримы' },
          { type: 'discounts', description: '50% скидка на всё' },
          { type: 'exclusive_content', description: 'Лимитированные NFT' }
        ],
        features: [
          { name: 'Эксклюзивный контент', included: true },
          { name: 'Ранний доступ', included: true },
          { name: 'Персональные сообщения', included: true },
          { name: 'Скидки на мерч', included: true },
          { name: 'VIP события', included: true },
          { name: 'NFT доступ', included: true }
        ],
        stats: {
          totalSubscribers: 320,
          monthlyRevenue: 159680,
          contentCount: 89,
          nextRelease: '2024-08-05'
        }
      }
    ]

    // Mock user subscriptions
    const mockUserSubscriptions = [](sub => 
      sub.artistId === 'artist_1' || sub.artistId === 'artist_2'
    ).map(sub => ({
      ...sub,
      userStats: {
        joinDate: '2024-01-15',
        totalSpent: sub.price * 6,
        contentAccessed: Math.floor(Math.random() * 50) + 10,
        nextBilling: '2024-08-15'
      }
    }))

    setData([])
    if (artistId) {
      const artist = [](sub => sub.artistId === artistId)
      if (artist) setSelectedArtist(artist)
    }
  }, [artistId])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'premium': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'vip': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'basic': return <Star className="h-4 w-4" />
      case 'premium': return <Crown className="h-4 w-4" />
      case 'vip': return <Diamond className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatPrice = (price: number, duration: 'monthly' | 'quarterly' | 'yearly') => {
    const durationText = duration === 'monthly' ? '/мес' : 
                        duration === 'quarterly' ? '/квартал' : '/год'
    return `${price} NDT ${durationText}`
  }

  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 99,
      duration: 'monthly',
      features: [
        'Эксклюзивный контент',
        'Ранний доступ к новым релизам',
        'Закулисье создания музыки',
        'Эксклюзивные плейлисты'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 199,
      duration: 'monthly',
      features: [
        'Всё из Basic',
        'Персональные сообщения от артиста',
        '30% скидка на мерч',
        'Доступ к студийным сессиям'
      ],
      popular: true,
      savings: 60
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 499,
      duration: 'monthly',
      features: [
        'Всё из Premium',
        '50% скидка на всё',
        'Персональные стримы',
        'Лимитированные NFT',
        'VIP приглашения на события'
      ]
    }
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Подписки на артистов</h2>
        <Button onClick={() => setShowSubscriptionModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Найти артистов
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1">
        <Button
          variant={activeTab === 'artists' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('artists')}
        >
          Артисты
        </Button>
        <Button
          variant={activeTab === 'my-subscriptions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('my-subscriptions')}
        >
          Мои подписки
        </Button>
        <Button
          variant={activeTab === 'marketplace' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('marketplace')}
        >
          Маркетплейс
        </Button>
      </div>

      {/* Tab content */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Artist header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img 
                      src={subscription.artistAvatar} 
                      alt={subscription.artistName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{subscription.artistName}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge className={getLevelColor(subscription.level)}>
                        {getLevelIcon(subscription.level)}
                        <span className="ml-1 capitalize">
                          {subscription.level === 'basic' ? 'Basic' : 
                           subscription.level === 'premium' ? 'Premium' : 'VIP'}
                        </span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(subscription.stats.totalSubscribers)} подписчиков
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{subscription.stats.contentCount}</div>
                    <div className="text-xs text-muted-foreground">Треков</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{formatNumber(subscription.stats.monthlyRevenue)}</div>
                    <div className="text-xs text-muted-foreground">Доход/мес</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{subscription.price}</div>
                    <div className="text-xs text-muted-foreground">NDT/мес</div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">Преимущества:</h4>
                  <ul className="space-y-1">
                    {subscription.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Check className="h-3 w-3 text-green-600" />
                        <span>{benefit.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Next release */}
                {subscription.stats.nextRelease && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Следующий релиз:</span>
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {new Date(subscription.stats.nextRelease).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedArtist(subscription)}
                  >
                    Подробнее
                  </Button>
                  <Button size="sm" className="flex-1">
                    Подписаться
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'my-subscriptions' && (
        <div className="space-y-4">
          {subscriptions.filter(sub => sub.userStats).map((subscription) => (
            <Card key={subscription.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src={subscription.artistAvatar} 
                        alt={subscription.artistName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{subscription.artistName}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getLevelColor(subscription.level)}>
                          {getLevelIcon(subscription.level)}
                          <span className="ml-1 capitalize">
                            {subscription.level === 'basic' ? 'Basic' : 
                             subscription.level === 'premium' ? 'Premium' : 'VIP'}
                          </span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Подписан с {new Date(subscription.userStats!.joinDate).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">{subscription.price} NDT/мес</div>
                    {subscription.userStats!.nextBilling && (
                      <div className="text-sm text-muted-foreground">
                        Следующее списание: {new Date(subscription.userStats!.nextBilling).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{subscription.userStats!.contentAccessed}</div>
                    <div className="text-xs text-muted-foreground">Контента доступно</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{subscription.userStats!.totalSpent}</div>
                    <div className="text-xs text-muted-foreground">Всего потрачено</div>
                  </div>
                  <div className="text-center">
                    <Button variant="outline" size="sm">
                      <Bell className="h-3 w-3 mr-1" />
                      Уведомления
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm">
                    Изменить тариф
                  </Button>
                  <Button variant="outline" size="sm">
                    Отписаться
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptionTiers.map((tier) => (
            <Card key={tier.id} className={cn(
              'relative overflow-hidden',
              tier.popular && 'border-purple-500 shadow-lg'
            )}>
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs">
                  Самый популярный
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    {getLevelIcon(tier.id)}
                  </div>
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <div className="text-3xl font-bold text-purple-600 my-2">
                    {tier.price} NDT
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tier.duration === 'monthly' ? 'в месяц' : 
                     tier.duration === 'quarterly' ? 'за квартал' : 'за год'}
                  </div>
                  {tier.savings && (
                    <div className="text-green-600 font-medium mt-1">
                      Экономия {tier.savings} NDT/мес
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  variant={tier.popular ? 'default' : 'outline'}
                >
                  Выбрать {tier.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Subscription modal */}
      {selectedArtist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Подписка на {selectedArtist.artistName}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedArtist(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Artist info */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  <img 
                    src={selectedArtist.artistAvatar} 
                    alt={selectedArtist.artistName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedArtist.artistName}</h3>
                  <p className="text-muted-foreground">
                    {formatNumber(selectedArtist.stats.totalSubscribers)} подписчиков
                  </p>
                </div>
              </div>

              {/* Subscription tiers */}
              <div className="space-y-4">
                <h4 className="font-medium">Выберите тариф:</h4>
                {subscriptionTiers.map((tier) => (
                  <Card 
                    key={tier.id}
                    className={cn(
                      'cursor-pointer transition-all',
                      selectedArtist.level === tier.id && 'ring-2 ring-purple-500'
                    )}
                    onClick={() => {
                      // Update selected tier
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            tier.id === 'basic' && 'bg-blue-100 text-blue-600',
                            tier.id === 'premium' && 'bg-purple-100 text-purple-600',
                            tier.id === 'vip' && 'bg-yellow-100 text-yellow-600'
                          )}>
                            {getLevelIcon(tier.id)}
                          </div>
                          <div>
                            <h5 className="font-medium">{tier.name}</h5>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(tier.price, tier.duration)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {tier.savings && (
                            <div className="text-green-600 text-sm font-medium">
                              -{tier.savings} NDT/мес
                            </div>
                          )}
                          <Button size="sm" variant="outline">
                            Выбрать
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        {tier.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <Check className="h-3 w-3 text-green-600" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Benefits summary */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium mb-2">Что вы получите:</h4>
                <ul className="space-y-1 text-sm">
                  {selectedArtist.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Gift className="h-3 w-3 text-purple-600" />
                      <span>{benefit.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment info */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Оплата через кошелек</div>
                  <div className="text-sm text-muted-foreground">
                    Автоматическое списание каждый месяц
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{selectedArtist.price} NDT</div>
                  <div className="text-sm text-muted-foreground">в месяц</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setSelectedArtist(null)}>
                  Отмена
                </Button>
                <Button className="flex-1">
                  Подписаться за {selectedArtist.price} NDT/мес
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Find artists modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Найти артистов для подписки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск артистов..."
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">Электронная музыка</Button>
                  <Button variant="outline" size="sm">Хип-хоп</Button>
                  <Button variant="outline" size="sm">Рок</Button>
                  <Button variant="outline" size="sm">Джаз</Button>
                  <Button variant="outline" size="sm">Классика</Button>
                </div>

                {/* Popular artists */}
                <div>
                  <h4 className="font-medium mb-3">Популярные артисты</h4>
                  <div className="space-y-3">
                    {subscriptions.slice(0, 3).map((artist) => (
                      <div key={artist.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img 
                              src={artist.artistAvatar} 
                              alt={artist.artistName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h5 className="font-medium">{artist.artistName}</h5>
                            <p className="text-sm text-muted-foreground">
                              {formatNumber(artist.stats.totalSubscribers)} подписчиков
                            </p>
                          </div>
                        </div>
                        <Button size="sm">Подписаться</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setShowSubscriptionModal(false)}>
                  Закрыть
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}