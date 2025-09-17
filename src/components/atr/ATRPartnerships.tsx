'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { 
  Handshake, 
  Building2, 
  DollarSign, 
  Calendar,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Globe,
  Phone,
  Mail,
  ExternalLink
} from '@/components/icons';
import { 
  ATR_PARTNERSHIPS,
  getPartnershipsByCountry,
  getPartnershipsByType,
  getPartnershipsByStatus,
  getPartnershipSummary,
  getPartnershipValue,
  ATRPartnership
} from '@/lib/atr-partnerships';

export default function ATRPartnerships() {
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const countries = ['All', 'China', 'Japan', 'South Korea', 'India', 'Singapore'];
  const types = ['All', 'record_label', 'payment_provider', 'distribution', 'marketing', 'technology', 'regulatory', 'content'];
  const statuses = ['All', 'active', 'negotiating', 'pending', 'inactive', 'potential'];

  const summary = getPartnershipSummary();
  const valueData = getPartnershipValue();

  const filteredPartnerships = ATR_PARTNERSHIPS.filter(partnership => {
    const countryMatch = selectedCountry === 'All' || partnership.country === selectedCountry;
    const typeMatch = selectedType === 'All' || partnership.type === selectedType;
    const statusMatch = selectedStatus === 'All' || partnership.status === selectedStatus;
    return countryMatch && typeMatch && statusMatch;
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
      case 'active': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'negotiating': return 'bg-blue-500/20 border-blue-500 text-blue-400';
      case 'pending': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'inactive': return 'bg-gray-500/20 border-gray-500 text-gray-400';
      case 'potential': return 'bg-purple-500/20 border-purple-500 text-purple-400';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активное';
      case 'negotiating': return 'Переговоры';
      case 'pending': return 'Ожидает';
      case 'inactive': return 'Неактивное';
      case 'potential': return 'Потенциальное';
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

  const getTypeText = (type: string) => {
    switch (type) {
      case 'record_label': return 'Музыкальный лейбл';
      case 'payment_provider': return 'Платежный провайдер';
      case 'distribution': return 'Дистрибуция';
      case 'marketing': return 'Маркетинг';
      case 'technology': return 'Технологии';
      case 'regulatory': return 'Регуляторное';
      case 'content': return 'Контент';
      default: return type;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{summary.total}</div>
            <div className="text-sm text-gray-300">Всего партнерств</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{summary.active}</div>
            <div className="text-sm text-gray-300">Активных</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{summary.negotiating}</div>
            <div className="text-sm text-gray-300">В переговорах</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{summary.critical}</div>
            <div className="text-sm text-gray-300">Критических</div>
          </CardContent>
        </Card>
      </div>

      {/* Partnership Value */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Общая стоимость партнерств
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {formatCurrency(valueData.total, 'USD')}
              </div>
              <div className="text-gray-300">Общая потенциальная стоимость</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(valueData.byCountry).map(([country, value]) => (
                <div key={country} className="text-center">
                  <div className="text-lg font-semibold text-white">
                    {formatCurrency(value, 'USD')}
                  </div>
                  <div className="text-sm text-gray-300">{country}</div>
                </div>
              ))}
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
          <div className="grid md:grid-cols-3 gap-4">
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
              <label className="text-white font-semibold mb-2 block">Тип</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {getTypeText(type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white font-semibold mb-2 block">Статус</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partnerships List */}
      <div className="space-y-4">
        {filteredPartnerships.map((partnership) => (
          <Card key={partnership.id} className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold text-lg">{partnership.name}</h3>
                    <p className="text-gray-300 text-sm">{partnership.description}</p>
                    <div className="flex items-center gap-2 text-sm text-blue-200">
                      <span>{partnership.country}</span>
                      <span>•</span>
                      <span>{getTypeText(partnership.type)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={`text-xs ${getPriorityColor(partnership.priority)}`}>
                      {getPriorityText(partnership.priority)}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(partnership.status)}`}>
                      {getStatusText(partnership.status)}
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Преимущества</h4>
                    <ul className="space-y-1">
                      {partnership.benefits.slice(0, 3).map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          {benefit}
                        </li>
                      ))}
                      {partnership.benefits.length > 3 && (
                        <li className="text-sm text-gray-300">
                          +{partnership.benefits.length - 3} дополнительных преимуществ
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Требования</h4>
                    <ul className="space-y-1">
                      {partnership.requirements.slice(0, 3).map((requirement, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                          {requirement}
                        </li>
                      ))}
                      {partnership.requirements.length > 3 && (
                        <li className="text-sm text-gray-300">
                          +{partnership.requirements.length - 3} дополнительных требований
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">Стоимость</div>
                    <div className="text-gray-300 text-xs">
                      {formatCurrency(partnership.dealValue.min, partnership.dealValue.currency)} - 
                      {formatCurrency(partnership.dealValue.max, partnership.dealValue.currency)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">Период</div>
                    <div className="text-gray-300 text-xs">
                      {new Date(partnership.timeline.start).toLocaleDateString('ru-RU')} - 
                      {partnership.timeline.end ? new Date(partnership.timeline.end).toLocaleDateString('ru-RU') : 'TBD'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">Метрики</div>
                    <div className="text-gray-300 text-xs">{partnership.successMetrics.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">Риски</div>
                    <div className="text-gray-300 text-xs">{partnership.risks.length}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white font-semibold">Контактная информация</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Building2 className="h-4 w-4" />
                        {partnership.contactInfo.company}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Users className="h-4 w-4" />
                        {partnership.contactInfo.contactPerson}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${partnership.contactInfo.email}`} className="text-blue-400 hover:text-blue-300">
                          {partnership.contactInfo.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Phone className="h-4 w-4" />
                        {partnership.contactInfo.phone}
                      </div>
                    </div>
                  </div>
                  {partnership.contactInfo.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <ExternalLink className="h-4 w-4" />
                      <a href={partnership.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                        {partnership.contactInfo.website}
                      </a>
                    </div>
                  )}
                </div>

                {partnership.notes && (
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-200 text-sm">{partnership.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success Metrics Overview */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Обзор успешности партнерств
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Общий уровень успешности</span>
              <span className="text-white font-bold">{summary.successRate}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${summary.successRate}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-purple-400 font-semibold">{summary.potential}</div>
                <div className="text-gray-300">Потенциальные</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-semibold">{summary.negotiating}</div>
                <div className="text-gray-300">Переговоры</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-semibold">{summary.negotiating}</div>
                <div className="text-gray-300">В процессе</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-semibold">{summary.active}</div>
                <div className="text-gray-300">Активные</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
