import { MusicDashboardLayout } from "@/components/MusicDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Bell, Shield, Send, Wallet, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    telegram: false,
  });

  const [telegramConnected, setTelegramConnected] = useState(false);

  const handleConnectTelegram = () => {
    toast.info("Перенаправление на Telegram Bot...");
    // In production, this would redirect to Telegram bot authorization
    setTimeout(() => {
      setTelegramConnected(true);
      toast.success("Telegram успешно подключен!");
    }, 1500);
  };

  const handleSaveProfile = () => {
    toast.success("Профиль обновлен!");
  };

  const handleSaveNotifications = () => {
    toast.success("Настройки уведомлений сохранены!");
  };

  return (
    <MusicDashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Настройки
          </h1>
          <p className="text-muted-foreground mt-1">
            Управляйте своим профилем и предпочтениями
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Уведомления
            </TabsTrigger>
            <TabsTrigger value="telegram">
              <Send className="w-4 h-4 mr-2" />
              Telegram
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Безопасность
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Информация профиля</CardTitle>
                  <CardDescription>Обновите свои персональные данные</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name" className="text-foreground">
                      Отображаемое имя
                    </Label>
                    <Input
                      id="display-name"
                      placeholder="Ваше имя"
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-foreground">
                      Биография
                    </Label>
                    <Input
                      id="bio"
                      placeholder="Расскажите о себе"
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-foreground">
                      Веб-сайт
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://yourwebsite.com"
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>

                  <Button className="w-full gradient-violet" onClick={handleSaveProfile}>
                    Сохранить изменения
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Настройки уведомлений</CardTitle>
                  <CardDescription>
                    Выберите, как вы хотите получать уведомления
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Email уведомления</Label>
                      <p className="text-sm text-muted-foreground">
                        Получать уведомления на email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Push уведомления</Label>
                      <p className="text-sm text-muted-foreground">
                        Получать push-уведомления в браузере
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, push: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Telegram уведомления</Label>
                      <p className="text-sm text-muted-foreground">
                        Получать уведомления в Telegram
                      </p>
                    </div>
                    <Switch
                      checked={notifications.telegram}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, telegram: checked })
                      }
                      disabled={!telegramConnected}
                    />
                  </div>

                  <Button className="w-full gradient-violet" onClick={handleSaveNotifications}>
                    Сохранить настройки
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Telegram Tab */}
          <TabsContent value="telegram" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-500" />
                    Интеграция Telegram
                  </CardTitle>
                  <CardDescription>
                    Подключите Telegram для расширенных функций
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Connection Status */}
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-foreground">Статус подключения</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {telegramConnected
                            ? "Telegram успешно подключен"
                            : "Telegram не подключен"}
                        </p>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          telegramConnected ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                    </div>

                    {!telegramConnected && (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={handleConnectTelegram}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Подключить Telegram
                      </Button>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Доступные функции:</h4>
                    <div className="space-y-2">
                      {[
                        "🤖 Telegram Mini App - полный доступ к платформе",
                        "⭐ Telegram Stars - платежная система",
                        "🔔 Push уведомления через Telegram",
                        "💎 TON Web3 кошелек через TON Connect 2.0",
                        "🎵 Управление музыкой через бота",
                        "📊 Статистика и аналитика",
                      ].map((feature, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            telegramConnected
                              ? "bg-green-500/10 border border-green-500/30"
                              : "bg-secondary/30"
                          }`}
                        >
                          <p
                            className={`text-sm ${
                              telegramConnected ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {feature}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bot Info */}
                  {telegramConnected && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-sm text-foreground">
                        <strong>Telegram Bot:</strong> @NormalDanceBot
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Используйте бота для быстрого доступа к функциям платформы
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Безопасность</CardTitle>
                  <CardDescription>Управляйте настройками безопасности</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Connected Wallets */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">
                      Подключенные кошельки
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: "Solana", connected: false, icon: "◎" },
                        { name: "Ethereum", connected: false, icon: "Ξ" },
                        { name: "TON", connected: false, icon: "💎" },
                      ].map((wallet) => (
                        <div
                          key={wallet.name}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{wallet.icon}</span>
                            <div>
                              <p className="font-medium text-foreground">{wallet.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {wallet.connected ? "Подключено" : "Не подключено"}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            {wallet.connected ? "Отключить" : "Подключить"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Приватность</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-foreground">Публичный профиль</Label>
                          <p className="text-sm text-muted-foreground">
                            Разрешить другим видеть ваш профиль
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-foreground">Показывать статистику</Label>
                          <p className="text-sm text-muted-foreground">
                            Отображать вашу статистику прослушивания
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-foreground">Анонимная аналитика</Label>
                          <p className="text-sm text-muted-foreground">
                            Помогите улучшить платформу
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </MusicDashboardLayout>
  );
}
