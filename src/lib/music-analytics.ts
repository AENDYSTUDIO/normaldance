/**
 * 🎵 Music Analytics System 2025
 * 
 * Аналитика для музыкальной платформы NormalDance:
 * - Топ треки и артисты
 * - NFT треки и их стоимость
 * - Роялти и доходы артистов
 * - Музыкальные тренды и предсказания
 */

export interface TrackAnalytics {
  id: string
  title: string
  artist: string
  genre: string
  duration: number
  plays: number
  plays24h: number
  playsChange24h: number
  nftPrice: number
  nftPriceChange24h: number
  royalties: number
  royalties24h: number
  liquidity: number
  popularity: number
  trend: 'rising' | 'falling' | 'stable'
  createdAt: number
}

export interface ArtistAnalytics {
  id: string
  name: string
  avatar?: string
  totalTracks: number
  totalPlays: number
  totalRoyalties: number
  totalEarnings: number
  followers: number
  followersChange24h: number
  averageTrackPrice: number
  topTracks: TrackAnalytics[]
  genre: string
  rank: number
  trend: 'rising' | 'falling' | 'stable'
}

export interface GenreAnalytics {
  name: string
  tracks: number
  totalPlays: number
  totalVolume: number
  averagePrice: number
  topArtists: ArtistAnalytics[]
  trend: 'rising' | 'falling' | 'stable'
  marketShare: number
}

export interface MusicMarketData {
  totalTracks: number
  totalArtists: number
  totalPlays: number
  totalVolume: number
  averageTrackPrice: number
  topGenres: GenreAnalytics[]
  trendingTracks: TrackAnalytics[]
  trendingArtists: ArtistAnalytics[]
  marketCap: number
  volume24h: number
  volumeChange24h: number
}

export interface RoyaltyDistribution {
  artistId: string
  artistName: string
  trackId: string
  trackTitle: string
  amount: number
  currency: 'TON' | 'NDT'
  percentage: number
  timestamp: number
  source: 'play' | 'purchase' | 'stream' | 'nft_sale'
}

export interface MusicPrediction {
  trackId: string
  trackTitle: string
  artist: string
  timeframe: '1h' | '4h' | '24h' | '7d'
  predictedPlays: number
  predictedPrice: number
  confidence: number
  factors: PredictionFactor[]
}

export interface PredictionFactor {
  name: string
  weight: number
  impact: 'positive' | 'negative' | 'neutral'
  description: string
}

export class MusicAnalyticsSystem {
  private tracks: Map<string, TrackAnalytics> = new Map()
  private artists: Map<string, ArtistAnalytics> = new Map()
  private genres: Map<string, GenreAnalytics> = new Map()
  private royaltyHistory: RoyaltyDistribution[] = []
  private predictions: Map<string, MusicPrediction> = new Map()
  private isCollecting = false
  private collectionInterval?: NodeJS.Timeout

  constructor() {
    this.initializeMockData()
    this.startDataCollection()
  }

  /**
   * 🎵 Инициализация мок-данных
   */
  private initializeMockData(): void {
    // Популярные треки
    const popularTracks: TrackAnalytics[] = [
      {
        id: 'track_1',
        title: 'Digital Dreams',
        artist: 'NeonBeats',
        genre: 'Electronic',
        duration: 240,
        plays: 125000,
        plays24h: 2500,
        playsChange24h: 15.5,
        nftPrice: 0.5,
        nftPriceChange24h: 8.2,
        royalties: 1250,
        royalties24h: 25,
        liquidity: 50000,
        popularity: 95,
        trend: 'rising',
        createdAt: Date.now() - 86400000 * 7
      },
      {
        id: 'track_2',
        title: 'Crypto Symphony',
        artist: 'BlockchainBard',
        genre: 'Classical',
        duration: 320,
        plays: 98000,
        plays24h: 1800,
        playsChange24h: -5.2,
        nftPrice: 0.8,
        nftPriceChange24h: -2.1,
        royalties: 980,
        royalties24h: 18,
        liquidity: 35000,
        popularity: 88,
        trend: 'falling',
        createdAt: Date.now() - 86400000 * 14
      },
      {
        id: 'track_3',
        title: 'DeFi Dance',
        artist: 'TokenTunes',
        genre: 'Hip-Hop',
        duration: 180,
        plays: 156000,
        plays24h: 3200,
        playsChange24h: 22.8,
        nftPrice: 0.3,
        nftPriceChange24h: 12.5,
        royalties: 1560,
        royalties24h: 32,
        liquidity: 75000,
        popularity: 92,
        trend: 'rising',
        createdAt: Date.now() - 86400000 * 3
      }
    ]

    // Артисты
    const popularArtists: ArtistAnalytics[] = [
      {
        id: 'artist_1',
        name: 'NeonBeats',
        totalTracks: 15,
        totalPlays: 850000,
        totalRoyalties: 8500,
        totalEarnings: 12000,
        followers: 25000,
        followersChange24h: 150,
        averageTrackPrice: 0.6,
        topTracks: [popularTracks[0]],
        genre: 'Electronic',
        rank: 1,
        trend: 'rising'
      },
      {
        id: 'artist_2',
        name: 'BlockchainBard',
        totalTracks: 8,
        totalPlays: 420000,
        totalRoyalties: 4200,
        totalEarnings: 6800,
        followers: 18000,
        followersChange24h: -50,
        averageTrackPrice: 0.9,
        topTracks: [popularTracks[1]],
        genre: 'Classical',
        rank: 2,
        trend: 'falling'
      },
      {
        id: 'artist_3',
        name: 'TokenTunes',
        totalTracks: 12,
        totalPlays: 680000,
        totalRoyalties: 6800,
        totalEarnings: 9500,
        followers: 22000,
        followersChange24h: 200,
        averageTrackPrice: 0.4,
        topTracks: [popularTracks[2]],
        genre: 'Hip-Hop',
        rank: 3,
        trend: 'rising'
      }
    ]

    // Жанры
    const genreData: GenreAnalytics[] = [
      {
        name: 'Electronic',
        tracks: 45,
        totalPlays: 1200000,
        totalVolume: 150000,
        averagePrice: 0.55,
        topArtists: [popularArtists[0]],
        trend: 'rising',
        marketShare: 35
      },
      {
        name: 'Hip-Hop',
        tracks: 32,
        totalPlays: 980000,
        totalVolume: 120000,
        averagePrice: 0.45,
        topArtists: [popularArtists[2]],
        trend: 'rising',
        marketShare: 28
      },
      {
        name: 'Classical',
        tracks: 18,
        totalPlays: 450000,
        totalVolume: 80000,
        averagePrice: 0.85,
        topArtists: [popularArtists[1]],
        trend: 'stable',
        marketShare: 20
      }
    ]

    // Сохраняем данные
    popularTracks.forEach(track => this.tracks.set(track.id, track))
    popularArtists.forEach(artist => this.artists.set(artist.id, artist))
    genreData.forEach(genre => this.genres.set(genre.name, genre))
  }

  /**
   * 📊 Запуск сбора данных
   */
  private startDataCollection(): void {
    if (this.isCollecting) return
    
    this.isCollecting = true
    this.collectionInterval = setInterval(async () => {
      await this.updateMusicData()
      await this.generatePredictions()
    }, 60000) // Обновляем каждую минуту
  }

  /**
   * 🎵 Обновление музыкальных данных
   */
  private async updateMusicData(): Promise<void> {
    // Обновляем статистику треков
    for (const [trackId, track] of this.tracks) {
      // Симуляция изменений
      const playChange = (Math.random() - 0.5) * 0.1 // ±5%
      const priceChange = (Math.random() - 0.5) * 0.05 // ±2.5%
      
      track.plays24h = Math.max(0, track.plays24h * (1 + playChange))
      track.nftPrice = Math.max(0.01, track.nftPrice * (1 + priceChange))
      track.royalties24h = track.plays24h * 0.01 // 1% от прослушиваний
      
      // Обновляем тренд
      if (playChange > 0.02) track.trend = 'rising'
      else if (playChange < -0.02) track.trend = 'falling'
      else track.trend = 'stable'
      
      this.tracks.set(trackId, track)
    }

    // Обновляем статистику артистов
    for (const [artistId, artist] of this.artists) {
      const followerChange = (Math.random() - 0.5) * 0.05 // ±2.5%
      artist.followers = Math.max(0, artist.followers * (1 + followerChange))
      artist.followersChange24h = followerChange * 100
      
      // Пересчитываем общую статистику
      artist.totalPlays = Array.from(this.tracks.values())
        .filter(track => track.artist === artist.name)
        .reduce((sum, track) => sum + track.plays, 0)
      
      artist.totalRoyalties = Array.from(this.tracks.values())
        .filter(track => track.artist === artist.name)
        .reduce((sum, track) => sum + track.royalties, 0)
      
      this.artists.set(artistId, artist)
    }
  }

  /**
   * 🔮 Генерация предсказаний
   */
  private async generatePredictions(): Promise<void> {
    const timeframes: ('1h' | '4h' | '24h' | '7d')[] = ['1h', '4h', '24h', '7d']
    
    for (const track of this.tracks.values()) {
      for (const timeframe of timeframes) {
        const prediction = await this.generateTrackPrediction(track, timeframe)
        this.predictions.set(`${track.id}_${timeframe}`, prediction)
      }
    }
  }

  /**
   * 🎯 Генерация предсказания для трека
   */
  private async generateTrackPrediction(track: TrackAnalytics, timeframe: '1h' | '4h' | '24h' | '7d'): Promise<MusicPrediction> {
    const timeMultiplier = {
      '1h': 0.04,
      '4h': 0.17,
      '24h': 1.0,
      '7d': 7.0
    }[timeframe]

    // Базовые предсказания
    const basePlays = track.plays24h
    const basePrice = track.nftPrice
    
    // Факторы влияния
    const trendFactor = track.trend === 'rising' ? 1.1 : track.trend === 'falling' ? 0.9 : 1.0
    const popularityFactor = track.popularity / 100
    const volatilityFactor = 0.8 + Math.random() * 0.4 // 0.8-1.2
    
    const predictedPlays = basePlays * timeMultiplier * trendFactor * popularityFactor * volatilityFactor
    const predictedPrice = basePrice * (1 + (trendFactor - 1) * 0.5) * volatilityFactor
    
    const confidence = 60 + Math.random() * 30 // 60-90%
    
    const factors: PredictionFactor[] = [
      {
        name: 'Текущий тренд',
        weight: 0.3,
        impact: track.trend === 'rising' ? 'positive' : track.trend === 'falling' ? 'negative' : 'neutral',
        description: `Трек ${track.trend === 'rising' ? 'набирает' : track.trend === 'falling' ? 'теряет' : 'стабилен в'} популярности`
      },
      {
        name: 'Популярность',
        weight: 0.25,
        impact: track.popularity > 80 ? 'positive' : track.popularity < 50 ? 'negative' : 'neutral',
        description: `Популярность: ${track.popularity}%`
      },
      {
        name: 'Жанровые тренды',
        weight: 0.2,
        impact: 'positive',
        description: 'Жанр в тренде'
      },
      {
        name: 'Активность сообщества',
        weight: 0.15,
        impact: 'positive',
        description: 'Высокая активность слушателей'
      },
      {
        name: 'Роялти',
        weight: 0.1,
        impact: track.royalties24h > 20 ? 'positive' : 'neutral',
        description: `Роялти за 24ч: ${track.royalties24h} TON`
      }
    ]
    
    return {
      trackId: track.id,
      trackTitle: track.title,
      artist: track.artist,
      timeframe,
      predictedPlays: Math.round(predictedPlays),
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence,
      factors
    }
  }

  /**
   * 📊 Получение топ треков
   */
  getTopTracks(limit: number = 10): TrackAnalytics[] {
    return Array.from(this.tracks.values())
      .sort((a, b) => b.plays24h - a.plays24h)
      .slice(0, limit)
  }

  /**
   * 🎤 Получение топ артистов
   */
  getTopArtists(limit: number = 10): ArtistAnalytics[] {
    return Array.from(this.artists.values())
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, limit)
  }

  /**
   * 🎵 Получение данных по жанрам
   */
  getGenreAnalytics(): GenreAnalytics[] {
    return Array.from(this.genres.values())
      .sort((a, b) => b.totalPlays - a.totalPlays)
  }

  /**
   * 📈 Получение рыночных данных
   */
  getMarketData(): MusicMarketData {
    const allTracks = Array.from(this.tracks.values())
    const allArtists = Array.from(this.artists.values())
    
    return {
      totalTracks: allTracks.length,
      totalArtists: allArtists.length,
      totalPlays: allTracks.reduce((sum, track) => sum + track.plays, 0),
      totalVolume: allTracks.reduce((sum, track) => sum + track.liquidity, 0),
      averageTrackPrice: allTracks.reduce((sum, track) => sum + track.nftPrice, 0) / allTracks.length,
      topGenres: this.getGenreAnalytics(),
      trendingTracks: this.getTopTracks(5),
      trendingArtists: this.getTopArtists(5),
      marketCap: allTracks.reduce((sum, track) => sum + track.nftPrice * 1000, 0), // Предполагаем 1000 NFT на трек
      volume24h: allTracks.reduce((sum, track) => sum + track.plays24h * track.nftPrice * 0.01, 0),
      volumeChange24h: (Math.random() - 0.5) * 20 // ±10%
    }
  }

  /**
   * 🔮 Получение предсказаний
   */
  getPredictions(trackId?: string): Map<string, MusicPrediction> {
    if (trackId) {
      const filtered = new Map()
      for (const [key, prediction] of this.predictions) {
        if (key.startsWith(trackId)) {
          filtered.set(key, prediction)
        }
      }
      return filtered
    }
    return this.predictions
  }

  /**
   * 💰 Получение распределения роялти
   */
  getRoyaltyDistribution(artistId?: string): RoyaltyDistribution[] {
    if (artistId) {
      return this.royaltyHistory.filter(royalty => royalty.artistId === artistId)
    }
    return this.royaltyHistory
  }

  /**
   * 🎯 Получение рекомендаций для артистов
   */
  getArtistRecommendations(artistId: string): string[] {
    const artist = this.artists.get(artistId)
    if (!artist) return []

    const recommendations: string[] = []

    if (artist.trend === 'falling') {
      recommendations.push('📉 Популярность падает. Рассмотрите выпуск нового трека или коллаборацию.')
    }

    if (artist.averageTrackPrice < 0.3) {
      recommendations.push('💰 Цены на треки низкие. Увеличьте ценность через эксклюзивный контент.')
    }

    if (artist.followersChange24h < 0) {
      recommendations.push('👥 Количество подписчиков снижается. Увеличьте активность в сообществе.')
    }

    if (artist.totalTracks < 5) {
      recommendations.push('🎵 Мало треков в каталоге. Выпустите больше контента для роста популярности.')
    }

    const topGenre = this.getGenreAnalytics()[0]
    if (artist.genre !== topGenre.name) {
      recommendations.push(`🎶 Жанр "${topGenre.name}" сейчас в тренде. Рассмотрите эксперименты в этом направлении.`)
    }

    return recommendations
  }

  /**
   * 🎵 Получение трека по ID
   */
  getTrack(trackId: string): TrackAnalytics | null {
    return this.tracks.get(trackId) || null
  }

  /**
   * 🎤 Получение артиста по ID
   */
  getArtist(artistId: string): ArtistAnalytics | null {
    return this.artists.get(artistId) || null
  }

  /**
   * 📊 Получение статистики платформы
   */
  getPlatformStats() {
    const marketData = this.getMarketData()
    
    return {
      totalTracks: marketData.totalTracks,
      totalArtists: marketData.totalArtists,
      totalPlays: marketData.totalPlays,
      totalVolume: marketData.totalVolume,
      averageTrackPrice: marketData.averageTrackPrice,
      marketCap: marketData.marketCap,
      volume24h: marketData.volume24h,
      volumeChange24h: marketData.volumeChange24h,
      topGenre: marketData.topGenres[0]?.name || 'Unknown',
      trendingTracks: marketData.trendingTracks.length,
      activeArtists: Array.from(this.artists.values()).filter(a => a.trend === 'rising').length
    }
  }

  /**
   * 🛑 Остановка сбора данных
   */
  stopDataCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval)
      this.collectionInterval = undefined
    }
    this.isCollecting = false
  }
}

// Экспорт синглтона
export const musicAnalyticsSystem = new MusicAnalyticsSystem()
