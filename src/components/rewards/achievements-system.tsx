'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Star, 
  Medal, 
  Crown, 
  Target,
  Clock,
  Music,
  Heart,
  Play,
  Share,
  Users,
  Zap,
  Gift,
  TrendingUp,
  Award,
  CheckCircle,
  Lock,
  Unlock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  category: 'listening' | 'uploading' | 'social' | 'special' | 'streak' | 'milestone' | 'seasonal'
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt?: string
  type: 'single' | 'progressive' | 'streak' | 'time-limited'
  expiresAt?: string
  chain?: string[] // For achievement chains
  reward?: {
    type: 'tokens' | 'badge' | 'title' | 'exclusive' | 'nft' | 'multiplier'
    amount: number
    description: string
    multiplier?: number
  }
  animation?: {
    effect: 'glow' | 'pulse' | 'bounce' | 'sparkle'
    color: string
  }
}

interface UserStats {
  level: number
  experience: number
  nextLevelExp: number
  totalTokens: number
  totalPlayTime: number
  totalLikes: number
  totalShares: number
  totalUploads: number
  followers: number
  following: number
  streakDays: number
  longestStreak: number
  seasonalPoints: number
  nftCollected: number
  multiplierActive: number
  lastActivity: string
}

interface AchievementsSystemProps {
  className?: string
}

export function AchievementsSystem({ className }: AchievementsSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showProgress, setShowProgress] = useState(true)

  // Mock data - в реальном приложении это будет загружаться из API
  useEffect(() => {
    const mockAchievements: Achievement[] = [
      // Listening achievements
      {
        id: '1',
        name: 'Первый прослуш',
        description: 'Прослушайте первый трек',
        icon: '🎵',
        rarity: 'common',
        category: 'listening',
        progress: 1,
        maxProgress: 1,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        reward: {
          type: 'tokens',
          amount: 10,
          description: '10 токенов NDT'
        }
      },
      {
        id: '2',
        name: 'Меломан',
        description: 'Прослушайте 100 треков',
        icon: '🎧',
        rarity: 'rare',
        category: 'listening',
        progress: 75,
        maxProgress: 100,
        unlocked: false,
        reward: {
          type: 'badge',
          amount: 1,
          description: 'Бейдж "Меломан"'
        }
      },
      {
        id: '3',
        name: 'Аудиофил',
        description: 'Прослушайте 1000 треков',
        icon: '🎼',
        rarity: 'epic',
        category: 'listening',
        progress: 450,
        maxProgress: 1000,
        unlocked: false,
        reward: {
          type: 'title',
          amount: 1,
          description: 'Титул "Аудиофил"'
        }
      },
      {
        id: '4',
        name: 'Марафонец',
        description: 'Прослушайте музыку 24 часа подряд',
        icon: '⏰',
        rarity: 'legendary',
        category: 'listening',
        progress: 12,
        maxProgress: 24,
        unlocked: false,
        reward: {
          type: 'exclusive',
          amount: 1,
          description: 'Эксклюзивный аватар'
        }
      },
      // Social achievements
      {
        id: '5',
        name: 'Популярен',
        description: 'Получите 100 лайков',
        icon: '❤️',
        rarity: 'rare',
        category: 'social',
        progress: 45,
        maxProgress: 100,
        unlocked: false,
        reward: {
          type: 'tokens',
          amount: 50,
          description: '50 токенов NDT'
        }
      },
      {
        id: '6',
        name: 'Трендсеттер',
        description: 'Поделитесь 50 треками',
        icon: '📱',
        rarity: 'epic',
        category: 'social',
        progress: 25,
        maxProgress: 50,
        unlocked: false,
        reward: {
          type: 'badge',
          amount: 1,
          description: 'Бейдж "Трендсеттер"'
        }
      },
      {
        id: '7',
        name: 'Социальный бабл',
        description: 'Подпишитесь на 10 артистов',
        icon: '👥',
        rarity: 'common',
        category: 'social',
        progress: 7,
        maxProgress: 10,
        unlocked: false,
        reward: {
          type: 'tokens',
          amount: 20,
          description: '20 токенов NDT'
        }
      },
      // Upload achievements
      {
        id: '8',
        name: 'Творец',
        description: 'Загрузите первый трек',
        icon: '🎤',
        rarity: 'common',
        category: 'uploading',
        progress: 0,
        maxProgress: 1,
        unlocked: false,
        reward: {
          type: 'tokens',
          amount: 100,
          description: '100 токенов NDT'
        }
      },
      {
        id: '9',
        name: 'Продюсер',
        description: 'Загрузите 10 треков',
        icon: '🎛️',
        rarity: 'rare',
        category: 'uploading',
        progress: 3,
        maxProgress: 10,
        unlocked: false,
        reward: {
          type: 'badge',
          amount: 1,
          description: 'Бейдж "Продюсер"'
        }
      },
      // Special achievements
      {
        id: '10',
        name: 'Легенда платформы',
        description: 'Достигните 50 уровня',
        icon: '👑',
        rarity: 'legendary',
        category: 'special',
        progress: 15,
        maxProgress: 50,
        unlocked: false,
        reward: {
          type: 'exclusive',
          amount: 1,
          description: 'Эксклюзивный титул и аватар'
        }
      }
    ]

    const mockUserStats: UserStats = {
      level: 15,
      experience: 2450,
      nextLevelExp: 3000,
      totalTokens: 1250,
      totalPlayTime: 156, // hours
      totalLikes: 234,
      totalShares: 45,
      totalUploads: 3,
      followers: 89,
      following: 12,
      streakDays: 7,
      longestStreak: 15,
      seasonalPoints: 450,
      nftCollected: 2,
      multiplierActive: 1.5,
      lastActivity: new Date().toISOString()
    }

    setAchievements(mockAchievements)
    setUserStats(mockUserStats)
  }, [])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'mythic': return 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 border-pink-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getAnimationClass = (animation?: Achievement['animation']) => {
    if (!animation) return ''
    switch (animation.effect) {
      case 'glow': return 'animate-pulse shadow-lg'
      case 'pulse': return 'animate-bounce'
      case 'bounce': return 'hover:animate-bounce'
      case 'sparkle': return 'animate-pulse bg-gradient-to-r from-yellow-200 to-pink-200'
      default: return ''
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'listening': return <Music className="h-4 w-4" />
      case 'social': return <Users className="h-4 w-4" />
      case 'uploading': return <Trophy className="h-4 w-4" />
      case 'special': return <Crown className="h-4 w-4" />
      case 'streak': return <Zap className="h-4 w-4" />
      case 'milestone': return <Award className="h-4 w-4" />
      case 'seasonal': return <Star className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  if (!userStats) {
    return <div>Загрузка...</div>
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* User stats header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <span>Ваши достижения</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userStats.level}</div>
              <div className="text-xs text-muted-foreground">Уровень</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.totalTokens}</div>
              <div className="text-xs text-muted-foreground">Токенов NDT</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{unlockedCount}/{totalCount}</div>
              <div className="text-xs text-muted-foreground">Достижений</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{userStats.followers}</div>
              <div className="text-xs text-muted-foreground">Подписчиков</div>
            </div>
          </div>
          
          {/* Level progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Уровень {userStats.level}</span>
              <span>{userStats.experience}/{userStats.nextLevelExp} EXP</span>
            </div>
            <Progress 
              value={(userStats.experience / userStats.nextLevelExp) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          Все
        </Button>
        <Button
          variant={selectedCategory === 'listening' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('listening')}
        >
          <Music className="h-4 w-4 mr-1" />
          Слушание
        </Button>
        <Button
          variant={selectedCategory === 'social' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('social')}
        >
          <Users className="h-4 w-4 mr-1" />
          Социальные
        </Button>
        <Button
          variant={selectedCategory === 'uploading' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('uploading')}
        >
          <Trophy className="h-4 w-4 mr-1" />
          Загрузки
        </Button>
        <Button
          variant={selectedCategory === 'special' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('special')}
        >
          <Crown className="h-4 w-4 mr-1" />
          Специальные
        </Button>
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <Card 
            key={achievement.id}
            className={cn(
              'transition-all hover:shadow-md',
              achievement.unlocked ? 'ring-2 ring-yellow-400/30' : 'opacity-75'
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl',
                    getRarityColor(achievement.rarity),
                    achievement.unlocked ? '' : 'bg-gray-50'
                  )}>
                    {achievement.unlocked ? achievement.icon : '🔒'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium truncate">{achievement.name}</h3>
                      {achievement.unlocked && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {getCategoryIcon(achievement.category)}
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs', getRarityColor(achievement.rarity))}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                {achievement.description}
              </p>
              
              {showProgress && !achievement.unlocked && (
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span>Прогресс</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-1"
                  />
                </div>
              )}
              
              {achievement.reward && (
                <div className="bg-muted/50 rounded-lg p-2 text-xs">
                  <div className="flex items-center space-x-1 mb-1">
                    <Gift className="h-3 w-3" />
                    <span className="font-medium">Награда:</span>
                  </div>
                  <p>{achievement.reward.description}</p>
                </div>
              )}
              
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="text-xs text-muted-foreground mt-2">
                  Открыто: {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}