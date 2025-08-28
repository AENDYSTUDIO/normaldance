'use client'

import { useState, useRef, useEffect } from 'react'
import { useAudioStore } from '@/store/use-audio-store'
import useNetworkStatus from '@/hooks/useNetworkStatus' // Импортируем хук
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  Headphones
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { AudioVisualizer } from './audio-visualizer'
import { PlaylistManager } from './playlist-manager'

export function AudioPlayer() {
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
    clearQueue
  } = useAudioStore()

  const audioRef = useRef<HTMLAudioElement>(null)
  const { effectiveType } = useNetworkStatus() // Используем хук
  const [isLiked, setIsLiked] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [showVisualizer, setShowVisualizer] = useState(true)
  const [showPlaylistManager, setShowPlaylistManager] = useState(false)
  const [showStats, setShowStats] = useState(false)

  // Адаптивный URL для аудио
  const audioSrc = (() => {
    if (!currentTrack) return ''
    const useLowQualityAudio = effectiveType === 'slow-2g' || effectiveType === '2g';
    if (useLowQualityAudio) {
      // ПРЕДПОЛОЖЕНИЕ: URL для аудио низкого качества можно получить, добавив '_low' к имени файла.
      // Например: /audio/track.mp3 -> /audio/track_low.mp3
      const parts = currentTrack.audioUrl.split('.');
      const extension = parts.pop();
      return `${parts.join('.')}_low.${extension}`;
    }
    return currentTrack.audioUrl;
  })();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentTrack]) // Добавим currentTrack в зависимости, чтобы плеер реагировал на смену трека

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime
      seekTo(time)
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

  const formatQueueTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!currentTrack) {
    return null
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc} // Используем адаптированный URL
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
        crossOrigin="anonymous" // Для визуализатора
      />
      
      {/* Main player */}
      <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-none border-t">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Track info */}
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
              </div>
            </div>

            {/* Player controls */}
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
                  size="sm"
                  onClick={() => isPlaying ? pause() : play(currentTrack)} // Исправлено
                  className="h-8 w-8"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={playNext}>
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}
                  className={cn(repeat !== 'off' && 'text-primary')}
                >
                  <Repeat className={cn(
                    'h-4 w-4',
                    repeat === 'one' && 'rotate-180'
                  )} />
                </Button>
              </div>
              
              {/* Progress bar */}
              <div className="flex items-center space-x-2 w-full max-w-md">
                <span className="text-xs text-muted-foreground">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  className="flex-1"
                  onValueChange={handleSeek}
                />
                <span className="text-xs text-muted-foreground">
                  {formatTime(duration || 0)}
                </span>
              </div>
            </div>

            {/* Enhanced controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleLike(currentTrack.id)}
              >
                <Heart className={cn(
                  'h-4 w-4',
                  isLiked ? 'fill-red-500 text-red-500' : ''
                )} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
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
                onClick={() => setShowVisualizer(!showVisualizer)}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlaylistManager(!showPlaylistManager)}
              >
                <Music className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(!showStats)}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  className="w-20"
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio visualizer */}
      {showVisualizer && audioRef.current && (
        <div className="fixed bottom-20 left-4 right-4 z-40 bg-card border rounded-lg p-2">
          <AudioVisualizer
            audioElement={audioRef.current}
            isPlaying={isPlaying}
            type="bars"
          />
        </div>
      )}

      {/* Playlist manager */}
      {showPlaylistManager && (
        <div className="fixed bottom-20 left-4 right-4 z-40 bg-card border rounded-lg p-4 max-h-96 overflow-y-auto">
          <PlaylistManager />
        </div>
      )}

      {/* Track stats */}
      {showStats && (
        <div className="fixed bottom-20 left-4 right-4 z-40 bg-card border rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Headphones className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{formatNumber(currentTrack.playCount)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Прослушиваний</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{formatNumber(currentTrack.likeCount)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Лайков</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{formatTime(currentTrack.duration)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Длительность</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Жанр: {currentTrack.genre}</span>
              {currentTrack.isExplicit && (
                <Badge variant="secondary" className="text-xs">
                  18+
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Queue drawer */}
      {showQueue && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-card border-t">
          <Card className="h-64">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Очередь воспроизведения</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {queue.length} треков
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearQueue}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {queue.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Очередь пуста</p>
                    </div>
                  </div>
                ) : (
                  queue.map((track, index) => (
                    <div
                      key={track.id}
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-accent",
                        index === currentQueueIndex && "bg-accent"
                      )}
                      onClick={() => handleQueueItemClick(track, index)}
                    >
                      <div className="flex items-center space-x-2">
                        {index === currentQueueIndex ? (
                          <Play className="h-3 w-3 text-primary" />
                        ) : (
                          <span className="text-xs text-muted-foreground w-4">
                            {index + 1}
                          </span>
                        )}
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={track.coverImage} />
                          <AvatarFallback className="text-xs">
                            {track.title.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {track.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {track.artistName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatQueueTime(track.duration)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromQueue(index)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}