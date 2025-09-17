#!/bin/bash
# Cloud.ru deployment script for NORMALDANCE

set -e

echo "🇷🇺 Deploying NORMALDANCE to Cloud.ru..."

# Configuration
API_KEY="7d6d24281a43e50068d35d63f7ead515"
CUSTOMER_ID="fd8aec7e-aeba-4626-be40-87d9520dc825"
PROJECT_ID="ce41b029-e7ce-4100-b3b3-c38272211b05"
APP_NAME="normaldance"
DOMAIN="normaldance.tk"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Cloud.ru CLI is installed
check_cli() {
    print_status "Checking Cloud.ru CLI..."
    if ! command -v cloud &> /dev/null; then
        print_warning "Cloud.ru CLI not found. Installing..."
        curl -sSL https://cloud.ru/cli/install.sh | bash
        export PATH="$PATH:$HOME/.cloud/bin"
    fi
    print_success "Cloud.ru CLI is ready"
}

# Configure Cloud.ru CLI
configure_cli() {
    print_status "Configuring Cloud.ru CLI..."
    cloud config set api-key $API_KEY
    cloud config set customer-id $CUSTOMER_ID
    cloud config set project-id $PROJECT_ID
    print_success "Cloud.ru CLI configured"
}

# Build Docker image
build_image() {
    print_status "Building Docker image..."
    docker build -f Dockerfile.cloud.ru -t $APP_NAME:latest .
    print_success "Docker image built"
}

# Push to Cloud.ru registry
push_image() {
    print_status "Pushing image to Cloud.ru registry..."
    docker tag $APP_NAME:latest cloud.ru/$APP_NAME:latest
    docker push cloud.ru/$APP_NAME:latest
    print_success "Image pushed to Cloud.ru registry"
}

# Create Cloud.ru services
create_services() {
    print_status "Creating Cloud.ru services..."
    
    # Create PostgreSQL database
    print_status "Creating PostgreSQL database..."
    cloud service create postgresql \
        --name normaldance-db \
        --version "15" \
        --cpu 0.5 \
        --memory 512Mi \
        --storage 10Gi \
        --backup-enabled \
        --backup-schedule "0 2 * * *"
    
    # Create Redis cache
    print_status "Creating Redis cache..."
    cloud service create redis \
        --name normaldance-redis \
        --version "7" \
        --cpu 0.25 \
        --memory 256Mi \
        --storage 1Gi
    
    # Create application
    print_status "Creating application..."
    cloud service create container \
        --name $APP_NAME \
        --image cloud.ru/$APP_NAME:latest \
        --cpu 1 \
        --memory 1Gi \
        --replicas 1 \
        --port 3000:3000 \
        --port 3001:3001 \
        --env NODE_ENV=production \
        --env DATABASE_URL="postgresql://user:pass@normaldance-db:5432/normaldance" \
        --env REDIS_URL="redis://normaldance-redis:6379" \
        --env NEXTAUTH_URL="https://$DOMAIN" \
        --env NEXTAUTH_SECRET="your_super_secret_key_change_me"
    
    print_success "Services created"
}

# Deploy application
deploy_app() {
    print_status "Deploying application..."
    cloud deploy $APP_NAME
    print_success "Application deployed"
}

# Setup custom domain
setup_domain() {
    print_status "Setting up custom domain..."
    cloud domain add $DOMAIN --service $APP_NAME
    print_success "Custom domain configured"
}

# Wait for deployment
wait_for_deployment() {
    print_status "Waiting for deployment to complete..."
    cloud status $APP_NAME --wait
    print_success "Deployment completed"
}

# Check application health
check_health() {
    print_status "Checking application health..."
    sleep 30
    if curl -f https://$DOMAIN/api/health; then
        print_success "Application is healthy"
    else
        print_warning "Application health check failed"
    fi
}

# Show deployment info
show_info() {
    print_success "Deployment completed!"
    echo ""
    echo "🌐 Application URL: https://$DOMAIN"
    echo "📊 Dashboard: https://partners.cloud.ru"
    echo "🔑 API Key: $API_KEY"
    echo "📝 Project ID: $PROJECT_ID"
    echo ""
    echo "Useful commands:"
    echo "  cloud status $APP_NAME          # Check status"
    echo "  cloud logs $APP_NAME           # View logs"
    echo "  cloud scale $APP_NAME --replicas 2  # Scale up"
    echo "  cloud stop $APP_NAME           # Stop service"
    echo "  cloud start $APP_NAME          # Start service"
}

# Main deployment flow
main() {
    print_status "Starting NORMALDANCE deployment to Cloud.ru..."
    echo ""
    
    check_cli
    configure_cli
    build_image
    push_image
    create_services
    deploy_app
    setup_domain
    wait_for_deployment
    check_health
    show_info
    
    print_success "🎉 NORMALDANCE successfully deployed to Cloud.ru!"
}

# Run main function
main "$@"
