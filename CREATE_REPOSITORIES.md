# 🏗️ СОЗДАНИЕ НОВЫХ РЕПОЗИТОРИЕВ
## NORMAL DANCE 0.4.0 - Реорганизация 70% OSS / 30% Commercial IP

---

## 🎯 ЦЕЛЬ

Создать чистую структуру из двух репозиториев:
- 📚 **public-repo**: 70% Open Source код
- 🔒 **private-repo**: 30% Commercial IP код

Удалить старые файлы, чтобы избежать путаницы.

---

## 📋 ПЛАН РЕОРГАНИЗАЦИИ

### 🔄 **ШАГ 1: Создание двух новых репозиториев**

#### **📚 Open Source Repository (70%)**
```bash
# Новый репозиторий:
github.com/normaldance-labs/normaldance

# Что оставить:
src/app/                    # ✅ Основные страницы
src/components/ui/           # ✅ Базовый UI
src/components/music/        # ✅ Плеер и контрлы
src/components/wallet/      # ✅ Базовые кошельки
src/lib/web3/               # ✅ Базовая Web3 интеграция
src/lib/database/            # ✅ Публичные схемы БД
src/lib/utils/               # ✅ Общие утилиты
src/hooks/use-wallet.ts      # ✅ Хуки кошельков
src/hooks/use-music.ts       # ✅ Хуки музыки
src/types/                   # ✅ TypeScript типы

# API routes (public):
src/app/api/auth/            # ✅ Аутентификация
src/app/api/tracks/          # ✅ Музыкальный каталог
src/app/api/users/           # ✅ Управление пользователями
src/app/api/playlists/      # ✅ Плейлисты

# Удалить из этого репозитория:
❌ src/gravmemorial/         # → Private
❌ src/telegram/             # → Private  
❌ src/ai/                   # → Private
❌ src/privacy/              # → Private
❌ src/mobile/               # → Private
```

#### **🔒 Commercial IP Repository (30%)**
```bash
# Новый репозиторий:
github.com/normaldance-labs/normaldance-ip (PRIVATE)

# Что перенести сюда:
src/gravmemorial/            # 🔒 G.Rave Memorial System
├── components/              #   3D винил, карточки мемориалов
├── services/                #   Управление мемориалами  
├── blockchain/              #   Взаимодействие с блокчейном
└── contracts/               #   Смарт контракты

src/telegram/                # 🔒 Telegram Mini App
├── mini-app/                #   Mini приложение
├── bot-api/                 #   API бота
├── payments/                #   Обработка Stars платежей
└── ton-connect/             #   Подключение TON кошелька

src/ai/                      # 🔒 AI Recommendation Engine
├── models/                  #   ML модели
├── recommendation/           #   Движок рекомендаций
├── analytics/                #   Аналитика пользователей
└── training/                #   Обучение моделей

src/privacy/                 # 🔒 ZK-Privacy System
├── zk-proofs/               #   Zero-knowledge алгоритмы
├── secure-storage/           #   Зашифрованное хранилище
└── anonymization/           #   Анонимизация данных

src/mobile/                  # 🔒 Mobile Optimization
├── adaptive-bitrate/        #   Оптимизация битрейта
├── battery-optimizer/       #   Оптимизация батареи
├── offline-cache/            #   Офлайн кэш
└── touch-optimization/      #   Touch интерфейс

src/lib/bridge/              # 🔒 Bridge система
├── bridge-client.ts          #   Клиент bridge API
├── bridge-server.ts          #   Сервер bridge API
└── auth.ts                   #   Bridge аутентификация

src/monitoring/security-monitor.ts  # 🔒 Безопасность Commercial IP

# API endpoints (private):
src/app/api/gravmemorial/    # 🔒 G.Rave API
src/app/api/telegram/        # 🔒 Telegram API
src/app/api/ai/              # 🔒 AI API
src/app/api/privacy/         # 🔒 Privacy API
src/app/api/mobile/          # 🔒 Mobile API
src/app/api/auth/bridge-token/ # 🔒 Bridge аутентификация
```

### 🗑️ **ШАГ 2: Удаление старых файлов**

#### **Удалить из старого репозитория:**
```bash
# Директории для удаления:
rm -rf src/gravmemorial/      # ❌ Переехало в private
rm -rf src/telegram/          # ❌ Переехало в private
rm -rf src/ai/                # ❌ Переехало в private
rm -rf src/privacy/           # ❌ Переехало в private
rm -rf src/mobile/            # ❌ Переехало в private

# Файлы для удаления:
rm src/lib/bridge/bridge-client.ts  # ❌ Переехало в private
rm src/monitoring/security-monitor.ts  # ❌ Переехало в private

# Сгенерированные файлы:
rm -rf deployments/
rm -rf artifacts/
rm -rf build-reports/
```

---

## 🚀 ИНСТРУКЦИЯ ПЕРЕНОСА

### 💻 **Шаг за шагом для CLI**

#### **1. Создание новых репозиториев на GitHub**
```bash
# Создать через GitHub UI:
# Repository 1: normaldance-labs/normaldance (Public)
# Repository 2: normaldance-labs/normaldance-ip (Private)
```

#### **2. Клонировать текущий репозиторий**
```bash
# Рабочая директория
cd ~/workspace
git clone git@github.com:AENDYSTUDIO/NORMALDANCE-REVOLUTION.git old-normaldance
cd old-normaldance
```

#### **3. Создать и подготовить public репозиторий**
```bash
# Перейти в рабочую директорию
cd ~/workspace

# Клонировать как новый public репозиторий
git clone git@github.com:normaldance-labs/normaldance.git normaldance-oss
cd normaldance-oss

# Копировать базовые файлы из старого репозитория
cp -r ../old-normaldance/package*.json ./
cp -r ../old-normaldance/tsconfig*.json ./
cp -r ../old-normaldance/tailwind* ./
cp -r ../old-normaldance/.env.* ./
cp -r ../old-normaldance/next.config* ./
cp -r ../old-normaldance/vercel.json ./
cp -r ../old-normaldance/.gitignore ./
cp -r ../old-normaldance/README.md ./

# Создать структуру директорий
mkdir -p src/{app,components,lib,hooks,types}
mkdir -p src/app/api/{auth,tracks,users,playlists}
mkdir -p src/components/{ui,music,wallet}
mkdir -p src/lib/{web3,database,utils}
mkdir -p scripts
mkdir -p public

# Копировать только OSS файлы
cp -r ../old-normaldance/src/app/api/auth ./src/app/api/
cp -r ../old-normaldance/src/app/api/tracks ./src/app/api/
cp -r ../old-normaldance/src/app/api/users ./src/app/api/
cp -r ../old-normaldance/src/app/api/playlists ./src/app/api/

cp -r ../old-normaldance/src/components/ui ./src/components/
cp -r ../old-normaldance/src/components/music ./src/components/
cp -r ../old-normaldance/src/components/wallet ./src/components/

cp -r ../old-normaldance/src/lib/web3 ./src/lib/
cp -r ../old-normaldance/src/lib/database ./src/lib/
cp -r ../old-normaldance/src/lib/utils ./src/lib/

cp -r ../old-normaldance/src/hooks ./src/hooks/
cp -r ../old-normaldance/src/types ./src/types/

# Копировать конфигурационные файлы для OSS
cp -r ../old-normaldance/scripts/deploy-opensource.sh ./scripts/
cp ../old-normaldance/vercel.json ./vercel.json

# Удалить private зависимости из package.json
npm remove \
  @tensorflow/tfjs \
  @tonconnect/sdk \
  zero-knowledge-proofs \
  mobile-optimization-algo \
  ai-model-loader

# Добавить первые коммиты
git add .
git commit -m "🎯 Initial OSS repository - 70% Open Source components

✅ Features included:
- Music catalog and browsing
- Web3 wallet integrations  
- User authentication and profiles
- Music player and playlists
- Basic API endpoints

📁 Structure: Clean OSS architecture
🎯 Ready for deployment to normaldance.online" 

git push origin main
```

#### **4. Создать и подготовить private репозиторий**
```bash
# Перейти в рабочую директорию
cd ~/workspace

# Клонировать private репозиторий
git clone git@github.com:normaldance-labs/normaldance-ip.git normaldance-ip
cd normaldance-ip

# Копировать базовые файлы
cp -r ../old-normaldance/package*.json ./
cp -r ../old-normaldance/tsconfig*.json ./
cp -r ../old-normaldance/tailwind* ./
cp -r ../old-normaldance/next.config.private.ts ./next.config.ts
cp -r ../old-normaldance/vercel.private.json ./vercel.json
cp -r ../old-normaldance/.gitignore ./
cp -r ../old-normaldance/.env.* ./src/

# Создать структуру для private IP
mkdir -p src/{gravmemorial,telegram,ai,privacy,mobile}
mkdir -p src/{lib/bridge,monitoring}
mkdir -p src/app/api/{gravmemorial,telegram,ai,privacy,mobile,auth}
mkdir -p scripts
mkdir -p public

# Копировать commercial IP компоненты
cp -r ../old-normaldance/src/gravmemorial ./src/
cp -r ../old-normaldance/src/telegram ./src/
cp -r ../old-normaldance/src/ai ./src/
cp -r ../old-normaldance/src/privacy ./src/
cp -r ../old-normaldance/src/mobile ./src/

# Копировать bridge систему
cp -r ../old-normaldance/src/lib/bridge ./src/lib/
cp -r ../old-normaldance/src/monitoring/security-monitor.ts ./src/monitoring/

# Копировать private API endpoints
cp -r ../old-normaldance/src/app/api/gravmemorial ./src/app/api/
cp -r ../old-normaldance/src/app/api/telegram ./src/app/api/
cp -r ../old-normaldance/src/app/api/ai ./src/app/api/
cp -r ../old-normaldance/src/app/api/privacy ./src/app/api/
cp -r ../old-normaldance/src/app/api/mobile ./src/app/api/

# Копировать deployment скрипты
cp -r ../old-normaldance/scripts/deploy-commercial.sh ./scripts/

# Копировать коммерческую конфигурацию
cp ../old-normaldance/vercel.private.json ./vercel.json

# Удалить OSS зависимости из package.json (оставить только private)
# Сохранить только основные зависимости (Next.js, React, TypeScript)
# Добавить коммерческие зависимости:
npm install \
  @tensorflow/tfjs \
  @tonconnect/sdk \
  zero-knowledge-proofs \
  mobile-optimization-algo \
  ai-model-loader \
  private-crypto-provider

# Создать .env.production.commercial
cat > .env.production.commercial << 'EOF'
# COMMERCIAL IP ENVIRONMENT - NORMAL DANCE 0.4.0
BRIDGE_SECRET_KEY=$(openssl rand -hex 32)
BRIDGE_SIGNATURE_SECRET=$(openssl rand -hex 64)
AI_MODEL_KEY=your-ai-model-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
GRAVE_CONTRACT_ADDRESS=deployed-contract-address
PRIVATE_API_ENCRYPTION_KEY=$(openssl rand -hex 48)
ZK_PROVERIFIER_KEY=$(openssl rand -hex 32)
MOBILE_ALGORITHM_KEY=$(openssl rand -hex 32)
COMMERCIAL_WEBHOOK_SECRET=$(openssl rand -hex 24)
IPFS_ENCRYPTION_KEY=$(openssl rand -hex 40)
EOF

# Добавить коммит
git add .
git commit -m "🔒 Initial Commercial IP repository - 30% Private components

🔒 Commercial IP Features:
- G.Rave Memorial System (3D vinyl, smart contracts)
- Telegram Mini App (Stars integration, TON connectivity)  
- AI Recommendation Engine (proprietary ML models)
- ZK-Privacy System (zero-knowledge proofs)
- Mobile Optimization (battery saving, adaptive bitrate)

🛡️ Security Features:
- Secure bridge authentication system
- Enterprise-grade encryption
- Zero-knowledge privacy protection
- Rate limiting and IP reputation
- Comprehensive security monitoring

💰 Revenue Streams:
- 2% platform fee on memorial donations  
- 70% split of Telegram Stars revenue
- Premium AI recommendations subscriptions
- Privacy tier subscriptions
- Mobile optimization licensing

🚀 Ready for deployment to app.normaldance.online domain

🔐 Repository access: TEAM ONLY - Commercial IP protected"

git push origin main
```

#### **5. Обновить старый репозиторий**
```bash
cd ~/workspace/old-normaldance

# Сохранить только документацию и истории
cp -r ../old-normaldance/*.md ./
cp -r ../old-normaldance/docs/ ./
cp -r ../old-normaldance/sales-packet/ ./

# Создать README с информацией о перемещении
cat > README.md << 'EOF'
# ⚠️ РЕПОЗИТОРИЙ ПЕРЕЕХАЛ

Этот репозиторий был реорганизован в два отдельных репозитория:

## 📚 Open Source Repository (70%)  
**Ссылка:** https://github.com/normaldance-labs/normaldance

**Содержит:**
- Музыкальный каталог и браузинг
- Web3 интеграция кошельков  
- Аутентификация пользователей
- Базовый плеер и плейлисты
- Публичные API эндпоинты

## 🔒 Commercial IP Repository (30%)
**Ссылка:** https://github.com/normaldance-labs/normaldance-ip *(Private)*

**Содержит:**
- G.Rave Memorial System
- Telegram Mini App
- AI Recommendation Engine  
- ZK-Privacy System
- Mobile Optimization

## 🚀 Следующие шаги:
1. Клонировать `normaldance-oss` для разработки OSS частей
2. Запросить доступ к `normaldance-ip` для коммерческих компонентов
3. Bridge система обеспечит бесшовную интеграцию

## 💬 Вопросы?
Создать issue в одном из новых репозиториев.

---
*Рекомендации по архитектуре и развертыванию остались в документации.*
EOF

# Удалить большой бинарные файлы
rm -rf node_modules/
rm -rf .next/
rm -rf build/
rm -rf *.log
rm -rf dist/
rm -rf coverage/

# Финальный коммит
git add .
git commit -m "📁 Reorganized repository structure

✨ Moved to two-repository architecture:
- 📚 normaldance-labs/normaldance (70% OSS)
- 🔒 normaldance-labs/normaldance-ip (30% Commercial IP)

🗂️ This repository now contains only documentation
🚀 All active development moved to new repos

Bridge system provides seamless integration between components."

# Заархивировать старый репозиторий
git tag archive-before-restructure-$(date +%Y%m%d)
git push origin archive-before-restructure-$(date +%Y%m%d)
```

---

## 🔧 ОБНОВЛЕНИЯ ВНУТРЕННИХ ФАЙЛОВ

### 📝 **Обновить package.json в OSS репозитории**
```json
{
  "name": "normaldance-oss",
  "version": "0.4.0",
  "description": "Open Source music platform components (70%)",
  "repository": "https://github.com/normaldance-labs/normaldance",
  "license": "MIT"
}
```

### 📝 **Обновить package.json в Private репозитории**
```json
{
  "name": "normaldance-commercial-ip",
  "version": "0.4.0", 
  "description": "Commercial IP components (30%) - Private repository",
  "repository": "git@github.com:normaldance-labs/normaldance-ip.git",
  "license": "PROPRIETARY",
  "private": true
}
```

---

## 🎯 РЕЗУЛЬТАТ ОРГАНИЗАЦИИ

### ✅ **Чистая структура:**
- **public-repo**: Только OSS код, без коммерческих алгоритмов
- **private-repo**: Только коммерческий IP, с полной защитой
- **bridge-система**: Безопасная связь между репозиториями

### 🚀 **Преимущества:**
- 🛡️ **Полная защита коммерческого IP**
- 👥 **OSS сообщество может видеть только открытый код**
- 💰 **Commercial алгоритмы полностью скрыты**
- 🔗 **Bridge обеспечивает бесшовную интеграцию**
- 📈 **Масштабируемая архитектура**

---

## 🎉 ЗАВЕРШЕНИЕ

После этих шагов у вас будет:

1. **`normaldance-labs/normaldance`** - Публичный репозиторий (70%)
2. **`normaldance-labs/normaldance-ip`** - Приватный репозиторий (30%)  
3. **Bridge аутентификация** между ними
4. **Чистые репозитории** без путаницы в коде
5. **Готовность к развертыванию** на Vercel

**Следующий шаг:** Запустить deployment скрипты для каждого репозитория!

---

## 🚀 СРАЗУ ПОСЛЕ СОЗДАНИЯ РЕПОЗИТОРИЕВ

### ⚡ **Immediate Actions:**
```bash
# 1. Клонировать OSS репозиторий для работы
git clone https://github.com/normaldance-labs/normaldance.git
cd normaldance

# 2. Запустить OSS развертывание
./scripts/deploy-opensource.sh --prod-only

# 3. Запросить доступ к private репозиторию
# 4. После доступа - запустить commercial развертывание
./scripts/deploy-commercial.sh --auto-confirm
```

### 🎯 **Final Result:**
```bash
✨ https://normaldance.online (OSS components)
🔒 https://app.normaldance.online (Commercial API)
🎹 https://grave.app.normaldance.online (G.Rave)  
📱 https://telegram.app.normaldance.online (Mini App)
```

**🎉 ГОТОВО К ЗАПУСКУ И ЗАРАБАТЫВАНИЮ!**
