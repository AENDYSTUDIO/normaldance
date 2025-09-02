'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Ошибка аутентификации
          </CardTitle>
          <CardDescription>
            Произошла проблема при попытке входа в систему
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Произошла ошибка аутентификации
            </h3>
            <p className="text-sm text-gray-600">
              Пожалуйста, попробуйте войти снова или свяжитесь с поддержкой
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Попробовать снова
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                На главную
              </Link>
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>Если проблема сохраняется, пожалуйста, свяжитесь с поддержкой</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}