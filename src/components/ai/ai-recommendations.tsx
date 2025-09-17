'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar, AvatarFallback, AvatarImage, Slider, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, Progress } from '@/components/ui'
import {
  Play,
  Pause,
  Heart,
  Plus,
  Share,
  MoreHorizontal,
  Sparkles,
  Brain,
  TrendingUp,
  Clock,
  Music,
  Headphones,
  Zap,
  Target,
  Star,
  RefreshCw,
  Settings,
  Filter,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Info
} from '@/components/icons'
import { cn } from '@/lib/utils'
import { aiRecommendationSystem, Recommendation, RecommendationContext, UserProfile } from '@/lib/ai-recommendation-system'
import { useAudioStore } from '@/store/use-audio-store'

interface AIRecommendationsProps {
  userId: string
  className?: string
}

export function AIRecommendations({ userId, className }: AIRecommendationsProps) {
  const { play, currentTrack } = useAudioStore()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [context, setContext] = useState<RecommendationContext>({
    timeOfDay: 'afternoon',
    dayOfWeek: 'weekday'
  })
  const [selectedTab, setSelectedTab] = useState<'discover' | 'mood' | 'activity' | 'similar'>('discover')
  const [filters, setFilters] = useState({
    minScore: 0.5,
    maxResults: 20,
    genres: [] as string[],
    energyLevel: [0, 1] as [number, number],
    danceability: [0, 1] as [number, number],
    valence: [0, 1] as [number, number]
  })

  // Загрузка профиля пользователя
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await aiRecommendationSystem.getUserProfile(userId)
        setUserProfile(profile)
      } catch (error) {
        console.error('Failed to load user profile:', error)
      }
    }
    
    loadUserProfile()
  }, [userId])

  // Загрузка рекомендаций
  const loadRecommendations = useCallback(async () => {
    if (!userProfile) return
    
    setLoading(true)
    setError(null)
    
    try {
      const recs = await aiRecommendationSystem.generateRecommendations(
        userId,
        context,
        filters.maxResults
      )
      
      // Применяем фильтры
      const filteredRecs = recs.filter(rec => {
        if (rec.score < filters.minScore) return false
        if (filters.genres.length > 0 && !filters.genres.includes(rec.track.genre)) return false
        if (rec.features.energy < filters.energyLevel[0] || rec.features.energy > filters.energyLevel[1]) return false
        if (rec.features.danceability < filters.danceability[0] || rec.features.danceability > filters.danceability[1]) return false
        if (rec.features.valence < filters.valence[0] || rec.features.valence > filters.valence[1]) return false
        return true
      })
      
      setRecommendations(filteredRecs)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }, [userId, userProfile, context, filters])

  // Загрузка рекомендаций при изменении контекста или фильтров
  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  // Обновление контекста
  const updateContext = useCallback((newContext: Partial<RecommendationContext>) => {
    setContext(prev => ({ ...prev, ...newContext }))
  }, [])

  // Обновление фильтров
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Воспроизведение трека
  const handlePlayTrack = useCallback((track: any) => {
    play(track)
  }, [play])

  // Форматирование времени
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Форматирование процентов
  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`
  }

  // Получение цвета для оценки
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500'
    if (score >= 0.6) return 'text-yellow-500'
    if (score >= 0.4) return 'text-orange-500'
    return 'text-red-500'
  }

  // Получение иконки для уверенности
  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (confidence >= 0.6) return <Info className="h-4 w-4 text-yellow-500" />
    return <AlertCircle className="h-4 w-4 text-red-500" />
  }

  if (loading && recommendations.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Загрузка рекомендаций...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={loadRecommendations}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Повторить
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Заголовок и настройки */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <CardTitle>AI Рекомендации</CardTitle>
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                ИИ
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={loadRecommendations}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Обновить
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="discover">Открытия</TabsTrigger>
              <TabsTrigger value="mood">Настроение</TabsTrigger>
              <TabsTrigger value="activity">Активность</TabsTrigger>
              <TabsTrigger value="similar">Похожие</TabsTrigger>
            </TabsList>
            
            <TabsContent value="discover" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Время дня</label>
                  <Select value={context.timeOfDay} onValueChange={(value: any) => updateContext({ timeOfDay: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Утро</SelectItem>
                      <SelectItem value="afternoon">День</SelectItem>
                      <SelectItem value="evening">Вечер</SelectItem>
                      <SelectItem value="night">Ночь</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">День недели</label>
                  <Select value={context.dayOfWeek} onValueChange={(value: any) => updateContext({ dayOfWeek: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekday">Будни</SelectItem>
                      <SelectItem value="weekend">Выходные</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mood" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Энергия: {formatPercentage(filters.energyLevel[1])}</label>
                  <Slider
                    value={filters.energyLevel}
                    onValueChange={(value) => updateFilters({ energyLevel: value as [number, number] })}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Танцевальность: {formatPercentage(filters.danceability[1])}</label>
                  <Slider
                    value={filters.danceability}
                    onValueChange={(value) => updateFilters({ danceability: value as [number, number] })}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Позитивность: {formatPercentage(filters.valence[1])}</label>
                  <Slider
                    value={filters.valence}
                    onValueChange={(value) => updateFilters({ valence: value as [number, number] })}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { id: 'workout', label: 'Тренировка', icon: <Zap className="h-4 w-4" /> },
                  { id: 'study', label: 'Учеба', icon: <Target className="h-4 w-4" /> },
                  { id: 'relax', label: 'Отдых', icon: <Music className="h-4 w-4" /> },
                  { id: 'party', label: 'Вечеринка', icon: <Headphones className="h-4 w-4" /> },
                  { id: 'commute', label: 'Дорога', icon: <Clock className="h-4 w-4" /> }
                ].map((activity) => (
                  <Button
                    key={activity.id}
                    variant={context.activity === activity.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateContext({ activity: activity.id as any })}
                    className="flex flex-col items-center space-y-1 h-auto py-3"
                  >
                    {activity.icon}
                    <span className="text-xs">{activity.label}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="similar" className="space-y-4">
              <div className="text-center text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Рекомендации на основе текущего трека</p>
                {currentTrack && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{currentTrack.title}</p>
                    <p className="text-xs text-muted-foreground">{currentTrack.artistName}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Список рекомендаций */}
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Нет рекомендаций для отображения</p>
                <p className="text-sm">Попробуйте изменить фильтры или контекст</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          recommendations.map((rec, index) => (
            <Card key={rec.track.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Обложка */}
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={rec.track.coverImage} />
                    <AvatarFallback>{rec.track.title.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  {/* Информация о треке */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-lg font-medium truncate">{rec.track.title}</h4>
                      {rec.track.isPremium && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Премиум
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {rec.track.artistName} • {rec.track.genre}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(rec.track.duration)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{rec.track.playCount.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Оценка и уверенность */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={cn('text-2xl font-bold', getScoreColor(rec.score))}>
                        {Math.round(rec.score * 100)}
                      </span>
                      <div className="flex flex-col items-center">
                        {getConfidenceIcon(rec.confidence)}
                        <span className="text-xs text-muted-foreground">
                          {Math.round(rec.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Оценка ИИ
                    </div>
                  </div>
                  
                  {/* Действия */}
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={() => handlePlayTrack(rec.track)}>
                      <Play className="h-4 w-4 mr-1" />
                      Играть
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Причины рекомендации */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Почему рекомендовано:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rec.reasons.map((reason, reasonIndex) => (
                      <Badge key={reasonIndex} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Характеристики трека */}
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Энергия:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={rec.features.energy * 100} className="flex-1 h-2" />
                        <span className="font-medium">{formatPercentage(rec.features.energy)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Танцевальность:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={rec.features.danceability * 100} className="flex-1 h-2" />
                        <span className="font-medium">{formatPercentage(rec.features.danceability)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Позитивность:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={rec.features.valence * 100} className="flex-1 h-2" />
                        <span className="font-medium">{formatPercentage(rec.features.valence)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Акустичность:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={rec.features.acousticness * 100} className="flex-1 h-2" />
                        <span className="font-medium">{formatPercentage(rec.features.acousticness)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Темп:</span>
                      <span className="font-medium ml-1">{Math.round(rec.features.tempo)} BPM</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
