# 🚀 Vercel Deployment Guide - NORMAL DANCE

## Быстрый деплой (5 минут)

### Шаг 1: Подготовка
Репозиторий уже готов к деплою: ✅
- `vercel.json` настроен
- `package.json` содержит build скрипты
- Environment variables документированы

### Шаг 2: Деплой через Vercel Dashboard

1. **Откройте Vercel**
   ```
   https://vercel.com/new
   ```

2. **Войдите через GitHub**
   - Нажмите "Continue with GitHub"
   - Авторизуйте Vercel

3. **Импортируйте репозиторий**
   - Найдите `AENDYSTUDIO/NormalDance`
   - Нажмите "Import"

4. **Настройте проект**
   ```
   Project Name: normaldance
   Framework Preset: Other (или Next.js)
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist/public
   Install Command: npm install --legacy-peer-deps
   ```

5. **Добавьте Environment Variables**
   ```env
   NODE_ENV=production
   DATABASE_URL=your_database_url
   SESSION_SECRET=your_secret_key_here
   OAUTH_SERVER_URL=https://your-domain.vercel.app
   VITE_APP_TITLE=NORMAL DANCE
   VITE_APP_LOGO=https://placehold.co/128x128/E1E7EF/1F2937?text=ND
   VITE_OAUTH_PORTAL_URL=https://your-domain.vercel.app
   VITE_APP_ID=normaldance
   ```

6. **Нажмите "Deploy"**
   - Vercel автоматически:
     - Установит зависимости
     - Соберет проект
     - Задеплоит на production

### Шаг 3: Получите URL
После деплоя вы получите:
```
https://normaldance.vercel.app
или
https://normaldance-xxx.vercel.app
```

---

## Альтернатива: Деплой через CLI

### 1. Установите Vercel CLI
```bash
npm install -g vercel
```

### 2. Войдите в Vercel
```bash
vercel login
```

### 3. Деплой
```bash
cd NormalDance
vercel --prod
```

---

## Настройка Custom Domain

### После деплоя:

1. Откройте проект в Vercel Dashboard
2. Перейдите в Settings → Domains
3. Добавьте свой домен:
   ```
   normaldance.com
   ```

4. Настройте DNS записи:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

---

## Environment Variables для Production

### Обязательные:
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=generate_random_32_char_string
OAUTH_SERVER_URL=https://normaldance.vercel.app
```

### Для Telegram:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_name
```

### Для Web3:
```env
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
```

### Для IPFS:
```env
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
```

---

## Автоматический деплой через GitHub

### Настройка:

1. **В Vercel Dashboard:**
   - Settings → Git
   - Включите "Automatic deployments from GitHub"

2. **Теперь каждый push в main будет автоматически деплоиться!**
   ```bash
   git add .
   git commit -m "Update"
   git push origin main
   # Vercel автоматически задеплоит изменения
   ```

---

## Проверка деплоя

### После успешного деплоя проверьте:

1. **Главная страница**
   ```
   https://your-domain.vercel.app/
   ```

2. **Dashboard**
   ```
   https://your-domain.vercel.app/dashboard
   ```

3. **API endpoints**
   ```
   https://your-domain.vercel.app/api/tracks
   ```

---

## Troubleshooting

### Ошибка: "Build failed"
**Решение:**
```bash
# Локально проверьте build
npm run build

# Если ошибка, исправьте и закоммитьте
git add .
git commit -m "Fix build"
git push
```

### Ошибка: "Module not found"
**Решение:**
- Проверьте `package.json`
- Убедитесь что все зависимости установлены
- Используйте `--legacy-peer-deps` в Install Command

### Ошибка: "Database connection failed"
**Решение:**
- Проверьте `DATABASE_URL` в Environment Variables
- Используйте Vercel Postgres или внешнюю БД

---

## Production Checklist

- [ ] Репозиторий импортирован в Vercel
- [ ] Environment variables настроены
- [ ] Build успешно завершен
- [ ] Сайт доступен по URL
- [ ] Custom domain настроен (опционально)
- [ ] SSL сертификат активен (автоматически)
- [ ] Automatic deployments включены
- [ ] Analytics настроен (опционально)

---

## Мониторинг

### Vercel Dashboard предоставляет:
- 📊 Analytics (посещаемость)
- 🚀 Deployment history
- 📝 Build logs
- ⚡ Performance metrics
- 🔍 Error tracking

---

## Следующие шаги

1. ✅ Деплой на Vercel
2. 🔧 Настройка базы данных (Vercel Postgres или Supabase)
3. 🤖 Интеграция Telegram Bot
4. 💰 Настройка Web3 кошельков
5. 🎵 Загрузка контента
6. 📱 Тестирование на мобильных устройствах

---

## Полезные ссылки

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Repository](https://github.com/AENDYSTUDIO/NormalDance)
- [Vercel CLI Docs](https://vercel.com/docs/cli)

---

**Проект готов к production деплою! 🚀**
