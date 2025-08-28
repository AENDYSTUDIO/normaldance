'use client'

import { useSession } from 'next-auth/react'
import { NFTMarketplace } from '@/components/nft/nft-marketplace'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Zap, 
  Globe, 
  TrendingUp, 
  Users, 
  Diamond,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function NFTPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">NFT Маркетплейс</h1>
            <p className="text-muted-foreground">
              Исследуйте, покупайте и продавайте музыкальные NFT на NormalDance
            </p>
          </div>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center space-y-4">
              <Diamond className="h-12 w-12 mx-auto text-purple-500" />
              <div>
                <h3 className="font-semibold mb-2">Войдите для доступа к NFT</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Чтобы покупать, продавать и управлять NFT, пожалуйста войдите в свой аккаунт
                </p>
                <Button asChild>
                  <Link href="/auth/signin">
                    Войти в аккаунт
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            NFT Маркетплейс
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Исследуйте уникальные музыкальные NFT, созданные артистами NormalDance. 
            Покупайте, продавайте и собирайте цифровые активы.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            1000+ NFT
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            500+ Артистов
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Тренды в реальном времени
          </Badge>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <Shield className="h-8 w-8 mx-auto text-blue-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg mb-2">Безопасность</CardTitle>
            <CardDescription>
              Все транзакции защищены блокчейном Solana с гарантией подлинности
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-4">
            <Zap className="h-8 w-8 mx-auto text-yellow-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg mb-2">Быстрые сделки</CardTitle>
            <CardDescription>
              Мгновенные подтверждения транзакций благодаря Solana
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-4">
            <Globe className="h-8 w-8 mx-auto text-green-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg mb-2">Глобальный доступ</CardTitle>
            <CardDescription>
              Покупайте и продавайте NFT из любой точки мира
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-4">
            <TrendingUp className="h-8 w-8 mx-auto text-purple-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg mb-2">Инвестиции</CardTitle>
            <CardDescription>
              Инвестируйте в музыкальные NFT с потенциалом роста
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <NFTMarketplace userId={session.user.id} />

      {/* Additional Info */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Как это работает?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Выберите NFT</h4>
                <p className="text-sm text-muted-foreground">
                  Исследуйте коллекции и найдите идеальный музыкальный NFT
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Подключите кошелек</h4>
                <p className="text-sm text-muted-foreground">
                  Используйте Phantom кошелек для безопасных транзакций
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Совершите покупку</h4>
                <p className="text-sm text-muted-foreground">
                  Купите NFT и получите подтверждение в блокчейне
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold">Управляйте активами</h4>
                <p className="text-sm text-muted-foreground">
                  Отслеживайте свой портфель NFT в личном кабинете
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Преимущества NFT на NormalDance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold">Уникальные права</h4>
                <p className="text-sm text-muted-foreground">
                  Получите эксклюзивные права на музыку и контент
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold">Роялти</h4>
                <p className="text-sm text-muted-foreground">
                  Получайте процент от перепродаж вашего NFT
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold">Сообщество</h4>
                <p className="text-sm text-muted-foreground">
                  Присоединяйтесь к сообществу ценителей музыки
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold">Прозрачность</h4>
                <p className="text-sm text-muted-foreground">
                  Все транзакции записаны в блокчейне
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}