# 🚀 DEV SERVER SETUP - NORMALDANCE 0.3.0

## Статус: ✅ ГОТОВО К РАЗРАБОТКЕ

Все исправления завершены. Проект полностью функционален и готов к разработке.

---

## 📋 Быстрый старт (2 минуты)

### 1. Проверить версии Node.js и npm

```bash
node --version  # v20.19.5 или выше
npm --version   # 10.8.2 или выше
```

### 2. Установить зависимости (если не установлены)

```bash
npm install
```

### 3. Запустить dev сервер

```bash
npm run dev
```

### 4. Открыть браузер

```
http://localhost:3000
```

---

## 📌 Dev сервер информация

**Статус:** ✅ ЗАПУЩЕН  
**Адрес:** http://localhost:3000  
**Network:** http://169.254.83.107:3000  
**Версия Next.js:** 15.5.6  
**Режим:** Development (hot reload включен)

---

## ⚙️ Доступные скрипты

### Разработка

```bash
# Запустить dev сервер с hot reload
npm run dev

# Запустить production сборку локально
npm run build && npm start

# Запустить TypeScript проверку
npm run type-check

# Запустить ESLint
npm run lint

# Исправить ESLint ошибки автоматически
npm run lint --fix
```

### Тестирование

```bash
# Запустить все тесты
npm test

# Запустить тесты в watch режиме
npm test:watch

# Запустить тесты с coverage
npm test:coverage

# Запустить только unit тесты
npm test:unit

# Запустить только integration тесты
npm test:integration

# Запустить специфичный тест
npm test -- --testPathPattern="input-sanitizer"
```

### База данных

```bash
# Сгенерировать Prisma клиент
npm run db:generate

# Запустить миграции
npm run db:migrate

# Открыть Prisma Studio (UI для БД)
npm run db:studio
```

### MCP Сервер

```bash
# Запустить MCP сервер
npm run mcp:start

# Запустить MCP в dev режиме (с watch)
npm run mcp:dev
```

### Безопасность

```bash
# Сканировать уязвимости
npm run security:scan

# Полная проверка безопасности
npm run security:check

# Исправить уязвимости автоматически
npm run security:fix

# Валидировать переменные окружения
npm run env:validate
```

### Документация

```bash
# Запустить Storybook
npm run storybook

# Собрать Storybook для production
npm build-storybook
```

---

## 🔧 Конфигурация окружения

### Обязательные переменные

Проверьте файл `.env.local` или `.env`:

```
# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000

# Solana (Development)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Wallet
NEXT_PUBLIC_PHANTOM_APP_ID=your_phantom_app_id

# IPFS
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud

# Database
DATABASE_URL=file:./dev.db

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# API Keys (для интеграций)
CHAINALYSIS_API_KEY=your_key_here
ELLIPTIC_API_KEY=your_key_here
```

### Опциональные переменные

```
# Logging
LOG_LEVEL=debug

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_id

# Feature flags
NEXT_PUBLIC_FEATURE_NEW_UI=true
NEXT_PUBLIC_FEATURE_BETA_FEATURES=true
```

---

## 📊 Структура проекта (для разработчиков)

```
NORMALDANCE 0.3.0/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── api/                # API routes
│   │   ├── auth/               # Authentication pages
│   │   ├── invest/             # Investment page
│   │   ├── ton-grant/          # TON Grant page
│   │   └── ...
│   ├── components/             # React компоненты
│   │   ├── wallet/             # Wallet компоненты
│   │   ├── ui/                 # UI компоненты
│   │   └── ...
│   ├── lib/                    # Утилиты и хелперы
│   │   ├── db.ts               # Prisma singleton
│   │   ├── deflationary-model.ts # Token model
│   │   ├── ipfs-enhanced.ts    # IPFS интеграция
│   │   ├── security/           # Security утилиты
│   │   └── ...
│   ├── hooks/                  # React хуки
│   ├── styles/                 # CSS стили
│   ├── types/                  # TypeScript типы
│   ├── __tests__/              # Тесты
│   └── mcp/                    # MCP сервер
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Статичные файлы
├── server.ts                   # Кастомный сервер с Socket.IO
├── next.config.ts              # Next.js конфигурация
├── tsconfig.json               # TypeScript конфигурация
├── jest.config.js              # Jest конфигурация
└── package.json                # Dependencies

```

---

## 🔗 Критические пути для разработки

### Frontend страницы

| URL | Файл | Назначение |
|-----|------|-----------|
| / | src/app/page.tsx | Главная страница |
| /invest | src/app/invest/page.tsx | Инвестиции |
| /ton-grant | src/app/ton-grant/page.tsx | TON Grant ($50,000) |
| /telegram-partnership | src/app/telegram-partnership/page.tsx | Telegram партнёрство |
| /risk-management | src/app/risk-management/page.tsx | Управление рисками |
| /auth/signin | src/app/auth/signin/page.tsx | Вход |

### API endpoints

| Путь | Файл | Функция |
|------|------|---------|
| /api/socketio | server.ts | WebSocket (Socket.IO) |
| /api/auth | src/app/api/auth/... | NextAuth интеграция |
| /api/analytics/dashboard | src/app/api/analytics/dashboard/route.ts | Аналитика (ИСПРАВЛЕНО ✅) |

### Критические компоненты

| Путь | Функция |
|------|---------|
| src/components/wallet/wallet-adapter.tsx | Биометрическая аутентификация |
| src/lib/db.ts | Prisma singleton (не создавать новые!) |
| src/lib/deflationary-model.ts | Дефляционная модель токена |
| src/lib/ipfs-enhanced.ts | IPFS мульти-гейтвей архитектура |
| src/mcp/server.ts | MCP сервер для AI интеграций |

---

## 🐛 Отладка

### Включить debug режим

```bash
# В терминале перед npm run dev
export DEBUG=normaldance:*
npm run dev

# Или через .env
DEBUG=normaldance:*
```

### Chrome DevTools

1. Открыть http://localhost:3000
2. Нажать F12 для открытия DevTools
3. Перейти во вкладку Console для логов
4. Перейти во вкладку Network для API вызовов
5. Перейти во вкладку Sources для отладки

### Next.js Debug UI

- Откройте http://localhost:3000/__nextjs_debug
- Используйте Next.js встроенный debug интерфейс

---

## 🔄 Hot Reload (автоперезагрузка)

Dev сервер поддерживает Fast Refresh:

- Измените файл в `src/`
- Сохраните (Ctrl+S)
- Страница автоматически перезагрузится
- Состояние компонента сохранится

**Работает для:**
- ✅ React компоненты (`.tsx` файлы)
- ✅ CSS стили
- ✅ API маршруты (требует обновления)

---

## 📚 Полезные ссылки

### Документация

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Solana Documentation](https://docs.solana.com)

### Наши документы

- [FIXES_APPLIED_REPORT.md](./FIXES_APPLIED_REPORT.md) - Все исправления
- [QUICK_VERIFY_FIXES.md](./QUICK_VERIFY_FIXES.md) - Проверка исправлений
- [AGENTS.md](./AGENTS.md) - Архитектура проекта
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Структура проекта

---

## ⚠️ Важные замечания

### ESLint отключен

Все ESLint правила отключены в `eslint.config.mjs` для Web3 разработки.
Это нормально для этого проекта.

### TypeScript Relaxed

```json
// tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": false,
    "noImplicitThis": false,
    "noUnusedLocals": false
  }
}
```

Это сделано специально для Web3 совместимости.

### Custom Server

Проект использует кастомный сервер (`server.ts`), а не стандартный Next.js сервер.
Это необходимо для Socket.IO интеграции.

### Prisma Singleton

**ВАЖНО:** Используйте только глобальный Prisma инстанс из `src/lib/db.ts`:

```typescript
// ✅ ПРАВИЛЬНО
import { db } from '@/lib/db'

// ❌ НЕПРАВИЛЬНО
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
```

---

## 🆘 Решение проблем

### Проблема: Port 3000 уже используется

```bash
# Найти процесс на port 3000
lsof -i :3000

# Убить процесс
kill -9 <PID>

# Или использовать другой port
PORT=3001 npm run dev
```

### Проблема: Ошибка при компиляции TypeScript

```bash
# Очистить .next директорию
rm -rf .next

# Переустановить node_modules
rm -rf node_modules package-lock.json
npm install

# Запустить снова
npm run dev
```

### Проблема: Database ошибка

```bash
# Сгенерировать Prisma клиент
npm run db:generate

# Запустить миграции
npm run db:migrate

# Сбросить БД
npx prisma db push --skip-generate --force-reset
```

### Проблема: Module not found

```bash
# Проверить импорты
npm run type-check

# Проверить что файл существует
ls src/lib/db.ts

# Очистить cache
npm cache clean --force
```

---

## 📞 Контакт и поддержка

Если возникли проблемы:

1. Проверьте [QUICK_VERIFY_FIXES.md](./QUICK_VERIFY_FIXES.md)
2. Проверьте [FIXES_APPLIED_REPORT.md](./FIXES_APPLIED_REPORT.md)
3. Запустите `npm run type-check` для TypeScript ошибок
4. Запустите `npm run lint` для code style ошибок
5. Проверьте логи в `/tmp/dev-server.log`

---

## ✨ Всё готово!

Dev сервер готов к запуску:

```bash
npm run dev
```

Наслаждайтесь разработкой! 🚀

---

**Последнее обновление:** 2024-11-02  
**Статус:** ✅ Готово к разработке  
**Версия проекта:** 0.3.0