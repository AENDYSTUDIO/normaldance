// Интеграция с платежными системами АТР
import { ATRLanguageCode } from './atr-languages';

export interface ATRPaymentMethod {
  id: string;
  name: string;
  displayName: Record<ATRLanguageCode, string>;
  region: string[];
  currency: string[];
  minAmount: number;
  maxAmount: number;
  fee: number;
  processingTime: string;
  supportedFeatures: string[];
  integrationRequired: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export const ATR_PAYMENT_METHODS: ATRPaymentMethod[] = [
  // Китай
  {
    id: 'wechat-pay',
    name: 'WeChat Pay',
    displayName: {
      'zh-CN': '微信支付',
      'zh-TW': '微信支付',
      'ja': 'WeChat Pay',
      'ko': 'WeChat Pay',
      'hi': 'WeChat Pay',
      'id': 'WeChat Pay',
      'th': 'WeChat Pay',
      'vi': 'WeChat Pay',
      'tl': 'WeChat Pay',
      'ms': 'WeChat Pay',
      'en-AU': 'WeChat Pay',
      'en-NZ': 'WeChat Pay'
    },
    region: ['China'],
    currency: ['CNY'],
    minAmount: 0.01,
    maxAmount: 50000,
    fee: 0.006,
    processingTime: 'Instant',
    supportedFeatures: ['QR Code', 'In-App', 'Web', 'Mobile'],
    integrationRequired: true,
    priority: 'critical'
  },
  {
    id: 'alipay',
    name: 'Alipay',
    displayName: {
      'zh-CN': '支付宝',
      'zh-TW': '支付寶',
      'ja': 'Alipay',
      'ko': 'Alipay',
      'hi': 'Alipay',
      'id': 'Alipay',
      'th': 'Alipay',
      'vi': 'Alipay',
      'tl': 'Alipay',
      'ms': 'Alipay',
      'en-AU': 'Alipay',
      'en-NZ': 'Alipay'
    },
    region: ['China'],
    currency: ['CNY'],
    minAmount: 0.01,
    maxAmount: 50000,
    fee: 0.006,
    processingTime: 'Instant',
    supportedFeatures: ['QR Code', 'In-App', 'Web', 'Mobile'],
    integrationRequired: true,
    priority: 'critical'
  },

  // Япония
  {
    id: 'paypay',
    name: 'PayPay',
    displayName: {
      'zh-CN': 'PayPay',
      'zh-TW': 'PayPay',
      'ja': 'PayPay',
      'ko': 'PayPay',
      'hi': 'PayPay',
      'id': 'PayPay',
      'th': 'PayPay',
      'vi': 'PayPay',
      'tl': 'PayPay',
      'ms': 'PayPay',
      'en-AU': 'PayPay',
      'en-NZ': 'PayPay'
    },
    region: ['Japan'],
    currency: ['JPY'],
    minAmount: 1,
    maxAmount: 1000000,
    fee: 0.0035,
    processingTime: 'Instant',
    supportedFeatures: ['QR Code', 'In-App', 'Mobile'],
    integrationRequired: true,
    priority: 'high'
  },
  {
    id: 'line-pay',
    name: 'LINE Pay',
    displayName: {
      'zh-CN': 'LINE Pay',
      'zh-TW': 'LINE Pay',
      'ja': 'LINE Pay',
      'ko': 'LINE Pay',
      'hi': 'LINE Pay',
      'id': 'LINE Pay',
      'th': 'LINE Pay',
      'vi': 'LINE Pay',
      'tl': 'LINE Pay',
      'ms': 'LINE Pay',
      'en-AU': 'LINE Pay',
      'en-NZ': 'LINE Pay'
    },
    region: ['Japan', 'Taiwan', 'Thailand'],
    currency: ['JPY', 'TWD', 'THB'],
    minAmount: 1,
    maxAmount: 100000,
    fee: 0.0035,
    processingTime: 'Instant',
    supportedFeatures: ['QR Code', 'In-App', 'Mobile', 'Social'],
    integrationRequired: true,
    priority: 'high'
  },

  // Южная Корея
  {
    id: 'kakaopay',
    name: 'KakaoPay',
    displayName: {
      'zh-CN': 'KakaoPay',
      'zh-TW': 'KakaoPay',
      'ja': 'KakaoPay',
      'ko': '카카오페이',
      'hi': 'KakaoPay',
      'id': 'KakaoPay',
      'th': 'KakaoPay',
      'vi': 'KakaoPay',
      'tl': 'KakaoPay',
      'ms': 'KakaoPay',
      'en-AU': 'KakaoPay',
      'en-NZ': 'KakaoPay'
    },
    region: ['South Korea'],
    currency: ['KRW'],
    minAmount: 100,
    maxAmount: 10000000,
    fee: 0.0035,
    processingTime: 'Instant',
    supportedFeatures: ['QR Code', 'In-App', 'Mobile', 'Social'],
    integrationRequired: true,
    priority: 'high'
  },
  {
    id: 'naver-pay',
    name: 'Naver Pay',
    displayName: {
      'zh-CN': 'Naver Pay',
      'zh-TW': 'Naver Pay',
      'ja': 'Naver Pay',
      'ko': '네이버페이',
      'hi': 'Naver Pay',
      'id': 'Naver Pay',
      'th': 'Naver Pay',
      'vi': 'Naver Pay',
      'tl': 'Naver Pay',
      'ms': 'Naver Pay',
      'en-AU': 'Naver Pay',
      'en-NZ': 'Naver Pay'
    },
    region: ['South Korea'],
    currency: ['KRW'],
    minAmount: 100,
    maxAmount: 10000000,
    fee: 0.0035,
    processingTime: 'Instant',
    supportedFeatures: ['Web', 'In-App', 'Mobile'],
    integrationRequired: true,
    priority: 'high'
  },

  // Индия
  {
    id: 'upi',
    name: 'UPI',
    displayName: {
      'zh-CN': 'UPI',
      'zh-TW': 'UPI',
      'ja': 'UPI',
      'ko': 'UPI',
      'hi': 'UPI',
      'id': 'UPI',
      'th': 'UPI',
      'vi': 'UPI',
      'tl': 'UPI',
      'ms': 'UPI',
      'en-AU': 'UPI',
      'en-NZ': 'UPI'
    },
    region: ['India'],
    currency: ['INR'],
    minAmount: 1,
    maxAmount: 100000,
    fee: 0,
    processingTime: 'Instant',
    supportedFeatures: ['QR Code', 'Mobile', 'Bank Transfer'],
    integrationRequired: true,
    priority: 'high'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    displayName: {
      'zh-CN': 'Paytm',
      'zh-TW': 'Paytm',
      'ja': 'Paytm',
      'ko': 'Paytm',
      'hi': 'Paytm',
      'id': 'Paytm',
      'th': 'Paytm',
      'vi': 'Paytm',
      'tl': 'Paytm',
      'ms': 'Paytm',
      'en-AU': 'Paytm',
      'en-NZ': 'Paytm'
    },
    region: ['India'],
    currency: ['INR'],
    minAmount: 1,
    maxAmount: 100000,
    fee: 0.02,
    processingTime: 'Instant',
    supportedFeatures: ['QR Code', 'Mobile', 'Wallet'],
    integrationRequired: true,
    priority: 'high'
  },

  // Юго-Восточная Азия
  {
    id: 'gopay',
    name: 'GoPay',
    displayName: {
      'zh-CN': 'GoPay',
      'zh-TW': 'GoPay',
      'ja': 'GoPay',
      'ko': 'GoPay',
      'hi': 'GoPay',
      'id': 'GoPay',
      'th': 'GoPay',
      'vi': 'GoPay',
      'tl': 'GoPay',
      'ms': 'GoPay',
      'en-AU': 'GoPay',
      'en-NZ': 'GoPay'
    },
    region: ['Indonesia'],
    currency: ['IDR'],
    minAmount: 1000,
    maxAmount: 10000000,
    fee: 0.02,
    processingTime: 'Instant',
    supportedFeatures: ['QR Code', 'Mobile', 'Ride Hailing'],
    integrationRequired: true,
    priority: 'medium'
  },
  {
    id: 'grabpay',
    name: 'GrabPay',
    displayName: {
      'zh-CN': 'GrabPay',
      'zh-TW': 'GrabPay',
      'ja': 'GrabPay',
      'ko': 'GrabPay',
      'hi': 'GrabPay',
      'id': 'GrabPay',
      'th': 'GrabPay',
      'vi': 'GrabPay',
      'tl': 'GrabPay',
      'ms': 'GrabPay',
      'en-AU': 'GrabPay',
      'en-NZ': 'GrabPay'
    },
    region: ['Singapore', 'Malaysia', 'Thailand', 'Vietnam', 'Philippines'],
    currency: ['SGD', 'MYR', 'THB', 'VND', 'PHP'],
    minAmount: 1,
    maxAmount: 10000,
    fee: 0.02,
    processingTime: 'Instant',
    supportedFeatures: ['QR Code', 'Mobile', 'Ride Hailing'],
    integrationRequired: true,
    priority: 'medium'
  },

  // Австралия
  {
    id: 'payid',
    name: 'PayID',
    displayName: {
      'zh-CN': 'PayID',
      'zh-TW': 'PayID',
      'ja': 'PayID',
      'ko': 'PayID',
      'hi': 'PayID',
      'id': 'PayID',
      'th': 'PayID',
      'vi': 'PayID',
      'tl': 'PayID',
      'ms': 'PayID',
      'en-AU': 'PayID',
      'en-NZ': 'PayID'
    },
    region: ['Australia', 'New Zealand'],
    currency: ['AUD', 'NZD'],
    minAmount: 0.01,
    maxAmount: 10000,
    fee: 0,
    processingTime: 'Instant',
    supportedFeatures: ['Bank Transfer', 'Mobile', 'Email'],
    integrationRequired: true,
    priority: 'medium'
  }
];

export const getPaymentMethodsByRegion = (region: string): ATRPaymentMethod[] => {
  return ATR_PAYMENT_METHODS.filter(method => 
    method.region.includes(region)
  );
};

export const getPaymentMethodsByLanguage = (language: ATRLanguageCode): ATRPaymentMethod[] => {
  const languageInfo = {
    'zh-CN': 'China',
    'zh-TW': 'Taiwan',
    'ja': 'Japan',
    'ko': 'South Korea',
    'hi': 'India',
    'id': 'Indonesia',
    'th': 'Thailand',
    'vi': 'Vietnam',
    'tl': 'Philippines',
    'ms': 'Malaysia',
    'en-AU': 'Australia',
    'en-NZ': 'New Zealand'
  };

  const region = languageInfo[language];
  return getPaymentMethodsByRegion(region);
};

export const getPaymentMethodById = (id: string): ATRPaymentMethod | undefined => {
  return ATR_PAYMENT_METHODS.find(method => method.id === id);
};

export const getPaymentMethodDisplayName = (
  methodId: string, 
  language: ATRLanguageCode
): string => {
  const method = getPaymentMethodById(methodId);
  if (!method) return methodId;
  
  return method.displayName[language] || method.name;
};
