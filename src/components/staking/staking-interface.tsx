'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Lock,
  Unlock,
  Calculator,
  AlertCircle,
  CheckCircle,
  Loader2,
  Star,
  Zap,
  Calendar,
  Target
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

// Mock data for staking
const mockStakingPools = [
  {
    id: '1',
    name: 'Standard Staking',
    apy: 12.5,
    minAmount: 100,
    maxAmount: 10000,
    duration: 30,
    totalStaked: 50000,
    participants: 1234,
    isAvailable: true,
    description: 'Стандартный пул стейкинга с фиксированной доходностью'
  },
  {
    id: '2',
    name: 'Premium Staking',
    apy: 18.0,
    minAmount: 1000,
    maxAmount: 50000,
    duration: 90,
    totalStaked: 120000,
    participants: 567,
    isAvailable: true,
    description: 'Премиум пул с повышенной доходностью'
  },
  {
    id: '3',
    name: 'VIP Staking',
    apy: 25.0,
    minAmount: 10000,
    maxAmount: 100000,
    duration: 180,
    totalStaked: 300000,
    participants: 89,
    isAvailable: true,
    description: 'VIP пул для крупных держателей'
  }
]

const mockUserStakes = [
  {
    id: '1',
    poolName: 'Standard Staking',
    amount: 1000,
    apy: 12.5,
    startDate: '2024-01-15T10:00:00Z',
    endDate: '2024-02-14T10:00:00Z',
    earned: 10.42,
    status: 'active'
  },
  {
    id: '2',
    poolName: 'Premium Staking',
    amount: 5000,
    apy: 18.0,
    startDate: '2024-01-10T10:00:00Z',
    endDate: '2024-04-09T10:00:00Z',
    earned: 75.0,
    status: 'active'
  }
]

export function StakingInterface() {
  const [userBalance, setUserBalance] = useState(15000)
  const [selectedPool, setSelectedPool] = useState(mockStakingPools[0])
  const [stakeAmount, setStakeAmount] = useState('')
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [activeTab, setActiveTab] = useState('stake')
  const [stakes, setStakes] = useState(mockUserStakes)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const calculateRewards = (amount: number, apy: number, days: number) => {
    const dailyRate = apy / 100 / 365
    return amount * dailyRate * days
  }

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount)
    if (!amount || amount <= 0) {
      setError('Пожалуйста, введите корректную сумму')
      return
    }

    if (amount > userBalance) {
      setError('Недостаточно средств на балансе')
      return
    }

    if (amount < selectedPool.minAmount) {
      setError(`Минимальная сумма для стейкинга: ${selectedPool.minAmount} NDT`)
      return
    }

    if (amount > selectedPool.maxAmount) {
      setError(`Максимальная сумма для стейкинга: ${selectedPool.maxAmount} NDT`)
      return
    }

    setIsStaking(true)
    setError(null)
    setSuccess(null)

    try {
      // Simulate staking transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update user balance
      setUserBalance(prev => prev - amount)
      
      // Add new stake
      const newStake = {
        id: Date.now().toString(),
        poolName: selectedPool.name,
        amount,
        apy: selectedPool.apy,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + selectedPool.duration * 24 * 60 * 60 * 1000).toISOString(),
        earned: 0,
        status: 'active'
      }
      
      setStakes(prev => [newStake, ...prev])
      setSuccess(`Успешно заблокировано ${amount} NDT в пуле ${selectedPool.name}`)
      setStakeAmount('')
    } catch (err) {
      setError('Ошибка при стейкинге. Пожалуйста, попробуйте снова.')
    } finally {
      setIsStaking(false)
    }
  }

  const handleUnstake = async (stakeId: string) => {
    setIsUnstaking(true)
    setError(null)

    try {
      // Simulate unstaking transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update stake status
      setStakes(prev => prev.map(stake => 
        stake.id === stakeId ? { ...stake, status: 'completed' } : stake
      ))
      
      // Return funds to balance (in real app, this would happen after cooldown)
      const stake = stakes.find(s => s.id === stakeId)
      if (stake) {
        setUserBalance(prev => prev + stake.amount)
      }
      
      setSuccess('Средства успешно разблокированы')
    } catch (err) {
      setError('Ошибка при разблокировке средств. Пожалуйста, попробуйте снова.')
    } finally {
      setIsUnstaking(false)
    }
  }

  const totalStaked = stakes.reduce((sum, stake) => sum + stake.amount, 0)
  const totalEarned = stakes.reduce((sum, stake) => sum + stake.earned, 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Стейкинг NDT</h1>
          <p className="text-lg mb-6 opacity-90">
            Зарабатывайте пассивный доход, блокируя ваши NDT токены
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              <Zap className="h-4 w-4 mr-2" />
              Начать стейкинг
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              <Target className="h-4 w-4 mr-2" />
              Стратегии
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Баланс NDT</p>
                  <p className="text-2xl font-bold">{formatNumber(userBalance)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всего заблокировано</p>
                  <p className="text-2xl font-bold">{formatNumber(totalStaked)}</p>
                </div>
                <Lock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Заработано</p>
                  <p className="text-2xl font-bold text-green-600">{formatNumber(totalEarned)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Активные стейки</p>
                  <p className="text-2xl font-bold">{stakes.filter(s => s.status === 'active').length}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'stake' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('stake')}
          >
            Стейкинг
          </Button>
          <Button
            variant={activeTab === 'my-stakes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('my-stakes')}
          >
            Мои стейки
          </Button>
          <Button
            variant={activeTab === 'rewards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('rewards')}
          >
            Награды
          </Button>
        </div>

        {activeTab === 'stake' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staking form */}
            <Card>
              <CardHeader>
                <CardTitle>Стейкинг NDT</CardTitle>
                <CardDescription>
                  Выберите пул и заблокируйте ваши токены для получения дохода
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pool selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Выберите пул</label>
                  <div className="space-y-2">
                    {mockStakingPools.map((pool) => (
                      <div
                        key={pool.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPool.id === pool.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                        }`}
                        onClick={() => setSelectedPool(pool)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{pool.name}</h4>
                          <Badge variant="secondary">{pool.apy}% APY</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{pool.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Мин: {pool.minAmount} NDT</span>
                          <span>Макс: {pool.maxAmount} NDT</span>
                          <span>{pool.duration} дней</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount input */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Сумма для стейкинга</label>
                  <Input
                    type="number"
                    placeholder="Введите сумму NDT"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>Доступно: {formatNumber(userBalance)} NDT</span>
                    <span>Мин: {selectedPool.minAmount} NDT</span>
                  </div>
                </div>

                {/* Rewards preview */}
                {stakeAmount && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>Ожидаемый доход:</span>
                      <span className="font-medium text-green-600">
                        {formatNumber(calculateRewards(
                          parseFloat(stakeAmount) || 0,
                          selectedPool.apy,
                          selectedPool.duration
                        ))} NDT
                      </span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleStake}
                    disabled={isStaking || !stakeAmount}
                    className="flex-1"
                  >
                    {isStaking ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Заблокировать
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setStakeAmount('')}
                    disabled={isStaking}
                  >
                    Очистить
                  </Button>
                </div>

                {/* Error and success messages */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">{success}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pool details */}
            <Card>
              <CardHeader>
                <CardTitle>Информация о пуле</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Название пула</span>
                    <span className="text-sm font-medium">{selectedPool.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Годовая доходность (APY)</span>
                    <span className="text-sm font-medium text-green-600">{selectedPool.apy}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Срок блокировки</span>
                    <span className="text-sm font-medium">{selectedPool.duration} дней</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Минимальная сумма</span>
                    <span className="text-sm font-medium">{selectedPool.minAmount} NDT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Максимальная сумма</span>
                    <span className="text-sm font-medium">{selectedPool.maxAmount} NDT</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Общий объем стейкинга</span>
                        <span className="text-sm font-medium">{formatNumber(selectedPool.totalStaked)} NDT</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Участников</span>
                      <span className="text-sm font-medium">{selectedPool.participants}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Важная информация</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Средства заблокированы на весь срок</li>
                    <li>• Доход начисляется ежедневно</li>
                    <li>• Ранний вывод возможен с штрафом</li>
                    <li>• Налог на доход: 10%</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'my-stakes' && (
          <Card>
            <CardHeader>
              <CardTitle>Мои стейки</CardTitle>
              <CardDescription>
                Управляйте вашими активными стейками
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stakes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>У вас нет активных стейков</p>
                    <p className="text-sm">Начните стейкинг, чтобы зарабатывать пассивный доход</p>
                  </div>
                ) : (
                  stakes.map((stake) => (
                    <div key={stake.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{stake.poolName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(stake.startDate).toLocaleDateString()} - {new Date(stake.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={stake.status === 'active' ? 'default' : 'secondary'}>
                          {stake.status === 'active' ? 'Активен' : 'Завершен'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Сумма:</span>
                          <p className="font-medium">{formatNumber(stake.amount)} NDT</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">APY:</span>
                          <p className="font-medium">{stake.apy}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Заработано:</span>
                          <p className="font-medium text-green-600">{formatNumber(stake.earned)} NDT</p>
                        </div>
                        <div className="flex items-center justify-end">
                          {stake.status === 'active' && (
                            <Button
                              size="sm"
                              onClick={() => handleUnstake(stake.id)}
                              disabled={isUnstaking}
                            >
                              {isUnstaking ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Unlock className="h-4 w-4 mr-2" />
                                  Разблокировать
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'rewards' && (
          <Card>
            <CardHeader>
              <CardTitle>История наград</CardTitle>
              <CardDescription>
                Просмотр вашего заработка от стейкинга
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>История наград будет доступна здесь</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}