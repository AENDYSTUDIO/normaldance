#!/bin/bash
# Полная очистка Cloud.ru и настройка с нуля для NORMALDANCE

set -e

echo "🧹 Полная очистка Cloud.ru и настройка с нуля..."

# Configuration
API_KEY="7d6d24281a43e50068d35d63f7ead515"
CUSTOMER_ID="fd8aec7e-aeba-4626-be40-87d9520dc825"
PROJECT_ID="ce41b029-e7ce-4100-b3b3-c38272211b05"

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
    print_status "Проверка Cloud.ru CLI..."
    if ! command -v cloud &> /dev/null; then
        print_warning "Cloud.ru CLI не найден. Устанавливаем..."
        curl -sSL https://cloud.ru/cli/install.sh | bash
        export PATH="$PATH:$HOME/.cloud/bin"
    fi
    print_success "Cloud.ru CLI готов"
}

# Configure Cloud.ru CLI
configure_cli() {
    print_status "Настройка Cloud.ru CLI..."
    cloud config set api-key $API_KEY
    cloud config set customer-id $CUSTOMER_ID
    cloud config set project-id $PROJECT_ID
    print_success "Cloud.ru CLI настроен"
}

# Полная очистка всех ресурсов
cleanup_all() {
    print_status "🧹 Начинаем полную очистку Cloud.ru..."
    
    # Остановка всех сервисов
    print_status "Остановка всех сервисов..."
    cloud service list --format json | jq -r '.[].name' | while read service; do
        if [ ! -z "$service" ]; then
            print_status "Остановка сервиса: $service"
            cloud service stop $service || true
        fi
    done
    
    # Удаление всех сервисов
    print_status "Удаление всех сервисов..."
    cloud service list --format json | jq -r '.[].name' | while read service; do
        if [ ! -z "$service" ]; then
            print_status "Удаление сервиса: $service"
            cloud service delete $service --force || true
        fi
    done
    
    # Удаление всех виртуальных машин
    print_status "Удаление всех виртуальных машин..."
    cloud vm list --format json | jq -r '.[].name' | while read vm; do
        if [ ! -z "$vm" ]; then
            print_status "Удаление VM: $vm"
            cloud vm delete $vm --force || true
        fi
    done
    
    # Удаление всех дисков
    print_status "Удаление всех дисков..."
    cloud disk list --format json | jq -r '.[].name' | while read disk; do
        if [ ! -z "$disk" ]; then
            print_status "Удаление диска: $disk"
            cloud disk delete $disk --force || true
        fi
    done
    
    # Удаление всех сетей
    print_status "Удаление всех сетей..."
    cloud network list --format json | jq -r '.[].name' | while read network; do
        if [ ! -z "$network" ]; then
            print_status "Удаление сети: $network"
            cloud network delete $network --force || true
        fi
    done
    
    # Удаление всех образов
    print_status "Удаление всех образов..."
    cloud image list --format json | jq -r '.[].name' | while read image; do
        if [ ! -z "$image" ]; then
            print_status "Удаление образа: $image"
            cloud image delete $image --force || true
        fi
    done
    
    # Удаление всех проектов (кроме текущего)
    print_status "Удаление всех проектов..."
    cloud project list --format json | jq -r '.[].id' | while read project; do
        if [ ! -z "$project" ] && [ "$project" != "$PROJECT_ID" ]; then
            print_status "Удаление проекта: $project"
            cloud project delete $project --force || true
        fi
    done
    
    print_success "✅ Полная очистка завершена"
}

# Проверка очистки
verify_cleanup() {
    print_status "🔍 Проверка очистки..."
    
    # Проверяем сервисы
    services=$(cloud service list --format json | jq length)
    if [ "$services" -eq 0 ]; then
        print_success "✅ Все сервисы удалены"
    else
        print_warning "⚠️ Осталось сервисов: $services"
    fi
    
    # Проверяем VM
    vms=$(cloud vm list --format json | jq length)
    if [ "$vms" -eq 0 ]; then
        print_success "✅ Все VM удалены"
    else
        print_warning "⚠️ Осталось VM: $vms"
    fi
    
    # Проверяем диски
    disks=$(cloud disk list --format json | jq length)
    if [ "$disks" -eq 0 ]; then
        print_success "✅ Все диски удалены"
    else
        print_warning "⚠️ Осталось дисков: $disks"
    fi
    
    # Проверяем сети
    networks=$(cloud network list --format json | jq length)
    if [ "$networks" -eq 0 ]; then
        print_success "✅ Все сети удалены"
    else
        print_warning "⚠️ Осталось сетей: $networks"
    fi
}

# Создание нового проекта с нуля
create_new_project() {
    print_status "🚀 Создание нового проекта NORMALDANCE..."
    
    # Создаем новый проект
    cloud project create --name "NORMALDANCE" --description "Web3 Music Platform"
    
    # Устанавливаем новый проект как активный
    NEW_PROJECT_ID=$(cloud project list --format json | jq -r '.[] | select(.name=="NORMALDANCE") | .id')
    cloud config set project-id $NEW_PROJECT_ID
    
    print_success "✅ Новый проект создан: $NEW_PROJECT_ID"
}

# Настройка базовой инфраструктуры
setup_infrastructure() {
    print_status "🏗️ Настройка базовой инфраструктуры..."
    
    # Создаем сеть
    print_status "Создание сети..."
    cloud network create --name "normaldance-network" --cidr "10.0.0.0/16"
    
    # Создаем подсеть
    print_status "Создание подсети..."
    cloud subnet create --name "normaldance-subnet" --network "normaldance-network" --cidr "10.0.1.0/24"
    
    # Создаем группу безопасности
    print_status "Создание группы безопасности..."
    cloud security-group create --name "normaldance-sg" --description "Security group for NORMALDANCE"
    
    # Добавляем правила безопасности
    print_status "Добавление правил безопасности..."
    cloud security-group-rule create --security-group "normaldance-sg" --direction ingress --protocol tcp --port 22 --cidr "0.0.0.0/0"
    cloud security-group-rule create --security-group "normaldance-sg" --direction ingress --protocol tcp --port 80 --cidr "0.0.0.0/0"
    cloud security-group-rule create --security-group "normaldance-sg" --direction ingress --protocol tcp --port 443 --cidr "0.0.0.0/0"
    cloud security-group-rule create --security-group "normaldance-sg" --direction ingress --protocol tcp --port 3000 --cidr "0.0.0.0/0"
    cloud security-group-rule create --security-group "normaldance-sg" --direction ingress --protocol tcp --port 3001 --cidr "0.0.0.0/0"
    
    print_success "✅ Базовая инфраструктура настроена"
}

# Создание сервисов NORMALDANCE
create_services() {
    print_status "🎵 Создание сервисов NORMALDANCE..."
    
    # Создаем PostgreSQL
    print_status "Создание PostgreSQL..."
    cloud service create postgresql \
        --name "normaldance-db" \
        --version "15" \
        --cpu 0.5 \
        --memory 512Mi \
        --storage 10Gi \
        --network "normaldance-network" \
        --security-group "normaldance-sg" \
        --backup-enabled \
        --backup-schedule "0 2 * * *"
    
    # Создаем Redis
    print_status "Создание Redis..."
    cloud service create redis \
        --name "normaldance-redis" \
        --version "7" \
        --cpu 0.25 \
        --memory 256Mi \
        --storage 1Gi \
        --network "normaldance-network" \
        --security-group "normaldance-sg"
    
    # Создаем приложение
    print_status "Создание приложения..."
    cloud service create container \
        --name "normaldance-app" \
        --image "node:20-alpine" \
        --cpu 1 \
        --memory 1Gi \
        --replicas 1 \
        --network "normaldance-network" \
        --security-group "normaldance-sg" \
        --port 3000:3000 \
        --port 3001:3001 \
        --env NODE_ENV=production \
        --env DATABASE_URL="postgresql://user:pass@normaldance-db:5432/normaldance" \
        --env REDIS_URL="redis://normaldance-redis:6379" \
        --env NEXTAUTH_URL="https://normaldance.tk" \
        --env NEXTAUTH_SECRET="your_super_secret_key_change_me"
    
    print_success "✅ Сервисы NORMALDANCE созданы"
}

# Показать итоговую информацию
show_final_info() {
    print_success "🎉 Настройка Cloud.ru завершена!"
    echo ""
    echo "📊 Информация о проекте:"
    echo "  🌐 Dashboard: https://partners.cloud.ru"
    echo "  🔑 API Key: $API_KEY"
    echo "  📝 Project ID: $(cloud config get project-id)"
    echo ""
    echo "🏗️ Созданная инфраструктура:"
    echo "  🌐 Сеть: normaldance-network"
    echo "  🔒 Группа безопасности: normaldance-sg"
    echo "  🗄️ База данных: normaldance-db"
    echo "  🔴 Redis: normaldance-redis"
    echo "  🎵 Приложение: normaldance-app"
    echo ""
    echo "📋 Следующие шаги:"
    echo "  1. Зарегистрировать домен на Freenom"
    echo "  2. Настроить DNS записи"
    echo "  3. Развернуть код приложения"
    echo "  4. Настроить SSL сертификаты"
    echo ""
    echo "🔧 Полезные команды:"
    echo "  cloud service list          # Список сервисов"
    echo "  cloud service status        # Статус сервисов"
    echo "  cloud logs normaldance-app  # Логи приложения"
    echo "  cloud service scale normaldance-app --replicas 2  # Масштабирование"
}

# Подтверждение очистки
confirm_cleanup() {
    print_warning "⚠️ ВНИМАНИЕ: Это удалит ВСЕ ресурсы в Cloud.ru!"
    print_warning "⚠️ Это действие НЕОБРАТИМО!"
    echo ""
    read -p "Вы уверены, что хотите продолжить? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_error "Операция отменена пользователем"
        exit 1
    fi
}

# Main function
main() {
    print_status "🚀 Начинаем полную очистку и настройку Cloud.ru с нуля..."
    echo ""
    
    confirm_cleanup
    check_cli
    configure_cli
    cleanup_all
    verify_cleanup
    create_new_project
    setup_infrastructure
    create_services
    show_final_info
    
    print_success "🎉 Cloud.ru полностью очищен и настроен с нуля!"
}

# Run main function
main "$@"
