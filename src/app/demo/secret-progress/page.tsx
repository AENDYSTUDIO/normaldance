'use client'

import { useState } from 'react'
import { SecretProgressBar } from '@/components/gamification/secret-progress-bar'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { 
  Music, 
  Users, 
  Zap, 
  Flame, 
  Rocket,
  Target,
  TrendingUp,
  Clock,
  Gift,
  Star
} from '@/components/icons'

export default function SecretProgressDemo() {
  const [selectedTrack, setSelectedTrack] = useState('demo-track-1')
  const [showStats, setShowStats] = useState(false)

  const demoTracks = [
    {
      id: 'demo-track-1',
      title: 'Midnight Dreams',
      artist: 'Luna Nova',
      genre: 'Electronic',
      progress: 67,
      contributors: 1247,
      phase: 'Ускорение'
    },
    {
      id: 'demo-track-2', 
      title: 'Summer Vibes',
      artist: 'Solar Beats',
      genre: 'House',
      progress: 23,
      contributors: 456,
      phase: 'Искры'
    },
    {
      id: 'demo-track-3',
      title: 'Neon Nights',
      artist: 'Cyber Pulse',
      genre: 'Synthwave',
      progress: 89,
      contributors: 2103,
      phase: 'Почти there'
    }
  ]

  const currentTrack = demoTracks.find(track => track.id === selectedTrack)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔥 Secret Progress Bar
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Фанаты видят движение — но не знают цену. Это создаёт адреналин и вирусность.
          </p>
          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
            Демо версия
          </Badge>
        </div>

        {/* Track Selection */}
        <Card className="mb-8 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Music className="h-5 w-5 mr-2" />
              Выберите трек для демонстрации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoTracks.map((track) => (
                <Card 
                  key={track.id}
                  className={`cursor-pointer transition-all ${
                    selectedTrack === track.id 
                      ? 'ring-2 ring-purple-500 bg-purple-900/20' 
                      : 'bg-gray-700/50 hover:bg-gray-600/50'
                  }`}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{track.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {track.phase}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{track.artist}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{track.progress}%</span>
                      <span className="text-gray-400">{track.contributors} участников</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Progress Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Bar Component */}
          <div className="lg:col-span-2">
            <SecretProgressBar 
              trackId={selectedTrack}
              className="mb-6"
              onComplete={() => {
                console.log('Progress completed!')
                setShowStats(true)
              }}
              onPhaseChange={(phase) => {
                console.log('Phase changed to:', phase.name)
              }}
            />
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Текущий трек</span>
                  <span className="text-white font-semibold">{currentTrack?.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Артист</span>
                  <span className="text-white">{currentTrack?.artist}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Жанр</span>
                  <span className="text-white">{currentTrack?.genre}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Прогресс</span>
                  <span className="text-white font-bold">{currentTrack?.progress}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Участников</span>
                  <span className="text-white">{currentTrack?.contributors}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Фазы прогресса
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Искры', emoji: '🩸', range: '0-25%', color: 'text-red-400' },
                  { name: 'Пламя', emoji: '🔥', range: '25-50%', color: 'text-orange-400' },
                  { name: 'Ускорение', emoji: '⚡', range: '50-75%', color: 'text-yellow-400' },
                  { name: 'Почти there', emoji: '💥', range: '75-99%', color: 'text-purple-400' },
                  { name: 'Релиз активирован', emoji: '🚀', range: '100%', color: 'text-green-400' }
                ].map((phase, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{phase.emoji}</span>
                      <span className={`text-sm ${phase.color}`}>{phase.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{phase.range}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Награды
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">За вклад</span>
                  <span className="text-green-400">+10% бонус</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">При завершении</span>
                  <span className="text-green-400">+20% бонус</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">За стрим</span>
                  <span className="text-green-400">+1 T1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">За лайк</span>
                  <span className="text-green-400">+0.1 T1</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Psychology Explanation */}
        <Card className="mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Психология Secret Progress Bar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">🎯 Почему это работает?</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• <strong>Неопределённость</strong> — фанаты не знают, сколько нужно</li>
                  <li>• <strong>Срочность</strong> — каждый может быть последним</li>
                  <li>• <strong>Сообщество</strong> — все работают вместе</li>
                  <li>• <strong>Награды</strong> — каждый вклад приносит бонусы</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">🚀 Эффекты</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• <strong>Вирусность</strong> — люди делятся прогрессом</li>
                  <li>• <strong>Удержание</strong> — возвращаются проверить прогресс</li>
                  <li>• <strong>Вовлечение</strong> — активное участие в релизе</li>
                  <li>• <strong>Эмоции</strong> — адреналин и азарт</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Features */}
        <Card className="mt-8 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Технические особенности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">Real-time Updates</h4>
                <p className="text-sm text-gray-400">
                  Обновления каждые 5 секунд без перезагрузки страницы
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">Social Features</h4>
                <p className="text-sm text-gray-400">
                  Видимость последних участников и их вкладов
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Rocket className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">Gamification</h4>
                <p className="text-sm text-gray-400">
                  Анимации, фазы и мотивационные сообщения
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
