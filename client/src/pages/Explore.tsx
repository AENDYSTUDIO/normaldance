import { MusicDashboardLayout } from "@/components/MusicDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Music, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const genres = [
  "Synthwave", "Future Bass", "Chillstep", "Cyberpunk", "Lo-Fi", "Trap",
  "House", "Techno", "Dubstep", "Ambient", "Drum & Bass", "Trance"
];

const featuredPlaylists = [
  { id: 1, name: "Midnight Vibes", tracks: 42, cover: "🌙" },
  { id: 2, name: "Workout Energy", tracks: 35, cover: "💪" },
  { id: 3, name: "Focus Flow", tracks: 28, cover: "🎯" },
  { id: 4, name: "Chill Beats", tracks: 56, cover: "🌊" },
  { id: 5, name: "Party Mix", tracks: 48, cover: "🎉" },
  { id: 6, name: "Study Session", tracks: 31, cover: "📚" },
];

const newReleases = [
  { id: 1, title: "Neon Pulse", artist: "Cyber Beats", date: "2 days ago" },
  { id: 2, title: "Digital Rain", artist: "Future Sound", date: "3 days ago" },
  { id: 3, title: "Starlight Echo", artist: "Space Vibes", date: "5 days ago" },
  { id: 4, title: "Electric Dreams", artist: "Synth Master", date: "1 week ago" },
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MusicDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Обзор
          </h1>
          <p className="text-muted-foreground mt-1">
            Открывайте новую музыку каждый день
          </p>
        </div>

        {/* Search */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск треков, исполнителей, плейлистов..."
                className="pl-10 bg-secondary border-border text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Genres */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Жанры</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {genres.map((genre, index) => (
              <motion.div
                key={genre}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-16 text-base font-semibold hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all"
                >
                  {genre}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Featured Playlists */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Избранные плейлисты
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPlaylists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg bg-gradient-violet flex items-center justify-center text-4xl flex-shrink-0 relative overflow-hidden">
                        {playlist.cover}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {playlist.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {playlist.tracks} треков
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* New Releases */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Новые релизы
          </h2>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {newReleases.map((release, index) => (
                  <motion.div
                    key={release.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      <Music className="w-5 h-5 text-muted-foreground" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">
                        {release.title}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {release.artist}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {release.date}
                    </div>
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
      </div>
    </MusicDashboardLayout>
  );
}
