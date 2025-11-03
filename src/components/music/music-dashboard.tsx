import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🎵 Music Dashboard 2025
 * 
 * Музыкальная аналитика для NormalDance:
 * - Топ треки и артисты
 * - NFT треки и их стоимость
 * - Роялти и доходы
 * - Музыкальные тренды
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger, Progress } from '@/components/ui'
import { 
  Music, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Play, 
  Pause,
  Volume2,
  Heart,
  Star,
  Crown,
  Zap,
  DollarSign,
  BarChart3,
  Clock,
  Award,
  Mic,
  Disc,
  Headphones
} from '@/components/icons'

interface MusicDashboardData {
  marketData: unknown
  topTracks: unknown[]
  topArtists: unknown[]
  genreAnalytics: unknown[]
  predictions: unknown
  platformStats: unknown
}

export function MusicDashboard() {
  const [data, setData] = useState<MusicDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchMusicData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchMusicData, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchMusicData = async () => {
    try {
      const response = await fetch('/api/music/analytics')
      const musicData = await response.json()
      setData(musicData)
    } catch (error) {
      SecureLogger.error('Error fetching music data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'TON'): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency === 'TON' ? 'USD' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'falling': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <div className="h-4 w-4 bg-gray-500 rounded-full" />
    }
  }

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'rising': return 'text-green-500'
      case 'falling': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Music className="h-12 w-12 text-purple-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Ошибка загрузки музыкальных данных</h3>
        <p className="text-gray-600 mb-4">Не удалось загрузить данные музыкальной платформы</p>
        <Button onClick={fetchMusicData}>Повторить попытку</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🎵 Music Analytics Dashboard</h1>
          <p className="text-gray-600">Топ треки • NFT рынок • Роялти • Тренды</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={autoRefresh ? "default" : "secondary"}>
            {autoRefresh ? "🔄 Авто-обновление" : "⏸️ Пауза"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Пауза" : "Запуск"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего треков</p>
                <p className="text-2xl font-bold">{data.platformStats?.totalTracks || 0}</p>
                <div className="flex items-center mt-1">
                  <Music className="h-4 w-4 text-purple-500" />
                  <span className="text-sm ml-1 text-gray-600">
                    {data.platformStats?.activeArtists || 0} активных артистов
                  </span>
                </div>
              </div>
              <Disc className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Общие прослушивания</p>
                <p className="text-2xl font-bold">{formatNumber(data.platformStats?.totalPlays || 0)}</p>
                <div className="flex items-center mt-1">
                  <Play className="h-4 w-4 text-green-500" />
                  <span className="text-sm ml-1 text-gray-600">
                    {formatNumber(data.platformStats?.volume24h || 0)} за 24ч
                  </span>
                </div>
              </div>
              <Headphones className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Средняя цена NFT</p>
                <p className="text-2xl font-bold">{formatCurrency(data.platformStats?.averageTrackPrice || 0)}</p>
                <div className="flex items-center mt-1">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span className="text-sm ml-1 text-gray-600">
                    Капитализация: {formatCurrency(data.platformStats?.marketCap || 0)}
                  </span>
                </div>
              </div>
              <Star className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Топ жанр</p>
                <p className="text-2xl font-bold">{data.platformStats?.topGenre || 'Unknown'}</p>
                <div className="flex items-center mt-1">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm ml-1 text-gray-600">
                    {data.platformStats?.trendingTracks || 0} трендовых треков
                  </span>
                </div>
              </div>
              <Volume2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">📊 Обзор</TabsTrigger>
          <TabsTrigger value="tracks">🎵 Треки</TabsTrigger>
          <TabsTrigger value="artists">🎤 Артисты</TabsTrigger>
          <TabsTrigger value="genres">🎶 Жанры</TabsTrigger>
          <TabsTrigger value="predictions">🔮 Прогнозы</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Рыночный обзор
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Общий объем</span>
                  <span className="font-semibold">{formatCurrency(data.marketData?.totalVolume || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Рыночная капитализация</span>
                  <span className="font-semibold">{formatCurrency(data.marketData?.marketCap || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Изменение за 24ч</span>
                  <div className="flex items-center">
                    {getTrendIcon(data.marketData?.volumeChange24h > 0 ? 'rising' : 'falling')}
                    <span className={`ml-1 ${getTrendColor(data.marketData?.volumeChange24h > 0 ? 'rising' : 'falling')}`}>
                      {data.marketData?.volumeChange24h?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Genres */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Music className="h-5 w-5 mr-2" />
                  Топ жанры
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.genreAnalytics?.slice(0, 3).map((genre: unknown, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-purple-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{genre.name}</p>
                          <p className="text-sm text-gray-600">{genre.tracks} треков</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatNumber(genre.totalPlays)}</p>
                        <p className="text-sm text-gray-600">{genre.marketShare}% рынка</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tracks Tab */}
        <TabsContent value="tracks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2" />
                Топ треки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topTracks?.map((track: unknown, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{track.title}</p>
                        <p className="text-sm text-gray-600">{track.artist}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {track.genre}
                          </Badge>
                          <div className="flex items-center">
                            {getTrendIcon(track.trend)}
                            <span className={`text-xs ml-1 ${getTrendColor(track.trend)}`}>
                              {track.playsChange24h > 0 ? '+' : ''}{track.playsChange24h?.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNumber(track.plays24h)}</p>
                      <p className="text-sm text-gray-600">прослушиваний</p>
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(track.nftPrice)} NFT
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Artists Tab */}
        <TabsContent value="artists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mic className="h-5 w-5 mr-2" />
                Топ артисты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topArtists?.map((artist: unknown, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {artist.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{artist.name}</p>
                        <p className="text-sm text-gray-600">{artist.genre}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {artist.totalTracks} треков
                          </Badge>
                          <div className="flex items-center">
                            {getTrendIcon(artist.trend)}
                            <span className={`text-xs ml-1 ${getTrendColor(artist.trend)}`}>
                              {artist.followersChange24h > 0 ? '+' : ''}{artist.followersChange24h}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNumber(artist.totalPlays)}</p>
                      <p className="text-sm text-gray-600">прослушиваний</p>
                      <p className="text-sm font-medium text-blue-600">
                        {formatCurrency(artist.totalEarnings)} доход
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Genres Tab */}
        <TabsContent value="genres" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.genreAnalytics?.map((genre: unknown, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Music className="h-5 w-5 mr-2" />
                    {genre.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Треков</span>
                    <span className="font-semibold">{genre.tracks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Прослушиваний</span>
                    <span className="font-semibold">{formatNumber(genre.totalPlays)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Объем</span>
                    <span className="font-semibold">{formatCurrency(genre.totalVolume)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Средняя цена</span>
                    <span className="font-semibold">{formatCurrency(genre.averagePrice)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Доля рынка</span>
                      <span className="font-semibold">{genre.marketShare}%</span>
                    </div>
                    <Progress value={genre.marketShare} className="w-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getTrendIcon(genre.trend)}
                      <span className={`text-sm ml-1 ${getTrendColor(genre.trend)}`}>
                        {genre.trend === 'rising' ? 'Растет' : genre.trend === 'falling' ? 'Падает' : 'Стабилен'}
                      </span>
                    </div>
                    <Badge variant="outline">
                      #{index + 1} жанр
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                ИИ-прогнозы популярности
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topTracks?.slice(0, 3).map((track: unknown, index: number) => {
                  const prediction = data.predictions?.[`${track.id}_24h`]
                  if (!prediction) return null
                  
                  return (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold">{track.title}</p>
                          <p className="text-sm text-gray-600">{track.artist}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Прогноз на 24ч</p>
                          <p className="font-semibold text-purple-600">
                            {formatNumber(prediction.predictedPlays)} прослушиваний
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-600">Уверенность</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={prediction.confidence} className="w-20" />
                          <span className="text-sm font-semibold">{prediction.confidence?.toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Факторы влияния:</p>
                        {prediction.factors?.slice(0, 3).map((factor: unknown, factorIndex: number) => (
                          <div key={factorIndex} className="flex items-center justify-between text-xs">
                            <span>{factor.name}</span>
                            <div className="flex items-center space-x-1">
                              <span className={`px-2 py-1 rounded ${
                                factor.impact === 'positive' ? 'bg-green-100 text-green-800' :
                                factor.impact === 'negative' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {factor.impact === 'positive' ? '↑' : factor.impact === 'negative' ? '↓' : '→'}
                              </span>
                              <span>{(factor.weight * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
