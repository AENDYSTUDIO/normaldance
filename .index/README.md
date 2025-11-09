# 📚 NORMALDANCE 0.5.0 - Полный анализ и индекс кодовой базы

## 🎯 Обзор

Это комплексный анализ проекта **NORMALDANCE v0.5.0** - децентрализованной Web3 музыкальной платформы на базе Next.js 15.5.6, Solana блокчейна и IPFS хранилища.

**Статус**: ✅ Production-Ready  
**Размер проекта**: 579 TypeScript файлов, 6.6 МБ src/, ~100K+ LOC  
**Технологический стек**: Next.js + React 19 + Solana + TON + IPFS + PostgreSQL

---

## 📖 Документы в этой папке

### 1. **PROJECT_SUMMARY.md** ⭐ НАЧНИТЕ ОТСЮДА (15-20 мин)

Краткое резюме всего проекта - идеально для быстрого ознакомления.

**Включает:**
- Что такое NORMALDANCE (краткое описание)
- Ключевая статистика (числа, размеры)
- Основные возможности (Music, Web3, NFT, Economy)
- Технологический стек (Frontend, Backend, Blockchain, Storage, AI)
- Критические модули (5 MUST-KNOW файлов)
- Архитектурные слои (4 уровня)
- Команды разработки
- Быстрая навигация по функционалу
- Интеграции третьих сторон
- Deployment опции

**🎯 Для кого**: Новые разработчики, PM, архитекторы, инвесторы  
**⏱️ Время чтения**: 15-20 минут  
**📍 Перейти**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

### 2. **CODEBASE_ANALYSIS.md** (30-45 мин)

Полный анализ структуры кодовой базы с детальным разбором каждого компонента.

**Включает:**
- Общая статистика проекта (579 файлов, 6.6 МБ, 100K+ LOC)
- Архитектура приложения (7 слоев)
- Структура компонентов (35+ категорий)
- Библиотека услуг (50+ модулей в src/lib/)
- API маршруты (40+ endpoints)
- App Router маршруты (20+ pages)
- Типы данных (src/types/)
- React хуки (9 основных)
- MCP интеграции
- Зависимости (150+ основных)
- Конфигурационные файлы
- Критические бизнес-процессы
- Build & Deployment команды
- Security аспекты
- Критические пути для разработчиков

**🎯 Для кого**: Разработчики, архитекторы, DevOps  
**⏱️ Время чтения**: 30-45 минут  
**📍 Перейти**: [CODEBASE_ANALYSIS.md](./CODEBASE_ANALYSIS.md)

---

### 3. **ARCHITECTURE_DEEP_DIVE.md** (1-2 часа)

Детальное руководство по архитектуре с глубоким погружением в каждый модуль.

**Включает:**
- Архитектурные слои (Presentation, Application, Business Logic, Data)
- Критические модули (10 подробных разборов):
  - Database layer (src/lib/db.ts)
  - Authentication (NextAuth, Wallet-based)
  - Wallet integration (Solana, TON, EVM, Biometric)
  - Deflationary model (2% burn)
  - IPFS architecture (Multi-gateway)
  - Socket.IO real-time (WebSocket)
  - AI integration (MCP, embeddings)
  - Security layers (RBAC, AML/KYC)
  - Payment gateway (Stripe, Solana Pay, TON)
  - Notification system
- Data flow архитектура (4 основных потока)
- Security архитектура (5 слоев защиты)
- Масштабируемость (горизонтальная + вертикальная)
- Интеграции (Blockchain, External Services)
- Deployment архитектура (Docker, K8s)
- Performance оптимизация
- Monitoring & alerting

**🎯 Для кого**: Senior разработчики, архитекторы, team leads  
**⏱️ Время чтения**: 1-2 часа  
**📍 Перейти**: [ARCHITECTURE_DEEP_DIVE.md](./ARCHITECTURE_DEEP_DIVE.md)

---

## 🚀 Быстрая навигация

### Я ищу ответ на вопрос...

#### ❓ "Что это такое в двух словах?"
→ **PROJECT_SUMMARY.md** (раздел "Суть проекта") - 2 минуты

#### ❓ "Какие компоненты есть в проекте?"
→ **CODEBASE_ANALYSIS.md** (раздел "Компоненты") - 10 минут

#### ❓ "Где находится конкретный функционал (например, платежи)?"
→ **CODEBASE_ANALYSIS.md** (раздел "API маршруты") - 5 минут

#### ❓ "Как настроить локальную разработку?"
→ **PROJECT_SUMMARY.md** (раздел "Development Workflow") - 10 минут

#### ❓ "Как устроена архитектура в деталях?"
→ **ARCHITECTURE_DEEP_DIVE.md** (все документы) - 1-2 часа

#### ❓ "Как работает блокчейн интеграция?"
→ **ARCHITECTURE_DEEP_DIVE.md** (раздел "Blockchain Networks") - 30 минут

#### ❓ "Как развернуть приложение в production?"
→ **ARCHITECTURE_DEEP_DIVE.md** (раздел "Deployment") - 20 минут

#### ❓ "Как обезопасить мой код?"
→ **ARCHITECTURE_DEEP_DIVE.md** (раздел "Security архитектура") - 30 минут

#### ❓ "Как оптимизировать производительность?"
→ **ARCHITECTURE_DEEP_DIVE.md** (раздел "Performance Optimization") - 20 минут

#### ❓ "Как монитировать приложение?"
→ **ARCHITECTURE_DEEP_DIVE.md** (раздел "Monitoring & Alerting") - 15 минут

---

## 🔑 Критические файлы MUST-KNOW

```
КРИТИЧЕСКИЕ (НИКОГДА не трогайте без причины):
├── src/lib/db.ts                           ⭐ Global Prisma (создавай новые = баг!)
├── server.ts                               ⭐ Socket.IO на пути /api/socketio
├── src/components/wallet/wallet-adapter.tsx  - Wallet & Biometric auth
├── src/lib/deflationary-model.ts           - 2% burn mechanism
└── src/lib/ipfs-enhanced.ts                - IPFS multi-gateway

ВАЖНЫЕ ДИРЕКТОРИИ:
├── src/app/api/                    - Все API endpoints (40+)
├── src/components/                 - Все UI компоненты (200+)
├── src/lib/                        - Бизнес-логика (50+ модулей)
├── src/types/                      - TypeScript интерфейсы
├── src/hooks/                      - React хуки (9 основных)
├── src/mcp/                        - AI интеграция (MCP)
├── src/store/                      - Zustand хранилище
├── prisma/                         - Database schema & migrations
└── contracts/                      - Anchor programs (Solana)
```

---

## 📊 Статистика в одном взгляде

| Категория | Значение |
|-----------|----------|
| **TypeScript файлов** | 579 |
| **Размер src/** | 6.6 МБ |
| **Приблизительно LOC** | ~100K+ |
| **Компонентов** | 200+ React |
| **API endpoints** | 40+ |
| **Lib модулей** | 50+ |
| **App маршрутов** | 20+ |
| **Зависимостей** | 150+ |
| **DevDependencies** | 40+ |

---

## 💻 Технологический стек (краткий обзор)

### Frontend Stack
```
Next.js 15.5.6 (App Router)
├── React 19.2.0
├── TypeScript 5.9.3
├── Tailwind CSS 4.1.13
├── Radix UI (20+ components)
├── Zustand 5.0.8 (State)
├── TanStack Query 5.90.6 (Data)
└── Framer Motion (Animations)
```

### Backend Stack
```
Node.js + Express
├── Prisma 6.17.1 (ORM)
├── PostgreSQL (Supabase)
├── Redis (Cache)
├── Socket.IO 4.8.1 (WebSocket)
├── NextAuth 4.24.11
└── Winston 3.17.0 (Logging)
```

### Blockchain Stack
```
Solana: @solana/web3.js 1.98.4
TON: @ton/ton 15.4.0
EVM: ethers.js 6.15.0 + viem 2.38.5
Wallets: Phantom, TON Connect, MetaMask
```

### Storage & AI
```
IPFS: Helia 4.2.2 + Pinata
Filecoin: Long-term archival
Vector DB: Qdrant 1.15.1
AI: MCP SDK 1.20.1
```

---

## 🎯 Рекомендации по чтению для разных ролей

### 👨‍💻 Junior Developer (Новичок)
**Время**: День 1-2

1. Прочитайте **PROJECT_SUMMARY.md** (20 мин)
2. Установите проект (`npm install` + `npm run dev`) (30 мин)
3. Изучите **src/** структуру (1 час)
4. Запустите тесты (`npm test`) (15 мин)

### 🎯 Mid-level Developer (Опытный)
**Время**: День 1-3

1. Быстро просмотрите **PROJECT_SUMMARY.md** (10 мин)
2. Прочитайте **CODEBASE_ANALYSIS.md** (45 мин)
3. Изучите конкретные модули в **ARCHITECTURE_DEEP_DIVE.md** (2 часа)
4. Сделайте code review существующего кода (2 часа)

### 👨‍🏫 Senior Engineer / Architect
**Время**: Несколько часов

1. Скан **ARCHITECTURE_DEEP_DIVE.md** (30 мин)
2. Dive deep в интересующие модули (2-3 часа)
3. Code review + optimization (2+ часа)

### 🚀 DevOps / Infrastructure Engineer
**Время**: 2-3 часа

1. Прочитайте **ARCHITECTURE_DEEP_DIVE.md** → раздел "Deployment" (45 мин)
2. Изучите Docker & Kubernetes конфиги (1 час)
3. Настройте CI/CD pipeline (1+ час)

### 📊 Product Manager / Business
**Время**: 30 минут

1. Прочитайте **PROJECT_SUMMARY.md** → раздел "Основные возможности" (15 мин)
2. Посмотрите "API маршруты" для функций (10 мин)

### 🛡️ Security Engineer
**Время**: 2-3 часа

1. Прочитайте **ARCHITECTURE_DEEP_DIVE.md** → раздел "Security архитектура" (45 мин)
2. Изучите AML/KYC & Travel Rule (1 час)
3. Review безопасность endpoints (1+ час)

---

## ✅ Чек-лист для onboarding новых разработчиков

### День 1 (2 часа)
- [ ] Прочитать PROJECT_SUMMARY.md
- [ ] Установить зависимости (`npm install`)
- [ ] Запустить `npm run dev` и открыть http://localhost:3000
- [ ] Изучить базовую структуру src/
- [ ] Запустить тесты (`npm test`)

### День 2 (3-4 часа)
- [ ] Прочитать CODEBASE_ANALYSIS.md
- [ ] Изучить **CRITICAL**: src/lib/db.ts (правило #1!)
- [ ] Изучить src/components/wallet/ (Wallet интеграция)
- [ ] Посмотреть примеры src/app/api
- [ ] Запустить `npm run db:studio`

### День 3 (4-6 часов)
- [ ] Прочитать ARCHITECTURE_DEEP_DIVE.md
- [ ] Изучить Socket.IO integration (server.ts)
- [ ] Изучить IPFS system (src/lib/ipfs-enhanced.ts)
- [ ] Изучить Solana integration (src/lib/solana-pay-enhanced.ts)
- [ ] Сделать первый PR с простым изменением

---

## 🛠️ Команды разработки (шпаргалка)

### Development
```bash
npm run dev              # Start dev server (localhost:3000)
npm run mcp:dev         # MCP server with hot reload
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio (DB GUI)
```

### Testing
```bash
npm test                                    # All tests
npm test -- --testPathPattern="file.test"   # Specific test file
npm run test:coverage                       # Coverage report
npm run test:e2e                            # Playwright E2E
npm run test:performance                    # K6 load tests
```

### Quality & Security
```bash
npm run type-check      # TypeScript check
npm run lint           # ESLint check
npm run security:scan  # npm audit + trivy
npm run analyze:bundle # Bundle size analysis
```

### Production
```bash
npm run build                   # Build for production
npm start                       # Start production server
npm run deploy:production       # Full deployment
```

---

## 📚 Дополнительные ресурсы

### В самом проекте
- `/docs/` - Дополнительная документация
- `/README.md` - Главный README
- `/AGENTS.md` - Информация для AI агентов
- `/CONTRIBUTING.md` - Как внести вклад
- `/.github/workflows/` - CI/CD pipeline конфиги

### Внешние ссылки
- **GitHub**: https://github.com/AENDYSTUDIO/NORMALDANCE-REVOLUTION
- **Website**: https://normaldance.ru
- **Telegram Community**: @NORMAL_DANCE
- **Email**: support@normaldance.ru

---

## 🎉 Готовы начать?

### Путь для новичка (4-6 часов)

```
Шаг 1: Быстрый обзор (20 мин)
       ↓
       Прочитайте PROJECT_SUMMARY.md
       
Шаг 2: Setup (30 мин)
       ↓
       git clone <repo>
       npm install
       npm run dev
       
Шаг 3: Изучение (1-2 часа)
       ↓
       Прочитайте CODEBASE_ANALYSIS.md
       Изучите src/ структуру
       Посмотрите примеры кода
       
Шаг 4: Глубокий анализ (1-2 часа)
       ↓
       Прочитайте ARCHITECTURE_DEEP_DIVE.md
       Изучите критические модули
       
Шаг 5: Первый PR (1-2 часа)
       ↓
       npm run git:feature:create feature/your-feature
       Сделайте небольшое изменение
       npm test
       npm run pr:create
```

---

## 📋 Структура этого анализа

```
.index/
├── README.md                      ← Вы здесь (навигация)
├── PROJECT_SUMMARY.md             ← Краткое резюме (15 мин)
├── CODEBASE_ANALYSIS.md           ← Полный анализ (30-45 мин)
└── ARCHITECTURE_DEEP_DIVE.md      ← Детальная архитектура (1-2 часа)
```

---

## 💡 Важные советы

✅ **Начните с PROJECT_SUMMARY.md** для быстрого обзора  
✅ **Используйте CODEBASE_ANALYSIS.md** как справочник для поиска модулей  
✅ **Читайте ARCHITECTURE_DEEP_DIVE.md** для глубокого понимания  
✅ **Обращайтесь к исходному коду** для деталей реализации  
✅ **Спрашивайте в Telegram** (@NORMAL_DANCE) если что-то непонятно  
✅ **НИКОГДА не создавайте новые PrismaClient** - используйте db из lib/db.ts  
✅ **ВСЕГДА импортируйте через path aliases** (@/components/*, @/lib/*, etc)  
✅ **Читайте AGENTS.md** для информации о Web3 требованиях  

---

## ℹ️ Информация об анализе

| Параметр | Значение |
|----------|----------|
| **Project** | NORMALDANCE v0.5.0 |
| **Status** | ✅ Production Ready |
| **Analysis Version** | 1.0 |
| **Generated** | 2024 |
| **Language** | TypeScript / React |
| **Framework** | Next.js 15.5.6 |
| **Database** | PostgreSQL (Supabase) |
| **Blockchain** | Solana + TON + EVM |

---

**🎯 Начните отсюда**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)