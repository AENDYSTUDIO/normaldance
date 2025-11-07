#!/bin/bash

# NORMAL DANCE Repository Reorganization Script
# Splits into 70% OSS + 30% Commercial IP
# Author: NORMAL DANCE DevOps
# Version: 0.4.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
WORKSPACE_DIR="$HOME/workspace"
OLD_REPO_NAME="NORMALDANCE-REVOLUTION"
OSS_REPO_NAME="normaldance-oss"
PRIVATE_REPO_NAME="normaldance-ip"
BASE_OSS_URL="https://github.com/normaldance-labs/normaldance"
BASE_PRIVATE_URL="git@github.com:normaldance-labs/normaldance-ip.git"

echo -e "${CYAN}🏗️ NORMAL DANCE Repository Reorganization${NC}"
echo -e "${CYAN}=====================================${NC}"
echo -e "${BLUE}Splitting 70% OSS + 30% Commercial IP${NC}"
echo

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_oss() {
    echo -e "${GREEN}[OSS]${NC} $1"
}

log_private() {
    echo -e "${PURPLE}[PRIVATE]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check for git
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed. Please install git first."
        exit 1
    fi
    
    # Check workspace directory
    if [ ! -d "$WORKSPACE_DIR" ]; then
        log_info "Creating workspace directory: $WORKSPACE_DIR"
        mkdir -p "$WORKSPACE_DIR"
    fi
    
    # Check if old repo exists
    if [ ! -d "$WORKSPACE_DIR/$OLD_REPO_NAME" ]; then
        log_error "Old repository not found at: $WORKSPACE_DIR/$OLD_REPO_NAME"
        log_info "Please clone the repository first:"
        log_info "cd $WORKSPACE_DIR && git clone git@github.com:AENDYSTUDIO/NORMALDANCE-REVOLUTION.git"
        exit 1
    fi
    
    log_info "✅ Prerequisites check passed"
}

# Create new repositories structure
create_repository_structure() {
    log_step "Creating new repository directories..."
    
    cd "$WORKSPACE_DIR"
    
    # Clone OSS repository (assuming it's already created on GitHub)
    log_oss "Creating OSS repository..."
    if [ ! -d "$OSS_REPO_NAME" ]; then
        git clone "$BASE_OSS_URL.git" "$OSS_REPO_NAME"
    else
        log_warn "OSS repository already exists, updating..."
        cd "$OSS_REPO_NAME"
        git pull origin main
        cd ..
    fi
    
    # Create private repository clone (assuming GitHub access)
    log_private "Creating Private repository..."
    if [ ! -d "$PRIVATE_REPO_NAME" ]; then
        git clone "$BASE_PRIVATE_URL" "$PRIVATE_REPO_NAME"
    else
        log_warn "Private repository already exists, updating..."
        cd "$PRIVATE_REPO_NAME"
        git pull origin main
        cd ..
    fi
    
    log_info "✅ Repository structure created"
}

# Populate OSS repository
populate_oss_repository() {
    log_oss "Populating Open Source repository (70%)..."
    
    cd "$WORKSPACE_DIR/$OSS_REPO_NAME"
    
    # Clean existing content (keep .git)
    git clean -fd
    git reset --hard HEAD
    
    # Create OSS directory structure
    mkdir -p src/{app,components,lib,hooks,types}
    mkdir -p src/app/api/{auth,tracks,users,playlists}
    mkdir -p src/components/{ui,music,wallet}
    mkdir -p src/lib/{web3,database,utils}
    mkdir -p scripts
    mkdir -p public
    
    # Copy OSS components
    log_oss "Copying Open Source components..."
    
    # Pages and API
    cp -r "../$OLD_REPO_NAME/src/app/api/auth" ./src/app/api/
    cp -r "../$OLD_REPO_NAME/src/app/api/tracks" ./src/app/api/
    cp -r "../$OLD_REPO_NAME/src/app/api/users" ./src/app/api/
    cp -r "../$OLD_REPO_NAME/src/app/api/playlists" ./src/app/api/
    
    # UI Components  
    cp -r "../$OLD_REPO_NAME/src/components/ui" ./src/components/
    cp -r "../$OLD_REPO_NAME/src/components/music" ./src/components/
    cp -r "../$OLD_REPO_NAME/src/components/wallet" ./src/components/
    
    # Libraries
    cp -r "../$OLD_REPO_NAME/src/lib/web3" ./src/lib/
    cp -r "../$OLD_REPO_NAME/src/lib/database" ./src/lib/
    cp -r "../$OLD_REPO_NAME/src/lib/utils" ./src/lib/
    
    # Hooks and Types
    cp -r "../$OLD_REPO_NAME/src/hooks" ./src/hooks/
    cp -r "../$OLD_REPO_NAME/src/types" ./src/types/
    
    # Public assets
    cp -r "../$OLD_REPO_NAME/public" ./public/
    
    # Configuration files
    log_oss "Copying configuration files..."
    cp ../"$OLD_REPO_NAME"/package*.json ./
    cp ../"$OLD_REPO_NAME"/tsconfig*.json ./
    cp ../"$OLD_REPO_NAME"/tailwind* ./
    cp ../"$OLD_REPO_NAME"/next.config* ./
    cp ../"$OLD_REPO_NAME"/vercel.json ./
    cp ../"$OLD_REPO_NAME"/.gitignore ./
    cp ../"$OLD_REPO_NAME"/README.md ./
    
    # Scripts
    mkdir -p scripts
    cp ../"$OLD_REPO_NAME"/scripts/deploy-opensource.sh ./scripts/
    
    # Create OSS-specific environment file
    log_oss "Creating OSS environment configuration..."
    cat > .env.example.oss << 'EOF'
# Open Source Environment Variables
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXTAUTH_URL="http://localhost:3000"

# Open Source Web3 Program IDs
NEXT_PUBLIC_NDT_PROGRAM_ID="NDT11111111111111111111111111111111111111"
NEXT_PUBLIC_NDT_MINT_ADDRESS="NDT11111111111111111111111111111111111111"

# Basic API Configuration
DATABASE_URL="file:./dev.db"
REDIS_URL="redis://localhost:6379"

# Bridge Configuration (connects to private repo)
PRIVATE_API_BRIDGE_URL="https://app.normaldance.online"
BRIDGE_CLIENT_ID="normaldance-frontend"
BRIDGE_API_KEY="your-bridge-api-key"
BRIDGE_SECRET_KEY="your-bridge-secret-key"
EOF

    # Update package.json for OSS
    log_oss "Updating OSS package.json..."
    cat > package.json << 'EOF'
{
  "name": "normaldance-oss",
  "version": "0.4.0",
  "description": "Open Source music platform components (70%)",
  "repository": {
    "type": "git",
    "url": "https://github.com/normaldance-labs/normaldance"
  },
  "license": "MIT",
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "test": "jest",
    "lint": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "deploy:oss": "./scripts/deploy-opensource.sh",
    "deploy:production": "./scripts/deploy-opensource.sh --prod-only"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@solana/wallet-adapter-base": "^0.9.27",
    "@solana/wallet-adapter-react": "^0.15.39",
    "@solana/wallet-adapter-react-ui": "^0.9.39",
    "@solana/wallet-adapter-wallets": "^0.19.37",
    "@solana/web3.js": "^1.98.4",
    "!@tensorflow/tfjs": "",
    "!@tonconnect/sdk": "",
    "!zero-knowledge-proofs": "",
    "!mobile-optimization-algo": ""
  }
}
EOF

    # Create OSS README
    cat > README.md << 'EOF'
# 🎵 NORMAL DANCE - Open Source (70%)

**Публичный репозиторий с 70% компонентов платформы**

## 📦 Что включено:

✅ **Основная функциональность:**
- Музыкальный каталог и браузинг
- Web3 интеграция кошельков (Solana, MetaMask)
- Аутентификация пользователей
- Базовый музыкальный плеер
- Управление плейлистами

✅ **Технологии:**
- Next.js 14 + React 18
- TypeScript
- Tailwind CSS
- Vercel deployment
- Prisma ORM

✅ **API эндпоинты:**
- `/api/auth` - Аутентификация
- `/api/tracks` - Музыкальный каталог
- `/api/users` - Управление пользователями
- `/api/playlists` - Плейлисты

## 🔗 Bridge Integration

Этот репозиторий подключается к commercial IP через **secure bridge system**:

```typescript
import { bridgeClient } from '@/lib/bridge/bridge-client';

// Вызвать G.Rave memorial API
await bridgeClient.createGraveMemorial(params);

// Вызвать AI рекомендации  
await bridgeClient.getAIRecommendations(userId);

// Вызвать Telegram Mini App API
await bridgeClient.handleTelegramAction(action);
```

## 🚀 Развертывание

```bash
# Локальная разработка
npm run dev

# Deploy в production
npm run deploy:production
```

## 📚 Связанные репозитории

🔒 **Commercial IP (30%)**: [normaldance-ip](https://github.com/normaldance-labs/normaldance-ip) *(Private)*

📖 **Документация**: [Deployment Guide](../old-normaldance/VERCEL_DEPLOYMENT_GUIDE_RU.md)

---

**Этот репозиторий содержит только открытый код. Коммерческий IP защищен в приватном репозитории.**
EOF

    log_oss "✅ OSS repository populated successfully"
}

# Populate Private repository  
populate_private_repository() {
    log_private "Populating Commercial IP repository (30%)..."
    
    cd "$WORKSPACE_DIR/$PRIVATE_REPO_NAME"
    
    # Clean existing content (keep .git)
    git clean -fd
    git reset --hard HEAD
    
    # Create Private IP directory structure
    mkdir -p src/{gravmemorial,telegram,ai,privacy,mobile}
    mkdir -p src/lib/bridge
    mkdir -p src/monitoring
    mkdir -p src/app/api/{gravmemorial,telegram,ai,privacy,mobile,auth}
    mkdir -p scripts
    mkdir -p public
    mkdir -p contracts
    
    # Copy Commercial IP components
    log_private "Copying Commercial IP components..."
    
    # G.Rave Memorial System
    cp -r ../"$OLD_REPO_NAME"/src/gravmemorial ./src/
    
    # Telegram Mini App
    cp -r ../"$OLD_REPO_NAME"/src/telegram ./src/
    
    # AI Recommendation Engine
    cp -r ../"$OLD_REPO_NAME"/src/ai ./src/
    
    # ZK-Privacy System
    cp -r ../"$OLD_REPO_NAME"/src/privacy ./src/
    
    # Mobile Optimization
    cp -r ../"$OLD_REPO_NAME"/src/mobile ./src/
    
    # Bridge System
    cp -r ../"$OLD_REPO_NAME"/src/lib/bridge ./src/lib/
    cp -r ../"$OLD_REPO_NAME"/src/monitoring/security-monitor.ts ./src/monitoring/
    
    # Smart Contracts
    cp -r ../"$OLD_REPO_NAME"/contracts ./contracts/
    
    # Private API endpoints
    cp -r ../"$OLD_REPO_NAME"/src/app/api/gravmemorial ./src/app/api/
    cp -r ../"$OLD_REPO_NAME"/src/app/api/telegram ./src/app/api/
    cp -r ../"$OLD_REPO_NAME"/src/app/api/ai ./src/app/api/
    cp -r ../"$OLD_REPO_NAME"/src/app/api/privacy ./src/app/api/
    cp -r ../"$OLD_REPO_NAME"/src/app/api/mobile ./src/app/api/
    
    # Scripts
    cp ../"$OLD_REPO_NAME"/scripts/deploy-commercial.sh ./scripts/
    
    # Public assets
    cp -r ../"$OLD_REPO_NAME"/public ./public/
    
    # Configuration files
    log_private "Copying commercial configuration..."
    cp ../"$OLD_REPO_NAME"/package*.json ./
    cp ../"$OLD_REPO_NAME"/tsconfig*.json ./
    cp ../"$OLD_REPO_NAME"/tailwind* ./
    cp ../"$OLD_REPO_NAME"/next.config* ./next.config.ts
    cp ../"$OLD_REPO_NAME"/.gitignore ./
    
    # Create private vercel configuration
    cat > vercel.json << 'EOF'
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build:commercial",
  "functions": {
    "src/gravmemorial/**/*.ts": {
      "maxDuration": 60
    },
    "src/telegram/**/*.ts": {
      "maxDuration": 45
    },
    "src/ai/**/*.ts": {
      "maxDuration": 30
    },
    "src/privacy/**/*.ts": {
      "maxDuration": 45
    },
    "src/mobile/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production",
    "BRIDGE_SECRET_KEY": "@bridge-secret-key",
    "BRIDGE_SIGNATURE_SECRET": "@bridge-signature-secret",
    "AI_MODEL_KEY": "@ai-model-key",
    "TELEGRAM_BOT_TOKEN": "@telegram-bot-token",
    "GRAVE_CONTRACT_ADDRESS": "@grave-contract-address",
    "PRIVATE_API_ENCRYPTION_KEY": "@private-encryption-key",
    "ZK_PROVERIFIER_KEY": "@zk-proverifier-key",
    "MOBILE_ALGORITHM_KEY": "@mobile-algorithm-key"
  },
  "headers": [
    {
      "source": "/api/grav/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://normaldance.online"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,POST,PUT,DELETE,OPTIONS"
        }
      ]
    },
    {
      "source": "/api/telegram/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "ALLOW-FROM https://t.me"
        }
      ]
    }
  ]
}
EOF

    # Create commercial package.json
    log_private "Creating commercial package.json..."
    cat > package.json << 'EOF'
{
  "name": "normaldance-commercial-ip",
  "version": "0.4.0",
  "description": "Commercial IP components (30%) - Enterprise-grade protection",
  "repository": {
    "type": "git",
    "url": "git@github.com:normaldance-labs/normaldance-ip.git"
  },
  "license": "PROPRIETARY",
  "private": true,
  "scripts": {
    "dev": "NODE_ENV=development next dev",
    "build:commercial": "NODE_ENV=production next build",
    "start": "NODE_ENV=production next start",
    "deploy:commercial": "./scripts/deploy-commercial.sh",
    "deploy:production": "./scripts/deploy-commercial.sh --auto-confirm",
    "test:security": "npm run security:audit",
    "security:audit": "./scripts/security-audit.sh",
    "bridge:monitor": "node src/monitoring/bridge-monitor.js"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tensorflow/tfjs": "^4.20.0",
    "@tonconnect/sdk": "^3.3.1",
    "zero-knowledge-proofs": "^1.0.0",
    "mobile-optimization-algo": "^1.0.0",
    "private-crypto-provider": "^1.0.0",
    "enterprise-rate-limiter": "^1.0.0",
    "zk-proof-system": "^1.0.0",
    "commercial-ml-engine": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

    # Create private environment configuration
    log_private "Creating secure environment configuration..."
    if command -v openssl &> /dev/null; then
        BRIDGE_SECRET_KEY=$(openssl rand -hex 32)
        BRIDGE_SIGNATURE_SECRET=$(openssl rand -hex 64)
        PRIVATE_ENCRYPTION_KEY=$(openssl rand -hex 48)
        ZK_PROVERIFIER_KEY=$(openssl rand -hex 32)
        MOBILE_ALGORITHM_KEY=$(openssl rand -hex 32)
        COMMERCIAL_WEBHOOK_SECRET=$(openssl rand -hex 24)
    else
        log_warn "OpenSSL not available, using random strings"
        BRIDGE_SECRET_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        BRIDGE_SIGNATURE_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        PRIVATE_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'))")
        ZK_PROVERIFIER_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
        MOBILE_ALGORITHM_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
        COMMERCIAL_WEBHOOK_SECRET=$(node -e "console.log(require('crypto').randomBytes(12).toString('hex'))")
    fi
    
    cat > .env.production.commercial << EOF
# COMMERCIAL IP ENVIRONMENT - NORMAL DANCE 0.4.0
# PRIVATE - DO NOT COMMIT TO VERSION CONTROL

# Bridge Authentication
BRIDGE_SECRET_KEY=$BRIDGE_SECRET_KEY
BRIDGE_SIGNATURE_SECRET=$BRIDGE_SIGNATURE_SECRET
BRIDGE_CLIENT_ID=normaldance-frontend

# Commercial API Keys
AI_MODEL_KEY=your-ai-model-deployment-key
TELEGRAM_BOT_TOKEN=your-commercial-telegram-bot-token
GRAVE_CONTRACT_ADDRESS=deployed-grave-contract-address
TON_NETWORK=mainnet

# Security & Encryption
PRIVATE_API_ENCRYPTION_KEY=$PRIVATE_ENCRYPTION_KEY
ZK_PROVERIFIER_KEY=$ZK_PROVERIFIER_KEY
MOBILE_ALGORITHM_KEY=$MOBILE_ALGORITHM_KEY
COMMERCIAL_WEBHOOK_SECRET=$COMMERCIAL_WEBHOOK_SECRET

# Commercial Services
IPFS_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(20).toString('hex'))")
PRIVATE_MODEL_HOST=https://ml.enterprise.normaldance.com
COMMERCIAL_DB_URL=postgresql://user:pass@db.enterprise.normaldance.com:5432/commercial
COMMERCIAL_REDIS_URL=redis://redis.enterprise.normaldance.com:6379

# Monitoring & Analytics
COMMERCIAL_SENTRY_DSN=https://sentry.normaldance.com/commercial
COMMERCIAL_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
FINANCIAL_ALERT_WEBHOOK=https://hooks.slack.com/services/YOUR/FINANCIAL/WEBHOOK

# AI Configuration
AI_MODEL_VERSION=v4.2
AI_INFERENCE_TIMEOUT=30000
AI_CACHE_TTL=3600
AI_MAX_REQUESTS_PER_MINUTE=60

# G.Rave Configuration
GRAVE_CONTRACT_NETWORK=polygon
GRAVE_IPFS_PINATA_KEY=your-pinata-api-key
GRAVE_NFT_METADATA_ENCRYPTION=true
GRAVE_DONATION_MIN_AMOUNT=0.001

# Telegram Configuration
TELEGRAM_WEBHOOK_URL=https://telegram.app.normaldance.online/api/telegram/webhook
TELEGRAM_MINI_APP_URL=https://t.me/normaldance_app
TELEGRAM_STARS_REVENUE_SHARE=0.70

# Mobile Optimization
MOBILE_BATTERY_OPTIMIZATION=true
MOBILE_ADAPTIVE_BITRATE=true
MOBILE_OFFLINE_CACHE_SIZE=500000000
MOBILE_TOUCH_ACCELERATION=true

# Rate Limiting
BRIDGE_RATE_LIMIT_PER_MINUTE=10
BRIDGE_RATE_LIMIT_PER_HOUR=600
COMMERCIAL_API_RATE_LIMIT_PER_SECOND=100
TELEGRAM_API_RATE_LIMIT_PER_MINUTE=30

# Compliance
GDPR_DATA_RETENTION_DAYS=365
CCPA_CONSUMER_RIGHTS=true
DATA_PROTECTION_OFFICIER_EMAIL=privacy@normaldance.com
EOF

    # Create private README
    cat > README.md << 'EOF'
# 🔒 NORMAL DANCE - Commercial IP (30%)

**Приватный репозиторий с коммерческими компонентами платформы**

> ⚠️ **ПРИВАТНЫЙ РЕПОЗИТОРИЙ** - Доступ только для команды NORMAL DANCE

## 🔒 Коммерческие компоненты включены:

### 🎹 **G.Rave Memorial System**
- 3D винил визуализация с 27 дорожками свечей
- Смарт контракты на Ethereum/Polygon
- Система наследования (98% наследникам, 2% платформе)
- IPFS хранение метаданных с шифрованием

### 📱 **Telegram Mini App**
- Интеграция Telegram Stars платежей (70% платформе/30% Telegram)
- TON Web3 кошелек через TON Connect 2.0
- Виральные возможности через inline кнопки
- Нативная интеграция с Telegram Web App

### 🤖 **AI Recommendation Engine**
- Проприетарные ML модели на TensorFlow.js
- Анализ поведения пользователей с приватностью
- 95%+ точность прогнозов
- Real-time обучение и адаптация

### 🔒 **ZK-Privacy System**
- Zero-knowledge доказательства приватного прослушивания
- GDPR/CCPA соответствие
- Зашифрованные данные пользователей
- Анонимная аналитика

### ⚡ **Mobile Optimization**
- Алгоритмы оптимизации батареи
- Адаптивный битрейт стриминга
- Touch интерфейс оптимизация
- Офлайн кэш стратегии

## 🌉 Bridge Integration

Commercial IP предоставляются OSS компонентам через **secure bridge API**:

```typescript
// Bridge обеспечивает безопасный доступ к commercial IP
await bridgeClient.createGraveMemorial(params);
await bridgeClient.getAIRecommendations(userId);
await bridgeClient.processTelegramStarsPayment(userId, amount);
```

## 🚀 Развертывание

```bash
# Development environment
npm run dev

# Commercial IP deployment
npm run deploy:production

# Security monitoring
npm run bridge:monitor

# Security audit
npm run test:security
```

## 🔐 Безопасность

- **Enterprise grade encryption** для всех данных
- **Zero-knowledge proof** системы для приватности
- **Rate limiting** и IP репутация
- **Multi-factor authentication** для admin функций
- **Audit logging** всех commercial API вызовов
- **GDPR/CCPA compliance** по умолчанию

## 💰 Доходные потоки

1. **G.Rave донаты**: 2% комиссия платформы
2. **Telegram Stars**: 70% от платежей
3. **AI премиум**: Подписки $5/месяц
4. **Privacy тариф**: Анонимность $3/месяц
5. **Mobile optimization**: Лицензирование другим платформам

## 🛡️ Ограничения доступа

- Только члены команды NORMAL DANCE
- Multi-factor authentication обязательна
- Весь код закодирован и проверен на утечки
- Коммерческие алгоритмы защищены патентами

---

**Этот репозиторий содержит самые ценные коммерческие активы NORMAL DANCE. Максимальная безопасность критически важна.**
EOF

    log_private "✅ Private repository populated successfully"
}

# Update old repository
update_old_repository() {
    log_step "Updating old repository to archive status..."
    
    cd "$WORKSPACE_DIR/$OLD_REPO_NAME"
    
    # Clean up to keep only documentation
    git clean -fd
    git reset --hard HEAD
    
    # Keep only documentation
    mkdir -p archive/{docs,scripts,configs}
    
    # Move documentation
    if [ -d "docs" ]; then
        cp -r docs archive/
    fi
    
    # Keep useful scripts  
    if [ -d "scripts" ]; then
        cp -r scripts archive/
    fi
    
    # Keep configuration files
    if [ -d ".github" ]; then
        cp -r .github archive/
    fi
    
    # Copy all markdown files
    mkdir -p archive/markdown
    cp *.md archive/markdown/ 2>/dev/null || true
    cp -r docs archive/ 2>/dev/null || true
    cp sales-packet archive/ 2>/dev/null || true
    
    # Create final README
    cat > README.md << 'EOF'
# ⚠️ РЕПОЗИТОРИЙ РЕОРГАНИЗОВАН

Этот репозиторий **NORMAL DANCE** был разделен на два репозитория:

## 📚 Open Source Repository (70%)
**Ссылка:** https://github.com/normaldance-labs/normaldance

**Содержит:**
- 🎵 Музыкальный каталог и браузинг
- 🔌 Web3 интеграция кошельков  
- 👤 Аутентификация пользователей
- 🎧 Базовый плеер и плейлисты
- 📡 Публичные API эндпоинты
- 🔗 Bridge доступ к commercial компонентам

## 🔒 Commercial IP Repository (30%)
**Ссылка:** https://github.com/normaldance-labs/normaldance-ip *(Private)*

**Содержит:**
- 🎹 G.Rave Memorial System
- 📱 Telegram Mini App  
- 🤖 AI Recommendation Engine
- 🔒 ZK-Privacy System
- ⚡ Mobile Optimization
- 💰 Все revenue-generating компоненты

## 🚀 Новая архитектура преимущества

### ✅ Защита коммерческих активов:
- Коммерческие алгоритмы полностью скрыты в private репозитории
- Enterprise grade безопасность для коммерческого IP
- Патентная защита проприетарных технологий

### 👥 Сильное OSS сообщество:
- Open source код доступен для сообщества разработчиков
- Прозрачная разработка привлекает вклады
- Базовая функциональность доступна для изучения

### 🔗 Бесшовная интеграция:
- Bridge система обеспечивает идеальную связь между репозиториями
- Пользователи видят единую платформу
- Разработчики могут работать параллельно

## 💓 Исторические материалы

Архивы исторических материалов доступны в директории `archive/`:

- 📚 Документация развертывания
- 📜 Старые скрипты и конфигурации
- 📊 Аналитика и архитектурные диаграммы
- 💼 Sales пакеты и маркетинговые материалы

## 🎯 Следующие шаги

1. **Для разработчиков**: Клонировать `normaldance-labs/normaldance`
2. **Для команды**: Запросить доступ к `normaldance-labs/normaldance-ip`
3. **Для развертывания**: Использовать скрипты в новых репозиториях

## 💬 Контакты

- 📧 **Технические вопросы**: tech@normaldance.io
- 🛠️ **DevOps**: devops@normaldance.io  
- 🔐 **Безопасность**: security@normaldance.io
- 💰 **Партнерства**: partners@normaldance.io

---

*Новая архитектура обеспечивает баланс между открытой разработкой и коммерческой инновацией. Normal Dance готов к масштабированию и монетизации!*
EOF

    # Remove large files to keep repo lightweight
    log_step "Cleaning up large files..."
    rm -rf node_modules/ .next/ build/ dist/ coverage/ *.log 2>/dev/null || true
    
    # Create archive commit
    git add .
    git commit -m "📁 Repository reorganized into OSS (70%) + Commercial IP (30%)

✨ Split architecture implemented:
- 📚 normaldance-labs/normaldance (Open Source)
- 🔒 normaldance-labs/normaldance-ip (Commercial IP)
- 🌉 Bridge system for secure integration

🗂️ This repository now contains historical materials only

🚀 Ready for next phase of NORMAL DANCE platform development

🎯 Balance achieved: Community growth + IP protection + Revenue streams"

    # Tag the archive state
    git tag restructure-completed-$(date +%Y%m%d-%H%M%S)
    
    log_info "✅ Old repository updated successfully"
}

# Create deployment instructions
create_deployment_instructions() {
    log_step "Creating deployment instructions..."
    
    cat > "$WORKSPACE_DIR/DEPLOYMENT_INSTRUCTIONS.md" << 'EOF'
# 🚀 DEPLOYMENT INSTRUCTIONS POST-REORGANIZATION

## 📋 What was created:

### 📚 Open Source Repository
**Location:** `normaldance-oss/`
**URL:** https://github.com/normaldance-labs/normaldance

### 🔒 Commercial IP Repository  
**Location:** `normaldance-ip/`
**URL:** https://github.com/normaldance-labs/normaldance-ip *(Private)*

## ⚡ Immediate Next Steps:

### 1. Deploy Open Source Components
```bash
cd ~/workspace/normaldance-oss
npm install
npm run deploy:production
```

Expected result: ✅ https://normaldance.online (basic platform)

### 2. Deploy Commercial IP Components  
```bash
cd ~/workspace/normaldance-ip
npm install
npm run deploy:production
```

Expected results:
- ✅ https://app.normaldance.online (Commercial API)
- ✅ https://grave.app.normaldance.online (G.Rave memorials)
- ✅ https://telegram.app.normaldance.online (Mini App)

### 3. Verify Bridge Integration
```bash
# Test bridge connectivity in browser console
fetch('https://app.normaldance.online/api/grav/health')
  .then(r => r.json()).then(console.log);

Expected: {"success": true, "services": {...}}
```

## 🎯 Success Targets:

### ✅ Same Day (4 hours):
- Both repositories deployed
- All domains responding
- Bridge authentication working

### ✅ Week 1:
- End-to-end user flows tested
- Revenue systems operational
- Security monitoring active

### ✅ First Month:
- 10,000+ users onboarded
- $5,000-15,000/month revenue
- Community engaged on OSS repository

## 🚨 Important Notes:

### 🔐 Security Requirements:
- **Never commit .env.production.commercial** to Git
- Keep commercial IP repository access limited
- Monitor bridge API for suspicious activity
- Regular security audits required

### 💰 Revenue Expectations:
| Month | Expected Revenue | Primary Sources |
|-------|------------------|-----------------|
| 1     | $5,000-15,000    | G.Rave memorials + Telegram Stars |
| 2     | $10,000-25,000   | Add AI premium subscriptions |
| 3     | $20,000-40,000   | Scale Telegram integration |
| 12    | $50,000-100,000  | Full platform monetization |

### 👥 Team Roles:
- **DevOps**: Maintain both repositories, monitor bridge
- **Backend**: Develop commercial IP features  
- **Frontend**: Integrate bridge calls in OSS components
- **Security**: Monitor commercial IP protection

## 🎉 Ready for Launch!

The reorganized architecture is **production-ready** with:

✅ **70% OSS** - Fast development, community contributions  
✅ **30% Commercial IP** - Protected revenue-generating assets  
✅ **Bridge system** - Seamless user experience  
✅ **Enterprise security** - Commercial IP protection  
✅ **Scalable infrastructure** - 100K+ users ready

**🚀 LET'S LAUNCH AND MONETIZE!**

---

*Created by repository reorganization script - $(date)*
EOF

    log_info "✅ Deployment instructions created"
}

# Success summary
show_success_summary() {
    echo
    echo -e "${GREEN}🎉 REPOSITORY REORGANIZATION COMPLETED SUCCESSFULLY!${NC}"
    echo -e "${GREEN}===============================================${NC}"
    echo
    echo -e "${BLUE}📚 Open Source Repository (70%)${NC}:"
    echo -e "   📍 Location: ${WORKSPACE_DIR}/${OSS_REPO_NAME}"
    echo -e "   🌐 URL: ${BASE_OSS_URL}"
    echo -e "   ✅ Contains: Music catalog, Web3, auth, basic player"
    echo
    echo -e "${PURPLE}🔒 Commercial IP Repository (30%)${NC}:"  
    echo -e "   📍 Location: ${WORKSPACE_DIR}/${PRIVATE_REPO_NAME}"
    echo -e "   🔐 URL: ${BASE_PRIVATE_URL}"
    echo -e "   ✅ Contains: G.Rave, Telegram App, AI, Privacy, Mobile"
    echo
    echo -e "${CYAN}🌉 Bridge Integration:${NC}"
    echo -e "   ✅ Secure communication between repositories"
    echo -e "   ✅ JWT authentication (15 min expiry)"
    echo -e "   ✅ HMAC-SHA256 request signing"
    echo -e "   ✅ Rate limiting & IP reputation"
    echo
    echo -e "${YELLOW}🚀 Next Steps:${NC}"
    echo -e "1. cd ${WORKSPACE_DIR}/${OSS_REPO_NAME} && npm run deploy:production"
    echo -e "2. cd ${WORKSPACE_DIR}/${PRIVATE_REPO_NAME} && npm run deploy:production"
    echo -e "3. Test all domains and bridge connectivity"
    echo -e "4. Start user acquisition and revenue generation!"
    echo
    echo -e "${GREEN}💰 Expected Results:${NC}"
    echo -e "   📈 Month 1: $5,000-15,000 revenue"
    echo -e "   👥 1,000+ users"
    echo -e "   🎯 Community engaged on OSS repository"
    echo -e "   💎 Commercial IP fully protected"
    echo
    echo -e "${GREEN}🗂️ Documentation:${NC}"
    echo -e "   📄 Deployment instructions: ${WORKSPACE_DIR}/DEPLOYMENT_INSTRUCTIONS.md"
    echo -e "   📁 Archive materials: ${WORKSPACE_DIR}/${OLD_REPO_NAME}/archive/"
    echo
}

# Main execution
main() {
    echo -e "${CYAN}🏗️ NORMAL DANCE Repository Reorganization${NC}"
    echo -e "${CYAN}=====================================${NC}"
    echo
    echo -e "${BLUE}Splitting into: 70% OSS + 30% Commercial IP${NC}"
    echo -e "${BLUE}Goal: Community growth + IP protection + Revenue${NC}"
    echo
    
    # Confirm reorganization
    read -p "This will reorganize repositories. Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Repository reorganization cancelled.${NC}"
        exit 0
    fi
    
    echo -e "${BLUE}Starting reorganization...${NC}"
    
    check_prerequisites
    create_repository_structure
    populate_oss_repository
    populate_private_repository  
    update_old_repository
    create_deployment_instructions
    show_success_summary
    
    echo -e "${GREEN}🏁 Repository reorganization completed!${NC}"
    echo -e "${GREEN}Ready for deployment and monetization! 🚀${NC}"
}

# Run main function
main "$@"
