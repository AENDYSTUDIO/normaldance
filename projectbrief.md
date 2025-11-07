# PROJECT BRIEF - NORMAL DANCE

## Основная информация

**Название проекта:** NORMAL DANCE  
**Версия:** 0.5.0 (production-ready)  
**Тип:** Web3 Music Platform  
**Статус:** Production-ready  
**Репозиторий:** https://github.com/AENDYSTUDIO/NORMALDANCE-REVOLUTION.git

---

## Видение проекта

NORMAL DANCE - это децентрализованная музыкальная платформа нового поколения, которая революционизирует распространение музыки через Web3 технологии. Платформа предоставляет артистам беспрецедентный контроль над их музыкой и потоками доходов.

### Ключевые отличия от конкурентов

- **Web3-first подход:** Invisible Wallet, дефляционная модель токеномики
- **Дефляционная модель:** Автоматическое сжигание 2% всех транзакций
- **IPFS/Filecoin:** Мульти-шлюзовая репликация для децентрализованного хранилища
- **NFT интеграция:** TrackNFT программа для музыкальных NFT с мемориальной функциональностью
- **AVL + KYC:** Расширенная верификация для B2G сегмента

---

## Основные функции

### 1. Музыкальная платформа
- Загрузка и распространение треков
- Плейлисты и рекомендации
- Стриминг с защитой от пиратства
- Аналитика для артистов

### 2. Web3 интеграция
- **Solana blockchain:** Нативная интеграция с Solana
- **Invisible Wallet:** Биометрическая аутентификация без необходимости установки кошелька
- **NFT:** Создание и торговля музыкальными NFT
- **DeFi:** Токеномика с дефляционной моделью (FMT - Fan Music Token)
- **Staking:** Программы стейкинга с наградами

### 3. Безопасность и соответствие
- **KYC/AML:** Интеграция с Sumsub и Chainalysis
- **Security Manager:** Централизованная система безопасности
- **Travel Rule:** Поддержка Travel Rule для криптовалютных транзакций
- **Compliance:** GDPR, DPA, DPIA соответствие

### 4. Интеграции
- **Telegram:** Telegram Mini App интеграция
- **TON:** TON Grant программа ($50,000)
- **Stripe/YooKassa:** Платежные системы
- **MCP:** AI агенты через Model Context Protocol

---

## Техническая архитектура

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI (New York style)
- Framer Motion
- Socket.IO client

### Backend
- Custom Socket.IO server (`/api/socketio`)
- Prisma ORM
- PostgreSQL (production) / SQLite (development)
- Redis для кеширования
- Next.js API Routes

### Blockchain
- **Solana:** Web3.js, Anchor programs
  - NDT Program (Native Token)
  - TrackNFT Program
  - Staking Program
- **Wallet:** Phantom wallet adapter
- **DeFi:** Интеграция с Raydium DEX

### Storage
- **IPFS:** Helia, multi-gateway redundancy
- **Filecoin:** Долгосрочное хранилище
- **CDN:** Cloudflare/AWS CloudFront

### Mobile
- React Native (Expo)
- iOS и Android поддержка
- Изолированная тестовая среда

---

## Бизнес-модель

### Фазы развития (из brif.md)

**Фаза 0:** Фундамент ($10,000, 1 месяц)
- UI/UX дизайн
- Security Manager
- API документация

**Фаза 1:** MVP ($50,000, 4-5 месяцев)
- Базовая музыкальная платформа
- 1000 треков
- UX как у Spotify

**Фаза 2:** Web3 интеграция ($80,000, 3 месяца)
- Invisible Wallet
- NFT функциональность
- Solana программы

**Фаза 3:** FMT токен ($150,000, 5 месяцев)
- Дефляционная модель
- DEX интеграция
- Staking программы

**Фаза 4:** AVL + KYC ($200,000, 4 месяца)
- Расширенная верификация
- B2G сегмент
- Compliance модуль

**Фаза 5:** Мультиплатформенность ($300,000, 4 месяца)
- iOS, Android, Smart TV
- VR/AR интеграция
- Социальные функции

**Фаза 6:** Глобальная экспансия ($500,000, 4 месяца)
- Мультивалютные платежи
- Локализация
- Партнерства с лейблами

### KPI
- **Performance:** Lighthouse > 90, TTFB < 200ms
- **Uptime:** > 99.9%
- **Web3:** > 1000 кошельков, > 80% конверсия
- **Revenue:** ARPU $10-15, LTV > $100

---

## Критические компоненты

### Security Manager
**Расположение:** `src/lib/security/SecurityManager.ts`
- Централизованная система безопасности
- XSS/CSRF защита
- CSP headers
- Rate limiting
- Input sanitization

### Invisible Wallet
**Расположение:** `src/components/wallet/wallet-adapter.tsx`
- Биометрическая аутентификация
- MPC интеграция для ключей
- Email/SMS верификация
- Без необходимости установки кошелька

### Deflationary Model
**Расположение:** `src/lib/deflationary-model.ts`
- Автоматическое сжигание 2% транзакций
- Staking награды
- Treasury allocation

### IPFS Enhanced
**Расположение:** `src/lib/ipfs-enhanced.ts`
- Мульти-шлюзовая репликация
- Автоматический failover
- Мониторинг здоровья шлюзов

### Database
**Расположение:** `src/lib/db.ts`
- Глобальный Prisma инстанс
- НИКОГДА не создавать новые инстансы
- Использовать только этот модуль

---

## Особенности разработки

### Build/Test Commands
- `npm run dev` - nodemon + tsx (не стандартный Next.js)
- `npm run build` - Next.js отключен, используется tsx
- `npm test` - Jest для всех тестов
- `npm run mcp:dev` - MCP сервер с hot reload

### Web3 особенности
- ESLint отключен для Web3 кода
- TypeScript расслаблен (`noImplicitAny: false`)
- Фиксированные program IDs (NDT, TrackNFT, Staking)
- Русская локаль для форматирования SOL

### Критические пути
- `/invest` - Страница для инвесторов
- `/ton-grant` - TON Grant ($50,000)
- `/telegram-partnership` - Telegram партнерство
- `/risk-management` - Управление рисками

---

## AI Агенты

- **RooCode:** Основной архитектурный агент (`.roo/`)
- **KiloCode:** Ассистент кода (`.kilocode/`)
- **MCP Server:** `src/mcp/server.ts` для AI интеграций

---

## Документация

Основные документы:
- `README.md` - Общее описание
- `brif.md` - Бизнес-план и фазы развития
- `AGENTS.md` - Критическая информация для агентов
- `SECURITY.md` - Документация по безопасности
- `ARCHITECTURE.md` - Архитектурная документация

---

## Статус проекта

✅ **Production-ready:**
- Core Web3 функциональность
- Solana интеграция
- IPFS/Filecoin storage
- Wallet интеграция
- Mobile приложение

🔄 **В разработке:**
- Расширение Web3 функциональности
- Улучшение безопасности
- Оптимизация производительности

📋 **Планируется:**
- FMT токен запуск
- Расширенная KYC/AVL
- Мультиплатформенная экспансия

