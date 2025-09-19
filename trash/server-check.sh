#!/bin/bash

echo "=== ПРОВЕРКА СОСТОЯНИЯ СЕРВЕРА ==="
echo "Дата: $(date)"
echo "Сервер: $(hostname -I)"
echo

echo "=== 1. СИСТЕМНАЯ ИНФОРМАЦИЯ ==="
echo "Операционная система:"
cat /etc/os-release | head -5
echo
echo "Время работы системы:"
uptime
echo

echo "=== 2. РЕСУРСЫ СИСТЕМЫ ==="
echo "Память:"
free -h
echo
echo "Дисковое пространство:"
df -h
echo
echo "Загрузка процессора:"
top -bn1 | grep "Cpu(s)" | head -1
echo

echo "=== 3. ПРОЦЕССЫ ==="
echo "Все процессы:"
ps aux --sort=-%cpu | head -20
echo

echo "=== 4. DOCKER ==="
echo "Версия Docker:"
docker --version 2>/dev/null || echo "Docker не установлен"
echo
echo "Версия Docker Compose:"
docker-compose --version 2>/dev/null || echo "Docker Compose не установлен"
echo
echo "Запущенные контейнеры:"
docker ps 2>/dev/null || echo "Docker недоступен"
echo

echo "=== 5. СЕРВИСЫ ==="
echo "Статус основных сервисов:"
for service in nginx postgresql redis-server mysql apache2; do
    systemctl is-active $service 2>/dev/null && echo "$service: активен" || echo "$service: неактивен/не установлен"
done
echo

echo "=== 6. СЕТЕВЫЕ ПОРТЫ ==="
echo "Открытые порты:"
ss -tlnp | grep -E ':(80|443|22|3000|5432|6379|3306)'
echo

echo "=== 7. ДИРЕКТОРИИ ==="
echo "Содержимое /var/www/:"
ls -la /var/www/ 2>/dev/null || echo "Директория /var/www/ недоступна"
echo
echo "Содержимое /home/aendy/:"
ls -la /home/aendy/ 2>/dev/null || echo "Директория /home/aendy/ недоступна"
echo

echo "=== 8. NGINX КОНФИГУРАЦИЯ ==="
echo "Конфигурационные файлы nginx:"
ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "Nginx конфиги недоступны"
echo
echo "Проверка синтаксиса nginx:"
nginx -t 2>/dev/null || echo "Nginx недоступен или ошибка конфигурации"
echo

echo "=== 9. DNS ПРОВЕРКА ==="
echo "Проверка DNS для dnb1st.ru:"
dig +short dnb1st.ru A 2>/dev/null || nslookup dnb1st.ru 2>/dev/null || echo "DNS проверка недоступна"
echo
echo "Проверка DNS для dnb1st.store:"
dig +short dnb1st.store A 2>/dev/null || nslookup dnb1st.store 2>/dev/null || echo "DNS проверка недоступна"
echo
echo "Проверка DNS для www.dnb1st.ru:"
dig +short www.dnb1st.ru A 2>/dev/null || nslookup www.dnb1st.ru 2>/dev/null || echo "DNS проверка недоступна"
echo

echo "=== ПРОВЕРКА ЗАВЕРШЕНА ==="