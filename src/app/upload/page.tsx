import { MainLayout } from '@/components/layout/main-layout'
import { AudioPlayer } from '@/components/audio/audio-player'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Music, 
  DollarSign, 
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useState } from 'react'

const genres = [
  'Electronic', 'Ambient', 'Hip-Hop', 'Rock', 'Pop', 'Jazz', 
  'Classical', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae',
  'Dance', 'House', 'Techno', 'Trance', 'Dubstep', 'Drum & Bass'
]

export default function UploadPage() {
  const [formData, setFormData] = useState({
    title: '',
    artistName: '',
    genre: '',
    description: '',
    price: '',
    isExplicit: false,
    isPublished: true,
  })
  
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file)
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setCoverImage(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!audioFile) {
      alert('Пожалуйста, выберите аудиофайл')
      return
    }

    setIsUploading(true)
    setUploadStatus('uploading')
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadStatus('success')
      
      // Reset form
      setFormData({
        title: '',
        artistName: '',
        genre: '',
        description: '',
        price: '',
        isExplicit: false,
        isPublished: true,
      })
      setAudioFile(null)
      setCoverImage(null)
      
    } catch (error) {
      setUploadStatus('error')
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Upload className="h-4 w-4" />
    }
  }

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return `Загрузка... ${uploadProgress}%`
      case 'success':
        return 'Трек успешно загружен!'
      case 'error':
        return 'Ошибка загрузки. Попробуйте еще раз.'
      default:
        return 'Готов к загрузке'
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-2 mb-6">
          <Music className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Загрузить трек</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <span className="font-medium">{getStatusMessage()}</span>
                {uploadStatus === 'uploading' && (
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audio file upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="h-5 w-5" />
                  <span>Аудиофайл</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="hidden"
                      id="audio-upload"
                      disabled={isUploading}
                    />
                    <label 
                      htmlFor="audio-upload" 
                      className="cursor-pointer block"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {audioFile ? audioFile.name : 'Выберите аудиофайл'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        MP3, WAV, FLAC, AAC (макс. 50MB)
                      </p>
                    </label>
                  </div>
                  
                  {audioFile && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{audioFile.name}</span>
                      </div>
                      <Badge variant="outline">
                        {(audioFile.size / 1024 / 1024).toFixed(1)} MB
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cover image upload */}
            <Card>
              <CardHeader>
                <CardTitle>Обложка альбома</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                      id="cover-upload"
                      disabled={isUploading}
                    />
                    <label 
                      htmlFor="cover-upload" 
                      className="cursor-pointer block"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {coverImage ? coverImage.name : 'Выберите изображение'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG (макс. 10MB)
                      </p>
                    </label>
                  </div>
                  
                  {coverImage && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{coverImage.name}</span>
                      </div>
                      <Badge variant="outline">
                        {(coverImage.size / 1024 / 1024).toFixed(1)} MB
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Track information */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о треке</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название трека *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Введите название трека"
                    required
                    disabled={isUploading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="artistName">Имя артиста *</Label>
                  <Input
                    id="artistName"
                    value={formData.artistName}
                    onChange={(e) => setFormData({...formData, artistName: e.target.value})}
                    placeholder="Введите имя артиста"
                    required
                    disabled={isUploading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="genre">Жанр *</Label>
                  <Select 
                    value={formData.genre} 
                    onValueChange={(value) => setFormData({...formData, genre: value})}
                    disabled={isUploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите жанр" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Цена ($NDT)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0 = бесплатно"
                    disabled={isUploading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Расскажите о своем треке..."
                  rows={3}
                  disabled={isUploading}
                />
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isExplicit"
                    checked={formData.isExplicit}
                    onCheckedChange={(checked) => setFormData({...formData, isExplicit: checked})}
                    disabled={isUploading}
                  />
                  <Label htmlFor="isExplicit">Explicit контент</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({...formData, isPublished: checked})}
                    disabled={isUploading}
                  />
                  <Label htmlFor="isPublished">Опубликовать сразу</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" disabled={isUploading}>
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || !audioFile || !formData.title || !formData.artistName || !formData.genre}
            >
              {isUploading ? 'Загрузка...' : 'Загрузить трек'}
            </Button>
          </div>
        </form>

        {/* Upload tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Советы по загрузке</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Используйте высококачественные аудиофайлы (битрейт не менее 320 kbps)</li>
              <li>• Добавляйте точные метаданные для лучшего поиска</li>
              <li>• Используйте уникальную обложку для привлечения внимания</li>
              <li>• Указывайте правильный жанр для попадания в соответствующие подборки</li>
              <li>• За каждый загруженный трек вы получите 20 $NDT токенов</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <AudioPlayer />
    </MainLayout>
  )
}