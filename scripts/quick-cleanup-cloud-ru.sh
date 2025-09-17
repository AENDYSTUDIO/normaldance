#!/bin/bash
# Быстрая очистка Cloud.ru (только основные ресурсы)

set -e

echo "🧹 Быстрая очистка Cloud.ru..."

# Configuration
API_KEY="7d6d24281a43e50068d35d63f7ead515"
CUSTOMER_ID="fd8aec7e-aeba-4626-be40-87d9520dc825"
PROJECT_ID="ce41b029-e7ce-4100-b3b3-c38272211b05"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configure CLI
configure_cli() {
    print_status "Настройка Cloud.ru CLI..."
    cloud config set api-key $API_KEY
    cloud config set customer-id $CUSTOMER_ID
    cloud config set project-id $PROJECT_ID
    print_success "CLI настроен"
}

# Quick cleanup
quick_cleanup() {
    print_status "🧹 Быстрая очистка основных ресурсов..."
    
    # Stop all services
    print_status "Остановка сервисов..."
    cloud service list --format json | jq -r '.[].name' | while read service; do
        if [ ! -z "$service" ]; then
            cloud service stop $service || true
        fi
    done
    
    # Delete all services
    print_status "Удаление сервисов..."
    cloud service list --format json | jq -r '.[].name' | while read service; do
        if [ ! -z "$service" ]; then
            cloud service delete $service --force || true
        fi
    done
    
    # Delete all VMs
    print_status "Удаление VM..."
    cloud vm list --format json | jq -r '.[].name' | while read vm; do
        if [ ! -z "$vm" ]; then
            cloud vm delete $vm --force || true
        fi
    done
    
    print_success "✅ Быстрая очистка завершена"
}

# Show status
show_status() {
    print_status "📊 Статус после очистки:"
    echo ""
    echo "Сервисы: $(cloud service list --format json | jq length)"
    echo "VM: $(cloud vm list --format json | jq length)"
    echo "Диски: $(cloud disk list --format json | jq length)"
    echo "Сети: $(cloud network list --format json | jq length)"
    echo ""
    print_success "🎉 Cloud.ru очищен и готов к настройке!"
}

# Main
main() {
    print_status "🚀 Начинаем быструю очистку Cloud.ru..."
    configure_cli
    quick_cleanup
    show_status
}

main "$@"
