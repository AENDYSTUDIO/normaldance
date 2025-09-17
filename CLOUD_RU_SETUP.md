# Cloud.ru Configuration for NORMALDANCE

## 🇷🇺 Cloud.ru Setup with Your API Key

### Your Cloud.ru Credentials:
- **API Key**: `7d6d24281a43e50068d35d63f7ead515`
- **Customer ID**: `fd8aec7e-aeba-4626-be40-87d9520dc825`
- **Project ID**: `ce41b029-e7ce-4100-b3b3-c38272211b05`
- **Dashboard**: https://partners.cloud.ru/profile/apiKeys

## 💰 Budget Analysis for 1500₽

### Cloud.ru Pricing (российские цены):
- **VPS Basic**: 500-800₽/месяц
- **PostgreSQL**: 300-500₽/месяц  
- **Redis**: 200-300₽/месяц
- **Load Balancer**: 200-400₽/месяц

### Проблема с бюджетом:
- **Минимальная конфигурация**: 400₽/месяц × 12 = **4800₽/год** ❌
- **Ваш бюджет**: 1500₽/год
- **Недостаток**: 3300₽

## 🎯 Оптимальное решение

### **Рекомендация: Cloud.ru + Freenom (БЕСПЛАТНО)**

#### **Этап 1: Бесплатный пробный период (0₽)**
```
Домен: normaldance.tk (Freenom) - 0₽
Хостинг: Cloud.ru (30 дней пробный) - 0₽
Итого: 0₽/месяц (первые 30 дней)
```

#### **Этап 2: После пробного периода**
- **Вариант A**: Перейти на Railway (бесплатно)
- **Вариант B**: Оптимизировать Cloud.ru (минимальная конфигурация)
- **Вариант C**: Гибридное решение

## 🚀 Пошаговый план развертывания

### **Шаг 1: Регистрация домена (5 минут)**
1. Идите на https://freenom.com
2. Зарегистрируйте `normaldance.tk`
3. Стоимость: **0₽**

### **Шаг 2: Настройка Cloud.ru (10 минут)**
1. Войдите в https://partners.cloud.ru
2. Используйте ваш API ключ: `7d6d24281a43e50068d35d63f7ead515`
3. Создайте новый проект

### **Шаг 3: Развертывание (15 минут)**
```bash
# Запустите скрипт развертывания
./scripts/deploy-cloud-ru.sh
```

### **Шаг 4: Настройка DNS (5 минут)**
1. В Freenom настройте DNS:
   - A-запись: @ → IP Cloud.ru
   - CNAME: www → ваш-проект.cloud.ru

## 🔧 Cloud.ru Configuration Files

### 1. Dockerfile.cloud.ru
```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/server.js ./

USER nextjs
EXPOSE 3000 3001
CMD ["node", "server.js"]
```

### 2. cloud.ru.yml
```yaml
name: normaldance
region: ru-1
services:
  app:
    type: container
    image: normaldance:latest
    ports:
      - 3000:3000
      - 3001:3001
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NEXTAUTH_URL=https://normaldance.tk
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    resources:
      cpu: 1
      memory: 1Gi
    replicas: 1

  database:
    type: postgresql
    version: "15"
    resources:
      cpu: 0.5
      memory: 512Mi
      storage: 10Gi

  redis:
    type: redis
    version: "7"
    resources:
      cpu: 0.25
      memory: 256Mi
      storage: 1Gi
```

## 📊 Сравнение решений

| Решение | Стоимость | Локация | Поддержка | Рекомендация |
|---------|-----------|---------|-----------|--------------|
| Cloud.ru + Freenom | 0₽ (пробный) | 🇷🇺 Россия | 🇷🇺 Русский | ⭐⭐⭐⭐⭐ |
| Railway + Freenom | 0₽ | 🌍 Глобальный | 🇺🇸 Английский | ⭐⭐⭐⭐ |
| Render + Freenom | 0₽ | 🌍 Глобальный | 🇺🇸 Английский | ⭐⭐⭐ |

## 🎯 Итоговая рекомендация

### **Для бюджета 1500₽:**

1. **Начните с Cloud.ru** (бесплатный пробный период)
2. **Используйте Freenom** для домена (бесплатно)
3. **Тестируйте 30 дней** бесплатно
4. **После пробного периода** переходите на Railway

### **Преимущества этого подхода:**
- ✅ **0₽** в первые 30 дней
- ✅ **Русская поддержка** Cloud.ru
- ✅ **Быстрый доступ** из России
- ✅ **Полная функциональность** Web3
- ✅ **Резервный план** на Railway

### **Ваш бюджет 1500₽ остается свободным для:**
- Маркетинг и реклама
- Дополнительные сервисы
- Резервный фонд
- Разработка новых функций

## 🚀 Готовые файлы для развертывания:

- ✅ `CLOUD_RU_DEPLOYMENT.md` - полная инструкция
- ✅ `scripts/deploy-cloud-ru.sh` - скрипт развертывания
- ✅ `Dockerfile.cloud.ru` - конфигурация Docker
- ✅ `cloud.ru.yml` - конфигурация сервисов

**Готовы начать развертывание на Cloud.ru?**
