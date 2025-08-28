'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Spotify, 
  Apple, 
  Music, 
  Link, 
  Unlink, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Search,
  Playlist,
  Heart,
  TrendingUp,
  Settings,
  RefreshCw
} from 'lucide-react'
import { useSpotifyIntegration } from '@/lib/integrations/spotify-integration'
import { useAppleMusicIntegration } from '@/lib/integrations/apple-music-integration'

interface IntegrationStatus {
  spotify: {
    connected: boolean
    user?: any
    loading: boolean
    error?: string
  }
  appleMusic: {
    connected: boolean
    user?: any
    loading: boolean
    error?: string
  }
}

interface Playlist {
  id: string
  name: string
  trackCount: number
  externalUrl: string
  image?: string
  service: 'spotify' | 'appleMusic'
}

interface Track {
  id: string
  name: string
  artist: string
  duration: number
  externalUrl: string
  image?: string
  service: 'spotify' | 'appleMusic'
}

export function MusicServicesIntegration() {
  const [status, setStatus] = useState<IntegrationStatus>({
    spotify: { connected: false, loading: false },
    appleMusic: { connected: false, loading: false }
  })

  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{
    tracks: Track[]
    playlists: Playlist[]
  }>({ tracks: [], playlists: [] })
  const [importing, setImporting] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Инициализация интеграций
  const spotify = useSpotifyIntegration({
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || '',
    redirectUri: `${window.location.origin}/api/auth/spotify/callback`
  })

  const appleMusic = useAppleMusicIntegration({
    developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN || '',
    storefront: 'us'
  })

  // Проверка статуса интеграций
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [spotifyConnected, appleMusicConnected] = await Promise.all([
          spotify.isConnected(),
          appleMusic.isConnected()
        ])

        setStatus(prev => ({
          ...prev,
          spotify: { ...prev.spotify, connected: spotifyConnected },
          appleMusic: { ...prev.appleMusic, connected: appleMusicConnected }
        }))

        // Загрузка данных если подключено
        if (spotifyConnected) {
          await loadSpotifyData()
        }
        if (appleMusicConnected) {
          await loadAppleMusicData()
        }
      } catch (error) {
        console.error('Failed to check integration status:', error)
      }
    }

    checkStatus()
  }, [spotify, appleMusic])

  // Загрузка данных Spotify
  const loadSpotifyData = async () => {
    try {
      setStatus(prev => ({ ...prev, spotify: { ...prev.spotify, loading: true } }))
      
      const user = await spotify.spotify.getUserProfile()
      const userPlaylists = await spotify.spotify.getUserPlaylists(20)
      
      setStatus(prev => ({ 
        ...prev, 
        spotify: { 
          ...prev.spotify, 
          connected: true, 
          user,
          loading: false 
        } 
      }))

      // Конвертация плейлистов
      const convertedPlaylists = userPlaylists.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        trackCount: playlist.tracks.total,
        externalUrl: playlist.external_urls.spotify,
        image: playlist.images[0]?.url,
        service: 'spotify' as const
      }))

      setPlaylists(prev => [...prev, ...convertedPlaylists])
    } catch (error) {
      console.error('Failed to load Spotify data:', error)
      setStatus(prev => ({ 
        ...prev, 
        spotify: { 
          ...prev.spotify, 
          error: 'Failed to load Spotify data',
          loading: false 
        } 
      }))
    }
  }

  // Загрузка данных Apple Music
  const loadAppleMusicData = async () => {
    try {
      setStatus(prev => ({ ...prev, appleMusic: { ...prev.appleMusic, loading: true } }))
      
      const library = await appleMusic.appleMusic.getUserLibrary(20)
      
      setStatus(prev => ({ 
        ...prev, 
        appleMusic: { 
          ...prev.appleMusic, 
          connected: true, 
          userLibrary: library,
          loading: false 
        } 
      }))

      // Конвертация плейлистов
      const convertedPlaylists = library.playlists.map(playlist => ({
        id: playlist.id,
        name: playlist.attributes.name,
        trackCount: playlist.attributes.trackCount,
        externalUrl: playlist.attributes.url,
        image: playlist.attributes.artwork.url,
        service: 'appleMusic' as const
      }))

      setPlaylists(prev => [...prev, ...convertedPlaylists])
    } catch (error) {
      console.error('Failed to load Apple Music data:', error)
      setStatus(prev => ({ 
        ...prev, 
        appleMusic: { 
          ...prev.appleMusic, 
          error: 'Failed to load Apple Music data',
          loading: false 
        } 
      }))
    }
  }

  // Поиск треков
  const handleSearch = async (service: 'spotify' | 'appleMusic') => {
    if (!searchQuery.trim()) return

    try {
      setImporting(true)
      
      let results
      if (service === 'spotify') {
        const searchResult = await spotify.spotify.search(searchQuery, ['track'], 10)
        results = {
          tracks: searchResult.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            duration: track.duration_ms,
            externalUrl: track.external_urls.spotify,
            image: track.album.images[0]?.url,
            service: 'spotify' as const
          }))
        }
      } else {
        const searchResult = await appleMusic.appleMusic.search(searchQuery, ['songs'], 10)
        results = {
          tracks: searchResult.songs.data.map(track => ({
            id: track.id,
            name: track.attributes.name,
            artist: track.attributes.artistName,
            duration: track.attributes.durationInMillis,
            externalUrl: track.attributes.url,
            image: track.attributes.artwork.url,
            service: 'appleMusic' as const
          }))
        }
      }

      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setImporting(false)
    }
  }

  // Импорт плейлиста
  const handleImportPlaylist = async (playlist: Playlist) => {
    try {
      setImporting(true)
      
      let importedData
      if (playlist.service === 'spotify') {
        importedData = await spotify.spotify.importPlaylistToNormalDance(playlist.id, 'current-user-id')
      } else {
        importedData = await appleMusic.appleMusic.importPlaylistToNormalDance(playlist.id, 'current-user-id')
      }

      // Здесь будет логика сохранения в базу данных NormalDance
      console.log('Imported playlist:', importedData)
      
      // Обновление списка плейлистов
      setPlaylists(prev => prev.filter(p => p.id !== playlist.id))
      
      alert(`Плейлист "${playlist.name}" успешно импортирован!`)
    } catch (error) {
      console.error('Import failed:', error)
      alert('Не удалось импортировать плейлист')
    } finally {
      setImporting(false)
    }
  }

  // Синхронизация библиотек
  const handleSyncLibrary = async () => {
    try {
      setSyncing(true)
      
      const [spotifySync, appleMusicSync] = await Promise.all([
        spotify.spotify.syncPlaylists('current-user-id'),
        appleMusic.appleMusic.syncLibrary('current-user-id')
      ])

      console.log('Spotify sync result:', spotifySync)
      console.log('Apple Music sync result:', appleMusicSync)
      
      alert('Библиотека успешно синхронизирована!')
    } catch (error) {
      console.error('Sync failed:', error)
      alert('Не удалось синхронизировать библиотеку')
    } finally {
      setSyncing(false)
    }
  }

  // Отключение интеграции
  const handleDisconnect = (service: 'spotify' | 'appleMusic') => {
    if (service === 'spotify') {
      spotify.disconnect()
    } else {
      appleMusic.disconnect()
    }
    
    setStatus(prev => ({
      ...prev,
      [service]: { connected: false, loading: false }
    }))
    
    // Удаление данных сервиса из списков
    setPlaylists(prev => prev.filter(p => p.service !== service))
    setTracks(prev => prev.filter(t => t.service !== service))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Музыкальные сервисы</h2>
        <Button 
          onClick={handleSyncLibrary}
          disabled={syncing}
          variant="outline"
          size="sm"
        >
          {syncing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Синхронизация...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Синхронизировать библиотеку
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">Подключения</TabsTrigger>
          <TabsTrigger value="playlists">Мои плейлисты</TabsTrigger>
          <TabsTrigger value="search">Поиск</TabsTrigger>
        </TabsList>

        {/* Подключения */}
        <TabsContent value="connections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spotify */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Spotify className="h-5 w-5 text-green-600" />
                  Spotify
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {status.spotify.connected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Подключено</span>
                    </div>
                    {status.spotify.user && (
                      <div className="text-sm">
                        <p className="font-medium">{status.spotify.user.display_name}</p>
                        <p className="text-muted-foreground">{status.spotify.user.email}</p>
                      </div>
                    )}
                    <Button 
                      onClick={() => handleDisconnect('spotify')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      Отключить
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Не подключено</span>
                    </div>
                    <Button 
                      onClick={() => window.open(spotify.connect(), '_blank')}
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Подключить Spotify
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Apple Music */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5 text-gray-800" />
                  Apple Music
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {status.appleMusic.connected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Подключено</span>
                    </div>
                    <Button 
                      onClick={() => handleDisconnect('appleMusic')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      Отключить
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Не подключено</span>
                    </div>
                    <Button 
                      onClick={() => window.open(appleMusic.connect(), '_blank')}
                      size="sm"
                      className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Подключить Apple Music
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Мои плейлисты */}
        <TabsContent value="playlists" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <Card key={`${playlist.service}-${playlist.id}`} className="group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm truncate">{playlist.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {playlist.service === 'spotify' ? 'Spotify' : 'Apple Music'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {playlist.trackCount} треков
                        </span>
                      </div>
                    </div>
                    {playlist.image && (
                      <img 
                        src={playlist.image} 
                        alt={playlist.name}
                        className="w-10 h-10 rounded object-cover ml-2 flex-shrink-0"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(playlist.externalUrl, '_blank')}
                      className="flex-1"
                    >
                      <Music className="h-3 w-3 mr-1" />
                      Открыть
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleImportPlaylist(playlist)}
                      disabled={importing}
                      className="flex-1"
                    >
                      {importing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Playlist className="h-3 w-3 mr-1" />
                          Импорт
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {playlists.length === 0 && (
            <div className="text-center py-8">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Нет подключенных плейлистов</p>
              <p className="text-sm text-muted-foreground mt-1">
                Подключите Spotify или Apple Music, чтобы увидеть ваши плейлисты
              </p>
            </div>
          )}
        </TabsContent>

        {/* Поиск */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Поиск треков</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="search">Поиск</Label>
                  <Input
                    id="search"
                    placeholder="Введите название трека или артиста..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleSearch('spotify')}
                  disabled={!searchQuery.trim() || importing}
                  variant="outline"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Spotify
                </Button>
                <Button 
                  onClick={() => handleSearch('appleMusic')}
                  disabled={!searchQuery.trim() || importing}
                  variant="outline"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Apple Music
                </Button>
              </div>

              {importing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Поиск...
                </div>
              )}

              {searchResults.tracks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Результаты поиска</h4>
                  <div className="space-y-2">
                    {searchResults.tracks.map((track) => (
                      <div key={`${track.service}-${track.id}`} className="flex items-center gap-3 p-2 border rounded">
                        {track.image && (
                          <img 
                            src={track.image} 
                            alt={track.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {track.service === 'spotify' ? 'Spotify' : 'Apple Music'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Heart className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MusicServicesIntegration