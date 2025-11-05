# 🚀 Настройка переменных окружения для Vercel

## Быстрый старт

### 1. Установка Vercel CLI (если еще не установлен)

```bash
npm install -g vercel
vercel login
```

### 2. Связывание проекта с Vercel

```bash
vercel link
```

Выберите:
- Scope: Ваша организация или личный аккаунт
- Link to existing project? **No**
- Project name: **normaldance**

---

## 🔐 Критические переменные окружения

### База данных (PostgreSQL на Vercel)

```bash
# Vercel автоматически создаст PostgreSQL Storage
# После создания скопируйте DATABASE_URL из Vercel Dashboard
vercel env add DATABASE_URL production
# Введите: postgresql://user:password@host:5432/normaldance

# Или используйте Supabase
# https://supabase.com/dashboard
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### NextAuth

```bash
# Генерация безопасного secret
vercel env add NEXTAUTH_SECRET production
# Генерация: openssl rand -base64 32
# Пример: xK9mP2nQ5rT8wV3yZ6bC1dE4fG7hJ0iL

vercel env add NEXTAUTH_URL production
# Введите: https://normaldance.vercel.app (или ваш кастомный домен)
```

### Solana Web3

```bash
# Mainnet RPC (рекомендуется использовать платный сервис для production)
vercel env add NEXT_PUBLIC_SOLANA_RPC_URL production
# Бесплатный: https://api.mainnet-beta.solana.com
# QuickNode: https://your-endpoint.solana-mainnet.quiknode.pro/
# Helius: https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
# Alchemy: https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY

vercel env add SOLANA_RPC_TIMEOUT production
# Введите: 15000

# WalletConnect Project ID
# Получить на: https://cloud.walletconnect.com/
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID production
# Пример: 5a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p
```

### Solana Program IDs (ваши развернутые контракты)

```bash
# NDT Token Program ID
vercel env add NEXT_PUBLIC_NDT_PROGRAM_ID production
# Введите ваш реальный Program ID

# NDT Mint Address
vercel env add NEXT_PUBLIC_NDT_MINT_ADDRESS production
# Введите ваш реальный Mint Address

# TrackNFT Program ID
vercel env add NEXT_PUBLIC_TRACKNFT_PROGRAM_ID production

# Staking Program ID
vercel env add NEXT_PUBLIC_STAKING_PROGRAM_ID production
```

### IPFS/Pinata

```bash
# Получить API ключи на: https://app.pinata.cloud/
vercel env add PINATA_API_KEY production
vercel env add PINATA_SECRET_KEY production
vercel env add PINATA_JWT production

vercel env add NEXT_PUBLIC_IPFS_GATEWAY production
# Введите: https://gateway.pinata.cloud

vercel env add IPFS_BACKEND production
# Введите: legacy

vercel env add CDN_PROVIDER production
# Введите: cloudflare
```

### Redis (Upstash для rate limiting)

```bash
# Создать на: https://console.upstash.com/
vercel env add UPSTASH_REDIS_REST_URL production
# Пример: https://your-redis.upstash.io

vercel env add UPSTASH_REDIS_REST_TOKEN production
# Скопировать из Upstash Dashboard
```

### Sentry (мониторинг ошибок)

```bash
# Создать проект на: https://sentry.io/
vercel env add SENTRY_DSN production
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Пример: https://public@sentry.io/project-id
```

### Telegram Bot (для Mini App)

```bash
# Создать бота через @BotFather
vercel env add TELEGRAM_BOT_TOKEN production
# Пример: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

vercel env add TELEGRAM_WEB_APP_URL production
# Введите: https://normaldance.vercel.app/telegram

vercel env add TELEGRAM_WEBHOOK_URL production
# Введите: https://normaldance.vercel.app/api/telegram/webhook

vercel env add TELEGRAM_CHAT_ID production
# Ваш chat ID для уведомлений
```

### OpenAI (для AI рекомендаций)

```bash
# Получить на: https://platform.openai.com/api-keys
vercel env add OPENAI_API_KEY production
# Пример: sk-proj-...

vercel env add OPENAI_BASE_URL production
# Введите: https://api.openai.com/v1

vercel env add LANGGRAPH_API_KEY production
# Если используете LangGraph
```

### JWT для API

```bash
# Генерация секрета
vercel env add JWT_SECRET production
# Генерация: openssl rand -base64 64
```

### Analytics (опционально)

```bash
# Vercel Analytics (автоматически)
vercel env add NEXT_PUBLIC_VERCEL_ANALYTICS_ID production

# Mixpanel
# Получить на: https://mixpanel.com/
vercel env add MIXPANEL_TOKEN production
```

---

## 📋 Автоматическая настройка всех переменных

Создайте файл `.env.vercel` со всеми значениями:

```bash
# Скопируйте из .env.production.example и заполните реальные значения
cp .env.production.example .env.vercel

# Затем используйте этот скрипт для массовой загрузки:
```

```bash
#!/bin/bash
# upload-env-to-vercel.sh

while IFS='=' read -r key value; do
  # Пропускаем пустые строки и комментарии
  if [[ -z "$key" || "$key" =~ ^# ]]; then
    continue
  fi
  
  # Удаляем кавычки из значения
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//')
  
  echo "Setting $key..."
  echo "$value" | vercel env add "$key" production
done < .env.vercel
```

Запуск:

```bash
chmod +x upload-env-to-vercel.sh
./upload-env-to-vercel.sh
```

---

## 🔄 Синхронизация с другими окружениями

### Preview окружение (для PR)

```bash
# Копировать из production
vercel env pull .env.preview --environment=preview

# Или добавить отдельно для preview
vercel env add VARIABLE_NAME preview
```

### Development окружение

```bash
# Синхронизировать с локальной разработкой
vercel env pull .env.local

# Это создаст файл .env.local с реальными значениями из Vercel
```

---

## ✅ Проверка настройки

После настройки всех переменных:

```bash
# Проверить список всех переменных
vercel env ls

# Проверить конкретную переменную
vercel env pull .env.check

# Запустить локальную проверку
npm run build
```

---

## 🚀 Деплой после настройки

```bash
# Production деплой
vercel --prod

# Или с автоматическим выбором окружения
npm run deploy:vercel
```

---

## 🔒 Безопасность

### ⚠️ Критически важно:

1. **Никогда не коммитьте файлы с реальными секретами:**
   - `.env.local`
   - `.env.production`
   - `.env.vercel`

2. **Используйте разные ключи для разных окружений:**
   - Development: тестовые ключи
   - Preview: промежуточные ключи
   - Production: боевые ключи

3. **Регулярно ротируйте секреты:**
   ```bash
   # Обновление существующей переменной
   vercel env rm NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_SECRET production
   ```

4. **Проверьте .gitignore:**
   ```
   .env*
   !.env.example
   !.env.*.example
   .vercel
   ```

---

## 📊 Мониторинг переменных

### Создайте чеклист переменных:

```bash
# check-env-vars.sh
#!/bin/bash

REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "NEXT_PUBLIC_SOLANA_RPC_URL"
  "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"
  "PINATA_JWT"
  "UPSTASH_REDIS_REST_URL"
  "SENTRY_DSN"
  "TELEGRAM_BOT_TOKEN"
  "OPENAI_API_KEY"
  "JWT_SECRET"
)

echo "Checking required environment variables..."

for var in "${REQUIRED_VARS[@]}"; do
  vercel env pull .env.temp
  if grep -q "$var" .env.temp; then
    echo "✅ $var is set"
  else
    echo "❌ $var is missing!"
  fi
done

rm .env.temp
```

---

## 🎯 Быстрые команды

```bash
# Просмотр всех переменных production
vercel env ls production

# Удаление переменной
vercel env rm VARIABLE_NAME production

# Копирование между окружениями
vercel env pull .env.production --environment=production
vercel env add VARIABLE_NAME preview < .env.production

# Массовое удаление (осторожно!)
vercel env ls production | grep "VAR_PREFIX" | xargs -I {} vercel env rm {} production
```

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте документацию Vercel: https://vercel.com/docs/concepts/projects/environment-variables
2. Проверьте логи деплоя: `vercel logs`
3. Проверьте статус сервисов: https://www.vercel-status.com/

---

## 🎉 Готово!

После настройки всех переменных окружения, ваш проект готов к деплою:

```bash
vercel --prod
```

Проект будет доступен по адресу: `https://normaldance.vercel.app`

Для настройки кастомного домена:
```bash
vercel domains add normaldance.online
```
