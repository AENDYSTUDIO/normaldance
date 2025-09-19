#!/bin/bash
# Скрипт диагностики SSH проблем

TARGET_SERVER="176.108.246.49"
TARGET_USER="aendy"

echo "🔍 Диагностика SSH подключения"
echo "==============================="

echo "1. Проверка доступности сервера..."
if ping -c 3 $TARGET_SERVER > /dev/null 2>&1; then
    echo "✅ Сервер $TARGET_SERVER доступен"
else
    echo "❌ Сервер $TARGET_SERVER недоступен"
fi

echo ""
echo "2. Проверка SSH порта..."
if nc -z $TARGET_SERVER 22 2>/dev/null; then
    echo "✅ SSH порт 22 открыт"
else
    echo "❌ SSH порт 22 закрыт или недоступен"
fi

echo ""
echo "3. Список доступных SSH ключей:"
ls -la ~/.ssh/*.pub 2>/dev/null || echo "❌ Публичные ключи не найдены"

echo ""
echo "4. SSH конфигурация:"
if [ -f ~/.ssh/config ]; then
    echo "✅ SSH config найден:"
    grep -A 5 -B 1 "$TARGET_SERVER\|normaldance" ~/.ssh/config || echo "❌ Конфигурация для сервера не найдена"
else
    echo "❌ SSH config не найден"
fi

echo ""
echo "5. Тест SSH подключения с отладкой:"
echo "ssh -vvv -o ConnectTimeout=10 $TARGET_USER@$TARGET_SERVER"

echo ""
echo "6. Возможные решения:"
echo "   - Добавить публичный ключ на сервер"
echo "   - Проверить права доступа к файлам SSH"
echo "   - Использовать пароль: ssh -o PreferredAuthentications=password $TARGET_USER@$TARGET_SERVER"
echo "   - Обратиться к администратору сервера"