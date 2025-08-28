import { MainLayout } from '@/components/layout/main-layout'
import { AudioPlayer } from '@/components/audio/audio-player'
import { TrackCard } from '@/components/audio/track-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Edit, 
  Music, 
  Users, 
  Heart, 
  Play, 
  Settings,
  Trophy,
  TrendingUp
} from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'

// Mock user data
const mockUser = {
  id: '1',
  email: 'user@example.com',
  username: 'melodyartist',
  displayName: 'Melody Artist',
  bio: 'Music producer and electronic music enthusiast. Creating sounds that move the soul.',
  avatar: '/placeholder-avatar.jpg',
  banner: '/placeholder-album.jpg',
  wallet: '0x1234567890abcdef',
  level: 'SILVER',
  balance: 2500.50,
  isArtist: true,
  createdAt: '2023-06-15T10:00:00Z',
  updatedAt: '2024-01-20T15:30:00Z',
  _count: {
    tracks: 12,
    playlists: 3,
    followers: 15420,
    following: 892,
    likes: 5430,
    comments: 1205,
    rewards: 89,
  }
}

// Mock tracks data
const mockTracks = [
  {
    id: '1',
    title: 'Summer Vibes',
    artistName: 'Melody Artist',
    genre: 'Electronic',
    duration: 180,
    playCount: 15420,
    likeCount: 892,
    ipfsHash: 'QmXxx...',
    audioUrl: '/sample-audio.mp3',
    coverImage: '/placeholder-album.jpg',
    isExplicit: false,
    isPublished: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Midnight Dreams',
    artistName: 'Melody Artist',
    genre: 'Ambient',
    duration: 240,
    playCount: 8750,
    likeCount: 543,
    ipfsHash: 'QmYyy...',
    audioUrl: '/sample-audio.mp3',
    coverImage: '/placeholder-album.jpg',
    isExplicit: false,
    isPublished: true,
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z'
  }
]

export default function ProfilePage() {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BRONZE': return 'bg-amber-600'
      case 'SILVER': return 'bg-gray-400'
      case 'GOLD': return 'bg-yellow-500'
      case 'PLATINUM': return 'bg-slate-300'
      default: return 'bg-gray-400'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'BRONZE': return '🥉'
      case 'SILVER': return '🥈'
      case 'GOLD': return '🥇'
      case 'PLATINUM': return '💎'
      default: return '🏆'
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Profile header */}
        <div className="relative">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
            <img 
              src={mockUser.banner} 
              alt="Banner" 
              className="w-full h-full object-cover rounded-lg opacity-50"
            />
          </div>
          
          {/* Profile info */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end space-x-4 -mt-16">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback className="text-2xl">
                  {mockUser.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 pb-2">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold">{mockUser.displayName}</h1>
                  <Badge className={`${getLevelColor(mockUser.level)} text-white`}>
                    {getLevelIcon(mockUser.level)} {mockUser.level}
                  </Badge>
                  {mockUser.isArtist && (
                    <Badge variant="secondary">
                      <Music className="h-3 w-3 mr-1" />
                      Артист
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-3">@{mockUser.username}</p>
                <p className="text-sm mb-4 max-w-2xl">{mockUser.bio}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{formatNumber(mockUser._count.followers)}</span>
                    <span className="text-muted-foreground">подписчиков</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{formatNumber(mockUser._count.following)}</span>
                    <span className="text-muted-foreground">подписок</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Music className="h-4 w-4" />
                    <span className="font-medium">{mockUser._count.tracks}</span>
                    <span className="text-muted-foreground">треков</span>
                  </div>
                </div>
              </div>
              
              <div className="space-x-2 pb-2">
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Настройки
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{formatNumber(mockUser._count.playCount || 0)}</p>
                  <p className="text-xs text-muted-foreground">Прослушиваний</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{formatNumber(mockUser._count.likes)}</p>
                  <p className="text-xs text-muted-foreground">Лайков</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{mockUser.balance.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">$NDT</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{mockUser._count.rewards}</p>
                  <p className="text-xs text-muted-foreground">Наград</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content tabs */}
        <Tabs defaultValue="tracks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tracks">Треки</TabsTrigger>
            <TabsTrigger value="playlists">Плейлисты</TabsTrigger>
            <TabsTrigger value="about">О себе</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Треки ({mockUser._count.tracks})</h2>
              <Button>
                <Music className="h-4 w-4 mr-2" />
                Загрузить трек
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="playlists" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Плейлисты ({mockUser._count.playlists})</h2>
              <Button>Создать плейлист</Button>
            </div>
            
            <div className="text-center py-12 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Плейлисты пока не созданы</p>
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{mockUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Кошелек</p>
                    <p className="font-mono text-sm">{mockUser.wallet}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Дата регистрации</p>
                    <p>{formatDate(mockUser.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Статус</p>
                    <Badge variant="outline">Активен</Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">О себе</p>
                  <p>{mockUser.bio}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <AudioPlayer />
    </MainLayout>
  )
}