'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Music, Users, TrendingUp, Shield, Zap } from 'lucide-react';

export default function ATRStrategyPage() {
  const atrCountries = [
    { name: 'Китай', code: 'CN', market: 'C-pop', priority: 'high', population: '1.4B' },
    { name: 'Япония', code: 'JP', market: 'J-pop', priority: 'high', population: '125M' },
    { name: 'Южная Корея', code: 'KR', market: 'K-pop', priority: 'high', population: '52M' },
    { name: 'Индия', code: 'IN', market: 'Bollywood', priority: 'high', population: '1.4B' },
    { name: 'Индонезия', code: 'ID', market: 'Dangdut', priority: 'medium', population: '275M' },
    { name: 'Таиланд', code: 'TH', market: 'Luk Thung', priority: 'medium', population: '70M' },
    { name: 'Вьетнам', code: 'VN', market: 'V-pop', priority: 'medium', population: '98M' },
    { name: 'Филиппины', code: 'PH', market: 'OPM', priority: 'medium', population: '110M' },
    { name: 'Малайзия', code: 'MY', market: 'Malay Pop', priority: 'medium', population: '33M' },
    { name: 'Сингапур', code: 'SG', market: 'Multi-genre', priority: 'high', population: '6M' },
    { name: 'Австралия', code: 'AU', market: 'Aussie Rock', priority: 'medium', population: '26M' },
    { name: 'Новая Зеландия', code: 'NZ', market: 'Kiwi Music', priority: 'low', population: '5M' },
  ];

  const marketInsights = [
    {
      region: 'Восточная Азия',
      countries: ['Китай', 'Япония', 'Южная Корея'],
      marketSize: '$8.2B',
      growth: '+12%',
      keyFeatures: ['Высокая цифровизация', 'Мобильные платежи', 'K-pop экспансия'],
      opportunities: ['NFT интеграция', 'Виртуальные концерты', 'AI персонализация']
    },
    {
      region: 'Юго-Восточная Азия',
      countries: ['Индонезия', 'Таиланд', 'Вьетнам', 'Филиппины', 'Малайзия', 'Сингапур'],
      marketSize: '$2.1B',
      growth: '+18%',
      keyFeatures: ['Молодое население', 'Социальные сети', 'Локальный контент'],
      opportunities: ['Социальная коммерция', 'UGC платформы', 'Микро-платежи']
    },
    {
      region: 'Океания',
      countries: ['Австралия', 'Новая Зеландия'],
      marketSize: '$0.8B',
      growth: '+8%',
      keyFeatures: ['Высокие доходы', 'Западные предпочтения', 'Технологическая готовность'],
      opportunities: ['Премиум подписки', 'Высокое качество', 'Интеграция с западными платформами']
    }
  ];

  const localizationPlan = [
    {
      language: '中文 (Китайский)',
      coverage: '1.4B пользователей',
      priority: 'Критический',
      features: ['Упрощенный китайский', 'Традиционный китайский', 'Локальные платежи']
    },
    {
      language: '日本語 (Японский)',
      coverage: '125M пользователей',
      priority: 'Высокий',
      features: ['Кейтаи оптимизация', 'Аниме интеграция', 'QR платежи']
    },
    {
      language: '한국어 (Корейский)',
      coverage: '52M пользователей',
      priority: 'Высокий',
      features: ['K-pop интеграция', 'Идол система', 'Какао/Навер платежи']
    },
    {
      language: 'हिन्दी (Хинди)',
      coverage: '600M пользователей',
      priority: 'Высокий',
      features: ['Болливуд контент', 'UPI платежи', 'Региональные диалекты']
    },
    {
      language: 'Bahasa Indonesia',
      coverage: '275M пользователей',
      priority: 'Средний',
      features: ['Дангдут жанр', 'Го-джек платежи', 'Социальная интеграция']
    }
  ];

  const paymentMethods = [
    { name: 'WeChat Pay', region: 'Китай', coverage: '1.2B', integration: 'Критическая' },
    { name: 'Alipay', region: 'Китай', coverage: '1.3B', integration: 'Критическая' },
    { name: 'PayPay', region: 'Япония', coverage: '45M', integration: 'Высокая' },
    { name: 'KakaoPay', region: 'Южная Корея', coverage: '30M', integration: 'Высокая' },
    { name: 'UPI', region: 'Индия', coverage: '300M', integration: 'Высокая' },
    { name: 'GoPay', region: 'Индонезия', coverage: '25M', integration: 'Средняя' },
    { name: 'GrabPay', region: 'ЮВА', coverage: '50M', integration: 'Средняя' },
    { name: 'PayNow', region: 'Сингапур', coverage: '4M', integration: 'Высокая' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🌏 Стратегия NORMALDANCE для АТР
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Адаптация Web3 музыкальной платформы под 58 стран Азиатско-Тихоокеанского региона
          </p>
        </div>

        {/* Market Overview */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Обзор рынка АТР
            </CardTitle>
            <CardDescription className="text-blue-200">
              Общий размер музыкального рынка: $11.1B | Рост: +15% годовых
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {marketInsights.map((insight, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold text-lg mb-2">{insight.region}</h3>
                  <p className="text-blue-200 text-sm mb-2">
                    {insight.countries.join(', ')}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Размер рынка:</span>
                      <span className="text-green-400 font-semibold">{insight.marketSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Рост:</span>
                      <span className="text-green-400 font-semibold">{insight.growth}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-gray-300 text-sm mb-1">Ключевые особенности:</p>
                    <div className="flex flex-wrap gap-1">
                      {insight.keyFeatures.map((feature, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Countries Priority */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Globe className="h-6 w-6" />
              Приоритетные рынки
            </CardTitle>
            <CardDescription className="text-blue-200">
              Страны АТР с наибольшим потенциалом для NORMALDANCE
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {atrCountries.map((country, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">{country.name}</h3>
                    <Badge 
                      variant={country.priority === 'high' ? 'default' : 
                              country.priority === 'medium' ? 'secondary' : 'outline'}
                    >
                      {country.priority === 'high' ? 'Высокий' : 
                       country.priority === 'medium' ? 'Средний' : 'Низкий'}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-1">Население: {country.population}</p>
                  <p className="text-blue-200 text-sm">Музыкальный жанр: {country.market}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Localization Plan */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Users className="h-6 w-6" />
              План локализации
            </CardTitle>
            <CardDescription className="text-blue-200">
              Языковая поддержка и культурная адаптация
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {localizationPlan.map((lang, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg">{lang.language}</h3>
                    <Badge 
                      variant={lang.priority === 'Критический' ? 'destructive' : 
                              lang.priority === 'Высокий' ? 'default' : 'secondary'}
                    >
                      {lang.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">Покрытие: {lang.coverage}</p>
                  <div className="flex flex-wrap gap-2">
                    {lang.features.map((feature, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Integration */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Интеграция платежных систем
            </CardTitle>
            <CardDescription className="text-blue-200">
              Локальные платежные методы для максимального покрытия
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {paymentMethods.map((payment, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">{payment.name}</h3>
                    <Badge 
                      variant={payment.integration === 'Критическая' ? 'destructive' : 
                              payment.integration === 'Высокая' ? 'default' : 'secondary'}
                    >
                      {payment.integration}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm">Регион: {payment.region}</p>
                  <p className="text-blue-200 text-sm">Покрытие: {payment.coverage} пользователей</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Implementation Roadmap */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Дорожная карта внедрения
            </CardTitle>
            <CardDescription className="text-blue-200">
              Поэтапное внедрение в рынки АТР
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Фаза 1: Подготовка (Q1 2025)</h3>
                  <p className="text-gray-300">Исследование рынков, юридическое оформление, техническая подготовка</p>
                  <ul className="text-blue-200 text-sm mt-2 space-y-1">
                    <li>• Анализ регуляторных требований по странам</li>
                    <li>• Создание юридических структур</li>
                    <li>• Разработка MVP для ключевых рынков</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Фаза 2: Пилот (Q2 2025)</h3>
                  <p className="text-gray-300">Запуск в Сингапуре, Гонконге, Южной Корее</p>
                  <ul className="text-blue-200 text-sm mt-2 space-y-1">
                    <li>• Интеграция с локальными платежными системами</li>
                    <li>• Партнерство с местными лейблами</li>
                    <li>• Тестирование пользовательского опыта</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Фаза 3: Расширение (Q3-Q4 2025)</h3>
                  <p className="text-gray-300">Выход на крупные рынки: Китай, Япония, Индия</p>
                  <ul className="text-blue-200 text-sm mt-2 space-y-1">
                    <li>• Полная локализация интерфейса</li>
                    <li>• Интеграция с социальными платформами</li>
                    <li>• Запуск маркетинговых кампаний</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3">
            Начать реализацию стратегии АТР
          </Button>
        </div>
      </div>
    </div>
  );
}
