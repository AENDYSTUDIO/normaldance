'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { TrackCard } from '@/components/audio/track-card'
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Heart, 
  Play,
  Music,
  Radio,
  Sparkles,
  Users,
  Calendar
} from '@/components/icons'
import { formatTime } from '@/lib/utils'

// Mock data for demonstration
const mockTracks = [
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
  },
  {
    id: '2',
    title: 'Midnight Dreams',
    artistName: 'Luna Star',
    genre: 'Ambient',
    duration: 240,
    playCount: 8750,
    likeCount: 543,
    ipfsHash: 'QmYyy...',
    audioUrl: '/sample-audio.mp3',
    coverImage: '/placeholder-album.jpg',
    isExplicit: false,
    isPublished: true,
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z'
  },
  {
    id: '3',
    title: 'Urban Beats',
    artistName: 'Street Composer',
    genre: 'Hip-Hop',
    duration: 200,
    playCount: 23100,
    likeCount: 1521,
    ipfsHash: 'QmZzz...',
    audioUrl: '/sample-audio.mp3',
    coverImage: '/placeholder-album.jpg',
    isExplicit: true,
    isPublished: true,
    createdAt: '2024-01-13T09:00:00Z',
    updatedAt: '2024-01-13T09:00:00Z'
  },
  {
    id: '4',
    title: 'Ocean Waves',
    artistName: 'Nature Sounds',
    genre: 'Ambient',
    duration: 300,
    playCount: 4520,
    likeCount: 234,
    ipfsHash: 'QmAAA...',
    audioUrl: '/sample-audio.mp3',
    coverImage: '/placeholder-album.jpg',
    isExplicit: false,
    isPublished: true,
    createdAt: '2024-01-12T18:00:00Z',
    updatedAt: '2024-01-12T18:00:00Z'
  },
  {
    id: '5',
    title: 'Rock Anthem',
    artistName: 'Thunder Band',
    genre: 'Rock',
    duration: 220,
    playCount: 18900,
    likeCount: 1203,
    ipfsHash: 'QmBBB...',
    audioUrl: '/sample-audio.mp3',
    coverImage: '/placeholder-album.jpg',
    isExplicit: false,
    isPublished: true,
    createdAt: '2024-01-11T14:20:00Z',
    updatedAt: '2024-01-11T14:20:00Z'
  },
  {
    id: '6',
    title: 'Jazz Fusion',
    artistName: 'Smooth Trio',
    genre: 'Jazz',
    duration: 260,
    playCount: 6780,
    likeCount: 456,
    ipfsHash: 'QmCCC...',
    audioUrl: '/sample-audio.mp3',
    coverImage: '/placeholder-album.jpg',
    isExplicit: false,
    isPublished: true,
    createdAt: '2024-01-10T16:45:00Z',
    updatedAt: '2024-01-10T16:45:00Z'
  }
]

const genres = [
  'Все жанры',
  'Electronic',
  'Hip-Hop',
  'Rock',
  'Pop',
  'Jazz',
  'Ambient',
  'Classical',
  'R&B',
  'Country'
]

const sortOptions = [
  { value: 'popular', label: 'Популярные' },
  { value: 'newest', label: 'Новые' },
  { value: 'trending', label: 'В тренде' },
  { value: 'most-played', label: 'Чаще всего играют' },
  { value: 'most-liked', label: 'Больше всего лайков' }
]

export function DiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Все жанры')
  const [sortBy, setSortBy] = useState('popular')
  const [activeTab, setActiveTab] = useState('all')
  const [tracks, setTracks] = useState(mockTracks)

  // Filter and sort tracks
  useEffect(() => {
    let filtered = mockTracks

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artistName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by genre
    if (selectedGenre !== 'Все жанры') {
      filtered = filtered.filter(track => track.genre === selectedGenre)
    }

    // Filter by tab
    if (activeTab === 'new') {
      filtered = filtered.filter(track => {
        const trackDate = new Date(track.createdAt)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return trackDate >= weekAgo
      })
    } else if (activeTab === 'trending') {
      filtered = filtered.filter(track => track.playCount > 10000)
    }

    // Sort tracks
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'trending':
        filtered.sort((a, b) => b.playCount - a.playCount)
        break
      case 'most-played':
        filtered.sort((a, b) => b.playCount - a.playCount)
        break
      case 'most-liked':
        filtered.sort((a, b) => b.likeCount - a.likeCount)
        break
      default: // popular
        filtered.sort((a, b) => b.playCount - a.playCount)
    }

    setTracks(filtered)
  }, [searchQuery, selectedGenre, sortBy, activeTab])

  const trendingTracks = [](track => track.playCount > 10000).slice(0, 3)
  const newTracks = mockTracks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Откройте новую музыку</h1>
          <p className="text-lg mb-6 opacity-90">
            Исследуйте тысячи треков от независимых артистов со всего мира
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              <Radio className="h-4 w-4 mr-2" />
              Слушать радио
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              <Sparkles className="h-4 w-4 mr-2" />
              Открыть плейлисты
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск треков, артистов, альбомов..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('all')}
          >
            Все треки
          </Button>
          <Button
            variant={activeTab === 'new' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('new')}
          >
            Новинки
          </Button>
          <Button
            variant={activeTab === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('trending')}
          >
            В тренде
          </Button>
        </div>

        {/* Featured sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trending now */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-500" />
                В тренде сейчас
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingTracks.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={track.coverImage} />
                      <AvatarFallback>{track.title.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(track.duration)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New releases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Новые релизы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {newTracks.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={track.coverImage} />
                      <AvatarFallback>{track.title.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(track.duration)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Track grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {activeTab === 'all' && 'Все треки'}
              {activeTab === 'new' && 'Новые треки'}
              {activeTab === 'trending' && 'В тренде'}
            </h2>
            <Badge variant="secondary">
              {tracks.length} треков
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}