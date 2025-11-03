# G.RAVE NEXT STEPS - Детальный план реализации

## 🎯 ТЕКУЩЕЕ СОСТОЯНИЕ

**Готовность:** 40% к production
**Сложность:** Medium-High
**Требуемое время:** 8-12 недель (1 full-time разработчик)

---

## 📋 PHASE 1: BLOCKCHAIN FOUNDATION (Неделя 1-3)

### 1.1 Развертывание контракта на сетях

**Файл:** `scripts/deploy-grave.ts`

```typescript
// Требуется создать:
- Развертывание на Sepolia (testnet)
- Развертывание на mainnet Ethereum
- Развертывание на Polygon
- Развертывание на Solana (адаптация контракта)
- Развертывание на TON (адаптация контракта)

// Использовать:
- Hardhat для EVM сетей
- Anchor для Solana
- Blueprint для TON
```

**Приоритет:** 🔴 CRITICAL
**Сложность:** Medium
**Время:** 3-4 дня

---

### 1.2 Contract Interaction Library

**Файл:** `src/lib/grave/contract-interface.ts`

```typescript
// Требуется:
export class GraveContractInterface {
  // Ethereum/Polygon
  ethereumContract: ethers.Contract
  
  // Solana
  solanaProgram: Program<GraveMemorialNFT>
  
  // TON
  tonContract: TonClient & Contract
  
  async createMemorial(params: CreateMemorialParams): Promise<string>
  async donate(memorialId: string, amount: number): Promise<string>
  async getMemorial(memorialId: string): Promise<MemorialData>
  async distributeToHeirs(memorialId: string): Promise<string>
  
  // Chain switching
  async switchChain(chainId: number): Promise<void>
}
```

**Приоритет:** 🔴 CRITICAL
**Сложность:** High
**Время:** 5-7 дней

---

### 1.3 Update API Routes для blockchain

**Файл:** `src/app/api/grave/memorials/route.ts` (обновить)

**Изменения:**

```typescript
// Вместо mock data, использовать реальные данные с blockchain
export async function GET(request: NextRequest) {
  const chainId = request.headers.get('x-chain-id') || '1' // Ethereum
  
  const memorials = await graveContract.getAllMemorials(chainId)
  return NextResponse.json({ success: true, data: memorials })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Валидация Telegram
  const userId = await validateTelegram(request)
  
  // Отправка транзакции на blockchain
  const txHash = await graveContract.createMemorial({
    artistName: body.artistName,
    ipfsHash: body.ipfsHash,
    heirs: body.heirs,
    chainId: body.chainId || '1'
  })
  
  // Сохраниение в БД
  await db.memorial.create({
    data: {
      contractAddress: body.contractAddress,
      transactionHash: txHash,
      createdBy: userId,
      ...body
    }
  })
  
  return NextResponse.json({ success: true, txHash })
}
```

**Приоритет:** 🔴 CRITICAL
**Сложность:** High
**Время:** 4-5 дней

---

## 📱 PHASE 2: TELEGRAM INTEGRATION (Неделя 4-5)

### 2.1 Telegram Bot Setup

**Файл:** `src/mcp/telegram-bot.ts`

```typescript
// Требуется:
import { Telegraf } from 'telegraf'

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

// Обработчики:
bot.command('start', async (ctx) => {
  ctx.reply('Welcome to G.rave! 🪦')
  ctx.reply('Commands:\n/memorial - Create memorial\n/donate - Make donation')
})

bot.command('memorial', async (ctx) => {
  // Открыть mini app с UI создания мемориала
  ctx.reply('Create memorial via mini app', {
    reply_markup: {
      inline_keyboard: [[{
        text: '🪦 Create Memorial',
        web_app: { url: `${process.env.MINI_APP_URL}/create` }
      }]]
    }
  })
})

bot.command('donate', async (ctx) => {
  // Открыть mini app с UI пожертвования
  ctx.reply('Support a memorial via mini app', {
    reply_markup: {
      inline_keyboard: [[{
        text: '💰 Donate Now',
        web_app: { url: `${process.env.MINI_APP_URL}/donate` }
      }]]
    }
  })
})

// Webhook handler
export async function handleTelegramWebhook(request: Request) {
  const update = await request.json()
  return bot.handleUpdate(update)
}
```

**Файл:** `src/app/api/telegram/webhook/route.ts`

```typescript
import { handleTelegramWebhook } from '@/mcp/telegram-bot'

export async function POST(request: NextRequest) {
  return handleTelegramWebhook(request)
}
```

**Приоритет:** 🔴 CRITICAL
**Сложность:** Medium
**Время:** 3-4 дня

---

### 2.2 Telegram Mini App Manifest & Integration

**Файл:** `src/app/grave/mini-app/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'

export default function MiniAppPage() {
  useEffect(() => {
    // Инициализация Telegram Web App
    WebApp.ready()
    
    // Получить user данные
    const user = WebApp.initDataUnsafe?.user
    
    // Установить UI параметры
    WebApp.setHeaderColor('#000000')
    WebApp.setBackgroundColor('#000000')
    
    return () => {
      // Cleanup
    }
  }, [])

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Mini App UI */}
      <GraveyardGrid miniApp={true} />
    </div>
  )
}
```

**Приоритет:** 🔴 CRITICAL
**Сложность:** Medium
**Время:** 3-4 дня

---

### 2.3 Telegram Stars Payment Integration

**Файл:** `src/lib/telegram/payments.ts`

```typescript
import TonWeb from 'tonweb'

export async function processTelegramStarsPayment(
  userId: number,
  starsAmount: number,
  memorialId: string
) {
  // 1. Конвертация Telegram Stars в TON
  const tonAmount = starsAmount * 0.02 // ~1 Star = 0.02 TON
  
  // 2. Отправка платежа через TON blockchain
  const tonweb = new TonWeb()
  
  const transaction = {
    to: process.env.GRAVE_WALLET_ADDRESS,
    amount: TonWeb.utils.toNano(tonAmount),
    payload: memorialId // Reference to memorial
  }
  
  // 3. Подтверждение
  // 4. Запись в БД
  
  return { success: true, txHash: '...' }
}
```

**Приоритет:** 🟡 HIGH
**Сложность:** High
**Время:** 5-7 дней

---

## 💾 PHASE 3: DATABASE & PERSISTENCE (Неделя 6)

### 3.1 Prisma Schema расширение

**Файл:** `prisma/schema.prisma` (добавить)

```prisma
// Memorial NFT Model
model GraveMemorial {
  id        String   @id @default(cuid())
  
  // Basic Info
  artistName    String
  description   String?
  deathDate     DateTime?
  
  // IPFS & Media
  ipfsHash      String   @unique
  coverImageUrl String?
  audioUrl      String?
  
  // Blockchain
  contractAddress String
  tokenId         Int
  chainId         String   // "1" for Ethereum, "137" for Polygon, etc.
  createdTxHash   String
  
  // Fund Management
  fundBalance     Decimal  @default(0) // в ETH/SOL/TON в зависимости от сети
  currency        String   @default("ETH")
  
  // Heirs
  heirs           String[] // Wallet addresses
  
  // Status
  isActive        Boolean  @default(true)
  visitCount      Int      @default(0)
  
  // Relations
  createdBy       String   // User ID
  donations       Donation[]
  visitors        Visitor[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([artistName])
  @@index([contractAddress])
  @@index([chainId])
}

// Donation Model
model Donation {
  id          String   @id @default(cuid())
  
  memorialId  String
  memorial    GraveMemorial @relation(fields: [memorialId], references: [id], onDelete: Cascade)
  
  donorAddress String
  donorName    String?
  
  amount       Decimal
  currency     String
  
  message      String?
  isAnonymous  Boolean  @default(false)
  
  transactionHash String
  chainId         String
  
  status       String   @default("PENDING") // PENDING, CONFIRMED, FAILED
  
  createdAt    DateTime @default(now())
  
  @@index([memorialId])
  @@index([donorAddress])
  @@index([createdAt])
}

// Visitor Tracking
model Visitor {
  id          String   @id @default(cuid())
  
  memorialId  String
  memorial    GraveMemorial @relation(fields: [memorialId], references: [id], onDelete: Cascade)
  
  visitorAddress String?
  
  visitedAt   DateTime @default(now())
  
  @@index([memorialId])
}
```

**Приоритет:** 🔴 CRITICAL
**Сложность:** Low
**Время:** 1-2 дня

**Команды:**
```bash
npx prisma migrate dev --name add_grave_models
npx prisma generate
```

---

### 3.2 Database Operations Layer

**Файл:** `src/lib/grave/db-operations.ts`

```typescript
import { db } from '@/lib/db'

export async function createMemorialRecord(data: {
  artistName: string
  ipfsHash: string
  contractAddress: string
  tokenId: number
  chainId: string
  createdBy: string
  heirs: string[]
  createdTxHash: string
}) {
  return db.graveMemorial.create({ data })
}

export async function recordDonation(data: {
  memorialId: string
  donorAddress: string
  amount: number
  currency: string
  transactionHash: string
  chainId: string
  message?: string
}) {
  return db.donation.create({ data })
}

export async function getMemorialWithDonations(memorialId: string) {
  return db.graveMemorial.findUnique({
    where: { id: memorialId },
    include: {
      donations: { orderBy: { createdAt: 'desc' } },
      visitors: { select: { id: true, visitedAt: true } }
    }
  })
}

export async function updateVisitCount(memorialId: string) {
  return db.graveMemorial.update({
    where: { id: memorialId },
    data: { visitCount: { increment: 1 } }
  })
}
```

**Приоритет:** 🔴 CRITICAL
**Сложность:** Low
**Время:** 2-3 дня

---

## 🔄 PHASE 4: REAL-TIME FEATURES (Неделя 7)

### 4.1 Socket.IO Event System

**Файл:** `src/lib/grave/socket-events.ts`

```typescript
import { Server } from 'socket.io'

export function setupGraveSocket(io: Server) {
  io.of('/grave').on('connection', (socket) => {
    
    // Join memorial room
    socket.on('join:memorial', (memorialId) => {
      socket.join(`memorial:${memorialId}`)
      io.of('/grave').to(`memorial:${memorialId}`).emit('viewer:joined', {
        count: io.of('/grave').sockets.adapter.rooms.get(`memorial:${memorialId}`)?.size || 0
      })
    })
    
    // Light a candle
    socket.on('candle:light', async (memorialId, donationData) => {
      // Broadcast to all viewers
      io.of('/grave').to(`memorial:${memorialId}`).emit('candle:lit', {
        donation: donationData,
        timestamp: new Date()
      })
      
      // Update vinyl animation
      io.of('/grave').to(`memorial:${memorialId}`).emit('vinyl:update', {
        candlesLit: donationData.totalCandlesCount,
        newRay: true
      })
    })
    
    // Donation received
    socket.on('donation:received', (memorialId, donationData) => {
      io.of('/grave').to(`memorial:${memorialId}`).emit('donation:notify', {
        donor: donationData.donorName || 'Anonymous',
        amount: donationData.amount,
        message: donationData.message
      })
    })
    
    socket.on('disconnect', () => {
      socket.rooms.forEach(room => {
        io.of('/grave').to(room).emit('viewer:left')
      })
    })
  })
}
```

**Приоритет:** 🟡 HIGH
**Сложность:** Medium
**Время:** 3-4 дня

---

### 4.2 Real-time API Updates

**Файл:** `src/app/api/grave/donate/route.ts` (обновить)

```typescript
import { setupGraveSocket } from '@/lib/grave/socket-events'

export async function POST(request: NextRequest) {
  const io = getSocketIOInstance() // Получить instance из server.ts
  
  const body = await request.json()
  
  // ... Валидация ...
  
  // Отправить транзакцию
  const txHash = await graveContract.donate(
    body.memorialId,
    body.amount
  )
  
  // Обновить БД
  const donation = await recordDonation({
    memorialId: body.memorialId,
    donorAddress: body.donorAddress,
    amount: body.amount,
    transactionHash: txHash,
    ...body
  })
  
  // Emit real-time event
  io.of('/grave').emit('donation:new', {
    memorialId: body.memorialId,
    donation
  })
  
  return NextResponse.json({ success: true, donation })
}
```

**Приоритет:** 🟡 HIGH
**Сложность:** Medium
**Время:** 2-3 дня

---

## 🎨 PHASE 5: FRONTEND ENHANCEMENT (Неделя 8)

### 5.1 Обновить GraveVinyl с real-time

**Файл:** `src/components/grave/GraveVinyl.tsx` (обновить)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSocket } from '@/contexts/socket-context'
import GraveVinylBase from './GraveVinylBase'

export default function GraveVinyl(props: GraveVinylProps) {
  const socket = useSocket()
  const [candlesLit, setCandlesLit] = useState(props.candlesLit || 0)
  const [tracks, setTracks] = useState(props.tracks || 1)
  
  useEffect(() => {
    if (!socket) return
    
    // Subscribe to candle lighting
    socket.on('candle:lit', (data) => {
      setCandlesLit(prev => prev + 1)
      // Trigger animation
    })
    
    // Subscribe to vinyl updates
    socket.on('vinyl:update', (data) => {
      setCandlesLit(data.candlesLit)
      if (data.newRay) {
        setTracks(prev => Math.min(prev + 1, 27))
      }
    })
    
    return () => {
      socket.off('candle:lit')
      socket.off('vinyl:update')
    }
  }, [socket])
  
  return (
    <GraveVinylBase
      {...props}
      candlesLit={candlesLit}
      tracks={tracks}
    />
  )
}
```

**Приоритет:** 🟡 HIGH
**Сложность:** Medium
**Время:** 2-3 дня

---

### 5.2 Создать Memorial Details Page

**Файл:** `src/app/grave/[id]/page.tsx`

```typescript
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import GraveVinyl from '@/components/grave/GraveVinyl'
import DonationsList from '@/components/grave/DonationsList'
import DonateButton from '@/components/grave/GraveDonateButton'

interface PageProps {
  params: { id: string }
}

export default async function MemorialDetailPage({ params }: PageProps) {
  const memorial = await db.graveMemorial.findUnique({
    where: { id: params.id },
    include: {
      donations: {
        orderBy: { createdAt: 'desc' },
        take: 50
      }
    }
  })
  
  if (!memorial) notFound()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            {memorial.artistName}
          </h1>
          <p className="text-gray-400">
            Forever in our hearts 🕯️
          </p>
        </div>
        
        {/* 3D Vinyl */}
        <div className="mb-12">
          <GraveVinyl
            bpm={120}
            tracks={memorial.donations.length}
            name={memorial.artistName}
            candlesLit={memorial.donations.length}
            isPlaying={true}
          />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-white/10 p-6 rounded-lg">
            <div className="text-3xl font-bold text-primary">
              {memorial.fundBalance.toString()} {memorial.currency}
            </div>
            <div className="text-gray-400">Total Funds</div>
          </div>
          
          <div className="bg-white/10 p-6 rounded-lg">
            <div className="text-3xl font-bold text-secondary">
              {memorial.donations.length}
            </div>
            <div className="text-gray-400">Candles Lit</div>
          </div>
          
          <div className="bg-white/10 p-6 rounded-lg">
            <div className="text-3xl font-bold text-accent">
              {memorial.visitCount.toLocaleString()}
            </div>
            <div className="text-gray-400">Visitors</div>
          </div>
        </div>
        
        {/* Donation Section */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <h2 className="text-2xl font-bold mb-6">Recent Donations</h2>
            <DonationsList donations={memorial.donations} />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6">Support This Memorial</h2>
            <DonateButton memorialId={memorial.id} />
          </div>
        </div>
        
      </div>
    </div>
  )
}
```

**Приоритет:** 🟡 HIGH
**Сложность:** Medium
**Время:** 3-4 дня

---

## 🔒 PHASE 6: SECURITY & TESTING (Неделя 9-10)

### 6.1 Smart Contract Audit

**Файл:** `contracts/GraveMemorialNFT.sol` (review)

**Требуется:**
- [ ] Статический анализ (Slither)
- [ ] Проверка reentrancy
- [ ] Проверка overflow/underflow
- [ ] Gas optimization review
- [ ] External audit (OpenZeppelin или Trail of Bits)

**Команды:**
```bash
npm install slither-analyzer
slither contracts/GraveMemorialNFT.sol

npm install mythril
myth analyze contracts/GraveMemorialNFT.sol
```

**Приоритет:** 🔴 CRITICAL
**Сложность:** High
**Время:** 5-7 дней (включая fixes)

---

### 6.2 Security Testing

**Файл:** `tests/grave.security.test.ts`

```typescript
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { GraveMemorialNFT } from '../typechain-types'

describe('GraveMemorialNFT Security Tests', () => {
  let grave: GraveMemorialNFT
  let owner: any
  let addr1: any
  let addr2: any
  
  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners()
    const Grave = await ethers.getContractFactory('GraveMemorialNFT')
    grave = await Grave.deploy()
  })
  
  describe('Reentrancy Protection', () => {
    it('should prevent reentrancy attacks', async () => {
      // Test реентрантность
    })
  })
  
  describe('Input Validation', () => {
    it('should not create memorial with invalid data', async () => {
      await expect(
        grave.createMemorial('', [], '')
      ).to.be.revertedWith('IPFS hash required')
    })
    
    it('should limit heirs to 10', async () => {
      const heirs = Array(11).fill(addr1.address)
      await expect(
        grave.createMemorial('QmTest', heirs, 'Artist')
      ).to.be.revertedWith('Too many heirs')
    })
  })
  
  describe('Fund Distribution', () => {
    it('should correctly calculate 2% fee', async () => {
      // Test fee calculation
    })
    
    it('should distribute to all heirs equally', async () => {
      // Test distribution logic
    })
  })
  
  describe('Access Control', () => {
    it('emergency withdraw should only be callable by owner', async () => {
      await expect(
        grave.connect(addr1).emergencyWithdraw()
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
})
```

**Приоритет:** 🔴 CRITICAL
**Сложность:** High
**Время:** 4-5 дней

---

### 6.3 API Security Testing

**Файл:** `tests/grave-api.security.test.ts`

```typescript
import axios from 'axios'

describe('G.Rave API Security', () => {
  
  describe('Rate Limiting', () => {
    it('should rate limit donation endpoint', async () => {
      for (let i = 0; i < 6; i++) {
        const response = await axios.post('/api/grave/donations', {}, {
          headers: { 'x-telegram-init-data': 'test' }
        })
        
        if (i < 5) {
          expect(response.status).toBe(200)
        } else {
          expect(response.status).toBe(429) // Too Many Requests
        }
      }
    })
  })
  
  describe('Input Sanitization', () => {
    it('should sanitize XSS attempts', async () => {
      const response = await axios.post('/api/grave/donations', {
        message: '<script>alert("xss")</script>',
        memorialId: 'test'
      }, {
        headers: { 'x-telegram-init-data': 'test' }
      })
      
      expect(response.data.donation.message).not.toContain('<script>')
    })
  })
  
  describe('Authentication', () => {
    it('should reject missing Telegram auth', async () => {
      const response = await axios.post('/api/grave/donations', {})
      expect(response.status).toBe(401)
    })
  })
})
```

**Приоритет:** 🟡 HIGH
**Сложность:** Medium
**Время:** 3-4 дня

---

## 📊 PHASE 7: MONITORING & DEPLOYMENT (Неделя 11-12)

### 7.1 Analytics Setup

**Файл:** `src/lib/grave/analytics.ts`

```typescript
import { analytics } from '@/lib/analytics'

export function trackGraveEvent(event: string, data: any) {
  analytics.track(event, {
    ...data,
    timestamp: new Date(),
    source: 'grave'
  })
}

// Key events:
export const GraveEvents = {
  MEMORIAL_CREATED: 'grave:memorial_created',
  DONATION_MADE: 'grave:donation_made',
  CANDLE_LIT: 'grave:candle_lit',
  MEMORIAL_VISITED: 'grave:memorial_visited',
  SHARE_INITIATED: 'grave:share_initiated'
}
```

**Приоритет:** 🟢 MEDIUM
**Сложность:** Low
**Время:** 1-2 дня

---

### 7.2 Monitoring & Alerts

**Файл:** `monitoring/grave-alerts.yml`

```yaml
alerts:
  - name: HighDonationFailureRate
    expr: rate(grave_donation_failures_total[5m]) > 0.05
    severity: warning
    
  - name: ContractGasError
    expr: grave_contract_gas_errors_total > 10
    severity: critical
    
  - name: APIDowntime
    expr: up{job="grave-api"} == 0
    severity: critical
```

**Приоритет:** 🟡 HIGH
**Сложность:** Low
**Время:** 2-3 дня

---

### 7.3 Deployment Checklist

```
PRE-DEPLOYMENT:
[ ] Contract audit completed
[ ] All tests passing (100% coverage)
[ ] Security review passed
[ ] Monitoring setup
[ ] Analytics configured
[ ] Documentation updated
[ ] Backup strategy tested
[ ] Rollback plan documented

DEPLOYMENT:
[ ] Deploy to testnet first
[ ] 24hr monitoring period
[ ] Community feedback collection
[ ] Deploy to mainnet
[ ] Monitor for 7 days
[ ] Gradual traffic ramp-up

POST-DEPLOYMENT:
[ ] Monitor KPIs
[ ] Collect user feedback
[ ] Prepare Phase 2 features
[ ] Community updates
```

**Приоритет:** 🔴 CRITICAL
**Сложность:** Medium
**Время:** 2-3 дня (+ monitoring period)

---

## 📈 ESTIMATED EFFORT & TIMELINE

| Phase | Duration | Effort | Priority |
|-------|----------|--------|----------|
| 1. Blockchain Foundation | 3 недели | 120h | 🔴 CRITICAL |
| 2. Telegram Integration | 2 недели | 80h | 🔴 CRITICAL |
| 3. Database & Persistence | 1 неделя | 40h | 🔴 CRITICAL |
| 4. Real-time Features | 1 неделя | 40h | 🟡 HIGH |
| 5. Frontend Enhancement | 1 неделя | 40h | 🟡 HIGH |
| 6. Security & Testing | 2 недели | 80h | 🔴 CRITICAL |
| 7. Monitoring & Deployment | 1 неделя | 40h | 🟡 HIGH |
| **TOTAL** | **11 недель** | **440h** | - |

---

## 💰 ESTIMATED BUDGET

**For 1 experienced full-stack developer:**
- 11 weeks × 40h/week = 440 hours
- Rate: $75-150/hour
- **Total: $33K - $66K**

**Alternative: Agency (2-3 people, faster):**
- 5-6 weeks
- **Total: $40K - $80K**

---

## 🎯 SUCCESS CRITERIA

✅ **Launch readiness when:**
- [ ] Smart contract deployed and audited on mainnet
- [ ] All API endpoints tested and secured
- [ ] Telegram Mini App fully functional
- [ ] 100K+ transactions in testnet
- [ ] <1% error rate on API
- [ ] <100ms response time (p95)
- [ ] <1% donation failure rate
- [ ] Community feedback positive

---

## 📝 DEPENDENCIES

**Required Services:**
- Ethereum RPC (Infura, Alchemy)
- Telegram Bot API
- TON Blockchain RPC
- IPFS (Pinata, Nft.storage)
- PostgreSQL Database
- Redis Cache
- Socket.IO Server

**Dependencies to install:**
```bash
npm install ethers hardhat
npm install telegraf @twa-dev/sdk
npm install @tonweb-community/ton
npm install socket.io socket.io-client
npm install @prisma/client
```

---

## 🚀 QUICK START GUIDE

```bash
# 1. Setup environment
cp .env.example .env.local
# Edit with your keys

# 2. Install dependencies
npm install
cd contracts && npm install

# 3. Deploy contract to testnet
npx hardhat run scripts/deploy-grave.ts --network sepolia

# 4. Setup Telegram bot
export TELEGRAM_BOT_TOKEN=YOUR_TOKEN
npm run bot:dev

# 5. Setup database
npx prisma migrate dev
npx prisma generate

# 6. Start development
npm run dev

# 7. Test API
curl http://localhost:3000/api/grave/memorials
```

---

## 📞 SUPPORT & RESOURCES

- Smart Contract Docs: https://docs.soliditylang.org
- Telegram Bot API: https://core.telegram.org/bots/api
- TON Documentation: https://ton.org/docs
- Hardhat: https://hardhat.org/docs
- Prisma ORM: https://www.