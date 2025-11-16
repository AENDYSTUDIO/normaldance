import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, Home, TrendingUp, Compass, Library, Upload, Wallet, DollarSign, Star, BarChart3, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_TITLE, getLoginUrl } from "@/const";
import { useState } from "react";

export default function DashboardNew() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("feed");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-lg text-muted-foreground">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Music className="w-16 h-16 text-primary mx-auto mb-4 animate-glow" />
          <h1 className="text-2xl font-bold mb-2">Требуется авторизация</h1>
          <p className="text-muted-foreground mb-6">
            Пожалуйста, войдите для доступа к панели управления
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Войти</a>
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "feed", icon: Home, label: "Лента" },
    { id: "trends", icon: TrendingUp, label: "Тренды" },
    { id: "explore", icon: Compass, label: "Обзор" },
    { id: "library", icon: Library, label: "Библиотека" },
    { id: "upload", icon: Upload, label: "Загрузить" },
    { id: "wallet", icon: Wallet, label: "Кошелек" },
    { id: "marketplace", icon: DollarSign, label: "NFT Маркетплейс" },
    { id: "staking", icon: Star, label: "Стейкинг" },
    { id: "stats", icon: BarChart3, label: "Статистика" },
    { id: "settings", icon: Settings, label: "Настройки" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col fixed left-0 top-0 h-screen">
        {/* Logo */}
        <div className="h-16 border-b border-zinc-800 flex items-center px-6">
          <Music className="w-6 h-6 text-white mr-2" />
          <span className="text-lg font-bold">NORMAL DANCE</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  activeTab === item.id
                    ? "text-white bg-zinc-900"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 fixed top-0 right-0 left-64 bg-[#0a0a0a] z-10">
          <h1 className="text-xl font-bold">NORMAL DANCE</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg">
              <Wallet className="w-4 h-4 text-zinc-400" />
              <span className="text-sm">0 $NDT</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Гость</span>
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold">
                BRONZE
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="pt-24 pb-12 px-8">
          {activeTab === "feed" && (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="w-16 h-16 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {activeTab === "trends" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Тренды</h2>
              <div className="glass p-6 rounded-xl">
                <p className="text-zinc-400">Популярные треки появятся здесь</p>
              </div>
            </div>
          )}

          {activeTab === "explore" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Обзор</h2>
              <div className="glass p-6 rounded-xl">
                <p className="text-zinc-400">Исследуйте новую музыку</p>
              </div>
            </div>
          )}

          {activeTab === "library" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Библиотека</h2>
              <div className="glass p-6 rounded-xl">
                <p className="text-zinc-400">Ваша музыкальная коллекция</p>
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Загрузить трек</h2>
              <div className="glass p-8 rounded-xl">
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center">
                  <Upload className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                  <p className="text-zinc-400 mb-2">Перетащите файлы сюда</p>
                  <p className="text-sm text-zinc-500">или нажмите для выбора</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Кошелек</h2>
              <div className="grid gap-4">
                <div className="glass p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Баланс</h3>
                    <span className="text-2xl font-bold">0 $NDT</span>
                  </div>
                  <Button className="w-full">Подключить кошелек</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "marketplace" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">NFT Маркетплейс</h2>
              <div className="glass p-6 rounded-xl">
                <p className="text-zinc-400">NFT коллекции появятся здесь</p>
              </div>
            </div>
          )}

          {activeTab === "staking" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Стейкинг</h2>
              <div className="glass p-6 rounded-xl">
                <p className="text-zinc-400">Стейкинг токенов</p>
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Статистика</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-primary mb-1">0</div>
                  <div className="text-sm text-zinc-400">Треков прослушано</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-primary mb-1">0</div>
                  <div className="text-sm text-zinc-400">Плейлисты</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-primary mb-1">0</div>
                  <div className="text-sm text-zinc-400">Подписчики</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-primary mb-1">0</div>
                  <div className="text-sm text-zinc-400">Загружено</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Настройки</h2>
              <div className="glass p-6 rounded-xl space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Профиль</h3>
                  <p className="text-sm text-zinc-400">Управление профилем пользователя</p>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <h3 className="font-semibold mb-2">Уведомления</h3>
                  <p className="text-sm text-zinc-400">Настройки уведомлений</p>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <Button variant="destructive" className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
