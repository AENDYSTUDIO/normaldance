'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Music, 
  CreditCard, 
  Users, 
  TrendingUp, 
  Shield,
  Zap,
  Star,
  Target
} from 'lucide-react';
import LanguageSelector from '@/components/atr/LanguageSelector';
import ATRPaymentMethods from '@/components/atr/ATRPaymentMethods';
import ATRContentStrategy from '@/components/atr/ATRContentStrategy';
import { ATRLanguageCode } from '@/lib/i18n/atr-languages';
import { ATRPaymentMethod } from '@/lib/i18n/atr-payment-integration';

export default function ATRDemoPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<ATRLanguageCode | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<ATRLanguageCode | null>(null);

  const handleLanguageSelect = (language: ATRLanguageCode) => {
    setSelectedLanguage(language);
  };

  const handlePaymentSelect = (method: ATRPaymentMethod) => {
    console.log('Selected payment method:', method);
  };

  const marketStats = [
    { label: 'Общий размер рынка', value: '$11.1B', icon: TrendingUp },
    { label: 'Рост в год', value: '+15%', icon: Target },
    { label: 'Страны АТР', value: '58', icon: Globe },
    { label: 'Поддерживаемые языки', value: '12', icon: Users },
    { label: 'Платежные системы', value: '15+', icon: CreditCard },
    { label: 'Приоритетные рынки', value: '5', icon: Star }
  ];

  const implementationPhases = [
    {
      phase: 'Фаза 1: Подготовка',
      period: 'Q1 2025',
      status: 'В процессе',
      description: 'Исследование рынков, юридическое оформление, техническая подготовка',
      tasks: [
        'Анализ регуляторных требований',
        'Создание юридических структур',
        'Разработка MVP для ключевых рынков',
        'Настройка инфраструктуры'
      ]
    },
    {
      phase: 'Фаза 2: Пилот',
      period: 'Q2 2025',
      status: 'Запланировано',
      description: 'Запуск в Сингапуре, Гонконге, Южной Корее',
      tasks: [
        'Интеграция с локальными платежными системами',
        'Партнерство с местными лейблами',
        'Тестирование пользовательского опыта',
        'Сбор обратной связи'
      ]
    },
    {
      phase: 'Фаза 3: Расширение',
      period: 'Q3-Q4 2025',
      status: 'Запланировано',
      description: 'Выход на крупные рынки: Китай, Япония, Индия',
      tasks: [
        'Полная локализация интерфейса',
        'Интеграция с социальными платформами',
        'Запуск маркетинговых кампаний',
        'Масштабирование инфраструктуры'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🌏 NORMALDANCE АТР Демо
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Демонстрация адаптации Web3 музыкальной платформы под рынки Азиатско-Тихоокеанского региона
          </p>
        </div>

        {/* Market Stats */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">
              Статистика рынка АТР
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {marketStats.map((stat, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <stat.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Demo Tabs */}
        <Tabs defaultValue="language" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="language" className="data-[state=active]:bg-blue-600">
              <Globe className="h-4 w-4 mr-2" />
              Языки
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-blue-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Платежи
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-blue-600">
              <Music className="h-4 w-4 mr-2" />
              Контент
            </TabsTrigger>
            <TabsTrigger value="strategy" className="data-[state=active]:bg-blue-600">
              <Target className="h-4 w-4 mr-2" />
              Стратегия
            </TabsTrigger>
            <TabsTrigger value="implementation" className="data-[state=active]:bg-blue-600">
              <Shield className="h-4 w-4 mr-2" />
              Внедрение
            </TabsTrigger>
          </TabsList>

          {/* Language Selection Tab */}
          <TabsContent value="language">
            <LanguageSelector 
              onLanguageSelect={handleLanguageSelect}
              currentLanguage={selectedLanguage || undefined}
            />
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payments">
            {selectedLanguage ? (
              <ATRPaymentMethods 
                language={selectedLanguage}
                onPaymentSelect={handlePaymentSelect}
              />
            ) : (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8 text-center">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">
                    Выберите язык для просмотра платежных методов
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Перейдите на вкладку "Языки" и выберите язык для просмотра доступных платежных систем
                  </p>
                  <Button 
                    onClick={() => document.querySelector('[value="language"]')?.click()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Выбрать язык
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Content Strategy Tab */}
          <TabsContent value="content">
            {selectedLanguage ? (
              <ATRContentStrategy 
                language={selectedLanguage}
              />
            ) : (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8 text-center">
                  <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">
                    Выберите язык для просмотра контентной стратегии
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Перейдите на вкладку "Языки" и выберите язык для просмотра контентных рекомендаций
                  </p>
                  <Button 
                    onClick={() => document.querySelector('[value="language"]')?.click()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Выбрать язык
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy">
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-2xl flex items-center gap-2">
                    <Target className="h-6 w-6" />
                    Стратегические приоритеты
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Ключевые направления для успешного выхода на рынки АТР
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold text-lg">🎯 Приоритетные рынки</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
                          <span className="text-white">Китай</span>
                          <Badge variant="destructive">Критический</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-500/20 rounded-lg">
                          <span className="text-white">Япония</span>
                          <Badge variant="default">Высокий</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-500/20 rounded-lg">
                          <span className="text-white">Южная Корея</span>
                          <Badge variant="default">Высокий</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-500/20 rounded-lg">
                          <span className="text-white">Индия</span>
                          <Badge variant="default">Высокий</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg">
                          <span className="text-white">Сингапур</span>
                          <Badge variant="secondary">Средний</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-white font-semibold text-lg">🚀 Ключевые возможности</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 rounded-lg">
                          <Zap className="h-4 w-4 text-green-400" />
                          <span className="text-white">Web3 интеграция</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 rounded-lg">
                          <Music className="h-4 w-4 text-green-400" />
                          <span className="text-white">Локальный контент</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 rounded-lg">
                          <CreditCard className="h-4 w-4 text-green-400" />
                          <span className="text-white">Локальные платежи</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 rounded-lg">
                          <Users className="h-4 w-4 text-green-400" />
                          <span className="text-white">Социальные функции</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Конкурентные преимущества</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center space-y-3">
                      <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                        <Shield className="h-8 w-8 text-blue-400" />
                      </div>
                      <h3 className="text-white font-semibold">Безопасность</h3>
                      <p className="text-gray-300 text-sm">
                        Web3 технологии обеспечивают максимальную безопасность транзакций
                      </p>
                    </div>
                    <div className="text-center space-y-3">
                      <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                        <TrendingUp className="h-8 w-8 text-green-400" />
                      </div>
                      <h3 className="text-white font-semibold">Доходность</h3>
                      <p className="text-gray-300 text-sm">
                        Прямые выплаты артистам без посредников
                      </p>
                    </div>
                    <div className="text-center space-y-3">
                      <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                        <Globe className="h-8 w-8 text-purple-400" />
                      </div>
                      <h3 className="text-white font-semibold">Глобальность</h3>
                      <p className="text-gray-300 text-sm">
                        Единая платформа для всех рынков АТР
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Implementation Tab */}
          <TabsContent value="implementation">
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Дорожная карта внедрения</CardTitle>
                  <CardDescription className="text-blue-200">
                    Поэтапное внедрение в рынки АТР
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {implementationPhases.map((phase, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold ${
                          phase.status === 'В процессе' ? 'bg-green-500' :
                          phase.status === 'Запланировано' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-semibold text-lg">{phase.phase}</h3>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={phase.status === 'В процессе' ? 'default' : 'secondary'}
                              >
                                {phase.status}
                              </Badge>
                              <span className="text-blue-200 text-sm">{phase.period}</span>
                            </div>
                          </div>
                          <p className="text-gray-300">{phase.description}</p>
                          <div className="space-y-1">
                            {phase.tasks.map((task, taskIndex) => (
                              <div key={taskIndex} className="flex items-center gap-2 text-sm text-gray-300">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                {task}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Технические требования</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Инфраструктура</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          CDN в каждом регионе АТР
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          Локальные серверы для низкой задержки
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          Резервирование данных
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          Мониторинг производительности
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Соответствие требованиям</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          GDPR (Европа) + локальные законы
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          Финансовые лицензии по странам
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          Локальные партнерства
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          Контентные лицензии
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-blue-500/30 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Готовы начать экспансию в АТР?
              </h2>
              <p className="text-blue-200 mb-6">
                Присоединяйтесь к революции в музыкальной индустрии с NORMALDANCE
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Начать интеграцию
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Связаться с командой
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
