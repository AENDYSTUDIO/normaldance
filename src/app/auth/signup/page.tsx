'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, User, Music, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    bio: '',
    isArtist: false,
    artistName: '',
    genre: '',
  })
  
  const { connected, publicKey } = useWallet()
  const { setVisible } = useWalletModal()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connected || !publicKey) {
      setError('Пожалуйста, подключите ваш кошелек перед регистрацией')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          wallet: publicKey.toBase58(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      setSuccess(true)
      
      // Перенаправление на страницу входа после успешной регистрации
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)

    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Успешная регистрация!</h2>
            <p className="text-gray-600 mb-6">
              Ваш аккаунт был создан. Вы будете перенаправлены на страницу входа...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Music className="h-8 w-8 text-purple-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">NORMAL DANCE</h1>
          </div>
          <p className="text-gray-600">Создайте свою учетную запись</p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!connected && (
          <Alert className="mb-6" variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Для регистрации необходимо подключить Solana кошелек
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Создать аккаунт</CardTitle>
            <CardDescription>
              Заполните информацию для создания вашей учетной записи
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!connected && (
                <Button 
                  type="button"
                  onClick={() => setVisible(true)}
                  className="w-full"
                  size="lg"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Подключить кошелек
                </Button>
              )}

              {connected && (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium">Адрес кошелька</Label>
                    <p className="text-sm font-mono text-gray-600">
                      {publicKey?.toBase58()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Имя пользователя *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="user123"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName">Отображаемое имя</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        placeholder="Мое имя"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">О себе</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Расскажите о себе..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isArtist"
                      checked={formData.isArtist}
                      onChange={(e) => handleInputChange('isArtist', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isArtist" className="flex items-center">
                      <Music className="h-4 w-4 mr-2" />
                      Я артист
                    </Label>
                  </div>

                  {formData.isArtist && (
                    <>
                      <div>
                        <Label htmlFor="artistName">Имя артиста *</Label>
                        <Input
                          id="artistName"
                          value={formData.artistName}
                          onChange={(e) => handleInputChange('artistName', e.target.value)}
                          placeholder="Название вашего проекта"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="genre">Основной жанр *</Label>
                        <Select onValueChange={(value) => handleInputChange('genre', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите жанр" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="electronic">Electronic</SelectItem>
                            <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                            <SelectItem value="rock">Rock</SelectItem>
                            <SelectItem value="pop">Pop</SelectItem>
                            <SelectItem value="jazz">Jazz</SelectItem>
                            <SelectItem value="classical">Classical</SelectItem>
                            <SelectItem value="ambient">Ambient</SelectItem>
                            <SelectItem value="dance">Dance</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="techno">Techno</SelectItem>
                            <SelectItem value="other">Другой</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full"
                    size="lg"
                    disabled={isLoading || !formData.username}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <User className="h-4 w-4 mr-2" />
                    )}
                    Создать аккаунт
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Уже есть аккаунт?{' '}
            <a href="/auth/signin" className="text-purple-600 hover:underline">
              Войти
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// Добавляем импорт React
import * as React from 'react'