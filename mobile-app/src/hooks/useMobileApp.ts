import { useState, useEffect, useCallback } from 'react'
import * as Audio from 'expo-av'
import { mobileService, type MobileTrack, type WalletState, type StakingInfo, type UploadProgress } from '../services/mobileService'

export const useMobileApp = () => {
  // Состояния приложения
  const [tracks, setTracks] = useState<MobileTrack[]>([])
  const [filteredTracks, setFilteredTracks] = useState<MobileTrack[]>([])
  const [wallet, setWallet] = useState<WalletState>({ connected: false })
  const [currentTrack, setCurrentTrack] = useState<MobileTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)

  // Загрузка треков
  const loadTracks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const loadedTracks = await mobileService.loadTracks()
      setTracks(loadedTracks)
      setFilteredTracks(loadedTracks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracks')
    } finally {
      setLoading(false)
    }
  }, [])

  // Поиск треков
  const searchTracks = useCallback(async (query: string) => {
    try {
      if (!query.trim()) {
        setFilteredTracks(tracks)
        return
      }

      const results = await mobileService.searchTracks(query)
      setFilteredTracks(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search tracks')
    }
  }, [tracks])

  // Подключение кошелька
  const connectWallet = useCallback(async () => {
    try {
      setError(null)
      const walletState = await mobileService.connectWallet()
      setWallet(walletState)
      
      // Загрузка информации о стейкинге
      if (walletState.publicKey) {
        const staking = await mobileService.getStakingInfo(walletState.publicKey)
        setStakingInfo(staking)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    }
  }, [])

  // Отключение кошелька
  const disconnectWallet = useCallback(async () => {
    try {
      await mobileService.disconnectWallet()
      setWallet({ connected: false })
      setStakingInfo(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet')
    }
  }, [])

  // Воспроизведение трека
  const playTrack = useCallback(async (track: MobileTrack) => {
    try {
      setError(null)
      await mobileService.playTrack(track)
      setCurrentTrack(track)
      setIsPlaying(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play track')
    }
  }, [])

  // Пауза/воспроизведение
  const togglePlayback = useCallback(async () => {
    try {
      if (isPlaying) {
        await mobileService.pausePlayback()
      } else {
        await mobileService.resumePlayback()
      }
      setIsPlaying(!isPlaying)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle playback')
    }
  }, [isPlaying])

  // Остановка воспроизведения
  const stopPlayback = useCallback(async () => {
    try {
      await mobileService.stopPlayback()
      setCurrentTrack(null)
      setIsPlaying(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop playback')
    }
  }, [])

  // Лайк трека
  const likeTrack = useCallback(async (trackId: string) => {
    try {
      if (!wallet.publicKey) return
      
      await mobileService.likeTrack(trackId, wallet.publicKey)
      
      // Обновление локального состояния
      setTracks(prev => prev.map(track => 
        track.id === trackId 
          ? { ...track, likeCount: track.likeCount + 1 }
          : track
      ))
      
      setFilteredTracks(prev => prev.map(track => 
        track.id === trackId 
          ? { ...track, likeCount: track.likeCount + 1 }
          : track
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like track')
    }
  }, [wallet.publicKey])

  // Анлайк трека
  const unlikeTrack = useCallback(async (trackId: string) => {
    try {
      if (!wallet.publicKey) return
      
      await mobileService.unlikeTrack(trackId, wallet.publicKey)
      
      // Обновление локального состояния
      setTracks(prev => prev.map(track => 
        track.id === trackId 
          ? { ...track, likeCount: Math.max(0, track.likeCount - 1) }
          : track
      ))
      
      setFilteredTracks(prev => prev.map(track => 
        track.id === trackId 
          ? { ...track, likeCount: Math.max(0, track.likeCount - 1) }
          : track
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlike track')
    }
  }, [wallet.publicKey])

  // Стейкинг токенов
  const stakeTokens = useCallback(async (amount: number, lockPeriod: number) => {
    try {
      if (!wallet.publicKey) return
      
      setError(null)
      const signature = await mobileService.stakeTokens(amount, lockPeriod)
      
      // Обновление информации о стейкинге
      const staking = await mobileService.getStakingInfo(wallet.publicKey)
      setStakingInfo(staking)
      
      return signature
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stake tokens')
      throw err
    }
  }, [wallet.publicKey])

  // Анстейкинг токенов
  const unstakeTokens = useCallback(async () => {
    try {
      if (!wallet.publicKey) return
      
      setError(null)
      const signature = await mobileService.unstakeTokens()
      
      // Обновление информации о стейкинге
      const staking = await mobileService.getStakingInfo(wallet.publicKey)
      setStakingInfo(staking)
      
      return signature
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unstake tokens')
      throw err
    }
  }, [wallet.publicKey])

  // Загрузка трека
  const uploadTrack = useCallback(async (
    file: { uri: string; name: string; type: string },
    metadata: {
      title: string
      artist: string
      genre: string
      description?: string
      isExplicit: boolean
    }
  ) => {
    try {
      setError(null)
      setUploadProgress({
        progress: 0,
        status: 'uploading'
      })

      const trackId = await mobileService.uploadTrack(file, metadata, (progress) => {
        setUploadProgress(progress)
      })

      // Обновление списка треков
      await loadTracks()
      
      setUploadProgress({
        progress: 100,
        status: 'completed'
      })

      return trackId
    } catch (err) {
      setUploadProgress({
        progress: 0,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Upload failed'
      })
      throw err
    }
  }, [loadTracks])

  // Получение профиля пользователя
  const getUserProfile = useCallback(async () => {
    try {
      if (!wallet.publicKey) return null
      
      return await mobileService.getUserProfile(wallet.publicKey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user profile')
      return null
    }
  }, [wallet.publicKey])

  // Обновление профиля пользователя
  const updateUserProfile = useCallback(async (profileData: any) => {
    try {
      if (!wallet.publicKey) return false
      
      const success = await mobileService.updateUserProfile(wallet.publicKey, profileData)
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user profile')
      return false
    }
  }, [wallet.publicKey])

  // Форматирование времени
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Очистка ресурсов
  const cleanup = useCallback(() => {
    mobileService.cleanup()
  }, [])

  // Инициализация
  useEffect(() => {
    loadTracks()
    
    return () => {
      cleanup()
    }
  }, [loadTracks, cleanup])

  // Обработка поиска
  useEffect(() => {
    if (searchQuery.trim()) {
      searchTracks(searchQuery)
    } else {
      setFilteredTracks(tracks)
    }
  }, [searchQuery, tracks, searchTracks])

  return {
    // Состояния
    tracks,
    filteredTracks,
    wallet,
    currentTrack,
    isPlaying,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    stakingInfo,
    uploadProgress,
    
    // Действия
    loadTracks,
    connectWallet,
    disconnectWallet,
    playTrack,
    togglePlayback,
    stopPlayback,
    likeTrack,
    unlikeTrack,
    stakeTokens,
    unstakeTokens,
    uploadTrack,
    getUserProfile,
    updateUserProfile,
    formatTime,
    cleanup,
    searchTracks,
    
    // Утилиты
    hasError: !!error,
    isEmpty: !loading && filteredTracks.length === 0,
    isWalletConnected: wallet.connected,
    walletAddress: wallet.publicKey,
    walletBalance: wallet.balance
  }
}