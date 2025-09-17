'use client'

import { useState, useEffect } from 'react'
import { useAudioStore } from '@/store/use-audio-store'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { 
  Plus, 
  Play, 
  Pause, 
  Heart, 
  MoreHorizontal,
  Clock,
  Music,
  Users,
  TrendingUp,
  X,
  Edit,
  Save,
  Trash2
} from '@/components/icons'
import { formatTime, formatNumber } from '@/lib/utils'
import { Track } from '@/store/use-audio-store'
import { cn } from '@/lib/utils'

interface Playlist {
  id: string
  name: string
  description?: string
  coverImage?: string
  trackCount: number
  playCount: number
  isPublic: boolean
  createdAt: string
  tracks: Track[]
  createdBy: string
}

interface PlaylistManagerProps {
  className?: string
}

export function PlaylistManager({ className }: PlaylistManagerProps) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    addToQueue,
    removeFromQueue
  } = useAudioStore()

  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Mock playlists data - в реальном приложении это будет загружаться из API
  useEffect(() => {
    const mockPlaylists: Playlist[] = [
      {
        id: '1',
        name: 'Моя любимая музыка',
        description: 'Треки, которые я люблю слушать',
        coverImage: '/placeholder-album.jpg',
        trackCount: 25,
        playCount: 15420,
        isPublic: true,
        createdAt: '2024-01-15T10:00:00Z',
        tracks: [
          {
            id: '1',
            title: 'Summer Vibes',
            artistName: 'DJ Melody',
            genre: 'Electronic',
            duration: 180,
            playCount: 15420,
            likeCount: 892,
            ipfsHash: 'QmXxx...',
            audioUrl: '/sample-audio.mp3',
            coverImage: '/placeholder-album.jpg',
            isExplicit: false,
            isPublished: true,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          }
        ],
        createdBy: 'current-user'
      },
      {
        id: '2',
        name: 'Рабочая атмосфера',
        description: 'Идеальная музыка для работы',
        coverImage: '/placeholder-album.jpg',
        trackCount: 18,
        playCount: 8750,
        isPublic: true,
        createdAt: '2024-01-14T15:30:00Z',
        tracks: [],
        createdBy: 'current-user'
      },
      {
        id: '3',
        name: 'Танцевальные хиты',
        description: 'Лучшие танцевальные треки',
        coverImage: '/placeholder-album.jpg',
        trackCount: 32,
        playCount: 23100,
        isPublic: false,
        createdAt: '2024-01-13T09:00:00Z',
        tracks: [],
        createdBy: 'current-user'
      }
    ]
    setPlaylists(mockPlaylists)
  }, [])

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      description: newPlaylistDescription,
      trackCount: 0,
      playCount: 0,
      isPublic: true,
      createdAt: new Date().toISOString(),
      tracks: [],
      createdBy: 'current-user'
    }

    setPlaylists([...playlists, newPlaylist])
    setNewPlaylistName('')
    setNewPlaylistDescription('')
    setIsCreating(false)
  }

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist.id)
    setEditName(playlist.name)
    setEditDescription(playlist.description || '')
  }

  const handleSavePlaylist = (playlistId: string) => {
    setPlaylists(playlists.map(p => 
      p.id === playlistId 
        ? { ...p, name: editName, description: editDescription }
        : p
    ))
    setEditingPlaylist(null)
  }

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId))
    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(null)
    }
  }

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks)
    }
  }

  const handleAddToQueue = (track: Track) => {
    addToQueue(track)
  }

  const handleRemoveFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(playlists.map(p => 
      p.id === playlistId 
        ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId), trackCount: p.trackCount - 1 }
        : p
    ))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Сегодня'
    if (diffInDays === 1) return 'Вчера'
    if (diffInDays < 7) return `${diffInDays} дня назад`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} нед. назад`
    return `${Math.floor(diffInDays / 30)} мес. назад`
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Create playlist button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Мои плейлисты</h2>
        {!isCreating ? (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Создать плейлист
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Название плейлиста"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-48"
            />
            <Input
              placeholder="Описание (опционально)"
              value={newPlaylistDescription}
              onChange={(e) => setNewPlaylistDescription(e.target.value)}
              className="w-64"
            />
            <Button onClick={handleCreatePlaylist}>Создать</Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>Отмена</Button>
          </div>
        )}
      </div>

      {/* Playlists grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <Card 
            key={playlist.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedPlaylist?.id === playlist.id && 'ring-2 ring-primary'
            )}
            onClick={() => setSelectedPlaylist(playlist)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={playlist.coverImage} />
                    <AvatarFallback>{playlist.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    {editingPlaylist === playlist.id ? (
                      <div className="space-y-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-sm font-medium"
                        />
                        <Input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Описание"
                          className="text-xs"
                        />
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-sm font-medium truncate">
                          {playlist.name}
                        </CardTitle>
                        {playlist.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {playlist.description}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {editingPlaylist === playlist.id ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSavePlaylist(playlist.id)
                        }}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingPlaylist(null)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditPlaylist(playlist)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePlaylist(playlist.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center gap-1">
                    <Music className="h-3 w-3" />
                    {playlist.trackCount} треков
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {formatNumber(playlist.playCount)}
                  </span>
                </div>
                <Badge variant={playlist.isPublic ? 'default' : 'secondary'}>
                  {playlist.isPublic ? 'Публичный' : 'Приватный'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatDate(playlist.createdAt)}
                </span>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlayPlaylist(playlist)
                  }}
                >
                  {currentTrack && playlist.tracks.some(t => t.id === currentTrack.id) && isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected playlist details */}
      {selectedPlaylist && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedPlaylist.name}</CardTitle>
              <Button variant="ghost" onClick={() => setSelectedPlaylist(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {selectedPlaylist.description && (
              <p className="text-muted-foreground">{selectedPlaylist.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Playlist tracks */}
              {selectedPlaylist.tracks.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Плейлист пуст</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedPlaylist.tracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center space-x-3 p-2 rounded hover:bg-accent"
                    >
                      <span className="text-sm text-muted-foreground w-8">
                        {index + 1}
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={track.coverImage} />
                        <AvatarFallback className="text-xs">
                          {track.title.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {track.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {track.artistName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(track.duration)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddToQueue(track)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFromPlaylist(selectedPlaylist.id, track.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}