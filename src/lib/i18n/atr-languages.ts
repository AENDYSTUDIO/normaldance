// Поддержка языков Азиатско-Тихоокеанского региона
export const ATR_LANGUAGES = {
  // Восточная Азия
  'zh-CN': {
    name: '简体中文',
    englishName: 'Simplified Chinese',
    region: 'China',
    population: '1.4B',
    priority: 'critical',
    currency: 'CNY',
    paymentMethods: ['WeChat Pay', 'Alipay', 'UnionPay'],
    features: ['Simplified Chinese', 'Local payments', 'WeChat integration']
  },
  'zh-TW': {
    name: '繁體中文',
    englishName: 'Traditional Chinese',
    region: 'Taiwan',
    population: '23M',
    priority: 'high',
    currency: 'TWD',
    paymentMethods: ['Line Pay', 'Apple Pay', 'Google Pay'],
    features: ['Traditional Chinese', 'Local payments', 'Line integration']
  },
  'ja': {
    name: '日本語',
    englishName: 'Japanese',
    region: 'Japan',
    population: '125M',
    priority: 'high',
    currency: 'JPY',
    paymentMethods: ['PayPay', 'Rakuten Pay', 'LINE Pay'],
    features: ['Mobile optimization', 'Anime integration', 'QR payments']
  },
  'ko': {
    name: '한국어',
    englishName: 'Korean',
    region: 'South Korea',
    population: '52M',
    priority: 'high',
    currency: 'KRW',
    paymentMethods: ['KakaoPay', 'Naver Pay', 'Samsung Pay'],
    features: ['K-pop integration', 'Idol system', 'Kakao integration']
  },

  // Юго-Восточная Азия
  'hi': {
    name: 'हिन्दी',
    englishName: 'Hindi',
    region: 'India',
    population: '600M',
    priority: 'high',
    currency: 'INR',
    paymentMethods: ['UPI', 'Paytm', 'PhonePe'],
    features: ['Bollywood content', 'UPI payments', 'Regional dialects']
  },
  'id': {
    name: 'Bahasa Indonesia',
    englishName: 'Indonesian',
    region: 'Indonesia',
    population: '275M',
    priority: 'medium',
    currency: 'IDR',
    paymentMethods: ['GoPay', 'OVO', 'DANA'],
    features: ['Dangdut genre', 'Go-jek integration', 'Social features']
  },
  'th': {
    name: 'ไทย',
    englishName: 'Thai',
    region: 'Thailand',
    population: '70M',
    priority: 'medium',
    currency: 'THB',
    paymentMethods: ['PromptPay', 'TrueMoney', 'Rabbit LINE Pay'],
    features: ['Luk Thung genre', 'Local content', 'Mobile-first']
  },
  'vi': {
    name: 'Tiếng Việt',
    englishName: 'Vietnamese',
    region: 'Vietnam',
    population: '98M',
    priority: 'medium',
    currency: 'VND',
    paymentMethods: ['MoMo', 'ZaloPay', 'ViettelPay'],
    features: ['V-pop content', 'Local integration', 'Social commerce']
  },
  'tl': {
    name: 'Filipino',
    englishName: 'Filipino',
    region: 'Philippines',
    population: '110M',
    priority: 'medium',
    currency: 'PHP',
    paymentMethods: ['GCash', 'PayMaya', 'GrabPay'],
    features: ['OPM content', 'Social features', 'Mobile payments']
  },
  'ms': {
    name: 'Bahasa Melayu',
    englishName: 'Malay',
    region: 'Malaysia',
    population: '33M',
    priority: 'medium',
    currency: 'MYR',
    paymentMethods: ['GrabPay', 'Boost', 'Touch n Go'],
    features: ['Malay Pop', 'Multi-language', 'Local content']
  },

  // Океания
  'en-AU': {
    name: 'English (Australia)',
    englishName: 'English (Australia)',
    region: 'Australia',
    population: '26M',
    priority: 'medium',
    currency: 'AUD',
    paymentMethods: ['PayID', 'Afterpay', 'Zip'],
    features: ['Aussie Rock', 'High quality', 'Western integration']
  },
  'en-NZ': {
    name: 'English (New Zealand)',
    englishName: 'English (New Zealand)',
    region: 'New Zealand',
    population: '5M',
    priority: 'low',
    currency: 'NZD',
    paymentMethods: ['PayID', 'Afterpay', 'Zip'],
    features: ['Kiwi Music', 'High quality', 'Local content']
  }
} as const;

export type ATRLanguageCode = keyof typeof ATR_LANGUAGES;

export const PRIORITY_LANGUAGES: ATRLanguageCode[] = [
  'zh-CN', 'ja', 'ko', 'hi', 'en-AU'
];

export const CRITICAL_LANGUAGES: ATRLanguageCode[] = [
  'zh-CN'
];

export const getLanguageByRegion = (region: string): ATRLanguageCode[] => {
  const regionMap: Record<string, ATRLanguageCode[]> = {
    'East Asia': ['zh-CN', 'zh-TW', 'ja', 'ko'],
    'Southeast Asia': ['hi', 'id', 'th', 'vi', 'tl', 'ms'],
    'Oceania': ['en-AU', 'en-NZ']
  };
  
  return regionMap[region] || [];
};

export const getLanguageInfo = (code: ATRLanguageCode) => {
  return ATR_LANGUAGES[code];
};

export const isATRLanguage = (code: string): code is ATRLanguageCode => {
  return code in ATR_LANGUAGES;
};
