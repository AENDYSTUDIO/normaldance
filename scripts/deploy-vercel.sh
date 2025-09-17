#!/bin/bash
# Скрипт быстрого развертывания NORMALDANCE на Vercel

set -e

echo "🚀 Быстрое развертывание NORMALDANCE на Vercel..."

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

# Check if Vercel CLI is installed
check_vercel_cli() {
    print_status "Проверка Vercel CLI..."
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI не найден. Устанавливаем..."
        npm install -g vercel
        print_success "Vercel CLI установлен"
    else
        print_success "Vercel CLI найден"
    fi
}

# Prepare project for Vercel
prepare_project() {
    print_status "Подготовка проекта для Vercel..."
    
    # Copy optimized vercel.json
    if [ -f "vercel.optimized.json" ]; then
        cp vercel.optimized.json vercel.json
        print_success "Обновлен vercel.json"
    fi
    
    # Copy Vercel-optimized server
    if [ -f "server.vercel.ts" ]; then
        cp server.vercel.ts server.ts
        print_success "Обновлен server.ts для Vercel"
    fi
    
    # Ensure .vercelignore exists
    if [ ! -f ".vercelignore" ]; then
        print_warning "Создаем .vercelignore"
        touch .vercelignore
    fi
    
    print_success "Проект подготовлен для Vercel"
}

# Login to Vercel
login_vercel() {
    print_status "Вход в Vercel..."
    vercel login
    print_success "Вход в Vercel выполнен"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Развертывание на Vercel..."
    
    # Deploy
    vercel --prod
    
    print_success "Развертывание завершено!"
}

# Setup environment variables
setup_env_vars() {
    print_status "Настройка переменных окружения..."
    
    echo ""
    echo "📋 Необходимые переменные окружения:"
    echo ""
    echo "1. DATABASE_URL - строка подключения к базе данных"
    echo "2. REDIS_URL - строка подключения к Redis"
    echo "3. NEXTAUTH_URL - URL вашего приложения"
    echo "4. NEXTAUTH_SECRET - секретный ключ"
    echo "5. PINATA_API_KEY - API ключ Pinata"
    echo "6. PINATA_SECRET_KEY - секретный ключ Pinata"
    echo "7. SOLANA_RPC_URL - URL Solana RPC"
    echo "8. NDT_PROGRAM_ID - ID программы NDT"
    echo "9. TRACKNFT_PROGRAM_ID - ID программы TrackNFT"
    echo "10. STAKING_PROGRAM_ID - ID программы Staking"
    echo ""
    echo "Для настройки переменных используйте:"
    echo "vercel env add VARIABLE_NAME"
    echo ""
    
    read -p "Хотите настроить переменные сейчас? (y/n): " setup_env
    
    if [ "$setup_env" = "y" ] || [ "$setup_env" = "Y" ]; then
        print_status "Настройка переменных окружения..."
        
        # Basic environment variables
        vercel env add NODE_ENV production
        vercel env add NEXT_TELEMETRY_DISABLED 1
        
        print_success "Базовые переменные настроены"
        print_warning "Не забудьте настроить остальные переменные в Vercel dashboard"
    fi
}

# Show deployment info
show_info() {
    print_success "🎉 NORMALDANCE развернут на Vercel!"
    echo ""
    echo "📊 Информация о развертывании:"
    echo "  🌐 Dashboard: https://vercel.com/dashboard"
    echo "  📝 Документация: https://vercel.com/docs"
    echo ""
    echo "🔧 Полезные команды:"
    echo "  vercel ls                    # Список проектов"
    echo "  vercel logs                  # Логи приложения"
    echo "  vercel env ls                # Список переменных"
    echo "  vercel env add VAR_NAME      # Добавить переменную"
    echo "  vercel --prod                # Деплой в продакшен"
    echo ""
    echo "📋 Следующие шаги:"
    echo "  1. Настройте переменные окружения"
    echo "  2. Подключите внешние сервисы (PlanetScale, Upstash)"
    echo "  3. Настройте Pusher для WebSocket"
    echo "  4. Протестируйте приложение"
    echo ""
    echo "⚠️ Ограничения Vercel:"
    echo "  - Нет встроенной базы данных"
    echo "  - Нет встроенного Redis"
    echo "  - Нет Socket.IO (используйте Pusher)"
    echo "  - Ограничение времени выполнения (10 сек)"
}

# Main function
main() {
    print_status "🚀 Начинаем развертывание NORMALDANCE на Vercel..."
    echo ""
    
    check_vercel_cli
    prepare_project
    login_vercel
    deploy_vercel
    setup_env_vars
    show_info
    
    print_success "🎉 Развертывание на Vercel завершено!"
}

# Run main function
main "$@"
