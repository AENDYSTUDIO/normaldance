// Алгоритмы рекомендаций для NORMAL DANCE

export interface Track {
  id: string
  title: string
  artist: string
  genre: string
  bpm: number
  playCount: number
  features: AudioFeatures
}

export interface AudioFeatures {
  energy: number
  valence: number
  danceability: number
  acousticness: number
}

export interface UserProfile {
  id: string
  listeningHistory: string[]
  preferences: {
    genres: string[]
    bpmRange: [number, number]
    features: AudioFeatures
  }
}

// Алгоритм на основе прослушиваний
export class ListeningBasedRecommendation {
  static generateRecommendations(userProfile: UserProfile, tracks: Track[]): Track[] {
    const recentTracks = tracks.filter(t => userProfile.listeningHistory.includes(t.id))
    const avgFeatures = this.calculateAverageFeatures(recentTracks)
    
    return tracks
      .filter(t => !userProfile.listeningHistory.includes(t.id))
      .map(track => ({
        ...track,
        similarity: this.calculateSimilarity(avgFeatures, track.features)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
  }

  private static calculateAverageFeatures(tracks: Track[]): AudioFeatures {
    if (tracks.length === 0) return { energy: 0.5, valence: 0.5, danceability: 0.5, acousticness: 0.5 }
    
    return {
      energy: tracks.reduce((sum, t) => sum + t.features.energy, 0) / tracks.length,
      valence: tracks.reduce((sum, t) => sum + t.features.valence, 0) / tracks.length,
      danceability: tracks.reduce((sum, t) => sum + t.features.danceability, 0) / tracks.length,
      acousticness: tracks.reduce((sum, t) => sum + t.features.acousticness, 0) / tracks.length
    }
  }

  private static calculateSimilarity(features1: AudioFeatures, features2: AudioFeatures): number {
    const diff = Math.sqrt(
      Math.pow(features1.energy - features2.energy, 2) +
      Math.pow(features1.valence - features2.valence, 2) +
      Math.pow(features1.danceability - features2.danceability, 2) +
      Math.pow(features1.acousticness - features2.acousticness, 2)
    )
    return Math.max(0, 100 - (diff * 50))
  }
}

// Персонализированные рекомендации
export class PersonalizedRecommendation {
  static generateRecommendations(userProfile: UserProfile, tracks: Track[]): Track[] {
    return tracks
      .filter(track => this.matchesPreferences(track, userProfile))
      .map(track => ({
        ...track,
        personalizedScore: this.calculatePersonalizedScore(track, userProfile)
      }))
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
      .slice(0, 10)
  }

  private static matchesPreferences(track: Track, userProfile: UserProfile): boolean {
    const genreMatch = userProfile.preferences.genres.includes(track.genre)
    const bpmMatch = track.bpm >= userProfile.preferences.bpmRange[0] && 
                     track.bpm <= userProfile.preferences.bpmRange[1]
    return genreMatch || bpmMatch
  }

  private static calculatePersonalizedScore(track: Track, userProfile: UserProfile): number {
    let score = 0
    
    // Жанр
    if (userProfile.preferences.genres.includes(track.genre)) score += 30
    
    // BPM
    const bpmCenter = (userProfile.preferences.bpmRange[0] + userProfile.preferences.bpmRange[1]) / 2
    const bpmDiff = Math.abs(track.bpm - bpmCenter)
    score += Math.max(0, 20 - (bpmDiff / 10))
    
    // Аудио характеристики
    const featureSimilarity = ListeningBasedRecommendation['calculateSimilarity'](
      userProfile.preferences.features, 
      track.features
    )
    score += featureSimilarity * 0.5
    
    return Math.min(100, score)
  }
}

// Коллаборативная фильтрация
export class CollaborativeFiltering {
  static generateRecommendations(
    currentUser: UserProfile, 
    allUsers: UserProfile[], 
    tracks: Track[]
  ): Track[] {
    const similarUsers = this.findSimilarUsers(currentUser, allUsers)
    const recommendations = this.getRecommendationsFromSimilarUsers(
      currentUser, 
      similarUsers, 
      tracks
    )
    
    return recommendations
      .map(track => ({
        ...track,
        collaborativeScore: this.calculateCollaborativeScore(track, similarUsers)
      }))
      .sort((a, b) => b.collaborativeScore - a.collaborativeScore)
      .slice(0, 10)
  }

  private static findSimilarUsers(currentUser: UserProfile, allUsers: UserProfile[]): UserProfile[] {
    return allUsers
      .filter(user => user.id !== currentUser.id)
      .map(user => ({
        ...user,
        similarity: this.calculateUserSimilarity(currentUser, user)
      }))
      .filter(user => user.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20)
  }

  private static calculateUserSimilarity(user1: UserProfile, user2: UserProfile): number {
    const commonTracks = user1.listeningHistory.filter(
      trackId => user2.listeningHistory.includes(trackId)
    ).length
    
    const totalUniqueTracks = new Set([
      ...user1.listeningHistory, 
      ...user2.listeningHistory
    ]).size
    
    return commonTracks / totalUniqueTracks
  }

  private static getRecommendationsFromSimilarUsers(
    currentUser: UserProfile,
    similarUsers: UserProfile[],
    tracks: Track[]
  ): Track[] {
    const recommendedTrackIds = new Set<string>()
    
    similarUsers.forEach(user => {
      user.listeningHistory.forEach(trackId => {
        if (!currentUser.listeningHistory.includes(trackId)) {
          recommendedTrackIds.add(trackId)
        }
      })
    })
    
    return tracks.filter(track => recommendedTrackIds.has(track.id))
  }

  private static calculateCollaborativeScore(track: Track, similarUsers: UserProfile[]): number {
    const usersWhoLiked = similarUsers.filter(user => 
      user.listeningHistory.includes(track.id)
    ).length
    
    return (usersWhoLiked / similarUsers.length) * 100
  }
}

// Гибридная система рекомендаций
export class HybridRecommendationSystem {
  static generateRecommendations(
    userProfile: UserProfile,
    allUsers: UserProfile[],
    tracks: Track[]
  ): {
    listening: Track[]
    personalized: Track[]
    collaborative: Track[]
    hybrid: Track[]
  } {
    const listening = ListeningBasedRecommendation.generateRecommendations(userProfile, tracks)
    const personalized = PersonalizedRecommendation.generateRecommendations(userProfile, tracks)
    const collaborative = CollaborativeFiltering.generateRecommendations(userProfile, allUsers, tracks)
    
    // Гибридные рекомендации (комбинация всех алгоритмов)
    const hybrid = this.combineRecommendations([listening, personalized, collaborative])
    
    return { listening, personalized, collaborative, hybrid }
  }

  private static combineRecommendations(recommendations: Track[][]): Track[] {
    const trackScores = new Map<string, { track: Track, totalScore: number, count: number }>()
    
    recommendations.forEach(trackList => {
      trackList.forEach((track, index) => {
        const score = 100 - (index * 5) // Убывающий вес по позиции
        const existing = trackScores.get(track.id)
        
        if (existing) {
          existing.totalScore += score
          existing.count += 1
        } else {
          trackScores.set(track.id, { track, totalScore: score, count: 1 })
        }
      })
    })
    
    return Array.from(trackScores.values())
      .map(item => ({
        ...item.track,
        hybridScore: item.totalScore / item.count
      }))
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, 15)
  }
}