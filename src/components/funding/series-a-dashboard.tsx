'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress, Tabs, TabsContent, TabsList, TabsTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Building,
  User,
  Mail,
  ExternalLink,
  FileText,
  Presentation,
  Calculator,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Headphones,
  Music,
  Play,
  Pause,
  Heart,
  Share,
  Download as DownloadIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  Target as TargetIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  Activity as ActivityIcon,
  Clock as ClockIcon,
  DollarSign as DollarSignIcon,
  Percent,
  Award,
  Crown,
  Sparkles
} from '@/components/icons'
import { cn } from '@/lib/utils'
import { seriesAFunding, SeriesAFundingPlan, InvestorProfile, FinancialProjections } from '@/lib/series-a-funding'

interface SeriesADashboardProps {
  className?: string
}

export function SeriesADashboard({ className }: SeriesADashboardProps) {
  const [fundingPlan, setFundingPlan] = useState<SeriesAFundingPlan | null>(null)
  const [investors, setInvestors] = useState<InvestorProfile[]>([])
  const [financialProjections, setFinancialProjections] = useState<FinancialProjections[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'investors' | 'projections' | 'pitch' | 'metrics'>('overview')
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorProfile | null>(null)
  const [showInvestorDialog, setShowInvestorDialog] = useState(false)
  const [showPitchDialog, setShowPitchDialog] = useState(false)

  // Загрузка данных
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [plan, investorsData, projections] = await Promise.all([
        Promise.resolve(seriesAFunding.getFundingPlan()),
        Promise.resolve(seriesAFunding.getInvestors()),
        Promise.resolve(seriesAFunding.getFinancialProjections())
      ])
      
      setFundingPlan(plan)
      setInvestors(investorsData)
      setFinancialProjections(projections)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData()
  }, [loadData])

  // Обновление статуса инвестора
  const handleUpdateInvestorStatus = (investorName: string, status: InvestorProfile['status'], notes?: string) => {
    seriesAFunding.updateInvestorStatus(investorName, status, notes)
    loadData()
  }

  // Получение метрик инвесторов
  const getInvestorMetrics = () => {
    return seriesAFunding.getInvestorMetrics()
  }

  // Получение прогресса финансирования
  const getFundingProgress = () => {
    return seriesAFunding.getFundingProgress()
  }

  // Получение рекомендаций по инвесторам
  const getInvestorRecommendations = () => {
    return seriesAFunding.getInvestorRecommendations()
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

  // Получение цвета статуса
  const getStatusColor = (status: InvestorProfile['status']) => {
    switch (status) {
      case 'interested': return 'text-blue-500'
      case 'in_progress': return 'text-yellow-500'
      case 'passed': return 'text-red-500'
      case 'invested': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  // Получение иконки статуса
  const getStatusIcon = (status: InvestorProfile['status']) => {
    switch (status) {
      case 'interested': return <Eye className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'passed': return <XCircle className="h-4 w-4" />
      case 'invested': return <CheckCircle className="h-4 w-4" />
      default: return <Minus className="h-4 w-4" />
    }
  }

  // Получение цвета типа инвестора
  const getTypeColor = (type: InvestorProfile['type']) => {
    switch (type) {
      case 'VC': return 'bg-blue-100 text-blue-800'
      case 'Angel': return 'bg-green-100 text-green-800'
      case 'Corporate': return 'bg-purple-100 text-purple-800'
      case 'Family Office': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && !fundingPlan) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Загрузка данных финансирования...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Повторить
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const metrics = getInvestorMetrics()
  const progress = getFundingProgress()
  const recommendations = getInvestorRecommendations()

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Заголовок и статистика */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <CardTitle>Series A Финансирование</CardTitle>
              <Badge variant="secondary" className="ml-2">
                <Target className="h-3 w-3 mr-1" />
                $5M Target
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Обновить
              </Button>
              <Button size="sm" onClick={() => setShowPitchDialog(true)}>
                <Presentation className="h-4 w-4 mr-1" />
                Pitch Deck
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ${formatNumber(progress.targetAmount)}
              </div>
              <div className="text-sm text-muted-foreground">Целевая сумма</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                ${formatNumber(progress.raisedAmount)}
              </div>
              <div className="text-sm text-muted-foreground">Привлечено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {metrics.investors}
              </div>
              <div className="text-sm text-muted-foreground">Инвесторов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {progress.monthsRemaining}
              </div>
              <div className="text-sm text-muted-foreground">Месяцев осталось</div>
            </div>
          </div>
          
          {/* Прогресс бар */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Прогресс финансирования</span>
              <span className="text-sm text-muted-foreground">
                {formatPercentage(progress.progressPercentage)}
              </span>
            </div>
            <Progress value={progress.progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Основной контент */}
      <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="investors">Инвесторы</TabsTrigger>
          <TabsTrigger value="projections">Проекции</TabsTrigger>
          <TabsTrigger value="pitch">Pitch Deck</TabsTrigger>
          <TabsTrigger value="metrics">Метрики</TabsTrigger>
        </TabsList>

        {/* Обзор */}
        <TabsContent value="overview" className="space-y-4">
          {/* Использование средств */}
          {fundingPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Использование средств</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(fundingPlan.useOfFunds).map(([key, value]) => {
                    const percentage = (value / fundingPlan.targetAmount) * 100
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                    
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{label}</span>
                          <span className="text-sm text-muted-foreground">
                            ${formatNumber(value)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ключевые метрики */}
          {fundingPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Ключевые метрики</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Текущие MAU</span>
                      <span className="text-sm font-bold">
                        {formatNumber(fundingPlan.keyMetrics.currentMAU)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Целевые MAU</span>
                      <span className="text-sm font-bold">
                        {formatNumber(fundingPlan.keyMetrics.targetMAU)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Текущий доход</span>
                      <span className="text-sm font-bold">
                        ${formatNumber(fundingPlan.keyMetrics.currentRevenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Целевой доход</span>
                      <span className="text-sm font-bold">
                        ${formatNumber(fundingPlan.keyMetrics.targetRevenue)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Размер команды</span>
                      <span className="text-sm font-bold">
                        {fundingPlan.keyMetrics.currentTeamSize} → {fundingPlan.keyMetrics.targetTeamSize}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pre-money оценка</span>
                      <span className="text-sm font-bold">
                        ${formatNumber(fundingPlan.preMoneyValuation)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Post-money оценка</span>
                      <span className="text-sm font-bold">
                        ${formatNumber(fundingPlan.postMoneyValuation)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Доля инвесторов</span>
                      <span className="text-sm font-bold">
                        {fundingPlan.equityOffered}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Рекомендации по инвесторам */}
          <Card>
            <CardHeader>
              <CardTitle>Рекомендации по инвесторам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Топ VC выборы</h4>
                  <div className="space-y-2">
                    {recommendations.topVCPicks.map((investor) => (
                      <div key={investor.name} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span className="text-sm font-medium">{investor.name}</span>
                          <Badge variant="outline" className={getTypeColor(investor.type)}>
                            {investor.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${formatNumber(investor.checkSize.min)} - ${formatNumber(investor.checkSize.max)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Стратегические партнеры</h4>
                  <div className="space-y-2">
                    {recommendations.strategicPartners.map((investor) => (
                      <div key={investor.name} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span className="text-sm font-medium">{investor.name}</span>
                          <Badge variant="outline" className={getTypeColor(investor.type)}>
                            {investor.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {investor.focus.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Требует follow-up</h4>
                  <div className="space-y-2">
                    {recommendations.followUpNeeded.map((investor) => (
                      <div key={investor.name} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">{investor.name}</span>
                          <Badge variant="outline" className={getTypeColor(investor.type)}>
                            {investor.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {investor.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Инвесторы */}
        <TabsContent value="investors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Список инвесторов</CardTitle>
                <Button size="sm" onClick={() => setShowInvestorDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Размер чека</TableHead>
                    <TableHead>Фокус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investors.map((investor) => (
                    <TableRow key={investor.name}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span className="font-medium">{investor.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTypeColor(investor.type)}>
                          {investor.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(investor.status)}
                          <span className={cn('text-sm', getStatusColor(investor.status))}>
                            {investor.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          ${formatNumber(investor.checkSize.min)} - ${formatNumber(investor.checkSize.max)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {investor.focus.join(', ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Проекции */}
        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Финансовые проекции</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Год</TableHead>
                    <TableHead>Доход</TableHead>
                    <TableHead>Расходы</TableHead>
                    <TableHead>EBITDA</TableHead>
                    <TableHead>Пользователи</TableHead>
                    <TableHead>ARPU</TableHead>
                    <TableHead>LTV</TableHead>
                    <TableHead>CAC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialProjections.map((projection) => (
                    <TableRow key={projection.year}>
                      <TableCell className="font-medium">{projection.year}</TableCell>
                      <TableCell>${formatNumber(projection.revenue)}</TableCell>
                      <TableCell>${formatNumber(projection.expenses)}</TableCell>
                      <TableCell className={cn(
                        'font-medium',
                        projection.ebitda >= 0 ? 'text-green-500' : 'text-red-500'
                      )}>
                        ${formatNumber(projection.ebitda)}
                      </TableCell>
                      <TableCell>{formatNumber(projection.users)}</TableCell>
                      <TableCell>${projection.arpu}</TableCell>
                      <TableCell>${projection.ltv}</TableCell>
                      <TableCell>${projection.cac}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pitch Deck */}
        <TabsContent value="pitch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pitch Deck</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <Presentation className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Pitch Deck недоступен</p>
                <p className="text-sm">Доступен в полной версии</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Метрики */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Метрики инвесторов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Всего инвесторов</span>
                    <span className="text-2xl font-bold">{metrics.totalInvestors}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Заинтересованы</span>
                    <span className="text-2xl font-bold text-blue-500">{metrics.interested}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">В процессе</span>
                    <span className="text-2xl font-bold text-yellow-500">{metrics.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Отказались</span>
                    <span className="text-2xl font-bold text-red-500">{metrics.passed}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Инвестировали</span>
                    <span className="text-2xl font-bold text-green-500">{metrics.invested}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Общий размер чеков</span>
                    <span className="text-2xl font-bold">${formatNumber(metrics.totalCheckSize)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Средний размер чека</span>
                    <span className="text-2xl font-bold">${formatNumber(metrics.averageCheckSize)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог добавления инвестора */}
      <Dialog open={showInvestorDialog} onOpenChange={setShowInvestorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить инвестора</DialogTitle>
            <DialogDescription>
              Добавьте нового инвестора в список
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Название</label>
              <Input placeholder="Введите название инвестора" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Тип</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VC">VC</SelectItem>
                  <SelectItem value="Angel">Angel</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Family Office">Family Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Статус</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interested">Заинтересован</SelectItem>
                  <SelectItem value="in_progress">В процессе</SelectItem>
                  <SelectItem value="passed">Отказался</SelectItem>
                  <SelectItem value="invested">Инвестировал</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowInvestorDialog(false)}>
                Отмена
              </Button>
              <Button onClick={() => setShowInvestorDialog(false)}>
                Добавить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог Pitch Deck */}
      <Dialog open={showPitchDialog} onOpenChange={setShowPitchDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Pitch Deck</DialogTitle>
            <DialogDescription>
              Презентация для инвесторов
            </DialogDescription>
          </DialogHeader>
          <div className="text-center text-muted-foreground">
            <Presentation className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Pitch Deck недоступен</p>
            <p className="text-sm">Доступен в полной версии</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
