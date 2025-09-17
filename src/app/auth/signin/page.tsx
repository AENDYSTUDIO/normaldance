'use client'

import { useState } from 'react'
import { signIn, getProviders } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Input, Label, Textarea, Alert, AlertDescription } from '@/components/ui'
import { Loader2, Wallet, Music, Sparkles, AlertCircle } from '@/components/icons'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [siweMessage, setSiweMessage] = useState('')
  const [siweSignature, setSiweSignature] = useState('')
  const [activeTab, setActiveTab] = useState('web3')
  
  const { connected, publicKey, signMessage } = useWallet()
  const { setVisible } = useWalletModal()

  // Получение провайдеров аутентификации
  const [providers, setProviders] = useState<any>(null)

  React.useEffect(() => {
    const getAuthProviders = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    getAuthProviders()
  }, [])

  // Генерация SIWE сообщения
  const generateSiweMessage = () => {
    if (!publicKey) return
    
    const domain = window.location.origin
    const statement = 'Sign in to NormalDance'
    const issuedAt = new Date().toISOString()
    const expirationTime = new Date(Date.now() + 1000 * 60 * 5).toISOString() // 5 минут
    const nonce = Math.random().toString(36).substring(2, 15)
    
    const message = `domain: ${domain}\nstatement: ${statement}\nversion: 1\nchainId: 1\nissuedAt: ${issuedAt}\nexpirationTime: ${expirationTime}\nnonce: ${nonce}\naddress: ${publicKey.toBase58()}`
    
    setSiweMessage(message)
    localStorage.setItem('siwe_nonce', nonce)
  }

  // Подписание сообщения
  const handleSignMessage = async () => {
    if (!publicKey || !signMessage) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const nonce = localStorage.getItem('siwe_nonce')
      if (!nonce) {
        throw new Error('Nonce not found')
      }
      
      const signature = await signMessage(new TextEncoder().encode(siweMessage))
      setSiweSignature(Buffer.from(signature).toString('base64'))
      
      // Вход через NextAuth
      const result = await signIn('solana', {
        message: siweMessage,
        signature: siweSignature,
        redirect: false,
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      // Успешный вход
      router.push('/')
      router.refresh()
      
    } catch (err) {
      console.error('Sign message error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign message')
    } finally {
      setIsLoading(false)
    }
  }

  // Вход через OAuth провайдеры
  const handleOAuthSignIn = async (provider: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await signIn(provider, { callbackUrl: '/' })
      
    } catch (err) {
      console.error('OAuth sign in error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  // Подключение кошелька
  const handleConnectWallet = async () => {
    try {
      setVisible(true)
    } catch (err) {
      console.error('Wallet connection error:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Music className="h-8 w-8 text-purple-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">NORMAL DANCE</h1>
          </div>
          <p className="text-gray-600">Войдите в свою учетную запись</p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Выберите способ входа</CardTitle>
            <CardDescription>
              Войдите с помощью вашего кошелька или учетной записи
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="web3" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Web3
                </TabsTrigger>
                <TabsTrigger value="oauth" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  OAuth
                </TabsTrigger>
              </TabsList>

              <TabsContent value="web3" className="space-y-4">
                {!connected ? (
                  <div className="space-y-4">
                    <Button 
                      onClick={handleConnectWallet}
                      className="w-full"
                      size="lg"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Подключить кошелек
                    </Button>
                    <p className="text-sm text-gray-500 text-center">
                      Подключите ваш Solana кошелек для входа
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium">Адрес кошелька</Label>
                      <p className="text-sm font-mono text-gray-600">
                        {publicKey?.toBase58()}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={generateSiweMessage}
                      variant="outline"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Wallet className="h-4 w-4 mr-2" />
                      )}
                      Сгенерировать сообщение
                    </Button>
                    
                    {siweMessage && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="siwe-message">Сообщение для подписи</Label>
                          <Textarea
                            id="siwe-message"
                            value={siweMessage}
                            readOnly
                            className="text-xs font-mono"
                            rows={4}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleSignMessage}
                          className="w-full"
                          disabled={isLoading || !siweMessage}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Music className="h-4 w-4 mr-2" />
                          )}
                          Подписать и войти
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="oauth" className="space-y-4">
                {providers && Object.values(providers).map((provider: any) => (
                  <Button
                    key={provider.name}
                    onClick={() => handleOAuthSignIn(provider.id)}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Войти через {provider.name}
                  </Button>
                ))}
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Или</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Войдите через Spotify или Apple Music для синхронизации вашей библиотеки
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Нет аккаунта?{' '}
            <a href="/auth/signup" className="text-purple-600 hover:underline">
              Зарегистрироваться
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// Добавляем импорт React
import * as React from 'react'