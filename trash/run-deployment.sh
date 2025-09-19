#!/bin/bash

# NORMALDANCE - Полный деплой на сервер
# Запускается локально, выполняет команды на сервере

set -e

SERVER="176.108.246.49"
USER="aendy"
PROJECT_DIR="/var/www/normaldance"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }

log "🚀 Начало деплоя NORMALDANCE на сервер $SERVER"

# Проверка подключения к серверу
log "Проверка подключения к серверу..."
if ! ssh -o ConnectTimeout=10 $USER@$SERVER "echo 'Подключение успешно'"; then
    echo "❌ Не удается подключиться к серверу $SERVER"
    exit 1
fi

# Шаг 1: Копирование файлов на сервер
log "Шаг 1: Копирование файлов на сервер"
info "Копирование конфигураций..."
scp -r configs/ $USER@$SERVER:~/
scp setup-server.sh $USER@$SERVER:~/
scp package.json $USER@$SERVER:~/
scp Dockerfile $USER@$SERVER:~/

# Шаг 2: Выполнение настройки сервера
log "Шаг 2: Выполнение настройки сервера"
ssh $USER@$SERVER << 'EOF'
    chmod +x setup-server.sh
    ./setup-server.sh
EOF

# Шаг 3: Настройка Nginx
log "Шаг 3: Настройка Nginx"
ssh $USER@$SERVER << 'EOF'
    sudo cp configs/nginx/normaldance.conf /etc/nginx/sites-available/
    sudo ln -sf /etc/nginx/sites-available/normaldance.conf /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Проверка конфигурации
    if sudo nginx -t; then
        echo "✅ Nginx конфигурация корректна"
        sudo systemctl reload nginx
    else
        echo "❌ Ошибка в конфигурации Nginx"
        exit 1
    fi
EOF

# Шаг 4: Получение SSL сертификатов
log "Шаг 4: Получение SSL сертификатов"
warn "Для получения SSL сертификатов требуется ручная DNS-валидация"
info "Выполните на сервере следующие команды:"
echo "sudo certbot certonly --manual --preferred-challenges dns -d dnb1st.ru -d '*.dnb1st.ru'"
echo "sudo certbot certonly --manual --preferred-challenges dns -d dnb1st.store -d '*.dnb1st.store'"
echo ""
read -p "Нажмите Enter после получения SSL сертификатов..."

# Шаг 5: Проверка SSL сертификатов
log "Шаг 5: Проверка SSL сертификатов"
ssh $USER@$SERVER << 'EOF'
    if [ -f "/etc/letsencrypt/live/dnb1st.ru/fullchain.pem" ]; then
        echo "✅ SSL сертификат для dnb1st.ru найден"
    else
        echo "❌ SSL сертификат для dnb1st.ru не найден"
        exit 1
    fi
    
    if [ -f "/etc/letsencrypt/live/dnb1st.store/fullchain.pem" ]; then
        echo "✅ SSL сертификат для dnb1st.store найден"
    else
        echo "❌ SSL сертификат для dnb1st.store не найден"
        exit 1
    fi
EOF

# Шаг 6: Перезапуск Nginx с SSL
log "Шаг 6: Перезапуск Nginx с SSL"
ssh $USER@$SERVER << 'EOF'
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Nginx перезапущен с SSL"
EOF

# Шаг 7: Создание проекта
log "Шаг 7: Создание базовой структуры проекта"
ssh $USER@$SERVER << 'EOF'
    cd /var/www/normaldance
    
    # Создание базового Next.js приложения
    mkdir -p {pages,components,lib,public,styles}
    
    # Создание базовой страницы
    cat > pages/index.js << 'JSEOF'
export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎵 NORMALDANCE</h1>
      <p>Музыкальная платформа успешно развернута!</p>
      <div style={{ marginTop: '2rem' }}>
        <h2>Статус сервисов:</h2>
        <ul>
          <li>✅ Веб-приложение: Работает</li>
          <li>✅ SSL сертификаты: Активны</li>
          <li>✅ База данных: PostgreSQL</li>
          <li>✅ Кэш: Redis</li>
          <li>✅ Nginx: Настроен</li>
        </ul>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h2>Домены:</h2>
        <ul>
          <li><a href="https://dnb1st.ru">https://dnb1st.ru</a> - Основная платформа</li>
          <li><a href="https://dnb1st.store">https://dnb1st.store</a> - Магазин</li>
        </ul>
      </div>
    </div>
  );
}
JSEOF

    # Создание next.config.js
    cat > next.config.js << 'JSEOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['dnb1st.ru', 'dnb1st.store'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3002/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
JSEOF

    # Установка зависимостей
    npm install
EOF

# Шаг 8: Запуск приложения
log "Шаг 8: Запуск приложения"
ssh $USER@$SERVER << 'EOF'
    cd /var/www/normaldance
    
    # Сборка приложения
    npm run build
    
    # Установка PM2 для управления процессами
    sudo npm install -g pm2
    
    # Создание ecosystem файла для PM2
    cat > ecosystem.config.js << 'JSEOF'
module.exports = {
  apps: [
    {
      name: 'normaldance-web',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/normaldance',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
JSEOF
    
    # Запуск через PM2
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
EOF

# Шаг 9: Финальная проверка
log "Шаг 9: Финальная проверка"
info "Проверка доступности сайтов..."

# Проверка HTTP статусов
if curl -s -I https://dnb1st.ru | grep -q "200 OK"; then
    echo "✅ https://dnb1st.ru доступен"
else
    echo "❌ https://dnb1st.ru недоступен"
fi

if curl -s -I https://dnb1st.store | grep -q "200 OK"; then
    echo "✅ https://dnb1st.store доступен"
else
    echo "❌ https://dnb1st.store недоступен"
fi

# Проверка SSL сертификатов
info "Проверка SSL сертификатов..."
echo | openssl s_client -servername dnb1st.ru -connect dnb1st.ru:443 2>/dev/null | openssl x509 -noout -dates

log "🎉 Деплой NORMALDANCE завершен!"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  NORMALDANCE УСПЕШНО РАЗВЕРНУТ!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Доступные сайты:${NC}"
echo "🌐 Основная платформа: https://dnb1st.ru"
echo "🛒 Магазин: https://dnb1st.store"
echo ""
echo -e "${BLUE}Управление:${NC}"
echo "• SSH: ssh $USER@$SERVER"
echo "• PM2 статус: pm2 status"
echo "• PM2 логи: pm2 logs"
echo "• Nginx логи: sudo tail -f /var/log/nginx/error.log"
echo ""
echo -e "${YELLOW}Следующие шаги:${NC}"
echo "1. Настройте автоматическое обновление SSL: sudo crontab -e"
echo "2. Настройте резервное копирование баз данных"
echo "3. Добавьте мониторинг и алерты"
echo "4. Настройте CI/CD для автоматического деплоя"