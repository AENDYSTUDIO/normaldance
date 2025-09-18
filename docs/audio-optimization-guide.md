# Audio Optimization Guide

## Overview

This guide covers the advanced audio optimization system implemented in NORMALDANCE, which provides intelligent audio loading, caching, streaming, and Web Audio API integration.

## Features

### 1. Intelligent Audio Loading
- **Adaptive Quality**: Automatically adjusts audio quality based on network conditions
- **Streaming Support**: Loads audio in chunks for faster initial playback
- **Format Support**: Supports MP3, WAV, FLAC, and other formats
- **Fallback System**: Automatically falls back to lower quality on errors

### 2. Advanced Caching System
- **LRU Cache**: Least Recently Used cache with configurable size limits
- **Memory Management**: Automatic cleanup when cache size exceeds limits
- **Hit Rate Tracking**: Monitors cache performance and hit rates
- **Persistent Storage**: Optional persistent caching using IndexedDB

### 3. Web Audio API Integration
- **Real-time Processing**: Advanced audio effects and processing
- **Visualization**: Real-time audio visualization and analysis
- **Effects Chain**: EQ, reverb, delay, and other audio effects
- **Low Latency**: Optimized for minimal audio latency

### 4. Network Optimization
- **Connection Monitoring**: Monitors network speed and adjusts accordingly
- **Preloading**: Intelligently preloads upcoming tracks
- **Compression**: Optional audio compression for storage optimization
- **CDN Integration**: Automatic CDN fallback for better performance

## Usage

### Basic Audio Loading

```typescript
import { audioOptimizer } from '@/lib/audio-optimizer'

// Load audio with automatic quality selection
const buffer = await audioOptimizer.loadAudio('https://example.com/track.mp3')

// Load with specific quality
const buffer = await audioOptimizer.loadAudio('https://example.com/track.mp3', {
  quality: 'high',
  enableStreaming: true,
  onProgress: (progress) => console.log(`Loading: ${progress}%`)
})
```

### Using the Optimized Audio Hook

```typescript
import { useOptimizedAudio } from '@/hooks/useOptimizedAudio'

function AudioComponent() {
  const {
    isLoading,
    loadingProgress,
    audioBuffer,
    duration,
    loadAudio,
    cacheStats
  } = useOptimizedAudio({
    enableStreaming: true,
    quality: 'auto',
    onProgress: (progress) => setProgress(progress),
    onError: (error) => console.error('Audio error:', error)
  })

  const handleLoadTrack = async (url: string) => {
    await loadAudio(url)
  }

  return (
    <div>
      {isLoading && <div>Loading: {loadingProgress}%</div>}
      {audioBuffer && <div>Duration: {duration}s</div>}
      <div>Cache: {cacheStats.entries} entries, {cacheStats.hitRate}% hit rate</div>
    </div>
  )
}
```

### Web Audio Player Component

```typescript
import { WebAudioPlayer } from '@/components/audio/web-audio-player'

function PlayerPage() {
  return (
    <WebAudioPlayer
      enableVisualization={true}
      enableEffects={true}
      enableStreaming={true}
    />
  )
}
```

## Configuration

### Audio Optimizer Configuration

```typescript
import { AudioOptimizer } from '@/lib/audio-optimizer'

const optimizer = new AudioOptimizer({
  maxCacheSize: 200, // 200MB cache limit
  preloadThreshold: 30, // Preload 30 seconds ahead
  qualityLevels: [
    { id: 'low', name: 'Low (128kbps)', bitrate: 128, sampleRate: 44100, extension: 'mp3', priority: 1 },
    { id: 'medium', name: 'Medium (256kbps)', bitrate: 256, sampleRate: 44100, extension: 'mp3', priority: 2 },
    { id: 'high', name: 'High (320kbps)', bitrate: 320, sampleRate: 44100, extension: 'mp3', priority: 3 },
    { id: 'lossless', name: 'Lossless (FLAC)', bitrate: 1411, sampleRate: 44100, extension: 'flac', priority: 4 }
  ],
  enableStreaming: true,
  enableCompression: true,
  enableVisualization: true
})
```

### Quality Selection Algorithm

The system automatically selects audio quality based on:

1. **Network Speed**: 2G/3G/4G detection
2. **Connection Type**: WiFi vs mobile data
3. **User Preference**: Manual quality selection
4. **Device Capabilities**: Browser support for formats
5. **Battery Level**: Lower quality on low battery (mobile)

### Streaming Configuration

```typescript
const streamingOptions = {
  chunkSize: 64 * 1024, // 64KB chunks
  bufferSize: 10, // 10 seconds buffer
  enableAdaptiveBitrate: true,
  fallbackQuality: 'medium'
}
```

## Performance Optimization

### 1. Memory Management
- Automatic cache cleanup when memory limits are reached
- Efficient buffer management for large audio files
- Proper disposal of Web Audio API resources

### 2. Network Optimization
- Intelligent preloading based on user behavior
- Adaptive quality based on network conditions
- CDN fallback for better global performance

### 3. CPU Optimization
- Web Workers for audio processing
- Efficient visualization algorithms
- Optimized audio analysis

## Audio Effects

### Available Effects
- **Gain**: Volume control
- **EQ**: Bass, Mid, Treble adjustment
- **Reverb**: Spatial audio effects
- **Delay**: Echo effects
- **Compression**: Dynamic range compression

### Effect Chain
```typescript
// Create audio source with effects
const { source, gainNode, analyserNode } = audioOptimizer.createAudioSource(buffer)

// Apply effects
gainNode.gain.value = 0.8 // 80% volume
// Additional effect nodes would be connected here
```

## Visualization

### Real-time Audio Analysis
- **Frequency Data**: FFT analysis for spectrum visualization
- **Time Domain**: Waveform visualization
- **RMS**: Root Mean Square for volume levels
- **Peak Detection**: Peak amplitude tracking

### Visualization Components
```typescript
import { useAudioVisualization } from '@/hooks/useOptimizedAudio'

function Visualizer({ audioBuffer }) {
  const { visualizationData } = useAudioVisualization(audioBuffer)
  
  return (
    <div className="visualizer">
      {visualizationData?.frequencyData.map((value, index) => (
        <div 
          key={index}
          style={{ height: `${(value / 255) * 100}%` }}
        />
      ))}
    </div>
  )
}
```

## Testing

### Running Audio Tests
```bash
# Run Web3 and audio tests
npm run test:web3

# Run specific audio tests
npm test -- tests/audio/

# Run with coverage
npm run test:coverage
```

### Test Coverage
- Audio loading and caching
- Quality adaptation
- Streaming functionality
- Web Audio API integration
- Error handling and fallbacks
- Performance benchmarks

## Troubleshooting

### Common Issues

1. **Audio Context Suspended**
   ```typescript
   // Resume audio context
   if (audioContext.state === 'suspended') {
     await audioContext.resume()
   }
   ```

2. **Memory Issues**
   ```typescript
   // Clear cache
   audioOptimizer.clearCache()
   
   // Check cache stats
   const stats = audioOptimizer.getCacheStats()
   console.log('Cache size:', stats.size, 'MB')
   ```

3. **Network Issues**
   ```typescript
   // Check network status
   const connection = navigator.connection
   console.log('Network type:', connection.effectiveType)
   ```

### Performance Monitoring

```typescript
// Monitor cache performance
setInterval(() => {
  const stats = audioOptimizer.getCacheStats()
  console.log(`Cache: ${stats.entries} entries, ${stats.hitRate}% hit rate`)
}, 30000)
```

## Best Practices

1. **Preload Important Tracks**: Preload tracks that are likely to be played next
2. **Monitor Cache Performance**: Regularly check cache hit rates and adjust size limits
3. **Use Appropriate Quality**: Don't always use highest quality - consider network conditions
4. **Clean Up Resources**: Properly dispose of audio contexts and buffers
5. **Handle Errors Gracefully**: Always provide fallbacks for audio loading failures

## Future Enhancements

- **Spatial Audio**: 3D audio positioning
- **AI-Powered Quality**: Machine learning for optimal quality selection
- **Advanced Compression**: Better compression algorithms
- **Offline Support**: Service worker integration for offline playback
- **Cross-Device Sync**: Synchronized playback across devices
