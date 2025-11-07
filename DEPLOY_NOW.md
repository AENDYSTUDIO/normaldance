# 🚀 Быстрый деплой NORMALDANCE 0.5.0 на Vercel

## ⚡ 5 минут до запуска

### Шаг 1: Подготовка (1 минута)

```bash
# 1. Установите Vercel CLI (если еще не установлен)
npm install -g vercel

# 2. Авторизуйтесь
vercel login
```

### Шаг 2: Создание проекта на Vercel (2 минуты)

```bash
# Свяжите проект
vercel link

# Ответьте на вопросы:
# - Link to existing project? No
# - Project name: normaldance
# - Directory: . (оставьте пустым или введите .)
```

### Шаг 3: Настройка переменных окружения (10 минут)

**Вариант A: Быстрая настройка минимальных переменных**

```bash
# Критически важные переменные для запуска

# 1. База данных (создайте PostgreSQL на Vercel или Supabase)
vercel env add DATABASE_URL production
# Введите: postgresql://user:password@host:5432/normaldance

# 2. NextAuth Secret
vercel env add NEXTAUTH_SECRET production
# Генерация: openssl rand -base64 32
# Или используйте: xK9mP2nQ5rT8wV3yZ6bC1dE4fG7hJ0iL

# 3. NextAuth URL
vercel env add NEXTAUTH_URL production
# Введите: https://normaldance.vercel.app

# 4. Solana RPC
vercel env add NEXT_PUBLIC_SOLANA_RPC_URL production
# Введите: https://api.mainnet-beta.solana.com

# 5. JWT Secret
vercel env add JWT_SECRET production
# Генерация: openssl rand -base64 64
```

**Вариант B: Полная автоматическая настройка**

```bash
# 1. Создайте файл .env.vercel на основе .env.example
cp .env.production.example .env.vercel

# 2. Отредактируйте .env.vercel - замените placeholder значения на реальные

# 3. Запустите автоматическую загрузку
bash scripts/upload-env-to-vercel.sh
# Выберите: 1 (production)
```

### Шаг 4: Деплой! (2 минуты)

```bash
# Запустите автоматический деплой
bash scripts/deploy-vercel.sh

# Или ручной деплой
vercel --prod
```

---

## 🎯 Минимальная конфигурация для старта

Если хотите запустить быстро с минимальными настройками:

### Обязательные переменные:

```env
# .env.vercel
DATABASE_URL=postgresql://user:password@host:5432/normaldance
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://normaldance.vercel.app
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
JWT_SECRET=your-jwt-secret-here
```

### Как получить значения:

1. **DATABASE_URL**: 
   - Vercel Postgres: https://vercel.com/dashboard/stores
   - Или Supabase: https://supabase.com/dashboard

2. **NEXTAUTH_SECRET**: 
   ```bash
   openssl rand -base64 32
   ```

3. **JWT_SECRET**:
   ```bash
   openssl rand -base64 64
   ```

---

## 📋 Проверка перед деплоем

```bash
# Проверить все критические переменные
bash scripts/check-env-vercel.sh
# Выберите: 1 (production)
```

Если проверка пройдена ✅ - вы готовы к деплою!

---

## 🚨 Быстрое решение проблем

### Ошибка: "Missing DATABASE_URL"

**Решение:**
```bash
# Создайте PostgreSQL на Vercel
vercel postgres create normaldance-db

# Скопируйте DATABASE_URL из вывода команды
vercel env add DATABASE_URL production
```

### Ошибка: "Build failed"

**Решение:**
```bash
# Проверьте TypeScript локально
npm run type-check

# Проверьте сборку локально
npm run build

# Если все ок, повторите деплой
vercel --prod
```

### Ошибка: "Function timeout"

**Решение:** Уже настроено в vercel.json (30 секунд для всех API функций)

---

## 🎉 После успешного деплоя

### Проверьте основные страницы:

- Главная: https://normaldance.vercel.app/
- API Health: https://normaldance.vercel.app/api/health
- Wallet: https://normaldance.vercel.app/wallet

### Настройте кастомный домен (опционально):

```bash
vercel domains add normaldance.online
```

### Мониторинг:

- Dashboard: https://vercel.com/dashboard
- Logs: `vercel logs`
- Analytics: https://vercel.com/dashboard/analytics

---

## 📚 Дополнительная документация

- **Полная настройка**: `VERCEL_ENV_SETUP.md`
- **Roadmap деплоя**: `VERCEL_DEPLOYMENT_ROADMAP.md`
- **На русском**: `БЫСТРАЯ_РАЗВЕРТКА.md`

---

## ⏱️ Резюме времени

- ✅ Установка CLI: **1 минута**
- ✅ Создание проекта: **2 минуты**
- ✅ Минимальные переменные: **5 минут**
- ✅ Деплой: **2 минуты**

**Итого: ~10 минут до запуска!**

---

## 💡 Совет для продакшена

После первого деплоя:

1. Настройте полный список переменных (см. VERCEL_ENV_SETUP.md)
2. Добавьте Sentry для мониторинга ошибок
3. Настройте Upstash Redis для rate limiting
4. Подключите Telegram Bot для Mini App
5. Добавьте OpenAI API для AI рекомендаций

Но это можно сделать позже - сначала просто запустите с минимальной конфигурацией! 🚀
