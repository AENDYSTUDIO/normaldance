import { create } from 'zustand'

interface Track {
  id: string
  title: string
  artist: string
  audioUrl: string
  coverUrl?: string
  duration: number
  price?: number
}

interface TracksState {
  tracks: Track[]
  currentTrack: Track | null
  isPlaying: boolean
  favorites: string[]
  setTracks: (tracks: Track[]) => void
  setCurrentTrack: (track: Track | null) => void
  setPlaying: (playing: boolean) => void
  toggleFavorite: (trackId: string) => void
}

export const useTracksStore = create<TracksState>((set, get) => ({
  tracks: [],
  currentTrack: null,
  isPlaying: false,
  favorites: [],
  setTracks: (tracks) => set({ tracks }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  toggleFavorite: (trackId) => {
    const { favorites } = get()
    const newFavorites = favorites.includes(trackId)
      ? favorites.filter(id => id !== trackId)
      : [...favorites, trackId]
    set({ favorites: newFavorites })
  },
}))