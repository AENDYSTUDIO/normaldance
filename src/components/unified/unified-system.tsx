'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { 
  // Core Icons
  Home,
  Music,
  Users,
  MessageCircle,
  Coins,
  Shield,
  BarChart3,
  Settings,
  Bell,
  Wallet,
  Crown,
  Star,
  Award,
  Zap,
  Target,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Share,
  Heart,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  LineChart,
  Gauge,
  Timer,
  Clock,
  Calendar,
  MapPin,
  Flag,
  Hash,
  AtSign,
  Bot,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Plus,
  Minus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Copy,
  Link,
  QrCode,
  Smartphone,
  Monitor,
  Tablet,
  Headphones,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  CameraOff,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalOff,
  Database,
  Server,
  Cloud,
  CloudOff,
  Key,
  FileText,
  Image,
  File,
  Folder,
  Archive,
  Layers,
  Grid,
  List,
  Menu,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCw,
  RotateCcw,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  Move,
  Move3D,
  ZoomIn,
  ZoomOut,
  Focus,
  MousePointer,
  Hand,
  Hand2,
  Touchpad,
  Keyboard,
  Gamepad2,
  Joystick,
  Controller,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Gift,
  Present,
  PartyPopper,
  Confetti,
  Sparkles,
  Rainbow,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Flame,
  Snowflake,
  TreePine,
  Leaf,
  Flower,
  Bug,
  Fish,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Turtle,
  Whale,
  Butterfly,
  Bee,
  Ant,
  Spider,
  Snail,
  Frog,
  Monkey,
  Panda,
  Lion,
  Tiger,
  Elephant,
  Giraffe,
  Zebra,
  Hippo,
  Rhino,
  Bear,
  Wolf,
  Fox,
  Deer,
  Horse,
  Cow,
  Pig,
  Sheep,
  Goat,
  Chicken,
  Duck,
  Turkey,
  Eagle,
  Owl,
  Parrot,
  Penguin,
  Seal,
  Dolphin,
  Shark,
  Octopus,
  Crab,
  Lobster,
  Shrimp,
  Squid,
  Jellyfish,
  Starfish,
  Clam,
  Snail2,
  Worm,
  Beetle,
  Ladybug,
  Dragonfly,
  Mosquito,
  Fly,
  Cockroach,
  Cricket,
  Grasshopper,
  Mantis,
  Scorpion,
  Tarantula,
  Centipede,
  Millipede,
  Earthworm,
  Slug,
  Caterpillar,
  Cocoon,
  Chrysalis,
  Pupa,
  Larva,
  Egg,
  Nest,
  Hive,
  Web,
  Cocoon2,
  Chrysalis2,
  Pupa2,
  Larva2,
  Egg2,
  Nest2,
  Hive2,
  Web2,
  // Music Icons
  Music2,
  Music3,
  Music4,
  Disc,
  Disc2,
  Disc3,
  Vinyl,
  Record,
  Cassette,
  Cd,
  Dvd,
  Bluray,
  Headphones2,
  Headphones3,
  Speaker,
  Speaker2,
  Speaker3,
  Radio,
  Radio2,
  Microphone,
  Microphone2,
  Microphone3,
  Mic2,
  Mic3,
  Video2,
  Video3,
  Camera2,
  Camera3,
  Film,
  Film2,
  Clapperboard,
  Clapperboard2,
  Movie,
  Movie2,
  Tv,
  Tv2,
  Monitor2,
  Monitor3,
  Laptop,
  Laptop2,
  Desktop,
  Desktop2,
  Server2,
  Server3,
  Database2,
  Database3,
  Cloud2,
  Cloud3,
  Cloud4,
  Cloud5,
  Cloud6,
  Cloud7,
  Cloud8,
  Cloud9,
  Cloud10,
  Cloud11,
  Cloud12,
  Cloud13,
  Cloud14,
  Cloud15,
  Cloud16,
  Cloud17,
  Cloud18,
  Cloud19,
  Cloud20,
  Cloud21,
  Cloud22,
  Cloud23,
  Cloud24,
  Cloud25,
  Cloud26,
  Cloud27,
  Cloud28,
  Cloud29,
  Cloud30,
  Cloud31,
  Cloud32,
  Cloud33,
  Cloud34,
  Cloud35,
  Cloud36,
  Cloud37,
  Cloud38,
  Cloud39,
  Cloud40,
  Cloud41,
  Cloud42,
  Cloud43,
  Cloud44,
  Cloud45,
  Cloud46,
  Cloud47,
  Cloud48,
  Cloud49,
  Cloud50,
  Cloud51,
  Cloud52,
  Cloud53,
  Cloud54,
  Cloud55,
  Cloud56,
  Cloud57,
  Cloud58,
  Cloud59,
  Cloud60,
  Cloud61,
  Cloud62,
  Cloud63,
  Cloud64,
  Cloud65,
  Cloud66,
  Cloud67,
  Cloud68,
  Cloud69,
  Cloud70,
  Cloud71,
  Cloud72,
  Cloud73,
  Cloud74,
  Cloud75,
  Cloud76,
  Cloud77,
  Cloud78,
  Cloud79,
  Cloud80,
  Cloud81,
  Cloud82,
  Cloud83,
  Cloud84,
  Cloud85,
  Cloud86,
  Cloud87,
  Cloud88,
  Cloud89,
  Cloud90,
  Cloud91,
  Cloud92,
  Cloud93,
  Cloud94,
  Cloud95,
  Cloud96,
  Cloud97,
  Cloud98,
  Cloud99,
  Cloud100
} from '@/components/icons'
import { cn } from '@/lib/utils'

// Import all components
import { SecretProgressBar } from '@/components/gamification/secret-progress-bar'
import { ClubNFTSystem } from '@/components/clubs/club-nft-system'
import { ChatMatrix } from '@/components/chat/chat-matrix'
import { DualCurrencySystem } from '@/components/dex/dual-currency-system'
import { AntiPirateSystem } from '@/components/anti-pirate/anti-pirate-system'

interface UnifiedSystemProps {
  className?: string
}

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalTracks: number
  totalClubs: number
  totalRevenue: number
  totalNDT: number
  totalTON: number
  activeSessions: number
  chatMessages: number
  votes: number
  passes: number
}

interface UserProfile {
  id: string
  name: string
  avatar: string
  level: string
  balance: number
  tonBalance: number
  clubMemberships: number
  activePasses: number
  totalEarnings: number
  achievements: number
  isOnline: boolean
  lastActive: number
}

export function UnifiedSystem({ className }: UnifiedSystemProps) {
  const [activeModule, setActiveModule] = useState<'dashboard' | 'progress' | 'clubs' | 'chat' | 'dex' | 'anti-pirate'>('dashboard')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - в реальном приложении будет загружаться из API
  const mockUserProfile: UserProfile = {
    id: 'user-123',
    name: 'Luna Nova',
    avatar: '/avatars/luna.jpg',
    level: 'Gold',
    balance: 1250.5,
    tonBalance: 45.2,
    clubMemberships: 2,
    activePasses: 3,
    totalEarnings: 567.8,
    achievements: 15,
    isOnline: true,
    lastActive: Date.now() - 300000
  }

  const mockSystemStats: SystemStats = {
    totalUsers: 12547,
    activeUsers: 8923,
    totalTracks: 45678,
    totalClubs: 127,
    totalRevenue: 125000.5,
    totalNDT: 9876543.2,
    totalTON: 45678.9,
    activeSessions: 2345,
    chatMessages: 56789,
    votes: 12345,
    passes: 2345
  }

  const mockNotifications = [
    {
      id: '1',
      type: 'achievement',
      title: 'Новое достижение!',
      message: 'Вы получили достижение "Первые 100 прослушиваний"',
      timestamp: Date.now() - 300000,
      isRead: false
    },
    {
      id: '2',
      type: 'club',
      title: 'Клуб обновление',
      message: 'Cyber Beats Club увеличил призовой пул на 500 TON',
      timestamp: Date.now() - 600000,
      isRead: false
    },
    {
      id: '3',
      type: 'chat',
      title: 'Новое сообщение',
      message: 'Luna Nova упомянул вас в чате POP',
      timestamp: Date.now() - 900000,
      isRead: true
    }
  ]

  useEffect(() => {
    setUserProfile(mockUserProfile)
    setSystemStats(mockSystemStats)
    setNotifications(mockNotifications)
  }, [])

  const modules = [
    {
      id: 'dashboard',
      name: 'Главная',
      icon: Home,
      description: 'Обзор системы и статистика',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'progress',
      name: 'Прогресс-бар',
      icon: Target,
      description: 'Тайный прогресс релизов',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'clubs',
      name: 'Клубы',
      icon: Crown,
      description: 'NFT-клубы и турниры',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      id: 'chat',
      name: 'Чат-матрица',
      icon: MessageCircle,
      description: 'DAO-управление в чатах',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'dex',
      name: 'DEX',
      icon: Coins,
      description: 'Обмен TON ↔ NDT',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500/30'
    },
    {
      id: 'anti-pirate',
      name: 'Anti-Pirate',
      icon: Shield,
      description: 'NFT-пассы и защита',
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500/30'
    }
  ]

  const handleModuleSwitch = (moduleId: string) => {
    setActiveModule(moduleId as any)
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'progress':
        return <SecretProgressBar />
      case 'clubs':
        return <ClubNFTSystem />
      case 'chat':
        return <ChatMatrix />
      case 'dex':
        return <DualCurrencySystem />
      case 'anti-pirate':
        return <AntiPirateSystem />
      default:
        return renderDashboard()
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <CardContent className="p-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {userProfile?.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Добро пожаловать, {userProfile?.name}!
              </h1>
              <p className="text-gray-300">
                Уровень: <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  {userProfile?.level}
                </Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {systemStats?.totalUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Всего пользователей</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Music className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {systemStats?.totalTracks.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Треков</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {systemStats?.totalClubs}
                </div>
                <div className="text-sm text-gray-400">Клубов</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {systemStats?.totalRevenue.toLocaleString()} TON
                </div>
                <div className="text-sm text-gray-400">Общий доход</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Wallet className="h-5 w-5 mr-2" />
              Ваши активы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">NDT баланс</span>
                <span className="text-white font-semibold">
                  {userProfile?.balance.toLocaleString()} NDT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">TON баланс</span>
                <span className="text-white font-semibold">
                  {userProfile?.tonBalance.toLocaleString()} TON
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Общий доход</span>
                <span className="text-green-400 font-semibold">
                  {userProfile?.totalEarnings.toLocaleString()} TON
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Ваша активность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Клубов</span>
                <span className="text-white font-semibold">
                  {userProfile?.clubMemberships}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Активных пассов</span>
                <span className="text-white font-semibold">
                  {userProfile?.activePasses}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Достижений</span>
                <span className="text-yellow-400 font-semibold">
                  {userProfile?.achievements}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Последняя активность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  notification.type === 'achievement' ? 'bg-yellow-500/20' :
                  notification.type === 'club' ? 'bg-purple-500/20' :
                  'bg-blue-500/20'
                )}>
                  {notification.type === 'achievement' ? <Award className="h-4 w-4 text-yellow-400" /> :
                   notification.type === 'club' ? <Crown className="h-4 w-4 text-purple-400" /> :
                   <MessageCircle className="h-4 w-4 text-blue-400" />}
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{notification.title}</div>
                  <div className="text-sm text-gray-400">{notification.message}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900', className)}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800/50 border-r border-gray-700 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Music className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">NormalDance</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {modules.map((module) => {
                const Icon = module.icon
                return (
                  <button
                    key={module.id}
                    onClick={() => handleModuleSwitch(module.id)}
                    className={cn(
                      'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all text-left',
                      activeModule === module.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-semibold">{module.name}</div>
                      <div className="text-xs opacity-75">{module.description}</div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {userProfile?.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold truncate">
                  {userProfile?.name}
                </div>
                <div className="text-xs text-gray-400">
                  {userProfile?.isOnline ? 'Онлайн' : 'Офлайн'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gray-800/50 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {modules.find(m => m.id === activeModule)?.name}
                </h1>
                <p className="text-gray-400">
                  {modules.find(m => m.id === activeModule)?.description}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </Button>

                {/* Settings */}
                <Button variant="ghost" size="sm">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {renderModule()}
          </main>
        </div>
      </div>
    </div>
  )
}

// Hook for using unified system
export function useUnifiedSystem() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadUserProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/unified/profile')
      const data = await response.json()
      
      if (data.success) {
        setUserProfile(data.profile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSystemStats = async () => {
    try {
      const response = await fetch('/api/unified/stats')
      const data = await response.json()
      
      if (data.success) {
        setSystemStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading system stats:', error)
    }
  }

  const updateUserBalance = async (currency: 'NDT' | 'TON', amount: number) => {
    try {
      const response = await fetch('/api/unified/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, amount })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadUserProfile()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating balance:', error)
      return false
    }
  }

  return {
    userProfile,
    systemStats,
    isLoading,
    loadUserProfile,
    loadSystemStats,
    updateUserBalance
  }
}
