'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { Globe, Users, Zap, Shield } from '@/components/icons';
import { ATR_LANGUAGES, ATRLanguageCode, getLanguageByRegion } from '@/lib/i18n/atr-languages';
import { getPaymentMethodsByLanguage } from '@/lib/i18n/atr-payment-integration';

interface LanguageSelectorProps {
  onLanguageSelect: (language: ATRLanguageCode) => void;
  currentLanguage?: ATRLanguageCode;
}

export default function LanguageSelector({ onLanguageSelect, currentLanguage }: LanguageSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('East Asia');
  const [selectedLanguage, setSelectedLanguage] = useState<ATRLanguageCode | null>(currentLanguage || null);

  const regions = [
    {
      name: 'East Asia',
      displayName: 'Восточная Азия',
      countries: ['China', 'Japan', 'South Korea', 'Taiwan'],
      icon: '🌏',
      description: 'Крупнейшие рынки с высоким потенциалом'
    },
    {
      name: 'Southeast Asia',
      displayName: 'Юго-Восточная Азия',
      countries: ['India', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines', 'Malaysia', 'Singapore'],
      icon: '🌴',
      description: 'Быстрорастущие рынки с молодым населением'
    },
    {
      name: 'Oceania',
      displayName: 'Океания',
      countries: ['Australia', 'New Zealand'],
      icon: '🦘',
      description: 'Развитые рынки с высокими доходами'
    }
  ];

  const regionLanguages = getLanguageByRegion(selectedRegion);

  const handleLanguageSelect = (language: ATRLanguageCode) => {
    setSelectedLanguage(language);
    onLanguageSelect(language);
  };

  const getLanguagePriority = (language: ATRLanguageCode) => {
    const langInfo = ATR_LANGUAGES[language];
    return langInfo.priority;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Критический';
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="space-y-6">
      {/* Region Selection */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Выберите регион
          </CardTitle>
          <CardDescription className="text-blue-200">
            Выберите регион для просмотра доступных языков
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {regions.map((region) => (
              <Button
                key={region.name}
                variant={selectedRegion === region.name ? 'default' : 'outline'}
                className={`h-auto p-4 text-left ${
                  selectedRegion === region.name 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-white/5 hover:bg-white/10 border-white/20'
                }`}
                onClick={() => setSelectedRegion(region.name)}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{region.icon}</span>
                    <span className="font-semibold">{region.displayName}</span>
                  </div>
                  <p className="text-sm opacity-80">{region.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {region.countries.slice(0, 3).map((country) => (
                      <Badge key={country} variant="secondary" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                    {region.countries.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{region.countries.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language Selection */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            Выберите язык
          </CardTitle>
          <CardDescription className="text-blue-200">
            Доступные языки для выбранного региона
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionLanguages.map((languageCode) => {
              const langInfo = ATR_LANGUAGES[languageCode];
              const paymentMethods = getPaymentMethodsByLanguage(languageCode);
              const priority = getLanguagePriority(languageCode);
              
              return (
                <div
                  key={languageCode}
                  className={`bg-white/5 rounded-lg p-4 border-2 transition-all cursor-pointer hover:bg-white/10 ${
                    selectedLanguage === languageCode 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : 'border-white/20'
                  }`}
                  onClick={() => handleLanguageSelect(languageCode)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold text-lg">
                        {langInfo.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority)}`}></div>
                        <span className="text-xs text-gray-300">
                          {getPriorityText(priority)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-gray-300 text-sm">
                        {langInfo.englishName}
                      </p>
                      <p className="text-blue-200 text-sm">
                        Регион: {langInfo.region}
                      </p>
                      <p className="text-gray-300 text-sm">
                        Население: {langInfo.population}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">Платежи:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {paymentMethods.slice(0, 2).map((method) => (
                          <Badge key={method.id} variant="outline" className="text-xs">
                            {method.name}
                          </Badge>
                        ))}
                        {paymentMethods.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{paymentMethods.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-gray-300">Особенности:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {langInfo.features.slice(0, 2).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {langInfo.features.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{langInfo.features.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Language Summary */}
      {selectedLanguage && (
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              Выбранный язык: {ATR_LANGUAGES[selectedLanguage].name}
            </CardTitle>
            <CardDescription className="text-blue-200">
              Готов к настройке и интеграции
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-2">Информация о языке</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    <span className="font-medium">Английское название:</span> {ATR_LANGUAGES[selectedLanguage].englishName}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Регион:</span> {ATR_LANGUAGES[selectedLanguage].region}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Население:</span> {ATR_LANGUAGES[selectedLanguage].population}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Валюта:</span> {ATR_LANGUAGES[selectedLanguage].currency}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Платежные системы</h4>
                <div className="space-y-1">
                  {getPaymentMethodsByLanguage(selectedLanguage).map((method) => (
                    <div key={method.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{method.name}</span>
                      <Badge 
                        variant={method.priority === 'critical' ? 'destructive' : 
                                method.priority === 'high' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {method.priority === 'critical' ? 'Критическая' :
                         method.priority === 'high' ? 'Высокая' :
                         method.priority === 'medium' ? 'Средняя' : 'Низкая'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
