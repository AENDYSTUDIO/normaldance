# 🎯 НАЧАЛО ДЕПЛОЯ NORMALDANCE 0.5.0

## ✅ Что уже готово

- ✅ Версия обновлена до 0.5.0
- ✅ CHANGELOG обновлен
- ✅ Скрипты автоматизации созданы
- ✅ Документация подготовлена
- ✅ Vercel конфигурация настроена

---

## 🚀 ШАГ 1: Завершите commit (30 секунд)

```bash
# Сделайте commit вручную (Droid Shield требует подтверждения для файлов с примерами)
git commit -m "feat: Version 0.5.0 - Vercel deployment automation

- Automated environment variables management
- Complete deployment workflow with validation
- Documentation in Russian and English
- Architecture separation guide (70% OSS / 30% IP)

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"

# Отправьте в репозиторий
git push
```

---

## 🚀 ШАГ 2: Выберите путь деплоя

### Вариант A: Быстрый старт (10 минут) 🏃‍♂️

Для тех, кто хочет запустить прямо сейчас с минимальной конфигурацией:

```bash
# Откройте инструкцию
cat DEPLOY_NOW.md

# Или в браузере
start DEPLOY_NOW.md
```

**Что нужно:**
- Vercel аккаунт
- PostgreSQL база (Vercel Postgres или Supabase)
- 5 критических переменных окружения

**Результат:** Рабочий сайт на https://normaldance.vercel.app

---

### Вариант B: Полная настройка (30 минут) 🎯

Для production-ready деплоя со всеми интеграциями:

```bash
# Откройте полную инструкцию
cat VERCEL_ENV_SETUP.md

# Или в браузере
start VERCEL_ENV_SETUP.md
```

**Что нужно:**
- Все из варианта A
- IPFS/Pinata для хранения файлов
- Redis для rate limiting
- Sentry для мониторинга
- Telegram Bot Token
- OpenAI API для AI рекомендаций

**Результат:** Полнофункциональная платформа со всеми фичами

---

## 📝 ШАГ 3: Подготовьте переменные окружения

### Создайте файл с вашими переменными:

```bash
# Скопируйте шаблон
cp .env.vercel.template .env.vercel

# Отредактируйте файл
# В Windows:
notepad .env.vercel

# В VS Code:
code .env.vercel
```

### Минимальная конфигурация для старта:

```env
# Необходимый минимум
DATABASE_URL=postgresql://user:password@host:5432/normaldance
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://normaldance.vercel.app
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
JWT_SECRET=$(openssl rand -base64 64)
```

---

## 🚀 ШАГ 4: Деплой

### 4.1. Установите Vercel CLI (если еще не установлен)

```bash
npm install -g vercel
vercel login
```

### 4.2. Свяжите проект

```bash
vercel link

# Ответьте:
# - Link to existing project? No
# - Project name: normaldance
```

### 4.3. Загрузите переменные окружения

**Автоматически (рекомендуется):**

```bash
bash scripts/upload-env-to-vercel.sh
# Выберите: 1 (production)
```

**Или вручную:**

```bash
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add NEXT_PUBLIC_SOLANA_RPC_URL production
vercel env add JWT_SECRET production
```

### 4.4. Проверьте настройку

```bash
bash scripts/check-env-vercel.sh
# Выберите: 1 (production)
```

Если все переменные ✅ - можно деплоить!

### 4.5. Запустите деплой

**С автоматическими проверками (рекомендуется):**

```bash
bash scripts/deploy-vercel.sh
# Выберите: 2 (Production)
```

**Или напрямую:**

```bash
vercel --prod
```

---

## 🎉 После успешного деплоя

### Проверьте работоспособность:

```bash
# Основные эндпоинты
curl https://normaldance.vercel.app/
curl https://normaldance.vercel.app/api/health

# Откройте в браузере
start https://normaldance.vercel.app/
```

### Настройте кастомный домен:

```bash
vercel domains add normaldance.online

# Следуйте инструкциям для настройки DNS
```

---

## 📊 Мониторинг

После деплоя доступны:

- **Dashboard**: https://vercel.com/dashboard
- **Analytics**: https://vercel.com/dashboard/analytics
- **Logs**: `vercel logs`
- **Deployments**: `vercel ls`

---

## 🔧 Troubleshooting

### Ошибка: "Missing DATABASE_URL"

```bash
# Создайте Postgres на Vercel
vercel postgres create normaldance-db

# Или используйте Supabase
# https://supabase.com/dashboard
```

### Ошибка: "Build failed"

```bash
# Проверьте локально
npm run type-check
npm run build

# Если ошибки - исправьте и повторите
vercel --prod
```

### Нужна помощь?

- Полная документация: `VERCEL_ENV_SETUP.md`
- Быстрый старт: `DEPLOY_NOW.md`
- Русская версия: `БЫСТРАЯ_РАЗВЕРТКА.md`

---

## 📁 Структура файлов деплоя

```
NORMALDANCE 0.5.0/
├── START_DEPLOYMENT.md          ← ВЫ ЗДЕСЬ (начало)
├── DEPLOY_NOW.md                ← Быстрый старт (10 мин)
├── VERCEL_ENV_SETUP.md          ← Полная инструкция (30 мин)
├── .env.vercel.template         ← Шаблон переменных
├── vercel.json                  ← Конфигурация Vercel
└── scripts/
    ├── upload-env-to-vercel.sh  ← Загрузка переменных
    ├── check-env-vercel.sh      ← Проверка переменных
    └── deploy-vercel.sh         ← Автоматический деплой
```

---

## ⏱️ Сколько займет времени?

- **Быстрый старт**: 10 минут
  - Установка CLI: 1 мин
  - Создание проекта: 2 мин
  - Минимальные переменные: 5 мин
  - Деплой: 2 мин

- **Полная настройка**: 30 минут
  - Быстрый старт: 10 мин
  - Настройка всех сервисов: 15 мин
  - Проверка и тестирование: 5 мин

---

## 🎯 Рекомендуемый путь

1. **Сейчас**: Быстрый старт с минимальными переменными
2. **Через 1 час**: Добавьте Sentry и Upstash Redis
3. **Через 1 день**: Настройте Telegram Bot и IPFS
4. **Через 3 дня**: Добавьте OpenAI для AI рекомендаций

Не нужно настраивать все сразу! Запустите с минимальной конфигурацией, потом добавляйте функции по мере необходимости.

---

## 🚀 Готовы начать?

```bash
# Завершите commit
git commit -m "feat: Version 0.5.0 - Vercel deployment"
git push

# Выберите путь:
# Быстрый старт → DEPLOY_NOW.md
# Полная настройка → VERCEL_ENV_SETUP.md

# Поехали! 🚀
```
