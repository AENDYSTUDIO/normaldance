#!/bin/bash

# upload-env-to-vercel.sh
# Автоматическая загрузка переменных окружения в Vercel

set -e

echo "🚀 Загрузка переменных окружения в Vercel..."
echo ""

# Проверка наличия .env.vercel файла
if [ ! -f ".env.vercel" ]; then
    echo "❌ Файл .env.vercel не найден!"
    echo "📝 Создайте файл .env.vercel на основе .env.production.example"
    echo ""
    echo "Пример команды:"
    echo "cp .env.production.example .env.vercel"
    echo "# Затем отредактируйте .env.vercel и добавьте реальные значения"
    exit 1
fi

# Проверка установки Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен!"
    echo "📦 Установите с помощью: npm install -g vercel"
    exit 1
fi

# Проверка авторизации в Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Необходима авторизация в Vercel..."
    vercel login
fi

# Выбор окружения
echo "Выберите окружение для загрузки переменных:"
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
echo "📤 Загрузка переменных в окружение: $ENVIRONMENT"
echo ""

# Счетчики
SUCCESS_COUNT=0
ERROR_COUNT=0
SKIP_COUNT=0

# Чтение и загрузка переменных
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Пропускаем пустые строки и комментарии
    if [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]]; then
        continue
    fi
    
    # Удаляем пробелы в начале и конце ключа
    key=$(echo "$key" | xargs)
    
    # Удаляем кавычки из значения
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    
    # Пропускаем placeholder значения
    if [[ "$value" == "your-"* || "$value" == "YOUR_"* ]]; then
        echo "⏭️  Пропуск $key (placeholder значение)"
        ((SKIP_COUNT++))
        continue
    fi
    
    # Пропускаем пустые значения
    if [[ -z "$value" ]]; then
        echo "⏭️  Пропуск $key (пустое значение)"
        ((SKIP_COUNT++))
        continue
    fi
    
    echo -n "📝 Настройка $key... "
    
    # Проверяем, существует ли уже переменная
    if vercel env ls "$ENVIRONMENT" 2>/dev/null | grep -q "^$key"; then
        echo "⚠️  Уже существует (пропуск)"
        ((SKIP_COUNT++))
        continue
    fi
    
    # Добавляем переменную в Vercel
    if echo "$value" | vercel env add "$key" "$ENVIRONMENT" --yes &> /dev/null; then
        echo "✅"
        ((SUCCESS_COUNT++))
    else
        echo "❌ Ошибка"
        ((ERROR_COUNT++))
    fi
    
    # Небольшая задержка для избежания rate limiting
    sleep 0.5
    
done < .env.vercel

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Результаты загрузки:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Успешно добавлено: $SUCCESS_COUNT"
echo "⏭️  Пропущено: $SKIP_COUNT"
echo "❌ Ошибок: $ERROR_COUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERROR_COUNT -eq 0 ]; then
    echo "🎉 Все переменные успешно загружены в окружение $ENVIRONMENT!"
    echo ""
    echo "Следующие шаги:"
    echo "1. Проверьте переменные: vercel env ls $ENVIRONMENT"
    echo "2. Выполните деплой: vercel --prod"
else
    echo "⚠️  Некоторые переменные не были загружены."
    echo "Пожалуйста, добавьте их вручную с помощью:"
    echo "vercel env add VARIABLE_NAME $ENVIRONMENT"
fi

# Показываем список всех установленных переменных
echo ""
echo "📋 Текущие переменные в окружении $ENVIRONMENT:"
vercel env ls "$ENVIRONMENT"
