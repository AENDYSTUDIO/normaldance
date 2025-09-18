/**
 * Advanced Audio Optimizer with Web Audio API
 * Provides intelligent audio loading, caching, and streaming
 */

import { AudioBuffer, AudioContext, GainNode, AnalyserNode, AudioBufferSourceNode } from 'web-audio-api'

interface AudioOptimizerConfig {
  maxCacheSize: number // MB
  preloadThreshold: number // seconds
  qualityLevels: AudioQuality[]
  enableStreaming: boolean
  enableCompression: boolean
  enableVisualization: boolean
}

interface AudioQuality {
  id: string
  name: string
  bitrate: number
  sampleRate: number
  extension: string
  priority: number
}

interface AudioCache {
  buffer: AudioBuffer
  url: string
  quality: string
  size: number
  lastAccessed: number
  accessCount: number
}

interface StreamingOptions {
  chunkSize: number // bytes
  bufferSize: number // seconds
  enableAdaptiveBitrate: boolean
  fallbackQuality: string
}

class AudioOptimizer {
  private audioContext: AudioContext | null = null
  private cache: Map<string, AudioCache> = new Map()
  private cacheSize: number = 0
  private config: AudioOptimizerConfig
  private streamingOptions: StreamingOptions
  private networkMonitor: NetworkMonitor
  private compressionWorker: Worker | null = null

  constructor(config?: Partial<AudioOptimizerConfig>) {
    this.config = {
      maxCacheSize: 100, // 100MB
      preloadThreshold: 30, // 30 seconds
      qualityLevels: [
        { id: 'low', name: 'Low (128kbps)', bitrate: 128, sampleRate: 44100, extension: 'mp3', priority: 1 },
        { id: 'medium', name: 'Medium (256kbps)', bitrate: 256, sampleRate: 44100, extension: 'mp3', priority: 2 },
        { id: 'high', name: 'High (320kbps)', bitrate: 320, sampleRate: 44100, extension: 'mp3', priority: 3 },
        { id: 'lossless', name: 'Lossless (FLAC)', bitrate: 1411, sampleRate: 44100, extension: 'flac', priority: 4 }
      ],
      enableStreaming: true,
      enableCompression: true,
      enableVisualization: true
    }

    this.streamingOptions = {
      chunkSize: 64 * 1024, // 64KB chunks
      bufferSize: 10, // 10 seconds buffer
      enableAdaptiveBitrate: true,
      fallbackQuality: 'medium'
    }

    this.networkMonitor = new NetworkMonitor()
    this.initializeAudioContext()
    this.initializeCompressionWorker()
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Handle context state changes
      this.audioContext.addEventListener('statechange', () => {
        console.log('Audio context state:', this.audioContext?.state)
      })
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
    }
  }

  private initializeCompressionWorker(): void {
    if (this.config.enableCompression && typeof Worker !== 'undefined') {
      try {
        this.compressionWorker = new Worker('/workers/audio-compression.worker.js')
        this.compressionWorker.onmessage = this.handleCompressionMessage.bind(this)
        this.compressionWorker.onerror = (error) => {
          console.error('Compression worker error:', error)
        }
      } catch (error) {
        console.warn('Failed to initialize compression worker:', error)
      }
    }
  }

  private handleCompressionMessage(event: MessageEvent): void {
    const { type, data } = event.data
    
    switch (type) {
      case 'compression-complete':
        this.handleCompressedAudio(data)
        break
      case 'compression-error':
        console.error('Audio compression error:', data)
        break
    }
  }

  private handleCompressedAudio(data: any): void {
    // Handle compressed audio data
    console.log('Audio compressed:', data)
  }

  /**
   * Intelligent audio loading with quality adaptation
   */
  async loadAudio(url: string, options: {
    quality?: string
    enableStreaming?: boolean
    preload?: boolean
    onProgress?: (progress: number) => void
  } = {}): Promise<AudioBuffer> {
    const { quality, enableStreaming = true, preload = false, onProgress } = options

    // Check cache first
    const cacheKey = this.getCacheKey(url, quality)
    const cached = this.cache.get(cacheKey)
    if (cached) {
      cached.lastAccessed = Date.now()
      cached.accessCount++
      return cached.buffer
    }

    // Determine optimal quality
    const optimalQuality = quality || this.getOptimalQuality()
    const audioUrl = this.getQualityUrl(url, optimalQuality)

    try {
      let buffer: AudioBuffer

      if (enableStreaming && this.config.enableStreaming) {
        buffer = await this.loadAudioStreaming(audioUrl, onProgress)
      } else {
        buffer = await this.loadAudioDirect(audioUrl, onProgress)
      }

      // Cache the buffer
      this.cacheAudio(cacheKey, buffer, audioUrl, optimalQuality)

      return buffer
    } catch (error) {
      console.error('Failed to load audio:', error)
      
      // Fallback to lower quality
      if (optimalQuality !== 'low') {
        return this.loadAudio(url, { ...options, quality: 'low' })
      }
      
      throw error
    }
  }

  private async loadAudioDirect(url: string, onProgress?: (progress: number) => void): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized')
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
    
    return audioBuffer
  }

  private async loadAudioStreaming(url: string, onProgress?: (progress: number) => void): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized')
    }

    const response = await fetch(url, {
      headers: {
        'Range': 'bytes=0-'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch audio stream: ${response.statusText}`)
    }

    const contentLength = parseInt(response.headers.get('content-length') || '0')
    const reader = response.body?.getReader()
    
    if (!reader) {
      throw new Error('Stream not supported')
    }

    const chunks: Uint8Array[] = []
    let receivedLength = 0

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      chunks.push(value)
      receivedLength += value.length
      
      if (onProgress && contentLength > 0) {
        onProgress((receivedLength / contentLength) * 100)
      }
    }

    const audioData = new Uint8Array(receivedLength)
    let position = 0
    
    for (const chunk of chunks) {
      audioData.set(chunk, position)
      position += chunk.length
    }

    const audioBuffer = await this.audioContext.decodeAudioData(audioData.buffer)
    return audioBuffer
  }

  private getOptimalQuality(): string {
    const connection = this.networkMonitor.getConnection()
    
    if (!connection) {
      return this.streamingOptions.fallbackQuality
    }

    // Adaptive quality based on connection
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return 'low'
    } else if (connection.effectiveType === '3g') {
      return 'medium'
    } else if (connection.effectiveType === '4g') {
      return 'high'
    } else {
      return 'lossless'
    }
  }

  private getQualityUrl(url: string, quality: string): string {
    const qualityConfig = this.config.qualityLevels.find(q => q.id === quality)
    if (!qualityConfig) {
      return url
    }

    // Replace or append quality suffix
    const urlParts = url.split('.')
    const extension = urlParts.pop()
    const baseUrl = urlParts.join('.')
    
    return `${baseUrl}_${quality}.${extension}`
  }

  private getCacheKey(url: string, quality?: string): string {
    return `${url}_${quality || 'default'}`
  }

  private cacheAudio(key: string, buffer: AudioBuffer, url: string, quality: string): void {
    const size = buffer.length * buffer.numberOfChannels * 4 // Approximate size in bytes
    const cacheEntry: AudioCache = {
      buffer,
      url,
      quality,
      size,
      lastAccessed: Date.now(),
      accessCount: 1
    }

    this.cache.set(key, cacheEntry)
    this.cacheSize += size

    // Cleanup cache if size limit exceeded
    this.cleanupCache()
  }

  private cleanupCache(): void {
    const maxSizeBytes = this.config.maxCacheSize * 1024 * 1024
    
    if (this.cacheSize <= maxSizeBytes) {
      return
    }

    // Sort by access count and last accessed time
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => {
        const scoreA = a.accessCount / (Date.now() - a.lastAccessed)
        const scoreB = b.accessCount / (Date.now() - b.lastAccessed)
        return scoreA - scoreB
      })

    // Remove least used entries
    let removedSize = 0
    for (const [key, entry] of entries) {
      if (this.cacheSize - removedSize <= maxSizeBytes * 0.8) {
        break
      }
      
      this.cache.delete(key)
      removedSize += entry.size
    }

    this.cacheSize -= removedSize
  }

  /**
   * Preload audio for smooth playback
   */
  async preloadAudio(urls: string[], quality?: string): Promise<void> {
    const preloadPromises = urls.map(url => 
      this.loadAudio(url, { quality, preload: true })
        .catch(error => {
          console.warn(`Failed to preload ${url}:`, error)
        })
    )

    await Promise.allSettled(preloadPromises)
  }

  /**
   * Create audio source node with effects
   */
  createAudioSource(buffer: AudioBuffer): {
    source: AudioBufferSourceNode
    gainNode: GainNode
    analyserNode: AnalyserNode
  } {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized')
    }

    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()
    const analyserNode = this.audioContext.createAnalyser()

    source.buffer = buffer
    source.connect(gainNode)
    gainNode.connect(analyserNode)
    analyserNode.connect(this.audioContext.destination)

    return { source, gainNode, analyserNode }
  }

  /**
   * Get audio analysis data for visualization
   */
  getAudioAnalysis(analyserNode: AnalyserNode): {
    frequencyData: Uint8Array
    timeDomainData: Uint8Array
    waveform: number[]
  } {
    const bufferLength = analyserNode.frequencyBinCount
    const frequencyData = new Uint8Array(bufferLength)
    const timeDomainData = new Uint8Array(bufferLength)
    
    analyserNode.getByteFrequencyData(frequencyData)
    analyserNode.getByteTimeDomainData(timeDomainData)

    // Create waveform data
    const waveform: number[] = []
    for (let i = 0; i < bufferLength; i += 4) {
      const sum = timeDomainData.slice(i, i + 4).reduce((a, b) => a + b, 0)
      waveform.push(sum / 4)
    }

    return { frequencyData, timeDomainData, waveform }
  }

  /**
   * Compress audio for storage
   */
  async compressAudio(buffer: AudioBuffer, quality: number = 0.8): Promise<ArrayBuffer> {
    if (!this.compressionWorker) {
      throw new Error('Compression worker not available')
    }

    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'compression-complete') {
          this.compressionWorker?.removeEventListener('message', messageHandler)
          resolve(event.data.data)
        } else if (event.data.type === 'compression-error') {
          this.compressionWorker?.removeEventListener('message', messageHandler)
          reject(new Error(event.data.error))
        }
      }

      this.compressionWorker?.addEventListener('message', messageHandler)
      
      this.compressionWorker?.postMessage({
        type: 'compress',
        data: {
          buffer: buffer.getChannelData(0),
          sampleRate: buffer.sampleRate,
          quality
        }
      })
    })
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number
    entries: number
    hitRate: number
  } {
    const totalAccesses = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0)
    
    const cacheHits = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount - 1, 0) // -1 because first access is not a hit

    return {
      size: this.cacheSize,
      entries: this.cache.size,
      hitRate: totalAccesses > 0 ? cacheHits / totalAccesses : 0
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
    this.cacheSize = 0
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.clearCache()
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    
    if (this.compressionWorker) {
      this.compressionWorker.terminate()
      this.compressionWorker = null
    }
  }
}

/**
 * Network monitoring for adaptive quality
 */
class NetworkMonitor {
  private connection: any = null

  constructor() {
    if ('connection' in navigator) {
      this.connection = (navigator as any).connection
    }
  }

  getConnection(): any {
    return this.connection
  }

  getEffectiveType(): string {
    return this.connection?.effectiveType || '4g'
  }

  getDownlink(): number {
    return this.connection?.downlink || 10
  }

  isSlowConnection(): boolean {
    const effectiveType = this.getEffectiveType()
    return effectiveType === 'slow-2g' || effectiveType === '2g'
  }
}

// Export singleton instance
export const audioOptimizer = new AudioOptimizer()

// Export classes for custom instances
export { AudioOptimizer, NetworkMonitor }
export type { AudioOptimizerConfig, AudioQuality, AudioCache, StreamingOptions }
