// Система управления партнерствами в АТР
export interface ATRPartnership {
  id: string;
  name: string;
  type: 'record_label' | 'payment_provider' | 'distribution' | 'marketing' | 'technology' | 'regulatory' | 'content';
  country: string;
  region: string;
  status: 'active' | 'negotiating' | 'pending' | 'inactive' | 'potential';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  benefits: string[];
  requirements: string[];
  contactInfo: {
    company: string;
    contactPerson: string;
    email: string;
    phone: string;
    website: string;
  };
  dealValue: {
    min: number;
    max: number;
    currency: string;
  };
  timeline: {
    start: string;
    end?: string;
    milestones: string[];
  };
  successMetrics: string[];
  risks: string[];
  documents: string[];
  notes: string;
}

export const ATR_PARTNERSHIPS: ATRPartnership[] = [
  // Китай
  {
    id: 'tencent-music',
    name: 'Tencent Music Entertainment',
    type: 'record_label',
    country: 'China',
    region: 'East Asia',
    status: 'potential',
    priority: 'critical',
    description: 'Крупнейший музыкальный лейбл Китая с 800+ млн пользователей',
    benefits: [
      'Доступ к крупнейшей музыкальной библиотеке Китая',
      'Интеграция с WeChat и QQ Music',
      'Локальная экспертиза и контент',
      'Маркетинговая поддержка'
    ],
    requirements: [
      'Соответствие китайским регуляторным требованиям',
      'Локальное присутствие в Китае',
      'Партнерство с местными банками',
      'Перевод контента на китайский'
    ],
    contactInfo: {
      company: 'Tencent Music Entertainment',
      contactPerson: 'Li Wei',
      email: 'partnerships@tencentmusic.com',
      phone: '+86-21-1234-5678',
      website: 'https://music.tencent.com'
    },
    dealValue: {
      min: 1000000,
      max: 5000000,
      currency: 'USD'
    },
    timeline: {
      start: '2025-03-01',
      end: '2025-12-31',
      milestones: [
        'Подписание LOI',
        'Техническая интеграция',
        'Контентная интеграция',
        'Запуск пилота',
        'Полный запуск'
      ]
    },
    successMetrics: [
      '1M+ активных пользователей в Китае',
      '10M+ прослушиваний в месяц',
      '50+ артистов на платформе',
      '1M+ USD выручки в год'
    ],
    risks: [
      'Регуляторные ограничения',
      'Конкуренция с местными игроками',
      'Культурные различия',
      'Технические сложности интеграции'
    ],
    documents: ['Partnership Proposal', 'Technical Integration Plan', 'Financial Projections'],
    notes: 'Критически важный партнер для входа на китайский рынок'
  },
  {
    id: 'alipay-integration',
    name: 'Alipay Payment Integration',
    type: 'payment_provider',
    country: 'China',
    region: 'East Asia',
    status: 'negotiating',
    priority: 'critical',
    description: 'Интеграция с крупнейшей платежной системой Китая',
    benefits: [
      'Доступ к 1.3B пользователям Alipay',
      'Быстрые и безопасные платежи',
      'Локальная валюта (CNY)',
      'Интеграция с экосистемой Alibaba'
    ],
    requirements: [
      'Лицензия на финансовые услуги в Китае',
      'Соответствие требованиям PBOC',
      'Локальное хранение данных',
      'Аудит безопасности'
    ],
    contactInfo: {
      company: 'Ant Financial (Alipay)',
      contactPerson: 'Zhang Ming',
      email: 'partnerships@antfin.com',
      phone: '+86-571-1234-5678',
      website: 'https://www.alipay.com'
    },
    dealValue: {
      min: 500000,
      max: 2000000,
      currency: 'USD'
    },
    timeline: {
      start: '2025-02-01',
      end: '2025-08-31',
      milestones: [
        'Техническая оценка',
        'Подписание соглашения',
        'Разработка интеграции',
        'Тестирование',
        'Запуск'
      ]
    },
    successMetrics: [
      '95%+ успешных транзакций',
      '<2 сек время обработки',
      '99.9% uptime',
      '0 критических инцидентов'
    ],
    risks: [
      'Строгие регуляторные требования',
      'Высокие комиссии',
      'Зависимость от одной платформы',
      'Технические ограничения'
    ],
    documents: ['Payment Integration Agreement', 'Security Audit Report', 'Compliance Certificate'],
    notes: 'Необходимо для успешного монетизирования в Китае'
  },

  // Япония
  {
    id: 'sony-music-japan',
    name: 'Sony Music Entertainment Japan',
    type: 'record_label',
    country: 'Japan',
    region: 'East Asia',
    status: 'potential',
    priority: 'high',
    description: 'Ведущий музыкальный лейбл Японии с богатой историей',
    benefits: [
      'Доступ к японской музыкальной библиотеке',
      'Эксклюзивный контент J-pop',
      'Локальная маркетинговая поддержка',
      'Связи с японскими артистами'
    ],
    requirements: [
      'Соответствие японским законам о защите данных',
      'Локализация на японский язык',
      'Интеграция с японскими платежными системами',
      'Культурная адаптация контента'
    ],
    contactInfo: {
      company: 'Sony Music Entertainment Japan',
      contactPerson: 'Tanaka Hiroshi',
      email: 'partnerships@sonymusic.co.jp',
      phone: '+81-3-1234-5678',
      website: 'https://www.sonymusic.co.jp'
    },
    dealValue: {
      min: 500000,
      max: 2500000,
      currency: 'USD'
    },
    timeline: {
      start: '2025-04-01',
      end: '2025-10-31',
      milestones: [
        'Встреча с руководством',
        'Подписание LOI',
        'Техническая интеграция',
        'Контентная интеграция',
        'Запуск'
      ]
    },
    successMetrics: [
      '500K+ пользователей в Японии',
      '5M+ прослушиваний в месяц',
      '100+ японских артистов',
      '500K+ USD выручки в год'
    ],
    risks: [
      'Высокие лицензионные платежи',
      'Конкуренция с местными платформами',
      'Языковые барьеры',
      'Культурные особенности'
    ],
    documents: ['Partnership Proposal', 'Content Licensing Agreement', 'Marketing Plan'],
    notes: 'Важный партнер для входа на японский рынок'
  },

  // Южная Корея
  {
    id: 'hybe-corporation',
    name: 'HYBE Corporation',
    type: 'record_label',
    country: 'South Korea',
    region: 'East Asia',
    status: 'potential',
    priority: 'high',
    description: 'Крупнейший музыкальный лейбл Кореи, дом BTS и других K-pop артистов',
    benefits: [
      'Доступ к эксклюзивному K-pop контенту',
      'Глобальная аудитория K-pop фанатов',
      'Инновационные технологии',
      'Сильная маркетинговая машина'
    ],
    requirements: [
      'Соответствие корейским регуляторным требованиям',
      'Интеграция с корейскими платежными системами',
      'Локализация на корейский язык',
      'Понимание K-pop культуры'
    ],
    contactInfo: {
      company: 'HYBE Corporation',
      contactPerson: 'Kim Min-jun',
      email: 'partnerships@hybecorp.com',
      phone: '+82-2-1234-5678',
      website: 'https://www.hybecorp.com'
    },
    dealValue: {
      min: 1000000,
      max: 3000000,
      currency: 'USD'
    },
    timeline: {
      start: '2025-05-01',
      end: '2025-11-30',
      milestones: [
        'Презентация платформы',
        'Подписание LOI',
        'Техническая интеграция',
        'Контентная интеграция',
        'Запуск'
      ]
    },
    successMetrics: [
      '1M+ пользователей в Корее',
      '10M+ прослушиваний в месяц',
      '50+ K-pop артистов',
      '1M+ USD выручки в год'
    ],
    risks: [
      'Очень высокая конкуренция',
      'Сложные лицензионные соглашения',
      'Высокие ожидания фанатов',
      'Быстро меняющиеся тренды'
    ],
    documents: ['Partnership Proposal', 'K-pop Content Strategy', 'Fan Engagement Plan'],
    notes: 'Критически важен для успеха в K-pop сегменте'
  },

  // Индия
  {
    id: 't-series',
    name: 'T-Series',
    type: 'record_label',
    country: 'India',
    region: 'South Asia',
    status: 'potential',
    priority: 'high',
    description: 'Крупнейший музыкальный лейбл Индии с миллиардами просмотров на YouTube',
    benefits: [
      'Доступ к крупнейшей индийской музыкальной библиотеке',
      'Болливуд и региональный контент',
      'Огромная аудитория',
      'Локальная экспертиза'
    ],
    requirements: [
      'Соответствие индийским регуляторным требованиям',
      'Поддержка множественных языков',
      'Интеграция с UPI платежами',
      'Понимание региональных предпочтений'
    ],
    contactInfo: {
      company: 'T-Series',
      contactPerson: 'Rajesh Kumar',
      email: 'partnerships@tseries.com',
      phone: '+91-11-1234-5678',
      website: 'https://www.tseries.com'
    },
    dealValue: {
      min: 750000,
      max: 2000000,
      currency: 'USD'
    },
    timeline: {
      start: '2025-06-01',
      end: '2025-12-31',
      milestones: [
        'Встреча с руководством',
        'Подписание LOI',
        'Техническая интеграция',
        'Контентная интеграция',
        'Запуск'
      ]
    },
    successMetrics: [
      '2M+ пользователей в Индии',
      '20M+ прослушиваний в месяц',
      '200+ индийских артистов',
      '2M+ USD выручки в год'
    ],
    risks: [
      'Сложная регуляторная среда',
      'Множественные языки и культуры',
      'Низкая монетизация',
      'Пиратство контента'
    ],
    documents: ['Partnership Proposal', 'Multi-language Strategy', 'Regional Content Plan'],
    notes: 'Ключевой партнер для индийского рынка'
  },

  // Сингапур
  {
    id: 'grab-partnership',
    name: 'Grab Partnership',
    type: 'distribution',
    country: 'Singapore',
    region: 'Southeast Asia',
    status: 'active',
    priority: 'medium',
    description: 'Партнерство с крупнейшей супер-апп Юго-Восточной Азии',
    benefits: [
      'Доступ к 50M+ пользователям Grab',
      'Интеграция с GrabPay',
      'Локальная маркетинговая поддержка',
      'Кросс-промоция услуг'
    ],
    requirements: [
      'Интеграция с Grab API',
      'Соответствие требованиям Grab',
      'Локальная поддержка',
      'Техническая совместимость'
    ],
    contactInfo: {
      company: 'Grab Holdings Limited',
      contactPerson: 'Sarah Lim',
      email: 'partnerships@grab.com',
      phone: '+65-6123-4567',
      website: 'https://www.grab.com'
    },
    dealValue: {
      min: 200000,
      max: 800000,
      currency: 'USD'
    },
    timeline: {
      start: '2024-12-01',
      end: '2025-06-30',
      milestones: [
        'Подписание соглашения',
        'Техническая интеграция',
        'Тестирование',
        'Запуск пилота',
        'Полный запуск'
      ]
    },
    successMetrics: [
      '100K+ пользователей через Grab',
      '1M+ прослушиваний в месяц',
      '10%+ конверсия в платные подписки',
      '500K+ USD выручки в год'
    ],
    risks: [
      'Зависимость от одной платформы',
      'Конкуренция с другими сервисами',
      'Технические ограничения',
      'Изменения в политике Grab'
    ],
    documents: ['Partnership Agreement', 'Technical Integration Guide', 'Marketing Collaboration Plan'],
    notes: 'Успешное партнерство для входа в ЮВА'
  }
];

export const getPartnershipsByCountry = (country: string): ATRPartnership[] => {
  return ATR_PARTNERSHIPS.filter(partnership => partnership.country === country);
};

export const getPartnershipsByType = (type: string): ATRPartnership[] => {
  return ATR_PARTNERSHIPS.filter(partnership => partnership.type === type);
};

export const getPartnershipsByStatus = (status: string): ATRPartnership[] => {
  return ATR_PARTNERSHIPS.filter(partnership => partnership.status === status);
};

export const getPartnershipsByPriority = (priority: string): ATRPartnership[] => {
  return ATR_PARTNERSHIPS.filter(partnership => partnership.priority === priority);
};

export const getPartnershipSummary = () => {
  const total = ATR_PARTNERSHIPS.length;
  const active = ATR_PARTNERSHIPS.filter(p => p.status === 'active').length;
  const negotiating = ATR_PARTNERSHIPS.filter(p => p.status === 'negotiating').length;
  const potential = ATR_PARTNERSHIPS.filter(p => p.status === 'potential').length;
  const critical = ATR_PARTNERSHIPS.filter(p => p.priority === 'critical').length;
  
  return {
    total,
    active,
    negotiating,
    potential,
    critical,
    successRate: Math.round((active / total) * 100)
  };
};

export const getUpcomingMilestones = (days: number = 90): ATRPartnership[] => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return ATR_PARTNERSHIPS.filter(partnership => {
    return partnership.timeline.milestones.some(milestone => {
      // This is a simplified check - in reality you'd have milestone dates
      return true; // For demo purposes, return all partnerships
    });
  });
};

export const getPartnershipValue = (): { total: number; byCountry: Record<string, number> } => {
  const total = ATR_PARTNERSHIPS.reduce((sum, p) => sum + p.dealValue.max, 0);
  const byCountry: Record<string, number> = {};
  
  ATR_PARTNERSHIPS.forEach(partnership => {
    if (!byCountry[partnership.country]) {
      byCountry[partnership.country] = 0;
    }
    byCountry[partnership.country] += partnership.dealValue.max;
  });
  
  return { total, byCountry };
};
