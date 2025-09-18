#!/bin/bash
set -e

echo "🏠 NORMALDANCE Local Production Setup"

# Environment
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Install
npm ci --production
npm install pm2 -g

# Build
npm run build

# Database
npx prisma migrate deploy

# Start with PM2
pm2 delete normaldance 2>/dev/null || true
pm2 start npm --name "normaldance" -- start
pm2 save
pm2 startup

echo "✅ Local production server started"
echo "🌐 http://localhost:3000"
echo "📊 PM2 status: pm2 status"