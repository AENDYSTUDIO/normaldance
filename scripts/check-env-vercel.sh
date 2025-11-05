#!/bin/bash

# check-env-vercel.sh
# Проверка наличия всех необходимых переменных окружения в Vercel

set -e

echo "🔍 Проверка переменных окружения в Vercel..."
echo ""

# Критически важные переменные
REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "NEXT_PUBLIC_SOLANA_RPC_URL"
  "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"
  "NEXT_PUBLIC_NDT_PROGRAM_ID"
  "NEXT_PUBLIC_NDT_MINT_ADDRESS"
  "PINATA_JWT"
  "JWT_SECRET"
)

# Рекомендуемые переменные
RECOMMENDED_VARS=(
  "UPSTASH_REDIS_REST_URL"
  "UPSTASH_REDIS_REST_TOKEN"
  "SENTRY_DSN"
  "NEXT_PUBLIC_SENTRY_DSN"
  "TELEGRAM_BOT_TOKEN"
  "OPENAI_API_KEY"
  "NEXT_PUBLIC_VERCEL_ANALYTICS_ID"
  "MIXPANEL_TOKEN"
)

# Опциональные переменные
OPTIONAL_VARS=(
  "SPOTIFY_CLIENT_ID"
  "SPOTIFY_CLIENT_SECRET"
  "APPLE_CLIENT_ID"
  "APPLE_CLIENT_SECRET"
  "LANGGRAPH_API_KEY"
  "AUDIO_PROCESSING_ENABLED"
)

# Проверка установки Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен!"
    echo "📦 Установите с помощью: npm install -g vercel"
    exit 1
fi

# Проверка авторизации
if ! vercel whoami &> /dev/null; then
    echo "🔐 Необходима авторизация в Vercel..."
    vercel login
fi

# Выбор окружения
echo "Выберите окружение для проверки:"
echo "1) production"
echo "2) preview"
echo "3) development"
read -p "Введите номер (1-3): " env_choice

case $env_choice in
    1)
        ENVIRONMENT="production"
        ;;
    2)
        ENVIRONMENT="preview"
        ;;
    3)
        ENVIRONMENT="development"
        ;;
    *)
        echo "❌ Неверный выбор!"
        exit 1
        ;;
esac

echo ""
echo "🔍 Проверка окружения: $ENVIRONMENT"
echo ""

# Получаем список переменных
vercel env pull .env.check --environment="$ENVIRONMENT" &> /dev/null

# Счетчики
REQUIRED_MISSING=0
RECOMMENDED_MISSING=0
OPTIONAL_MISSING=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔴 КРИТИЧЕСКИ ВАЖНЫЕ ПЕРЕМЕННЫЕ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for var in "${REQUIRED_VARS[@]}"; do
  if grep -q "^$var=" .env.check 2>/dev/null; then
    value=$(grep "^$var=" .env.check | cut -d'=' -f2-)
    if [[ -z "$value" || "$value" == "your-"* || "$value" == "YOUR_"* ]]; then
      echo "⚠️  $var - установлена, но имеет placeholder значение"
      ((REQUIRED_MISSING++))
    else
      echo "✅ $var"
    fi
  else
    echo "❌ $var - ОТСУТСТВУЕТ!"
    ((REQUIRED_MISSING++))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🟡 РЕКОМЕНДУЕМЫЕ ПЕРЕМЕННЫЕ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for var in "${RECOMMENDED_VARS[@]}"; do
  if grep -q "^$var=" .env.check 2>/dev/null; then
    value=$(grep "^$var=" .env.check | cut -d'=' -f2-)
    if [[ -z "$value" || "$value" == "your-"* || "$value" == "YOUR_"* ]]; then
      echo "⚠️  $var - установлена, но имеет placeholder значение"
      ((RECOMMENDED_MISSING++))
    else
      echo "✅ $var"
    fi
  else
    echo "⚠️  $var - отсутствует (рекомендуется)"
    ((RECOMMENDED_MISSING++))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🟢 ОПЦИОНАЛЬНЫЕ ПЕРЕМЕННЫЕ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for var in "${OPTIONAL_VARS[@]}"; do
  if grep -q "^$var=" .env.check 2>/dev/null; then
    echo "✅ $var"
  else
    echo "➖ $var - не установлена (опционально)"
    ((OPTIONAL_MISSING++))
  fi
done

# Удаляем временный файл
rm -f .env.check

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ИТОГИ ПРОВЕРКИ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Окружение: $ENVIRONMENT"
echo ""
echo "🔴 Критически важных переменных отсутствует: $REQUIRED_MISSING из ${#REQUIRED_VARS[@]}"
echo "🟡 Рекомендуемых переменных отсутствует: $RECOMMENDED_MISSING из ${#RECOMMENDED_VARS[@]}"
echo "🟢 Опциональных переменных отсутствует: $OPTIONAL_MISSING из ${#OPTIONAL_VARS[@]}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $REQUIRED_MISSING -eq 0 ]; then
    echo "✅ Все критически важные переменные настроены!"
    echo ""
    
    if [ $RECOMMENDED_MISSING -gt 0 ]; then
        echo "⚠️  Рекомендуется настроить отсутствующие переменные для полной функциональности:"
        echo ""
        for var in "${RECOMMENDED_VARS[@]}"; do
            vercel env pull .env.temp --environment="$ENVIRONMENT" &> /dev/null
            if ! grep -q "^$var=" .env.temp 2>/dev/null; then
                echo "   vercel env add $var $ENVIRONMENT"
            fi
            rm -f .env.temp
        done
    fi
    
    echo ""
    echo "🚀 Проект готов к деплою:"
    echo "   vercel --prod"
    exit 0
else
    echo "❌ Отсутствуют критически важные переменные!"
    echo ""
    echo "📝 Необходимо настроить следующие переменные:"
    echo ""
    
    for var in "${REQUIRED_VARS[@]}"; do
        vercel env pull .env.temp --environment="$ENVIRONMENT" &> /dev/null
        if ! grep -q "^$var=" .env.temp 2>/dev/null; then
            echo "   vercel env add $var $ENVIRONMENT"
        fi
        rm -f .env.temp
    done
    
    echo ""
    echo "Или используйте скрипт для массовой загрузки:"
    echo "   ./scripts/upload-env-to-vercel.sh"
    echo ""
    echo "📖 Подробная инструкция: VERCEL_ENV_SETUP.md"
    exit 1
fi
