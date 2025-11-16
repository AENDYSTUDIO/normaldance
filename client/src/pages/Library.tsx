import { MusicDashboardLayout } from "@/components/MusicDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Library as LibraryIcon, Music, ListMusic, Heart, Clock, Play, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Library() {
  return (
    <MusicDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <LibraryIcon className="w-8 h-8 text-primary" />
              Библиотека
            </h1>
            <p className="text-muted-foreground mt-1">
              Ваша коллекция музыки
            </p>
          </div>
          <Button className="gradient-violet">
            <Plus className="w-4 h-4 mr-2" />
            Создать плейлист
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="playlists" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="playlists">
              <ListMusic className="w-4 h-4 mr-2" />
              Плейлисты
            </TabsTrigger>
            <TabsTrigger value="liked">
              <Heart className="w-4 h-4 mr-2" />
              Любимое
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="w-4 h-4 mr-2" />
              Недавние
            </TabsTrigger>
          </TabsList>

          {/* Playlists Tab */}
          <TabsContent value="playlists" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <ListMusic className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Нет плейлистов
              </h3>
              <p className="text-muted-foreground mb-6">
                Создайте свой первый плейлист
              </p>
              <Button className="gradient-violet">
                <Plus className="w-4 h-4 mr-2" />
                Создать плейлист
              </Button>
            </motion.div>
          </TabsContent>

          {/* Liked Tab */}
          <TabsContent value="liked" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Нет любимых треков
              </h3>
              <p className="text-muted-foreground mb-6">
                Добавьте треки в избранное
              </p>
              <Button className="gradient-violet">
                Обзор музыки
              </Button>
            </motion.div>
          </TabsContent>

          {/* Recent Tab */}
          <TabsContent value="recent" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                История пуста
              </h3>
              <p className="text-muted-foreground mb-6">
                Начните слушать музыку
              </p>
              <Button className="gradient-violet">
                Обзор музыки
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </MusicDashboardLayout>
  );
}
