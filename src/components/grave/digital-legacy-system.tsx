import { SecureLogger } from '@/lib/security/secure-logger';
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Типы для системы цифрового наследия
interface DigitalMemorial {
  id: string
  artistName: string
  realName?: string
  birthDate?: string
  deathDate: string
  bio: string
  avatar: string
  banner: string
  lastMix?: string // IPFS hash последнего микса
  lastTrack?: string // IPFS hash последнего трека
  totalTracks: number
  totalPlays: number
  totalLikes: number
  memorialType: 'DJ' | 'PRODUCER' | 'ARTIST' | 'COLLECTIVE'
  status: 'ACTIVE' | 'PENDING' | 'VERIFIED'
  createdAt: string
  updatedAt: string
  
  // Блокчейн данные
  nftMemorialId?: string
  blockchainHash?: string
  eternalStorage?: string
  
  // Наследники и управление
  heirs: Heir[]
  memorialFund: number
  donations: Donation[]
  
  // Социальные функции
  tributes: Tribute[]
  memories: Memory[]
  visitors: number
}

interface Heir {
  id: string
  name: string
  relationship: string
  walletAddress: string
  percentage: number // Процент от доходов
  isActive: boolean
}

interface Donation {
  id: string
  amount: number
  donor: string
  message?: string
  timestamp: string
  transactionHash: string
}

interface Tribute {
  id: string
  author: string
  message: string
  trackId?: string
  timestamp: string
  likes: number
}

interface Memory {
  id: string
  title: string
  description: string
  mediaUrl: string
  mediaType: 'image' | 'video' | 'audio'
  author: string
  timestamp: string
}

export default function DigitalLegacySystem() {
  const [memorials, setMemorials] = useState<DigitalMemorial[]>([])
  const [selectedMemorial, setSelectedMemorial] = useState<DigitalMemorial | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Загрузка мемориалов
  useEffect(() => {
    loadMemorials()
  }, [])

  const loadMemorials = async () => {
    // В реальном приложении загружаем с блокчейна
    const mockMemorials: DigitalMemorial[] = [
      {
        id: '1',
        artistName: 'DJ Eternal',
        realName: 'Иван Петров',
        birthDate: '1985-03-15',
        deathDate: '2024-12-01',
        bio: 'Легендарный диджей, пионер электронной музыки в России. 20 лет за пультом, тысячи счастливых танцоров.',
        avatar: '/memorials/dj-eternal-avatar.jpg',
        banner: '/memorials/dj-eternal-banner.jpg',
        lastMix: 'QmLastMix123',
        lastTrack: 'QmLastTrack456',
        totalTracks: 150,
        totalPlays: 2500000,
        totalLikes: 50000,
        memorialType: 'DJ',
        status: 'VERIFIED',
        createdAt: '2024-12-02T00:00:00Z',
        updatedAt: '2024-12-02T00:00:00Z',
        nftMemorialId: '0x123...abc',
        blockchainHash: '0x456...def',
        eternalStorage: 'QmEternal789',
        heirs: [
          {
            id: '1',
            name: 'Анна Петрова',
            relationship: 'Дочь',
            walletAddress: '0x789...ghi',
            percentage: 70,
            isActive: true
          }
        ],
        memorialFund: 1250.50,
        donations: [],
        tributes: [],
        memories: [],
        visitors: 1250
      }
    ]
    
    setMemorials(mockMemorials)
  }

  const createMemorial = async (memorialData: Partial<DigitalMemorial>) => {
    // Создание NFT-мемориала на блокчейне
    SecureLogger.log('Создание мемориала:', memorialData)
    setIsCreating(true)
    
    try {
      // 1. Загружаем медиа на IPFS
      // 2. Создаем NFT-мемориал
      // 3. Настраиваем вечное хранение
      // 4. Регистрируем в блокчейн-архиве
      
      SecureLogger.log('✅ Мемориал создан успешно')
    } catch (error) {
      SecureLogger.error('❌ Ошибка создания мемориала:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const filteredMemorials = memorials.filter(memorial =>
    memorial.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memorial.realName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            🪦 G.rave
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Цифровое наследие для диджеев и музыкантов
          </p>
          <p className="text-lg text-gray-400">
            Вечные мемориалы на блокчейне • NFT-память • Безопасное хранение
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white">{memorials.length}</div>
              <div className="text-gray-300">Мемориалов</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white">∞</div>
              <div className="text-gray-300">Вечное хранение</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-gray-300">Блокчейн-архив</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white">$0</div>
              <div className="text-gray-300">Стоимость хранения</div>
            </CardContent>
          </Card>
        </div>

        {/* Поиск и фильтры */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Поиск по имени артиста..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              + Создать мемориал
            </Button>
          </div>
        </div>

        {/* Список мемориалов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemorials.map((memorial) => (
            <Card 
              key={memorial.id}
              className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedMemorial(memorial)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <img 
                    src={memorial.avatar} 
                    alt={memorial.artistName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <CardTitle className="text-white text-xl">
                      {memorial.artistName}
                    </CardTitle>
                    <p className="text-gray-400 text-sm">
                      {memorial.realName && `${memorial.realName} • `}
                      {memorial.memorialType}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {memorial.bio}
                  </p>
                  
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                      {memorial.totalTracks} треков
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                      {memorial.totalPlays.toLocaleString()} прослушиваний
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Посетителей: {memorial.visitors}</span>
                    <span>Фонд: ${memorial.memorialFund}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 text-sm">Активен</span>
                    {memorial.nftMemorialId && (
                      <Badge variant="outline" className="text-xs">
                        NFT #{memorial.nftMemorialId.slice(-6)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Модальное окно создания мемориала */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl bg-gray-900 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl">
                  Создать цифровой мемориал
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Имя артиста"
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <Input
                      placeholder="Реальное имя (опционально)"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      placeholder="Дата рождения"
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <Input
                      type="date"
                      placeholder="Дата смерти"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  
                  <Textarea
                    placeholder="Биография артиста..."
                    className="bg-white/10 border-white/20 text-white min-h-[100px]"
                  />
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setIsCreating(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                    <Button 
                      onClick={() => createMemorial({})}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      Создать мемориал
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
