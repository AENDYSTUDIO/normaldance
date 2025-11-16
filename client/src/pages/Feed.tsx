import { MusicDashboardLayout } from "@/components/MusicDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Heart, Share2, Music, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";

const mockTracks = [
  {
    id: 1,
    title: "Midnight Echoes",
    artist: "DJ Aurora",
    plays: 15234,
    likes: 892,
    duration: "3:45",
    coverUrl: "/api/placeholder/80/80",
    isNew: true,
  },
  {
    id: 2,
    title: "Neon Dreams",
    artist: "Synthwave Master",
    plays: 23451,
    likes: 1543,
    duration: "4:12",
    coverUrl: "/api/placeholder/80/80",
    isNew: false,
  },
  {
    id: 3,
    title: "Digital Sunrise",
    artist: "Electronic Vibes",
    plays: 8765,
    likes: 432,
    duration: "3:28",
    coverUrl: "/api/placeholder/80/80",
    isNew: true,
  },
  {
    id: 4,
    title: "Cosmic Journey",
    artist: "Space Beats",
    plays: 31245,
    likes: 2134,
    duration: "5:03",
    coverUrl: "/api/placeholder/80/80",
    isNew: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Feed() {
  return (
    <MusicDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Лента</h1>
            <p className="text-muted-foreground mt-1">
              Персональные рекомендации и новинки
            </p>
          </div>
          <Button className="gradient-violet">
            <Music className="w-4 h-4 mr-2" />
            Создать плейлист
          </Button>
        </div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Всего прослушиваний
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">0</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +0% за последнюю неделю
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Любимые треки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">0</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Добавьте первый трек
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Время прослушивания
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">0 ч</div>
                <p className="text-xs text-muted-foreground mt-1">
                  За этот месяц
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recommended Tracks */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Рекомендации для вас</CardTitle>
                <CardDescription>На основе ваших предпочтений</CardDescription>
              </div>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {mockTracks.map((track) => (
                <motion.div
                  key={track.id}
                  variants={itemVariants}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 group"
                >
                  {/* Cover */}
                  <div className="relative w-16 h-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Music className="w-6 h-6 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    {track.isNew && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                        NEW
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {track.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {track.plays.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {track.likes.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {track.duration}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" className="h-8 w-8 gradient-violet">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </MusicDashboardLayout>
  );
}
