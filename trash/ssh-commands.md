# Команды для выполнения на сервере

## 1. Подключение к серверу
```bash
ssh aendy@176.108.246.49
```

## 2. Загрузка и выполнение скриптов проверки
```bash
# Скачать скрипты (если есть доступ к интернету)
wget https://raw.githubusercontent.com/your-repo/server-check.sh
wget https://raw.githubusercontent.com/your-repo/dns-setup.sh

# Или создать локально и скопировать содержимое
nano server-check.sh
nano dns-setup.sh

# Сделать исполняемыми
chmod +x server-check.sh dns-setup.sh

# Выполнить проверки
./server-check.sh > server-report.txt
./dns-setup.sh > dns-report.txt
```

## 3. Ручные команды для проверки

### Системная информация
```bash
# Информация о системе
uname -a
cat /etc/os-release
uptime
whoami
```

### Ресурсы
```bash
# Память и диски
free -h
df -h
lscpu
```

### Процессы и сервисы
```bash
# Процессы
ps aux | head -20
top -n 1

# Docker
docker --version
docker-compose --version
docker ps
docker images

# Системные сервисы
systemctl status nginx
systemctl status postgresql
systemctl status redis-server
```

### Сеть и порты
```bash
# Открытые порты
netstat -tlnp
ss -tlnp
lsof -i :80
lsof -i :443
```

### Директории
```bash
# Основные директории
ls -la /var/www/
ls -la /home/aendy/
ls -la /etc/nginx/sites-available/
```

### DNS проверки
```bash
# Проверка DNS записей
dig dnb1st.ru
dig dnb1st.store
nslookup dnb1st.ru
nslookup dnb1st.store

# Проверка доступности
ping -c 3 dnb1st.ru
ping -c 3 dnb1st.store
curl -I http://dnb1st.ru
curl -I http://dnb1st.store
```

### Nginx
```bash
# Проверка конфигурации
nginx -t
nginx -s reload
systemctl status nginx
cat /etc/nginx/sites-available/default
```

## 4. Настройка DNS (у регистратора домена)

### Для dnb1st.ru:
- A запись: @ → 176.108.246.49
- A запись: www → 176.108.246.49
- CNAME запись: store → dnb1st.ru
- MX запись: @ → 10 mail.dnb1st.ru

### Для dnb1st.store:
- A запись: @ → 176.108.246.49
- A запись: www → 176.108.246.49
- MX запись: @ → 10 mail.dnb1st.store

## 5. Создание nginx конфигураций

### Для dnb1st.ru:
```bash
sudo nano /etc/nginx/sites-available/dnb1st.ru
sudo ln -s /etc/nginx/sites-available/dnb1st.ru /etc/nginx/sites-enabled/
```

### Для dnb1st.store:
```bash
sudo nano /etc/nginx/sites-available/dnb1st.store
sudo ln -s /etc/nginx/sites-available/dnb1st.store /etc/nginx/sites-enabled/
```

### Перезапуск nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```