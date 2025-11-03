import { SecureLogger } from '@/lib/security/secure-logger';
'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Lock,
  Unlock,
  Shield,
  Download,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Headphones,
  Music,
  Clock,
  Coins,
  Crown,
  Star,
  Award,
  Zap,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Gift,
  CreditCard,
  Wallet,
  Key,
  Database,
  Globe,
  Smartphone as Phone,
  Laptop,
  Tablet
} from '@/components/icons'
import { cn } from '@/lib/utils'

interface PlaybackSession {
  id: string
  trackId: string
  startTime: number
  pausedTime?: number
  isBackground: boolean
  isOffline: boolean
  hasLicense: boolean
  deviceId: string
  walletAddress: string
}

interface NFTPass {
  id: string
  type: 'day' | 'track' | 'club' | 'genre' | 'olympic'
  name: string
  price: number
  duration: number // in hours
  description: string
  benefits: string[]
  icon: string
  color: string
  isActive: boolean
  expiresAt?: number
}

interface AntiPirateSystemProps {
  className?: string
}

export function AntiPirateSystem({ className }: AntiPirateSystemProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<any>(null)
  const [playbackSession, setPlaybackSession] = useState<PlaybackSession | null>(null)
  const [freeTracksUsed, setFreeTracksUsed] = useState(0)
  const [isBackground, setIsBackground] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [activePasses, setActivePasses] = useState<NFTPass[]>([])
  const [showPasses, setShowPasses] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  // Mock data - в реальном приложении будет загружаться из API
  const availablePasses: NFTPass[] = [
    {
      id: 'day-pass',
      type: 'day',
      name: 'Day-Pass',
      price: 0.1,
      duration: 24,
      description: '24 часа фонового прослушивания',
      benefits: ['Фоновое воспроизведение', '1 устройство', '24 часа'],
      icon: '📅',
      color: 'text-blue-400',
      isActive: false
    },
    {
      id: 'track-pass',
      type: 'track',
      name: 'Track-Pass',
      price: 0.3,
      duration: 8760, // 1 year
      description: '∞ фоновых прослушиваний конкретного трека',
      benefits: ['∞ фоновых прослушиваний', 'Конкретный трек', '1 год'],
      icon: '🎵',
      color: 'text-green-400',
      isActive: false
    },
    {
      id: 'club-pass',
      type: 'club',
      name: 'Club-Pass',
      price: 1.0,
      duration: 720, // 1 month
      description: '∞ фонов для всех треков клуба',
      benefits: ['∞ фоновых прослушиваний', 'Все треки клуба', '1 месяц'],
      icon: '🏛️',
      color: 'text-purple-400',
      isActive: false
    },
    {
      id: 'genre-pass',
      type: 'genre',
      name: 'Genre-Pass',
      price: 3.0,
      duration: 720, // 1 month
      description: '∞ фонов для всего жанра',
      benefits: ['∞ фоновых прослушиваний', 'Весь жанр', '1 месяц'],
      icon: '🎧',
      color: 'text-orange-400',
      isActive: false
    },
    {
      id: 'olympic-pass',
      type: 'olympic',
      name: 'Olympic Pass',
      price: 10.0,
      duration: 8760, // 1 year
      description: '∞ фонов + офлайн-кэш + голос x2',
      benefits: ['∞ фоновых прослушиваний', 'Офлайн-кэш 100 треков', 'Голос x2 в Олимпиаде', '1 год'],
      icon: '🏆',
      color: 'text-yellow-400',
      isActive: false
    }
  ]

  const mockTrack = {
    id: 'track-123',
    title: 'Cyber Dreams',
    artist: 'Luna Nova',
    duration: 180,
    genre: 'Electronic',
    club: 'Cyber Beats Club',
    isEncrypted: true,
    streamUrl: '/api/tracks/stream/track-123'
  }

  useEffect(() => {
    // Генерируем уникальный device ID
    const deviceId = generateDeviceId()
    setDeviceId(deviceId)
    
    // Получаем wallet address (в реальном приложении из кошелька)
    setWalletAddress('user-wallet-address')
    
    // Загружаем активные пассы
    loadActivePasses()
    
    // Проверяем количество использованных бесплатных треков
    checkFreeTracksUsed()
    
    // Слушаем события изменения видимости страницы
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBackgroundMode()
      } else {
        handleForegroundMode()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const generateDeviceId = (): string => {
    // В реальном приложении это будет более сложная логика
    return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const loadActivePasses = async () => {
    try {
      // Здесь будет API вызов для загрузки активных пассов
      const response = await fetch('/api/anti-pirate/passes')
      const data = await response.json()
      
      if (data.success) {
        setActivePasses(data.passes)
      }
    } catch (error) {
      SecureLogger.error('Error loading passes:', error)
    }
  }

  const checkFreeTracksUsed = async () => {
    try {
      const response = await fetch(`/api/anti-pirate/free-tracks?deviceId=${deviceId}&walletAddress=${walletAddress}`)
      const data = await response.json()
      
      if (data.success) {
        setFreeTracksUsed(data.used)
      }
    } catch (error) {
      SecureLogger.error('Error checking free tracks:', error)
    }
  }

  const handlePlay = async () => {
    if (!currentTrack) {
      setCurrentTrack(mockTrack)
    }

    // Проверяем лимит бесплатных треков
    if (freeTracksUsed >= 7) {
      // Проверяем, есть ли активный пасс
      const hasActivePass = activePasses.some(pass => pass.isActive)
      
      if (!hasActivePass) {
        // Показываем уведомление о необходимости покупки пасса
        showPassNotification()
        return
      }
    }

    // Создаем сессию воспроизведения
    const session: PlaybackSession = {
      id: `session-${Date.now()}`,
      trackId: mockTrack.id,
      startTime: Date.now(),
      isBackground: false,
      isOffline: !navigator.onLine,
      hasLicense: activePasses.some(pass => pass.isActive),
      deviceId,
      walletAddress
    }

    setPlaybackSession(session)
    setIsPlaying(true)

    // Записываем начало воспроизведения
    await recordPlaybackStart(session)
  }

  const handlePause = async () => {
    if (playbackSession) {
      await recordPlaybackPause(playbackSession)
    }
    setIsPlaying(false)
  }

  const handleBackgroundMode = async () => {
    setIsBackground(true)
    
    if (isPlaying && playbackSession) {
      // Проверяем, есть ли лицензия для фонового воспроизведения
      const hasBackgroundLicense = activePasses.some(pass => 
        pass.isActive && (pass.type === 'day' || pass.type === 'track' || pass.type === 'club' || pass.type === 'genre' || pass.type === 'olympic')
      )
      
      if (!hasBackgroundLicense) {
        // Останавливаем воспроизведение и показываем уведомление
        await handlePause()
        showBackgroundNotification()
      }
    }
  }

  const handleForegroundMode = () => {
    setIsBackground(false)
  }

  const recordPlaybackStart = async (session: PlaybackSession) => {
    try {
      const response = await fetch('/api/anti-pirate/playback/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Увеличиваем счетчик бесплатных треков
        setFreeTracksUsed(prev => prev + 1)
      }
    } catch (error) {
      SecureLogger.error('Error recording playback start:', error)
    }
  }

  const recordPlaybackPause = async (session: PlaybackSession) => {
    try {
      const response = await fetch('/api/anti-pirate/playback/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...session,
          pausedTime: Date.now()
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        SecureLogger.log('Playback paused successfully')
      }
    } catch (error) {
      SecureLogger.error('Error recording playback pause:', error)
    }
  }

  const showPassNotification = () => {
    // В реальном приложении это будет push-уведомление
    alert('Хочешь слушать дальше? Донать 0.1 TON или держи NFT-пасс.')
  }

  const showBackgroundNotification = () => {
    // В реальном приложении это будет push-уведомление
    alert('Фоновое воспроизведение недоступно. Купи NFT-пасс для продолжения.')
  }

  const purchasePass = async (pass: NFTPass) => {
    try {
      const response = await fetch('/api/anti-pirate/passes/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passId: pass.id,
          deviceId,
          walletAddress
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Обновляем список активных пассов
        setActivePasses(prev => [...prev, { ...pass, isActive: true, expiresAt: Date.now() + (pass.duration * 60 * 60 * 1000) }])
        setShowPasses(false)
      }
    } catch (error) {
      SecureLogger.error('Error purchasing pass:', error)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPassIcon = (type: string) => {
    switch (type) {
      case 'day': return <Clock className="h-5 w-5" />
      case 'track': return <Music className="h-5 w-5" />
      case 'club': return <Crown className="h-5 w-5" />
      case 'genre': return <Headphones className="h-5 w-5" />
      case 'olympic': return <Award className="h-5 w-5" />
      default: return <Star className="h-5 w-5" />
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          🛡️ Anti-Pirate 2.0
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          «Бесплатно» = «в поле зрения». Хочешь фоном – плати 1 сат.
        </p>
        <Badge variant="outline" className="text-green-400 border-green-400">
          Fair Use + NFT-лицензии
        </Badge>
      </div>

      {/* Free Pool Status */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Бесплатный пул
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {freeTracksUsed}/7
              </div>
              <div className="text-sm text-gray-400">Треков использовано</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {7 - freeTracksUsed}
              </div>
              <div className="text-sm text-gray-400">Осталось бесплатно</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                24ч
              </div>
              <div className="text-sm text-gray-400">Сброс счетчика</div>
            </div>
          </div>
          
          {freeTracksUsed >= 7 && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">
                  Лимит бесплатных треков исчерпан
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                Воспроизведение продолжается только в foreground. Для фонового прослушивания купите NFT-пасс.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Interface */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Music className="h-5 w-5 mr-2" />
            Плеер
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentTrack ? (
            <div className="space-y-4">
              {/* Track Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Music className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{currentTrack.title}</h3>
                  <p className="text-gray-400">{currentTrack.artist}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {currentTrack.genre}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {currentTrack.club}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-gray-400" />
                  <div className="w-24 h-1 bg-gray-700 rounded-full">
                    <div className="w-3/4 h-full bg-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center justify-center space-x-4">
                <div className={cn(
                  "flex items-center space-x-2 px-3 py-1 rounded-full text-sm",
                  isBackground ? "bg-red-900/20 text-red-400" : "bg-green-900/20 text-green-400"
                )}>
                  {isBackground ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{isBackground ? 'Background' : 'Foreground'}</span>
                </div>
                
                <div className={cn(
                  "flex items-center space-x-2 px-3 py-1 rounded-full text-sm",
                  isOffline ? "bg-red-900/20 text-red-400" : "bg-green-900/20 text-green-400"
                )}>
                  {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
                  <span>{isOffline ? 'Offline' : 'Online'}</span>
                </div>
                
                <div className={cn(
                  "flex items-center space-x-2 px-3 py-1 rounded-full text-sm",
                  activePasses.some(pass => pass.isActive) ? "bg-green-900/20 text-green-400" : "bg-gray-900/20 text-gray-400"
                )}>
                  <Shield className="h-4 w-4" />
                  <span>{activePasses.some(pass => pass.isActive) ? 'Licensed' : 'Free'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Выберите трек для воспроизведения</p>
              <Button onClick={handlePlay} className="bg-purple-600 hover:bg-purple-700">
                <Play className="h-4 w-4 mr-2" />
                Начать воспроизведение
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* NFT Passes */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              NFT-пассы
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasses(!showPasses)}
            >
              {showPasses ? 'Скрыть' : 'Показать'} все пассы
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Active Passes */}
          {activePasses.filter(pass => pass.isActive).length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Активные пассы</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePasses.filter(pass => pass.isActive).map((pass) => (
                  <div key={pass.id} className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      {getPassIcon(pass.type)}
                      <span className="text-green-400 font-semibold">{pass.name}</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{pass.description}</p>
                    {pass.expiresAt && (
                      <div className="text-xs text-gray-400">
                        Истекает: {new Date(pass.expiresAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Passes */}
          {showPasses && (
            <div>
              <h3 className="text-white font-semibold mb-3">Доступные пассы</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availablePasses.map((pass) => (
                  <div key={pass.id} className="p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{pass.icon}</span>
                      <div>
                        <h4 className="text-white font-semibold">{pass.name}</h4>
                        <p className="text-sm text-gray-400">{pass.price} TON</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">{pass.description}</p>
                    
                    <div className="space-y-1 mb-4">
                      {pass.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span className="text-xs text-gray-400">{benefit}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => purchasePass(pass)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={pass.isActive}
                    >
                      {pass.isActive ? 'Активен' : 'Купить'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Implementation */}
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white text-xl">Техническая реализация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-3">События и действия</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                  <Monitor className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-white font-semibold">onPause() / applicationDidEnterBackground()</div>
                    <div className="text-sm text-gray-400">player.stop() + сохранить тайм-код</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                  <Play className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-white font-semibold">onResume()</div>
                    <div className="text-sm text-gray-400">player.seekTo(savedTime) + продолжить, если лицензия есть</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                  <Lock className="h-5 w-5 text-red-400" />
                  <div>
                    <div className="text-white font-semibold">screenLock</div>
                    <div className="text-sm text-gray-400">Аналогично onPause</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                  <WifiOff className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="text-white font-semibold">Airplane / Wi-Fi off</div>
                    <div className="text-sm text-gray-400">Проверка NFT-офлайн-пасса</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">Защита от пиратства</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-white font-semibold">Медиа-файл</div>
                    <div className="text-sm text-gray-400">Потоковый, зашифрован AES-128, ключ = 5-минутный JWT</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                  <Database className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-white font-semibold">Off-line кэш</div>
                    <div className="text-sm text-gray-400">Только внутри приложения, ключ в Secure Hardware</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                  <EyeOff className="h-5 w-5 text-red-400" />
                  <div>
                    <div className="text-white font-semibold">Скрин-рекордер</div>
                    <div className="text-sm text-gray-400">Черный экран + watermark-ID поверх видео</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Quote */}
      <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
        <CardContent className="p-8">
          <blockquote className="text-center">
            <p className="text-xl text-white mb-4">
              <strong>7 треков – gift.</strong><br/>
              Дальше – только в открытом приложении.<br/>
              Хочешь фон/офлайн – купи NFT-пасс за копейки.<br/>
              90% уходит артисту сразу.<br/>
              Пиратство остаётся, но без удобства – значит без смысла.
            </p>
            <footer className="text-gray-400">
              — Anti-Pirate 2.0 Философия
            </footer>
          </blockquote>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for using anti-pirate system
export function useAntiPirateSystem() {
  const [freeTracksUsed, setFreeTracksUsed] = useState(0)
  const [activePasses, setActivePasses] = useState<NFTPass[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const checkFreeTracksLimit = async (deviceId: string, walletAddress: string) => {
    try {
      const response = await fetch(`/api/anti-pirate/free-tracks?deviceId=${deviceId}&walletAddress=${walletAddress}`)
      const data = await response.json()
      
      if (data.success) {
        setFreeTracksUsed(data.used)
        return data.used >= 7
      }
      return false
    } catch (error) {
      SecureLogger.error('Error checking free tracks limit:', error)
      return false
    }
  }

  const purchasePass = async (passId: string, deviceId: string, walletAddress: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/anti-pirate/passes/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passId, deviceId, walletAddress })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadActivePasses()
        return true
      }
      return false
    } catch (error) {
      SecureLogger.error('Error purchasing pass:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const loadActivePasses = async () => {
    try {
      const response = await fetch('/api/anti-pirate/passes')
      const data = await response.json()
      
      if (data.success) {
        setActivePasses(data.passes)
      }
    } catch (error) {
      SecureLogger.error('Error loading active passes:', error)
    }
  }

  return {
    freeTracksUsed,
    activePasses,
    isLoading,
    checkFreeTracksLimit,
    purchasePass,
    loadActivePasses
  }
}
