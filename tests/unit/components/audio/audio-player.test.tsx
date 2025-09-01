import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioPlayer } from '@/components/audio/audio-player';
import { useAudioStore } from '@/store/use-audio-store';
import useNetworkStatus from '@/hooks/useNetworkStatus';

jest.mock('@/store/use-audio-store');
jest.mock('@/hooks/useNetworkStatus');
jest.mock('@/components/audio/audio-visualizer', () => ({
  AudioVisualizer: () => <div data-testid="audio-visualizer">Visualizer</div>
}));
jest.mock('@/components/audio/playlist-manager', () => ({
  PlaylistManager: () => <div data-testid="playlist-manager">Playlist Manager</div>
}));

const mockTrack = {
  id: '1',
  title: 'Test Track',
  artistName: 'Test Artist',
  genre: 'Electronic',
  duration: 180,
  playCount: 1000,
  likeCount: 50,
  ipfsHash: 'test-hash',
  audioUrl: '/audio/test.mp3',
  coverImage: '/images/test.jpg',
  isExplicit: false,
  isPublished: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
};

const mockAudioStore = {
  currentTrack: mockTrack,
  isPlaying: false,
  volume: 70,
  isMuted: false,
  currentTime: 30,
  duration: 180,
  queue: [mockTrack],
  currentQueueIndex: 0,
  history: [],
  shuffle: false,
  repeat: 'off' as const,
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
  clearQueue: jest.fn()
};

describe('AudioPlayer', () => {
  beforeEach(() => {
    (useAudioStore as jest.Mock).mockReturnValue(mockAudioStore);
    (useNetworkStatus as jest.Mock).mockReturnValue({ effectiveType: '4g' });
    
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      writable: true,
      value: jest.fn().mockImplementation(() => Promise.resolve()),
    });
    Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
      writable: true,
      value: jest.fn(),
    });
  });

  it('renders track information correctly', () => {
    render(<AudioPlayer />);
    
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('calls play when play button is clicked', () => {
    render(<AudioPlayer />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    
    expect(mockAudioStore.play).toHaveBeenCalledWith(mockTrack);
  });

  it('adapts audio quality for slow networks', () => {
    (useNetworkStatus as jest.Mock).mockReturnValue({ effectiveType: '2g' });
    
    render(<AudioPlayer />);
    
    const audioElement = document.querySelector('audio');
    expect(audioElement?.src).toContain('_low.mp3');
  });

  it('returns null when no current track', () => {
    (useAudioStore as jest.Mock).mockReturnValue({
      ...mockAudioStore,
      currentTrack: null
    });
    
    const { container } = render(<AudioPlayer />);
    expect(container.firstChild).toBeNull();
  });
});