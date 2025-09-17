'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Avatar, AvatarFallback, AvatarImage, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import {
  ArrowLeft,
  Heart,
  Share,
  Play,
  Pause,
  Download,
  Clock,
  Users,
  TrendingUp,
  MessageCircle,
  MoreHorizontal,
  Calendar,
  Music,
  Headphones
} from '@/components/icons'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TrackDetail {
  id: string
  title: string
  description: string
  artistName: string
  genre: string
  duration: number
  ipfsHash: string
  audioUrl: string
  imageUrl: string
  isExplicit: boolean
  isPublished: boolean
  price?: number
  currency?: string
  createdAt: string
  updatedAt: string
  artist: {
    id: string
    username: string
    displayName: string
    avatar: string
    bio: string
    followersCount: number
  }
  _count: {
    likes: number
    comments: number
  }
  comments: Array<{
    id: string
    userId: string
    user: {
      username: string
      displayName: string
      avatar: string
    }
    content: string
    createdAt: string
    likes: number
    liked: boolean
  }>
  relatedTracks: Array<{
    id: string
    title: string
    artistName: string
    imageUrl: string
    duration: number
  }>
}

export default function TrackDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [track, setTrack] = useState<TrackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')

  const trackId = params.id as string

  useEffect(() => {
    if (trackId) {
      fetchTrackDetails(trackId)
    }
  }, [trackId])

  const fetchTrackDetails = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tracks/${id}`)
      if (response.ok) {
        const data = await response.json()
        setTrack(data)
      } else {
        console.error('Failed to fetch track details')
      }
    } catch (error) {
      console.error('Error fetching track details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    // Implement play/pause logic
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    // Implement like logic
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: track?.title,
        text: track?.description,
        url: window.location.href
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleDownload = () => {
    if (track?.audioUrl) {
      const link = document.createElement('a')
      link.href = track.audioUrl
      link.download = `${track.title}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !session) return
    
    // Implement comment logic
    console.log('Add comment:', newComment)
    setNewComment('')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Трек не найден</h1>
          <Button onClick={() => router.push('/tracks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к трекам
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Track Image and Player */}
        <div className="space-y-6">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={track.imageUrl || '/placeholder-album.jpg'}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Audio Player */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                Воспроизведение
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <audio
                  src={track.audioUrl}
                  controls
                  className="w-full"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button 
                      size="lg" 
                      onClick={handlePlay}
                      className="h-12 w-12 rounded-full"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-1" />
                      )}
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={handleLike}
                      className="h-12 w-12"
                    >
                      <Heart className={cn(
                        'h-5 w-5',
                        isLiked && 'fill-red-500 text-red-500'
                      )} />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={handleDownload}
                      className="h-12 w-12"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={handleShare}>
                      <Share className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Track Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{track.title}</h1>
                <p className="text-xl text-muted-foreground mb-4">{track.artistName}</p>
                
                <div className="flex items-center gap-4 mb-6">
                  <Badge variant={track.isExplicit ? 'destructive' : 'secondary'}>
                    {track.isExplicit ? '18+' : 'Все возраста'}
                  </Badge>
                  <Badge variant="outline">{track.genre}</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </Badge>
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">{track.description}</p>
          </div>

          {/* Artist Info */}
          <Card>
            <CardHeader>
              <CardTitle>Об артисте</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={track.artist.avatar} />
                  <AvatarFallback>{track.artist.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{track.artist.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{track.artist.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {track.artist.followersCount} подписчиков
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{track.artist.bio}</p>
              <Button variant="outline" size="sm">
                Подписаться
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Headphones className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{track.playCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Прослушиваний</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{track.likeCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Лайков</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              В плейлист
            </Button>
            <Button variant="outline" className="flex-1">
              <Heart className="h-4 w-4 mr-2" />
              В избранное
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Tabs */}
      <Tabs defaultValue="comments" className="mt-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comments">Комментарии ({track._count.comments})</TabsTrigger>
          <TabsTrigger value="related">Похожие треки</TabsTrigger>
          <TabsTrigger value="details">Детали</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Комментарии</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add comment */}
              {session && (
                <div className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Добавить комментарий..."
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button onClick={handleAddComment}>
                      Опубликовать
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Comments list */}
              <div className="space-y-4">
                {track.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.user.avatar} />
                      <AvatarFallback>{comment.user.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comment.user.displayName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { 
                            addSuffix: true, 
                            locale: ru 
                          })}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{comment.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-foreground">
                          <Heart className="h-3 w-3" />
                          {comment.likes}
                        </button>
                        <button className="hover:text-foreground">Ответить</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="related">
          <Card>
            <CardHeader>
              <CardTitle>Похожие треки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {track.relatedTracks.map((relatedTrack) => (
                  <div key={relatedTrack.id} className="flex items-center gap-4 p-3 hover:bg-accent rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={relatedTrack.coverImage} />
                      <AvatarFallback>{relatedTrack.title.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{relatedTrack.title}</p>
                      <p className="text-sm text-muted-foreground">{relatedTrack.artistName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(relatedTrack.duration / 60)}:{(relatedTrack.duration % 60).toString().padStart(2, '0')}
                      </span>
                      <Button size="sm" variant="ghost">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Информация о треке</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Название:</span>
                  <span>{track.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Артист:</span>
                  <span>{track.artistName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Жанр:</span>
                  <span>{track.genre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Длительность:</span>
                  <span>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Создан:</span>
                  <span>{formatDistanceToNow(new Date(track.createdAt), { 
                    addSuffix: true, 
                    locale: ru 
                  })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Обновлен:</span>
                  <span>{formatDistanceToNow(new Date(track.updatedAt), { 
                    addSuffix: true, 
                    locale: ru 
                  })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IPFS Hash:</span>
                  <span className="font-mono text-xs">{track.ipfsHash}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}