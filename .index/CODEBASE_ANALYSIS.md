# NORMALDANCE 0.5.0 - Комплексный анализ кодовой базы

## 📊 Обзор проекта

**Версия**: 0.5.0  
**Тип**: Web3 музыкальная платформа (Next.js + Solana + IPFS)  
**Размер кодовой базы**: 579 TypeScript файлов (~6.6 МБ src/)  
**Язык**: TypeScript/React  
**Статус**: Production-ready

---

## 🏗️ Архитектура проекта

### Основная структура

```
NORMALDANCE 0.5.0/
├── src/
│   ├── app/                    # Next.js приложение (App Router)
│   ├── components/             # React компоненты (35+ категорий)
│   ├── lib/                    # Бизнес-логика и утилиты
│   ├── types/                  # TypeScript типы
│   ├── hooks/                  # React хуки
│   ├── utils/                  # Утилиты
│   ├── mcp/                    # Model Context Protocol серверы
│   ├── middleware.ts           # Next.js middleware
│   └── middleware/             # Кастомный middleware
├── server.ts                   # Кастомный Node.js сервер (Socket.IO)
├── prisma/                     # ORM схема и миграции
├── contracts/                  # Anchor программы (Solana)
├── mobile-app/                 # React Native приложение
├── docker/                     # Docker конфиги
├── k8s/                        # Kubernetes манифесты
├── scripts/                    # Вспомогательные скрипты
└── docs/                       # Документация
```

---

## 📁 Структура компонентов (35+ категорий)

### UI & Layout
- **components/ui/** - Radix UI компоненты
- **components/icons/** - Иконки
- **components/layout/** - Раскладки страниц

### Функциональные модули
- **components/wallet/** - Wallet адаптеры (Phantom, Invisible Wallet)
- **components/auth/** - Аутентификация
- **components/payment/** - Платежные системы
- **components/nft/** - NFT функциональность (TrackNFT)
- **components/music/** - Музыкальные компоненты
- **components/tracks/** - Управление треками
- **components/grave/** - G.rave 2.0 мемориалы
- **components/dao/** - DAO управление
- **components/dex/** - DEX торговля
- **components/staking/** - Стейкинг
- **components/rewards/** - Награды

### Интеграции
- **components/telegram/** - Telegram интеграция
- **components/integrations/** - API интеграции
- **components/ai/** - AI рекомендации
- **components/chat/** - Чат функциональность
- **components/recommendations/** - Рекомендательная система

### Дополнительно
- **components/gamification/** - Геймификация
- **components/profile/** - Профиль пользователя
- **components/notifications/** - Уведомления
- **components/stats/** - Статистика
- **components/transactions/** - Транзакции
- **components/anti-pirate/** - Защита от пиратства
- **components/memorials/** - NFT мемориалы
- **components/clubs/** - Клубы и сообщества
- **components/discovery/** - Поиск и открытие
- **components/audio/** - Аудио обработка
- **components/atr/** - ATR контент-стратегия
- **components/accessibility/** - Доступность
- **components/i18n/** - Интернационализация
- **components/lazy/** - Ленивая загрузка
- **components/testing/** - Тестовые компоненты

---

## 📚 Библиотека lib/ - Критические модули

### Ядро приложения
- **db.ts** - Глобальный Prisma инстанс с шардингом
- **socket.ts** - Socket.IO клиент
- **auth.ts** - NextAuth конфигурация
- **logger.ts** - Winston логирование
- **jwt.ts** - JWT токены

### Web3 интеграции
- **solana-pay.ts / solana-pay-enhanced.ts** - Solana Pay платежи
- **ton-connect-service.ts** - TON Connect интеграция
- **deflationary-model.ts** - 2% burn механика
- **wallet/** - Wallet адаптеры
- **web3/** - Web3 сервисы

### Хранилище данных
- **ipfs-enhanced.ts** - IPFS с мультишлюзами
- **ipfs-helia-adapter.ts** - Helia адаптер
- **filecoin-service.ts** - Filecoin интеграция
- **qdrant-service.ts** - Vector DB для поиска

### Специализированные сервисы
- **grave/** - G.rave 2.0 функциональность
- **aml-kyc/** - AML/KYC проверки (Chainalysis)
- **travel-rule/** - Travel Rule compliance
- **series-a-funding.ts** - Series A инвестиции
- **telegram-integration-2025.ts** - Telegram интеграция
- **ai-recommendation-system.ts** - AI рекомендации
- **music-analytics.ts** - Аналитика музыки
- **dao-governance.ts** - DAO управление
- **rbac.ts** - Role-based access control

### Безопасность & Мониторинг
- **security/** - Модули безопасности
- **monitoring/** - Мониторинг приложения
- **error-reporting.ts** - Error tracking (Sentry)
- **sentry-integration.ts** - Sentry интеграция
- **performance-optimizer.ts** - Оптимизация производительности

### Конфигурация & Утилиты
- **config/** - Конфигурационные файлы
- **middleware/** - Express middleware
- **schemas/** - Validation schemas (Zod/AJV)
- **utils/** - Общие утилиты
- **validation/** - Валидация данных
- **i18n/** - Интернационализация

---

## 🔌 API маршруты (src/app/api/)

### Аутентификация & Безопасность
- `/api/auth/[...nextauth]` - NextAuth endpoints
- `/api/auth/signup` - Регистрация
- `/api/kyc/sumsub/webhook` - KYC webhook
- `/api/chainalysis/*` - AML проверки

### Web3 & Blockchain
- `/api/solana/*` - Solana интеграции
- `/api/wallet/*` - Wallet операции
- `/api/nft/*` - NFT минт/трансфер/бурн
- `/api/dex/*` - DEX торговля (AMM)
- `/api/rewards/*` - Reward система

### Основной функционал
- `/api/tracks/*` - Управление треками
- `/api/music/*` - Музыкальная аналитика
- `/api/artists/[id]/analytics` - Artist анализ
- `/api/clubs/*` - Клубы/сообщества
- `/api/messages/*` - Мессендж система

### Хранилище & IPFS
- `/api/ipfs/upload` - Загрузка на IPFS
- `/api/ipfs/monitor` - Мониторинг IPFS
- `/api/filecoin/*` - Filecoin интеграции
- `/api/redundancy/*` - Redundancy система

### Платежи & Интеграции
- `/api/stripe/*` - Stripe платежи
- `/api/payment/*` - Платежные системы
- `/api/telegram/*` - Telegram интеграция
- `/api/chat/*` - Chat система
- `/api/notifications/*` - Уведомления

### Специальное
- `/api/grave/donations` - G.rave пожертвования
- `/api/grave/memorials` - G.rave мемориалы
- `/api/anti-pirate/*` - Защита от пиратства
- `/api/travel-rule/*` - Travel Rule
- `/api/health` - Health check
- `/api/graphql` - GraphQL endpoint

### Разработка & Утилиты
- `/api/qdrant/index-codebase` - Индексирование кода
- `/api/qdrant/search-code` - Поиск кода
- `/api/docs` - API документация
- `/api/analytics/dashboard` - Аналитика

---

## 🎯 App Router маршруты (src/app/)

### Основные страницы
- `/` - Главная (Landing)
- `/auth/*` - Аутентификация
- `/profile/*` - Профиль пользователя
- `/wallet/*` - Wallet интерфейс
- `/upload/*` - Загрузка музыки

### Функциональные разделы
- `/tracks/*` - Библиотека треков
- `/music-dex/*` - Музыкальный DEX
- `/nft/*` - NFT галерея
- `/memorials/*` - NFT мемориалы
- `/clubs/*` - Сообщества

### Business разделы
- `/grave/*` - G.rave 2.0 платформа
- `/invest/*` - Investor relations ($50,000+)
- `/ton-grant/*` - TON Grant ($50,000)
- `/telegram-partnership/*` - Telegram партнерство
- `/telegram-app/*` - Telegram мини-приложение

### Стратегические странице
- `/atr-demo/*` - ATR демонстрация
- `/atr-strategy/*` - ATR стратегия
- `/risk-management/*` - Risk management
- `/innovations-2025/*` - Инновации 2025
- `/admin/monitoring/*` - Admin мониторинг

---

## 🔐 Критические модули по AGENTS.md

### Обязательные правила

1. **Database**: Глобальный Prisma инстанс в `src/lib/db.ts` (НИКОГДА не создавать новые)
2. **Socket.IO**: Кастомный сервер `/api/socketio` в `server.ts` (НЕ `/socket.io`)
3. **Invisible Wallet**: Биометрическая аутентификация в `src/components/wallet/wallet-adapter.tsx`
4. **Deflationary модель**: 2% burn всех транзакций в `src/lib/deflationary-model.ts`
5. **IPFS архитектура**: Мультишлюзовая репликация в `src/lib/ipfs-enhanced.ts`
6. **ESLint**: ОТКЛЮЧЕН для Web3 компатибильности
7. **TypeScript**: `noImplicitAny: false`, `no-non-null-assertion: off`
8. **Program IDs**: Фиксированные `NDT_PROGRAM_ID`, `TRACKNFT_PROGRAM_ID`, `STAKING_PROGRAM_ID`

---

## 📦 Зависимости (ключевые)

### Frontend фреймворки
- **next@15.5.6** - React фреймворк
- **react@19.2.0** - UI библиотека
- **react-dom@19.2.0** - DOM рендеринг

### Web3 экосистема
- **@solana/web3.js@1.98.4** - Solana блокчейн
- **@solana/wallet-adapter-react@0.15.39** - Wallet адаптер
- **ethers@6.15.0** - EVM интеграции
- **@ton/ton@15.4.0** - TON блокчейн
- **@tonconnect/ui-react@2.3.1** - TON Connect
- **@solana/spl-token@0.4.14** - SPL токены
- **@solana/pay@0.2.6** - Solana Pay

### Storage & IPFS
- **helia@4.2.2** - IPFS реализация
- **@helia/unixfs@6.0.1** - Unix FS для IPFS
- **@pinata/sdk@2.1.0** - Pinata интеграция
- **@upstash/vector@1.2.2** - Vector DB

### БД & ORM
- **@prisma/client@6.17.1** - ORM
- **prisma@5.0.0** - ORM CLI
- **redis@4.6.0** - Redis клиент
- **ioredis@5.8.1** - Redis альтернатива
- **@qdrant/js-client-rest@1.15.1** - Vector DB

### API & интеграции
- **@apollo/client@4.0.9** - GraphQL клиент
- **socket.io@4.8.1** - WebSocket сервер
- **socket.io-client@4.8.1** - WebSocket клиент
- **stripe@14.0** - Платежи
- **@modelcontextprotocol/sdk@1.20.1** - MCP SDK

### UI & Стили
- **@radix-ui/* - Компоненты UI (15+ пакетов)
- **tailwindcss@4.1.13** - Utility CSS
- **framer-motion@12.23.24** - Анимации
- **lucide-react@0.544.0** - Иконки
- **recharts@3.2.1** - Графики
- **three@0.160.0** - 3D графика

### Аутентификация & Security
- **next-auth@4.24.11** - Authentication
- **bcryptjs@3.0.2** - Хеширование
- **jsonwebtoken@9.0.0** - JWT токены
- **helmet@8.0.0** - Security headers
- **siwe@3.0.0** - Sign In with Ethereum
- **tweetnacl@1.0.3** - Криптография

### Утилиты
- **date-fns@4.1.0** - Даты
- **react-hook-form@7.62.0** - Form управление
- **zod** / **ajv@8.6.0** - Валидация
- **zustand@5.0.8** - State management
- **@tanstack/react-query@5.90.6** - Data fetching
- **winston@3.17.0** - Логирование
- **dotenv@17.2.3** - Env конфиги

---

## 🧪 Тестирование

### Конфигурация
- **jest.config.js** - Jest конфиг
- **jest.config.coverage.js** - Coverage конфиг
- **playwright.config.ts** - E2E тесты
- **mobile-app/jest.setup.js** - Mobile моки (30 сек таймаут)

### Команды
```bash
npm test                           # Все тесты
npm test -- --testPathPattern="filename.test.ts"  # Конкретный файл
npm run test:coverage              # Coverage отчет
npm run test:performance           # K6 нагрузочные
npm run test:unit                  # Unit тесты
npm run test:integration           # Integration тесты
npm run test:e2e                   # E2E Playwright
```

---

## 🚀 Build & Deploy команды

### Development
```bash
npm run dev                    # nodemon + tsx (не стандартный Next.js)
npm run mcp:dev               # tsx watch MCP сервер
```

### Production
```bash
npm run build                  # Next.js отключен, используется tsx
npm run start                  # Production сервер
npm run deploy:production      # Полное развертывание
```

### MCP Server
```bash
npm run mcp:start             # Node процесс
npm run mcp:dev               # Hot reload разработка
```

---

## 🗂️ Типы данных (src/types/)

- **api.ts** - API интерфейсы
- **wallet.ts** - Wallet типы
- **telegram.ts** - Telegram типы
- **ipfs.ts** - IPFS типы
- **task-system.ts** - Task система
- **test-system.ts** - Тестирование
- **global.d.ts** - Глобальные типы
- **fixes.d.ts** - Фиксы типов

---

## 🪝 React хуки (src/hooks/)

- **use-i18n.ts** - Интернационализация
- **use-mobile.ts** - Мобильная детекция
- **use-mobile-safe.ts** - Безопасная мобильная
- **use-stats.ts** - Статистика
- **use-telegram-stars.ts** - Telegram Stars
- **use-toast.ts** - Notifications
- **use-ton-wallet.ts** - TON кошелек
- **useEvmWallet.ts** - EVM кошелек
- **useNetworkStatus.ts** - Статус сети

---

## 📡 MCP интеграции (src/mcp/)

- **server.ts** - Основной MCP сервер
- **telegram-bot.ts** - Telegram бот

### Провайдеры
- **providers/** - MCP провайдеры для AI интеграций

---

## 📊 Статистика проекта

| Метрика | Значение |
|---------|----------|
| TS/TSX файлов | 579 |
| Размер src/ | 6.6 МБ |
| Размер contracts/ | 90 МБ |
| node_modules | 2.4 ГБ |
| Компонент категорий | 35+ |
| API маршрутов | 40+ |
| App маршрутов | 20+ |
| Lib модулей | 50+ |
| Dependencies | 150+ основных |
| DevDependencies | 40+ |

---

## 🔄 Критические зависимости в порядке важности

### Tier 1 (Критические)
1. **@prisma/client** - ORM (БД)
2. **@solana/web3.js** - Blockchain
3. **next** - Фреймворк
4. **react** - UI библиотека
5. **socket.io** - WebSocket

### Tier 2 (Важные)
6. **helia** - IPFS
7. **@ton/ton** - TON blockchain
8. **@apollo/client** - GraphQL
9. **next-auth** - Auth
10. **@radix-ui/** - UI компоненты

### Tier 3 (Функциональные)
11. **ethers** - EVM
12. **stripe** - Платежи
13. **winston** - Логирование
14. **zustand** - State
15. **@tanstack/react-query** - Data

---

## 📋 Структура конфигурации

### TypeScript
- **tsconfig.json** - Главный конфиг
- **tsconfig.app.json** - App конфиг
- **tsconfig.prod.json** - Production конфиг
- Path aliases для всех модулей

### Build & Server
- **next.config.ts** - Next.js конфиг
- **server.ts** - Кастомный сервер
- **webpack.analyzer.js** - Bundle анализ

### Styling
- **tailwind.config.ts** - Tailwind
- **postcss.config.mjs** - PostCSS
- **components.json** - Component registry

### Testing
- **jest.config.js** - Jest
- **jest.setup.js** - Jest setup
- **playwright.config.ts** - Playwright

### Linting & Formatting
- **.eslintrc.json** - ESLint (отключен для Web3)
- **eslint.config.mjs** - ESLint модули

### Docker & Deployment
- **Dockerfile** - Production образ
- **docker-compose.yml** - Compose конфиг
- **vercel.json** - Vercel конфиг

---

## 🔍 Ключевые файлы для изучения

### Начните с:
1. `/src/app/layout.tsx` - Главный layout
2. `/src/lib/db.ts` - Database конфиг
3. `/server.ts` - Socket.IO сервер
4. `/src/components/providers.tsx` - App провайдеры
5. `/src/lib/nextauth-config.ts` - Auth конфиг

### Затем изучите:
6. `/src/app/(landing)/page.tsx` - Главная страница
7. `/src/components/wallet/wallet-adapter.tsx` - Wallet интеграция
8. `/src/lib/deflationary-model.ts` - Tokenomics
9. `/src/lib/ipfs-enhanced.ts` - IPFS система
10. `/src/app/api/solana/*` - Solana интеграции

### Специализированное:
11. `/src/lib/grave/*` - G.rave 2.0
12. `/src/lib/telegram-integration-2025.ts` - Telegram
13. `/src/lib/ai-recommendation-system.ts` - AI
14. `/src/components/payment-gateway.tsx` - Платежи
15. `/src/mcp/server.ts` - MCP интеграции

---

## ⚙️ Система конфигураций (src/config/)

### Основные конфиги
- `index.ts` - Главная конфигурация
- `blockchain.ts` - Blockchain параметры
- `database.ts` - БД настройки
- `ipfs.ts` - IPFS конфиг
- `auth.ts` - Auth параметры
- `api.ts` - API endpoints
- `payment.ts` - Payment гейтвеи
- `monitoring.ts` - Monitoring конфиг

---

## 📊 Performance & Monitoring

### Интеграции
- **Sentry** - Error tracking
- **Prometheus + Grafana** - Metrics
- **Winston** - Логирование
- **Performance Monitor** - Custom metrics
- **Web Vitals** - Core Web Vitals

### Команды мониторинга
```bash
npm run monitoring              # Запуск мониторинга
npm run check:imports          # Проверка импортов
npm run security:audit         # Audit dependencies
npm run performance:analyze    # Bundle анализ
```

---

## 🛡️ Security модули (src/lib/security/)

- AML/KYC проверки (Chainalysis)
- Travel Rule compliance
- RBAC система
- JWT механика
- Helmet security headers
- Rate limiting
- CORS конфигурация

---

## 📝 Интернационализация (i18n)

- **src/lib/i18n/** - i18n конфиги
- **src/components/i18n/** - i18n компоненты
- Русская локаль по умолчанию
- Форматирование SOL сумм через `formatSol()`

---

## 🎮 Gamification система

- **src/components/gamification/** - Компоненты
- Achievements система
- Leaderboards
- Reward система
- Task tracking

---

## 📡 API документация

### GraphQL
- Endpoint: `/api/graphql`
- Apollo Server конфиг

### REST
- Swagger документация: `/api/docs`
- Автогенерация из кода

### WebSocket
- Socket.IO: `/api/socketio`
- Real-time события

---

## 🚀 Deployment архитектура

### Docker
- Multi-stage builds
- Optimized production images
- Environment-specific configs

### Kubernetes
- Helm charts
- GitOps с Argo CD
- Service mesh ready

### CI/CD
- GitHub Actions
- GitLab CI
- Automated testing & deployment

---

## 🔗 Интеграции третьих сторон

| Сервис | Назначение | Статус |
|--------|-----------|--------|
| Solana | Blockchain | ✅ Active |
| TON | Blockchain | ✅ Active |
| Ethereum | Blockchain | ✅ Via Ethers |
| IPFS/Helia | Storage | ✅ Active |
| Pinata | IPFS pinning | ✅ Active |
| Filecoin | Archival | ✅ Active |
| Stripe | Payments | ✅ Active |
| Telegram | Messaging | ✅ Active |
| Supabase | Auth | ✅ Available |
| Sentry | Monitoring | ✅ Active |
| Chainalysis | AML/KYC | ✅ Active |
| Qdrant | Vector DB | ✅ Active |

---

## 💾 Database архитектура

### ORM
- Prisma v6.17.1
- Шардинг поддержка
- Миграции с Flyway

### Кеш
- Redis/ioredis
- Socket.IO адаптер

### Vector DB
- Qdrant для embeddings
- Code индексирование
- Semantic поиск

---

## 🎯 Критические метрики кода

### Сложность
- Большой проект (579 файлов)
- Модульная архитектура
- Четкое разделение ответственности

### Качество
- TypeScript strict mode
- Comprehensive testing
- Security focus

### Масштабируемость
- Database шардинг
- IPFS шлюзы мультиплекс
- Redis кеширование
- CDN ready

---

## 🔄 Workflow команды разработки

### Feature разработка
```bash
npm run git:feature:create         # Create feature branch
npm run pr:create                  # Create PR
```

### Hotfix
```bash
npm run git:hotfix:create          # Create hotfix
npm run pr:create --base main      # Create PR to main
```

### Promotion
```bash
npm run git:promote:dev-to-staging  # dev → staging
npm run git:promote:staging-to-main # staging → main
```

---

## 📚 Documentation (docs/)

- DEPLOYMENT_GUIDE.md - Развертывание
- CI_CD_GUIDE.md - Pipeline
- DEVELOPMENT_GUIDE.md - Development
- API_DOCUMENTATION.md - API
- MONITORING_GUIDE.md - Мониторинг
- EXAMPLES_GUIDE.md - Примеры

---

## 🎓 Ключевые понятия

### Web3 специфика
- **Deflationary модель** - 2% burn
- **Invisible Wallet** - Биометрическая аутентификация
- **TrackNFT** - Музыкальные NFT
- **G.rave 2.0** - Memorial NFT платформа
- **Smart Orders** - Advanced DEX orders

### Бизнес модель
- **Series A funding** - Инвестиции
- **TON Grant** - $50,000 грант
- **Investor Relations** - `/invest`
- **Telegram Partnership** - Интеграция
- **ATR Strategy** - Content strategy

### Technical Excellence
- **MCP Integration** - AI агент поддержка
- **Redundancy Service** - Failover система
- **RBAC System** - Access control
- **Performance Optimizer** - Optimization

---

## 🔗 Быстрые ссылки на критические файлы

```
Ядро системы:
- src/lib/db.ts                         # Database
- server.ts                             # Socket.IO сервер
- src/lib/auth.ts                       # Authentication
- src/components/providers.tsx          # Providers

Web3:
- src/components/wallet/wallet-adapter.tsx  # Wallets
- src/lib/deflationary-model.ts             # Tokenomics
- src/lib/ipfs-enhanced.ts                  # IPFS

API:
- src/app/api/solana/*                  # Solana
- src/app/api/wallet/*                  # Wallet ops
- src/app/api/nft/*                     # NFT ops

Бизнес:
- src/app/grave/*                       # G.rave 2.0
- src/app/invest/*                      # Investor relations
- src/app/ton-grant/*                   # TON Grant
- src/app/telegram-partnership/*        # Telegram
```

---

## ✅ Статус готовности

- ✅ Production ready
- ✅ Security audit passed
- ✅ Performance optimized
- ✅ Scalability tested
- ✅ Documentation complete
- ✅ CI/CD automated
- ✅ Kubernetes ready
- ✅ Docker containerized

---

**Последнее обновление**: 2024
**Версия индекса**: 1.0
**Автор**: NORMAL DANCE Team