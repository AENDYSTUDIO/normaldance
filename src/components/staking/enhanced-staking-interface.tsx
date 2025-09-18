'use client'

import { useState, useCallback, memo, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Progress } from '@/components/ui'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Lock, Unlock, TrendingUp, Clock, Coins, Award, Calculator, Info } from '@/components/icons'
import { cn } from '@/lib/utils'

interface StakingPool {
  id: string
  name: string
  apy: number
  minStake: number
  lockPeriod: number // в днях
  totalStaked: number
  userStaked: number
  rewards: number
  isActive: boolean
}

interface EnhancedStakingInterfaceProps {
  className?: string
}

const mockPools: StakingPool[] = [
  {
    id: '1',
    name: 'Flexible Staking',
    apy: 8.5,
    minStake: 100,
    lockPeriod: 0,
    totalStaked: 1250000,
    userStaked: 5000,
    rewards: 125.5,
    isActive: true
  },
  {
    id: '2',
    name: '30-Day Lock',
    apy: 12.0,
    minStake: 500,
    lockPeriod: 30,
    totalStaked: 850000,
    userStaked: 2000,
    rewards: 65.2,
    isActive: true
  },
  {
    id: '3',
    name: '90-Day Lock',
    apy: 18.5,
    minStake: 1000,
    lockPeriod: 90,
    totalStaked: 650000,
    userStaked: 0,
    rewards: 0,
    isActive: true
  }
]

export const EnhancedStakingInterface = memo(function EnhancedStakingInterface({
  className
}: EnhancedStakingInterfaceProps) {
  const [pools, setPools] = useState<StakingPool[]>(mockPools)
  const [selectedPool, setSelectedPool] = useState<string>('')
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake' | 'rewards'>('stake')

  const totalUserStaked = useMemo(() => 
    pools.reduce((sum, pool) => sum + pool.userStaked, 0), [pools]
  )

  const totalUserRewards = useMemo(() => 
    pools.reduce((sum, pool) => sum + pool.rewards, 0), [pools]
  )

  const selectedPoolData = useMemo(() => 
    pools.find(pool => pool.id === selectedPool), [pools, selectedPool]
  )

  const calculateRewards = useCallback((amount: number, apy: number, days: number) => {
    return (amount * apy / 100 * days / 365)
  }, [])

  const handleStake = useCallback(async () => {
    if (!selectedPoolData || !stakeAmount) return
    
    setLoading(true)
    try {
      // Implement staking logic
      console.log('Staking:', stakeAmount, 'to pool:', selectedPool)
      
      // Update pool data
      setPools(prev => prev.map(pool => 
        pool.id === selectedPool 
          ? { ...pool, userStaked: pool.userStaked + parseFloat(stakeAmount) }
          : pool
      ))
      
      setStakeAmount('')
    } catch (error) {
      console.error('Staking error:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedPool, selectedPoolData, stakeAmount])

  const handleUnstake = useCallback(async () => {
    if (!selectedPoolData || !unstakeAmount) return
    
    setLoading(true)
    try {
      // Implement unstaking logic
      console.log('Unstaking:', unstakeAmount, 'from pool:', selectedPool)
      
      // Update pool data
      setPools(prev => prev.map(pool => 
        pool.id === selectedPool 
          ? { ...pool, userStaked: Math.max(0, pool.userStaked - parseFloat(unstakeAmount)) }
          : pool
      ))
      
      setUnstakeAmount('')
    } catch (error) {
      console.error('Unstaking error:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedPool, selectedPoolData, unstakeAmount])

  const handleClaimRewards = useCallback(async (poolId: string) => {
    setLoading(true)
    try {
      // Implement claim rewards logic
      console.log('Claiming rewards from pool:', poolId)
      
      // Update pool data
      setPools(prev => prev.map(pool => 
        pool.id === poolId 
          ? { ...pool, rewards: 0 }
          : pool
      ))
    } catch (error) {
      console.error('Claim rewards error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Стейкинг NDT</h1>
        <p className="text-muted-foreground">Зарабатывайте пассивный доход, стейкая ваши NDT токены</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Всего в стейкинге</p>
                <p className="text-xl font-bold">{formatNumber(totalUserStaked)} NDT</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Доступные награды</p>
                <p className="text-xl font-bold">{formatNumber(totalUserRewards)} NDT</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Средний APY</p>
                <p className="text-xl font-bold">
                  {formatNumber(pools.reduce((sum, pool) => sum + pool.apy, 0) / pools.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staking Pools */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Пулы стейкинга</h2>
          
          {pools.map(pool => (
            <Card 
              key={pool.id} 
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                selectedPool === pool.id && 'ring-2 ring-primary'
              )}
              onClick={() => setSelectedPool(pool.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{pool.name}</h3>
                    {pool.lockPeriod === 0 ? (
                      <Badge variant="secondary">
                        <Unlock className="h-3 w-3 mr-1" />
                        Гибкий
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Lock className="h-3 w-3 mr-1" />
                        {pool.lockPeriod} дней
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{pool.apy}% APY</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Мин. стейк</p>
                    <p className="font-medium">{formatNumber(pool.minStake)} NDT</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Всего заблокировано</p>
                    <p className="font-medium">{formatNumber(pool.totalStaked)} NDT</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ваш стейк</p>
                    <p className="font-medium">{formatNumber(pool.userStaked)} NDT</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Награды</p>
                    <p className="font-medium text-green-600">{formatNumber(pool.rewards)} NDT</p>
                  </div>
                </div>
                
                {pool.rewards > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <EnhancedButton
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClaimRewards(pool.id)
                      }}
                      loading={loading}
                      className="w-full"
                    >
                      Забрать награды
                    </EnhancedButton>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Staking Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Действия</h2>
          
          {selectedPoolData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedPoolData.name}
                  <Badge variant="outline">{selectedPoolData.apy}% APY</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tabs */}
                <div className="flex border-b">
                  {(['stake', 'unstake', 'rewards'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                        activeTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {tab === 'stake' && 'Стейк'}
                      {tab === 'unstake' && 'Анстейк'}
                      {tab === 'rewards' && 'Награды'}
                    </button>
                  ))}
                </div>

                {/* Stake Tab */}
                {activeTab === 'stake' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Сумма для стейкинга</label>
                      <Input
                        type="number"
                        placeholder={`Мин. ${selectedPoolData.minStake} NDT`}
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                      />
                    </div>
                    
                    {stakeAmount && parseFloat(stakeAmount) >= selectedPoolData.minStake && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calculator className="h-4 w-4" />
                          <span className="text-sm font-medium">Расчет доходности</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>Ежедневно: ~{formatNumber(calculateRewards(parseFloat(stakeAmount), selectedPoolData.apy, 1))} NDT</p>
                          <p>Ежемесячно: ~{formatNumber(calculateRewards(parseFloat(stakeAmount), selectedPoolData.apy, 30))} NDT</p>
                          <p>Ежегодно: ~{formatNumber(calculateRewards(parseFloat(stakeAmount), selectedPoolData.apy, 365))} NDT</p>
                        </div>
                      </div>
                    )}
                    
                    <EnhancedButton
                      onClick={handleStake}
                      loading={loading}
                      disabled={!stakeAmount || parseFloat(stakeAmount) < selectedPoolData.minStake}
                      className="w-full"
                    >
                      Застейкать {stakeAmount} NDT
                    </EnhancedButton>
                  </div>
                )}

                {/* Unstake Tab */}
                {activeTab === 'unstake' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Сумма для анстейкинга</label>
                      <Input
                        type="number"
                        placeholder={`Макс. ${selectedPoolData.userStaked} NDT`}
                        value={unstakeAmount}
                        onChange={(e) => setUnstakeAmount(e.target.value)}
                      />
                    </div>
                    
                    {selectedPoolData.lockPeriod > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            Период блокировки: {selectedPoolData.lockPeriod} дней
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <EnhancedButton
                      onClick={handleUnstake}
                      loading={loading}
                      disabled={!unstakeAmount || parseFloat(unstakeAmount) > selectedPoolData.userStaked}
                      variant="outline"
                      className="w-full"
                    >
                      Анстейкать {unstakeAmount} NDT
                    </EnhancedButton>
                  </div>
                )}

                {/* Rewards Tab */}
                {activeTab === 'rewards' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {formatNumber(selectedPoolData.rewards)} NDT
                      </p>
                      <p className="text-sm text-muted-foreground">Доступные награды</p>
                    </div>
                    
                    <EnhancedButton
                      onClick={() => handleClaimRewards(selectedPoolData.id)}
                      loading={loading}
                      disabled={selectedPoolData.rewards === 0}
                      className="w-full"
                    >
                      Забрать награды
                    </EnhancedButton>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Выберите пул для стейкинга</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
})