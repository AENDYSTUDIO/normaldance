#!/bin/bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"; }
error() { echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1" >&2; }

# Rollback function
rollback() {
    error "Deployment failed. Rolling back..."
    git checkout HEAD~1 2>/dev/null || warn "No previous commit to rollback to"
    npm install --production 2>/dev/null || true
    exit 1
}

trap rollback ERR

log "🚀 NORMALDANCE Production Deployment"

# Pre-flight checks
log "🔍 Pre-flight checks..."
[[ -f package.json ]] || { error "package.json not found"; exit 1; }
[[ -f prisma/schema.prisma ]] || { error "Prisma schema not found"; exit 1; }
node --version || { error "Node.js not installed"; exit 1; }

# Environment setup
log "🌍 Setting up environment..."
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export DATABASE_URL="file:./prod.db"

# Security audit
log "🔒 Security audit..."
npm audit --audit-level high --production || warn "Security vulnerabilities found"

# Dependencies
log "📦 Installing dependencies..."
npm ci --production
npm install @upstash/redis @upstash/ratelimit helmet sharp --save-prod

# Database setup
log "💾 Database setup..."
npx prisma generate
npx prisma migrate deploy --schema=prisma/schema.prisma

# Build
log "🏗️ Building application..."
npm run build || { error "Build failed"; rollback; }

# Health check function
health_check() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf "$url/api/health" >/dev/null 2>&1; then
            log "✅ Health check passed"
            return 0
        fi
        warn "Health check attempt $attempt/$max_attempts failed"
        sleep 2
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
    return 1
}

# Start local server for testing
log "🧪 Testing build..."
npm start &
SERVER_PID=$!
sleep 5

if health_check "http://localhost:3000"; then
    kill $SERVER_PID 2>/dev/null || true
else
    kill $SERVER_PID 2>/dev/null || true
    rollback
fi

# Deploy
log "🚀 Deploying to production..."
if command -v vercel &>/dev/null; then
    log "Deploying to Vercel..."
    vercel --prod --yes
    DEPLOY_URL=$(vercel --prod --yes 2>&1 | grep -o 'https://[^[:space:]]*' | tail -1)
elif command -v railway &>/dev/null; then
    log "Deploying to Railway..."
    railway up
    DEPLOY_URL="https://$(railway status --json | jq -r '.deployments[0].url')"
elif [[ -n "${DOCKER_REGISTRY:-}" ]]; then
    log "Building Docker image..."
    docker build -t normaldance:latest .
    docker tag normaldance:latest "$DOCKER_REGISTRY/normaldance:$(git rev-parse --short HEAD)"
    docker push "$DOCKER_REGISTRY/normaldance:$(git rev-parse --short HEAD)"
    DEPLOY_URL="$DOCKER_REGISTRY"
else
    warn "No deployment platform configured. Manual deployment required."
    DEPLOY_URL="manual"
fi

# Post-deployment verification
if [[ "$DEPLOY_URL" != "manual" ]]; then
    log "🔍 Post-deployment verification..."
    sleep 10
    if health_check "$DEPLOY_URL"; then
        log "✅ Deployment successful!"
    else
        error "Post-deployment health check failed"
        rollback
    fi
fi

# Cleanup
log "🧹 Cleanup..."
npm prune --production

# Success
log "🎉 NORMALDANCE deployed successfully!"
log "🌐 URL: $DEPLOY_URL"
log "📊 Analytics: $DEPLOY_URL/api/analytics"
log "🏥 Health: $DEPLOY_URL/api/health"
log "📈 Monitor: $DEPLOY_URL/api/monitoring"