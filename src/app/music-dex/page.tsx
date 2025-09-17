/**
 * 🎵 Music DEX - NormalDance
 * 
 * Главная страница музыкальной DeFi платформы
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  Heart, 
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Shield,
  Brain,
  Mic,
  Disc,
  Headphones,
  Crown,
  Gem
} from '@/components/icons'
import { DualCurrencySystem } from '@/components/dex/dual-currency-system'

export default function MusicDEXPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState({
    title: 'No Tracks',
    artist: 'No Artists',
    genre: 'None',
    price: 0,
    plays: 0
  })

  const topTracks = [
    { title: 'No Tracks', artist: 'No Artists', genre: 'None', price: 0, plays: 0, trend: 'stable' },
    { title: 'No Tracks', artist: 'No Artists', genre: 'None', price: 0, plays: 0, trend: 'stable' },
    { title: 'No Tracks', artist: 'No Artists', genre: 'None', price: 0, plays: 0, trend: 'stable' },
    { title: 'No Tracks', artist: 'No Artists', genre: 'None', price: 0, plays: 0, trend: 'stable' }
  ]

  const stats = {
    totalTracks: 0,
    totalArtists: 0,
    totalPlays: 0,
    totalVolume: 0,
    averagePrice: 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Music className="h-20 w-20 text-purple-400 mr-4" />
            <h1 className="text-6xl font-bold text-white">
              🎵 NormalDance
            </h1>
          </div>
          <p className="text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Музыкальная DeFi платформа в разработке. 
            Solo разработчик, 0 пользователей, 0 треков, 0 дохода.
          </p>
          <div className="flex items-center justify-center space-x-6">
            <Badge variant="outline" className="text-green-400 border-green-400 px-6 py-3 text-lg">
              <Zap className="h-5 w-5 mr-2" />
              Harmony Mode AMM
            </Badge>
            <Badge variant="outline" className="text-purple-400 border-purple-400 px-6 py-3 text-lg">
              <Music className="h-5 w-5 mr-2" />
              NFT Треки
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400 px-6 py-3 text-lg">
              <Shield className="h-5 w-5 mr-2" />
              Защита от волатильности
            </Badge>
          </div>
        </div>

        {/* Current Track Player */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 mb-12">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <Music className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{currentTrack.title}</h3>
                  <p className="text-lg text-gray-300">{currentTrack.artist}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className="text-purple-400 border-purple-400">
                      {currentTrack.genre}
                    </Badge>
                    <span className="text-sm text-gray-400">
                      {currentTrack.plays.toLocaleString()} прослушиваний
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">{currentTrack.price} TON</p>
                  <p className="text-sm text-gray-400">Цена NFT</p>
                </div>
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Disc className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalTracks}</p>
              <p className="text-sm text-gray-400">NFT треков</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
            <CardContent className="p-6 text-center">
              <Mic className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalArtists}</p>
              <p className="text-sm text-gray-400">Артистов</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Headphones className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{(stats.totalPlays / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-400">Прослушиваний</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{(stats.totalVolume / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-400">TON объем</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.averagePrice}</p>
              <p className="text-sm text-gray-400">Средняя цена</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Tracks */}
        <Card className="bg-gray-800/50 border-gray-700 mb-12">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-6 w-6 mr-2" />
              🔥 Топ треки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topTracks.map((track, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{track.title}</p>
                      <p className="text-sm text-gray-400">{track.artist}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {track.genre}
                        </Badge>
                        <span className={`text-xs px-2 py-1 rounded ${
                          track.trend === 'rising' ? 'bg-green-100 text-green-800' :
                          track.trend === 'falling' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {track.trend === 'rising' ? '↑' : track.trend === 'falling' ? '↓' : '→'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400">{track.price} TON</p>
                    <p className="text-sm text-gray-400">{track.plays.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* DEX Interface */}
        <Card className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">
              🎵 Торгуйте под музыку
            </CardTitle>
            <p className="text-gray-300 text-center">
              Используйте продвинутые алгоритмы AMM с музыкальной тематикой
            </p>
          </CardHeader>
          <CardContent>
            <DualCurrencySystem />
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="h-6 w-6 mr-2" />
                Harmony Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Стабильная торговля с минимальным slippage для спокойных периодов
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Constant Product Market Maker</li>
                <li>• Минимальные комиссии</li>
                <li>• Оптимальная ликвидность</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Music className="h-6 w-6 mr-2" />
                Beat Drop Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Стабилизация во время волатильных периодов для защиты от резких колебаний
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Constant Sum Market Maker</li>
                <li>• Защита от волатильности</li>
                <li>• Стабильные курсы</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="h-6 w-6 mr-2" />
                ИИ-Аналитика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Прогнозы популярности треков и рекомендации для артистов
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• ML-прогнозы</li>
                <li>• Анализ трендов</li>
                <li>• Персонализация</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
