#!/bin/bash

# NORMALDANCE Server Setup Script
# Выполняется на сервере 176.108.246.49

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}"; exit 1; }

# Проверка пользователя
if [[ $EUID -eq 0 ]]; then
    error "Не запускайте от root!"
fi

log "🎵 Настройка сервера NORMALDANCE"

# Шаг 1: Обновление системы
log "Шаг 1: Обновление системы"
sudo apt update && sudo apt upgrade -y

# Шаг 2: Установка базовых пакетов
log "Шаг 2: Установка базовых пакетов"
sudo apt install -y curl wget git htop nano ufw fail2ban \
    build-essential software-properties-common apt-transport-https \
    ca-certificates gnupg lsb-release

# Шаг 3: Установка Docker
log "Шаг 3: Установка Docker"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    info "Docker установлен"
else
    info "Docker уже установлен"
fi

# Шаг 4: Установка Docker Compose
log "Шаг 4: Установка Docker Compose"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    info "Docker Compose установлен"
else
    info "Docker Compose уже установлен"
fi

# Шаг 5: Установка Node.js
log "Шаг 5: Установка Node.js"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    info "Node.js установлен: $(node --version)"
else
    info "Node.js уже установлен: $(node --version)"
fi

# Шаг 6: Установка Nginx
log "Шаг 6: Установка Nginx"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    info "Nginx установлен"
else
    info "Nginx уже установлен"
fi

# Шаг 7: Установка PostgreSQL
log "Шаг 7: Установка PostgreSQL"
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
    info "PostgreSQL установлен"
else
    info "PostgreSQL уже установлен"
fi

# Шаг 8: Установка Redis
log "Шаг 8: Установка Redis"
if ! command -v redis-cli &> /dev/null; then
    sudo apt install -y redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
    info "Redis установлен"
else
    info "Redis уже установлен"
fi

# Шаг 9: Установка FFmpeg
log "Шаг 9: Установка FFmpeg"
sudo apt install -y ffmpeg sox lame flac vorbis-tools

# Шаг 10: Настройка файрвола
log "Шаг 10: Настройка файрвола"
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Шаг 11: Создание структуры проекта
log "Шаг 11: Создание структуры проекта"
sudo mkdir -p /var/www/normaldance
sudo chown -R $USER:$USER /var/www/normaldance
cd /var/www/normaldance

mkdir -p {storage/{uploads,processed,static},logs,config}

# Шаг 12: Настройка PostgreSQL
log "Шаг 12: Настройка PostgreSQL"
sudo -u postgres psql << EOF
CREATE USER normaldance WITH PASSWORD 'secure_password_change_me';
CREATE DATABASE normaldance_platform OWNER normaldance;
CREATE DATABASE normaldance_store OWNER normaldance;
GRANT ALL PRIVILEGES ON DATABASE normaldance_platform TO normaldance;
GRANT ALL PRIVILEGES ON DATABASE normaldance_store TO normaldance;
\q
EOF

# Шаг 13: Создание .env файла
log "Шаг 13: Создание переменных окружения"
cat > /var/www/normaldance/.env << EOF
# Database
DB_PASSWORD=secure_password_change_me
DATABASE_URL=postgresql://normaldance:secure_password_change_me@localhost:5432/normaldance_platform

# JWT
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Payments
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLIC_KEY=pk_test_your_key_here

# Icecast
ICECAST_PASSWORD=$(openssl rand -base64 16)
ICECAST_ADMIN_PASSWORD=$(openssl rand -base64 16)

# Grafana
GRAFANA_PASSWORD=admin123_change_me

# URLs
NEXTAUTH_URL=https://dnb1st.ru
API_URL=https://api.dnb1st.ru
EOF

chmod 600 /var/www/normaldance/.env

# Шаг 14: Установка Certbot
log "Шаг 14: Установка Certbot"
if ! command -v certbot &> /dev/null; then
    sudo apt install snapd
    sudo snap install core
    sudo snap refresh core
    sudo snap install --classic certbot
    sudo ln -s /snap/bin/certbot /usr/bin/certbot
    info "Certbot установлен"
else
    info "Certbot уже установлен"
fi

# Шаг 15: Проверка статуса сервисов
log "Шаг 15: Проверка статуса сервисов"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo "PostgreSQL: $(sudo -u postgres psql -c 'SELECT version();' | head -3 | tail -1)"
echo "Redis: $(redis-cli --version)"

# Проверка сервисов
services=("nginx" "postgresql" "redis-server")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo -e "${GREEN}✅ $service: активен${NC}"
    else
        echo -e "${RED}❌ $service: неактивен${NC}"
    fi
done

log "🎉 Базовая настройка сервера завершена!"

echo ""
echo -e "${BLUE}Следующие шаги:${NC}"
echo "1. Получите SSL сертификаты:"
echo "   sudo certbot certonly --manual --preferred-challenges dns -d dnb1st.ru -d '*.dnb1st.ru'"
echo "   sudo certbot certonly --manual --preferred-challenges dns -d dnb1st.store -d '*.dnb1st.store'"
echo ""
echo "2. Скопируйте конфигурацию Nginx:"
echo "   sudo cp configs/nginx/normaldance.conf /etc/nginx/sites-available/"
echo "   sudo ln -s /etc/nginx/sites-available/normaldance.conf /etc/nginx/sites-enabled/"
echo "   sudo rm /etc/nginx/sites-enabled/default"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "3. Клонируйте код проекта и запустите:"
echo "   git clone your-repo.git ."
echo "   docker-compose -f configs/docker/docker-compose.prod.yml up -d"
echo ""
echo -e "${YELLOW}⚠️  Не забудьте изменить пароли в .env файле!${NC}"