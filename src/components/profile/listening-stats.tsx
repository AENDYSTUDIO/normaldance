'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '@/components/ui'
import { 
  Play, 
  Clock, 
  Heart, 
  Share, 
  TrendingUp, 
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Award,
  Music,
  Users,
  Zap,
  Star
} from '@/components/icons'
import { cn } from '@/lib/utils'

interface ListeningStats {
  totalPlayTime: number // in minutes
  totalTracksPlayed: number
  uniqueArtists: number
  uniqueGenres: number
  favoriteGenres: Array<{
    genre: string
    playCount: number
    percentage: number
  }>
  listeningPatterns: {
    byDayOfWeek: Array<{
      day: string
      minutes: number
    }>
    byTimeOfDay: Array<{
      hour: number
      minutes: number
    }>
  }
  topArtists: Array<{
    artistName: string
    playCount: number
    imageUrl?: string
  }>
  topTracks: Array<{
    title: string
    artistName: string
    playCount: number
  }>
  achievements: Array<{
    name: string
    description: string
    icon: string
    unlocked: boolean
  }>
  monthlyProgress: Array<{
    month: string
    minutes: number
  }>
}

interface ListeningStatsProps {
  className?: string
}

export function ListeningStats({ className }: ListeningStatsProps) {
  const [stats, setStats] = useState<ListeningStats | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month')
  const [selectedView, setSelectedView] = useState<'overview' | 'genres' | 'artists' | 'timeline'>('overview')

  // Mock data - в реальном приложении это будет загружаться из API
  useEffect(() => {
    const mockStats: ListeningStats = {
      totalPlayTime: 0, // minutes
      totalTracksPlayed: 0,
      uniqueArtists: 0,
      uniqueGenres: 0,
      favoriteGenres: [
        { genre: 'Electronic', playCount: 0, percentage: 0 },
        { genre: 'Hip-Hop', playCount: 0, percentage: 0 },
        { genre: 'Pop', playCount: 0, percentage: 0 },
        { genre: 'Rock', playCount: 0, percentage: 0 },
        { genre: 'Jazz', playCount: 0, percentage: 0 },
        { genre: 'Classical', playCount: 0, percentage: 0 }
      ],
      listeningPatterns: {
        byDayOfWeek: [
          { day: 'Пн', minutes: 0 },
          { day: 'Вт', minutes: 0 },
          { day: 'Ср', minutes: 0 },
          { day: 'Чт', minutes: 0 },
          { day: 'Пт', minutes: 0 },
          { day: 'Сб', minutes: 0 },
          { day: 'Вс', minutes: 0 }
        ],
        byTimeOfDay: [
          { hour: 0, minutes: 0 },
          { hour: 1, minutes: 0 },
          { hour: 2, minutes: 0 },
          { hour: 3, minutes: 0 },
          { hour: 4, minutes: 0 },
          { hour: 5, minutes: 0 },
          { hour: 6, minutes: 0 },
          { hour: 7, minutes: 0 },
          { hour: 8, minutes: 0 },
          { hour: 9, minutes: 0 },
          { hour: 10, minutes: 0 },
          { hour: 11, minutes: 0 },
          { hour: 12, minutes: 0 },
          { hour: 13, minutes: 0 },
          { hour: 14, minutes: 0 },
          { hour: 15, minutes: 0 },
          { hour: 16, minutes: 0 },
          { hour: 17, minutes: 0 },
          { hour: 18, minutes: 0 },
          { hour: 19, minutes: 0 },
          { hour: 20, minutes: 0 },
          { hour: 21, minutes: 0 },
          { hour: 22, minutes: 0 },
          { hour: 23, minutes: 0 }
        ]
      },
      topArtists: [
        { artistName: 'No Artists', playCount: 0 },
        { artistName: 'No Artists', playCount: 0 },
        { artistName: 'No Artists', playCount: 0 },
        { artistName: 'No Artists', playCount: 0 },
        { artistName: 'No Artists', playCount: 0 }
      ],
      topTracks: [
        { title: 'No Tracks', artistName: 'No Artists', playCount: 0 },
        { title: 'No Tracks', artistName: 'No Artists', playCount: 0 },
        { title: 'No Tracks', artistName: 'No Artists', playCount: 0 },
        { title: 'No Tracks', artistName: 'No Artists', playCount: 0 },
        { title: 'No Tracks', artistName: 'No Artists', playCount: 0 }
      ],
      achievements: [
        { name: 'Нет достижений', description: 'Пока нет активности', icon: '🎧', unlocked: false },
        { name: 'Нет достижений', description: 'Пока нет активности', icon: '🎵', unlocked: false },
        { name: 'Нет достижений', description: 'Пока нет активности', icon: '🎼', unlocked: false },
        { name: 'Нет достижений', description: 'Пока нет активности', icon: '🦉', unlocked: false }
      ],
      monthlyProgress: [
        { month: 'Янв', minutes: 0 },
        { month: 'Фев', minutes: 0 },
        { month: 'Мар', minutes: 0 },
        { month: 'Апр', minutes: 0 }
      ]
    }

    setStats(mockStats)
  }, [])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}ч ${mins}м`
    }
    return `${mins}м`
  }

  const getTopGenreColor = (index: number) => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-pink-500'
    ]
    return colors[index % colors.length]
  }

  if (!stats) {
    return <div>Загрузка статистики...</div>
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Time range selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Статистика прослушиваний</h2>
        <div className="flex space-x-1">
          {(['week', 'month', 'year', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === 'week' && 'Неделя'}
              {range === 'month' && 'Месяц'}
              {range === 'year' && 'Год'}
              {range === 'all' && 'Всё время'}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{formatTime(stats.totalPlayTime)}</div>
            <div className="text-xs text-muted-foreground">Всего времени</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full">
              <Music className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{stats.totalTracksPlayed.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Треков</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{stats.uniqueArtists}</div>
            <div className="text-xs text-muted-foreground">Артистов</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold">{stats.uniqueGenres}</div>
            <div className="text-xs text-muted-foreground">Жанров</div>
          </CardContent>
        </Card>
      </div>

      {/* View selector */}
      <div className="flex space-x-1">
        {(['overview', 'genres', 'artists', 'timeline'] as const).map((view) => (
          <Button
            key={view}
            variant={selectedView === view ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedView(view)}
          >
            {view === 'overview' && 'Обзор'}
            {view === 'genres' && 'Жанры'}
            {view === 'artists' && 'Артисты'}
            {view === 'timeline' && 'Временная линия'}
          </Button>
        ))}
      </div>

      {/* Content based on selected view */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Favorite genres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Любимые жанры</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.favoriteGenres.map((genre, index) => (
                  <div key={genre.genre} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{genre.genre}</span>
                      <span>{genre.playCount} ({genre.percentage}%)</span>
                    </div>
                    <Progress value={genre.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Listening patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Активность по дням</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.listeningPatterns.byDayOfWeek.map((day) => (
                  <div key={day.day} className="flex items-center space-x-3">
                    <span className="w-8 text-sm">{day.day}</span>
                    <div className="flex-1 bg-muted rounded-full h-2 relative overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(day.minutes / 500) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {formatTime(day.minutes)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top artists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Топ артистов</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topArtists.map((artist, index) => (
                  <div key={artist.artistName} className="flex items-center space-x-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white',
                      getTopGenreColor(index)
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{artist.artistName}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {artist.playCount} тр.
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                {stats.achievements.map((achievement) => (
                  <div 
                    key={achievement.name}
                    className={cn(
                      'p-3 rounded-lg border text-center',
                      achievement.unlocked 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    )}
                  >
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <div className="font-medium text-sm">{achievement.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {achievement.unlocked ? '🏆 Получено' : '🔒 Не получено'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedView === 'genres' && (
        <Card>
          <CardHeader>
            <CardTitle>Распределение по жанрам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.favoriteGenres.map((genre) => (
                <div key={genre.genre} className="flex items-center space-x-4">
                  <div className="w-16 text-sm font-medium">{genre.genre}</div>
                  <div className="flex-1">
                    <Progress value={genre.percentage} className="h-3" />
                  </div>
                  <div className="w-16 text-right text-sm">
                    {genre.percentage}%
                  </div>
                  <div className="w-20 text-right text-sm text-muted-foreground">
                    {genre.playCount} тр.
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === 'artists' && (
        <Card>
          <CardHeader>
            <CardTitle>Ваши любимые артисты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topArtists.map((artist, index) => (
                <div key={artist.artistName} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white',
                    getTopGenreColor(index)
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{artist.artistName}</p>
                    <p className="text-sm text-muted-foreground">
                      {artist.playCount} прослушиваний
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Перейти
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Активность по часам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats.listeningPatterns.byTimeOfDay.slice(0, 12).map((hourData) => (
                  <div key={hourData.hour} className="flex items-center space-x-2">
                    <span className="w-8 text-sm">{hourData.hour}:00</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${(hourData.minutes / 250) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {formatTime(hourData.minutes)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Месячная активность</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.monthlyProgress.map((month) => (
                  <div key={month.month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{month.month}</span>
                      <span>{formatTime(month.minutes)}</span>
                    </div>
                    <Progress 
                      value={(month.minutes / 4000) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}