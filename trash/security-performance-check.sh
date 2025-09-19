#!/bin/bash

echo "=== ПРОВЕРКА БЕЗОПАСНОСТИ И ПРОИЗВОДИТЕЛЬНОСТИ ==="
echo "Дата: $(date)"
echo ""

# 1. Проверка firewall
echo "=== 1. Firewall (UFW) ==="
echo "Статус UFW:"
ufw status verbose
echo ""
echo "Правила UFW:"
ufw status numbered
echo ""

# 2. Проверка fail2ban
echo "=== 2. Fail2Ban ==="
echo "Статус Fail2Ban:"
systemctl status fail2ban --no-pager
echo ""
echo "Конфигурация Fail2Ban:"
if [ -f "/etc/fail2ban/jail.local" ]; then
    cat /etc/fail2ban/jail.local
else
    echo "jail.local не найден"
fi
echo ""
echo "Забаненные IP:"
fail2ban-client status 2>/dev/null || echo "Fail2Ban не работает"
echo ""

# 3. Проверка SSH
echo "=== 3. SSH Конфигурация ==="
echo "SSH конфигурация:"
cat /etc/ssh/sshd_config | grep -E "PermitRootLogin|PasswordAuthentication|Port|MaxAuthTries|LoginGraceTime"
echo ""
echo "SSH процессы:"
ps aux | grep sshd
echo ""
echo "SSH подключения:"
ss -tulpn | grep :22
echo ""

# 4. Проверка безопасности системы
echo "=== 4. Безопасность системы ==="
echo "Установленные пакеты безопасности:"
apt list --installed | grep -E "ufw|fail2ban|auditd|apparmor| clamav" | head -10
echo ""
echo "Активные сервисы:"
systemctl list-units --type=service --state=running | grep -E "ssh|nginx|docker|ufw|fail2ban"
echo ""
echo "Открытые порты:"
ss -tulpn | grep LISTEN
echo ""

# 5. Проверка производительности
echo "=== 5. Производительность ==="
echo "Загрузка CPU:"
top -bn1 | grep "Cpu(s)"
echo ""
echo "Загрузка памяти:"
free -h
echo ""
echo "Дисковое пространство:"
df -h
echo ""
echo "Процессы с наибольшим использованием CPU:"
ps aux --sort=-%cpu | head -10
echo ""
echo "Процессы с наибольшим использованием памяти:"
ps aux --sort=-%mem | head -10
echo ""

# 6. Проверка логов безопасности
echo "=== 6. Логи безопасности ==="
echo "SSH логины (последние 10):"
if [ -f "/var/log/auth.log" ]; then
    grep "Accepted password" /var/log/auth.log | tail -10
elif [ -f "/var/log/secure" ]; then
    grep "Accepted password" /var/log/secure | tail -10
else
    echo "Логи SSH не найдены"
fi
echo ""
echo "Неудачные SSH попытки (последние 10):"
if [ -f "/var/log/auth.log" ]; then
    grep "Failed password" /var/log/auth.log | tail -10
elif [ -f "/var/log/secure" ]; then
    grep "Failed password" /var/log/secure | tail -10
else
    echo "Логи SSH не найдены"
fi
echo ""

# 7. Проверка обновлений системы
echo "=== 7. Обновления системы ==="
echo "Доступные обновления:"
apt list --upgradable 2>/dev/null | head -10
echo ""
echo "Последние обновления:"
if [ -f "/var/log/dpkg.log" ]; then
    tail -10 /var/log/dpkg.log
else
    echo "Логи обновлений не найдены"
fi
echo ""

# 8. Проверка пользователей
echo "=== 8. Пользователи и группы ==="
echo "Текущие пользователи:"
w
echo ""
echo "Список пользователей:"
cut -d: -f1 /etc/passwd
echo ""
echo "Sudo пользователи:"
getent group sudo
echo ""

echo "=== БЕЗОПАСНОСТЬ И ПРОИЗВОДИТЕЛЬНОСТЬ ПРОВЕРКА ЗАВЕРШЕНА ==="