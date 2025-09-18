import { useState, useRef, useCallback, useEffect } from 'react'
import { audioOptimizer, AudioOptimizer } from '@/lib/audio-optimizer'

interface UseOptimizedAudioOptions {
  enableStreaming?: boolean
  enablePreloading?: boolean
  enableCaching?: boolean
  quality?: string
  onProgress?: (progress: number) => void
  onError?: (error: Error) => void
  onLoadComplete?: (buffer: AudioBuffer) => void
}

interface UseOptimizedAudioReturn {
  // Loading state
  isLoading: boolean
  loadingProgress: number
  error: string | null
  
  // Audio data
  audioBuffer: AudioBuffer | null
  duration: number
  
  // Actions
  loadAudio: (url: string) => Promise<void>
  preloadAudio: (urls: string[]) => Promise<void>
  clearCache: () => void
  
  // Cache stats
  cacheStats: {
    size: number
    entries: number
    hitRate: number
  }
  
  // Quality management
  setQuality: (quality: string) => void
  getOptimalQuality: () => string
  
  // Network info
  networkInfo: {
    effectiveType: string
    downlink: number
    isSlowConnection: boolean
  }
}

export function useOptimizedAudio(options: UseOptimizedAudioOptions = {}): UseOptimizedAudioReturn {
  const {
    enableStreaming = true,
    enablePreloading = true,
    enableCaching = true,
    quality,
    onProgress,
    onError,
    onLoadComplete
  } = options

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentQuality, setCurrentQuality] = useState(quality || 'auto')

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load audio with optimization
  const loadAudio = useCallback(async (url: string) => {
    if (!enableCaching) {
      // If caching is disabled, create a new optimizer instance
      const tempOptimizer = new AudioOptimizer({ enableStreaming, enableCompression: false })
      try {
        const buffer = await tempOptimizer.loadAudio(url, { quality: currentQuality })
        setAudioBuffer(buffer)
        setDuration(buffer.duration)
        onLoadComplete?.(buffer)
        tempOptimizer.dispose()
        return
      } catch (err) {
        onError?.(err as Error)
        tempOptimizer.dispose()
        throw err
      }
    }

    setIsLoading(true)
    setError(null)
    setLoadingProgress(0)

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const buffer = await audioOptimizer.loadAudio(url, {
        quality: currentQuality === 'auto' ? undefined : currentQuality,
        enableStreaming,
        onProgress: (progress) => {
          setLoadingProgress(progress)
          onProgress?.(progress)
        }
      })

      if (!abortControllerRef.current.signal.aborted) {
        setAudioBuffer(buffer)
        setDuration(buffer.duration)
        setLoadingProgress(100)
        onLoadComplete?.(buffer)
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load audio'
        setError(errorMessage)
        onError?.(err as Error)
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [enableCaching, enableStreaming, currentQuality, onProgress, onError, onLoadComplete])

  // Preload multiple audio files
  const preloadAudio = useCallback(async (urls: string[]) => {
    if (!enablePreloading) return

    try {
      await audioOptimizer.preloadAudio(urls, currentQuality === 'auto' ? undefined : currentQuality)
    } catch (err) {
      console.warn('Failed to preload some audio files:', err)
    }
  }, [enablePreloading, currentQuality])

  // Clear cache
  const clearCache = useCallback(() => {
    audioOptimizer.clearCache()
  }, [])

  // Set quality
  const setQuality = useCallback((newQuality: string) => {
    setCurrentQuality(newQuality)
  }, [])

  // Get optimal quality based on network
  const getOptimalQuality = useCallback(() => {
    // This would use the network monitor from audioOptimizer
    return 'auto' // Simplified for now
  }, [])

  // Get cache statistics
  const cacheStats = audioOptimizer.getCacheStats()

  // Network information (simplified)
  const networkInfo = {
    effectiveType: '4g', // Would get from network monitor
    downlink: 10, // Would get from network monitor
    isSlowConnection: false // Would get from network monitor
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    // Loading state
    isLoading,
    loadingProgress,
    error,
    
    // Audio data
    audioBuffer,
    duration,
    
    // Actions
    loadAudio,
    preloadAudio,
    clearCache,
    
    // Cache stats
    cacheStats,
    
    // Quality management
    setQuality,
    getOptimalQuality,
    
    // Network info
    networkInfo
  }
}

// Hook for audio visualization
export function useAudioVisualization(audioBuffer: AudioBuffer | null) {
  const [visualizationData, setVisualizationData] = useState<{
    frequencyData: Uint8Array
    timeDomainData: Uint8Array
    waveform: number[]
    rms: number
    peak: number
  } | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserNodeRef = useRef<AnalyserNode | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)

  // Initialize audio context and analyser
  const initializeAudioContext = useCallback(async () => {
    if (audioContextRef.current) return

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      analyserNodeRef.current = audioContextRef.current.createAnalyser()
      analyserNodeRef.current.fftSize = 2048
      analyserNodeRef.current.smoothingTimeConstant = 0.8
    } catch (error) {
      console.error('Failed to initialize audio context for visualization:', error)
    }
  }, [])

  // Analyze audio buffer
  const analyzeAudio = useCallback(async () => {
    if (!audioBuffer || !audioContextRef.current || !analyserNodeRef.current) return

    try {
      // Create source node
      sourceNodeRef.current = audioContextRef.current.createBufferSource()
      sourceNodeRef.current.buffer = audioBuffer
      sourceNodeRef.current.connect(analyserNodeRef.current)

      // Get analysis data
      const bufferLength = analyserNodeRef.current.frequencyBinCount
      const frequencyData = new Uint8Array(bufferLength)
      const timeDomainData = new Uint8Array(bufferLength)
      
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
    } catch (error) {
      console.error('Failed to analyze audio:', error)
    }
  }, [audioBuffer])

  // Initialize and analyze when audio buffer changes
  useEffect(() => {
    if (audioBuffer) {
      initializeAudioContext().then(() => {
        analyzeAudio()
      })
    }
  }, [audioBuffer, initializeAudioContext, analyzeAudio])

  // Cleanup
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    visualizationData,
    analyzeAudio
  }
}

// Hook for audio effects
export function useAudioEffects() {
  const [effects, setEffects] = useState({
    gain: 1,
    bass: 0,
    mid: 0,
    treble: 0,
    reverb: 0,
    delay: 0
  })

  const updateEffect = useCallback((effect: string, value: number) => {
    setEffects(prev => ({ ...prev, [effect]: value }))
  }, [])

  const resetEffects = useCallback(() => {
    setEffects({
      gain: 1,
      bass: 0,
      mid: 0,
      treble: 0,
      reverb: 0,
      delay: 0
    })
  }, [])

  return {
    effects,
    updateEffect,
    resetEffects
  }
}
