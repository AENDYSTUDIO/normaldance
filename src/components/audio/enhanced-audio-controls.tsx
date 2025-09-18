'use client'

import { memo, useCallback, useMemo } from 'react'
import { Button, Slider } from '@/components/ui'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat } from '@/components/icons'
import { cn } from '@/lib/utils'

interface EnhancedAudioControlsProps {
  isPlaying: boolean
  volume: number
  isMuted: boolean
  shuffle: boolean
  repeat: 'off' | 'all' | 'one'
  onPlay: () => void
  onPause: () => void
  onPrevious: () => void
  onNext: () => void
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
  onToggleShuffle: () => void
  onRepeatChange: () => void
  className?: string
}

export const EnhancedAudioControls = memo(function EnhancedAudioControls({
  isPlaying,
  volume,
  isMuted,
  shuffle,
  repeat,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onRepeatChange,
  className
}: EnhancedAudioControlsProps) {
  const handleVolumeChange = useCallback((value: number[]) => {
    onVolumeChange(value[0])
  }, [onVolumeChange])

  const playPauseButton = useMemo(() => (
    <Button
      size="sm"
      onClick={isPlaying ? onPause : onPlay}
      className="h-8 w-8"
    >
      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
    </Button>
  ), [isPlaying, onPlay, onPause])

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleShuffle}
        className={cn(shuffle && 'text-primary')}
      >
        <Shuffle className="h-4 w-4" />
      </Button>
      
      <Button variant="ghost" size="sm" onClick={onPrevious}>
        <SkipBack className="h-4 w-4" />
      </Button>
      
      {playPauseButton}
      
      <Button variant="ghost" size="sm" onClick={onNext}>
        <SkipForward className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRepeatChange}
        className={cn(repeat !== 'off' && 'text-primary')}
      >
        <Repeat className={cn('h-4 w-4', repeat === 'one' && 'rotate-180')} />
      </Button>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={onToggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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
  )
})