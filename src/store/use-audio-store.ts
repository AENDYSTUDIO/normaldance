import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Track {
  id: string
  title: string
  artistName: string
  genre: string
  duration: number
  playCount: number
  likeCount: number
  ipfsHash: string
  audioUrl: string
  coverImage?: string
  metadata?: any
  price?: number
  isExplicit: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface AudioState {
  // Current playback state
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  isMuted: boolean
  currentTime: number
  duration: number
  
  // Queue management
  queue: Track[]
  currentQueueIndex: number
  history: Track[]
  
  // Playback modes
  shuffle: boolean
  repeat: 'off' | 'one' | 'all'
  
  // Actions
  play: () => void
  pause: () => void
  togglePlay: () => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  seekTo: (time: number) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  
  // Queue management
  setQueue: (tracks: Track[]) => void
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  playTrack: (track: Track, queue?: Track[]) => void
  playNext: () => void
  playPrevious: () => void
  
  // Playback modes
  toggleShuffle: () => void
  setRepeat: (mode: 'off' | 'one' | 'all') => void
  
  // History
  addToHistory: (track: Track) => void
  clearHistory: () => void
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTrack: null,
      isPlaying: false,
      volume: 70,
      isMuted: false,
      currentTime: 0,
      duration: 0,
      queue: [],
      currentQueueIndex: -1,
      history: [],
      shuffle: false,
      repeat: 'off',

      // Playback actions
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setVolume: (volume) => set({ volume }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      seekTo: (time) => set({ currentTime: time }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),

      // Queue management
      setQueue: (tracks) => set({ queue: tracks, currentQueueIndex: tracks.length > 0 ? 0 : -1 }),
      addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
      removeFromQueue: (index) => set((state) => {
        const newQueue = state.queue.filter((_, i) => i !== index)
        const newIndex = index <= state.currentQueueIndex ? state.currentQueueIndex - 1 : state.currentQueueIndex
        return { queue: newQueue, currentQueueIndex: newIndex }
      }),
      clearQueue: () => set({ queue: [], currentQueueIndex: -1 }),

      playTrack: (track, queue = []) => {
        const state = get()
        const newQueue = queue.length > 0 ? queue : state.queue
        const trackIndex = newQueue.findIndex(t => t.id === track.id)
        
        // Add to history
        if (state.currentTrack) {
          state.addToHistory(state.currentTrack)
        }
        
        set({
          currentTrack: track,
          queue: newQueue,
          currentQueueIndex: trackIndex,
          isPlaying: true,
          currentTime: 0
        })
      },

      playNext: () => {
        const state = get()
        if (!state.currentTrack || state.queue.length === 0) return

        let nextIndex = state.currentQueueIndex + 1
        
        if (state.shuffle) {
          // Random track (excluding current)
          const availableIndices = state.queue
            .map((_, i) => i)
            .filter(i => i !== state.currentQueueIndex)
          nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
        } else if (nextIndex >= state.queue.length) {
          if (state.repeat === 'all') {
            nextIndex = 0
          } else {
            // End of queue
            state.pause()
            return
          }
        }

        const nextTrack = state.queue[nextIndex]
        if (nextTrack) {
          state.addToHistory(state.currentTrack!)
          set({
            currentTrack: nextTrack,
            currentQueueIndex: nextIndex,
            currentTime: 0,
            isPlaying: true
          })
        }
      },

      playPrevious: () => {
        const state = get()
        if (!state.currentTrack) return

        if (state.currentTime > 3) {
          // If more than 3 seconds played, restart current track
          set({ currentTime: 0 })
          return
        }

        let prevIndex = state.currentQueueIndex - 1
        
        if (state.shuffle) {
          // Random previous track from history
          if (state.history.length > 0) {
            const randomHistoryIndex = Math.floor(Math.random() * state.history.length)
            const prevTrack = state.history[randomHistoryIndex]
            state.playTrack(prevTrack, state.queue)
            return
          }
        } else if (prevIndex < 0) {
          if (state.repeat === 'all') {
            prevIndex = state.queue.length - 1
          } else {
            return
          }
        }

        const prevTrack = state.queue[prevIndex]
        if (prevTrack) {
          set({
            currentTrack: prevTrack,
            currentQueueIndex: prevIndex,
            currentTime: 0,
            isPlaying: true
          })
        }
      },

      // Playback modes
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      setRepeat: (mode) => set({ repeat: mode }),

      // History
      addToHistory: (track) => set((state) => {
        const newHistory = [track, ...state.history].slice(0, 100) // Keep last 100 tracks
        return { history: newHistory }
      }),
      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'audio-store',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        shuffle: state.shuffle,
        repeat: state.repeat
      })
    }
  )
)