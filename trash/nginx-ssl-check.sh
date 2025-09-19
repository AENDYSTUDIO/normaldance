#!/bin/bash

echo "=== ПРОВЕРКА NGINX И SSL КОНФИГУРАЦИИ ==="
echo "Дата: $(date)"
echo ""

# 1. Проверка конфигурации Nginx
echo "=== 1. Проверка конфигурации Nginx ==="
echo "Тест конфигурации:"
nginx -t
echo ""
echo "Статус Nginx:"
systemctl status nginx --no-pager
echo ""
echo "Конфигурационные файлы:"
echo "Основной конфиг:"
ls -la /etc/nginx/nginx.conf
echo ""
echo "Доступные сайты:"
ls -la /etc/nginx/sites-available/
echo ""
echo "Активные сайты:"
ls -la /etc/nginx/sites-enabled/
echo ""

# 2. Проверка конфигов доменов
echo "=== 2. Проверка конфигов доменов ==="
if [ -f "/etc/nginx/sites-available/dnb1st.ru.conf" ]; then
    echo "Конфиг dnb1st.ru.conf:"
    cat /etc/nginx/sites-available/dnb1st.ru.conf
    echo ""
else
    echo "Конфиг dnb1st.ru.conf не найден"
fi

if [ -f "/etc/nginx/sites-available/dnb1st.store.conf" ]; then
    echo "Конфиг dnb1st.store.conf:"
    cat /etc/nginx/sites-available/dnb1st.store.conf
    echo ""
else
    echo "Конфиг dnb1st.store.conf не найден"
fi
echo ""

# 3. Проверка SSL-сертификатов
echo "=== 3. Проверка SSL-сертификатов ==="
echo "Проверка сертификатов с помощью certbot:"
if command -v certbot &> /dev/null; then
    certbot certificates
    echo ""
else
    echo "Certbot не установлен"
fi
echo ""

# 4. Проверка SSL для доменов
echo "=== 4. Проверка SSL для доменов ==="
echo "dnb1st.ru:"
openssl s_client -connect dnb1st.ru:443 -servername dnb1st.ru < /dev/null 2>/dev/null | openssl x509 -noout -dates -issuer -subject
echo ""
echo "dnb1st.store:"
openssl s_client -connect dnb1st.store:443 -servername dnb1st.store < /dev/null 2>/dev/null | openssl x509 -noout -dates -issuer -subject
echo ""

# 5. Проверка логов Nginx
echo "=== 5. Проверка логов Nginx ==="
echo "Лоступ к логам:"
echo "Основной лог доступа:"
if [ -f "/var/log/nginx/access.log" ]; then
    tail -n 20 /var/log/nginx/access.log
else
    echo "Лог доступа не найден"
fi
echo ""
echo "Основной лог ошибок:"
if [ -f "/var/log/nginx/error.log" ]; then
    tail -n 20 /var/log/nginx/error.log
else
    echo "Лог ошибок не найден"
fi
echo ""

# 6. Проверка процессов Nginx
echo "=== 6. Проверка процессов Nginx ==="
ps aux | grep nginx
echo ""

echo "=== NGINX И SSL ПРОВЕРКА ЗАВЕРШЕНА ==="