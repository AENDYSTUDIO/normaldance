import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RecommendationEngine } from '../recommendations/recommendation-engine'
import { AchievementsSystem } from '../rewards/achievements-system'
import { StakingInterface } from '../staking/staking-interface'
import { NFTMarketplace } from '../nft/nft-marketplace'
import { AudioPlayer } from '../audio/audio-player'

// Мок для зависимостей
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
  useRef: jest.fn(),
}))

jest.mock('@/store/use-audio-store', () => ({
  useAudioStore: () => ({
    currentTrack: {
      id: '1',
      title: 'Test Track',
      artistName: 'Test Artist',
      coverImage: 'test.jpg',
      audioUrl: 'test.mp3',
      duration: 180,
    },
    isPlaying: false,
    volume: 50,
    isMuted: false,
    currentTime: 0,
    duration: 180,
    queue: [],
    currentQueueIndex: 0,
    history: [],
    shuffle: false,
    repeat: 'off',
    play: jest.fn(),
    pause: jest.fn(),
    setVolume: jest.fn(),
    toggleMute: jest.fn(),
    seekTo: jest.fn(),
    playNext: jest.fn(),
    playPrevious: jest.fn(),
    toggleLike: jest.fn(),
    toggleShuffle: jest.fn(),
    setRepeat: jest.fn(),
    addToQueue: jest.fn(),
    removeFromQueue: jest.fn(),
    clearQueue: jest.fn(),
    createPlaylist: jest.fn(),
    addToPlaylist: jest.fn(),
    removeFromPlaylist: jest.fn(),
    getUserPlaylists: jest.fn(),
    setCurrentPlaylist: jest.fn(),
  }),
}))

jest.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
  }),
}))

describe('Новые функции - Тесты компонентов', () => {
  describe('RecommendationEngine', () => {
    it('должен рендериться без ошибок', () => {
      render(<RecommendationEngine />)
      expect(screen.getByText('AI Рекомендации')).toBeInTheDocument()
    })

    it('должен иметь вкладки для разных типов рекомендаций', () => {
      render(<RecommendationEngine />)
      expect(screen.getByText('Персональные')).toBeInTheDocument()
      expect(screen.getByText('Коллаборативные')).toBeInTheDocument()
      expect(screen.getByText('Тренды')).toBeInTheDocument()
    })

    it('должен переключаться между вкладками', () => {
      render(<RecommendationEngine />)
      const personalTab = screen.getByText('Персональные')
      const collaborativeTab = screen.getByText('Коллаборативные')
      
      fireEvent.click(collaborativeTab)
      expect(collaborativeTab).toHaveClass('bg-primary')
      
      fireEvent.click(personalTab)
      expect(personalTab).toHaveClass('bg-primary')
    })
  })

  describe('AchievementsSystem', () => {
    it('должен рендериться без ошибок', () => {
      render(<AchievementsSystem />)
      expect(screen.getByText('Достижения')).toBeInTheDocument()
    })

    it('должен показывать прогресс достижений', () => {
      render(<AchievementsSystem />)
      expect(screen.getByText('Прогресс')).toBeInTheDocument()
    })

    it('должен иметь разные категории достижений', () => {
      render(<AchievementsSystem />)
      expect(screen.getByText('Музыкальные')).toBeInTheDocument()
      expect(screen.getByText('Социальные')).toBeInTheDocument()
      expect(screen.getByText('Специальные')).toBeInTheDocument()
    })
  })

  describe('StakingInterface', () => {
    it('должен рендериться без ошибок', () => {
      render(<StakingInterface />)
      expect(screen.getByText('Стейкинг')).toBeInTheDocument()
    })

    it('должен показывать доходность в реальном времени', () => {
      render(<StakingInterface />)
      expect(screen.getByText('Доходность')).toBeInTheDocument()
    })

    it('должен иметь разные типы стейкинга', () => {
      render(<StakingInterface />)
      expect(screen.getByText('Фиксированный')).toBeInTheDocument()
      expect(screen.getByText('Плавающий')).toBeInTheDocument()
      expect(screen.getByText('Ликвидность')).toBeInTheDocument()
    })
  })

  describe('NFTMarketplace', () => {
    it('должен рендериться без ошибок', () => {
      render(<NFTMarketplace />)
      expect(screen.getByText('NFT Рынок')).toBeInTheDocument()
    })

    it('должен иметь фильтры и поиск', () => {
      render(<NFTMarketplace />)
      expect(screen.getByPlaceholderText('Поиск NFT...')).toBeInTheDocument()
    })

    it('должен показывать статистику рынка', () => {
      render(<NFTMarketplace />)
      expect(screen.getByText('Статистика рынка')).toBeInTheDocument()
    })
  })

  describe('AudioPlayer', () => {
    it('должен рендериться без ошибок', () => {
      render(<AudioPlayer />)
      expect(screen.getByText('Воспроизведение')).toBeInTheDocument()
    })

    it('должен иметь плейлисты и очередь', () => {
      render(<AudioPlayer />)
      expect(screen.getByText('Очередь')).toBeInTheDocument()
    })

    it('должен показывать визуализацию аудио', () => {
      render(<AudioPlayer />)
      expect(screen.getByText('Визуализация')).toBeInTheDocument()
    })

    it('должен иметь настройки качества звука', () => {
      render(<AudioPlayer />)
      expect(screen.getByText('Качество звука')).toBeInTheDocument()
    })
  })
})

describe('Новые функции - Интеграционные тесты', () => {
  it('должны работать все компоненты вместе без конфликтов', () => {
    const { container } = render(
      <>
        <RecommendationEngine />
        <AchievementsSystem />
        <StakingInterface />
        <NFTMarketplace />
        <AudioPlayer />
      </>
    )
    
    expect(container).toBeInTheDocument()
    expect(screen.getByText('AI Рекомендации')).toBeInTheDocument()
    expect(screen.getByText('Достижения')).toBeInTheDocument()
    expect(screen.getByText('Стейкинг')).toBeInTheDocument()
    expect(screen.getByText('NFT Рынок')).toBeInTheDocument()
    expect(screen.getByText('Воспроизведение')).toBeInTheDocument()
  })

  it('должны обрабатывать пользовательские взаимодействия', async () => {
    render(<RecommendationEngine />)
    
    const personalTab = screen.getByText('Персональные')
    const collaborativeTab = screen.getByText('Коллаборативные')
    
    fireEvent.click(collaborativeTab)
    await waitFor(() => {
      expect(collaborativeTab).toHaveClass('bg-primary')
    })
    
    fireEvent.click(personalTab)
    await waitFor(() => {
      expect(personalTab).toHaveClass('bg-primary')
    })
  })
})

describe('Новые функции - Тесты производительности', () => {
  it('должны рендериться быстро', () => {
    const startTime = performance.now()
    render(<RecommendationEngine />)
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(100) // Менее 100ms
  })

  it('должны обрабатывать быстрые взаимодействия', async () => {
    render(<RecommendationEngine />)
    
    const startTime = performance.now()
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByText('Персональные'))
      fireEvent.click(screen.getByText('Коллаборативные'))
      fireEvent.click(screen.getByText('Тренды'))
    }
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(500) // Менее 500ms для 30 кликов
  })
})