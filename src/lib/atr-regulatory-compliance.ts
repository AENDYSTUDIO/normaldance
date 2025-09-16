// Регуляторные требования для стран АТР
export interface ATRRegulatoryRequirement {
  id: string;
  country: string;
  category: 'data_protection' | 'financial' | 'content' | 'tax' | 'business' | 'technical';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'compliant' | 'in_progress' | 'pending' | 'not_applicable';
  deadline?: string;
  requirements: string[];
  penalties: string[];
  complianceCost: 'low' | 'medium' | 'high';
  implementationEffort: 'low' | 'medium' | 'high';
  documents: string[];
  contacts: string[];
}

export const ATR_REGULATORY_REQUIREMENTS: ATRRegulatoryRequirement[] = [
  // Китай
  {
    id: 'cn-data-protection',
    country: 'China',
    category: 'data_protection',
    title: 'Personal Information Protection Law (PIPL)',
    description: 'Китайский закон о защите персональных данных',
    priority: 'critical',
    status: 'pending',
    deadline: '2025-03-01',
    requirements: [
      'Получение согласия на обработку данных',
      'Локальное хранение данных в Китае',
      'Назначение ответственного за защиту данных',
      'Проведение оценки воздействия на защиту данных',
      'Уведомление о нарушениях в течение 72 часов'
    ],
    penalties: [
      'Штраф до 50 млн юаней (7.5 млн USD)',
      'Штраф до 5% от годового оборота',
      'Приостановка деятельности',
      'Уголовная ответственность'
    ],
    complianceCost: 'high',
    implementationEffort: 'high',
    documents: ['PIPL Compliance Guide', 'Data Processing Agreement', 'Privacy Policy'],
    contacts: ['CAC (Cyberspace Administration of China)', 'Local legal counsel']
  },
  {
    id: 'cn-financial',
    country: 'China',
    category: 'financial',
    title: 'Financial Services License',
    description: 'Лицензия на финансовые услуги для криптовалютных операций',
    priority: 'critical',
    status: 'pending',
    deadline: '2025-06-01',
    requirements: [
      'Регистрация в качестве финансового учреждения',
      'Минимальный капитал 100 млн юаней',
      'Соответствие требованиям AML/KYC',
      'Локальное присутствие в Китае',
      'Партнерство с местными банками'
    ],
    penalties: [
      'Штраф до 10 млн юаней',
      'Отзыв лицензии',
      'Запрет на деятельность',
      'Уголовная ответственность'
    ],
    complianceCost: 'high',
    implementationEffort: 'high',
    documents: ['Financial License Application', 'AML Policy', 'KYC Procedures'],
    contacts: ['PBOC (People\'s Bank of China)', 'CBIRC', 'Local financial advisor']
  },

  // Япония
  {
    id: 'jp-data-protection',
    country: 'Japan',
    category: 'data_protection',
    title: 'Personal Information Protection Act (PIPA)',
    description: 'Японский закон о защите персональных данных',
    priority: 'high',
    status: 'in_progress',
    deadline: '2025-04-01',
    requirements: [
      'Уведомление о целях использования данных',
      'Получение согласия субъекта данных',
      'Ограничение использования по назначению',
      'Обеспечение безопасности данных',
      'Уведомление о нарушениях'
    ],
    penalties: [
      'Штраф до 1 млн иен (7,500 USD)',
      'Штраф до 6 месяцев лишения свободы',
      'Публичное извинение',
      'Приостановка обработки данных'
    ],
    complianceCost: 'medium',
    implementationEffort: 'medium',
    documents: ['Privacy Policy (Japanese)', 'Data Processing Agreement', 'Consent Forms'],
    contacts: ['Personal Information Protection Commission', 'Local legal counsel']
  },
  {
    id: 'jp-crypto',
    country: 'Japan',
    category: 'financial',
    title: 'Virtual Currency Exchange License',
    description: 'Лицензия на обмен виртуальных валют',
    priority: 'high',
    status: 'pending',
    deadline: '2025-05-01',
    requirements: [
      'Регистрация в FSA',
      'Минимальный капитал 10 млн иен',
      'Соответствие AML требованиям',
      'Система управления рисками',
      'Аудит безопасности'
    ],
    penalties: [
      'Штраф до 3 млн иен',
      'Отзыв лицензии',
      'Приостановка деятельности',
      'Уголовная ответственность'
    ],
    complianceCost: 'medium',
    implementationEffort: 'medium',
    documents: ['FSA Registration', 'AML Policy', 'Risk Management System'],
    contacts: ['Financial Services Agency (FSA)', 'Local compliance officer']
  },

  // Южная Корея
  {
    id: 'kr-data-protection',
    country: 'South Korea',
    category: 'data_protection',
    title: 'Personal Information Protection Act (PIPA)',
    description: 'Корейский закон о защите персональных данных',
    priority: 'high',
    status: 'in_progress',
    deadline: '2025-03-15',
    requirements: [
      'Назначение ответственного за защиту данных',
      'Проведение оценки воздействия на защиту данных',
      'Уведомление о целях обработки',
      'Получение согласия на обработку',
      'Обеспечение права на забвение'
    ],
    penalties: [
      'Штраф до 50 млн вон (37,500 USD)',
      'Штраф до 3% от годового оборота',
      'Приостановка обработки данных',
      'Уголовная ответственность'
    ],
    complianceCost: 'medium',
    implementationEffort: 'medium',
    documents: ['Privacy Policy (Korean)', 'Data Protection Impact Assessment', 'Consent Management'],
    contacts: ['Personal Information Protection Commission', 'Local legal counsel']
  },
  {
    id: 'kr-crypto',
    country: 'South Korea',
    category: 'financial',
    title: 'Virtual Asset Service Provider License',
    description: 'Лицензия поставщика услуг виртуальных активов',
    priority: 'high',
    status: 'pending',
    deadline: '2025-07-01',
    requirements: [
      'Регистрация в FSC',
      'Минимальный капитал 2 млрд вон',
      'Соответствие AML требованиям',
      'Система управления рисками',
      'Страхование ответственности'
    ],
    penalties: [
      'Штраф до 100 млн вон',
      'Отзыв лицензии',
      'Приостановка деятельности',
      'Уголовная ответственность'
    ],
    complianceCost: 'high',
    implementationEffort: 'high',
    documents: ['FSC Registration', 'AML Policy', 'Risk Management Framework'],
    contacts: ['Financial Services Commission (FSC)', 'Local compliance officer']
  },

  // Индия
  {
    id: 'in-data-protection',
    country: 'India',
    category: 'data_protection',
    title: 'Digital Personal Data Protection Act (DPDPA)',
    description: 'Индийский закон о защите цифровых персональных данных',
    priority: 'high',
    status: 'pending',
    deadline: '2025-08-01',
    requirements: [
      'Получение согласия на обработку данных',
      'Уведомление о целях обработки',
      'Обеспечение права на забвение',
      'Назначение ответственного за защиту данных',
      'Проведение оценки воздействия'
    ],
    penalties: [
      'Штраф до 250 крор рупий (30 млн USD)',
      'Штраф до 2% от годового оборота',
      'Приостановка обработки данных',
      'Уголовная ответственность'
    ],
    complianceCost: 'medium',
    implementationEffort: 'medium',
    documents: ['Privacy Policy (Hindi/English)', 'Data Protection Impact Assessment', 'Consent Framework'],
    contacts: ['Data Protection Board', 'Local legal counsel']
  },
  {
    id: 'in-gst',
    country: 'India',
    category: 'tax',
    title: 'Goods and Services Tax (GST)',
    description: 'Налог на товары и услуги',
    priority: 'high',
    status: 'pending',
    deadline: '2025-04-01',
    requirements: [
      'Регистрация GST',
      'Ежемесячная подача деклараций',
      'Ведение учета транзакций',
      'Соблюдение правил выставления счетов',
      'Уплата налогов'
    ],
    penalties: [
      'Штраф до 10,000 рупий',
      'Проценты за просрочку',
      'Приостановка регистрации',
      'Уголовная ответственность'
    ],
    complianceCost: 'low',
    implementationEffort: 'medium',
    documents: ['GST Registration', 'Tax Returns', 'Invoice Templates'],
    contacts: ['GST Department', 'Tax consultant']
  },

  // Сингапур
  {
    id: 'sg-data-protection',
    country: 'Singapore',
    category: 'data_protection',
    title: 'Personal Data Protection Act (PDPA)',
    description: 'Сингапурский закон о защите персональных данных',
    priority: 'high',
    status: 'compliant',
    deadline: '2024-12-01',
    requirements: [
      'Получение согласия на обработку данных',
      'Уведомление о целях обработки',
      'Ограничение использования по назначению',
      'Обеспечение безопасности данных',
      'Уведомление о нарушениях'
    ],
    penalties: [
      'Штраф до 1 млн сингапурских долларов',
      'Штраф до 10% от годового оборота',
      'Приостановка обработки данных',
      'Уголовная ответственность'
    ],
    complianceCost: 'medium',
    implementationEffort: 'medium',
    documents: ['Privacy Policy', 'Data Protection Policy', 'Consent Management'],
    contacts: ['Personal Data Protection Commission', 'Local legal counsel']
  },
  {
    id: 'sg-crypto',
    country: 'Singapore',
    category: 'financial',
    title: 'Payment Services Act License',
    description: 'Лицензия на платежные услуги',
    priority: 'high',
    status: 'in_progress',
    deadline: '2025-02-01',
    requirements: [
      'Регистрация в MAS',
      'Минимальный капитал 100,000 SGD',
      'Соответствие AML требованиям',
      'Система управления рисками',
      'Аудит безопасности'
    ],
    penalties: [
      'Штраф до 1 млн SGD',
      'Отзыв лицензии',
      'Приостановка деятельности',
      'Уголовная ответственность'
    ],
    complianceCost: 'medium',
    implementationEffort: 'medium',
    documents: ['MAS Registration', 'AML Policy', 'Risk Management Framework'],
    contacts: ['Monetary Authority of Singapore (MAS)', 'Local compliance officer']
  }
];

export const getRequirementsByCountry = (country: string): ATRRegulatoryRequirement[] => {
  return ATR_REGULATORY_REQUIREMENTS.filter(req => req.country === country);
};

export const getRequirementsByCategory = (category: string): ATRRegulatoryRequirement[] => {
  return ATR_REGULATORY_REQUIREMENTS.filter(req => req.category === category);
};

export const getRequirementsByPriority = (priority: string): ATRRegulatoryRequirement[] => {
  return ATR_REGULATORY_REQUIREMENTS.filter(req => req.priority === priority);
};

export const getRequirementsByStatus = (status: string): ATRRegulatoryRequirement[] => {
  return ATR_REGULATORY_REQUIREMENTS.filter(req => req.status === status);
};

export const getComplianceSummary = () => {
  const total = ATR_REGULATORY_REQUIREMENTS.length;
  const compliant = ATR_REGULATORY_REQUIREMENTS.filter(req => req.status === 'compliant').length;
  const inProgress = ATR_REGULATORY_REQUIREMENTS.filter(req => req.status === 'in_progress').length;
  const pending = ATR_REGULATORY_REQUIREMENTS.filter(req => req.status === 'pending').length;
  const critical = ATR_REGULATORY_REQUIREMENTS.filter(req => req.priority === 'critical').length;
  
  return {
    total,
    compliant,
    inProgress,
    pending,
    critical,
    complianceRate: Math.round((compliant / total) * 100)
  };
};

export const getUpcomingDeadlines = (days: number = 90): ATRRegulatoryRequirement[] => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return ATR_REGULATORY_REQUIREMENTS.filter(req => {
    if (!req.deadline) return false;
    const deadline = new Date(req.deadline);
    return deadline >= now && deadline <= futureDate;
  }).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
};

export const getComplianceCost = (): { low: number; medium: number; high: number } => {
  return {
    low: ATR_REGULATORY_REQUIREMENTS.filter(req => req.complianceCost === 'low').length,
    medium: ATR_REGULATORY_REQUIREMENTS.filter(req => req.complianceCost === 'medium').length,
    high: ATR_REGULATORY_REQUIREMENTS.filter(req => req.complianceCost === 'high').length
  };
};
