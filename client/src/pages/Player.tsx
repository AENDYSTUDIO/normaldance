import { Button } from "@/components/ui/button";
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, Heart, Share2, Repeat, Shuffle, ListMusic } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface Track {
  id: number;
  title: string;
  artist: string;
  coverImageUrl?: string;
  duration: number;
  ipfsCid?: string;
}

export default function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [queue, setQueue] = useState<Track[]>([
    { id: 1, title: "Midnight Dreams", artist: "Luna Eclipse", duration: 245 },
    { id: 2, title: "Electric Soul", artist: "Neon Pulse", duration: 198 },
    { id: 3, title: "Cosmic Waves", artist: "Star Voyager", duration: 312 },
    { id: 4, title: "Digital Horizon", artist: "Cyber Flow", duration: 267 },
  ]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showQueue, setShowQueue] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentTrack = queue[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    drawWaveform();
  }, [currentTime, duration]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw waveform bars
    const barCount = 100;
    const barWidth = width / barCount;
    const progress = duration > 0 ? currentTime / duration : 0;

    for (let i = 0; i < barCount; i++) {
      const barHeight = Math.random() * height * 0.8 + height * 0.1;
      const x = i * barWidth;
      const isPast = i / barCount < progress;

      ctx.fillStyle = isPast ? "rgb(147, 51, 234)" : "rgba(147, 51, 234, 0.3)";
      ctx.fillRect(x, (height - barHeight) / 2, barWidth - 2, barHeight);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate playback
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            clearInterval(interval);
            skipForward();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * currentTrack.duration;

    setCurrentTime(newTime);
  };

  const skipForward = () => {
    if (currentTrackIndex < queue.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const skipBackward = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <a className="flex items-center gap-2">
                <Music className="w-8 h-8 text-primary animate-glow" />
                <span className="text-xl font-bold gradient-text">{APP_TITLE}</span>
              </a>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/explore">
                <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Explore
                </a>
              </Link>
              <Link href="/memorials">
                <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  G.Rave Memorials
                </a>
              </Link>
              <Link href="/player">
                <a className="text-sm font-medium text-primary">Player</a>
              </Link>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="container max-w-6xl">
          {/* Now Playing */}
          <div className="glass p-8 rounded-2xl mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Album Art */}
              <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden group">
                {currentTrack.coverImageUrl ? (
                  <img
                    src={currentTrack.coverImageUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-9xl opacity-30">🎵</div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                )}
              </div>

              {/* Track Info */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Now Playing</div>
                  <h1 className="text-4xl font-bold mb-2">{currentTrack.title}</h1>
                  <p className="text-xl text-muted-foreground mb-6">{currentTrack.artist}</p>

                  {/* Waveform */}
                  <div className="mb-6">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={100}
                      className="w-full h-24 cursor-pointer rounded-lg"
                      onClick={handleSeek}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(currentTrack.duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Button variant="ghost" size="icon">
                      <Shuffle className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={skipBackward} disabled={currentTrackIndex === 0}>
                      <SkipBack className="w-6 h-6" />
                    </Button>
                    <Button
                      size="icon"
                      className="w-14 h-14 vinyl-glow"
                      onClick={togglePlay}
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7" />
                      ) : (
                        <Play className="w-7 h-7" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={skipForward} disabled={currentTrackIndex === queue.length - 1}>
                      <SkipForward className="w-6 h-6" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Repeat className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Secondary Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => toast.success("Added to favorites!")}>
                        <Heart className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toast.success("Share link copied!")}>
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-24"
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQueue(!showQueue)}
                    >
                      <ListMusic className="w-4 h-4 mr-2" />
                      Queue ({queue.length})
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Queue */}
          {showQueue && (
            <div className="glass p-6 rounded-xl mb-8">
              <h2 className="text-xl font-bold mb-4">Up Next</h2>
              <div className="space-y-2">
                {queue.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setCurrentTrackIndex(index);
                      setCurrentTime(0);
                      setIsPlaying(true);
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      index === currentTrackIndex
                        ? "bg-primary/20 border border-primary/50"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xl">
                          {index === currentTrackIndex && isPlaying ? "▶" : "🎵"}
                        </div>
                        <div>
                          <div className="font-medium">{track.title}</div>
                          <div className="text-sm text-muted-foreground">{track.artist}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(track.duration)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* IPFS Info */}
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-3">Decentralized Streaming</h3>
            <p className="text-sm text-muted-foreground mb-4">
              All tracks are stored on IPFS for permanent, censorship-resistant access. 
              Your listening history is encrypted and stored with zero-knowledge proofs.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>IPFS Connected</span>
              </div>
              <div className="text-muted-foreground">
                CID: {currentTrack.ipfsCid || "Qm..."}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}
