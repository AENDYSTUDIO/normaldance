# NORMALDANCE - Пошаговое выполнение на сервере

## Подключение к серверу
```bash
ssh aendy@176.108.246.49
```

## Шаг 1: Проверка системы
```bash
# Проверка ОС
cat /etc/os-release
uname -a

# Проверка ресурсов
free -h
df -h
```

## Шаг 2: Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

## Шаг 3: Установка базовых пакетов
```bash
sudo apt install -y curl wget git htop nano ufw fail2ban \
    build-essential software-properties-common apt-transport-https \
    ca-certificates gnupg lsb-release
```

## Шаг 4: Установка Docker
```bash
# Скачивание и установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Проверка установки
docker --version
```

## Шаг 5: Установка Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Проверка
docker-compose --version
```

## Шаг 6: Установка Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка
node --version
npm --version
```

## Шаг 7: Установка Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Проверка статуса
sudo systemctl status nginx
```

## Шаг 8: Установка PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Проверка статуса
sudo systemctl status postgresql
```

## Шаг 9: Настройка PostgreSQL
```bash
# Создание пользователя и баз данных
sudo -u postgres psql << 'EOF'
CREATE USER normaldance WITH PASSWORD 'secure_password_123';
CREATE DATABASE normaldance_platform OWNER normaldance;
CREATE DATABASE normaldance_store OWNER normaldance;
GRANT ALL PRIVILEGES ON DATABASE normaldance_platform TO normaldance;
GRANT ALL PRIVILEGES ON DATABASE normaldance_store TO normaldance;
\q
EOF

# Проверка подключения
psql -h localhost -U normaldance -d normaldance_platform -c "SELECT version();"
```

## Шаг 10: Установка Redis
```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Проверка
redis-cli ping
```

## Шаг 11: Создание структуры проекта
```bash
sudo mkdir -p /var/www/normaldance
sudo chown -R $USER:$USER /var/www/normaldance
cd /var/www/normaldance

# Создание директорий
mkdir -p {storage/{uploads,processed,static},logs,config,pages,components}
```

## Шаг 12: Создание базового приложения
```bash
cd /var/www/normaldance

# Создание package.json
cat > package.json << 'EOF'
{
  "name": "normaldance-platform",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
EOF

# Установка зависимостей
npm install
```

## Шаг 13: Создание главной страницы
```bash
cat > pages/index.js << 'EOF'
export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎵 NORMALDANCE</h1>
      <p>Музыкальная платформа успешно развернута!</p>
      <div style={{ marginTop: '2rem' }}>
        <h2>Статус сервисов:</h2>
        <ul>
          <li>✅ Веб-приложение: Работает</li>
          <li>✅ База данных: PostgreSQL</li>
          <li>✅ Кэш: Redis</li>
          <li>✅ Nginx: Настроен</li>
        </ul>
      </div>
    </div>
  );
}
EOF
```

## Шаг 14: Создание next.config.js
```bash
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
EOF
```

## Шаг 15: Сборка и запуск приложения
```bash
# Сборка
npm run build

# Установка PM2 для управления процессами
sudo npm install -g pm2

# Создание ecosystem файла
cat > ecosystem.config.js << 'EOF'
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
EOF

# Запуск через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Шаг 16: Настройка Nginx
```bash
# Создание конфигурации Nginx
sudo tee /etc/nginx/sites-available/normaldance << 'EOF'
server {
    listen 80;
    server_name dnb1st.ru www.dnb1st.ru dnb1st.store www.dnb1st.store;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Активация сайта
sudo ln -s /etc/nginx/sites-available/normaldance /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Проверка и перезапуск
sudo nginx -t
sudo systemctl reload nginx
```

## Шаг 17: Настройка файрвола
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Проверка статуса
sudo ufw status
```

## Шаг 18: Проверка работы
```bash
# Проверка статуса сервисов
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis-server
pm2 status

# Проверка портов
netstat -tlnp | grep -E ':(80|443|3000|5432|6379)'

# Тест локального подключения
curl -I http://localhost:3000
```

## Шаг 19: Установка SSL (после проверки DNS)
```bash
# Установка Certbot
sudo apt install snapd
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Получение сертификатов (выполнить после настройки DNS)
sudo certbot --nginx -d dnb1st.ru -d www.dnb1st.ru
sudo certbot --nginx -d dnb1st.store -d www.dnb1st.store
```

## Проверка результата
После выполнения всех шагов:
- http://176.108.246.49 должен показывать сайт NORMALDANCE
- После настройки SSL: https://dnb1st.ru и https://dnb1st.store

## Полезные команды для отладки
```bash
# Логи PM2
pm2 logs

# Логи Nginx
sudo tail -f /var/log/nginx/error.log

# Логи системы
journalctl -f

# Перезапуск сервисов
pm2 restart all
sudo systemctl restart nginx
```