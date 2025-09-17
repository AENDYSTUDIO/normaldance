#!/bin/bash
# Скрипт настройки сервера для NORMALDANCE

set -e

echo "🚀 Настройка сервера для NORMALDANCE..."

# Обновление системы
echo "📦 Обновление системы..."
sudo apt update && sudo apt upgrade -y

# Установка Docker
echo "🐳 Установка Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
echo "🔧 Установка Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Установка Node.js 20
echo "📦 Установка Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PostgreSQL и Redis
echo "🗄️ Установка PostgreSQL и Redis..."
sudo apt install -y postgresql postgresql-contrib redis-server

# Установка Nginx
echo "🌐 Установка Nginx..."
sudo apt install -y nginx

# Установка Certbot для SSL
echo "🔒 Установка Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Создание пользователя для приложения
echo "👤 Создание пользователя normaldance..."
sudo useradd -m -s /bin/bash normaldance
sudo usermod -aG docker normaldance

# Создание директорий
echo "📁 Создание директорий..."
sudo mkdir -p /opt/normaldance
sudo mkdir -p /opt/normaldance/uploads
sudo mkdir -p /opt/normaldance/cache
sudo mkdir -p /opt/normaldance/logs
sudo chown -R normaldance:normaldance /opt/normaldance

# Настройка firewall
echo "🔥 Настройка firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable

# Настройка PostgreSQL
echo "🗄️ Настройка PostgreSQL..."
sudo -u postgres psql -c "CREATE USER normaldance WITH PASSWORD 'normaldance_secure_password';"
sudo -u postgres psql -c "CREATE DATABASE normaldance OWNER normaldance;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE normaldance TO normaldance;"

# Настройка Redis
echo "🔴 Настройка Redis..."
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Настройка Nginx
echo "🌐 Настройка Nginx..."
sudo tee /etc/nginx/sites-available/normaldance << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/socketio/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/normaldance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "✅ Настройка сервера завершена!"
echo "📝 Следующие шаги:"
echo "1. Замените 'your-domain.com' на ваш домен в /etc/nginx/sites-available/normaldance"
echo "2. Запустите: sudo certbot --nginx -d your-domain.com"
echo "3. Скопируйте проект в /opt/normaldance"
echo "4. Запустите: docker-compose up -d"
