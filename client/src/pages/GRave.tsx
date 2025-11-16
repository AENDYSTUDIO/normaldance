import { MusicDashboardLayout } from "@/components/MusicDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Heart, Sparkles, Music, DollarSign, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const memorials = [
  {
    id: 1,
    dedicatedTo: "Александр Петров",
    track: "Eternal Melody",
    candles: 27,
    donations: 5.2,
    message: "В память о великом музыканте",
    created: "2024-01-10",
  },
  {
    id: 2,
    dedicatedTo: "Мария Иванова",
    track: "Starlight Symphony",
    candles: 27,
    donations: 3.8,
    message: "Твоя музыка живет вечно",
    created: "2024-01-05",
  },
];

export default function GRave() {
  const [formData, setFormData] = useState({
    dedicatedTo: "",
    trackId: "",
    message: "",
    donationAmount: "",
  });

  const handleCreateMemorial = () => {
    if (!formData.dedicatedTo || !formData.trackId) {
      toast.error("Заполните обязательные поля");
      return;
    }
    toast.success("Мемориал создан успешно!");
    setFormData({ dedicatedTo: "", trackId: "", message: "", donationAmount: "" });
  };

  return (
    <MusicDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Flame className="w-8 h-8 text-primary animate-pulse" />
            G.Rave Memorial
          </h1>
          <p className="text-muted-foreground mt-1">
            Создайте вечный музыкальный мемориал с 3D визуализацией винила
          </p>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-violet border-0 text-white">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Sparkles className="w-12 h-12 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Что такое G.Rave Memorial?</h3>
                  <p className="text-white/90 mb-3">
                    G.Rave - это уникальная система создания музыкальных мемориалов с 3D визуализацией
                    виниловой пластинки и 27 дорожками свечей. Каждый мемориал хранится в блокчейне
                    и IPFS, обеспечивая вечное хранение памяти.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="font-semibold mb-1">💎 Блокчейн</p>
                      <p className="text-white/80">Ethereum/Polygon смарт-контракты</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="font-semibold mb-1">🕯️ 27 свечей</p>
                      <p className="text-white/80">Символизируют вечную память</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="font-semibold mb-1">💰 Наследование</p>
                      <p className="text-white/80">98% наследникам, 2% платформе</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Create Memorial Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Создать мемориал</CardTitle>
              <CardDescription>
                Увековечьте память с помощью музыки и 3D визуализации
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dedicated To */}
              <div className="space-y-2">
                <Label htmlFor="dedicated-to" className="text-foreground">
                  Посвящается *
                </Label>
                <Input
                  id="dedicated-to"
                  placeholder="Имя человека"
                  className="bg-secondary border-border text-foreground"
                  value={formData.dedicatedTo}
                  onChange={(e) => setFormData({ ...formData, dedicatedTo: e.target.value })}
                />
              </div>

              {/* Track Selection */}
              <div className="space-y-2">
                <Label htmlFor="track-id" className="text-foreground">
                  Выберите трек *
                </Label>
                <Input
                  id="track-id"
                  placeholder="ID трека или название"
                  className="bg-secondary border-border text-foreground"
                  value={formData.trackId}
                  onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Трек будет воспроизводиться на 3D виниле с 27 свечами
                </p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">
                  Сообщение памяти
                </Label>
                <Textarea
                  id="message"
                  placeholder="Напишите памятное сообщение..."
                  className="bg-secondary border-border text-foreground min-h-24"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {/* Initial Donation */}
              <div className="space-y-2">
                <Label htmlFor="donation" className="text-foreground">
                  Начальное пожертвование (опционально)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="donation"
                    type="number"
                    placeholder="0.00"
                    className="bg-secondary border-border text-foreground pl-10"
                    value={formData.donationAmount}
                    onChange={(e) => setFormData({ ...formData, donationAmount: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  98% пойдет наследникам, 2% на поддержку платформы
                </p>
              </div>

              {/* Create Button */}
              <Button
                className="w-full gradient-violet"
                size="lg"
                onClick={handleCreateMemorial}
              >
                <Flame className="w-4 h-4 mr-2" />
                Создать мемориал
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Existing Memorials */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Существующие мемориалы
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memorials.map((memorial, index) => (
              <motion.div
                key={memorial.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border hover:border-primary/50 transition-all group">
                  <CardContent className="pt-6">
                    {/* 3D Vinyl Visualization Placeholder */}
                    <div className="aspect-square bg-gradient-violet rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full bg-black/30 border-4 border-white/20 flex items-center justify-center">
                          <Music className="w-16 h-16 text-white/60" />
                        </div>
                      </div>
                      {/* Candles visualization */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {Array.from({ length: 27 }).map((_, i) => {
                          const angle = (i / 27) * 2 * Math.PI;
                          const radius = 120;
                          const x = 50 + radius * Math.cos(angle) / 2;
                          const y = 50 + radius * Math.sin(angle) / 2;
                          return (
                            <div
                              key={i}
                              className="absolute w-2 h-2 bg-amber-500 rounded-full animate-pulse"
                              style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                animationDelay: `${i * 0.1}s`,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Memorial Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Heart className="w-5 h-5 text-red-500" />
                          {memorial.dedicatedTo}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {memorial.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Music className="w-4 h-4 text-primary" />
                        <span className="text-foreground font-medium">{memorial.track}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Свечи</p>
                          <p className="text-lg font-semibold text-foreground">
                            🕯️ {memorial.candles}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Пожертвования</p>
                          <p className="text-lg font-semibold text-primary">
                            ${memorial.donations.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Heart className="w-4 h-4 mr-2" />
                          Зажечь свечу
                        </Button>
                        <Button size="sm" className="flex-1 gradient-violet">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Пожертвовать
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </MusicDashboardLayout>
  );
}
