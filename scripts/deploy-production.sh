#!/bin/bash
# Скрипт развертывания NORMALDANCE на сервере

set -e

echo "🚀 Развертывание NORMALDANCE на сервере..."

# Переход в директорию проекта
cd /opt/normaldance

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose down || true

# Создание production docker-compose
echo "📝 Создание production конфигурации..."
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://normaldance:normaldance_secure_password@db:5432/normaldance
      - NEXTAUTH_URL=https://your-domain.com
      - NEXTAUTH_SECRET=your_super_secret_key_change_me
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - IPFS_GATEWAY=https://ipfs.io/ipfs/
      - PINATA_API_KEY=your_pinata_api_key
      - PINATA_SECRET_KEY=your_pinata_secret_key
    volumes:
      - ./uploads:/app/uploads
      - ./cache:/app/cache
      - ./logs:/app/logs
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=normaldance
      - POSTGRES_USER=normaldance
      - POSTGRES_PASSWORD=normaldance_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U normaldance -d normaldance"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  postgres_data:
  redis_data:
EOF

# Создание .env файла
echo "🔐 Создание .env файла..."
cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL=postgresql://normaldance:normaldance_secure_password@db:5432/normaldance
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_super_secret_key_change_me
REDIS_HOST=redis
REDIS_PORT=6379
IPFS_GATEWAY=https://ipfs.io/ipfs/
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WS_URL=wss://api.mainnet-beta.solana.com
NDT_PROGRAM_ID=your_ndt_program_id
TRACKNFT_PROGRAM_ID=your_tracknft_program_id
STAKING_PROGRAM_ID=your_staking_program_id
EOF

# Сборка и запуск
echo "🔨 Сборка и запуск приложения..."
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Ожидание готовности базы данных
echo "⏳ Ожидание готовности базы данных..."
sleep 30

# Запуск миграций
echo "🗄️ Запуск миграций базы данных..."
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Генерация Prisma клиента
echo "🔧 Генерация Prisma клиента..."
docker-compose -f docker-compose.prod.yml exec app npx prisma generate

# Проверка статуса
echo "✅ Проверка статуса сервисов..."
docker-compose -f docker-compose.prod.yml ps

echo "🎉 Развертывание завершено!"
echo "🌐 Приложение доступно по адресу: https://your-domain.com"
echo "📊 Мониторинг: docker-compose -f docker-compose.prod.yml logs -f"
