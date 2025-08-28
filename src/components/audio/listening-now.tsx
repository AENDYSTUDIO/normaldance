'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Headphones, 
  Users, 
  Clock, 
  Music,
  TrendingUp,
  Heart,
  Play
} from 'lucide-react'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface UserListening {
  id: string
  username: string
  displayName?: string
  avatar?: string
  track: {
    id: string
    title: string
    artistName: string
    coverImage?: string
    duration: number
    progress: number // seconds
  }
  startedAt: string
  isLive: boolean
}

interface ListeningNowProps {
  className?: string
  maxUsers?: number
}

export function ListeningNow({ className, maxUsers = 5 }: ListeningNowProps) {
  const [listeners, setListeners] = useState<UserListening[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - в реальном приложении это будет загружаться из WebSocket или API
  useEffect(() => {
    const mockListeners: UserListening[] = [
      {
        id: '1',
        username: 'music_lover_123',
        displayName: 'Алексей',
        avatar: '/placeholder-avatar.jpg',
        track: {
          id: '1',
          title: 'Summer Vibes',
          artistName: 'DJ Melody',
          coverImage: '/placeholder-album.jpg',
          duration: 180,
          progress: 45
        },
        startedAt: new Date(Date.now() - 45000).toISOString(),
        isLive: true
      },
      {
        id: '2',
        username: 'beat_master',
        displayName: 'Мария',
        avatar: '/placeholder-avatar.jpg',
        track: {
          id: '2',
          title: 'Midnight Dreams',
          artistName: 'Luna Star',
          coverImage: '/placeholder-album.jpg',
          duration: 240,
          progress: 120
        },
        startedAt: new Date(Date.now() - 120000).toISOString(),
        isLive: true
      },
      {
        id: '3',
        username: 'electro_fan',
        displayName: 'Иван',
        avatar: '/placeholder-avatar.jpg',
        track: {
          id: '3',
          title: 'Urban Beats',
          artistName: 'Street Composer',
          coverImage: '/placeholder-album.jpg',
          duration: 200,
          progress: 80
        },
        startedAt: new Date(Date.now() - 80000).toISOString(),
        isLive: true
      },
      {
        id: '4',
        username: 'chill_vibes',
        displayName: 'Елена',
        avatar: '/placeholder-avatar.jpg',
        track: {
          id: '1',
          title: 'Summer Vibes',
          artistName: 'DJ Melody',
          coverImage: '/placeholder-album.jpg',
          duration: 180,
          progress: 150
        },
        startedAt: new Date(Date.now() - 150000).toISOString(),
        isLive: true
      },
      {
        id: '5',
        username: 'rock_n_roll',
        displayName: 'Дмитрий',
        avatar: '/placeholder-avatar.jpg',
        track: {
          id: '4',
          title: 'Electric Storm',
          artistName: 'Thunder Band',
          coverImage: '/placeholder-album.jpg',
          duration: 220,
          progress: 30
        },
        startedAt: new Date(Date.now() - 30000).toISOString(),
        isLive: true
      }
    ]

    // Simulate loading
    setTimeout(() => {
      setListeners(mockListeners.slice(0, maxUsers))
      setIsLoading(false)
    }, 1000)
  }, [maxUsers])

  const formatListeningTime = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} сек`
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} мин`
    } else {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ч`
    }
  }

  const getProgressPercentage = (track: UserListening['track']) => {
    return (track.progress / track.duration) * 100
  }

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[...Array(maxUsers)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse"></div>
                  <div className="h-2 bg-muted rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Headphones className="h-5 w-5" />
            <span>Сейчас слушают</span>
            <Badge variant="secondary" className="ml-2">
              {listeners.length}
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {listeners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Сейчас никто не слушает</p>
            </div>
          ) : (
            listeners.map((listener) => (
              <div key={listener.id} className="flex items-center space-x-3 p-2 rounded hover:bg-accent/50 transition-colors">
                {/* User avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={listener.avatar} />
                  <AvatarFallback className="text-xs">
                    {listener.displayName?.charAt(0) || listener.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium truncate">
                      {listener.track.title}
                    </p>
                    {listener.isLive && (
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                        <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                        LIVE
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {listener.track.artistName}
                  </p>
                  
                  {/* Progress bar */}
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${getProgressPercentage(listener.track)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground min-w-[40px]">
                      {formatTime(listener.track.progress)} / {formatTime(listener.track.duration)}
                    </span>
                  </div>
                </div>

                {/* User info and actions */}
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {listener.displayName || listener.username}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatListeningTime(listener.startedAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer stats */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{listeners.length} слушателей</span>
              </span>
              <span className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>В сети</span>
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              Показать всех
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}