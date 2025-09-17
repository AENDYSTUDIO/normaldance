'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  FileText,
  Users,
  Calendar,
  TrendingUp,
  Target
} from '@/components/icons';
import { 
  ATR_REGULATORY_REQUIREMENTS,
  getRequirementsByCountry,
  getRequirementsByCategory,
  getComplianceSummary,
  getUpcomingDeadlines,
  getComplianceCost,
  ATRRegulatoryRequirement
} from '@/lib/atr-regulatory-compliance';

export default function ATRRegulatoryCompliance() {
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const countries = ['All', 'China', 'Japan', 'South Korea', 'India', 'Singapore'];
  const categories = ['All', 'data_protection', 'financial', 'content', 'tax', 'business', 'technical'];

  const summary = getComplianceSummary();
  const upcomingDeadlines = getUpcomingDeadlines(90);
  const costBreakdown = getComplianceCost();

  const filteredRequirements = ATR_REGULATORY_REQUIREMENTS.filter(req => {
    const countryMatch = selectedCountry === 'All' || req.country === selectedCountry;
    const categoryMatch = selectedCategory === 'All' || req.category === selectedCategory;
    return countryMatch && categoryMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'high': return 'bg-orange-500/20 border-orange-500 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'low': return 'bg-green-500/20 border-green-500 text-green-400';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'in_progress': return 'bg-blue-500/20 border-blue-500 text-blue-400';
      case 'pending': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'not_applicable': return 'bg-gray-500/20 border-gray-500 text-gray-400';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'compliant': return 'Соответствует';
      case 'in_progress': return 'В процессе';
      case 'pending': return 'Ожидает';
      case 'not_applicable': return 'Не применимо';
      default: return 'Неизвестно';
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

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'data_protection': return 'Защита данных';
      case 'financial': return 'Финансовые услуги';
      case 'content': return 'Контент';
      case 'tax': return 'Налогообложение';
      case 'business': return 'Бизнес';
      case 'technical': return 'Технические';
      default: return category;
    }
  };

  const getCostText = (cost: string) => {
    switch (cost) {
      case 'low': return 'Низкая';
      case 'medium': return 'Средняя';
      case 'high': return 'Высокая';
      default: return 'Неизвестно';
    }
  };

  const getEffortText = (effort: string) => {
    switch (effort) {
      case 'low': return 'Низкие';
      case 'medium': return 'Средние';
      case 'high': return 'Высокие';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{summary.total}</div>
            <div className="text-sm text-gray-300">Всего требований</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{summary.compliant}</div>
            <div className="text-sm text-gray-300">Соответствует</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{summary.inProgress}</div>
            <div className="text-sm text-gray-300">В процессе</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{summary.critical}</div>
            <div className="text-sm text-gray-300">Критических</div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Rate */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Общий уровень соответствия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Прогресс соответствия</span>
              <span className="text-white font-bold">{summary.complianceRate}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${summary.complianceRate}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-red-400 font-semibold">{summary.pending}</div>
                <div className="text-gray-300">Ожидает</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-semibold">{summary.inProgress}</div>
                <div className="text-gray-300">В процессе</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-semibold">{summary.compliant}</div>
                <div className="text-gray-300">Соответствует</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl">Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-white font-semibold mb-2 block">Страна</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white font-semibold mb-2 block">Категория</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryText(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements List */}
      <div className="space-y-4">
        {filteredRequirements.map((requirement) => (
          <Card key={requirement.id} className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold text-lg">{requirement.title}</h3>
                    <p className="text-gray-300 text-sm">{requirement.description}</p>
                    <div className="flex items-center gap-2 text-sm text-blue-200">
                      <span>{requirement.country}</span>
                      <span>•</span>
                      <span>{getCategoryText(requirement.category)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={`text-xs ${getPriorityColor(requirement.priority)}`}>
                      {getPriorityText(requirement.priority)}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(requirement.status)}`}>
                      {getStatusText(requirement.status)}
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Требования</h4>
                    <ul className="space-y-1">
                      {requirement.requirements.slice(0, 3).map((req, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          {req}
                        </li>
                      ))}
                      {requirement.requirements.length > 3 && (
                        <li className="text-sm text-gray-300">
                          +{requirement.requirements.length - 3} дополнительных требований
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Штрафы</h4>
                    <ul className="space-y-1">
                      {requirement.penalties.slice(0, 2).map((penalty, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                          {penalty}
                        </li>
                      ))}
                      {requirement.penalties.length > 2 && (
                        <li className="text-sm text-gray-300">
                          +{requirement.penalties.length - 2} дополнительных штрафов
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">Стоимость</div>
                    <div className="text-gray-300 text-xs">{getCostText(requirement.complianceCost)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">Усилия</div>
                    <div className="text-gray-300 text-xs">{getEffortText(requirement.implementationEffort)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">Документы</div>
                    <div className="text-gray-300 text-xs">{requirement.documents.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">Контакты</div>
                    <div className="text-gray-300 text-xs">{requirement.contacts.length}</div>
                  </div>
                </div>

                {requirement.deadline && (
                  <div className="flex items-center gap-2 text-sm text-yellow-400">
                    <Calendar className="h-4 w-4" />
                    <span>Срок: {new Date(requirement.deadline).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card className="bg-yellow-500/20 backdrop-blur-sm border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Ближайшие сроки
            </CardTitle>
            <CardDescription className="text-yellow-200">
              Требования с истекающими сроками в ближайшие 90 дней
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((requirement) => (
                <div key={requirement.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-semibold">{requirement.title}</div>
                    <div className="text-gray-300 text-sm">{requirement.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-semibold">
                      {new Date(requirement.deadline!).toLocaleDateString('ru-RU')}
                    </div>
                    <Badge className={`text-xs ${getPriorityColor(requirement.priority)}`}>
                      {getPriorityText(requirement.priority)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Breakdown */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Распределение затрат на соответствие
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{costBreakdown.low}</div>
              <div className="text-sm text-gray-300">Низкая стоимость</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{costBreakdown.medium}</div>
              <div className="text-sm text-gray-300">Средняя стоимость</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{costBreakdown.high}</div>
              <div className="text-sm text-gray-300">Высокая стоимость</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
