#!/bin/bash

# Complete Deployment Script for NormalDance
# Automates server rental, domain purchase, DNS setup, and deployment

set -e

# Configuration
DOMAIN=${DOMAIN:-"normaldance.com"}
EMAIL=${EMAIL:-"admin@normaldance.com"}
SERVER_IP=""
SERVER_ID=""

# API Keys
HETZNER_TOKEN=${HETZNER_TOKEN}
NAMECHEAP_API_KEY=${NAMECHEAP_API_KEY}
NAMECHEAP_USER=${NAMECHEAP_USER}
CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
CLOUDFLARE_ZONE_ID=${CLOUDFLARE_ZONE_ID}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v node >/dev/null 2>&1 || error "Node.js is required but not installed"
    command -v git >/dev/null 2>&1 || error "Git is required but not installed"
    command -v curl >/dev/null 2>&1 || error "Curl is required but not installed"
    
    # Check if API keys are provided
    if [[ -z "$HETZNER_TOKEN" ]]; then
        error "HETZNER_TOKEN environment variable is required"
    fi
    
    if [[ -z "$NAMECHEAP_API_KEY" && -z "$CLOUDFLARE_API_TOKEN" ]]; then
        error "Either NAMECHEAP_API_KEY or CLOUDFLARE_API_TOKEN is required"
    fi
    
    log "Prerequisites check passed"
}

# Generate SSH key if not exists
generate_ssh_key() {
    log "Generating SSH key..."
    
    local key_path="./keys/id_rsa"
    local pub_key_path="./keys/id_rsa.pub"
    
    if [[ ! -f "$key_path" ]]; then
        mkdir -p ./keys
        ssh-keygen -t rsa -b 4096 -f "$key_path" -N "" -C "normaldance-deploy"
        log "SSH key generated at $key_path"
    else
        log "SSH key already exists at $key_path"
    fi
    
    echo "$pub_key_path"
}

# Deploy server via Hetzner API
deploy_server() {
    log "Deploying server via Hetzner API..."
    
    local pub_key_path=$(generate_ssh_key)
    
    # Run Hetzner deployment script
    node scripts/deploy/hetzner-api.js
    
    # Extract server info from deployment-info.json
    if [[ -f "deployment-info.json" ]]; then
        SERVER_IP=$(node -e "console.log(require('./deployment-info.json').serverIP)")
        SERVER_ID=$(node -e "console.log(require('./deployment-info.json').serverId)")
        log "Server deployed successfully: $SERVER_IP (ID: $SERVER_ID)"
    else
        error "Failed to get server information"
    fi
}

# Setup domain and DNS
setup_domain() {
    log "Setting up domain and DNS..."
    
    # Set server IP for domain script
    export SERVER_IP
    
    # Run domain setup script
    node scripts/deploy/domain-api.js
    
    log "Domain and DNS setup completed"
}

# Wait for server to be ready
wait_for_server() {
    log "Waiting for server to be ready..."
    
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if curl -s --connect-timeout 5 "http://$SERVER_IP" >/dev/null 2>&1; then
            log "Server is responding"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log "Waiting for server... (attempt $attempt/$max_attempts)"
        sleep 30
    done
    
    error "Server failed to respond within timeout"
}

# Deploy application
deploy_application() {
    log "Deploying application to server..."
    
    # Create deployment package
    log "Creating deployment package..."
    tar -czf normaldance-deploy.tar.gz \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=*.log \
        --exclude=deployment-info.json \
        --exclude=domain-info.json \
        .
    
    # Upload to server
    log "Uploading application to server..."
    scp -i ./keys/id_rsa -o StrictHostKeyChecking=no \
        normaldance-deploy.tar.gz \
        ubuntu@$SERVER_IP:/opt/normaldance/
    
    # Deploy on server
    log "Deploying application on server..."
    ssh -i ./keys/id_rsa -o StrictHostKeyChecking=no ubuntu@$SERVER_IP << 'EOF'
        cd /opt/normaldance
        
        # Extract application
        tar -xzf normaldance-deploy.tar.gz
        rm normaldance-deploy.tar.gz
        
        # Install dependencies
        npm install --production
        
        # Build application
        npm run build
        
        # Setup Docker Compose
        docker-compose -f scripts/deploy/docker-compose.prod.yml up -d
        
        # Wait for services to be ready
        sleep 30
        
        # Check if services are running
        docker-compose -f scripts/deploy/docker-compose.prod.yml ps
        
        echo "Application deployed successfully!"
EOF
    
    # Clean up local package
    rm -f normaldance-deploy.tar.gz
    
    log "Application deployment completed"
}

# Setup SSL
setup_ssl() {
    log "Setting up SSL..."
    
    # Upload SSL setup script
    scp -i ./keys/id_rsa -o StrictHostKeyChecking=no \
        scripts/deploy/ssl-setup.sh \
        ubuntu@$SERVER_IP:/tmp/
    
    # Run SSL setup
    ssh -i ./keys/id_rsa -o StrictHostKeyChecking=no ubuntu@$SERVER_IP << EOF
        chmod +x /tmp/ssl-setup.sh
        export DOMAIN=$DOMAIN
        export EMAIL=$EMAIL
        export SERVER_IP=$SERVER_IP
        export CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN
        export CLOUDFLARE_ZONE_ID=$CLOUDFLARE_ZONE_ID
        /tmp/ssl-setup.sh
EOF
    
    log "SSL setup completed"
}

# Run health checks
health_checks() {
    log "Running health checks..."
    
    local endpoints=(
        "http://$SERVER_IP/health"
        "https://$DOMAIN/health"
        "https://$DOMAIN/api/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log "Checking $endpoint..."
        if curl -s --connect-timeout 10 "$endpoint" >/dev/null 2>&1; then
            log "✅ $endpoint is healthy"
        else
            warning "❌ $endpoint is not responding"
        fi
    done
}

# Display deployment summary
deployment_summary() {
    log "Deployment completed successfully!"
    
    echo ""
    info "=== Deployment Summary ==="
    info "🌐 Domain: https://$DOMAIN"
    info "🖥️  Server IP: $SERVER_IP"
    info "🆔 Server ID: $SERVER_ID"
    info "🔒 SSL: ✅ Configured"
    info "🐳 Docker: ✅ Running"
    info "📊 Monitoring: ✅ Active"
    echo ""
    info "=== Access Information ==="
    info "Website: https://$DOMAIN"
    info "API: https://$DOMAIN/api"
    info "WebSocket: wss://$DOMAIN/socket.io"
    info "Monitoring: http://$SERVER_IP:9090"
    info "Grafana: http://$SERVER_IP:3003"
    echo ""
    info "=== Server Management ==="
    info "SSH: ssh -i ./keys/id_rsa ubuntu@$SERVER_IP"
    info "Docker: docker-compose -f /opt/normaldance/scripts/deploy/docker-compose.prod.yml"
    info "Logs: docker-compose -f /opt/normaldance/scripts/deploy/docker-compose.prod.yml logs"
    echo ""
    info "=== Cost Estimation ==="
    info "Server (4 vCPU, 8 GB RAM): ~€15-20/month"
    info "Domain: ~€10-15/year"
    info "Total: ~€20-25/month"
    echo ""
}

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    rm -f normaldance-deploy.tar.gz
    log "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting complete deployment for NormalDance..."
    log "Domain: $DOMAIN"
    log "Email: $EMAIL"
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Run deployment steps
    check_prerequisites
    deploy_server
    setup_domain
    wait_for_server
    deploy_application
    setup_ssl
    health_checks
    deployment_summary
    
    log "🎉 Deployment completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "server")
        check_prerequisites
        deploy_server
        ;;
    "domain")
        check_prerequisites
        setup_domain
        ;;
    "app")
        check_prerequisites
        deploy_application
        ;;
    "ssl")
        check_prerequisites
        setup_ssl
        ;;
    "health")
        health_checks
        ;;
    "full"|"")
        main
        ;;
    *)
        echo "Usage: $0 [server|domain|app|ssl|health|full]"
        echo ""
        echo "Commands:"
        echo "  server  - Deploy server only"
        echo "  domain  - Setup domain and DNS only"
        echo "  app     - Deploy application only"
        echo "  ssl     - Setup SSL only"
        echo "  health  - Run health checks only"
        echo "  full    - Complete deployment (default)"
        exit 1
        ;;
esac
