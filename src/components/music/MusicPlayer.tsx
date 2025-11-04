import React, { useState, useEffect } from 'react';
import { InvisibleWalletAdapterImpl } from '@/components/wallet/invisible-wallet-adapter';
import { MusicAccessButton } from './MusicAccessButton';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  audioUrl: string;
  price: number;
  durationMinutes: number;
  coverImage?: string;
}

interface MusicPlayerProps {
  wallet: InvisibleWalletAdapterImpl;
  currentTrack?: Track;
  tracks: Track[];
  autoPlay?: boolean;
  showPurchaseButton?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  wallet,
  currentTrack,
  tracks,
  autoPlay = false,
  showPurchaseButton = true
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.volume = volume;
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleAudioEnded);
      setAudioRef(audio);
      
      return () => {
        audio.pause();
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleAudioEnded);
      };
    }
  }, []);

  // Handle track changes
  useEffect(() => {
    if (audioRef && currentTrack) {
      checkTrackAccess();
      audioRef.src = currentTrack.audioUrl;
      if (autoPlay) {
        playTrack();
      }
    }
  }, [currentTrack, audioRef, autoPlay]);

  // Check access to current track
  const checkTrackAccess = async () => {
    if (!currentTrack || !wallet.connected) {
      setHasAccess(false);
      return;
    }

    try {
      const accessData = {
        trackId: currentTrack.id,
        artistId: currentTrack.artist,
        accessPrice: currentTrack.price,
        accessDuration: currentTrack.durationMinutes * 60,
        maxAccesses: 1
      };

      const canAccess = await wallet.checkTrackAccess(currentTrack.id, accessData);
      setHasAccess(canAccess);
    } catch (error) {
      console.error("Error checking track access:", error);
      setHasAccess(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef) {
      setCurrentTime(audioRef.currentTime);
      setDuration(audioRef.duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef) {
      setDuration(audioRef.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    // Auto-play next track if available
    if (autoPlay && tracks.length > 1) {
      const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
      const nextIndex = (currentIndex + 1) % tracks.length;
      handleTrackSelect(tracks[nextIndex]);
    }
  };

  const playTrack = async () => {
    if (!audioRef || !wallet.connected) return;

    // Check access before playing
    if (currentTrack) {
      await checkTrackAccess();
      
      if (!hasAccess) {
        console.log("No access to this track");
        return;
      }
    }

    try {
      await audioRef.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing track:", error);
      // Handle playback errors (e.g., network issues)
    }
  };

  const pauseTrack = () => {
    if (audioRef) {
      audioRef.pause();
      setIsPlaying(false);
    }
  };

  const handleTrackSelect = (track: Track) => {
    // This would be handled by parent component
    console.log("Track selected:", track.id);
  };

  const handleSeek = (time: number) => {
    if (audioRef) {
      audioRef.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef) {
      audioRef.volume = newVolume;
    }
  };

  const handlePurchaseSuccess = (transactionId: string) => {
    console.log("Purchase successful:", transactionId);
    checkTrackAccess();
    // Auto-play after successful purchase
    if (currentTrack) {
      playTrack();
    }
  };

  const handlePurchaseError = (error: Error) => {
    console.error("Purchase failed:", error);
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress bar calculation
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) {
    return (
      <div className="music-player empty h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">No track selected</p>
      </div>
    );
  }

  return (
    <div className="music-player bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Track Info */}
      <div className="track-info p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {currentTrack.coverImage && (
            <img
              src={currentTrack.coverImage}
              alt={currentTrack.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{currentTrack.title}</h3>
            <p className="text-sm text-gray-600 truncate">{currentTrack.artist}</p>
            <p className="text-xs text-gray-500">{currentTrack.duration}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar px-4 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 w-10">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 bg-gray-200 rounded-full h-1 relative">
            <div
              className="absolute top-0 left-0 bg-blue-500 h-1 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="controls p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {/* Previous Track */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={tracks.length <= 1}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832l-5 3a1 1 0 000 1.664l5 3z"/>
                <path d="M15.445 14.832A1 1 0 0017 14v-8a1 1 0 00-1.555-.832l-5 3a1 1 0 000 1.664l5 3z"/>
              </svg>
            </button>

            {/* Play/Pause */}
            {!hasAccess ? (
              <div className="p-2 text-sm text-orange-500">
                📵 No Access
              </div>
            ) : (
              <button
                onClick={isPlaying ? pauseTrack : playTrack}
                className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
            )}

            {/* Next Track */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={tracks.length <= 1}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832l5-3a1 1 0 000-1.664l-5-3z"/>
                <path d="M11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832l5-3a1 1 0 000-1.664l-5-3z"/>
              </svg>
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"/>
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Purchase Button */}
        {showPurchaseButton && !hasAccess && (
          <MusicAccessButton
            wallet={wallet}
            track={{
              id: currentTrack.id,
              title: currentTrack.title,
              artist: currentTrack.artist,
              price: currentTrack.price,
              durationMinutes: currentTrack.durationMinutes,
              ndtRequired: currentTrack.price
            }}
            onSuccess={handlePurchaseSuccess}
            onError={handlePurchaseError}
          />
        )}

        {/* Access Status */}
        {hasAccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">
              ✅ You have access to this track
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;
