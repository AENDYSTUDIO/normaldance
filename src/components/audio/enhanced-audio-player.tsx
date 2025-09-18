'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAudioStore } from '@/store/use-audio-store'
import useNetworkStatus from '@/hooks/useNetworkStatus'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Share,
  MoreHorizontal,
  List,
  X,
  Shuffle,
  Repeat,
  Clock,
  Music,
  Users,
  TrendingUp,
  BarChart3,
  Headphones,
  Plus,
  Settings,
  Download,
  Save,
  ListMusic,
  Radio,
  Mic,
  SlidersHorizontal,
  Waves,
  Circle,
  Square,
  Triangle,
  Zap,
  Crown,
  Award,
  Target,
  Activity,
  Ruler,
  Gauge,
  Volume1,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  AlertCircle,
  CheckCircle,
  Info,
  Search,
  Star,
  Sparkles,
  Diamond,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Tablet
} from '@/components/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { AudioVisualizer } from './audio-visualizer'

interface AudioQuality {
  id: string
  name: string
  bitrate: number
  sampleRate: number
  extension: string
  size: string
}

interface Playlist {
  id: string
  name: string
  description?: string
  coverImage?: string
  tracks: any[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  playCount: number
  likeCount: number
}

interface EqualizerPreset {
  id: string
  name: string
  settings: {
    bass: number
    mid: number
    treble: number
    gain: number
  }
  icon: React.ReactNode
}

interface PlaybackStats {
  totalPlayTime: number
  skipCount: number
  repeatCount: number
  favoriteCount: number
  lastPlayed: Date | null
  playStreak: number
}

export function EnhancedAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    queue,
    currentQueueIndex,
    history,
    shuffle,
    repeat,
    play,
    pause,
    setVolume,
    toggleMute,
    seekTo,
    playNext,
    playPrevious,
    toggleLike,
    toggleShuffle,
    setRepeat,
    addToQueue,
    removeFromQueue,
    clearQueue,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    getUserPlaylists,
    setCurrentPlaylist
  } = useAudioStore()

  const audioRef = useRef<HTMLAudioElement>(null)
  const { effectiveType } = useNetworkStatus()
  const [isLiked, setIsLiked] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [showVisualizer, setShowVisualizer] = useState(true)
  const [showPlaylistManager, setShowPlaylistManager] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showQualitySettings, setShowQualitySettings] = useState(false)
  const [showEqualizer, setShowEqualizer] = useState(false)
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [showSleepTimer, setShowSleepTimer] = useState(false)
  const [showCrossfade, setShowCrossfade] = useState(false)
  const [showThemeSettings, setShowThemeSettings] = useState(false)
  
  // Состояния для плейлистов
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [currentPlaylist, setCurrentPlaylistState] = useState<Playlist | null>(null)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQuality, setSelectedQuality] = useState('auto')
  
  // Состояния для эквалайзера
  const [equalizerSettings, setEqualizerSettings] = useState({
    bass: 0,
    mid: 0,
    treble: 0,
    gain: 0
  })
  
  // Состояния для визуализации
  const [visualizerType, setVisualizerType] = useState<'bars' | 'wave' | 'circle' | 'particles'>('bars')
  const [visualizerColor, setVisualizerColor] = useState('#3b82f6')
  const [visualizerSensitivity, setVisualizerSensitivity] = useState(50)
  
  // Состояния для сна
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(30)
  const [sleepTimerActive, setSleepTimerActive] = useState(false)
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0)
  
  // Состояния для кроссфейда
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(false)
  const [crossfadeDuration, setCrossfadeDuration] = useState(3)
  
  // Состояния для темы
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto')
  const [playerTheme, setPlayerTheme] = useState<'glass' | 'minimal' | 'neon'>('glass')
  
  // Статистика воспроизведения
  const [playbackStats, setPlaybackStats] = useState<PlaybackStats>({
    totalPlayTime: 0,
    skipCount: 0,
    repeatCount: 0,
    favoriteCount: 0,
    lastPlayed: null,
    playStreak: 0
  })
  
  // Качество звука
  const audioQualities: AudioQuality[] = [
    { id: 'low', name: 'Низкое (64 kbps)', bitrate: 64, sampleRate: 22050, extension: 'mp3', size: '2-5 MB' },
    { id: 'medium', name: 'Среднее (128 kbps)', bitrate: 128, sampleRate: 44100, extension: 'mp3', size: '4-10 MB' },
    { id: 'high', name: 'Высокое (320 kbps)', bitrate: 320, sampleRate: 48000, extension: 'mp3', size: '8-15 MB' },
    { id: 'lossless', name: 'Lossless (FLAC)', bitrate: 1411, sampleRate: 96000, extension: 'flac', size: '20-40 MB' },
    { id: 'auto', name: 'Авто (адаптивное)', bitrate: 0, sampleRate: 0, extension: 'mp3', size: 'Переменное' }
  ]
  
  // Пресеты эквалайзера
  const equalizerPresets: EqualizerPreset[] = [
    {
      id: 'flat',
      name: 'Плоский',
      settings: { bass: 0, mid: 0, treble: 0, gain: 0 },
      icon: <Square className="h-4 w-4" />
    },
    {
      id: 'bass_boost',
      name: 'Усиление баса',
      settings: { bass: 8, mid: 0, treble: -2, gain: 2 },
      icon: <Triangle className="h-4 w-4" />
    },
    {
      id: 'vocal_boost',
      name: 'Усиление вокала',
      settings: { bass: -2, mid: 6, treble: 2, gain: 0 },
      icon: <Mic className="h-4 w-4" />
    },
    {
      id: 'rock',
      name: 'Рок',
      settings: { bass: 5, mid: 2, treble: 5, gain: 3 },
      icon: <Zap className="h-4 w-4" />
    },
    {
      id: 'jazz',
      name: 'Джаз',
      settings: { bass: 3, mid: 3, treble: 2, gain: 1 },
      icon: <Music className="h-4 w-4" />
    },
    {
      id: 'classical',
      name: 'Классика',
      settings: { bass: 2, mid: 4, treble: 4, gain: 2 },
      icon: <Crown className="h-4 w-4" />
    }
  ]

  // Адаптивный URL для аудио
  const audioSrc = useCallback(() => {
    if (!currentTrack) return ''
    
    // Определяем качество звука
    let quality = audioQualities.find(q => q.id === selectedQuality)
    if (!quality || selectedQuality === 'auto') {
      quality = audioQualities[1] // Среднее качество по умолчанию
    }
    
    // Адаптируем под сеть
    const useLowQualityAudio = effectiveType === 'slow-2g' || effectiveType === '2g'
    
    if (useLowQualityAudio && quality.id !== 'low') {
      const lowQuality = audioQualities[0] // Низкое качество
      const parts = currentTrack.audioUrl.split('.')
      const extension = parts.pop()
      return `${parts.join('.')}_low.${extension}`
    }
    
    // Для lossless качества проверяем поддержку браузера
    if (quality.id === 'lossless' && !audioRef.current?.canPlayType('audio/flac')) {
      const highQuality = audioQualities[2] // Высокое качество mp3
      const parts = currentTrack.audioUrl.split('.')
      const extension = parts.pop()
      return `${parts.join('.')}_high.${extension}`
    }
    
    return currentTrack.audioUrl
  }, [currentTrack, selectedQuality, effectiveType])

  // Загрузка плейлистов
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const userPlaylists = await getUserPlaylists()
        setPlaylists(userPlaylists)
      } catch (error) {
        console.error('Error loading playlists:', error)
      }
    }
    loadPlaylists()
  }, [getUserPlaylists])

  // Эффекты для аудио
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentTrack])

  // Таймер сна
  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (sleepTimerActive && sleepTimerRemaining > 0) {
      timer = setTimeout(() => {
        setSleepTimerRemaining(prev => {
          if (prev <= 1) {
            pause()
            setSleepTimerActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (sleepTimerActive && sleepTimerRemaining === 0) {
      setSleepTimerActive(false)
    }
    
    return () => clearTimeout(timer)
  }, [sleepTimerActive, sleepTimerRemaining, pause])

  // Обработчики событий
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime
      seekTo(time)
      
      // Обновление статистики
      setPlaybackStats(prev => ({
        ...prev,
        totalPlayTime: prev.totalPlayTime + 0.1,
        lastPlayed: new Date()
      }))
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      useAudioStore.getState().setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    seekTo(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
  }

  const handleQueueItemClick = (track: any, index: number) => {
    playTrack(track)
  }

  const playTrack = (track: any) => {
    play(track)
  }

  // Форматирование времени
  const formatQueueTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Форматирование чисел
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // Создание плейлиста
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return
    
    try {
      const playlist = await createPlaylist({
        name: newPlaylistName,
        description: newPlaylistDescription,
        isPublic: false
      })
      
      setPlaylists(prev => [...prev, playlist])
      setNewPlaylistName('')
      setNewPlaylistDescription('')
      setShowCreatePlaylist(false)
    } catch (error) {
      console.error('Error creating playlist:', error)
    }
  }

  // Добавление в плейлист
  const handleAddToPlaylist = async (playlistId: string) => {
    if (!currentTrack) return
    
    try {
      await addToPlaylist(playlistId, currentTrack)
      alert('Трек добавлен в плейлист')
    } catch (error) {
      console.error('Error adding to playlist:', error)
    }
  }

  // Применение пресета эквалайзера
  const applyEqualizerPreset = (preset: EqualizerPreset) => {
    setEqualizerSettings(preset.settings)
  }

  // Запуск таймера сна
  const startSleepTimer = () => {
    setSleepTimerActive(true)
    setSleepTimerRemaining(sleepTimerMinutes * 60)
  }

  // Остановка таймера сна
  const stopSleepTimer = () => {
    setSleepTimerActive(false)
    setSleepTimerRemaining(0)
  }

  // Если нет текущего трека, не отображаем плеер
  if (!currentTrack) {
    return null
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc()}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
        crossOrigin="anonymous"
      />
      
      {/* Основной плеер */}
      <Card className={cn(
        "fixed bottom-0 left-0 right-0 z-50 rounded-none border-t transition-all duration-300",
        playerTheme === 'glass' && "bg-background/80 backdrop-blur-md",
        playerTheme === 'minimal' && "bg-background border-t-2",
        playerTheme === 'neon' && "bg-background/90 backdrop-blur-sm border-t border-primary/20"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Информация о треке */}
            <div className="flex items-center space-x-3 min-w-[200px]">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentTrack.coverImage} />
                <AvatarFallback>{currentTrack.title.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h4 className="text-sm font-medium truncate">{currentTrack.title}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {currentTrack.artistName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {currentTrack.genre}
                  </Badge>
                  {currentTrack.isExplicit && (
                    <Badge variant="destructive" className="text-xs">
                      18+
                    </Badge>
                  )}
                  {currentTrack.isPremium && (
                    <Badge variant="secondary" className="text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Премиум
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Управление воспроизведением */}
            <div className="flex-1 flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleShuffle}
                  className={cn(shuffle && 'text-primary')}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={playPrevious}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={isPlaying ? pause : play}
                  className="w-10 h-10 rounded-full"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={playNext}>
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRepeat(repeat === 'all' ? 'off' : repeat === 'off' ? 'one' : 'all')}
                  className={cn(repeat !== 'off' && 'text-primary')}
                >
                  <Repeat className={cn(
                    repeat === 'one' ? 'rotate-180' : '',
                    'h-4 w-4'
                  )} />
                </Button>
              </div>

              {/* Прогресс бар */}
              <div className="w-full flex items-center space-x-2">
                <span className="text-xs text-muted-foreground min-w-[40px]">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={handleSeek}
                    className="w-full"
                  />
                </div>
                <span className="text-xs text-muted-foreground min-w-[40px]">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Дополнительные действия */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVisualizer(!showVisualizer)}
                className={cn(!showVisualizer && 'text-primary')}
              >
                {showVisualizer ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-full"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQueue(!showQueue)}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlaylistManager(!showPlaylistManager)}
              >
                <ListMusic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(!showStats)}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Визуализатор */}
      {showVisualizer && (
        <div className="fixed bottom-20 left-0 right-0 z-40 h-24 bg-background/80 backdrop-blur-sm border-t">
          <AudioVisualizer
            audioElement={audioRef.current}
            isPlaying={isPlaying}
            type={visualizerType}
            color={visualizerColor}
          />
        </div>
      )}
      
      {/* Очередь воспроизведения */}
      {showQueue && (
        <Dialog open={showQueue} onOpenChange={setShowQueue}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Очередь воспроизведения</DialogTitle>
              <DialogDescription>
                {queue.length} треков в очереди
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {queue.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentQueueIndex ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                  onClick={() => handleQueueItemClick(track, index)}
                >
                  <div className="text-sm text-muted-foreground min-w-[40px]">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={track.coverImage} />
                    <AvatarFallback>{track.title.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{track.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artistName}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatQueueTime(track.duration)}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Менеджер плейлистов */}
      {showPlaylistManager && (
        <Dialog open={showPlaylistManager} onOpenChange={setShowPlaylistManager}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Плейлисты</DialogTitle>
              <DialogDescription>
                Управление вашими плейлистами
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => setShowCreatePlaylist(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать плейлист
                </Button>
              </div>
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => setCurrentPlaylist(playlist.id)}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={playlist.coverImage} />
                      <AvatarFallback>{playlist.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{playlist.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {playlist.tracks.length} треков
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToPlaylist(playlist.id)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Статистика */}
      {showStats && (
        <Dialog open={showStats} onOpenChange={setShowStats}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Статистика воспроизведения</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatNumber(history.length)}</p>
                  <p className="text-sm text-muted-foreground">Прослушано</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatNumber(queue.length)}</p>
                  <p className="text-sm text-muted-foreground">В очереди</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Общее время</span>
                  <span className="text-sm font-medium">{formatTime(playbackStats.totalPlayTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Пропусков</span>
                  <span className="text-sm font-medium">{playbackStats.skipCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Повторов</span>
                  <span className="text-sm font-medium">{playbackStats.repeatCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Избранного</span>
                  <span className="text-sm font-medium">{playbackStats.favoriteCount}</span>
                </div>
              </div>
              
              {playbackStats.lastPlayed && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Последний раз</p>
                  <p className="text-xs">
                    {new Date(playbackStats.lastPlayed).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Расширенные настройки */}
      {showAdvancedSettings && (
        <Dialog open={showAdvancedSettings} onOpenChange={setShowAdvancedSettings}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Расширенные настройки</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="quality" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="quality">Качество</TabsTrigger>
                <TabsTrigger value="equalizer">Эквалайзер</TabsTrigger>
                <TabsTrigger value="sleep">Таймер сна</TabsTrigger>
                <TabsTrigger value="theme">Тема</TabsTrigger>
              </TabsList>
              
              <TabsContent value="quality" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Качество звука</h4>
                  <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {audioQualities.map((quality) => (
                        <SelectItem key={quality.id} value={quality.id}>
                          {quality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Состояние сети</h4>
                  <div className="flex items-center gap-2">
                    {effectiveType === 'slow-2g' && <WifiOff className="h-4 w-4 text-red-500" />}
                    {effectiveType === '2g' && <SignalLow className="h-4 w-4 text-yellow-500" />}
                    {effectiveType === '3g' && <SignalMedium className="h-4 w-4 text-blue-500" />}
                    {effectiveType === '4g' && <SignalHigh className="h-4 w-4 text-green-500" />}
                    <span className="text-sm">{effectiveType}</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="equalizer" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Пресеты</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {equalizerPresets.map((preset) => (
                      <Button
                        key={preset.id}
                        variant="outline"
                        size="sm"
                        onClick={() => applyEqualizerPreset(preset)}
                        className="justify-start"
                      >
                        {preset.icon}
                        <span className="ml-2">{preset.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Бас</label>
                    <Slider
                      value={[equalizerSettings.bass]}
                      max={12}
                      step={1}
                      onValueChange={([value]) => setEqualizerSettings(prev => ({ ...prev, bass: value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Средние</label>
                    <Slider
                      value={[equalizerSettings.mid]}
                      max={12}
                      step={1}
                      onValueChange={([value]) => setEqualizerSettings(prev => ({ ...prev, mid: value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Треблы</label>
                    <Slider
                      value={[equalizerSettings.treble]}
                      max={12}
                      step={1}
                      onValueChange={([value]) => setEqualizerSettings(prev => ({ ...prev, treble: value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Усиление</label>
                    <Slider
                      value={[equalizerSettings.gain]}
                      max={12}
                      step={1}
                      onValueChange={([value]) => setEqualizerSettings(prev => ({ ...prev, gain: value }))}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="sleep" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Таймер сна</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={sleepTimerMinutes}
                      onChange={(e) => setSleepTimerMinutes(parseInt(e.target.value) || 30)}
                      className="w-20"
                      min={1}
                      max={180}
                    />
                    <span>минут</span>
                    {sleepTimerActive ? (
                      <Button onClick={stopSleepTimer} variant="destructive" size="sm">
                        Остановить
                      </Button>
                    ) : (
                      <Button onClick={startSleepTimer} size="sm">
                        Запустить
                      </Button>
                    )}
                  </div>
                  
                  {sleepTimerActive && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        Осталось: {Math.floor(sleepTimerRemaining / 60)}:{(sleepTimerRemaining % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Кроссфейд</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={crossfadeEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCrossfadeEnabled(!crossfadeEnabled)}
                    >
                      Включен
                    </Button>
                    {crossfadeEnabled && (
                      <>
                        <Input
                          type="number"
                          value={crossfadeDuration}
                          onChange={(e) => setCrossfadeDuration(parseInt(e.target.value) || 3)}
                          className="w-16"
                          min={1}
                          max={10}
                        />
                        <span>сек</span>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="theme" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Тема приложения</h4>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'light' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Светлая
                    </Button>
                    <Button
                      variant={theme === 'dark' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Тёмная
                    </Button>
                    <Button
                      variant={theme === 'auto' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme('auto')}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      Авто
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Тема плеера</h4>
                  <div className="flex gap-2">
                    <Button
                      variant={playerTheme === 'glass' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPlayerTheme('glass')}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Стекло
                    </Button>
                    <Button
                      variant={playerTheme === 'minimal' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPlayerTheme('minimal')}
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Минимал
                    </Button>
                    <Button
                      variant={playerTheme === 'neon' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPlayerTheme('neon')}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Неон
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Создание плейлиста */}
      {showCreatePlaylist && (
        <Dialog open={showCreatePlaylist} onOpenChange={setShowCreatePlaylist}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать плейлист</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Название</label>
                <Input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Название плейлиста"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Описание</label>
                <Input
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Описание плейлиста"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()}>
                  Создать
                </Button>
                <Button variant="outline" onClick={() => setShowCreatePlaylist(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}