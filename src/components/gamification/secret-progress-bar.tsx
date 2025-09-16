'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Flame, 
  Sparkles, 
  Rocket, 
  Target,
  Users,
  Clock,
  TrendingUp,
  Gift,
  Crown,
  Star,
  Heart,
  Music,
  Play,
  Share,
  MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressPhase {
  min: number
  max: number
  name: string
  emoji: string
  color: string
  bgColor: string
  description: string
  motivation: string
  icon: React.ComponentType<any>
}

interface SecretProgressBarProps {
  trackId: string
  className?: string
  onComplete?: () => void
  onPhaseChange?: (phase: ProgressPhase) => void
}

interface ProgressData {
  current: number
  target: number // Hidden from users
  phase: ProgressPhase
  contributors: number
  recentContributors: Array<{
    name: string
    amount: number
    timestamp: number
    avatar?: string
  }>
  timeRemaining?: number
  isComplete: boolean
}

const PROGRESS_PHASES: ProgressPhase[] = [
  {
    min: 0,
    max: 25,
    name: 'Искры',
    emoji: '🩸',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    description: 'Первые искры творчества',
    motivation: 'Ты можешь быть тем, кто зажжёт огонь!',
    icon: Sparkles
  },
  {
    min: 25,
    max: 50,
    name: 'Пламя',
    emoji: '🔥',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    description: 'Огонь уже горит',
    motivation: 'Каждый вклад разжигает пламя сильнее!',
    icon: Flame
  },
  {
    min: 50,
    max: 75,
    name: 'Ускорение',
    emoji: '⚡',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    description: 'Момент истины близок',
    motivation: 'Мы на финишной прямой!',
    icon: Zap
  },
  {
    min: 75,
    max: 99,
    name: 'Почти there',
    emoji: '💥',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Осталось совсем чуть-чуть',
    motivation: 'Кто добьёт последний процент?',
    icon: Target
  },
  {
    min: 100,
    max: 100,
    name: 'Релиз активирован',
    emoji: '🚀',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    description: 'Миссия выполнена!',
    motivation: 'Сообщество победило!',
    icon: Rocket
  }
]

export function SecretProgressBar({ 
  trackId, 
  className,
  onComplete,
  onPhaseChange 
}: SecretProgressBarProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showContributors, setShowContributors] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState(false)

  // Load progress data
  const loadProgressData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/tracks/${trackId}/progress`)
      const data = await response.json()
      
      if (data.success) {
        setProgressData(data.data)
        
        // Trigger phase change callback
        if (onPhaseChange) {
          onPhaseChange(data.data.phase)
        }
        
        // Trigger completion callback
        if (data.data.isComplete && onComplete) {
          onComplete()
        }
      }
    } catch (error) {
      console.error('Error loading progress data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [trackId, onComplete, onPhaseChange])

  // Load initial data
  useEffect(() => {
    loadProgressData()
  }, [loadProgressData])

  // Set up real-time updates
  useEffect(() => {
    const interval = setInterval(loadProgressData, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [loadProgressData])

  // Handle contribution
  const handleContribute = async (amount: number) => {
    try {
      const response = await fetch(`/api/tracks/${trackId}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Trigger pulse animation
        setPulseAnimation(true)
        setTimeout(() => setPulseAnimation(false), 1000)
        
        // Reload progress data
        await loadProgressData()
      }
    } catch (error) {
      console.error('Error contributing:', error)
    }
  }

  // Get current phase
  const getCurrentPhase = (percentage: number): ProgressPhase => {
    return PROGRESS_PHASES.find(phase => 
      percentage >= phase.min && percentage <= phase.max
    ) || PROGRESS_PHASES[0]
  }

  // Format percentage without revealing target
  const formatProgress = (current: number, target: number): string => {
    const percentage = Math.min(Math.round((current / target) * 100), 100)
    return `${percentage}%`
  }

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!progressData) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Ошибка загрузки прогресса</p>
        </CardContent>
      </Card>
    )
  }

  const currentPhase = getCurrentPhase((progressData.current / progressData.target) * 100)
  const percentage = Math.min(Math.round((progressData.current / progressData.target) * 100), 100)
  const isComplete = progressData.isComplete

  return (
    <Card className={cn('w-full overflow-hidden', className)}>
      <CardHeader className={cn('pb-4', currentPhase.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <currentPhase.icon className={cn('h-6 w-6', currentPhase.color)} />
            <CardTitle className={cn('text-lg', currentPhase.color)}>
              {currentPhase.emoji} {currentPhase.name}
            </CardTitle>
          </div>
          <Badge variant="outline" className={cn('border-current', currentPhase.color)}>
            {formatProgress(progressData.current, progressData.target)}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {currentPhase.description}
        </p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Прогресс релиза
            </span>
            <span className="text-sm text-gray-500">
              {progressData.contributors} участников
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={percentage} 
              className={cn(
                'h-3 transition-all duration-500',
                pulseAnimation && 'animate-pulse'
              )}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">
                {currentPhase.motivation}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Contributors */}
        {progressData.recentContributors.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                Последние вклады
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContributors(!showContributors)}
              >
                {showContributors ? 'Скрыть' : 'Показать'}
              </Button>
            </div>
            
            {showContributors && (
              <div className="space-y-2">
                {progressData.recentContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                      <span className="text-gray-700">{contributor.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-600 font-medium">
                        +{contributor.amount} T1
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(contributor.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!isComplete && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleContribute(10)}
                className="w-full"
                variant="outline"
              >
                <Zap className="h-4 w-4 mr-2" />
                10 T1
              </Button>
              <Button
                onClick={() => handleContribute(50)}
                className="w-full"
                variant="outline"
              >
                <Flame className="h-4 w-4 mr-2" />
                50 T1
              </Button>
            </div>
            
            <Button
              onClick={() => handleContribute(100)}
              className="w-full"
              variant="default"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Внести вклад
            </Button>
          </div>
        )}

        {/* Completion State */}
        {isComplete && (
          <div className="text-center py-4">
            <Rocket className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-green-600 mb-2">
              🚀 Релиз активирован!
            </h3>
            <p className="text-gray-600 mb-4">
              Сообщество собрало достаточно средств для релиза трека!
            </p>
            <div className="flex justify-center space-x-2">
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Слушать
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Поделиться
              </Button>
            </div>
          </div>
        )}

        {/* Social Features */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{progressData.contributors}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>
                  {progressData.timeRemaining 
                    ? `${Math.ceil(progressData.timeRemaining / 3600)}ч осталось`
                    : 'Без ограничений'
                  }
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Обсудить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for using secret progress bar
export function useSecretProgressBar(trackId: string) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadProgress = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tracks/${trackId}/progress`)
      const data = await response.json()
      
      if (data.success) {
        setProgressData(data.data)
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setIsLoading(false)
    }
  }, [trackId])

  const contribute = useCallback(async (amount: number) => {
    try {
      const response = await fetch(`/api/tracks/${trackId}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadProgress()
        return true
      }
      return false
    } catch (error) {
      console.error('Error contributing:', error)
      return false
    }
  }, [trackId, loadProgress])

  return {
    progressData,
    isLoading,
    loadProgress,
    contribute
  }
}
