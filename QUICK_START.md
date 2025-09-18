# 🚀 NORMALDANCE - Быстрый запуск

## 1. Первоначальная настройка

```bash
# Запусти setup
setup-quick.bat
```

## 2. Запуск разработки

```bash
# Запусти dev сервер
start-dev.bat
```

## 3. Проверь что работает

- 🌐 **Сайт**: http://localhost:3000
- 🏥 **Health**: http://localhost:3000/api/health  
- 📊 **Analytics**: http://localhost:3000/api/analytics

## 4. Если что-то не работает

### База данных
```bash
npx prisma db push
npx prisma generate
```

### Зависимости
```bash
npm install
```

### Папки
```bash
mkdir uploads
mkdir uploads\audio
mkdir uploads\images
```

## 5. Для продакшена

1. Получи бесплатный Redis на [Upstash](https://upstash.com)
2. Добавь в `.env.local`:
```env
UPSTASH_REDIS_REST_URL=твой_url
UPSTASH_REDIS_REST_TOKEN=твой_токен
```
3. Запусти: `deploy-optimized.sh`

## 🎯 Готово!

Теперь у тебя работает:
- ✅ Безопасность (rate limiting, headers)
- ✅ Кеширование (memory/redis)
- ✅ Мониторинг (health, analytics)
- ✅ Оптимизация (images, performance)