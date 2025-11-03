#!/bin/bash

# 🐳 NormalDance Docker Startup Script
# This script helps you quickly start the application with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop."
        exit 1
    fi
    print_success "Docker found: $(docker --version)"
}

# Check if Docker daemon is running
check_docker_running() {
    if ! docker ps &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker daemon is running"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed."
        exit 1
    fi
    print_success "Docker Compose found: $(docker-compose --version)"
}

# Display menu
show_menu() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}🐳 NormalDance Docker Options${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""
    echo "1) Start dev environment (DB + Redis only)"
    echo "2) Start full Docker stack"
    echo "3) Stop all containers"
    echo "4) View logs"
    echo "5) Connect to PostgreSQL"
    echo "6) Connect to Redis"
    echo "7) Clean up (remove volumes)"
    echo "8) Exit"
    echo ""
    read -p "Choose an option (1-8): " choice
}

# Start dev environment
start_dev() {
    print_info "Starting development environment (PostgreSQL + Redis)..."
    docker-compose -f docker-compose-dev.yml up -d

    sleep 2

    print_success "Development environment started!"
    print_info "PostgreSQL: localhost:5432 (user: normaldance, password: password)"
    print_info "Redis: localhost:6379"
    print_info ""
    print_info "Now run: npm install && npm run dev"
}

# Start full stack
start_full() {
    print_warning "Building full Docker image. This may take 10-20 minutes..."
    print_info "Please ensure you have at least 8GB free disk space"

    read -p "Continue? (y/N): " confirm
    if [[ $confirm != "y" && $confirm != "Y" ]]; then
        print_info "Cancelled"
        return
    fi

    print_info "Building Docker image..."
    docker build -t normaldance:latest .

    print_success "Image built!"
    print_info "Starting full stack..."
    docker-compose up -d

    sleep 3

    print_success "Full stack started!"
    print_info "Application will be available at http://localhost:3000 (check logs for readiness)"
    print_info "PostgreSQL: localhost:5432"
    print_info "Redis: localhost:6379"
}

# Stop containers
stop_containers() {
    print_info "Stopping all containers..."
    docker-compose down
    print_success "All containers stopped"
}

# View logs
view_logs() {
    echo ""
    echo "1) All logs"
    echo "2) Application logs only"
    echo "3) PostgreSQL logs only"
    echo "4) Redis logs only"
    echo "5) Back to menu"
    read -p "Choose (1-5): " log_choice

    case $log_choice in
        1) docker-compose logs -f --tail=100 ;;
        2) docker-compose logs -f --tail=100 frontend ;;
        3) docker-compose logs -f --tail=100 postgres ;;
        4) docker-compose logs -f --tail=100 redis ;;
        5) return ;;
        *) print_error "Invalid option" ;;
    esac
}

# Connect to PostgreSQL
connect_postgres() {
    print_info "Connecting to PostgreSQL..."
    print_info "Default credentials - user: normaldance, password: password"
    print_info "Type \\q to exit"
    docker exec -it normaldance-postgres psql -U normaldance -d normaldance || \
    docker exec -it $(docker-compose ps -q postgres) psql -U normaldance -d normaldance
}

# Connect to Redis
connect_redis() {
    print_info "Connecting to Redis..."
    print_info "Type EXIT to exit"
    docker exec -it normaldance-redis redis-cli || \
    docker exec -it $(docker-compose ps -q redis) redis-cli
}

# Clean up
cleanup() {
    print_warning "This will remove all volumes and data!"
    read -p "Are you sure? (y/N): " confirm
    if [[ $confirm != "y" && $confirm != "Y" ]]; then
        print_info "Cancelled"
        return
    fi

    print_info "Cleaning up..."
    docker-compose down -v
    print_success "Cleanup complete"
}

# Main loop
main() {
    print_info "NormalDance Docker Setup"

    # Check prerequisites
    check_docker
    check_docker_running
    check_docker_compose

    while true; do
        show_menu

        case $choice in
            1) start_dev ;;
            2) start_full ;;
            3) stop_containers ;;
            4) view_logs ;;
            5) connect_postgres ;;
            6) connect_redis ;;
            7) cleanup ;;
            8)
                print_info "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 1-8."
                ;;
        esac

        read -p "Press Enter to continue..."
    done
}

# Run main function
main
