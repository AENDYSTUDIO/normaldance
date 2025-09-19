'use client'

import { useState } from 'react'
import { UnifiedSystem } from '@/components/unified/unified-system'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'
import { 
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

export default function UnifiedDemo() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: BarChart3 },
    { id: 'system', label: 'Система', icon: Home },
    { id: 'architecture', label: 'Архитектура', icon: Layers },
    { id: 'integration', label: 'Интеграция', icon: Link }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 Единая цифровая система
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Объединение всех компонентов в целостную экосистему
          </p>
          <Badge variant="outline" className="text-green-400 border-green-400">
            Полная интеграция
          </Badge>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Overview */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Обзор системы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'Secret Progress Bar',
                      description: 'Тайный прогресс релизов с геймификацией',
                      icon: Target,
                      color: 'text-purple-400',
                      bgColor: 'bg-purple-900/20',
                      borderColor: 'border-purple-500/30'
                    },
                    {
                      name: 'Club NFT System',
                      description: 'Децентрализованные клубы с NFT-членством',
                      icon: Crown,
                      color: 'text-yellow-400',
                      bgColor: 'bg-yellow-900/20',
                      borderColor: 'border-yellow-500/30'
                    },
                    {
                      name: 'Chat Matrix',
                      description: 'DAO-управление в трёх пересекающихся чатах',
                      icon: MessageCircle,
                      color: 'text-green-400',
                      bgColor: 'bg-green-900/20',
                      borderColor: 'border-green-500/30'
                    },
                    {
                      name: 'Dual Currency System',
                      description: 'Встроенный DEX для TON ↔ NDT',
                      icon: Coins,
                      color: 'text-orange-400',
                      bgColor: 'bg-orange-900/20',
                      borderColor: 'border-orange-500/30'
                    },
                    {
                      name: 'Anti-Pirate 2.0',
                      description: 'NFT-пассы и защита от пиратства',
                      icon: Shield,
                      color: 'text-red-400',
                      bgColor: 'bg-red-900/20',
                      borderColor: 'border-red-500/30'
                    },
                    {
                      name: 'Unified Dashboard',
                      description: 'Единый интерфейс для всех компонентов',
                      icon: Home,
                      color: 'text-blue-400',
                      bgColor: 'bg-blue-900/20',
                      borderColor: 'border-blue-500/30'
                    }
                  ].map((component, index) => (
                    <Card key={index} className={`${component.bgColor} ${component.borderColor} border`}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-12 h-12 ${component.bgColor} rounded-lg flex items-center justify-center`}>
                            <component.icon className={`h-6 w-6 ${component.color}`} />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{component.name}</h3>
                            <p className="text-sm text-gray-400">{component.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Ключевые особенности</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Единый интерфейс</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Объединённая навигация</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Синхронизированные данные</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Единый профиль пользователя</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Интеграция компонентов</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Автоматический обмен валют</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Кросс-компонентные уведомления</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Единая система достижений</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Stats */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Статистика системы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">12,547</div>
                    <div className="text-sm text-gray-400">Пользователей</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <Music className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">45,678</div>
                    <div className="text-sm text-gray-400">Треков</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <Crown className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">127</div>
                    <div className="text-sm text-gray-400">Клубов</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <Coins className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">125K TON</div>
                    <div className="text-sm text-gray-400">Общий доход</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="h-[800px]">
            <UnifiedSystem />
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-8">
            {/* System Architecture */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Архитектура системы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-4">Frontend Layer</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Monitor className="h-5 w-5 text-blue-400" />
                        <div>
                          <div className="text-white font-semibold">Unified Dashboard</div>
                          <div className="text-sm text-gray-400">Единый интерфейс для всех компонентов</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Smartphone className="h-5 w-5 text-green-400" />
                        <div>
                          <div className="text-white font-semibold">Mobile App</div>
                          <div className="text-sm text-gray-400">React Native с нативными функциями</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Globe className="h-5 w-5 text-purple-400" />
                        <div>
                          <div className="text-white font-semibold">Web App</div>
                          <div className="text-sm text-gray-400">Next.js с SSR и PWA</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-4">Backend Layer</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Server className="h-5 w-5 text-orange-400" />
                        <div>
                          <div className="text-white font-semibold">API Gateway</div>
                          <div className="text-sm text-gray-400">Единая точка входа для всех сервисов</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Database className="h-5 w-5 text-red-400" />
                        <div>
                          <div className="text-white font-semibold">Database</div>
                          <div className="text-sm text-gray-400">Prisma + PostgreSQL с репликацией</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <Cloud className="h-5 w-5 text-blue-400" />
                        <div>
                          <div className="text-white font-semibold">Storage</div>
                          <div className="text-sm text-gray-400">IPFS + Filecoin для медиа-файлов</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Flow */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Поток данных</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Database className="h-6 w-6 text-green-400" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Cloud className="h-6 w-6 text-purple-400" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <Monitor className="h-6 w-6 text-orange-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-white font-semibold mb-2">Пользователь</div>
                      <div className="text-sm text-gray-400">Взаимодействие с интерфейсом</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold mb-2">База данных</div>
                      <div className="text-sm text-gray-400">Хранение и обработка данных</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold mb-2">Хранилище</div>
                      <div className="text-sm text-gray-400">Медиа-файлы и метаданные</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold mb-2">Интерфейс</div>
                      <div className="text-sm text-gray-400">Отображение результатов</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technology Stack */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Технологический стек</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-4">Frontend</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-300">Next.js 14</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-300">React 18</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-300">TypeScript</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-300">Tailwind CSS</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-4">Backend</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-300">Node.js</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-300">Prisma ORM</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-300">PostgreSQL</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-300">Redis</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-4">Blockchain</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-300">Solana</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-300">TON</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-300">IPFS</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-300">Filecoin</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'integration' && (
          <div className="space-y-8">
            {/* Component Integration */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Интеграция компонентов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      from: 'Secret Progress Bar',
                      to: 'Dual Currency System',
                      description: 'Автоматический обмен TON → NDT для донатов',
                      icon: ArrowRight,
                      color: 'text-blue-400'
                    },
                    {
                      from: 'Club NFT System',
                      to: 'Chat Matrix',
                      description: 'Клубные чаты с автоматическими уведомлениями',
                      icon: ArrowRight,
                      color: 'text-green-400'
                    },
                    {
                      from: 'Anti-Pirate 2.0',
                      to: 'Club NFT System',
                      description: 'Клубные пассы для всех треков клуба',
                      icon: ArrowRight,
                      color: 'text-purple-400'
                    },
                    {
                      from: 'Chat Matrix',
                      to: 'Secret Progress Bar',
                      description: 'Голосования за ускорение релизов в чатах',
                      icon: ArrowRight,
                      color: 'text-orange-400'
                    },
                    {
                      from: 'Dual Currency System',
                      to: 'Anti-Pirate 2.0',
                      description: 'Покупка NFT-пассов в TON',
                      icon: ArrowRight,
                      color: 'text-red-400'
                    }
                  ].map((integration, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg">
                      <div className="text-white font-semibold">{integration.from}</div>
                      <integration.icon className={`h-5 w-5 ${integration.color}`} />
                      <div className="text-white font-semibold">{integration.to}</div>
                      <div className="flex-1 text-right">
                        <div className="text-sm text-gray-400">{integration.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Synchronization */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Синхронизация данных</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-4">Real-time Updates</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">WebSocket соединения</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Автоматическое обновление балансов</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Синхронизация чатов</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-4">Event System</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Кросс-компонентные события</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Автоматические уведомления</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Обновление статистики</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Quote */}
            <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
              <CardContent className="p-8">
                <blockquote className="text-center">
                  <p className="text-xl text-white mb-4">
                    <strong>Единая цифровая система</strong> объединяет все компоненты в целостную экосистему,<br/>
                    где каждый элемент работает в гармонии с остальными,<br/>
                    создавая непревзойдённый пользовательский опыт.
                  </p>
                  <footer className="text-gray-400">
                    — Единая цифровая система Философия
                  </footer>
                </blockquote>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
