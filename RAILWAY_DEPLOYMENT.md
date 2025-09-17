# Railway Deployment Configuration for NORMALDANCE

## 🚀 Railway Configuration

### 1. Create railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Environment Variables
```bash
# Production settings
NODE_ENV=production
PORT=3000

# Database (Railway will provide)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (Railway will provide)
REDIS_URL=${{Redis.REDIS_URL}}

# Authentication
NEXTAUTH_URL=https://normaldance.tk
NEXTAUTH_SECRET=your_super_secret_key_change_me

# IPFS Configuration
IPFS_GATEWAY=https://ipfs.io/ipfs/
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WS_URL=wss://api.mainnet-beta.solana.com
NDT_PROGRAM_ID=your_ndt_program_id
TRACKNFT_PROGRAM_ID=your_tracknft_program_id
STAKING_PROGRAM_ID=your_staking_program_id
```

### 3. Railway Services Setup
1. **Main App Service**
   - Source: GitHub repository
   - Build Command: `npm run build`
   - Start Command: `npm start`

2. **PostgreSQL Service**
   - Type: PostgreSQL
   - Plan: Hobby (Free)

3. **Redis Service**
   - Type: Redis
   - Plan: Hobby (Free)

### 4. Custom Domain Setup
1. Go to Railway dashboard
2. Select your project
3. Go to Settings → Domains
4. Add custom domain: `normaldance.tk`
5. Configure DNS in Freenom:
   - A record: @ → Railway IP
   - CNAME: www → your-project.railway.app

### 5. SSL Certificate
- Railway automatically provides SSL certificates
- No additional configuration needed

## 🔧 Code Modifications for Railway

### 1. Update server.ts for Railway
```typescript
// server.ts - Railway compatible version
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';

async function createCustomServer() {
  try {
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    const server = createServer((req, res) => {
      if (req.url?.startsWith('/api/socketio')) {
        return;
      }
      handle(req, res);
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: process.env.NEXTAUTH_URL || '*',
        methods: ['GET', 'POST']
      }
    });

    setupSocket(io);

    server.listen(port, hostname, () => {
      console.log(`🚀 Server running on http://${hostname}:${port}`);
    });

  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

createCustomServer();
```

### 2. Update package.json scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "node server.js",
    "railway:build": "npm run build && npm run db:generate",
    "railway:start": "node server.js"
  }
}
```

### 3. Update Dockerfile for Railway
```dockerfile
# Railway optimized Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/server.js ./

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## 📊 Railway vs Other Platforms

| Feature | Railway | Render | Fly.io | Vercel |
|---------|---------|--------|--------|--------|
| Free Plan | $5 credits | 750h/month | 3 apps | 100GB |
| PostgreSQL | ✅ | ✅ | ✅ | ❌ |
| Redis | ✅ | ✅ | ✅ | ❌ |
| Socket.IO | ✅ | ✅ | ✅ | ❌ |
| Custom Domain | ✅ | ✅ | ✅ | ✅ |
| SSL | ✅ | ✅ | ✅ | ✅ |
| Sleep Mode | ❌ | ✅ | ❌ | ❌ |

## 🎯 Deployment Steps

1. **Prepare Repository**
   - Add railway.json
   - Update server.ts
   - Update package.json

2. **Connect to Railway**
   - Login to Railway
   - Connect GitHub repository
   - Create new project

3. **Add Services**
   - Add PostgreSQL service
   - Add Redis service
   - Configure environment variables

4. **Deploy**
   - Railway will auto-deploy
   - Check logs for errors
   - Test the application

5. **Custom Domain**
   - Add domain in Railway
   - Configure DNS in Freenom
   - Wait for SSL certificate

## 💡 Tips for Railway

- Use Railway CLI for local development
- Monitor usage in dashboard
- Set up alerts for errors
- Use Railway's built-in monitoring
- Optimize for Railway's resource limits
