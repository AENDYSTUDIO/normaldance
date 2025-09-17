'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { 
  Music, 
  TrendingUp, 
  Users, 
  Target,
  Star,
  Globe,
  BarChart3,
  Play
} from '@/components/icons';
import { 
  ATR_CONTENT_STRATEGIES, 
  ATR_GENRES, 
  getContentStrategyByRegion,
  getGenresByRegion,
  getGenreDisplayName 
} from '@/lib/atr-content-strategy';
import { ATRLanguageCode } from '@/lib/i18n/atr-languages';

interface ATRContentStrategyProps {
  language: ATRLanguageCode;
  selectedRegion?: string;
}

export default function ATRContentStrategy({ language, selectedRegion }: ATRContentStrategyProps) {
  const [activeRegion, setActiveRegion] = useState(selectedRegion || 'East Asia');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const regions = [
    { id: 'East Asia', name: 'Восточная Азия', icon: '🌏' },
    { id: 'Southeast Asia', name: 'Юго-Восточная Азия', icon: '🌴' },
    { id: 'Oceania', name: 'Океания', icon: '🦘' }
  ];

  const currentStrategy = getContentStrategyByRegion(activeRegion);
  const regionGenres = getGenresByRegion(activeRegion);

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 90) return 'bg-green-500';
    if (popularity >= 70) return 'bg-yellow-500';
    if (popularity >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMonetizationColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'low': return 'bg-red-500/20 border-red-500 text-red-400';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Region Selection */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Выберите регион для контентной стратегии
          </CardTitle>
          <CardDescription className="text-blue-200">
            Каждый регион имеет уникальные музыкальные предпочтения и стратегии
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {regions.map((region) => (
              <Button
                key={region.id}
                variant={activeRegion === region.id ? 'default' : 'outline'}
                className={`h-auto p-4 text-left ${
                  activeRegion === region.id 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-white/5 hover:bg-white/10 border-white/20'
                }`}
                onClick={() => setActiveRegion(region.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{region.icon}</span>
                    <span className="font-semibold">{region.name}</span>
                  </div>
                  <p className="text-sm opacity-80">
                    {regionGenres.length} жанров доступно
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {currentStrategy && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="genres" className="data-[state=active]:bg-blue-600">
              <Music className="h-4 w-4 mr-2" />
              Жанры
            </TabsTrigger>
            <TabsTrigger value="strategy" className="data-[state=active]:bg-blue-600">
              <Target className="h-4 w-4 mr-2" />
              Стратегия
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-blue-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Контентная стратегия для {currentStrategy.region}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Распределение контента</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Локальный контент</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${currentStrategy.contentMix.local}%` }}
                              ></div>
                            </div>
                            <span className="text-white font-semibold">{currentStrategy.contentMix.local}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Международный</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${currentStrategy.contentMix.international}%` }}
                              ></div>
                            </div>
                            <span className="text-white font-semibold">{currentStrategy.contentMix.international}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Региональный</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${currentStrategy.contentMix.regional}%` }}
                              ></div>
                            </div>
                            <span className="text-white font-semibold">{currentStrategy.contentMix.regional}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Языковое распределение</h3>
                      <div className="space-y-2">
                        {Object.entries(currentStrategy.languageDistribution).map(([lang, percentage]) => (
                          <div key={lang} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">{lang}</span>
                            <span className="text-white">{percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Предпочтения платформ</h3>
                      <div className="space-y-2">
                        {currentStrategy.platformPreferences.map((platform, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Паттерны потребления</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Пиковые часы</h4>
                      <div className="space-y-1">
                        {currentStrategy.consumptionPatterns.peakHours.map((hour, index) => (
                          <div key={index} className="text-sm text-gray-300">{hour}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Предпочитаемые устройства</h4>
                      <div className="space-y-1">
                        {currentStrategy.consumptionPatterns.preferredDevices.map((device, index) => (
                          <div key={index} className="text-sm text-gray-300">{device}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Социальные функции</h4>
                      <div className="space-y-1">
                        {currentStrategy.consumptionPatterns.socialFeatures.map((feature, index) => (
                          <div key={index} className="text-sm text-gray-300">{feature}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Genres Tab */}
          <TabsContent value="genres">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionGenres.map((genre) => (
                  <Card
                    key={genre.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      selectedGenre === genre.id 
                        ? 'ring-2 ring-blue-500 bg-blue-500/20' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedGenre(selectedGenre === genre.id ? null : genre.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-semibold text-lg">
                            {getGenreDisplayName(genre.id, language)}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getPopularityColor(genre.popularity)}`}></div>
                            <span className="text-xs text-gray-300">{genre.popularity}%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-gray-300 text-sm">{genre.name}</p>
                          <p className="text-blue-200 text-sm">Размер рынка: {genre.marketSize}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-gray-300">Ключевые артисты:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {genre.keyArtists.slice(0, 2).map((artist) => (
                              <Badge key={artist} variant="outline" className="text-xs">
                                {artist}
                              </Badge>
                            ))}
                            {genre.keyArtists.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{genre.keyArtists.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-gray-300">Монетизация:</span>
                          </div>
                          <Badge 
                            className={`text-xs ${getMonetizationColor(genre.monetizationPotential)}`}
                          >
                            {genre.monetizationPotential === 'high' ? 'Высокая' :
                             genre.monetizationPotential === 'medium' ? 'Средняя' : 'Низкая'}
                          </Badge>
                        </div>

                        {selectedGenre === genre.id && (
                          <div className="space-y-3 pt-3 border-t border-white/20">
                            <div>
                              <h4 className="text-white font-semibold text-sm mb-2">Характеристики:</h4>
                              <div className="flex flex-wrap gap-1">
                                {genre.characteristics.map((char) => (
                                  <Badge key={char} variant="secondary" className="text-xs">
                                    {char}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-white font-semibold text-sm mb-2">Целевая аудитория:</h4>
                              <div className="flex flex-wrap gap-1">
                                {genre.targetAudience.map((audience) => (
                                  <Badge key={audience} variant="outline" className="text-xs">
                                    {audience}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy">
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Рекомендации по контенту</CardTitle>
                  <CardDescription className="text-blue-200">
                    Стратегические рекомендации для успешного продвижения в регионе
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-4">Приоритетные жанры</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {currentStrategy.primaryGenres.map((genre) => (
                          <div key={genre.id} className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-semibold">{getGenreDisplayName(genre.id, language)}</h4>
                              <Badge variant="default">Приоритетный</Badge>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{genre.name}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">Популярность: {genre.popularity}%</span>
                              <span className="text-blue-200">Рынок: {genre.marketSize}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold text-lg mb-4">Дополнительные жанры</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {currentStrategy.secondaryGenres.map((genre) => (
                          <div key={genre.id} className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-semibold">{getGenreDisplayName(genre.id, language)}</h4>
                              <Badge variant="secondary">Дополнительный</Badge>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{genre.name}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">Популярность: {genre.popularity}%</span>
                              <span className="text-green-200">Рынок: {genre.marketSize}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Тактические рекомендации</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-white font-semibold">Контентная стратегия</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>• Фокус на локальном контенте ({currentStrategy.contentMix.local}%)</li>
                        <li>• Интеграция с местными артистами</li>
                        <li>• Адаптация под культурные особенности</li>
                        <li>• Поддержка множественных языков</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-white font-semibold">Платформенная стратегия</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>• Мобильная оптимизация (приоритет)</li>
                        <li>• Социальные функции</li>
                        <li>• Интеграция с локальными платформами</li>
                        <li>• Поддержка пиковых часов потребления</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Аналитика рынка</CardTitle>
                  <CardDescription className="text-blue-200">
                    Ключевые метрики и тренды для региона
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center space-y-2">
                      <div className="bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                        <Music className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{regionGenres.length}</div>
                      <div className="text-sm text-gray-300">Активных жанров</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="bg-green-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                        <TrendingUp className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {Math.round(regionGenres.reduce((acc, g) => acc + g.popularity, 0) / regionGenres.length)}%
                      </div>
                      <div className="text-sm text-gray-300">Средняя популярность</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="bg-yellow-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                        <Star className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {regionGenres.filter(g => g.monetizationPotential === 'high').length}
                      </div>
                      <div className="text-sm text-gray-300">Высокий потенциал</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                        <Users className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {Object.keys(currentStrategy.languageDistribution).length}
                      </div>
                      <div className="text-sm text-gray-300">Поддерживаемых языков</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Рекомендации по монетизации</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">Высокий потенциал</h4>
                        <p className="text-gray-300 text-sm">
                          {regionGenres.filter(g => g.monetizationPotential === 'high').length} жанров
                        </p>
                        <p className="text-green-400 text-xs mt-1">
                          Фокус на премиум подписки и NFT
                        </p>
                      </div>
                      <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">Средний потенциал</h4>
                        <p className="text-gray-300 text-sm">
                          {regionGenres.filter(g => g.monetizationPotential === 'medium').length} жанров
                        </p>
                        <p className="text-yellow-400 text-xs mt-1">
                          Реклама и микроплатежи
                        </p>
                      </div>
                      <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">Низкий потенциал</h4>
                        <p className="text-gray-300 text-sm">
                          {regionGenres.filter(g => g.monetizationPotential === 'low').length} жанров
                        </p>
                        <p className="text-red-400 text-xs mt-1">
                          Фокус на привлечение аудитории
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
