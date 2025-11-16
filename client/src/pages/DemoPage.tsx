import { Button } from "@/components/ui/button";
import { Music, Home, TrendingUp, Compass, Library, Upload, Wallet, DollarSign, Star, BarChart3, Settings, Send } from "lucide-react";
import { useState } from "react";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState("feed");

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
      <aside className="w-64 border-r border-zinc-800 flex flex-col fixed left-0 top-0 h-screen bg-[#0a0a0a] z-20">
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
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-[10px] font-bold">
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
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                <p className="text-zinc-400">Популярные треки появятся здесь</p>
              </div>
            </div>
          )}

          {activeTab === "explore" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Обзор</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                <p className="text-zinc-400">Исследуйте новую музыку</p>
              </div>
            </div>
          )}

          {activeTab === "library" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Библиотека</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                <p className="text-zinc-400">Ваша музыкальная коллекция</p>
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Загрузить трек</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl">
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center hover:border-zinc-600 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                  <p className="text-zinc-400 mb-2">Перетащите файлы сюда</p>
                  <p className="text-sm text-zinc-500">или нажмите для выбора</p>
                  <p className="text-xs text-zinc-600 mt-4">Поддерживаются форматы: MP3, WAV, FLAC</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Кошелек</h2>
              <div className="grid gap-4 max-w-2xl">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Баланс</h3>
                    <span className="text-3xl font-bold">0 $NDT</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="w-full bg-violet-600 hover:bg-violet-700">
                      <Wallet className="w-4 h-4 mr-2" />
                      Подключить кошелек
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Telegram
                    </Button>
                  </div>
                </div>
                
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                  <h3 className="font-semibold mb-4">Поддерживаемые сети</h3>
                  <div className="space-y-2 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Solana</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Ethereum</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span>Telegram Stars</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "marketplace" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">NFT Маркетплейс</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                <p className="text-zinc-400 mb-4">NFT коллекции появятся здесь</p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                      <div className="aspect-square bg-zinc-700 rounded-lg mb-3"></div>
                      <div className="text-sm font-semibold mb-1">NFT #{i}</div>
                      <div className="text-xs text-zinc-500">Coming Soon</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "staking" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Стейкинг</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <Star className="w-12 h-12 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-lg">Стейкинг $NDT</h3>
                    <p className="text-sm text-zinc-400">Зарабатывайте награды за стейкинг токенов</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">APY:</span>
                    <span className="font-bold text-green-500">12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Ваш стейк:</span>
                    <span className="font-bold">0 $NDT</span>
                  </div>
                  <Button className="w-full" disabled>
                    Подключите кошелек для стейкинга
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Статистика</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-violet-500 mb-1">0</div>
                  <div className="text-sm text-zinc-400">Треков прослушано</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-violet-500 mb-1">0</div>
                  <div className="text-sm text-zinc-400">Плейлисты</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-violet-500 mb-1">0</div>
                  <div className="text-sm text-zinc-400">Подписчики</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-violet-500 mb-1">0</div>
                  <div className="text-sm text-zinc-400">Загружено</div>
                </div>
              </div>
              
              <div className="mt-8 bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                <h3 className="font-semibold mb-4">Активность</h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[20, 45, 30, 60, 35, 70, 50].map((height, i) => (
                    <div key={i} className="flex-1 bg-violet-600/30 rounded-t" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-zinc-500">
                  <span>Пн</span>
                  <span>Вт</span>
                  <span>Ср</span>
                  <span>Чт</span>
                  <span>Пт</span>
                  <span>Сб</span>
                  <span>Вс</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Настройки</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl space-y-4 max-w-2xl">
                <div>
                  <h3 className="font-semibold mb-2">Профиль</h3>
                  <p className="text-sm text-zinc-400 mb-3">Управление профилем пользователя</p>
                  <Button variant="outline" className="w-full">Редактировать профиль</Button>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <h3 className="font-semibold mb-2">Уведомления</h3>
                  <p className="text-sm text-zinc-400 mb-3">Настройки уведомлений</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      <span>Email уведомления</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>Push уведомления</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>Telegram уведомления</span>
                    </label>
                  </div>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <h3 className="font-semibold mb-2">Telegram</h3>
                  <p className="text-sm text-zinc-400 mb-3">Подключите Telegram для дополнительных функций</p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />
                    Подключить Telegram
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
