# 🚀 NORMAL DANCE - Production Ready

## Быстрый старт деплоя

### Метод 1: Vercel Dashboard (Рекомендуется)

1. Откройте https://vercel.com/new
2. Войдите через GitHub
3. Выберите репозиторий `AENDYSTUDIO/NormalDance`
4. Нажмите "Deploy"

**Готово!** Ваш сайт будет доступен через 2-3 минуты.

---

### Метод 2: Автоматический скрипт

```bash
# Запустите скрипт деплоя
./deploy.sh

# Выберите опцию:
# 1 - Production deploy
# 2 - Preview deploy
# 3 - Setup (первый раз)
```

---

### Метод 3: Vercel CLI вручную

```bash
# Установите Vercel CLI
npm install -g vercel

# Войдите в Vercel
vercel login

# Деплой на production
vercel --prod
```

---

## 📁 Структура проекта

```
NormalDance/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DemoPage.tsx       # Главная страница
│   │   │   ├── DashboardNew.tsx   # Dashboard с auth
│   │   │   └── ...
│   │   └── components/
│   └── index.html
├── server/                 # Backend (Node.js + Express)
│   └── _core/
├── dist/                   # Build output
│   ├── public/            # Frontend build
│   └── index.js           # Backend build
├── vercel.json            # Vercel configuration
├── package.json
└── deploy.sh              # Deployment script
```

---

## ⚙️ Environment Variables

### Обязательные для production:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
SESSION_SECRET=your_secret_key
OAUTH_SERVER_URL=https://your-domain.vercel.app
VITE_APP_TITLE=NORMAL DANCE
VITE_OAUTH_PORTAL_URL=https://your-domain.vercel.app
VITE_APP_ID=normaldance
```

### Опциональные:

```env
TELEGRAM_BOT_TOKEN=...
SOLANA_RPC_URL=...
ETHEREUM_RPC_URL=...
PINATA_API_KEY=...
```

**Полный список:** см. `.env.production.example`

---

## 🔧 Build Configuration

### Vercel Settings:

```
Framework Preset: Other
Build Command: npm run build
Output Directory: dist/public
Install Command: npm install --legacy-peer-deps
Node Version: 18.x
```

---

## 🌐 После деплоя

### Ваш сайт будет доступен:

```
Production: https://normaldance.vercel.app
Preview: https://normaldance-git-branch.vercel.app
```

### Автоматический деплой:

✅ Каждый push в `main` → автоматический production deploy
✅ Каждый PR → preview deploy
✅ Rollback в один клик через Vercel Dashboard

---

## 📊 Мониторинг

### Vercel Dashboard предоставляет:

- 📈 Real-time analytics
- 🚀 Deployment history
- 📝 Build logs
- ⚡ Performance metrics
- 🔍 Error tracking
- 🌍 Global CDN stats

---

## 🔒 Безопасность

### Настроено:

- ✅ HTTPS (автоматический SSL)
- ✅ Content Security Policy
- ✅ CORS headers
- ✅ Rate limiting (через Vercel)
- ✅ Environment variables encryption

---

## 🎯 Checklist перед деплоем

- [ ] Все зависимости установлены
- [ ] `npm run build` работает локально
- [ ] Environment variables подготовлены
- [ ] Database настроена
- [ ] Vercel аккаунт создан
- [ ] GitHub репозиторий доступен
- [ ] Domain name готов (опционально)

---

## 📚 Документация

- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Полная инструкция
- [DASHBOARD_UPDATE.md](./DASHBOARD_UPDATE.md) - Описание функционала
- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - Итоги разработки

---

## 🆘 Troubleshooting

### Build fails?
```bash
# Проверьте локально
npm install --legacy-peer-deps
npm run build
```

### Database connection error?
- Проверьте `DATABASE_URL` в Vercel Environment Variables
- Используйте Vercel Postgres или внешнюю БД

### Module not found?
- Убедитесь что Install Command: `npm install --legacy-peer-deps`

---

## 🚀 Production URL

После деплоя ваш сайт будет доступен по адресу:

```
https://normaldance.vercel.app
```

или с custom domain:

```
https://normaldance.com
```

---

## 📞 Поддержка

- [Vercel Support](https://vercel.com/support)
- [GitHub Issues](https://github.com/AENDYSTUDIO/NormalDance/issues)
- [Vercel Docs](https://vercel.com/docs)

---

**Проект готов к production! 🎉**

Следуйте инструкциям выше для деплоя.
