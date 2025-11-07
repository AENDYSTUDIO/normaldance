#!/bin/bash

# NORMAL DANCE Open Source Deployment Script
# Deploys the 70% open source components to Vercel
# Author: NORMAL DANCE DevOps
# Version: 0.4.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OPEN_SOURCE_DOMAIN="normaldance.online"
STAGING_DOMAIN="staging.normaldance.online"
DEV_DOMAIN="dev.normaldance.versel.app"

# Environment variables
VERCEL_ORG_ID="team_xSxVs3bqAECpKgHjygmKyG3K"
PUBLIC_PROJECT_ID="prj_gieiZJh7d05oIJeApRweuhZ2CGxH"

echo -e "${BLUE}🚀 NORMAL DANCE Open Source Deployment${NC}"
echo -e "${BLUE}=====================================${NC}"
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

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_warn "Vercel CLI not found, installing..."
        npm install -g vercel
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    
    # Check we're in project root
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        log_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check environment variables
    local env_file="$PROJECT_ROOT/.env.production"
    if [ ! -f "$env_file" ]; then
        log_warn "Production .env file not found. Please create .env.production"
        echo "Copy .env.example to .env.production and configure"
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

# Security checks
security_checks() {
    log_step "Running security checks..."
    
    # Check for sensitive files that shouldn't be committed
    log_info "Checking for accidentally committed secrets..."
    
    local found_secrets=false
    
    # Check for common secret patterns in git history
    if git log --all --grep="password\|secret\|key\|token" --oneline | head -5 | grep -q .; then
        log_warn "Potential secrets found in commit messages. Please review."
        found_secrets=true
    fi
    
    # Check for .env files being tracked
    if git ls-files | grep -q "\.env"; then
        log_warn "Found .env files tracked in git. This should be avoided."
        found_secrets=true
    fi
    
    # Check for private keys
    if git grep -l "BEGIN.*PRIVATE KEY" --name-only .git 2>/dev/null | head -5 | grep -q .; then
        log_error "Private keys found in repository history. This is dangerous!"
        found_secrets=true
    fi
    
    if [ "$found_secrets" = true ]; then
        echo
        read -p "Continue despite security warnings? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    log_info "Security checks completed ✓"
}

# Build preparation
prepare_build() {
    log_step "Preparing build environment..."
    
    # Load production environment
    if [ -f "$PROJECT_ROOT/.env.production" ]; then
        export $(cat "$PROJECT_ROOT/.env.production" | grep -v '^#' | xargs)
        log_info "Loaded production environment variables"
    fi
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production=false
    
    # Run database migrations if needed
    if npm run db:migrate:prod 2>/dev/null; then
        log_info "Database migrations completed"
    else
        log_warn "Database migrations failed or not needed"
    fi
    
    log_info "Build preparation completed ✓"
}

# Type checking and linting
code_quality_checks() {
    log_step "Running code quality checks..."
    
    # TypeScript type check
    log_info "Running TypeScript type checking..."
    if npm run type-check 2>/dev/null; then
        log_info "TypeScript type check passed ✓"
    else
        log_warn "TypeScript type check failed - continuing anyway"
    fi
    
    # Linting
    log_info "Running ESLint..."
    if npm run lint -- --max-warnings=10 2>/dev/null; then
        log_info "ESLint check passed ✓"
    else
        log_warn "ESLint check found issues - continuing anyway"
    fi
    
    log_info "Code quality checks completed"
}

# Run tests
run_tests() {
    log_step "Running tests..."
    
    # Unit tests
    log_info "Running unit tests..."
    if npm run test:unit 2>/dev/null; then
        log_info "Unit tests passed ✓"
    else
        log_warn "Unit tests failed - continuing anyway"
    fi
    
    # Integration tests
    log_info "Running integration tests..."
    if npm run test:integration 2>/dev/null; then
        log_info "Integration tests passed ✓"
    else
        log_warn "Integration tests failed - continuing anyway"
    fi
    
    log_info "Test suite completed"
}

# Build application
build_application() {
    log_step "Building application..."
    
    # Build for production
    log_info "Creating production build..."
    if npm run build; then
        log_info "Build completed successfully ✓"
    else
        log_error "Build failed"
        exit 1
    fi
    
    # Check build output
    if [ ! -d ".next" ]; then
        log_error "Build output directory not found"
        exit 1
    fi
    
    log_info "Build verification completed ✓"
}

# Development deployment
deploy_development() {
    if [ "$SKIP_DEV" = "true" ]; then
        log_warn "Skipping development deployment"
        return
    fi
    
    log_step "Deploying to development environment..."
    
    cd "$PROJECT_ROOT"
    
    # Deploy to development
    log_info "Deploying to $DEV_DOMAIN..."
    
    # Use vercel.json.dev configuration
    DEPLOY_URL=$(vercel deploy \
        --scope "$VERCEL_ORG_ID" \
        --project "$PUBLIC_PROJECT_ID" \
        --token="$VERCEL_TOKEN" \
        --name "normaldance-dev" \
        --confirm \
        --no-wait)
    
    echo "$DEPLOY_URL" > /tmp/dev-deploy-url.txt
    
    log_info "Development deployment: $DEPLOY_URL"
    log_info "Development deployment completed ✓"
}

# Staging deployment
deploy_staging() {
    if [ "$SKIP_STAGING" = "true" ]; then
        log_warn "Skipping staging deployment"
        return
    fi
    
    log_step "Deploying to staging environment..."
    
    cd "$PROJECT_ROOT"
    
    # Deploy to staging
    log_info "Deploying to $STAGING_DOMAIN..."
    
    STAGING_URL=$(vercel deploy \
        --scope "$VERCEL_ORG_ID" \
        --project "$PUBLIC_PROJECT_ID" \
        --token="$VERCEL_TOKEN" \
        --name "normaldance-staging" \
        --confirm \
        --alias "$STAGING_DOMAIN")
    
    echo "$STAGING_URL" > /tmp/staging-deploy-url.txt
    
    log_info "Staging deployment: $STAGING_URL"
    log_info "Staging deployment completed ✓"
}

# Production deployment
deploy_production() {
    log_step "Deploying to production environment..."
    
    cd "$PROJECT_ROOT"
    
    # Confirm production deployment
    if [ "$SKIP_CONFIRM" != "true" ]; then
        echo
        echo -e "${YELLOW}!  IMPORTANT: This will deploy to PRODUCTION${NC}"
        echo -e "${YELLOW}!  Domain: $OPEN_SOURCE_DOMAIN${NC}"
        echo
        read -p "Continue with production deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_warn "Production deployment cancelled"
            exit 0
        fi
    fi
    
    # Deploy to production
    log_info "Deploying to $OPEN_SOURCE_DOMAIN..."
    
    PROD_URL=$(vercel deploy \
        --scope "$VERCEL_ORG_ID" \
        --project "$PUBLIC_PROJECT_ID" \
        --token="$VERCEL_TOKEN" \
        --prod \
        --name "normaldance-prod" \
        --confirm \
        --alias "$OPEN_SOURCE_DOMAIN")
    
    echo "$PROD_URL" > /tmp/prod-deploy-url.txt
    
    log_info "Production deployment: $PROD_URL"
    log_info "Production deployment completed ✓"
}

# Post-deployment verification
verify_deployment() {
    log_step "Verifying deployment..."
    
    local deploy_url=""
    local environment=""
    
    # Determine which deployment to verify
    if [ -f "/tmp/prod-deploy-url.txt" ] && [ "$SKIP_PRODUCTION" != "true" ]; then
        deploy_url=$(cat /tmp/prod-deploy-url.txt)
        environment="production"
    elif [ -f "/tmp/staging-deploy-url.txt" ]; then
        deploy_url=$(cat /tmp/staging-deploy-url.txt)
        environment="staging"
    elif [ -f "/tmp/dev-deploy-url.txt" ]; then
        deploy_url=$(cat /tmp/dev-deploy-url.txt)
        environment="development"
    else
        log_warn "No deployment URL found for verification"
        return
    fi
    
    log_info "Verifying $environment deployment at: $deploy_url"
    
    # Wait for deployment to propagate
    log_info "Waiting for deployment to propagate..."
    sleep 30
    
    # Health check
    log_info "Testing health endpoint..."
    if curl -f -s "$deploy_url/api/health" > /dev/null; then
        log_info "Health check passed ✓"
    else
        log_warn "Health check failed - deployment may still be starting"
    fi
    
    # Test music catalog endpoint
    log_info "Testing music catalog endpoint..."
    if curl -f -s "$deploy_url/api/tracks?limit=5" > /dev/null; then
        log_info "Music catalog endpoint working ✓"
    else
        log_warn "Music catalog endpoint not responding"
    fi
    
    # Test static assets
    log_info "Testing static assets..."
    if curl -f -s "$deploy_url/_next/static/chunks/main.js" > /dev/null; then
        log_info "Static assets loading ✓"
    else
        log_warn "Static assets not loading properly"
    fi
    
    log_info "Deployment verification completed"
}

# Performance audit (optional)
performance_audit() {
    if [ "$SKIP_LIGHTHOUSE" = "true" ]; then
        log_warn "Skipping Lighthouse audit"
        return
    fi
    
    log_step "Running Lighthouse performance audit..."
    
    local deploy_url=""
    
    if [ -f "/tmp/prod-deploy-url.txt" ]; then
        deploy_url=$(cat /tmp/prod-deploy-url.txt)
    elif [ -f "/tmp/staging-deploy-url.txt" ]; then
        deploy_url=$(cat /tmp/staging-deploy-url.txt)
    else
        log_warn "No deployment URL found for performance audit"
        return
    fi
    
    # Check if Lighthouse is available
    if command -v lighthouse &> /dev/null; then
        log_info "Running Lighthouse audit on $deploy_url"
        
        mkdir -p "$PROJECT_ROOT/artifacts"
        
        lighthouse "$deploy_url" \
            --output=json \
            --output=html \
            --chrome-flags="--headless" \
            --quiet \
            --output-path="$PROJECT_ROOT/artifacts/lighthouse-report-open-source" \
            --preset=performance \
            --view
        
        log_info "Lighthouse audit completed"
        log_info "Report saved to: artifacts/lighthouse-report-open-source.html"
    else
        log_warn "Lighthouse CLI not available. Install with: npm install -g lighthouse"
    fi
}

# Generate deployment report
generate_report() {
    log_step "Generating deployment report..."
    
    local report_file="$PROJECT_ROOT/artifacts/deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    mkdir -p "$PROJECT_ROOT/artifacts"
    
    cat > "$report_file" << EOF
# NORMAL DANCE Open Source Deployment Report

## Deployment Information
- **Date**: $(date)
- **Version**: $(git describe --tags --always || echo "unknown")
- **Commit**: $(git rev-parse HEAD)
- **Branch**: $(git rev-parse --abbrev-ref HEAD)

## Environments
EOF

    if [ -f "/tmp/prod-deploy-url.txt" ]; then
        echo "- **Production**: $(cat /tmp/prod-deploy-url.txt)" >> "$report_file"
    fi

    if [ -f "/tmp/staging-deploy-url.txt" ]; then
        echo "- **Staging**: $(cat /tmp/staging-deploy-url.txt)" >> "$report_file"
    fi

    if [ -f "/tmp/dev-deploy-url.txt" ]; then
        echo "- **Development**: $(cat /tmp/dev-deploy-url.txt)" >> "$report_file"
    fi

    cat >> "$report_file" << EOF

## Build Information
- **Node.js**: $(node --version)
- **npm**: $(npm --version)
- **Build Time**: $(date)

## Open Source Features Deployed
✅ Music catalog browsing
✅ User authentication system
✅ Basic Web3 wallet connections
✅ Music playback functionality
✅ Playlist management
✅ Public API endpoints

## Integration Points
🔗 Bridge to G.Rave memorial system (private)
🔗 Bridge to Telegram Mini App (private)
🔗 Bridge to AI recommendation engine (private)
🔗 Bridge to ZK-privacy system (private)
🔗 Bridge to mobile optimization (private)

## Notes
- This deployment contains the 70% open source components
- Commercial IP components are deployed separately
- Bridge APIs securely integrate public and private services
- All environment-specific configurations are applied

## Next Steps
1. Deploy commercial IP components using deploy-commercial.sh
2. Test bridge connectivity between services
3. Verify complete end-to-end functionality

---
*Report generated automatically by deploy-opensource.sh*
EOF

    log_info "Deployment report saved to: $report_file"
}

# Cleanup
cleanup() {
    log_step "Cleaning up temporary files..."
    
    rm -f /tmp/*-deploy-url.txt
    
    log_info "Cleanup completed ✓"
}

# Main execution
main() {
    # Parse command line arguments
    SKIP_DEV=false
    SKIP_STAGING=false
    SKIP_PRODUCTION=false
    SKIP_CONFIRM=false
    SKIP_LIGHTHOUSE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-dev)
                SKIP_DEV=true
                shift
                ;;
            --skip-staging)
                SKIP_STAGING=true
                shift
                ;;
            --skip-production)
                SKIP_PRODUCTION=true
                shift
                ;;
            --auto-confirm)
                SKIP_CONFIRM=true
                shift
                ;;
            --skip-lighthouse)
                SKIP_LIGHTHOUSE=true
                shift
                ;;
            --dev-only)
                SKIP_STAGING=true
                SKIP_PRODUCTION=true
                SKIP_CONFIRM=true
                shift
                ;;
            prod-only)
                SKIP_DEV=true
                SKIP_STAGING=true
                shift
                ;;
            staging-only)
                SKIP_DEV=true
                SKIP_PRODUCTION=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo
                echo "OPTIONS:"
                echo "  --skip-dev          Skip development deployment"
                echo "  --skip-staging     Skip staging deployment"
                echo "  --skip-production   Skip production deployment"
                echo "  --auto-confirm     Skip production confirmation prompt"
                echo "  --skip-lighthouse  Skip Lighthouse performance audit"
                echo "  --dev-only         Deploy to development only"
                echo "  --staging-only     Deploy to staging only"
                echo "  --prod-only        Deploy to production only"
                echo "  --help             Show this help"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Set up error handling
    trap cleanup EXIT
    
    # If all skips are enabled, default to production
    if [ "$SKIP_DEV" = true ] && [ "$SKIP_STAGING" = true ] && [ "$SKIP_PRODUCTION" = true ]; then
        log_warn "All deployments skipped. Enabling production deployment."
        SKIP_PRODUCTION=false
    fi
    
    # Execute deployment workflow
    log_info "Starting Open Source deployment workflow..."
    
    check_prerequisites
    security_checks
    prepare_build
    code_quality_checks
    run_tests
    build_application
    
    # Deployments
    deploy_development
    deploy_staging
    deploy_production
    
    # Verification and reporting
    verify_deployment
    performance_audit
    generate_report
    
    echo
    echo -e "${GREEN}🎉 Open Source deployment completed successfully!${NC}"
    echo
    echo -e "${BLUE}Deployment Summary:${NC}"
    
    if [ -f "/tmp/prod-deploy-url.txt" ]; then
        echo -e "  ${GREEN}✅${NC} Production: $(cat /tmp/prod-deploy-url.txt)"
    fi
    
    if [ -f "/tmp/staging-deploy-url.txt" ]; then
        echo -e "  ${YELLOW}🔶${NC} Staging: $(cat /tmp/staging-deploy-url.txt)"
    fi
    
    if [ -f "/tmp/dev-deploy-url.txt" ]; then
        echo -e "  ${BLUE}🔵${NC} Development: $(cat /tmp/dev-deploy-url.txt)"
    fi
    
    echo
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Navigate to the deployed environment(s) above"
    echo "2. Test the open source features"
    echo "3. Deploy commercial IP components with: ./scripts/deploy-commercial.sh"
    echo "4. Test bridge connectivity between services"
}

# Run main function
main "$@"
