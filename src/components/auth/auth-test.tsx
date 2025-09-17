'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '@/components/ui'
import { AlertCircle, CheckCircle, Loader2 } from '@/components/icons'
import { useWalletContext } from '@/components/wallet/wallet-provider'

export function AuthTest() {
  const { connected, publicKey, connect, disconnect } = useWalletContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleTestAuth = async () => {
    setIsLoading(true)
    setTestResult({ type: null, message: '' })
    
    try {
      // Имитация теста аутентификации
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email && password) {
        setTestResult({
          type: 'success',
          message: 'Тест аутентификации прошел успешно!'
        })
      } else {
        setTestResult({
          type: 'error',
          message: 'Пожалуйста, введите email и пароль'
        })
      }
    } catch (error) {
      setTestResult({
        type: 'error',
        message: 'Ошибка при тестировании аутентификации'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Тест аутентификации</CardTitle>
        <CardDescription>
          Проверка различных методов аутентификации
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Тест кошелька */}
        <div className="space-y-2">
          <Label>Кошелек</Label>
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">
                  Подключен: {publicKey?.toString().slice(0, 8)}...
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Не подключен</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={connect}
              disabled={connected}
              size="sm"
            >
              Подключить
            </Button>
            <Button
              onClick={disconnect}
              disabled={!connected}
              variant="outline"
              size="sm"
            >
              Отключить
            </Button>
          </div>
        </div>

        {/* Тест email/пароль */}
        <div className="space-y-2">
          <Label>Email/Пароль</Label>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            onClick={handleTestAuth}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Тестирование...
              </>
            ) : (
              'Тест аутентификации'
            )}
          </Button>
        </div>

        {/* Результат теста */}
        {testResult.type && (
          <div className={`flex items-center gap-2 p-2 rounded-md ${
            testResult.type === 'success' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {testResult.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{testResult.message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}