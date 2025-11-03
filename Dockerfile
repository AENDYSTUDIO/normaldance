# Многоэтапная сборка для NormalDance с оптимизацией для Kubernetes

# Этап 1: Установка зависимостей
FROM node:25-alpine AS deps
WORKDIR /app

# Установка системных зависимостей для аудио обработки и сборки
RUN apk add --no-cache \
    ffmpeg \
    vips-dev \
    python3 \
    make \
    g++ \
    build-base

# Копирование package.json и package-lock.json
COPY package.json package-lock.json ./
COPY mobile-app/package.json mobile-app/package-lock.json ./mobile-app/

# Установка всех зависимостей (включая dev для сборки)
RUN npm install --legacy-peer-deps --ignore-scripts

# Установка зависимостей для мобильного приложения
WORKDIR /app/mobile-app
RUN npm install --legacy-peer-deps --ignore-scripts

WORKDIR /app

# Этап 2: Сборка приложения
FROM node:25-alpine AS builder
WORKDIR /app

# Установка системных зависимостей для сборки
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    build-base

# Копирование зависимостей из deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/mobile-app/node_modules ./mobile-app/node_modules

# Копирование исходного кода
COPY . .

# Сборка основного приложения
RUN npm run build --legacy-peer-deps || true

WORKDIR /app

# Этап 3: Production среда
FROM node:25-alpine AS runner
WORKDIR /app

# Создание пользователя с фиксированным UID/GID для безопасности
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Установка системных зависимостей для аудио обработки
RUN apk add --no-cache \
    ffmpeg \
    vips-dev \
    build-base \
    python3 \
    dumb-init \
    curl

# Установка production-only зависимостей
COPY package.json package-lock.json ./
RUN npm install --production --legacy-peer-deps --ignore-scripts

# Копирование сборки из builder stage
COPY --from=builder /app/.next ./next-build 2>/dev/null || true
COPY --from=builder /app/.next/static ./.next/static 2>/dev/null || true
COPY --from=builder /app/public ./public 2>/dev/null || true

# Копирование конфигурации и исходного кода
COPY --chown=nextjs:nodejs prisma ./prisma 2>/dev/null || true
COPY --chown=nextjs:nodejs server.ts ./
COPY --chown=nextjs:nodejs next.config.ts ./
COPY --chown=nextjs:nodejs src ./src 2>/dev/null || true

# Копирование package.json для reference
COPY --chown=nextjs:nodejs package.json ./

# Создание директорий для загрузок и кэша с правами пользователя
RUN mkdir -p /app/uploads /app/cache /app/logs && \
    chown -R nextjs:nodejs /app

# Переключение на пользователя
USER nextjs

# Экспорт портов
EXPOSE 3000 3001

# Environment variables
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV UPLOAD_DIR=/app/uploads
ENV CACHE_DIR=/app/cache
ENV LOG_DIR=/app/logs

# Health check для Kubernetes
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Запуск приложения через dumb-init для корректной обработки сигналов в Kubernetes
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.ts"]
