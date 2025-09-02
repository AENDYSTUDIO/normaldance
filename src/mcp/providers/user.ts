export interface UserProfile {
  id: string;
  name: string;
  favoriteGenres: string[];
  currentMood?: string;
  publicData: any;
}

export interface PlayHistory {
  trackId: string;
  playedAt: Date;
  duration: number;
}

export class UserContextProvider {
  async getUser(userId: string): Promise<UserProfile | null> {
    // Mock implementation - replace with actual database query
    return {
      id: userId,
      name: 'Sample User',
      favoriteGenres: ['Electronic', 'Drum & Bass', 'Ambient'],
      currentMood: 'energetic',
      publicData: {
        totalListeningTime: 12000,
        favoriteArtists: ['Artist 1', 'Artist 2'],
        achievements: ['First Listen', 'Music Explorer']
      }
    };
  }

  async getListeningHistory(userId: string, limit: number = 100): Promise<PlayHistory[]> {
    // Mock implementation
    return [
      {
        trackId: 'track1',
        playedAt: new Date(),
        duration: 180
      }
    ];
  }

  async getUserPreferences(userId: string): Promise<any> {
    return {
      audioQuality: 'high',
      autoplay: true,
      notifications: true,
      privacy: 'friends'
    };
  }

  async getUserAchievements(userId: string): Promise<any[]> {
    return [
      {
        id: 'first_listen',
        name: 'First Listen',
        description: 'Listened to your first track',
        unlockedAt: new Date(),
        category: 'musical'
      }
    ];
  }
}