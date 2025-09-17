// Local type shims for audio components to avoid changing runtime logic

declare module '@/store/use-audio-store' {
  export interface AudioState {
    currentTrack: any
    isPlaying: boolean
    volume: number
    isMuted: boolean
    currentTime: number
    duration: number
    queue: any[]
    currentQueueIndex: number
    history: any[]
    shuffle: boolean
    repeat: 'off' | 'one' | 'all'
    play: (track?: any) => void
    pause: () => void
    setVolume: (v: number) => void
    toggleMute: () => void
    seekTo: (t: number) => void
    playNext: () => void
    playPrevious: () => void

    // Frequently referenced helpers used by UI
    toggleLike?: (trackId: string) => void
    createPlaylist?: (data: { name: string; description?: string; isPublic?: boolean }) => Promise<any>
    addToPlaylist?: (playlistId: string, track: any) => Promise<void>
    removeFromPlaylist?: (playlistId: string) => Promise<void>
    getUserPlaylists?: () => Promise<any[]>
    setCurrentPlaylist?: (playlistId: string) => void
    setDuration?: (seconds: number) => void
  }

  export function useAudioStore(): AudioState & {
    // access pattern used in code: useAudioStore.getState().setDuration(...)
  }

  export namespace useAudioStore {
    function getState(): Pick<AudioState, 'setDuration'>
  }
}

declare module '@/components/audio/audio-visualizer' {
  export interface AudioVisualizerProps {
    audioElement: HTMLAudioElement | null
    isPlaying: boolean
    type?: 'bars' | 'wave' | 'circle' | 'particles' | string
    color?: string
    sensitivity?: number
  }
  export const AudioVisualizer: React.ComponentType<AudioVisualizerProps>
}

// Extend existing Track and AudioState interfaces for external usage without changing runtime code
// These are ambient declarations to satisfy TS where UI references optional fields/methods.

import type { Track as StoreTrack } from '@/store/use-audio-store'

declare global {
  // Augment the Track type with optional fields referenced in UI
  interface Track extends StoreTrack {
    isPremium?: boolean
    bitrate?: number
    year?: number | string
    label?: string
  }

  // Minimal shims for functions possibly referenced in UI components
  interface AudioStoreShims {
    toggleLike?: (trackId: string) => void
    createPlaylist?: (data: { name: string; description?: string; isPublic?: boolean }) => Promise<any>
    addToPlaylist?: (playlistId: string, track: StoreTrack) => Promise<void>
    removeFromPlaylist?: (playlistId: string, trackId: string) => Promise<void>
    getUserPlaylists?: () => Promise<any[]>
    setCurrentPlaylist?: (playlistId: string) => void
  }
}

export {}
