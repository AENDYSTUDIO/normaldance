import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AudioOptimizer } from '@/lib/audio-optimizer'
import { useOptimizedAudio } from '@/hooks/useOptimizedAudio'
import { WebAudioPlayer } from '@/components/audio/web-audio-player'

// Mock Web Audio API
const mockAudioContext = {
  createBufferSource: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    buffer: null
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { value: 1 }
  })),
  createAnalyser: jest.fn(() => ({
    connect: jest.fn(),
    fftSize: 2048,
    getByteFrequencyData: jest.fn()
  })),
  decodeAudioData: jest.fn(),
  destination: {},
  sampleRate: 44100,
  state: 'running'
}

global.AudioContext = jest.fn(() => mockAudioContext)
global.webkitAudioContext = jest.fn(() => mockAudioContext)

describe('🔥 ДЕТАЛЬНЫЕ АУДИО ТЕСТЫ', () => {
  let audioOptimizer: AudioOptimizer

  beforeEach(() => {
    jest.clearAllMocks()
    audioOptimizer = new AudioOptimizer()
    global.fetch = jest.fn()
    global.navigator.connection = {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50
    }
  })

  describe('🎵 АУДИО ОПТИМИЗАЦИЯ', () => {
    test('должен определить оптимальное качество по сети', () => {
      // 4G - высокое качество
      global.navigator.connection.effectiveType = '4g'
      global.navigator.connection.downlink = 10
      expect(audioOptimizer.getOptimalQuality()).toBe('high')

      // 3G - среднее качество  
      global.navigator.connection.effectiveType = '3g'
      global.navigator.connection.downlink = 2
      expect(audioOptimizer.getOptimalQuality()).toBe('medium')

      // 2G - низкое качество
      global.navigator.connection.effectiveType = '2g'
      global.navigator.connection.downlink = 0.5
      expect(audioOptimizer.getOptimalQuality()).toBe('low')
    })

    test('должен адаптировать битрейт под условия сети', () => {
      const testCases = [
        { connection: '4g', downlink: 10, expected: 320 },
        { connection: '3g', downlink: 2, expected: 192 },
        { connection: '2g', downlink: 0.5, expected: 128 }
      ]

      testCases.forEach(({ connection, downlink, expected }) => {
        global.navigator.connection.effectiveType = connection
        global.navigator.connection.downlink = downlink
        
        expect(audioOptimizer.getOptimalBitrate()).toBe(expected)
      })
    })

    test('должен кэшировать аудио файлы', async () => {
      const mockAudioData = new ArrayBuffer(1024)
      const trackId = 'track_123'
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioData)
      })

      // Первая загрузка
      const audio1 = await audioOptimizer.loadAudio(trackId, 'high')
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Вторая загрузка - из кэша
      const audio2 = await audioOptimizer.loadAudio(trackId, 'high')
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(audio1).toBe(audio2)
    })

    test('должен предзагружать следующие треки', async () => {
      const playlist = ['track1', 'track2', 'track3']
      const currentIndex = 0

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
      })

      await audioOptimizer.preloadNext(playlist, currentIndex)

      // Должен предзагрузить следующий трек
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('track2')
      )
    })

    test('должен сжимать аудио через Web Worker', async () => {
      const mockWorker = {
        postMessage: jest.fn(),
        onmessage: null,
        terminate: jest.fn()
      }

      global.Worker = jest.fn(() => mockWorker)

      const audioData = new ArrayBuffer(2048)
      const compressionPromise = audioOptimizer.compressAudio(audioData, 0.8)

      // Симулируем ответ от worker
      setTimeout(() => {
        mockWorker.onmessage({ 
          data: { 
            compressed: new ArrayBuffer(1024) 
          } 
        })
      }, 10)

      const compressed = await compressionPromise
      expect(compressed.byteLength).toBeLessThan(audioData.byteLength)
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        audioData,
        quality: 0.8
      })
    })
  })

  describe('🎛️ WEB AUDIO PLAYER', () => {
    test('должен создать аудио контекст', () => {
      render(<WebAudioPlayer src="test.mp3" />)
      expect(global.AudioContext).toHaveBeenCalled()
    })

    test('должен применять эффекты', async () => {
      const { container } = render(
        <WebAudioPlayer 
          src="test.mp3" 
          effects={{ reverb: 0.5, bass: 0.3 }} 
        />
      )

      await waitFor(() => {
        expect(mockAudioContext.createGain).toHaveBeenCalled()
      })
    })

    test('должен показывать визуализацию', async () => {
      render(
        <WebAudioPlayer 
          src="test.mp3" 
          showVisualizer={true} 
        />
      )

      await waitFor(() => {
        expect(mockAudioContext.createAnalyser).toHaveBeenCalled()
        expect(screen.getByTestId('audio-visualizer')).toBeInTheDocument()
      })
    })

    test('должен контролировать громкость', () => {
      render(<WebAudioPlayer src="test.mp3" />)
      
      const volumeSlider = screen.getByRole('slider', { name: /громкость/i })
      fireEvent.change(volumeSlider, { target: { value: '0.5' } })
      
      expect(mockAudioContext.createGain().gain.value).toBe(0.5)
    })
  })

  describe('🎧 ОПТИМИЗИРОВАННЫЙ ХУК', () => {
    const TestComponent = ({ trackId }: { trackId: string }) => {
      const { 
        audio, 
        loading, 
        error, 
        play, 
        pause, 
        isPlaying,
        currentTime,
        duration 
      } = useOptimizedAudio(trackId)

      return (
        <div>
          {loading && <div>Загрузка...</div>}
          {error && <div>Ошибка: {error}</div>}
          {audio && (
            <>
              <button onClick={play}>Play</button>
              <button onClick={pause}>Pause</button>
              <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
              <div>Time: {currentTime}/{duration}</div>
            </>
          )}
        </div>
      )
    }

    test('должен загружать аудио', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
      })

      render(<TestComponent trackId="test_track" />)

      expect(screen.getByText('Загрузка...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Play')).toBeInTheDocument()
        expect(screen.getByText('Pause')).toBeInTheDocument()
      })
    })

    test('должен обрабатывать ошибки загрузки', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<TestComponent trackId="test_track" />)

      await waitFor(() => {
        expect(screen.getByText('Ошибка: Network error')).toBeInTheDocument()
      })
    })

    test('должен управлять воспроизведением', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
      })

      render(<TestComponent trackId="test_track" />)

      await waitFor(() => {
        expect(screen.getByText('Play')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Play'))
      expect(screen.getByText('Playing: Yes')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Pause'))
      expect(screen.getByText('Playing: No')).toBeInTheDocument()
    })
  })

  describe('📊 МЕТРИКИ ПРОИЗВОДИТЕЛЬНОСТИ', () => {
    test('должен отслеживать время загрузки', async () => {
      const startTime = performance.now()
      
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
          }), 100)
        )
      )

      await audioOptimizer.loadAudio('test_track', 'high')
      
      const loadTime = performance.now() - startTime
      expect(loadTime).toBeGreaterThan(100)
      expect(loadTime).toBeLessThan(200)
    })

    test('должен отслеживать использование кэша', async () => {
      const trackId = 'cache_test'
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
      })

      // Первая загрузка
      await audioOptimizer.loadAudio(trackId, 'high')
      const cacheStats1 = audioOptimizer.getCacheStats()
      expect(cacheStats1.misses).toBe(1)
      expect(cacheStats1.hits).toBe(0)

      // Вторая загрузка (из кэша)
      await audioOptimizer.loadAudio(trackId, 'high')
      const cacheStats2 = audioOptimizer.getCacheStats()
      expect(cacheStats2.misses).toBe(1)
      expect(cacheStats2.hits).toBe(1)
    })

    test('должен мониторить использование памяти', () => {
      const memoryBefore = audioOptimizer.getMemoryUsage()
      
      // Добавляем данные в кэш
      audioOptimizer.cache.set('test1', new ArrayBuffer(1024))
      audioOptimizer.cache.set('test2', new ArrayBuffer(2048))
      
      const memoryAfter = audioOptimizer.getMemoryUsage()
      expect(memoryAfter).toBeGreaterThan(memoryBefore)
      expect(memoryAfter).toBe(memoryBefore + 3072) // 1024 + 2048
    })
  })

  describe('🔧 АДАПТИВНОЕ КАЧЕСТВО', () => {
    test('должен переключать качество при изменении сети', async () => {
      const qualityChangeSpy = jest.fn()
      audioOptimizer.on('qualityChange', qualityChangeSpy)

      // Начинаем с 4G
      global.navigator.connection.effectiveType = '4g'
      await audioOptimizer.adaptToNetwork()
      expect(qualityChangeSpy).toHaveBeenCalledWith('high')

      // Переключаемся на 3G
      global.navigator.connection.effectiveType = '3g'
      await audioOptimizer.adaptToNetwork()
      expect(qualityChangeSpy).toHaveBeenCalledWith('medium')

      // Переключаемся на 2G
      global.navigator.connection.effectiveType = '2g'
      await audioOptimizer.adaptToNetwork()
      expect(qualityChangeSpy).toHaveBeenCalledWith('low')
    })

    test('должен учитывать задержку сети', () => {
      // Высокая задержка - снижаем качество
      global.navigator.connection.rtt = 500
      expect(audioOptimizer.getOptimalQuality()).toBe('low')

      // Низкая задержка - высокое качество
      global.navigator.connection.rtt = 50
      expect(audioOptimizer.getOptimalQuality()).toBe('high')
    })

    test('должен буферизовать при медленной сети', async () => {
      global.navigator.connection.effectiveType = '2g'
      global.navigator.connection.downlink = 0.3

      const bufferSpy = jest.fn()
      audioOptimizer.on('bufferStart', bufferSpy)

      await audioOptimizer.loadAudio('slow_track', 'high')
      expect(bufferSpy).toHaveBeenCalled()
    })
  })

  describe('🎯 EDGE CASES', () => {
    test('должен обработать отсутствие Web Audio API', () => {
      delete global.AudioContext
      delete global.webkitAudioContext

      expect(() => {
        render(<WebAudioPlayer src="test.mp3" />)
      }).not.toThrow()

      expect(screen.getByText('Web Audio не поддерживается')).toBeInTheDocument()
    })

    test('должен обработать поврежденные аудио файлы', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) // Пустой файл
      })

      mockAudioContext.decodeAudioData.mockRejectedValue(new Error('Invalid audio'))

      await expect(
        audioOptimizer.loadAudio('corrupted_track', 'high')
      ).rejects.toThrow('Invalid audio')
    })

    test('должен очищать кэш при нехватке памяти', () => {
      // Заполняем кэш
      for (let i = 0; i < 100; i++) {
        audioOptimizer.cache.set(`track_${i}`, new ArrayBuffer(1024 * 1024)) // 1MB каждый
      }

      const memoryBefore = audioOptimizer.getMemoryUsage()
      audioOptimizer.cleanupCache()
      const memoryAfter = audioOptimizer.getMemoryUsage()

      expect(memoryAfter).toBeLessThan(memoryBefore)
    })

    test('должен работать без navigator.connection', () => {
      delete global.navigator.connection

      // Должен использовать дефолтные настройки
      expect(audioOptimizer.getOptimalQuality()).toBe('medium')
      expect(audioOptimizer.getOptimalBitrate()).toBe(192)
    })
  })
})