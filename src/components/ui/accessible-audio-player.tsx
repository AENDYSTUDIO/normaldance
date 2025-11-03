'use client'

import { useRef, useState } from 'react';
import { Button } from './button';
import { Slider } from './slider';

interface AccessibleAudioPlayerProps {
  src: string;
  title: string;
  artist: string;
}

export function AccessibleAudioPlayer({ src, title, artist }: AccessibleAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div 
      role="region" 
      aria-label={`Audio player for ${title} by ${artist}`}
      className="p-4 border rounded-lg"
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        aria-label={`${title} by ${artist}`}
      />
      
      <div className="mb-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{artist}</p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={togglePlay}
          aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
          className="w-12 h-12"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </Button>

        <div className="flex-1">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={([value]) => {
              if (audioRef.current) {
                audioRef.current.currentTime = value;
                setCurrentTime(value);
              }
            }}
            aria-label="Seek audio position"
            className="w-full"
          />
        </div>

        <span 
          className="text-sm tabular-nums"
          aria-live="polite"
          aria-label={`Current time: ${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')}`}
        >
          {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / 
          {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}