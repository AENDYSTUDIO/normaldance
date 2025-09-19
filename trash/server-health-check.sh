#!/bin/bash

echo "=== КОМПЛЕКСНАЯ ПРОВЕРКА СЕРВЕРА DNB1ST ==="
echo "Сервер: 176.108.246.49"
echo "Дата: $(date)"
echo ""

# 1. Проверка состояния сервера
echo "=== 1. Проверка состояния сервера ==="
echo "Uptime:"
uptime
echo ""
echo "CPU Load:"
top -bn1 | grep "Cpu(s)"
echo ""
echo "Memory Usage:"
free -h
echo ""
echo "Disk Space:"
df -h
echo ""
echo "Service Status:"
systemctl status nginx docker ssh --no-pager
echo ""

# 2. Анализ Docker-контейнеров
echo "=== 2. Анализ Docker-контейнеров ==="
echo "Docker Status:"
systemctl status docker --no-pager
echo ""
echo "Active Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "All Containers:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Docker Disk Usage:"
docker system df
echo ""

# 3. Проверка DNS-записей
echo "=== 3. Проверка DNS-записей ==="
echo "A-запись dnb1st.ru:"
nslookup dnb1st.ru
echo ""
echo "A-запись dnb1st.store:"
nslookup dnb1st.store
echo ""
echo "Проверка TTL:"
dig +short dnb1st.ru A +time=2
dig +short dnb1st.store A +time=2
echo ""

# 4. Проверка Nginx и SSL
echo "=== 4. Проверка Nginx и SSL ==="
echo "Nginx Configuration Test:"
nginx -t
echo ""
echo "Active Nginx Sites:"
ls -la /etc/nginx/sites-enabled/
echo ""
echo "Nginx Processes:"
ps aux | grep nginx
echo ""
echo "SSL Сертификаты:"
echo "dnb1st.ru:"
openssl s_client -connect dnb1st.ru:443 -servername dnb1st.ru < /dev/null 2>/dev/null | openssl x509 -noout -dates
echo ""
echo "dnb1st.store:"
openssl s_client -connect dnb1st.store:443 -servername dnb1st.store < /dev/null 2>/dev/null | openssl x509 -noout -dates
echo ""

# 5. Проверка доступности сервисов
echo "=== 5. Проверка доступности сервисов ==="
echo "Port Scan:"
echo "Port 80 (HTTP):"
nc -zv 176.108.246.49 80 2>&1 || echo "Connection failed"
echo ""
echo "Port 443 (HTTPS):"
nc -zv 176.108.246.49 443 2>&1 || echo "Connection failed"
echo ""
echo "Port 8080:"
nc -zv 176.108.246.49 8080 2>&1 || echo "Connection failed"
echo ""
echo "Port 3001:"
nc -zv 176.108.246.49 3001 2>&1 || echo "Connection failed"
echo ""
echo "HTTP Response dnb1st.ru:"
curl -I http://dnb1st.ru
echo ""
echo "HTTPS Response dnb1st.ru:"
curl -I https://dnb1st.ru
echo ""
echo "HTTP Response dnb1st.store:"
curl -I http://dnb1st.store
echo ""
echo "HTTPS Response dnb1st.store:"
curl -I https://dnb1st.store
echo ""

# 6. Проверка безопасности
echo "=== 6. Проверка безопасности ==="
echo "Firewall Status:"
ufw status verbose
echo ""
echo "Fail2Ban Status:"
systemctl status fail2ban --no-pager
echo ""
echo "SSH Configuration:"
cat /etc/ssh/sshd_config | grep -E "PermitRootLogin|PasswordAuthentication|Port"
echo ""
echo "Installed Security Packages:"
apt list --installed | grep -E "ufw|fail2ban|auditd|apparmor" | head -10
echo ""

echo "=== ПРОВЕРКА ЗАВЕРШЕНА ==="