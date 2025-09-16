'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Medal, 
  Crown, 
  Users, 
  Star,
  Zap,
  Target,
  TrendingUp,
  Award,
  Shield,
  Flame,
  Sparkles,
  Gift,
  Coins,
  Wallet,
  UserPlus,
  UserMinus,
  Settings,
  BarChart3,
  Calendar,
  MapPin,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClubNFT {
  id: string
  name: string
  description: string
  imageUrl: string
  reputation: number // Club Reputation Token (CRT)
  members: number
  totalPrizePool: number
  monthlyPrizePool: number
  boostMultiplier: number // +15% to votes
  royaltyMultiplier: number // +5% from prize pool
  obligationRate: number // 20% back to club
  price: number // T1 tokens to join
  maxMembers: number
  isActive: boolean
  foundedAt: string
  achievements: ClubAchievement[]
  recentWinners: ClubWinner[]
}

interface ClubAchievement {
  id: string
  type: 'gold' | 'silver' | 'bronze' | 'special'
  title: string
  description: string
  earnedAt: string
  artist: string
  event: string
  reputationBonus: number
}

interface ClubWinner {
  id: string
  artist: string
  track: string
  position: number
  prize: number
  event: string
  date: string
}

interface ClubMember {
  id: string
  artist: string
  avatar: string
  joinedAt: string
  nftBalance: number
  totalEarnings: number
  monthlyEarnings: number
  achievements: number
  isActive: boolean
}

interface ClubNFTSystemProps {
  className?: string
}

export function ClubNFTSystem({ className }: ClubNFTSystemProps) {
  const [selectedClub, setSelectedClub] = useState<ClubNFT | null>(null)
  const [userMembership, setUserMembership] = useState<ClubMember | null>(null)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showStats, setShowStats] = useState(false)

  // Mock data - в реальном приложении будет загружаться из API
  const clubs: ClubNFT[] = [
    {
      id: 'cyber-beats-club',
      name: 'Cyber Beats Club',
      description: 'Электронная музыка нового поколения',
      imageUrl: '/clubs/cyber-beats.jpg',
      reputation: 2450,
      members: 127,
      totalPrizePool: 125000,
      monthlyPrizePool: 15000,
      boostMultiplier: 0.15,
      royaltyMultiplier: 0.05,
      obligationRate: 0.20,
      price: 500,
      maxMembers: 200,
      isActive: true,
      foundedAt: '2024-01-15',
      achievements: [
        {
          id: '1',
          type: 'gold',
          title: 'Eurovision 2024',
          description: 'Победа в международном конкурсе',
          earnedAt: '2024-05-15',
          artist: 'Luna Nova',
          event: 'Eurovision',
          reputationBonus: 500
        },
        {
          id: '2',
          type: 'silver',
          title: 'Olympic Music Games',
          description: '2-е место в музыкальной олимпиаде',
          earnedAt: '2024-04-20',
          artist: 'Cyber Pulse',
          event: 'Olympic Games',
          reputationBonus: 300
        }
      ],
      recentWinners: [
        {
          id: '1',
          artist: 'Luna Nova',
          track: 'Midnight Dreams',
          position: 1,
          prize: 5000,
          event: 'Eurovision 2024',
          date: '2024-05-15'
        }
      ]
    },
    {
      id: 'underground-kings',
      name: 'Underground Kings',
      description: 'Хип-хоп и рэп элита',
      imageUrl: '/clubs/underground-kings.jpg',
      reputation: 1890,
      members: 89,
      totalPrizePool: 98000,
      monthlyPrizePool: 12000,
      boostMultiplier: 0.15,
      royaltyMultiplier: 0.05,
      obligationRate: 0.20,
      price: 750,
      maxMembers: 150,
      isActive: true,
      foundedAt: '2024-02-01',
      achievements: [],
      recentWinners: []
    },
    {
      id: 'classical-masters',
      name: 'Classical Masters',
      description: 'Классическая и оркестровая музыка',
      imageUrl: '/clubs/classical-masters.jpg',
      reputation: 3200,
      members: 45,
      totalPrizePool: 200000,
      monthlyPrizePool: 25000,
      boostMultiplier: 0.15,
      royaltyMultiplier: 0.05,
      obligationRate: 0.20,
      price: 1000,
      maxMembers: 100,
      isActive: true,
      foundedAt: '2023-11-20',
      achievements: [],
      recentWinners: []
    }
  ]

  const handleJoinClub = async (clubId: string) => {
    try {
      // Здесь будет API вызов для присоединения к клубу
      console.log('Joining club:', clubId)
      setShowJoinModal(false)
    } catch (error) {
      console.error('Error joining club:', error)
    }
  }

  const handleLeaveClub = async () => {
    try {
      // Здесь будет API вызов для выхода из клуба
      console.log('Leaving club')
      setUserMembership(null)
    } catch (error) {
      console.error('Error leaving club:', error)
    }
  }

  const getReputationColor = (reputation: number): string => {
    if (reputation >= 2000) return 'text-purple-500'
    if (reputation >= 1000) return 'text-blue-500'
    if (reputation >= 500) return 'text-green-500'
    return 'text-yellow-500'
  }

  const getReputationBadge = (reputation: number): string => {
    if (reputation >= 2000) return 'Легендарный'
    if (reputation >= 1000) return 'Элитный'
    if (reputation >= 500) return 'Продвинутый'
    return 'Новичок'
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          🏛️ TIER 1: Клуб-арист Система
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          Лейблы = Спортивные клубы. NFT-членство, прозрачная экономика, децентрализованное управление.
        </p>
      </div>

      {/* User Membership Status */}
      {userMembership && (
        <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Crown className="h-5 w-5 mr-2 text-yellow-400" />
              Ваше членство
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {userMembership.totalEarnings} T1
                </div>
                <div className="text-sm text-gray-400">Общий доход</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {userMembership.monthlyEarnings} T1
                </div>
                <div className="text-sm text-gray-400">За месяц</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {userMembership.achievements}
                </div>
                <div className="text-sm text-gray-400">Достижения</div>
              </div>
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLeaveClub}
                  className="text-red-400 border-red-400 hover:bg-red-400/10"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Покинуть клуб
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <Card 
            key={club.id}
            className={cn(
              'cursor-pointer transition-all hover:scale-105',
              selectedClub?.id === club.id 
                ? 'ring-2 ring-purple-500 bg-purple-900/20' 
                : 'bg-gray-800/50 hover:bg-gray-700/50'
            )}
            onClick={() => setSelectedClub(club)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-white text-lg">{club.name}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={cn('border-current', getReputationColor(club.reputation))}
                >
                  {getReputationBadge(club.reputation)}
                </Badge>
              </div>
              <p className="text-sm text-gray-400">{club.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Reputation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Репутация</span>
                </div>
                <span className={cn('font-bold', getReputationColor(club.reputation))}>
                  {club.reputation} CRT
                </span>
              </div>

              {/* Members */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Участники</span>
                </div>
                <span className="text-white font-semibold">
                  {club.members}/{club.maxMembers}
                </span>
              </div>

              {/* Prize Pool */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Призовой пул</span>
                </div>
                <span className="text-green-400 font-semibold">
                  {club.monthlyPrizePool.toLocaleString()} T1
                </span>
              </div>

              {/* Join Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Взнос</span>
                </div>
                <span className="text-white font-semibold">
                  {club.price} T1
                </span>
              </div>

              {/* Join Button */}
              <Button 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedClub(club)
                  setShowJoinModal(true)
                }}
                disabled={club.members >= club.maxMembers}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {club.members >= club.maxMembers ? 'Клуб полный' : 'Присоединиться'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Club Details */}
      {selectedClub && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-xl">
                {selectedClub.name}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Статистика
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Настройки
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Club Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-900/20 rounded-lg">
                <Zap className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-400">
                  +{Math.round(selectedClub.boostMultiplier * 100)}%
                </div>
                <div className="text-sm text-gray-400">Буст к голосам</div>
              </div>
              <div className="text-center p-4 bg-green-900/20 rounded-lg">
                <Gift className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-400">
                  +{Math.round(selectedClub.royaltyMultiplier * 100)}%
                </div>
                <div className="text-sm text-gray-400">Роялти от пула</div>
              </div>
              <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                <Target className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-400">
                  {Math.round(selectedClub.obligationRate * 100)}%
                </div>
                <div className="text-sm text-gray-400">Обратно в клуб</div>
              </div>
            </div>

            {/* Achievements */}
            {selectedClub.achievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Medal className="h-5 w-5 mr-2 text-yellow-400" />
                  Достижения клуба
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedClub.achievements.map((achievement) => (
                    <Card key={achievement.id} className="bg-gray-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            achievement.type === 'gold' && 'bg-yellow-500/20',
                            achievement.type === 'silver' && 'bg-gray-400/20',
                            achievement.type === 'bronze' && 'bg-orange-500/20'
                          )}>
                            {achievement.type === 'gold' && '🥇'}
                            {achievement.type === 'silver' && '🥈'}
                            {achievement.type === 'bronze' && '🥉'}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">
                              {achievement.title}
                            </div>
                            <div className="text-sm text-gray-400">
                              {achievement.artist} • {achievement.event}
                            </div>
                            <div className="text-xs text-green-400">
                              +{achievement.reputationBonus} CRT
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Winners */}
            {selectedClub.recentWinners.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                  Последние победы
                </h3>
                <div className="space-y-3">
                  {selectedClub.recentWinners.map((winner) => (
                    <div key={winner.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <Crown className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{winner.artist}</div>
                          <div className="text-sm text-gray-400">{winner.track}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">
                          {winner.prize.toLocaleString()} T1
                        </div>
                        <div className="text-xs text-gray-400">{winner.event}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Club Statistics */}
            {showStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Финансы клуба</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Общий пул</span>
                      <span className="text-white font-semibold">
                        {selectedClub.totalPrizePool.toLocaleString()} T1
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Месячный пул</span>
                      <span className="text-green-400 font-semibold">
                        {selectedClub.monthlyPrizePool.toLocaleString()} T1
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Средний доход участника</span>
                      <span className="text-blue-400 font-semibold">
                        {Math.round(selectedClub.monthlyPrizePool / selectedClub.members)} T1
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Репутация клуба</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Текущий CRT</span>
                      <span className={cn('font-semibold', getReputationColor(selectedClub.reputation))}>
                        {selectedClub.reputation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Уровень</span>
                      <span className="text-white font-semibold">
                        {getReputationBadge(selectedClub.reputation)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Скидка на вход</span>
                      <span className="text-green-400 font-semibold">
                        -{Math.min(Math.floor(selectedClub.reputation / 100), 50)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Join Club Modal */}
      {showJoinModal && selectedClub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Присоединиться к {selectedClub.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {selectedClub.price} T1
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  Взнос за Club-NFT
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">
                    +{Math.round(selectedClub.boostMultiplier * 100)}% к голосам
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Gift className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">
                    +{Math.round(selectedClub.royaltyMultiplier * 100)}% от призового пула
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-gray-300">
                    {Math.round(selectedClub.obligationRate * 100)}% призов обратно в клуб
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  className="flex-1"
                  onClick={() => handleJoinClub(selectedClub.id)}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Присоединиться
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowJoinModal(false)}
                >
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Hook for using club NFT system
export function useClubNFTSystem() {
  const [clubs, setClubs] = useState<ClubNFT[]>([])
  const [userMembership, setUserMembership] = useState<ClubMember | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadClubs = async () => {
    setIsLoading(true)
    try {
      // API call to load clubs
      const response = await fetch('/api/clubs')
      const data = await response.json()
      
      if (data.success) {
        setClubs(data.clubs)
      }
    } catch (error) {
      console.error('Error loading clubs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const joinClub = async (clubId: string) => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/join`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadClubs()
        return true
      }
      return false
    } catch (error) {
      console.error('Error joining club:', error)
      return false
    }
  }

  const leaveClub = async () => {
    try {
      const response = await fetch('/api/clubs/leave', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setUserMembership(null)
        await loadClubs()
        return true
      }
      return false
    } catch (error) {
      console.error('Error leaving club:', error)
      return false
    }
  }

  return {
    clubs,
    userMembership,
    isLoading,
    loadClubs,
    joinClub,
    leaveClub
  }
}
