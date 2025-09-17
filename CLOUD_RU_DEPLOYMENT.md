# Cloud.ru Deployment Configuration for NORMALDANCE

## 🇷🇺 Cloud.ru Configuration

### API Key Information
- **API Key**: `7d6d24281a43e50068d35d63f7ead515`
- **Customer ID**: `fd8aec7e-aeba-4626-be40-87d9520dc825`
- **Project ID**: `ce41b029-e7ce-4100-b3b3-c38272211b05`
- **Dashboard**: https://partners.cloud.ru/profile/apiKeys

## 💰 Pricing Analysis for 1500₽ Budget

### Cloud.ru Pricing (примерные цены):
- **VPS Basic**: ~500-800₽/месяц
- **PostgreSQL**: ~300-500₽/месяц
- **Redis**: ~200-300₽/месяц
- **Load Balancer**: ~200-400₽/месяц
- **Storage**: ~100-200₽/месяц

### Budget Breakdown:
- **Домен**: 300-600₽/год (Freenom бесплатно)
- **VPS**: 600₽/месяц × 12 = 7200₽/год ❌ (превышает бюджет)
- **Минимальная конфигурация**: 400₽/месяц × 12 = 4800₽/год ❌

## 🎯 Оптимальное решение для Cloud.ru

### Вариант 1: Cloud.ru + Freenom (БЕСПЛАТНО)
```
Домен: normaldance.tk (Freenom) - 0₽
Хостинг: Cloud.ru (пробный период) - 0₽
Итого: 0₽/месяц (первые 30 дней)
```

### Вариант 2: Cloud.ru + дешевый домен
```
Домен: normaldance.ru - 600₽/год
Хостинг: Cloud.ru минимальный - 400₽/месяц
Итого: 5400₽/год (превышает бюджет)
```

### Вариант 3: Гибридное решение
```
Домен: normaldance.tk (Freenom) - 0₽
Хостинг: Railway (бесплатно) + Cloud.ru (резерв)
Итого: 0₽/месяц + резерв на Cloud.ru
```

## 🚀 Cloud.ru Deployment Setup

### 1. Cloud.ru CLI Installation
```bash
# Установка Cloud.ru CLI
curl -sSL https://cloud.ru/cli/install.sh | bash

# Настройка API ключа
cloud config set api-key 7d6d24281a43e50068d35d63f7ead515
cloud config set customer-id fd8aec7e-aeba-4626-be40-87d9520dc825
cloud config set project-id ce41b029-e7ce-4100-b3b3-c38272211b05
```

### 2. Create Cloud.ru Configuration
```yaml
# cloud.ru.yml
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
    backup:
      enabled: true
      schedule: "0 2 * * *"

  redis:
    type: redis
    version: "7"
    resources:
      cpu: 0.25
      memory: 256Mi
      storage: 1Gi
```

### 3. Environment Variables
```bash
# .env.cloud.ru
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/normaldance
REDIS_URL=redis://redis:6379
NEXTAUTH_URL=https://normaldance.tk
NEXTAUTH_SECRET=your_super_secret_key_change_me
IPFS_GATEWAY=https://ipfs.io/ipfs/
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WS_URL=wss://api.mainnet-beta.solana.com
NDT_PROGRAM_ID=your_ndt_program_id
TRACKNFT_PROGRAM_ID=your_tracknft_program_id
STAKING_PROGRAM_ID=your_staking_program_id
```

### 4. Docker Configuration for Cloud.ru
```dockerfile
# Dockerfile.cloud.ru
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
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

## 🔧 Cloud.ru Specific Scripts

### 1. Deploy Script
```bash
#!/bin/bash
# scripts/deploy-cloud-ru.sh

set -e

echo "🚀 Deploying NORMALDANCE to Cloud.ru..."

# Build Docker image
echo "📦 Building Docker image..."
docker build -f Dockerfile.cloud.ru -t normaldance:latest .

# Tag for Cloud.ru registry
echo "🏷️ Tagging image..."
docker tag normaldance:latest cloud.ru/normaldance:latest

# Push to Cloud.ru registry
echo "📤 Pushing to Cloud.ru registry..."
docker push cloud.ru/normaldance:latest

# Deploy to Cloud.ru
echo "🚀 Deploying to Cloud.ru..."
cloud deploy -f cloud.ru.yml

# Wait for deployment
echo "⏳ Waiting for deployment..."
cloud status

echo "✅ Deployment completed!"
echo "🌐 Application available at: https://normaldance.tk"
```

### 2. Monitoring Script
```bash
#!/bin/bash
# scripts/monitor-cloud-ru.sh

echo "📊 NORMALDANCE Cloud.ru Status"
echo "================================"

# Check application status
echo "🔍 Application Status:"
cloud status app

# Check database status
echo "🗄️ Database Status:"
cloud status database

# Check Redis status
echo "🔴 Redis Status:"
cloud status redis

# Check logs
echo "📝 Recent Logs:"
cloud logs app --tail=50

# Check resource usage
echo "💾 Resource Usage:"
cloud metrics app
```

## 📊 Cloud.ru vs Other Providers

| Feature | Cloud.ru | Railway | Render | Hetzner |
|---------|----------|---------|--------|---------|
| Location | 🇷🇺 Russia | 🌍 Global | 🌍 Global | 🇩🇪 Germany |
| Price | 400-800₽/месяц | $5/месяц | 750h/месяц | €4.79/месяц |
| Support | 🇷🇺 Russian | 🇺🇸 English | 🇺🇸 English | 🇩🇪 German |
| PostgreSQL | ✅ | ✅ | ✅ | ✅ |
| Redis | ✅ | ✅ | ✅ | ✅ |
| SSL | ✅ | ✅ | ✅ | ✅ |
| Custom Domain | ✅ | ✅ | ✅ | ✅ |

## 🎯 Recommended Strategy

### Phase 1: Free Trial (0₽)
1. **Register domain**: normaldance.tk (Freenom)
2. **Start Cloud.ru trial**: 30 days free
3. **Deploy application**: Use provided scripts
4. **Test functionality**: Full Web3 features

### Phase 2: Budget Planning (1500₽)
1. **Monitor usage**: Track Cloud.ru consumption
2. **Optimize costs**: Use minimal resources
3. **Plan scaling**: Based on user growth
4. **Reserve budget**: For unexpected costs

### Phase 3: Production (Post-trial)
1. **Choose plan**: Based on actual usage
2. **Scale resources**: As needed
3. **Monitor costs**: Stay within budget
4. **Optimize**: Reduce unnecessary services

## 💡 Tips for Cloud.ru

- Use Cloud.ru CLI for automation
- Monitor resource usage regularly
- Set up alerts for cost limits
- Use Cloud.ru's built-in monitoring
- Take advantage of Russian support
- Consider Cloud.ru's CDN for better performance in Russia
