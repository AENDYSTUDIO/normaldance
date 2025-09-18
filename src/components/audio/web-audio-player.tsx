'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useAudioStore } from '@/store/use-audio-store'
import { audioOptimizer, AudioOptimizer } from '@/lib/audio-optimizer'
import { Button, Slider, Card, CardContent, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Shuffle,
  Repeat,
  Settings,
  Equalizer,
  Waves,
  BarChart3,
  Playlist,
  TrendingUp,
  List,
  X,
  Crown,
  Clock,
  Headphones,
  Music,
  Mic,
  Square,
  Triangle,
  Zap,
  CheckCircle,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Plus,
  Download,
  Save
} from '@/components/icons'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface WebAudioPlayerProps {
  className?: string
  enableVisualization?: boolean
  enableEffects?: boolean
  enableStreaming?: boolean
}

interface AudioEffects {
  gain: number
  bass: number
  mid: number
  treble: number
  reverb: number
  delay: number
}

interface VisualizationData {
  frequencyData: Uint8Array
  timeDomainData: Uint8Array
  waveform: number[]
  rms: number
  peak: number
}

export function WebAudioPlayer({
  className,
  enableVisualization = true,
  enableEffects = true,
  enableStreaming = true
}: WebAudioPlayerProps) {
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

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const analyserNodeRef = useRef<AnalyserNode | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const startTimeRef = useRef<number>(0)
  const pauseTimeRef = useRef<number>(0)

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [audioQuality, setAudioQuality] = useState('auto')
  const [effects, setEffects] = useState<AudioEffects>({
    gain: 1,
    bass: 0,
    mid: 0,
    treble: 0,
    reverb: 0,
    delay: 0
  })
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showEqualizer, setShowEqualizer] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Audio quality options
  const qualityOptions = [
    { id: 'auto', name: 'Auto', description: 'Adaptive quality' },
    { id: 'low', name: 'Low (128kbps)', description: 'Fast loading' },
    { id: 'medium', name: 'Medium (256kbps)', description: 'Balanced' },
    { id: 'high', name: 'High (320kbps)', description: 'High quality' },
    { id: 'lossless', name: 'Lossless (FLAC)', description: 'Best quality' }
  ]

  // Initialize Web Audio API
  const initializeAudioContext = useCallback(async () => {
    if (audioContextRef.current) return

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      // Create audio nodes
      gainNodeRef.current = audioContextRef.current.createGain()
      analyserNodeRef.current = audioContextRef.current.createAnalyser()
      
      // Configure analyser
      analyserNodeRef.current.fftSize = 2048
      analyserNodeRef.current.smoothingTimeConstant = 0.8

      // Connect nodes
      gainNodeRef.current.connect(analyserNodeRef.current)
      analyserNodeRef.current.connect(audioContextRef.current.destination)

      console.log('Web Audio API initialized')
    } catch (error) {
      console.error('Failed to initialize Web Audio API:', error)
      setError('Failed to initialize audio system')
    }
  }, [])

  // Load audio with optimization
  const loadAudio = useCallback(async (url: string) => {
    if (!audioContextRef.current) {
      await initializeAudioContext()
    }

    setIsLoading(true)
    setError(null)
    setLoadingProgress(0)

    try {
      const buffer = await audioOptimizer.loadAudio(url, {
        quality: audioQuality === 'auto' ? undefined : audioQuality,
        enableStreaming,
        onProgress: setLoadingProgress
      })

      audioBufferRef.current = buffer
      setLoadingProgress(100)
      
      // Update duration if not set
      if (duration === 0) {
        // This would need to be handled by the store
        console.log('Audio duration:', buffer.duration)
      }

      return buffer
    } catch (error) {
      console.error('Failed to load audio:', error)
      setError('Failed to load audio file')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [audioQuality, enableStreaming, duration, initializeAudioContext])

  // Play audio
  const playAudio = useCallback(async () => {
    if (!currentTrack || !audioContextRef.current || !audioBufferRef.current) return

    try {
      // Stop current playback
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop()
        sourceNodeRef.current.disconnect()
      }

      // Create new source node
      sourceNodeRef.current = audioContextRef.current.createBufferSource()
      sourceNodeRef.current.buffer = audioBufferRef.current

      // Connect to gain node
      sourceNodeRef.current.connect(gainNodeRef.current!)

      // Set volume
      gainNodeRef.current!.gain.value = isMuted ? 0 : volume / 100

      // Handle playback end
      sourceNodeRef.current.onended = () => {
        if (repeat === 'one') {
          playAudio()
        } else {
          playNext()
        }
      }

      // Start playback
      const offset = pauseTimeRef.current
      sourceNodeRef.current.start(0, offset)
      startTimeRef.current = audioContextRef.current.currentTime - offset

      console.log('Audio playback started')
    } catch (error) {
      console.error('Failed to play audio:', error)
      setError('Failed to play audio')
    }
  }, [currentTrack, isMuted, volume, repeat, playNext])

  // Pause audio
  const pauseAudio = useCallback(() => {
    if (sourceNodeRef.current && audioContextRef.current) {
      sourceNodeRef.current.stop()
      pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current
    }
  }, [])

  // Seek audio
  const seekAudio = useCallback((time: number) => {
    if (sourceNodeRef.current && audioContextRef.current) {
      pauseTimeRef.current = time
      
      if (isPlaying) {
        pauseAudio()
        setTimeout(() => playAudio(), 10)
      }
    }
  }, [isPlaying, pauseAudio, playAudio])

  // Update visualization
  const updateVisualization = useCallback(() => {
    if (!analyserNodeRef.current || !enableVisualization) return

    const frequencyData = new Uint8Array(analyserNodeRef.current.frequencyBinCount)
    const timeDomainData = new Uint8Array(analyserNodeRef.current.frequencyBinCount)
    
    analyserNodeRef.current.getByteFrequencyData(frequencyData)
    analyserNodeRef.current.getByteTimeDomainData(timeDomainData)

    // Calculate RMS and peak
    let rms = 0
    let peak = 0
    
    for (let i = 0; i < timeDomainData.length; i++) {
      const value = (timeDomainData[i] - 128) / 128
      rms += value * value
      peak = Math.max(peak, Math.abs(value))
    }
    
    rms = Math.sqrt(rms / timeDomainData.length)

    // Create waveform data
    const waveform: number[] = []
    for (let i = 0; i < timeDomainData.length; i += 4) {
      const sum = timeDomainData.slice(i, i + 4).reduce((a, b) => a + b, 0)
      waveform.push(sum / 4)
    }

    setVisualizationData({
      frequencyData,
      timeDomainData,
      waveform,
      rms,
      peak
    })
  }, [enableVisualization])

  // Apply audio effects
  const applyEffects = useCallback(() => {
    if (!gainNodeRef.current) return

    // Apply gain
    gainNodeRef.current.gain.value = (isMuted ? 0 : volume / 100) * effects.gain

    // Apply EQ (simplified - in real implementation, use proper EQ nodes)
    // This would require additional audio nodes for proper EQ implementation
  }, [isMuted, volume, effects])

  // Effects
  useEffect(() => {
    applyEffects()
  }, [applyEffects])

  // Visualization animation
  useEffect(() => {
    if (!enableVisualization) return

    const animate = () => {
      updateVisualization()
      requestAnimationFrame(animate)
    }

    animate()
  }, [enableVisualization, updateVisualization])

  // Load audio when track changes
  useEffect(() => {
    if (currentTrack) {
      loadAudio(currentTrack.audioUrl)
    }
  }, [currentTrack, loadAudio])

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      playAudio()
    } else {
      pauseAudio()
    }
  }, [isPlaying, playAudio, pauseAudio])

  // Handle volume changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop()
        sourceNodeRef.current.disconnect()
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Event handlers
  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const handleSeek = (value: number[]) => {
    const time = (value[0] / 100) * duration
    seekTo(time)
    seekAudio(time)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const handleQualityChange = (quality: string) => {
    setAudioQuality(quality)
    if (currentTrack) {
      loadAudio(currentTrack.audioUrl)
    }
  }

  const handleEffectChange = (effect: keyof AudioEffects, value: number) => {
    setEffects(prev => ({ ...prev, [effect]: value }))
  }

  if (!currentTrack) {
    return null
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Loading Progress */}
      {isLoading && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Loading audio...</span>
            <span>{Math.round(loadingProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Player */}
      <Card>
        <CardContent className="p-6">
          {/* Track Info */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0">
              <img
                src={currentTrack.coverImage || '/placeholder-album.jpg'}
                alt={currentTrack.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {currentTrack.title}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {currentTrack.artist}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {audioQuality === 'auto' ? 'Auto' : qualityOptions.find(q => q.id === audioQuality)?.name}
                </Badge>
                {visualizationData && (
                  <Badge variant="outline" className="text-xs">
                    RMS: {visualizationData.rms.toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleShuffle}
                className={cn(shuffle && 'text-blue-600')}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={playPrevious}>
                <SkipBack className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="lg"
              onClick={handlePlayPause}
              disabled={isLoading}
              className="w-12 h-12 rounded-full"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={playNext}>
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRepeat(repeat === 'all' ? 'one' : repeat === 'one' ? 'none' : 'all')}
                className={cn(repeat !== 'none' && 'text-blue-600')}
              >
                <Repeat className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Volume and Settings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="w-24">
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={audioQuality} onValueChange={handleQualityChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualityOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {enableEffects && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEqualizer(!showEqualizer)}
                >
                  <Equalizer className="h-4 w-4" />
                </Button>
              )}

              {enableVisualization && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVisualization(!showVisualization)}
                >
                  <Waves className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equalizer */}
      {showEqualizer && enableEffects && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-4">Audio Effects</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-600">Gain</label>
                <Slider
                  value={[effects.gain]}
                  onValueChange={(value) => handleEffectChange('gain', value[0])}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Bass</label>
                <Slider
                  value={[effects.bass]}
                  onValueChange={(value) => handleEffectChange('bass', value[0])}
                  min={-20}
                  max={20}
                  step={1}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Treble</label>
                <Slider
                  value={[effects.treble]}
                  onValueChange={(value) => handleEffectChange('treble', value[0])}
                  min={-20}
                  max={20}
                  step={1}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visualization */}
      {showVisualization && enableVisualization && visualizationData && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-4">Audio Visualization</h4>
            <div className="h-32 bg-gray-900 rounded-lg p-4">
              <div className="flex items-end justify-between h-full">
                {visualizationData.frequencyData.slice(0, 64).map((value, index) => (
                  <div
                    key={index}
                    className="bg-blue-500 rounded-t"
                    style={{
                      width: '2px',
                      height: `${(value / 255) * 100}%`,
                      minHeight: '1px'
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Peak: {visualizationData.peak.toFixed(2)} | RMS: {visualizationData.rms.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
