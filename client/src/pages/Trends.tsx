import { MusicDashboardLayout } from "@/components/MusicDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Music, Play, Flame } from "lucide-react";
import { motion } from "framer-motion";

const trendingTracks = [
  { id: 1, title: "Hypernova", artist: "Stellar Beats", change: 15, plays: 125000, position: 1 },
  { id: 2, title: "Electric Soul", artist: "Neon Pulse", change: 8, plays: 98000, position: 2 },
  { id: 3, title: "Quantum Leap", artist: "Future Sound", change: -2, plays: 87000, position: 3 },
  { id: 4, title: "Aurora Borealis", artist: "Arctic Waves", change: 12, plays: 76000, position: 4 },
  { id: 5, title: "Cyber Dreams", artist: "Digital Echo", change: 5, plays: 65000, position: 5 },
  { id: 6, title: "Starlight", artist: "Cosmic DJ", change: -1, plays: 54000, position: 6 },
  { id: 7, title: "Neon Nights", artist: "City Lights", change: 20, plays: 48000, position: 7 },
  { id: 8, title: "Gravity", artist: "Space Vibes", change: 3, plays: 42000, position: 8 },
  { id: 9, title: "Phoenix Rising", artist: "Fire Beats", change: 25, plays: 38000, position: 9 },
  { id: 10, title: "Ocean Waves", artist: "Deep Blue", change: -5, plays: 35000, position: 10 },
];

const trendingGenres = [
  { name: "Synthwave", growth: 45, tracks: 1234 },
  { name: "Future Bass", growth: 38, tracks: 987 },
  { name: "Chillstep", growth: 32, tracks: 756 },
  { name: "Cyberpunk", growth: 28, tracks: 654 },
];

export default function Trends() {
  return (
    <MusicDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Flame className="w-8 h-8 text-primary" />
            Тренды
          </h1>
          <p className="text-muted-foreground mt-1">
            Самые популярные треки прямо сейчас
          </p>
        </div>

        {/* Trending Genres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingGenres.map((genre, index) => (
            <motion.div
              key={genre.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {genre.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {genre.tracks} треков
                      </p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      +{genre.growth}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Top Charts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Топ-10 треков
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trendingTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 group"
                >
                  {/* Position */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-foreground font-bold text-sm flex-shrink-0">
                    {track.position}
                  </div>

                  {/* Cover */}
                  <div className="relative w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Music className="w-5 h-5 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {track.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4 text-sm">
                    <div className="text-muted-foreground">
                      {track.plays.toLocaleString()} plays
                    </div>
                    <div
                      className={`flex items-center gap-1 font-semibold ${
                        track.change > 0
                          ? "text-green-500"
                          : track.change < 0
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {track.change > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : track.change < 0 ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : null}
                      {Math.abs(track.change)}
                    </div>
                  </div>

                  {/* Play button */}
                  <Button
                    size="icon"
                    className="h-9 w-9 gradient-violet opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MusicDashboardLayout>
  );
}
