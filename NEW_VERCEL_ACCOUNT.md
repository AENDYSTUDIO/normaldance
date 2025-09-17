# Создание нового аккаунта Vercel для NORMALDANCE

## 🆕 Регистрация нового аккаунта Vercel

### Шаг 1: Регистрация
1. **Откройте**: https://vercel.com/signup
2. **Выберите**: "Continue with GitHub"
3. **Создайте новый GitHub аккаунт** (если нужно):
   - Email: ваш-email@gmail.com
   - Username: normaldance-dev (или подобный)
   - Password: надежный пароль

### Шаг 2: Настройка GitHub
1. **Создайте новый репозиторий**:
   - Название: `normaldance`
   - Описание: `Web3 Music Platform`
   - Публичный или приватный (по желанию)

2. **Загрузите код**:
   ```bash
   git clone https://github.com/your-username/normaldance.git
   cd normaldance
   # Скопируйте файлы проекта
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### Шаг 3: Подключение к Vercel
1. **Войдите в Vercel** с новым аккаунтом
2. **Нажмите**: "New Project"
3. **Импортируйте**: ваш GitHub репозиторий
4. **Выберите**: NORMALDANCE проект

### Шаг 4: Настройка проекта
1. **Framework Preset**: Next.js
2. **Root Directory**: `./` (по умолчанию)
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next` (по умолчанию)
5. **Install Command**: `npm install`

## 🔧 Настройка переменных окружения

### Базовые переменные:
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Для тестирования (можно оставить пустыми):
```bash
DATABASE_URL=
REDIS_URL=
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your_super_secret_key_change_me
PINATA_API_KEY=
PINATA_SECRET_KEY=
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WS_URL=wss://api.mainnet-beta.solana.com
NDT_PROGRAM_ID=
TRACKNFT_PROGRAM_ID=
STAKING_PROGRAM_ID=
```

## 🚀 Быстрое развертывание

### Вариант 1: Через веб-интерфейс
1. **Импортируйте** репозиторий в Vercel
2. **Настройте** переменные окружения
3. **Нажмите** "Deploy"
4. **Ждите** завершения (2-3 минуты)

### Вариант 2: Через CLI
```bash
# Установите Vercel CLI
npm install -g vercel

# Войдите в новый аккаунт
vercel login

# Разверните проект
vercel --prod
```

## 📊 Что получите

### Бесплатный план Vercel:
- ✅ **100GB bandwidth** в месяц
- ✅ **100GB storage**
- ✅ **100 serverless functions**
- ✅ **Unlimited static sites**
- ✅ **1 custom domain**
- ✅ **SSL сертификаты**
- ✅ **Глобальный CDN**

### После развертывания:
- 🌐 **URL**: https://your-project.vercel.app
- 📊 **Dashboard**: https://vercel.com/dashboard
- 📝 **Логи**: доступны в реальном времени
- 🔧 **Настройки**: легко изменяются

## 🎯 Следующие шаги

### После успешного развертывания:
1. **Протестируйте** базовую функциональность
2. **Настройте** внешние сервисы (если нужно)
3. **Подключите** custom domain (если есть)
4. **Оптимизируйте** производительность

### Если нужна полная функциональность:
1. **Подключите** PlanetScale (база данных)
2. **Настройте** Upstash (Redis)
3. **Интегрируйте** Pusher (WebSocket)
4. **Или переходите** на Cloud.ru для полного контроля

## 💡 Советы

### Для нового аккаунта:
- ✅ Используйте **отдельный email**
- ✅ Создайте **отдельный GitHub аккаунт**
- ✅ Сохраните **логин и пароль**
- ✅ Настройте **2FA** для безопасности

### Для проекта:
- ✅ Начните с **базового развертывания**
- ✅ Добавляйте **функциональность постепенно**
- ✅ Тестируйте **каждое изменение**
- ✅ Мониторьте **использование ресурсов**

**Готовы создать новый аккаунт Vercel для NORMALDANCE?**
