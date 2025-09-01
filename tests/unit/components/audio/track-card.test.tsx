import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrackCard } from '@/components/audio/track-card';
import { useAudioStore } from '@/store/use-audio-store';
import useNetworkStatus from '@/hooks/useNetworkStatus';

jest.mock('@/store/use-audio-store');
jest.mock('@/hooks/useNetworkStatus');

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
  isExplicit: true,
  isPublished: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
};

const mockAudioStore = {
  currentTrack: null,
  isPlaying: false,
  playTrack: jest.fn(),
  pause: jest.fn(),
  toggleLike: jest.fn()
};

describe('TrackCard', () => {
  beforeEach(() => {
    (useAudioStore as jest.Mock).mockReturnValue(mockAudioStore);
    (useNetworkStatus as jest.Mock).mockReturnValue({ effectiveType: '4g' });
  });

  it('renders track information correctly', () => {
    render(<TrackCard track={mockTrack} />);
    
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Electronic')).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument();
  });

  it('shows explicit content badge when track is explicit', () => {
    render(<TrackCard track={mockTrack} />);
    
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('uses placeholder image for slow networks', () => {
    (useNetworkStatus as jest.Mock).mockReturnValue({ effectiveType: '2g' });
    
    render(<TrackCard track={mockTrack} />);
    
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', '/placeholder-album.jpg');
  });

  it('calls playTrack when clicked', () => {
    render(<TrackCard track={mockTrack} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(mockAudioStore.playTrack).toHaveBeenCalledWith(mockTrack);
  });

  it('shows pause button when track is currently playing', () => {
    (useAudioStore as jest.Mock).mockReturnValue({
      ...mockAudioStore,
      currentTrack: mockTrack,
      isPlaying: true
    });
    
    render(<TrackCard track={mockTrack} />);
    
    expect(screen.getByTestId('pause-icon')).toBeInTheDocument();
  });

  it('formats play count correctly', () => {
    const trackWithHighPlayCount = {
      ...mockTrack,
      playCount: 1500000
    };
    
    render(<TrackCard track={trackWithHighPlayCount} />);
    
    expect(screen.getByText('1.5M')).toBeInTheDocument();
  });
});