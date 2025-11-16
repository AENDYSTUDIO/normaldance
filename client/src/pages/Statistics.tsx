import { MusicDashboardLayout } from "@/components/MusicDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Music, Play, Heart, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const listenData = [
  { month: "Янв", plays: 120 },
  { month: "Фев", plays: 250 },
  { month: "Мар", plays: 180 },
  { month: "Апр", plays: 320 },
  { month: "Май", plays: 280 },
  { month: "Июн", plays: 450 },
];

const genreData = [
  { name: "Synthwave", value: 35, color: "#8B5CF6" },
  { name: "Future Bass", value: 25, color: "#3B82F6" },
  { name: "Chillstep", value: 20, color: "#10B981" },
  { name: "Cyberpunk", value: 12, color: "#F59E0B" },
  { name: "Другое", value: 8, color: "#6B7280" },
];

const topTracks = [
  { title: "Neon Dreams", plays: 1234, likes: 456 },
  { title: "Cyber Pulse", plays: 987, likes: 321 },
  { title: "Digital Echo", plays: 765, likes: 234 },
  { title: "Starlight", plays: 543, likes: 187 },
  { title: "Wave Form", plays: 432, likes: 156 },
];

export default function Statistics() {
  return (
    <MusicDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Статистика
          </h1>
          <p className="text-muted-foreground mt-1">
            Аналитика вашей музыкальной активности
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Всего прослушиваний", value: "2,543", change: "+12.5%", icon: Play, color: "text-blue-500" },
            { label: "Любимых треков", value: "87", change: "+5", icon: Heart, color: "text-red-500" },
            { label: "Подписчиков", value: "234", change: "+18", icon: Users, color: "text-green-500" },
            { label: "Загружено треков", value: "12", change: "+2", icon: Music, color: "text-purple-500" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-xs text-green-500 font-semibold">{stat.change}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Listening Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Активность прослушивания
                </CardTitle>
                <CardDescription>Прослушивания за последние 6 месяцев</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={listenData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="plays"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={{ fill: "#8B5CF6", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Genre Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary" />
                  Распределение по жанрам
                </CardTitle>
                <CardDescription>Ваши музыкальные предпочтения</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top Tracks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Топ треков</CardTitle>
              <CardDescription>Ваши самые прослушиваемые треки</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTracks.map((track, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{track.title}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {track.plays}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {track.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Календарь активности
              </CardTitle>
              <CardDescription>Ваша активность за последние 30 дней</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }).map((_, i) => {
                  const intensity = Math.random();
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-primary"
                      style={{
                        backgroundColor:
                          intensity > 0.7
                            ? "#8B5CF6"
                            : intensity > 0.4
                            ? "#8B5CF680"
                            : intensity > 0.2
                            ? "#8B5CF640"
                            : "#1a1a1a",
                      }}
                      title={`День ${i + 1}`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>Меньше</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-[#1a1a1a]" />
                  <div className="w-3 h-3 rounded-sm bg-[#8B5CF640]" />
                  <div className="w-3 h-3 rounded-sm bg-[#8B5CF680]" />
                  <div className="w-3 h-3 rounded-sm bg-[#8B5CF6]" />
                </div>
                <span>Больше</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MusicDashboardLayout>
  );
}
