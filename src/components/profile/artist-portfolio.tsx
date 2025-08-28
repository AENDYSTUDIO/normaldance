'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Music, 
  Play, 
  Heart, 
  Share, 
  TrendingUp, 
  Calendar,
  Award,
  Users,
  Eye,
  Download,
  Plus,
  Edit,
  BarChart3,
  DollarSign,
  Star,
  Clock,
  Disc,
  Mic,
  Headphones,
  Radio,
  ChartLine
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ArtistPortfolio {
  artistInfo: {
    id: string
    username: string
    displayName: string
    bio: string
    avatar: string
    banner: string
    level: number
    experience: number
    followers: number
    following: number
    totalPlays: number
    totalLikes: number
    joinDate: string
    verified: boolean
    location?: string
    website?: string
    socialLinks: {
      spotify?: string
      apple?: string
      instagram?: string
      twitter?: string
      youtube?: string
    }
  }
  stats: {
    totalTracks: number
    totalAlbums: number
    totalStreams: number
    averagePlaysPerTrack: number
    topGenre: string
    monthlyListeners: number
    trending: boolean
    rank: number
  }
  releases: Array<{
    id: string
    title: string
    type: 'track' | 'album' | 'single'
    coverImage: string
    releaseDate: string
    playCount: number
    likeCount: number
    duration?: string
    genre: string
  }>
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    unlocked: boolean
    date?: string
  }>
  earnings: {
    total: number
    thisMonth: number
    lastMonth: number
    bySource: Array<{
      source: string
      amount: number
      percentage: number
    }>
  }
  equipment: Array<{
    id: string
    name: string
    category: string
    brand: string
    image?: string
  }>
}

interface ArtistPortfolioProps {
  className?: string
  artistId?: string
}

export function ArtistPortfolio({ className, artistId }: ArtistPortfolioProps) {
  const [portfolio, setPortfolio] = useState<ArtistPortfolio | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'releases' | 'stats' | 'equipment'>('overview')
  const [showEditModal, setShowEditModal] = useState(false)

  // Mock data - в реальном приложении это будет загружаться из API
  useEffect(() => {
    const mockPortfolio: ArtistPortfolio = {
      artistInfo: {
        id: 'artist_1',
        username: 'dj_melody',
        displayName: 'DJ Melody',
        bio: 'Профессиональный DJ и продюсер электронной музыки. Создаю уникальные треки для танцполов по всему миру. Моя музыка - это смесь современных электронных ритмов с классическими элементами.',
        avatar: '/placeholder-avatar.jpg',
        banner: '/placeholder-album.jpg',
        level: 15,
        experience: 8750,
        followers: 15420,
        following: 234,
        totalPlays: 2456800,
        totalLikes: 89340,
        joinDate: '2022-03-15',
        verified: true,
        location: 'Москва, Россия',
        website: 'https://djmelody.com',
        socialLinks: {
          spotify: 'https://open.spotify.com/artist/djmelody',
          apple: 'https://music.apple.com/artist/djmelody',
          instagram: 'https://instagram.com/djmelody',
          twitter: 'https://twitter.com/djmelody'
        }
      },
      stats: {
        totalTracks: 42,
        totalAlbums: 3,
        totalStreams: 2456800,
        averagePlaysPerTrack: 58500,
        topGenre: 'Electronic',
        monthlyListeners: 125000,
        trending: true,
        rank: 23
      },
      releases: [
        {
          id: '1',
          title: 'Summer Vibes 2024',
          type: 'album',
          coverImage: '/placeholder-album.jpg',
          releaseDate: '2024-06-15',
          playCount: 452300,
          likeCount: 12340,
          genre: 'Electronic'
        },
        {
          id: '2',
          title: 'Midnight Dreams',
          type: 'single',
          coverImage: '/placeholder-album.jpg',
          releaseDate: '2024-05-20',
          playCount: 234100,
          likeCount: 8930,
          duration: '3:45',
          genre: 'Progressive House'
        },
        {
          id: '3',
          title: 'Electric Pulse',
          type: 'track',
          coverImage: '/placeholder-album.jpg',
          releaseDate: '2024-04-10',
          playCount: 189200,
          likeCount: 6540,
          duration: '4:12',
          genre: 'Techno'
        },
        {
          id: '4',
          title: 'Urban Flow',
          type: 'single',
          coverImage: '/placeholder-album.jpg',
          releaseDate: '2024-03-25',
          playCount: 156800,
          likeCount: 5210,
          duration: '3:28',
          genre: 'Hip-Hop'
        }
      ],
      achievements: [
        {
          id: '1',
          title: 'Платиновый артист',
          description: 'Более 1 миллиона прослушиваний',
          icon: '🏆',
          rarity: 'legendary',
          unlocked: true,
          date: '2024-02-15'
        },
        {
          id: '2',
          title: 'Трендsetter',
          description: 'Попадание в топ-50 чартов',
          icon: '🔥',
          rarity: 'epic',
          unlocked: true,
          date: '2024-01-20'
        },
        {
          id: '3',
          title: 'Мастер звука',
          description: '50+ выпущенных треков',
          icon: '🎵',
          rarity: 'rare',
          unlocked: true,
          date: '2023-12-10'
        },
        {
          id: '4',
          title: 'Соединение',
          description: '10 000 подписчиков',
          icon: '👥',
          rarity: 'rare',
          unlocked: true,
          date: '2023-11-05'
        }
      ],
      earnings: {
        total: 45230,
        thisMonth: 8750,
        lastMonth: 6230,
        bySource: [
          { source: 'Стриминг', amount: 28400, percentage: 63 },
          { source: 'NFT', amount: 12300, percentage: 27 },
          { source: 'Мерч', amount: 4530, percentage: 10 }
        ]
      },
      equipment: [
        {
          id: '1',
          name: 'Pioneer DJM-900NXS2',
          category: 'DJ-контроллер',
          brand: 'Pioneer',
          image: '/placeholder-avatar.jpg'
        },
        {
          id: '2',
          name: 'Ableton Live Suite',
          category: 'DAW',
          brand: 'Ableton',
          image: '/placeholder-avatar.jpg'
        },
        {
          id: '3',
          name: 'Sennheiser HD 650',
          category: 'Наушники',
          brand: 'Sennheiser',
          image: '/placeholder-avatar.jpg'
        },
        {
          id: '4',
          name: 'KRK Rokit 5 G4',
          category: 'Акустические системы',
          brand: 'KRK',
          image: '/placeholder-avatar.jpg'
        }
      ]
    }

    setPortfolio(mockPortfolio)
  }, [artistId])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'track': return <Music className="h-4 w-4" />
      case 'album': return <Disc className="h-4 w-4" />
      case 'single': return <Mic className="h-4 w-4" />
      default: return <Music className="h-4 w-4" />
    }
  }

  if (!portfolio) {
    return <div>Загрузка портфолио...</div>
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Artist header */}
      <Card>
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg"></div>
          <div className="absolute -bottom-16 left-6">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg">
              <img 
                src={portfolio.artistInfo.avatar} 
                alt={portfolio.artistInfo.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>
        
        <CardContent className="pt-20 pb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{portfolio.artistInfo.displayName}</h1>
                {portfolio.artistInfo.verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Award className="h-3 w-3 mr-1" />
                    Подтверждено
                  </Badge>
                )}
                {portfolio.stats.trending && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    В тренде
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mb-3">{portfolio.artistInfo.bio}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{formatNumber(portfolio.artistInfo.followers)} подписчиков</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Play className="h-4 w-4" />
                  <span>{formatNumber(portfolio.artistInfo.totalPlays)} прослушиваний</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>На платформе с {formatDate(portfolio.artistInfo.joinDate)}</span>
                </div>
                {portfolio.artistInfo.location && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{portfolio.artistInfo.location}</span>
                  </div>
                )}
              </div>
              
              {/* Social links */}
              <div className="flex space-x-3 mb-4">
                {portfolio.artistInfo.socialLinks.spotify && (
                  <Button variant="outline" size="sm">
                    Spotify
                  </Button>
                )}
                {portfolio.artistInfo.socialLinks.apple && (
                  <Button variant="outline" size="sm">
                    Apple Music
                  </Button>
                )}
                {portfolio.artistInfo.socialLinks.instagram && (
                  <Button variant="outline" size="sm">
                    Instagram
                  </Button>
                )}
                {portfolio.artistInfo.socialLinks.youtube && (
                  <Button variant="outline" size="sm">
                    YouTube
                  </Button>
                )}
              </div>
              
              <Button onClick={() => setShowEditModal(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Редактировать профиль
              </Button>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">#{portfolio.stats.rank}</div>
              <div className="text-sm text-muted-foreground">в рейтинге артистов</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full">
              <Music className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{portfolio.stats.totalTracks}</div>
            <div className="text-xs text-muted-foreground">Треков</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full">
              <Disc className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{portfolio.stats.totalAlbums}</div>
            <div className="text-xs text-muted-foreground">Альбомов</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full">
              <Headphones className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{formatNumber(portfolio.stats.monthlyListeners)}</div>
            <div className="text-xs text-muted-foreground">Месячная аудитория</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold">{portfolio.earnings.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Всего заработано</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1">
        {(['overview', 'releases', 'stats', 'equipment'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && 'Обзор'}
            {tab === 'releases' && 'Релизы'}
            {tab === 'stats' && 'Статистика'}
            {tab === 'equipment' && 'Оборудование'}
          </Button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Достижения</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {portfolio.achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={cn(
                      'p-3 rounded-lg border text-center',
                      achievement.unlocked 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    )}
                  >
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {achievement.unlocked ? '🏆 Получено' : '🔒 Не получено'}
                    </div>
                    {achievement.unlocked && achievement.date && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(achievement.date)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Заработок</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{portfolio.earnings.thisMonth}</div>
                    <div className="text-xs text-muted-foreground">В этом месяце</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{portfolio.earnings.lastMonth}</div>
                    <div className="text-xs text-muted-foreground">В прошлом месяце</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Источники дохода</h4>
                  {portfolio.earnings.bySource.map((source) => (
                    <div key={source.source} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{source.source}</span>
                        <span>{source.amount} ({source.percentage}%)</span>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'releases' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolio.releases.map((release) => (
            <Card key={release.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={release.coverImage} 
                    alt={release.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{release.title}</h3>
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(release.type)}
                      <Badge variant="outline" className="text-xs">
                        {release.type === 'track' ? 'Трек' : 
                         release.type === 'album' ? 'Альбом' : 'Сингл'}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{release.genre}</p>
                  
                  {release.duration && (
                    <p className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {release.duration}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(release.releaseDate)}</span>
                    <div className="flex items-center space-x-3">
                      <span>{formatNumber(release.playCount)}</span>
                      <span>{formatNumber(release.likeCount)}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Play className="h-3 w-3 mr-1" />
                      Воспроизвести
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Heart className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card className="border-dashed border-2 hover:border-purple-400 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <Plus className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Добавить релиз</span>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Музыкальная статистика</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{portfolio.stats.totalStreams.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Всего стримов</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{portfolio.stats.averagePlaysPerTrack.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Среднее на трек</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Основной жанр</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{portfolio.stats.topGenre}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((portfolio.releases.filter(r => r.genre === portfolio.stats.topGenre).length / portfolio.releases.length) * 100)}% треков
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChartLine className="h-5 w-5" />
                <span>Аудитория</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{formatNumber(portfolio.artistInfo.followers)}</div>
                    <div className="text-xs text-muted-foreground">Подписчиков</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatNumber(portfolio.stats.monthlyListeners)}</div>
                    <div className="text-xs text-muted-foreground">Месячная аудитория</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Рост аудитории</h4>
                  <Progress value={75} className="h-2" />
                  <div className="text-xs text-muted-foreground">+15% за последний месяц</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'equipment' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Radio className="h-5 w-5" />
              <span>Оборудование и софт</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.equipment.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Mic className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.brand} • {item.category}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:border-purple-400 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-purple-600">Добавить оборудование</h4>
                  <p className="text-sm text-muted-foreground">Расширьте свой профиль</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit modal would be implemented here */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Редактирование профиля</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Edit form would go here */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Имя для отображения</label>
                  <input 
                    type="text" 
                    defaultValue={portfolio.artistInfo.displayName}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Биография</label>
                  <textarea 
                    defaultValue={portfolio.artistInfo.bio}
                    rows={4}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>
                    Отмена
                  </Button>
                  <Button onClick={() => setShowEditModal(false)}>
                    Сохранить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}