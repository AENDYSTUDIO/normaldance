
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { 
  Share2, 
  Instagram, 
  Twitter, 
  Youtube, 
  Spotify, 
  Apple, 
  Facebook,
  TikTok,
  Music,
  Users,
  Play,
  Heart,
  TrendingUp,
  Calendar,
  Link,
  Copy,
  ExternalLink,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Target,
  BarChart3,
  MessageCircle,
  Radio
} from '@/components/icons'
import { cn } from '@/lib/utils'

interface SocialAccount {
  platform: 'instagram' | 'twitter' | 'youtube' | 'spotify' | 'apple' | 'facebook' | 'tiktok'
  username: string
  connected: boolean
  followers: number
  engagement: number
  lastPost?: string
  bio?: string
  profileUrl?: string
  analytics?: {
    reach: number
    impressions: number
    clicks: number
    growth: number
  }
}

interface SocialIntegrationProps {
  className?: string
  artistId?: string
}

export function SocialIntegration({ className, artistId }: SocialIntegrationProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [newAccount, setNewAccount] = useState({
    platform: 'instagram' as SocialAccount['platform'],
    username: '',
    bio: ''
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [autoPostEnabled, setAutoPostEnabled] = useState(false)
  const [postSchedule, setPostSchedule] = useState({
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '09:00',
    platforms: [] as SocialAccount['platform'][]
  })

  // Mock data - в реальном приложении это будет загружаться из API
  useEffect(() => {
    const mockAccounts: SocialAccount[] = [
      {
        platform: 'instagram',
        username: 'djmelody_official',
        connected: true,
        followers: 125000,
        engagement: 8.5,
        lastPost: '2024-08-25',
        bio: 'Official account of DJ Melody 🎵 Electronic music producer',
        profileUrl: 'https://instagram.com/djmelody_official',
        analytics: {
          reach: 450000,
          impressions: 1200000,
          clicks: 15000,
          growth: 12.5
        }
      },
      {
        platform: 'twitter',
        username: 'djmelody',
        connected: true,
        followers: 89000,
        engagement: 6.2,
        lastPost: '2024-08-24',
        bio: 'Electronic music producer | DJ | Creator of beats that move you 🎧',
        profileUrl: 'https://twitter.com/djmelody',
        analytics: {
          reach: 320000,
          impressions: 850000,
          clicks: 8500,
          growth: 8.3
        }
      },
      {
        platform: 'spotify',
        username: 'djmelody',
        connected: true,
        followers: 234000,
        engagement: 4.8,
        bio: 'Your daily dose of electronic music 🎵',
        profileUrl: 'https://open.spotify.com/artist/djmelody',
        analytics: {
          reach: 1800000,
          impressions: 4500000,
          clicks: 45000,
          growth: 15.2
        }
      },
      {
        platform: 'youtube',
        username: 'DJMelodyOfficial',
        connected: true,
        followers: 156000,
        engagement: 12.1,
        lastPost: '2024-08-20',
        bio: 'Official YouTube channel for DJ Melody',
        profileUrl: 'https://youtube.com/DJMelodyOfficial',
        analytics: {
          reach: 890000,
          impressions: 3200000,
          clicks: 67000,
          growth: 18.7
        }
      },
      {
        platform: 'tiktok',
        username: 'djmelodymusic',
        connected: false,
        followers: 0,
        engagement: 0
      }
    ]

    setData([])
  }, [artistId])

  const getPlatformIcon = (platform: SocialAccount['platform']) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-5 w-5" />
      case 'twitter': return <Twitter className="h-5 w-5" />
      case 'youtube': return <Youtube className="h-5 w-5" />
      case 'spotify': return <Spotify className="h-5 w-5" />
      case 'apple': return <Apple className="h-5 w-5" />
      case 'facebook': return <Facebook className="h-5 w-5" />
      case 'tiktok': return <TikTok className="h-5 w-5" />
      default: return <Share2 className="h-5 w-5" />
    }
  }

  const getPlatformColor = (platform: SocialAccount['platform']) => {
    switch (platform) {
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      case 'twitter': return 'bg-blue-500 text-white'
      case 'youtube': return 'bg-red-600 text-white'
      case 'spotify': return 'bg-green-500 text-white'
      case 'apple': return 'bg-gray-900 text-white'
      case 'facebook': return 'bg-blue-600 text-white'
      case 'tiktok': return 'bg-black text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const handleConnectAccount = (platform: SocialAccount['platform']) => {
    // В реальном приложении здесь будет OAuth интеграция
    setAccounts(prev => prev.map(account => 
      account.platform === platform 
        ? { ...account, connected: true }
        : account
    ))
  }

  const handleDisconnectAccount = (platform: SocialAccount['platform']) => {
    setAccounts(prev => prev.map(account => 
      account.platform === platform 
        ? { ...account, connected: false }
        : account
    ))
  }

  const handleAddAccount = () => {
    if (newAccount.username.trim()) {
      const newAccountObj: SocialAccount = {
        platform: newAccount.platform,
        username: newAccount.username,
        connected: true,
        followers: 0,
        engagement: 0,
        bio: newAccount.bio
      }
      setAccounts(prev => [...prev, newAccountObj])
      setNewAccount({ platform: 'instagram', username: '', bio: '' })
      setShowAddModal(false)
    }
  }

  const totalFollowers = accounts
    .filter(account => account.connected)
    .reduce((sum, account) => sum + account.followers, 0)

  const totalEngagement = accounts
    .filter(account => account.connected)
    .reduce((sum, account) => sum + account.engagement, 0) / accounts.filter(account => account.connected).length || 0

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Социальные сети</h2>
          <p className="text-muted-foreground">Управляйте своими аккаунтами и автоматизируйте публикации</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить аккаунт
        </Button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatNumber(totalFollowers)}</div>
                <div className="text-sm text-muted-foreground">Всего подписчиков</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalEngagement.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Средний охват</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Radio className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{accounts.filter(a => a.connected).length}</div>
                <div className="text-sm text-muted-foreground">Подключено аккаунтов</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Аккаунты</TabsTrigger>
          <TabsTrigger value="automation">Автоматизация</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <Card key={account.platform} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        getPlatformColor(account.platform)
                      )}>
                        {getPlatformIcon(account.platform)}
                      </div>
                      <div>
                        <h3 className="font-medium capitalize">{account.platform}</h3>
                        <p className="text-sm text-muted-foreground">@{account.username}</p>
                      </div>
                    </div>
                    {account.connected ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Подключено
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <XCircle className="h-3 w-3 mr-1" />
                        Не подключено
                      </Badge>
                    )}
                  </div>

                  {account.connected && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-lg font-bold">{formatNumber(account.followers)}</div>
                          <div className="text-xs text-muted-foreground">Подписчики</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{account.engagement}%</div>
                          <div className="text-xs text-muted-foreground">Охват</div>
                        </div>
                      </div>

                      {account.analytics && (
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-medium">{formatNumber(account.analytics.reach)}</div>
                            <div className="text-muted-foreground">Охват</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{formatNumber(account.analytics.impressions)}</div>
                            <div className="text-muted-foreground">Показы</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{formatNumber(account.analytics.clicks)}</div>
                            <div className="text-muted-foreground">Клики</div>
                          </div>
                        </div>
                      )}

                      {account.lastPost && (
                        <div className="text-xs text-muted-foreground">
                          Последний пост: {new Date(account.lastPost).toLocaleDateString('ru-RU')}
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(account.profileUrl, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Профиль
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnectAccount(account.platform)}
                        >
                          Отключить
                        </Button>
                      </div>
                    </div>
                  )}

                  {!account.connected && (
                    <div className="pt-4">
                      <Button 
                        className="w-full"
                        onClick={() => handleConnectAccount(account.platform)}
                      >
                        Подключить аккаунт
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Автоматическая публикация</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Включить автоматическую публикацию</h4>
                  <p className="text-sm text-muted-foreground">
                    Автоматически публиковать новые треки в социальных сетях
                  </p>
                </div>
                <Button
                  variant={autoPostEnabled ? "default" : "outline"}
                  onClick={() => setAutoPostEnabled(!autoPostEnabled)}
                >
                  {autoPostEnabled ? 'Включено' : 'Выключено'}
                </Button>
              </div>

              {autoPostEnabled && (
                <div className="space-y-4">
                  <div>
                    <Label>Частота публикации</Label>
                    <select 
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      value={postSchedule.frequency}
                      onChange={(e) => setPostSchedule(prev => ({ ...prev, frequency: e.target.value as any }))}
                    >
                      <option value="daily">Ежедневно</option>
                      <option value="weekly">Еженедельно</option>
                      <option value="monthly">Ежемесячно</option>
                    </select>
                  </div>

                  <div>
                    <Label>Время публикации</Label>
                    <Input 
                      type="time"
                      value={postSchedule.time}
                      onChange={(e) => setPostSchedule(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Платформы</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {accounts.filter(a => a.connected).map(account => (
                        <label key={account.platform} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={postSchedule.platforms.includes(account.platform)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPostSchedule(prev => ({
                                  ...prev,
                                  platforms: [...prev.platforms, account.platform]
                                }))
                              } else {
                                setPostSchedule(prev => ({
                                  ...prev,
                                  platforms: prev.platforms.filter(p => p !== account.platform)
                                }))
                              }
                            }}
                          />
                          <span className="text-sm">{account.platform}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full">
                    Сохранить настройки
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Шаблоны публикаций</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium mb-1">Новый трек</div>
                  <div className="text-sm text-muted-foreground">
                    🎵 Новый трек "{account?.username}" уже доступен на NormalDance!
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium mb-1">Обновление альбома</div>
                  <div className="text-sm text-muted-foreground">
                    🎧 Альбом обновлен! Слушайте последние треки.
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium mb-1">Стриминг</div>
                  <div className="text-sm text-muted-foreground">
                    🎶 Музыка теперь доступна на всех стриминговых платформах!
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Аналитика соцсетей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Раздел аналитики в разработке.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}