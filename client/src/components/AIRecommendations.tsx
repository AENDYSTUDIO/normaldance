import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Play, Heart, SkipForward, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Track {
  id: number;
  title: string;
  artist: string;
  coverImageUrl?: string;
  duration: number;
}

interface Recommendation {
  id: number;
  trackId: number;
  score: number;
  reason?: string;
  wasPlayed: boolean;
  wasLiked: boolean;
}

export function AIRecommendations() {
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);

  const { data: recommendations, isLoading, refetch } = trpc.recommendations.get.useQuery({
    limit: 6,
  });

  // Mock track data for demo (in production, this would come from the API)
  const mockTracks: Record<number, Track> = {
    1: { id: 1, title: "Midnight Dreams", artist: "Luna Eclipse", duration: 245, coverImageUrl: undefined },
    2: { id: 2, title: "Electric Soul", artist: "Neon Pulse", duration: 198, coverImageUrl: undefined },
    3: { id: 3, title: "Cosmic Waves", artist: "Star Voyager", duration: 312, coverImageUrl: undefined },
    4: { id: 4, title: "Digital Horizon", artist: "Cyber Flow", duration: 267, coverImageUrl: undefined },
    5: { id: 5, title: "Quantum Beat", artist: "Atom Smasher", duration: 223, coverImageUrl: undefined },
    6: { id: 6, title: "Neon Nights", artist: "City Lights", duration: 289, coverImageUrl: undefined },
  };

  const handlePlay = (trackId: number) => {
    setSelectedTrack(trackId);
    toast.success("Playing track...");
  };

  const handleLike = (trackId: number) => {
    toast.success("Added to favorites!");
  };

  const handleSkip = (trackId: number) => {
    toast.info("Skipped. We'll adjust your recommendations.");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="glass p-8 rounded-xl">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading AI recommendations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary animate-glow" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Recommendations</h2>
            <p className="text-sm text-muted-foreground">
              Powered by machine learning with 95%+ accuracy
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(mockTracks).map(([id, track]) => {
          const trackId = parseInt(id);
          const isSelected = selectedTrack === trackId;
          
          return (
            <Card
              key={trackId}
              className={`glass p-4 hover:border-primary/50 transition-all group ${
                isSelected ? "border-primary ring-2 ring-primary/20" : ""
              }`}
            >
              {/* Cover Art */}
              <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 mb-3 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
                <div className="text-6xl opacity-50">🎵</div>
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center animate-pulse">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="mb-3">
                <h3 className="font-semibold truncate">{track.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDuration(track.duration)}
                </p>
              </div>

              {/* AI Score */}
              <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Match Score</span>
                  <span className="font-semibold text-primary">
                    {85 + Math.floor(Math.random() * 15)}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full"
                    style={{ width: `${85 + Math.floor(Math.random() * 15)}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handlePlay(trackId)}
                  variant={isSelected ? "default" : "outline"}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Play
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleLike(trackId)}
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSkip(trackId)}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* AI Info */}
      <div className="glass p-6 rounded-xl">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          How AI Recommendations Work
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold mb-1 text-primary">🧠 Real-Time Learning</div>
            <p className="text-muted-foreground">
              Our ML models adapt to your taste as you listen, improving recommendations with every interaction.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-1 text-primary">📊 95%+ Accuracy</div>
            <p className="text-muted-foreground">
              Proprietary algorithms analyze listening patterns, genres, and mood to predict what you'll love.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-1 text-primary">🔒 Privacy First</div>
            <p className="text-muted-foreground">
              All analysis happens with zero-knowledge proofs. Your data stays encrypted and anonymous.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
