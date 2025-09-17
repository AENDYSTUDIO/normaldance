'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Progress } from '@/components/ui'
import { 
  Share2, 
  Users, 
  Gift, 
  TrendingUp, 
  Copy,
  QrCode,
  Mail,
 Smartphone,
  Link,
  CheckCircle,
  Clock,
  Star,
  Zap
} from '@/components/icons'
import { cn } from '@/lib/utils'

interface ReferralData {
  referralCode: string
  referralLink: string
  totalReferrals: number
  successfulReferrals: number
  pendingReferrals: number
  totalEarnings: number
  referralStats: {
    thisMonth: number
    lastMonth: number
    total: number
  }
  recentReferrals: Array<{
    id: string
    username: string
    email?: string
    registeredAt: string
    status: 'completed' | 'pending' | 'failed'
    reward: number
  }>
}

interface ReferralSystemProps {
  className?: string
}

export function ReferralSystem({ className }: ReferralSystemProps) {
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'link' | 'qr' | 'email'>('link')

  // Mock data - в реальном приложении это будет загружаться из API
  useEffect(() => {
    const mockReferralData: ReferralData = {
      referralCode: 'NORMALDANCE123',
      referralLink: 'https://normaldance.app/referral/NORMALDANCE123',
      totalReferrals: 23,
      successfulReferrals: 18,
      pendingReferrals: 5,
      totalEarnings: 4500, // tokens
      referralStats: {
        thisMonth: 8,
        lastMonth: 12,
        total: 23
      },
      recentReferrals: [
        {
          id: '1',
          username: 'music_lover_alex',
          email: 'alex@example.com',
          registeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          reward: 250
        },
        {
          id: '2',
          username: 'beat_creator_maria',
          registeredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          reward: 250
        },
        {
          id: '3',
          username: 'dj_sergey',
          email: 'sergey@example.com',
          registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          reward: 250
        },
        {
          id: '4',
          username: 'sound_engineer_anna',
          registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          reward: 250
        },
        {
          id: '5',
          username: 'producer_dmitry',
          email: 'dmitry@example.com',
          registeredAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          reward: 250
        }
      ]
    }

    setData([])
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const generateQRCode = () => {
    // В реальном приложении здесь будет генерация QR кода
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5PTUxBQU5FRVM8L3RleHQ+PC9zdmc+'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'failed': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Только что'
    if (diffInHours < 24) return `${diffInHours} ч назад`
    if (diffInHours < 48) return 'Вчера'
    return date.toLocaleDateString('ru-RU')
  }

  if (!referralData) {
    return <div>Загрузка...</div>
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-6 w-6 text-purple-600" />
            <span>Реферальная программа</span>
            <Badge variant="secondary" className="ml-2">
              +250 NDT за друга
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{referralData.totalReferrals}</div>
              <div className="text-xs text-muted-foreground">Всего рефералов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{referralData.successfulReferrals}</div>
              <div className="text-xs text-muted-foreground">Успешных</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{referralData.pendingReferrals}</div>
              <div className="text-xs text-muted-foreground">В процессе</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{referralData.totalEarnings}</div>
              <div className="text-xs text-muted-foreground">Токенов NDT</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral tools */}
      <Card>
        <CardHeader>
          <CardTitle>Пригласите друзей</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Referral code and link */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Ваш реферальный код:</span>
              <Badge variant="outline">{referralData.referralCode}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(referralData.referralCode)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Ваша реферальная ссылка:</span>
              <Input
                value={referralData.referralLink}
                readOnly
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(referralData.referralLink)}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Share methods */}
          <div className="space-y-3">
            <span className="text-sm font-medium">Поделиться через:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMethod === 'link' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMethod('link')}
                className="flex items-center space-x-2"
              >
                <Link className="h-4 w-4" />
                <span>Ссылка</span>
              </Button>
              <Button
                variant={selectedMethod === 'qr' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMethod('qr')}
                className="flex items-center space-x-2"
              >
                <QrCode className="h-4 w-4" />
                <span>QR-код</span>
              </Button>
              <Button
                variant={selectedMethod === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMethod('email')}
                className="flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Button>
            </div>
          </div>

          {/* Share content */}
          <div className="bg-muted/50 rounded-lg p-4">
            {selectedMethod === 'link' && (
              <div className="text-center">
                <p className="text-sm mb-3">
                  Пригласите друзей по ссылке и получайте 250 NDT за каждого, кто зарегистрируется!
                </p>
                <Button className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Копировать ссылку
                </Button>
              </div>
            )}
            
            {selectedMethod === 'qr' && (
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <img 
                    src={generateQRCode()} 
                    alt="QR Code" 
                    className="w-32 h-32 border rounded"
                  />
                </div>
                <p className="text-sm mb-3">
                  Отсканируйте QR-код для приглашения друзей
                </p>
                <Button className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  Скачать QR-код
                </Button>
              </div>
            )}
            
            {selectedMethod === 'email' && (
              <div className="space-y-3">
                <p className="text-sm">
                  Пригласите друга по email:
                </p>
                <Input placeholder="friend@example.com" type="email" />
                <Button className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Отправить приглашение
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referral stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Статистика рефералов</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{referralData.referralStats.thisMonth}</div>
                <div className="text-xs text-muted-foreground">В этом месяце</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{referralData.referralStats.lastMonth}</div>
                <div className="text-xs text-muted-foreground">В прошлом месяце</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{referralData.referralStats.total}</div>
                <div className="text-xs text-muted-foreground">Всего</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>До следующего уровня</span>
                <span>2 реферала</span>
              </div>
              <Progress value={(18 / 20) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent referrals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Последние рефералы</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {referralData.recentReferrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {referral.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{referral.username}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(referral.registeredAt)}</span>
                      {referral.email && (
                        <span className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{referral.email}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', getStatusColor(referral.status))}
                  >
                    {referral.status === 'completed' && 'Завершен'}
                    {referral.status === 'pending' && 'В процессе'}
                    {referral.status === 'failed' && 'Неудача'}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm">
                    <Gift className="h-3 w-3 text-green-600" />
                    <span className="font-medium text-green-600">+{referral.reward}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            Показать всех рефералов
          </Button>
        </CardContent>
      </Card>

      {/* Rewards info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span>Как это работает</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                1
              </div>
              <p>Поделитесь своей уникальной реферальной ссылкой с друзьями</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                2
              </div>
              <p>Ваш друг регистрируется по вашей ссылке и подтверждает email</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                3
              </div>
              <p>После первой активности друга вы оба получаете по 250 NDT</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                4
              </div>
              <p>Больше рефералов = больше наград и эксклюзивных бейджей!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}