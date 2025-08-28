#!/bin/bash

# NormalDance Deployment Script
# This script automates the deployment of NormalDance to Kubernetes

set -e

# Configuration
NAMESPACE="production"
CLUSTER_NAME="normaldance-prod"
REGION="us-east-1"
HELM_RELEASE="normaldance-prod"
GITHUB_REPO="normaldance/normaldance"
DOCKER_REGISTRY="ghcr.io"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed"
    fi
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        error "helm is not installed"
    fi
    
    # Check if aws-cli is installed
    if ! command -v aws &> /dev/null; then
        error "aws-cli is not installed"
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        error "docker is not installed"
    fi
    
    log "All prerequisites are installed"
}

# Configure AWS credentials
configure_aws() {
    log "Configuring AWS credentials..."
    
    # Check if AWS credentials are set
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        error "AWS credentials not set. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables"
    fi
    
    # Configure AWS CLI
    aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
    aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
    aws configure set region $REGION
    
    log "AWS credentials configured"
}

# Connect to Kubernetes cluster
connect_to_cluster() {
    log "Connecting to Kubernetes cluster..."
    
    # Get cluster credentials
    aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION
    
    # Verify connection
    if ! kubectl cluster-info &> /dev/null; then
        error "Failed to connect to Kubernetes cluster"
    fi
    
    log "Connected to Kubernetes cluster"
}

# Build and push Docker images
build_and_push_images() {
    log "Building and pushing Docker images..."
    
    # Get current git commit
    GIT_COMMIT=$(git rev-parse HEAD)
    
    # Build web image
    log "Building web image..."
    docker build -t $DOCKER_REGISTRY/$GITHUB_REPO:$GIT_COMMIT .
    docker push $DOCKER_REGISTRY/$GITHUB_REPO:$GIT_COMMIT
    
    # Build API image
    log "Building API image..."
    docker build -t $DOCKER_REGISTRY/$GITHUB_REPO-api:$GIT_COMMIT -f Dockerfile.api .
    docker push $DOCKER_REGISTRY/$GITHUB_REPO-api:$GIT_COMMIT
    
    # Build WebSocket image
    log "Building WebSocket image..."
    docker build -t $DOCKER_REGISTRY/$GITHUB_REPO-websocket:$GIT_COMMIT -f Dockerfile.websocket .
    docker push $DOCKER_REGISTRY/$GITHUB_REPO-websocket:$GIT_COMMIT
    
    log "Docker images built and pushed"
}

# Deploy to Kubernetes
deploy_to_kubernetes() {
    log "Deploying to Kubernetes..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Update Helm values
    helm upgrade --install $HELM_RELEASE ./helm/normaldance \
        --namespace $NAMESPACE \
        --set image.tag=$GIT_COMMIT \
        --set image.tag-api=$GIT_COMMIT \
        --set image.tag-websocket=$GIT_COMMIT \
        --set env.NODE_ENV=production \
        --set env.DATABASE_URL="${DATABASE_URL}" \
        --set env.REDIS_URL="${REDIS_URL}" \
        --set env.SOLANA_RPC_URL="${SOLANA_RPC_URL}" \
        --set env.NEXTAUTH_URL="${NEXTAUTH_URL}" \
        --set env.NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
        --set env.STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}" \
        --set env.STRIPE_PUBLISHABLE_KEY="${STRIPE_PUBLISHABLE_KEY}" \
        --set env.SENDGRID_API_KEY="${SENDGRID_API_KEY}" \
        --set env.GOOGLE_ANALYTICS_ID="${GOOGLE_ANALYTICS_ID}" \
        --set env.MIXPROJECT_TOKEN="${MIXPROJECT_TOKEN}" \
        --set env.FIREBASE_SERVICE_ACCOUNT="${FIREBASE_SERVICE_ACCOUNT}" \
        --set env.CLOUDFLARE_API_KEY="${CLOUDFLARE_API_KEY}" \
        --set env.CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID}" \
        --set env.AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}" \
        --set env.AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}" \
        --set env.AWS_REGION="${AWS_REGION}" \
        --set env.AWS_S3_BUCKET="${AWS_S3_BUCKET}" \
        --set env.IPFS_GATEWAY="${IPFS_GATEWAY}" \
        --set env.FILECOIN_NETWORK="${FILECOIN_NETWORK}" \
        --set env.FILECOIN_API_URL="${FILECOIN_API_URL}" \
        --set env.FILECOIN_API_KEY="${FILECOIN_API_KEY}" \
        --wait \
        --timeout=600s
    
    log "Deployment completed"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for the API pod to be ready
    kubectl wait --for=condition=ready pod -l app=normaldance-api -n $NAMESPACE --timeout=300s
    
    # Run migrations
    kubectl exec -it deployment/$HELM_RELEASE-api -n $NAMESPACE -- npm run db:migrate
    
    log "Database migrations completed"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check pod status
    kubectl get pods -n $NAMESPACE
    
    # Check service status
    kubectl get services -n $NAMESPACE
    
    # Check ingress status
    kubectl get ingress -n $NAMESPACE
    
    # Check health endpoint
    HEALTH_URL=$(kubectl get ingress $HELM_RELEASE -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}')
    if curl -s -o /dev/null -w "%{http_code}" http://$HEALTH_URL/api/health | grep -q "200"; then
        log "Health check passed"
    else
        error "Health check failed"
    fi
    
    log "Deployment verified"
}

# Send notification
send_notification() {
    log "Sending deployment notification..."
    
    # Send Slack notification
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 NormalDance deployment completed successfully!\n\nRepository: $GITHUB_REPO\nCommit: $GIT_COMMIT\nEnvironment: $NAMESPACE\nCluster: $CLUSTER_NAME\nRegion: $REGION\"}" \
            $SLACK_WEBHOOK
    fi
    
    log "Notification sent"
}

# Main deployment function
main() {
    log "Starting NormalDance deployment..."
    
    # Check prerequisites
    check_prerequisites
    
    # Configure AWS
    configure_aws
    
    # Connect to cluster
    connect_to_cluster
    
    # Build and push images
    build_and_push_images
    
    # Deploy to Kubernetes
    deploy_to_kubernetes
    
    # Run migrations
    run_migrations
    
    # Verify deployment
    verify_deployment
    
    # Send notification
    send_notification
    
    log "Deployment completed successfully!"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --cluster)
            CLUSTER_NAME="$2"
            shift 2
            ;;
        --region)
            REGION="$2"
            shift 2
            ;;
        --release)
            HELM_RELEASE="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-migrations)
            SKIP_MIGRATIONS=true
            shift
            ;;
        --skip-verify)
            SKIP_VERIFY=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --namespace NAMESPACE     Kubernetes namespace (default: production)"
            echo "  --cluster CLUSTER_NAME    EKS cluster name (default: normaldance-prod)"
            echo "  --region REGION           AWS region (default: us-east-1)"
            echo "  --release HELM_RELEASE   Helm release name (default: normaldance-prod)"
            echo "  --skip-build             Skip building Docker images"
            echo "  --skip-migrations        Skip database migrations"
            echo "  --skip-verify            Skip deployment verification"
            echo "  --help                   Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Run main function
main "$@"