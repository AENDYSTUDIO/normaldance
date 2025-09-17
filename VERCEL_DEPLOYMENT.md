# Vercel Deployment Configuration for NORMALDANCE

## 🚀 Быстрое развертывание на Vercel

### Преимущества Vercel:
- ✅ **Бесплатный план** - идеально для тестирования
- ✅ **Автоматические деплои** из GitHub
- ✅ **Глобальный CDN** - быстрая загрузка
- ✅ **SSL сертификаты** включены
- ✅ **Serverless функции** для API
- ✅ **Простота настройки** - несколько кликов

### Ограничения для NORMALDANCE:
- ❌ **Нет Socket.IO** (serverless не поддерживает постоянные соединения)
- ❌ **Нет PostgreSQL** (только внешние БД)
- ❌ **Нет Redis** (только внешние кэши)
- ❌ **Ограничения времени выполнения** (10 секунд для Hobby плана)

## 🔧 Адаптация проекта для Vercel

### 1. Обновленная конфигурация Vercel
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; img-src 'self' https://ipfs.io https://cloudflare-ipfs.com https://gateway.pinata.cloud data:; connect-src 'self' https://ipfs.io https://cloudflare-ipfs.com https://gateway.pinata.cloud https://api.solana.com https://api.mainnet-beta.solana.com; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'"
        }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "NEXT_TELEMETRY_DISABLED": "1"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

### 2. Внешние сервисы для Vercel
- **База данных**: PlanetScale (бесплатно) или Neon (бесплатно)
- **Кэш**: Upstash Redis (бесплатно)
- **Файлы**: IPFS (бесплатно)
- **WebSocket**: Pusher (бесплатно) или Ably (бесплатно)

### 3. Адаптированный server.ts для Vercel
```typescript
// server.ts - Vercel compatible version
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';

// Vercel doesn't support custom servers in production
if (process.env.VERCEL) {
  // Export Next.js app for Vercel
  const nextApp = next({ dev, dir: process.cwd() });
  await nextApp.prepare();
  export default nextApp.getRequestHandler();
} else {
  // Custom server for local development
  async function createCustomServer() {
    try {
      const nextApp = next({ dev, dir: process.cwd() });
      await nextApp.prepare();
      const handle = nextApp.getRequestHandler();

      const server = createServer((req, res) => {
        if (req.url?.startsWith('/api/socketio')) {
          return;
        }
        handle(req, res);
      });

      const io = new Server(server, {
        path: '/api/socketio',
        cors: { origin: process.env.NEXTAUTH_URL || '*', methods: ['GET', 'POST'] }
      });

      setupSocket(io);

      server.listen(port, hostname, () => {
        console.log(`🚀 Server running on http://${hostname}:${port}`);
      });
    } catch (error) {
      console.error('❌ Server startup error:', error);
      process.exit(1);
    }
  }

  createCustomServer();
}
```

## 🌐 Пошаговое развертывание на Vercel

### Шаг 1: Подготовка проекта
1. **Создайте .vercelignore**:
```
node_modules
.next
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

2. **Обновите package.json**:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "vercel-build": "next build"
  }
}
```

### Шаг 2: Регистрация на Vercel
1. Идите на https://vercel.com
2. Войдите через GitHub
3. Импортируйте ваш репозиторий NORMALDANCE

### Шаг 3: Настройка переменных окружения
```bash
# Database (PlanetScale)
DATABASE_URL=mysql://user:pass@host:port/database

# Redis (Upstash)
REDIS_URL=redis://user:pass@host:port

# Authentication
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your_super_secret_key

# IPFS
IPFS_GATEWAY=https://ipfs.io/ipfs/
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WS_URL=wss://api.mainnet-beta.solana.com
NDT_PROGRAM_ID=your_ndt_program_id
TRACKNFT_PROGRAM_ID=your_tracknft_program_id
STAKING_PROGRAM_ID=your_staking_program_id

# WebSocket (Pusher)
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
```

### Шаг 4: Настройка внешних сервисов

#### PlanetScale (База данных)
1. Идите на https://planetscale.com
2. Создайте аккаунт
3. Создайте базу данных
4. Получите connection string

#### Upstash Redis (Кэш)
1. Идите на https://upstash.com
2. Создайте аккаунт
3. Создайте Redis базу
4. Получите connection string

#### Pusher (WebSocket)
1. Идите на https://pusher.com
2. Создайте аккаунт
3. Создайте приложение
4. Получите ключи

### Шаг 5: Деплой на Vercel
1. **Автоматический деплой**: Vercel автоматически развернет при push в GitHub
2. **Ручной деплой**: Нажмите "Deploy" в Vercel dashboard
3. **Проверка**: Откройте https://your-project.vercel.app

## 📊 Сравнение Vercel vs Cloud.ru

| Функция | Vercel | Cloud.ru |
|---------|--------|----------|
| Стоимость | Бесплатно | 400₽/месяц |
| Настройка | 5 минут | 30 минут |
| База данных | Внешняя | Встроенная |
| WebSocket | Внешний | Встроенный |
| Масштабирование | Автоматическое | Ручное |
| Поддержка | Английский | Русский |

## 🎯 Рекомендация

### Для тестирования: **Vercel**
- ✅ Быстрое развертывание
- ✅ Бесплатно
- ✅ Идеально для MVP

### Для продакшена: **Cloud.ru**
- ✅ Полный контроль
- ✅ Русская поддержка
- ✅ Все сервисы в одном месте

## 🚀 Быстрый старт

1. **Подготовьте проект** для Vercel
2. **Зарегистрируйтесь** на Vercel
3. **Импортируйте** репозиторий
4. **Настройте** переменные окружения
5. **Деплойте** и тестируйте

**Готовы развернуть NORMALDANCE на Vercel?**
