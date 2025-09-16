/**
 * 🛡️ Volatility Protection System 2025
 * 
 * Система защиты от волатильности с динамическими резервами
 * и автоматическими механизмами стабилизации
 */

export interface VolatilityMetrics {
  currentVolatility: number
  volatility24h: number
  volatility7d: number
  priceDeviation: number
  volumeSpike: boolean
  marketStress: 'low' | 'medium' | 'high' | 'extreme'
}

export interface StabilityReserve {
  id: string
  tonBalance: number
  ndtBalance: number
  totalValue: number
  utilizationRate: number
  lastRebalance: number
  autoRebalance: boolean
}

export interface ProtectionMechanism {
  id: string
  type: 'auto_buyback' | 'liquidity_injection' | 'rate_stabilization' | 'circuit_breaker'
  threshold: number
  isActive: boolean
  lastTriggered: number
  triggerCount: number
  effectiveness: number
}

export interface MarketIntervention {
  id: string
  type: 'buyback' | 'sell_off' | 'liquidity_add' | 'rate_fix'
  amount: number
  targetRate?: number
  timestamp: number
  success: boolean
  impact: number
}

export class VolatilityProtectionSystem {
  private stabilityReserve: StabilityReserve
  private protectionMechanisms: Map<string, ProtectionMechanism> = new Map()
  private marketInterventions: MarketIntervention[] = []
  private volatilityHistory: VolatilityMetrics[] = []
  private isMonitoring = false
  private monitoringInterval?: NodeJS.Timeout

  constructor() {
    this.initializeStabilityReserve()
    this.setupProtectionMechanisms()
    this.startMonitoring()
  }

  /**
   * 🏦 Инициализация резерва стабильности
   */
  private initializeStabilityReserve(): void {
    this.stabilityReserve = {
      id: 'main',
      tonBalance: 10000, // 10,000 TON начальный резерв
      ndtBalance: 427000, // Соответствующее количество NDT
      totalValue: 20000, // Общая стоимость в TON
      utilizationRate: 0,
      lastRebalance: Date.now(),
      autoRebalance: true
    }
  }

  /**
   * 🛡️ Настройка механизмов защиты
   */
  private setupProtectionMechanisms(): void {
    // Автоматический выкуп NDT при просадке
    this.protectionMechanisms.set('auto_buyback', {
      id: 'auto_buyback',
      type: 'auto_buyback',
      threshold: 12, // 12% просадка за 24 часа
      isActive: true,
      lastTriggered: 0,
      triggerCount: 0,
      effectiveness: 0.85
    })

    // Инъекция ликвидности при высокой волатильности
    this.protectionMechanisms.set('liquidity_injection', {
      id: 'liquidity_injection',
      type: 'liquidity_injection',
      threshold: 15, // 15% волатильность
      isActive: true,
      lastTriggered: 0,
      triggerCount: 0,
      effectiveness: 0.75
    })

    // Стабилизация курса при экстремальных условиях
    this.protectionMechanisms.set('rate_stabilization', {
      id: 'rate_stabilization',
      type: 'rate_stabilization',
      threshold: 20, // 20% отклонение от среднего
      isActive: true,
      lastTriggered: 0,
      triggerCount: 0,
      effectiveness: 0.90
    })

    // Аварийная остановка торгов
    this.protectionMechanisms.set('circuit_breaker', {
      id: 'circuit_breaker',
      type: 'circuit_breaker',
      threshold: 30, // 30% экстремальная волатильность
      isActive: true,
      lastTriggered: 0,
      triggerCount: 0,
      effectiveness: 1.0
    })
  }

  /**
   * 📊 Запуск мониторинга волатильности
   */
  private startMonitoring(): void {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.monitoringInterval = setInterval(async () => {
      await this.monitorVolatility()
    }, 5000) // Проверяем каждые 5 секунд
  }

  /**
   * 📈 Мониторинг волатильности
   */
  private async monitorVolatility(): Promise<void> {
    try {
      const metrics = await this.calculateVolatilityMetrics()
      this.volatilityHistory.push(metrics)
      
      // Ограничиваем историю последними 1000 записями
      if (this.volatilityHistory.length > 1000) {
        this.volatilityHistory = this.volatilityHistory.slice(-1000)
      }
      
      // Проверяем необходимость вмешательства
      await this.checkProtectionTriggers(metrics)
      
    } catch (error) {
      console.error('Error monitoring volatility:', error)
    }
  }

  /**
   * 📊 Расчет метрик волатильности
   */
  private async calculateVolatilityMetrics(): Promise<VolatilityMetrics> {
    // Здесь должна быть интеграция с реальными данными рынка
    // Пока используем симуляцию
    
    const currentPrice = 42.7 + (Math.random() - 0.5) * 5 // ±2.5 TON волатильность
    const averagePrice = 42.7
    const priceDeviation = Math.abs((currentPrice - averagePrice) / averagePrice) * 100
    
    // Расчет волатильности на основе истории цен
    const volatility24h = this.calculateHistoricalVolatility(24)
    const volatility7d = this.calculateHistoricalVolatility(168) // 7 дней в часах
    
    // Определение уровня стресса рынка
    const marketStress = this.determineMarketStress(volatility24h, priceDeviation)
    
    // Проверка всплеска объема
    const volumeSpike = this.detectVolumeSpike()
    
    return {
      currentVolatility: volatility24h,
      volatility24h,
      volatility7d,
      priceDeviation,
      volumeSpike,
      marketStress
    }
  }

  /**
   * 📈 Расчет исторической волатильности
   */
  private calculateHistoricalVolatility(hours: number): number {
    // Симуляция расчета волатильности
    const baseVolatility = 5 + Math.random() * 15 // 5-20%
    const timeDecay = Math.max(0, 1 - (hours / 168)) // Затухание за неделю
    return baseVolatility * (1 + timeDecay)
  }

  /**
   * 🎯 Определение уровня стресса рынка
   */
  private determineMarketStress(volatility: number, priceDeviation: number): 'low' | 'medium' | 'high' | 'extreme' {
    const stressScore = volatility * 0.6 + priceDeviation * 0.4
    
    if (stressScore < 5) return 'low'
    if (stressScore < 10) return 'medium'
    if (stressScore < 20) return 'high'
    return 'extreme'
  }

  /**
   * 📊 Обнаружение всплеска объема
   */
  private detectVolumeSpike(): boolean {
    // Симуляция обнаружения всплеска объема
    return Math.random() < 0.1 // 10% вероятность всплеска
  }

  /**
   * 🚨 Проверка триггеров защиты
   */
  private async checkProtectionTriggers(metrics: VolatilityMetrics): Promise<void> {
    for (const [mechanismId, mechanism] of this.protectionMechanisms) {
      if (!mechanism.isActive) continue
      
      let shouldTrigger = false
      
      switch (mechanism.type) {
        case 'auto_buyback':
          shouldTrigger = metrics.priceDeviation >= mechanism.threshold && 
                         metrics.currentVolatility > 10
          break
          
        case 'liquidity_injection':
          shouldTrigger = metrics.currentVolatility >= mechanism.threshold
          break
          
        case 'rate_stabilization':
          shouldTrigger = metrics.priceDeviation >= mechanism.threshold
          break
          
        case 'circuit_breaker':
          shouldTrigger = metrics.marketStress === 'extreme' || 
                         metrics.currentVolatility >= mechanism.threshold
          break
      }
      
      if (shouldTrigger) {
        await this.triggerProtectionMechanism(mechanism, metrics)
      }
    }
  }

  /**
   * ⚡ Активация механизма защиты
   */
  private async triggerProtectionMechanism(mechanism: ProtectionMechanism, metrics: VolatilityMetrics): Promise<void> {
    // Проверяем кулдаун (не чаще раза в час)
    const cooldownPeriod = 60 * 60 * 1000 // 1 час
    if (Date.now() - mechanism.lastTriggered < cooldownPeriod) {
      return
    }
    
    console.log(`🛡️ Triggering protection mechanism: ${mechanism.type}`)
    
    let intervention: MarketIntervention | null = null
    
    switch (mechanism.type) {
      case 'auto_buyback':
        intervention = await this.executeAutoBuyback(metrics)
        break
        
      case 'liquidity_injection':
        intervention = await this.executeLiquidityInjection(metrics)
        break
        
      case 'rate_stabilization':
        intervention = await this.executeRateStabilization(metrics)
        break
        
      case 'circuit_breaker':
        intervention = await this.executeCircuitBreaker(metrics)
        break
    }
    
    if (intervention) {
      this.marketInterventions.push(intervention)
      mechanism.lastTriggered = Date.now()
      mechanism.triggerCount++
      
      // Обновляем эффективность механизма
      this.updateMechanismEffectiveness(mechanism, intervention)
    }
  }

  /**
   * 💰 Автоматический выкуп NDT
   */
  private async executeAutoBuyback(metrics: VolatilityMetrics): Promise<MarketIntervention> {
    const buybackAmount = Math.min(
      this.stabilityReserve.tonBalance * 0.1, // Максимум 10% резерва
      metrics.priceDeviation * 1000 // Пропорционально отклонению
    )
    
    const targetRate = 42.7 * 0.95 // Целевой курс на 5% ниже среднего
    
    console.log(`💰 Executing auto buyback: ${buybackAmount} TON at rate ${targetRate}`)
    
    // Симуляция выкупа
    const success = Math.random() > 0.1 // 90% успешность
    const impact = success ? -metrics.priceDeviation * 0.3 : 0 // Снижение отклонения на 30%
    
    return {
      id: this.generateInterventionId(),
      type: 'buyback',
      amount: buybackAmount,
      targetRate,
      timestamp: Date.now(),
      success,
      impact
    }
  }

  /**
   * 💧 Инъекция ликвидности
   */
  private async executeLiquidityInjection(metrics: VolatilityMetrics): Promise<MarketIntervention> {
    const injectionAmount = Math.min(
      this.stabilityReserve.tonBalance * 0.05, // Максимум 5% резерва
      metrics.currentVolatility * 100 // Пропорционально волатильности
    )
    
    console.log(`💧 Executing liquidity injection: ${injectionAmount} TON`)
    
    // Симуляция инъекции
    const success = Math.random() > 0.05 // 95% успешность
    const impact = success ? -metrics.currentVolatility * 0.2 : 0 // Снижение волатильности на 20%
    
    return {
      id: this.generateInterventionId(),
      type: 'liquidity_add',
      amount: injectionAmount,
      timestamp: Date.now(),
      success,
      impact
    }
  }

  /**
   * ⚖️ Стабилизация курса
   */
  private async executeRateStabilization(metrics: VolatilityMetrics): Promise<MarketIntervention> {
    const stabilizationAmount = Math.min(
      this.stabilityReserve.tonBalance * 0.15, // Максимум 15% резерва
      metrics.priceDeviation * 2000 // Пропорционально отклонению
    )
    
    const targetRate = 42.7 // Возврат к среднему курсу
    
    console.log(`⚖️ Executing rate stabilization: ${stabilizationAmount} TON at rate ${targetRate}`)
    
    // Симуляция стабилизации
    const success = Math.random() > 0.02 // 98% успешность
    const impact = success ? -metrics.priceDeviation * 0.5 : 0 // Снижение отклонения на 50%
    
    return {
      id: this.generateInterventionId(),
      type: 'rate_fix',
      amount: stabilizationAmount,
      targetRate,
      timestamp: Date.now(),
      success,
      impact
    }
  }

  /**
   * 🚨 Аварийная остановка
   */
  private async executeCircuitBreaker(metrics: VolatilityMetrics): Promise<MarketIntervention> {
    console.log(`🚨 Executing circuit breaker - Market stress: ${metrics.marketStress}`)
    
    // Временно приостанавливаем торговлю
    // В реальной системе здесь должна быть интеграция с DEX
    
    return {
      id: this.generateInterventionId(),
      type: 'sell_off',
      amount: 0, // Нет торговли
      timestamp: Date.now(),
      success: true,
      impact: -metrics.currentVolatility * 0.8 // Резкое снижение волатильности
    }
  }

  /**
   * 📊 Обновление эффективности механизма
   */
  private updateMechanismEffectiveness(mechanism: ProtectionMechanism, intervention: MarketIntervention): void {
    if (intervention.success) {
      // Увеличиваем эффективность при успешном вмешательстве
      mechanism.effectiveness = Math.min(1.0, mechanism.effectiveness + 0.01)
    } else {
      // Уменьшаем при неудаче
      mechanism.effectiveness = Math.max(0.1, mechanism.effectiveness - 0.02)
    }
  }

  /**
   * 🔄 Автоматическое пополнение резерва
   */
  async replenishReserve(amount: number, currency: 'TON' | 'NDT'): Promise<void> {
    if (currency === 'TON') {
      this.stabilityReserve.tonBalance += amount
    } else {
      this.stabilityReserve.ndtBalance += amount
    }
    
    this.stabilityReserve.totalValue = this.calculateReserveValue()
    this.stabilityReserve.lastRebalance = Date.now()
    
    console.log(`🔄 Reserve replenished: +${amount} ${currency}`)
  }

  /**
   * 💰 Расчет стоимости резерва
   */
  private calculateReserveValue(): number {
    const currentRate = 42.7 // Текущий курс NDT/TON
    return this.stabilityReserve.tonBalance + (this.stabilityReserve.ndtBalance / currentRate)
  }

  /**
   * 📊 Получение статистики защиты
   */
  getProtectionStats() {
    const totalInterventions = this.marketInterventions.length
    const successfulInterventions = this.marketInterventions.filter(i => i.success).length
    const successRate = totalInterventions > 0 ? successfulInterventions / totalInterventions : 0
    
    const totalImpact = this.marketInterventions.reduce((sum, i) => sum + i.impact, 0)
    const averageImpact = totalInterventions > 0 ? totalImpact / totalInterventions : 0
    
    return {
      stabilityReserve: {
        tonBalance: this.stabilityReserve.tonBalance,
        ndtBalance: this.stabilityReserve.ndtBalance,
        totalValue: this.stabilityReserve.totalValue,
        utilizationRate: this.stabilityReserve.utilizationRate
      },
      mechanisms: Array.from(this.protectionMechanisms.values()).map(m => ({
        type: m.type,
        isActive: m.isActive,
        triggerCount: m.triggerCount,
        effectiveness: m.effectiveness,
        lastTriggered: m.lastTriggered
      })),
      interventions: {
        total: totalInterventions,
        successful: successfulInterventions,
        successRate: successRate * 100,
        averageImpact: averageImpact
      },
      currentMetrics: this.volatilityHistory[this.volatilityHistory.length - 1] || null
    }
  }

  /**
   * 🎯 Настройка механизма защиты
   */
  configureMechanism(mechanismId: string, config: Partial<ProtectionMechanism>): boolean {
    const mechanism = this.protectionMechanisms.get(mechanismId)
    if (!mechanism) return false
    
    Object.assign(mechanism, config)
    this.protectionMechanisms.set(mechanismId, mechanism)
    
    return true
  }

  /**
   * 🆔 Генерация ID вмешательства
   */
  private generateInterventionId(): string {
    return `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 🛑 Остановка мониторинга
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
    this.isMonitoring = false
  }

  /**
   * 🔄 Перезапуск мониторинга
   */
  restartMonitoring(): void {
    this.stopMonitoring()
    this.startMonitoring()
  }
}

// Экспорт синглтона
export const volatilityProtectionSystem = new VolatilityProtectionSystem()
