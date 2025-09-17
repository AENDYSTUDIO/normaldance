'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button, Avatar, AvatarFallback, AvatarImage, Badge } from '@/components/ui'
import { 
  Home, 
  TrendingUp, 
  Compass, 
  Library, 
  Upload, 
  Wallet, 
  Settings,
  Menu,
  X,
  Music,
  Play,
  Heart,
  Users,
  DollarSign,
  BarChart3,
  Clock,
  Star,
  Crown,
  User
} from '@/components/icons'

const navigation = [
  { name: 'Лента', href: '/feed', icon: Home },
  { name: 'Тренды', href: '/trending', icon: TrendingUp },
  { name: 'Обзор', href: '/explore', icon: Compass },
  { name: 'Библиотека', href: '/library', icon: Library },
  { name: 'Загрузить', href: '/upload', icon: Upload },
  { name: 'Кошелек', href: '/wallet', icon: Wallet },
  { name: 'NFT Маркетплейс', href: '/nft-marketplace', icon: DollarSign },
  { name: 'Стейкинг', href: '/staking', icon: Star },
  { name: 'Статистика', href: '/analytics', icon: BarChart3 },
  { name: 'Настройки', href: '/settings', icon: Settings },
]

const userNavigation = [
  { name: 'Профиль', href: '/profile', icon: User },
  { name: 'Мои треки', href: '/my-tracks', icon: Music },
  { name: 'Мои плейлисты', href: '/my-playlists', icon: Library },
  { name: 'Мои NFT', href: '/my-nfts', icon: Crown },
]

interface MainLayoutProps {
  children: React.ReactNode
  user?: {
    id: string
    username: string
    displayName?: string
    avatar?: string
    balance: number
    level: string
    isArtist: boolean
  }
}

export function MainLayout({ children, user }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'BRONZE': return <Crown className="h-3 w-3 text-amber-600" />
      case 'SILVER': return <Crown className="h-3 w-3 text-gray-400" />
      case 'GOLD': return <Crown className="h-3 w-3 text-yellow-500" />
      case 'PLATINUM': return <Crown className="h-3 w-3 text-purple-500" />
      default: return <Crown className="h-3 w-3 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-card">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">NORMAL DANCE</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-8 px-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72">
        <div className="flex h-full flex-col bg-card">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">NORMAL DANCE</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">
              {navigation.find(item => item.href === pathname)?.name || 'NORMAL DANCE'}
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Wallet balance */}
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Wallet className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{user?.balance || 0} $NDT</span>
              </Button>
              
              {/* User menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>
                      {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium">
                      {user?.displayName || user?.username || 'Гость'}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      {getLevelIcon(user?.level || 'BRONZE')}
                      <span>{user?.level || 'BRONZE'}</span>
                      {user?.isArtist && (
                        <Badge variant="secondary" className="text-xs">
                          Артист
                        </Badge>
                      )}
                    </div>
                  </div>
                </Button>
                
                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b">
                      <div className="text-sm font-medium">{user?.displayName || user?.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {user?.balance || 0} $NDT
                      </div>
                    </div>
                    <nav className="py-2">
                      {userNavigation.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        )
                      })}
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}