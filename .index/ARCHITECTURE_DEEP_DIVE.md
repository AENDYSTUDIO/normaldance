# 🏗️ NORMALDANCE 0.5.0 - Детальное руководство по архитектуре

**Дата**: 2024
**Версия**: 1.0
**Статус**: Production Architecture Guide

---

## 📑 Оглавление

1. [Архитектура высокого уровня](#архитектура-высокого-уровня)
2. [Критические модули](#критические-модули)
3. [Data Flow](#data-flow)
4. [Security архитектура](#security-архитектура)
5. [Масштабируемость](#масштабируемость)
6. [Интеграции](#интеграции)
7. [Deployment](#deployment)

---

## Архитектура высокого уровня

### Слои приложения

```
┌─────────────────────────────────────────────────────┐
│                    Presentation Layer                │
│  (React Components, UI, Pages)                       │
│  src/components/* + src/app/*                        │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                  Business Logic Layer                │
│  (Hooks, Store, Middleware)                         │
│  src/hooks/* + src/store/* + src/middleware/*        │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                   Service Layer                      │
│  (Web3, Auth, IPFS, Payment, AI)                     │
│  src/lib/* (core services)                           │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                  Infrastructure Layer                │
│  (DB, Cache, External APIs)                          │
│  Prisma + Redis + IPFS + Blockchain                  │
└─────────────────────────────────────────────────────┘
```

### Компонентная архитектура

```
Application
├── Frontend (React/Next.js)
│   ├── Pages (App Router)
│   ├── Components (UI + Business)
│   ├── Hooks (State + Effects)
│   └── Store (Zustand)
│
├── Backend (Node.js + Express)
│   ├── API Routes (Next.js API)
│   ├── WebSocket (Socket.IO)
│   ├── Services (lib/*)
│   └── Middleware
│
├── Data Layer
│   ├── Database (Prisma + PostgreSQL)
│   ├── Cache (Redis)
│   └── Search (Qdrant)
│
├── Blockchain
│   ├── Solana Integration
│   ├── TON Integration
│   └── EVM Bridges
│
├── Storage
│   ├── IPFS (Helia)
│   ├── Pinata (CDN)
│   └── Filecoin (Archive)
│
└── External Services
    ├── Authentication (NextAuth)
    ├── Payments (Stripe)
    ├── KYC (Chainalysis, Sumsub)
    ├── Monitoring (Sentry)
    └── Analytics (Mixpanel)
```

---

## Критические модули

### 1. Database Layer (src/lib/db.ts)

```typescript
// НИКОГДА не создавайте новые Prisma инстансы!
// Используйте глобальный инстанс из db.ts

import { db } from '@/lib/db';

// ✅ Правильно
const users = await db.user.findMany();

// ❌ Неправильно
const prisma = new PrismaClient(); // DON'T DO THIS!
```

**Ключевые особенности:**
- Глобальный Prisma инстанс с шардингом
- Connection pooling автоматически
- Development mode в памяти
- Production на Supabase PostgreSQL

**Шардинг конфигурация:**
```typescript
- DEFAULT_SHARDING_CONFIG
- Multi-database support
- Automatic routing
```

### 2. Authentication (src/lib/auth.ts)

**Поддерживаемые методы:**
- NextAuth с OAuth провайдерами
- Wallet-based auth (Phantom, TON Connect)
- Biometric (Invisible Wallet)
- JWT tokens

**Flow:**
```
User → Login Page → Auth Provider → Wallet/OAuth → 
Session → Protected Routes → API Calls with Token
```

**Критические точки:**
```typescript
// src/lib/nextauth-config.ts
// - Prisma adapter
// - Callback handlers
// - Session management
// - Token expiration
```

### 3. Wallet Integration (src/components/wallet/)

**Поддерживаемые кошельки:**

#### Solana
- Phantom (главный)
- Solflare
- Ledger

#### TON
- TON Connect
- Tonkeeper

#### EVM
- MetaMask
- WalletConnect
- Ethers.js провайдеры

**Invisible Wallet** (Биометрия):
```typescript
// src/components/wallet/wallet-adapter.tsx
// - Fingerprint/Face ID
// - Secure key storage
// - Transaction signing
// - Auto-lock mechanism
```

### 4. Deflationary Model (src/lib/deflationary-model.ts)

**Механика 2% Burn:**

```
Every Transaction:
├─ Amount: 100 NDT
├─ Burn (2%): 2 NDT → Destroyed forever
└─ Distributed (98%): 98 NDT
    ├─ Staking Rewards: ~60%
    ├─ Treasury: ~25%
    └─ Liquidity: ~15%
```

**Реализация:**
```typescript
function calculateBurn(amount: bigint): {
  burned: bigint;
  distributed: bigint;
} {
  const burned = amount * BigInt(2) / BigInt(100);
  const distributed = amount - burned;
  return { burned, distributed };
}
```

**Программы на Solana:**
- NDT_PROGRAM_ID - Main token
- TRACKNFT_PROGRAM_ID - Music NFT
- STAKING_PROGRAM_ID - Staking

### 5. IPFS Architecture (src/lib/ipfs-enhanced.ts)

**Multi-Gateway система:**

```
┌─────────────────────────┐
│  Application (IPFS)     │
├─────────────────────────┤
│  Helia Core             │
├──────┬──────┬──────────┤
│      │      │          │
▼      ▼      ▼          ▼
Gateway1  Gateway2  Gateway3  Pinata-CDN
(Infura) (nft.storage) (Custom) (Paid tier)
```

**Особенности:**
- Мультишлюзовая репликация
- Failover механизм
- Content addressing (CID)
- Filecoin архивирование
- Redundancy система

**Использование:**
```typescript
// Upload to IPFS
const cid = await uploadToIPFS(file);

// Retrieve from multiple gateways
const data = await getFromIPFS(cid);

// Archive to Filecoin
await archiveToFilecoin(cid);
```

### 6. Socket.IO Real-time (server.ts)

**Кастомный сервер:**

```typescript
// server.ts - ГЛАВНЫЙ сервер приложения

// ВАЖНО: Путь /api/socketio (НЕ /socket.io!)
const io = new Server(server, {
  path: "/api/socketio",
  cors: {
    origin: ["http://localhost:3000", "https://normaldance.ru"],
    methods: ["GET", "POST"],
  },
});

// Redis адаптер для multi-replica
import { createAdapter } from "@socket.io/redis-adapter";
io.adapter(createAdapter(pubClient, subClient));
```

**Events:**
- `connection` - User connects
- `disconnect` - User disconnects
- `message` - Real-time chat
- `notification` - Push notifications
- `transaction` - Live blockchain events
- `track-playing` - Music events

**Usage в компонентах:**
```typescript
// src/lib/socket.ts
const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  path: "/api/socketio",
  reconnection: true,
});

socket.on("notification", (data) => {
  console.log("New notification:", data);
});
```

### 7. AI Integration (src/lib/*)

#### Code Embeddings (code-embeddings.ts)
```typescript
// Для индексирования и поиска кода
- Vector embeddings
- Semantic search
- Code recommendations
- Pattern detection
```

#### Kilocode Service (kilocode-service.ts)
```typescript
// AI ассистент для кода
- Code generation
- Refactoring suggestions
- Documentation
- @kilocode: / @kilo: commands
```

#### Roocode Service (roocode-service.ts)
```typescript
// Основной AI агент
- Architecture analysis
- Task completion
- Knowledge base
- @roocode: / @roo: commands
```

#### Qdrant Vector DB (qdrant-service.ts)
```typescript
// Vector database для ML
- Embeddings storage
- Similarity search
- Semantic indexing
- Code search at /api/qdrant/*
```

### 8. Security Layer (src/lib/security/)

**RBAC (Role-Based Access Control):**
```typescript
// src/lib/rbac.ts
Roles:
├─ ADMIN - Full access
├─ MODERATOR - Content moderation
├─ ARTIST - Music management
├─ INVESTOR - Financial data
├─ USER - Basic access
└─ GUEST - View-only

// Middleware integration
middleware() → checkRole() → authorize()
```

**AML/KYC (src/lib/aml-kyc/):**
```typescript
// Chainalysis integration
- Address screening
- Transaction monitoring
- Risk assessment
- Compliance reporting

API: /api/chainalysis/*
```

**Travel Rule (src/lib/travel-rule/):**
```typescript
// Regulatory compliance
- Beneficiary verification
- Originator verification
- Transaction reporting
- Audit trails
```

### 9. Payment Gateway (src/components/payment-gateway.tsx)

**Поддерживаемые методы:**

```
Payment Methods:
├─ Stripe (Credit Card)
│  ├─ Visa/Mastercard
│  ├─ Apple Pay
│  └─ Google Pay
│
├─ Crypto Direct
│  ├─ Solana Pay
│  ├─ TON payments
│  └─ EVM transfers
│
└─ Bank Transfer
   ├─ ACH
   ├─ SEPA
   └─ International Wire
```

**Flow:**
```
1. User selects payment method
2. Amount validation
3. KYC check (if needed)
4. Payment processing
5. Transaction recording
6. Confirmation notification
```

### 10. Notification System (src/lib/notifications/)

**Channels:**
```
Push Notifications
├─ Web Push (PWA)
├─ Email
├─ Telegram Bot
├─ In-app Toast
└─ Socket.IO real-time

API: /api/notifications/*
```

**Events triggering notifications:**
- Wallet transactions
- Chat messages
- NFT mints
- Achievement unlocks
- Payment confirmations

---

## Data Flow

### Music Upload Flow

```
User Upload
    ↓
Validation (File size, Format, Duration)
    ↓
Encrypt & Compress
    ↓
Upload to IPFS
    ├─ Store CID in Database
    ├─ Replicate to multiple gateways
    └─ Archive to Filecoin
    ↓
Mint TrackNFT (Solana)
    ├─ NFT metadata on IPFS
    ├─ Token creation
    └─ Update registry
    ↓
Distribution
    ├─ Add to recommendations
    ├─ Update artist stats
    └─ Notify followers
    ↓
Monetization Ready
    ├─ Royalty tracking
    ├─ Payment distribution
    └─ Analytics active
```

### Transaction Flow

```
Artist creates transaction
    ↓
Sign with wallet (Phantom/TON Connect)
    ↓
Send to blockchain
    ├─ Solana: Mainnet
    ├─ TON: Mainnet
    └─ EVM: Via bridge
    ↓
Calculate burn (2%)
    ├─ Burn 2% NDT → destroyed
    ├─ Distribute 98%
    └─ Record in registry
    ↓
Update user balance
    ├─ Verify on blockchain
    ├─ Update local cache
    └─ Store in database
    ↓
Send notifications
    ├─ In-app notification
    ├─ Email receipt
    ├─ Telegram alert
    └─ Socket.IO update
    ↓
Complete
    ├─ Analytics recorded
    ├─ Royalties calculated
    └─ Rewards distributed
```

### Authentication Flow

```
User navigates to protected route
    ↓
Check session (NextAuth)
    │
    ├─ Session valid? → Continue
    │
    └─ Session invalid?
        ↓
        Redirect to /auth/signin
        ↓
        User chooses auth method:
        ├─ Wallet (Phantom/TON Connect)
        ├─ OAuth (Google/GitHub)
        └─ Email/Password
        ↓
        Auth Provider verification
        ├─ Get wallet signature / OAuth token
        ├─ Verify user identity
        └─ Create session
        ↓
        Store session in database
        ├─ Prisma User record
        ├─ JWT token generation
        └─ Cookie/local storage
        ↓
        Redirect to original route
        ↓
        User session now valid
```

### Chat Message Flow

```
User types message
    ↓
Message validation
    ├─ Content check (spam/abuse)
    ├─ Length validation
    └─ Rate limiting
    ↓
Store in database
    ├─ Create Message record
    ├─ Link to User & Room
    └─ Timestamp & ID
    ↓
Emit via Socket.IO
    ├─ Send to room subscribers
    ├─ Real-time updates
    └─ Notification to recipients
    ↓
Index for search
    ├─ Update Qdrant embeddings
    ├─ Make searchable
    └─ Archive old messages
    ↓
Delivered
    ├─ Send delivery confirmation
    ├─ Update UI
    └─ Mark as read
```

---

## Security архитектура

### Layers

```
┌─────────────────────────────────────┐
│     Application Level               │
│  (RBAC, Validation, Sanitization)   │
├─────────────────────────────────────┤
│     Transport Level                 │
│  (HTTPS, TLS, Rate Limiting)        │
├─────────────────────────────────────┤
│     API Level                       │
│  (Authentication, JWT, OAuth)       │
├─────────────────────────────────────┤
│     Database Level                  │
│  (Encryption, SQL Injection Guard)  │
├─────────────────────────────────────┤
│     Blockchain Level                │
│  (Wallet Signing, Smart Contracts)  │
└─────────────────────────────────────┘
```

### Security Modules

```
Helmet
├─ CSP (Content Security Policy)
├─ HSTS (Force HTTPS)
├─ X-Frame-Options
└─ XSS Protection

JWT
├─ Token generation
├─ Signature verification
├─ Expiration management
└─ Refresh token rotation

RBAC
├─ Role-based access
├─ Permission checking
├─ Resource-level control
└─ Audit logging

Encryption
├─ Password hashing (bcryptjs)
├─ Data encryption (at rest)
├─ TLS (in transit)
└─ Wallet key management

AML/KYC
├─ Chainalysis screening
├─ Sumsub verification
├─ Transaction monitoring
└─ Compliance reporting
```

### Protected Routes

```typescript
// All /api/* endpoints protected by:
1. NextAuth session validation
2. JWT token verification
3. Rate limiting (express-rate-limit)
4. CORS validation
5. Input validation (Zod/AJV)
6. RBAC check (if applicable)
7. Audit logging

// Admin routes require: ADMIN role
// Artist routes require: ARTIST role
// User routes require: authenticated session
```

---

## Масштабируемость

### Horizontal Scaling

```
Load Balancer
    │
    ├─ Server Instance 1 (Node.js)
    ├─ Server Instance 2 (Node.js)
    ├─ Server Instance 3 (Node.js)
    └─ Server Instance N

Shared Infrastructure:
├─ PostgreSQL (Supabase)
├─ Redis (Single/Cluster)
├─ IPFS gateways
└─ CDN (Vercel/Cloudflare)
```

### Database Optimization

```
Strategies:
├─ Connection pooling (Prisma)
├─ Query optimization
├─ Indexing strategy
├─ Read replicas
├─ Caching layer (Redis)
└─ Sharding (for ultra-large scale)

Indexes:
├─ user.email (unique)
├─ track.cid (indexed)
├─ transaction.hash (indexed)
├─ message.roomId (indexed)
└─ notification.userId (indexed)
```

### Cache Strategy

```
Redis Cache:
├─ User sessions
├─ Artist profiles
├─ Track metadata
├─ Message history
├─ Notification cache
└─ Rate limit counters

TTL Management:
├─ Short (5 min): User activity
├─ Medium (1 hour): Content
├─ Long (24 hours): Profiles
└─ Permanent: Static data
```

### CDN & Static Assets

```
Vercel Edge Network
├─ React components (static)
├─ CSS/JS bundles
├─ Images (optimized)
├─ Fonts
└─ Media (if under size limit)

Dynamic Content:
├─ API responses (edge caching)
├─ User-specific data (server)
├─ Real-time updates (Socket.IO)
└─ Streaming (large files)
```

---

## Интеграции

### Blockchain Networks

#### Solana Integration
```typescript
// Connection
const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
  "confirmed"
);

// Wallet integration
- Phantom (primary)
- Solflare
- Ledger

// Programs
- NDT_PROGRAM_ID (token)
- TRACKNFT_PROGRAM_ID (NFT)
- STAKING_PROGRAM_ID (staking)

// Operations
- Token transfer
- NFT mint/burn
- Staking
- Governance votes
```

#### TON Integration
```typescript
// Connection
const tonClient = new TonClient({
  endpoint: "https://mainnet-v4.toncenter.com",
});

// Wallet
- TON Connect
- Tonkeeper

// Features
- TON payments
- TON Stars
- Smart contracts
- Messages

// Grant Program
- $50,000 funding
- KYC required
- Multi-sig wallet
```

#### EVM Integration
```typescript
// Networks
- Ethereum
- Polygon
- Arbitrum
- Optimism

// Libraries
- ethers.js
- viem

// Features
- Token swaps
- Liquidity
- Bridges
- Staking
```

### External Services

#### Stripe (Payments)
```
- Card processing
- Webhook handling
- Subscription management
- Payout automation
```

#### Telegram (Messaging)
```
- Bot API
- Mini App (twa-dev/sdk)
- User authentication
- Stars payments
- Message delivery
```

#### Chainalysis (AML/KYC)
```
- Address screening
- Transaction monitoring
- Risk scoring
- Compliance reports
```

#### Sumsub (KYC)
```
- Document verification
- Liveness check
- Identity verification
- Webhook updates
```

#### Sentry (Monitoring)
```
- Error tracking
- Performance monitoring
- Session replay
- Alert notifications
```

#### Qdrant (Vector DB)
```
- Code embeddings
- Semantic search
- Similarity matching
- ML model inputs
```

---

## Deployment

### Development

```bash
npm run dev              # Local development server
npm run mcp:dev         # MCP server with hot reload
npm run db:migrate      # Run database migrations
npm run test            # Run tests
```

**Environment:**
```
NODE_ENV=development
DATABASE_URL=file:./dev.db (SQLite)
NEXT_PUBLIC_API_URL=http://localhost:3000
SOLANA_RPC=http://localhost:8899 (local validator)
```

### Production

```
Build Process:
1. npm run build         # Compile TypeScript/TSX
2. npm run test          # Run test suite
3. Security scan         # npm audit + trivy
4. Docker build          # Create image
5. Deploy to Vercel/K8s # Container orchestration
```

**Deployments:**
- **Vercel** (default) - Frontend + Serverless functions
- **Kubernetes** - Full stack deployment
- **Self-hosted** - EC2/DigitalOcean/Linode

### Docker

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY server.ts .
EXPOSE 3000
CMD ["node", "server.ts"]
```

### Kubernetes Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: normaldance
spec:
  replicas: 3
  selector:
    matchLabels:
      app: normaldance
  template:
    metadata:
      labels:
        app: normaldance
    spec:
      containers:
      - name: app
        image: normaldance:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
```

---

## Performance Optimization

### Frontend

```
- Code splitting (dynamic imports)
- Image optimization (Next.js Image)
- Bundle analysis (webpack analyzer)
- CSS-in-JS optimization
- React.memo for expensive components
- Virtual scrolling for lists
```

### Backend

```
- Query optimization
- Database indexing
- Redis caching
- Connection pooling
- Compression (gzip)
- Response pagination
```

### IPFS

```
- Multi-gateway failover
- Content addressing (CID)
- Pinning strategy
- Garbage collection
- Edge caching
```

---

## Monitoring & Alerting

### Metrics

```
Application:
- Request latency
- Error rate
- Throughput
- Active users

Infrastructure:
- CPU usage
- Memory usage
- Disk I/O
- Network bandwidth

Blockchain:
- Transaction success rate
- Gas prices
- Network congestion
- Block confirmation time
```

### Logging

```
Winston logger (src/lib/logger.ts)
├─ error
├─ warn
├─ info
├─ debug
└─ trace

Structured logging:
{
  timestamp: "2024-01-01T00:00:00Z",
  level: "info",
  message: "User logged in",
  userId: "123",
  method: "POST",
  path: "/api/auth/signin"
}
```

---

## Summary

NORMALDANCE v0.5.0 is a sophisticated, production-ready Web3 music platform with:

✅ **Robust architecture** - Layered, modular design
✅ **Enterprise security** - Multi-layer protection
✅ **Global scalability** - Horizontal & vertical scaling
✅ **Blockchain integration** - Solana, TON, EVM
✅ **Decentralized storage** - IPFS, Filecoin
✅ **Real-time features** - Socket.IO
✅ **AI capabilities** - Embeddings, recommendations
✅ **Compliance ready** - AML/KYC, Travel Rule
✅ **Fully monitored** - Observability stack
✅ **DevOps ready** - Docker, Kubernetes, CI/CD

---

**Version**: 1.0
**Last Updated**: 2024