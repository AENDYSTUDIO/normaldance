import { SecureLogger } from '@/lib/security/secure-logger';
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Input, Label } from '@/components/ui';
import { 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Zap, 
  Shield, 
  Clock,
  DollarSign,
  CheckCircle
} from '@/components/icons';
import { 
  ATR_PAYMENT_METHODS, 
  ATRPaymentMethod, 
  getPaymentMethodsByLanguage,
  getPaymentMethodDisplayName 
} from '@/lib/i18n/atr-payment-integration';
import { ATRLanguageCode } from '@/lib/i18n/atr-languages';

interface ATRPaymentMethodsProps {
  language: ATRLanguageCode;
  onPaymentSelect?: (method: ATRPaymentMethod) => void;
  selectedMethod?: string;
}

export default function ATRPaymentMethods({ 
  language, 
  onPaymentSelect, 
  selectedMethod 
}: ATRPaymentMethodsProps) {
  const [amount, setAmount] = useState<string>('10.00');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(selectedMethod || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const availableMethods = getPaymentMethodsByLanguage(language);
  const criticalMethods = availableMethods.filter(m => m.priority === 'critical');
  const highMethods = availableMethods.filter(m => m.priority === 'high');
  const mediumMethods = availableMethods.filter(m => m.priority === 'medium');

  const handleMethodSelect = (method: ATRPaymentMethod) => {
    setSelectedPaymentMethod(method.id);
    onPaymentSelect?.(method);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) return;
    
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    
    // Handle payment success
    SecureLogger.log('Payment processed with:', selectedPaymentMethod);
  };

  const getMethodIcon = (method: ATRPaymentMethod) => {
    if (method.supportedFeatures.includes('QR Code')) return <QrCode className="h-5 w-5" />;
    if (method.supportedFeatures.includes('Mobile')) return <Smartphone className="h-5 w-5" />;
    if (method.supportedFeatures.includes('Bank Transfer')) return <CreditCard className="h-5 w-5" />;
    return <DollarSign className="h-5 w-5" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-blue-500 bg-blue-500/10';
      case 'low': return 'border-gray-500 bg-gray-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Критическая';
      case 'high': return 'Высокая';
      case 'medium': return 'Средняя';
      case 'low': return 'Низкая';
      default: return 'Неизвестно';
    }
  };

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(numAmount);
  };

  const renderPaymentMethodGroup = (methods: ATRPaymentMethod[], title: string) => {
    if (methods.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {methods.map((method) => (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedPaymentMethod === method.id 
                  ? 'ring-2 ring-blue-500 bg-blue-500/20' 
                  : 'bg-white/5 hover:bg-white/10'
              } ${getPriorityColor(method.priority)}`}
              onClick={() => handleMethodSelect(method)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getMethodIcon(method)}
                      <div>
                        <h4 className="text-white font-semibold">
                          {getPaymentMethodDisplayName(method.id, language)}
                        </h4>
                        <p className="text-gray-300 text-sm">{method.name}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={method.priority === 'critical' ? 'destructive' : 
                              method.priority === 'high' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {getPriorityText(method.priority)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Комиссия:</span>
                      <span className="text-white">
                        {method.fee === 0 ? 'Бесплатно' : `${(method.fee * 100).toFixed(2)}%`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Время обработки:</span>
                      <span className="text-white flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {method.processingTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Лимит:</span>
                      <span className="text-white">
                        {formatAmount(method.minAmount.toString(), method.currency[0])} - 
                        {formatAmount(method.maxAmount.toString(), method.currency[0])}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Поддерживаемые функции:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {method.supportedFeatures.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedPaymentMethod === method.id && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Выбрано
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Payment Amount */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Сумма платежа
          </CardTitle>
          <CardDescription className="text-blue-200">
            Введите сумму для тестирования платежных методов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white">Сумма</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                placeholder="10.00"
                step="0.01"
                min="0.01"
              />
            </div>
            <div className="text-sm text-gray-300">
              <p>Выбранная сумма: {formatAmount(amount, availableMethods[0]?.currency[0] || 'USD')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="space-y-8">
        {renderPaymentMethodGroup(criticalMethods, '🚨 Критические платежные системы')}
        {renderPaymentMethodGroup(highMethods, '⭐ Высокоприоритетные платежные системы')}
        {renderPaymentMethodGroup(mediumMethods, '📱 Дополнительные платежные системы')}
      </div>

      {/* Payment Action */}
      {selectedPaymentMethod && (
        <Card className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm border-green-500/30">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-400" />
                <h3 className="text-white font-semibold text-lg">Готово к оплате</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Метод оплаты:</span>
                  <span className="text-white">
                    {getPaymentMethodDisplayName(selectedPaymentMethod, language)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Сумма:</span>
                  <span className="text-white">
                    {formatAmount(amount, availableMethods.find(m => m.id === selectedPaymentMethod)?.currency[0] || 'USD')}
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Обработка платежа...
                  </div>
                ) : (
                  'Оплатить'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Status */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl">Статус интеграции</CardTitle>
          <CardDescription className="text-blue-200">
            Текущий статус интеграции платежных систем
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Критические</h4>
                <p className="text-gray-300 text-sm">
                  {criticalMethods.length} методов требуют немедленной интеграции
                </p>
              </div>
              <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Высокий приоритет</h4>
                <p className="text-gray-300 text-sm">
                  {highMethods.length} методов для интеграции в ближайшее время
                </p>
              </div>
              <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Средний приоритет</h4>
                <p className="text-gray-300 text-sm">
                  {mediumMethods.length} методов для будущей интеграции
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
