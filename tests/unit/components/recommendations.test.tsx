import { 
  ListeningBasedRecommendation,
  PersonalizedRecommendation,
  CollaborativeFiltering,
  HybridRecommendationSystem,
  Track,
  UserProfile
} from '../../../src/components/recommendations/recommendation-algorithms'

describe('Recommendation Algorithms', () => {
  const mockTracks: Track[] = [
    {
      id: '1',
      title: 'Electronic Dreams',
      artist: 'AI Producer',
      genre: 'Electronic',
      bpm: 128,
      playCount: 1000,
      features: { energy: 0.8, valence: 0.7, danceability: 0.9, acousticness: 0.1 }
    },
    {
      id: '2',
      title: 'Chill Vibes',
      artist: 'Lo-Fi King',
      genre: 'Chill',
      bpm: 85,
      playCount: 500,
      features: { energy: 0.3, valence: 0.6, danceability: 0.4, acousticness: 0.8 }
    },
    {
      id: '3',
      title: 'Bass Drop',
      artist: 'Beat Master',
      genre: 'Dubstep',
      bpm: 140,
      playCount: 800,
      features: { energy: 0.9, valence: 0.5, danceability: 0.8, acousticness: 0.2 }
    }
  ]

  const mockUserProfile: UserProfile = {
    id: 'user1',
    listeningHistory: ['1'],
    preferences: {
      genres: ['Electronic', 'Chill'],
      bpmRange: [80, 130],
      features: { energy: 0.6, valence: 0.7, danceability: 0.7, acousticness: 0.4 }
    }
  }

  const mockUsers: UserProfile[] = [
    mockUserProfile,
    {
      id: 'user2',
      listeningHistory: ['1', '2'],
      preferences: {
        genres: ['Electronic'],
        bpmRange: [120, 140],
        features: { energy: 0.8, valence: 0.6, danceability: 0.8, acousticness: 0.3 }
      }
    }
  ]

  describe('ListeningBasedRecommendation', () => {
    it('should generate recommendations based on listening history', () => {
      const recommendations = ListeningBasedRecommendation.generateRecommendations(
        mockUserProfile,
        mockTracks
      )

      expect(recommendations).toHaveLength(2)
      expect(recommendations[0]).toHaveProperty('similarity')
      expect(recommendations.every(track => !mockUserProfile.listeningHistory.includes(track.id))).toBe(true)
    })

    it('should return empty array for user with no listening history', () => {
      const emptyUser: UserProfile = {
        ...mockUserProfile,
        listeningHistory: []
      }

      const recommendations = ListeningBasedRecommendation.generateRecommendations(
        emptyUser,
        mockTracks
      )

      expect(recommendations).toHaveLength(3)
    })
  })

  describe('PersonalizedRecommendation', () => {
    it('should generate personalized recommendations', () => {
      const recommendations = PersonalizedRecommendation.generateRecommendations(
        mockUserProfile,
        mockTracks
      )

      expect(recommendations).toHaveLength(2) // Electronic and Chill tracks
      expect(recommendations[0]).toHaveProperty('personalizedScore')
      expect(recommendations.every(track => 
        mockUserProfile.preferences.genres.includes(track.genre) ||
        (track.bpm >= mockUserProfile.preferences.bpmRange[0] && 
         track.bpm <= mockUserProfile.preferences.bpmRange[1])
      )).toBe(true)
    })
  })

  describe('CollaborativeFiltering', () => {
    it('should generate collaborative recommendations', () => {
      const recommendations = CollaborativeFiltering.generateRecommendations(
        mockUserProfile,
        mockUsers,
        mockTracks
      )

      expect(recommendations).toHaveLength(1) // Only track '2' should be recommended
      expect(recommendations[0]).toHaveProperty('collaborativeScore')
      expect(recommendations[0].id).toBe('2')
    })
  })

  describe('HybridRecommendationSystem', () => {
    it('should generate all types of recommendations', () => {
      const recommendations = HybridRecommendationSystem.generateRecommendations(
        mockUserProfile,
        mockUsers,
        mockTracks
      )

      expect(recommendations).toHaveProperty('listening')
      expect(recommendations).toHaveProperty('personalized')
      expect(recommendations).toHaveProperty('collaborative')
      expect(recommendations).toHaveProperty('hybrid')
      
      expect(Array.isArray(recommendations.listening)).toBe(true)
      expect(Array.isArray(recommendations.personalized)).toBe(true)
      expect(Array.isArray(recommendations.collaborative)).toBe(true)
      expect(Array.isArray(recommendations.hybrid)).toBe(true)
    })

    it('should combine recommendations in hybrid system', () => {
      const recommendations = HybridRecommendationSystem.generateRecommendations(
        mockUserProfile,
        mockUsers,
        mockTracks
      )

      expect(recommendations.hybrid.length).toBeGreaterThan(0)
      expect(recommendations.hybrid[0]).toHaveProperty('hybridScore')
    })
  })
})