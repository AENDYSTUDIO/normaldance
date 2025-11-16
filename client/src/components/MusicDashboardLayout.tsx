import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Disc3,
  Home,
  TrendingUp,
  Compass,
  Library,
  Upload,
  Wallet,
  Gem,
  Coins,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Flame
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Badge } from "./ui/badge";

interface MusicDashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Лента", href: "/", icon: Home },
  { name: "Тренды", href: "/trends", icon: TrendingUp },
  { name: "Обзор", href: "/explore", icon: Compass },
  { name: "Библиотека", href: "/library", icon: Library },
  { name: "Загрузить", href: "/upload", icon: Upload },
  { name: "Кошелек", href: "/wallet", icon: Wallet },
  { name: "NFT", href: "/nft", icon: Gem },
  { name: "Стейкинг", href: "/staking", icon: Coins },
  { name: "Статистика", href: "/stats", icon: BarChart3 },
  { name: "G.Rave", href: "/grave", icon: Flame },
  { name: "Настройки", href: "/settings", icon: Settings },
];

export function MusicDashboardLayout({ children }: MusicDashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Disc3 className="w-8 h-8 text-primary animate-spin-slow" />
                <span className="text-xl font-bold gradient-violet bg-clip-text text-transparent">
                  NORMAL DANCE
                </span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground glow-violet"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </a>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User profile */}
          <div className="p-4 border-t border-sidebar-border">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-violet flex items-center justify-center text-white font-semibold">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user.name || "User"}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      BRONZE
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center">
                Загрузка...
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex-1" />

            {/* Balance display */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">0.00 $NDT</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
