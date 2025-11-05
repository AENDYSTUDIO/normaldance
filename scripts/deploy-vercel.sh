#!/bin/bash

# deploy-vercel.sh
# Быстрый деплой на Vercel с предварительными проверками

set -e

echo "🚀 NORMALDANCE Vercel Deployment Script v0.5.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI не установлен!${NC}"
    echo "📦 Установите: npm install -g vercel"
    exit 1
fi

# Проверка авторизации
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}🔐 Необходима авторизация в Vercel...${NC}"
    vercel login
fi

# Выбор типа деплоя
echo "Выберите тип деплоя:"
echo "1) Preview (тестовый деплой для проверки)"
echo "2) Production (боевой деплой)"
echo "3) Quick Check (только проверка без деплоя)"
read -p "Введите номер (1-3): " deploy_choice

case $deploy_choice in
    1)
        DEPLOY_TYPE="preview"
        IS_PRODUCTION=false
        ;;
    2)
        DEPLOY_TYPE="production"
        IS_PRODUCTION=true
        ;;
    3)
        DEPLOY_TYPE="check"
        IS_PRODUCTION=false
        ;;
    *)
        echo -e "${RED}❌ Неверный выбор!${NC}"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 ШАГ 1: Проверка переменных окружения"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "./scripts/check-env-vercel.sh" ]; then
    echo "Запуск проверки переменных окружения..."
    
    if [ "$IS_PRODUCTION" = true ]; then
        echo "1" | bash ./scripts/check-env-vercel.sh || {
            echo -e "${RED}❌ Не все критические переменные настроены!${NC}"
            echo "Настройте переменные с помощью: ./scripts/upload-env-to-vercel.sh"
            exit 1
        }
    else
        echo "⏭️  Пропуск проверки для preview деплоя"
    fi
else
    echo -e "${YELLOW}⚠️  Скрипт проверки не найден, продолжаем...${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 ШАГ 2: Проверка кода"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Проверка git статуса
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  У вас есть несохраненные изменения${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Продолжить деплой? (y/n): " continue_choice
    if [ "$continue_choice" != "y" ]; then
        echo "Деплой отменен"
        exit 0
    fi
fi

# TypeScript проверка
echo "📝 Проверка TypeScript..."
if npm run type-check; then
    echo -e "${GREEN}✅ TypeScript проверка пройдена${NC}"
else
    echo -e "${RED}❌ Ошибки TypeScript${NC}"
    read -p "Продолжить несмотря на ошибки? (y/n): " continue_ts
    if [ "$continue_ts" != "y" ]; then
        exit 1
    fi
fi

# Линтинг (опционально, не останавливаем деплой)
echo "🔍 Запуск линтера..."
if npm run lint; then
    echo -e "${GREEN}✅ Линтинг пройден${NC}"
else
    echo -e "${YELLOW}⚠️  Есть предупреждения линтера, но продолжаем...${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 ШАГ 3: Тестирование (быстрые тесты)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$IS_PRODUCTION" = true ]; then
    echo "🧪 Запуск unit-тестов..."
    if npm run test:unit -- --maxWorkers=2 --bail; then
        echo -e "${GREEN}✅ Unit-тесты пройдены${NC}"
    else
        echo -e "${RED}❌ Unit-тесты провалены${NC}"
        read -p "Продолжить деплой в production? (y/n): " continue_tests
        if [ "$continue_tests" != "y" ]; then
            exit 1
        fi
    fi
else
    echo "⏭️  Пропуск тестов для preview деплоя"
fi

# Если это только проверка, выходим
if [ "$DEPLOY_TYPE" = "check" ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Все проверки пройдены!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Проект готов к деплою:"
    echo "  Preview: ./scripts/deploy-vercel.sh (выбрать 1)"
    echo "  Production: ./scripts/deploy-vercel.sh (выбрать 2)"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 ШАГ 4: Сборка проекта"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🔨 Локальная сборка для проверки..."
if npm run build; then
    echo -e "${GREEN}✅ Сборка успешна${NC}"
else
    echo -e "${RED}❌ Ошибка сборки${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 ШАГ 5: Деплой на Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$IS_PRODUCTION" = true ]; then
    echo -e "${YELLOW}⚠️  ВНИМАНИЕ: Запускается production деплой!${NC}"
    echo ""
    echo "Это повлияет на живой сайт!"
    read -p "Вы уверены? Введите 'DEPLOY' для подтверждения: " confirm
    
    if [ "$confirm" != "DEPLOY" ]; then
        echo "Деплой отменен"
        exit 0
    fi
    
    echo ""
    echo "🚀 Запуск production деплоя..."
    vercel --prod
else
    echo "🔄 Запуск preview деплоя..."
    vercel
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ШАГ 6: Верификация деплоя"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Получаем URL деплоя
if [ "$IS_PRODUCTION" = true ]; then
    DEPLOY_URL=$(vercel inspect --token "$VERCEL_TOKEN" 2>/dev/null | grep "URL:" | awk '{print $2}' || echo "https://normaldance.vercel.app")
else
    DEPLOY_URL=$(vercel inspect 2>/dev/null | grep "URL:" | awk '{print $2}' || echo "Check Vercel dashboard")
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Деплой успешно завершен!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📍 URL деплоя: $DEPLOY_URL"
echo ""

if [ "$IS_PRODUCTION" = true ]; then
    echo "✅ Production деплой активен"
    echo ""
    echo "Проверьте следующие эндпоинты:"
    echo "  • Главная: $DEPLOY_URL/"
    echo "  • API Health: $DEPLOY_URL/api/health"
    echo "  • Wallet: $DEPLOY_URL/wallet"
    echo "  • GRAVE: $DEPLOY_URL/grave"
    echo ""
    echo "📊 Мониторинг:"
    echo "  • Vercel Dashboard: https://vercel.com/dashboard"
    echo "  • Analytics: $DEPLOY_URL/_vercel/insights"
    echo "  • Logs: vercel logs"
else
    echo "🔄 Preview деплой активен"
    echo ""
    echo "Протестируйте изменения по ссылке выше"
    echo "Если все работает, запустите production деплой:"
    echo "  ./scripts/deploy-vercel.sh (выбрать 2)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Опционально: открыть в браузере
read -p "Открыть деплой в браузере? (y/n): " open_browser
if [ "$open_browser" = "y" ]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "$DEPLOY_URL"
    elif command -v open &> /dev/null; then
        open "$DEPLOY_URL"
    elif command -v start &> /dev/null; then
        start "$DEPLOY_URL"
    else
        echo "Скопируйте URL вручную: $DEPLOY_URL"
    fi
fi

echo ""
echo "💡 Полезные команды:"
echo "  • Просмотр логов: vercel logs"
echo "  • Список деплоев: vercel ls"
echo "  • Удалить preview: vercel remove [deployment-url]"
echo "  • Откат деплоя: vercel rollback"
echo ""

exit 0
