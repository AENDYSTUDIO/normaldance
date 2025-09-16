'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Bot,
  Users,
  Star,
  TrendingUp,
  Settings,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Bell,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Headphones,
  Music,
  Play,
  Pause,
  Heart,
  Share,
  Download,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  DollarSign,
  Percent,
  Award,
  Crown,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { telegramPartnership, TelegramUser, TelegramPartnershipMetrics } from '@/lib/telegram-partnership'

interface TelegramIntegrationProps {
  className?: string
}

export function TelegramIntegration({ className }: TelegramIntegrationProps) {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null)
  const [metrics, setMetrics] = useState<TelegramPartnershipMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'revenue' | 'settings'>('overview')
  const [isConnected, setIsConnected] = useState(false)
  const [starsBalance, setStarsBalance] = useState(0)
  const [isStarsEnabled, setIsStarsEnabled] = useState(false)

  // Инициализация Telegram интеграции
  useEffect(() => {
    const initializeTelegram = async () => {
      try {
        setLoading(true)
        
        // Получаем пользователя Telegram
        const user = telegramPartnership.getTelegramUser()
        setTelegramUser(user)
        
        if (user) {
          setIsConnected(true)
          
          // Синхронизируем пользователя
          await telegramPartnership.syncUserWithTelegram(user.id.toString())
          
          // Настраиваем Telegram Stars
          const starsSetup = await telegramPartnership.setupTelegramStars()
          setIsStarsEnabled(starsSetup)
          
          // Загружаем метрики
          const partnershipMetrics = await telegramPartnership.getPartnershipMetrics()
          setMetrics(partnershipMetrics)
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to initialize Telegram')
      } finally {
        setLoading(false)
      }
    }

    initializeTelegram()
  }, [])

  // Покупка за Telegram Stars
  const handlePurchaseWithStars = async (amount: number, description: string) => {
    try {
      setLoading(true)
      const result = await telegramPartnership.purchaseWithStars(amount, description)
      
      if (result.success) {
        // Обновляем баланс
        setStarsBalance(prev => prev - amount)
        
        // Показываем уведомление
        telegramPartnership.hapticFeedback('notification')
        
        // Обновляем метрики
        const updatedMetrics = await telegramPartnership.getPartnershipMetrics()
        setMetrics(updatedMetrics)
      } else {
        setError(result.error || 'Failed to purchase with Stars')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to purchase with Stars')
    } finally {
      setLoading(false)
    }
  }

  // Отправка уведомления
  const handleSendNotification = async (message: string) => {
    if (!telegramUser) return
    
    try {
      const success = await telegramPartnership.sendTelegramNotification(
        telegramUser.id,
        message
      )
      
      if (success) {
        telegramPartnership.hapticFeedback('notification')
      } else {
        setError('Failed to send notification')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send notification')
    }
  }

  // Форматирование чисел
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // Форматирование процентов
  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`
  }

  // Получение цвета для метрики
  const getMetricColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-green-500'
    if (value >= threshold * 0.7) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (loading && !telegramUser) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Подключение к Telegram...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="ml-2">
                <RefreshCw className="h-4 w-4 mr-1" />
                Повторить
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Заголовок и статус подключения */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-primary" />
              <CardTitle>Telegram Интеграция</CardTitle>
              <Badge variant={isConnected ? 'default' : 'secondary'} className="ml-2">
                {isConnected ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Подключено
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Не подключено
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Обновить
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {telegramUser && (
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={telegramUser.photo_url} />
                <AvatarFallback>
                  {telegramUser.first_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {telegramUser.first_name} {telegramUser.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  @{telegramUser.username || 'no_username'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {telegramUser.is_premium && (
                    <Badge variant="secondary" className="text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {telegramUser.language_code?.toUpperCase() || 'EN'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Основной контент */}
      <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="revenue">Доходы</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        {/* Обзор */}
        <TabsContent value="overview" className="space-y-4">
          {/* Ключевые метрики */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      {metrics ? formatNumber(metrics.totalUsers) : '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">Всего пользователей</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      {metrics ? formatNumber(metrics.activeUsers) : '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">Активных</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      {metrics ? formatNumber(metrics.revenue) : '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">Доход (Stars)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      {metrics ? formatNumber(metrics.starsEarned) : '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">Заработано Stars</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Детальные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Конверсия и удержание</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Конверсия</span>
                    <span className={cn(
                      'text-sm font-bold',
                      getMetricColor(metrics?.conversionRate || 0, 0.1)
                    )}>
                      {formatPercentage(metrics?.conversionRate || 0)}
                    </span>
                  </div>
                  <Progress value={(metrics?.conversionRate || 0) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Удержание</span>
                    <span className={cn(
                      'text-sm font-bold',
                      getMetricColor(metrics?.retentionRate || 0, 0.3)
                    )}>
                      {formatPercentage(metrics?.retentionRate || 0)}
                    </span>
                  </div>
                  <Progress value={(metrics?.retentionRate || 0) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Удовлетворенность</span>
                    <span className={cn(
                      'text-sm font-bold',
                      getMetricColor(metrics?.userSatisfaction || 0, 0.8)
                    )}>
                      {formatPercentage(metrics?.userSatisfaction || 0)}
                    </span>
                  </div>
                  <Progress value={(metrics?.userSatisfaction || 0) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Активность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Среднее время сессии</span>
                  <span className="text-sm font-bold">
                    {Math.round(metrics?.averageSessionTime || 0)} мин
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Платформа</span>
                  <Badge variant="outline">
                    {telegramPartnership.getPlatform()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Версия</span>
                  <span className="text-sm text-muted-foreground">
                    {telegramPartnership.getVersion()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Тема</span>
                  <Badge variant="outline">
                    {telegramPartnership.getTheme()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Telegram Stars */}
          {isStarsEnabled && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Telegram Stars</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Баланс Stars</span>
                    <span className="text-2xl font-bold text-yellow-500">
                      {starsBalance}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handlePurchaseWithStars(10, 'Премиум подписка')}
                      disabled={starsBalance < 10}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      10 Stars
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePurchaseWithStars(50, 'Расширенная подписка')}
                      disabled={starsBalance < 50}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      50 Stars
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Telegram Stars позволяют покупать контент и услуги прямо в приложении
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Пользователи */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Аналитика пользователей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Детальная аналитика пользователей</p>
                <p className="text-sm">Доступна в полной версии</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Доходы */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Аналитика доходов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Детальная аналитика доходов</p>
                <p className="text-sm">Доступна в полной версии</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Настройки */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки интеграции</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Уведомления</label>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendNotification('Тестовое уведомление')}
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    Отправить тест
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Тактильная обратная связь</label>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => telegramPartnership.hapticFeedback('impact')}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Тест
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Информация о приложении</label>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Платформа: {telegramPartnership.getPlatform()}</div>
                  <div>Версия: {telegramPartnership.getVersion()}</div>
                  <div>Тема: {telegramPartnership.getTheme()}</div>
                  <div>Язык: {telegramPartnership.getLanguage()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
