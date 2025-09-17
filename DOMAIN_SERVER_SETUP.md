# Руководство по регистрации домена и настройке сервера для NORMALDANCE

## 🌐 Регистрация домена

### Рекомендуемые регистраторы:
1. **Namecheap** - $8-15/год (рекомендуется)
2. **Cloudflare** - $9-15/год (лучшая безопасность)
3. **GoDaddy** - $10-20/год
4. **Porkbun** - $6-12/год (самый дешевый)

### Варианты доменов для NORMALDANCE:
- `normaldance.com` - основной домен
- `normaldance.io` - альтернатива
- `normaldance.app` - для приложения
- `normaldance.music` - музыкальная тематика
- `normaldance.audio` - аудио тематика

## 🖥️ Выбор сервера

### Рекомендуемые VPS провайдеры:

#### 1. **Hetzner** (самый дешевый)
- **Сервер**: CX21 (2 vCPU, 4GB RAM, 40GB SSD)
- **Цена**: €4.79/месяц (~$5)
- **Локация**: Германия, Финляндия
- **Ссылка**: https://hetzner.com

#### 2. **DigitalOcean**
- **Сервер**: Basic Droplet (2 vCPU, 4GB RAM, 80GB SSD)
- **Цена**: $24/месяц
- **Локация**: США, Европа, Азия
- **Ссылка**: https://digitalocean.com

#### 3. **Vultr**
- **Сервер**: Regular Performance (2 vCPU, 4GB RAM, 80GB SSD)
- **Цена**: $24/месяц
- **Локация**: США, Европа, Азия
- **Ссылка**: https://vultr.com

#### 4. **Linode**
- **Сервер**: Nanode (1 vCPU, 1GB RAM, 25GB SSD)
- **Цена**: $5/месяц (минимальный)
- **Локация**: США, Европа, Азия
- **Ссылка**: https://linode.com

## 🚀 Пошаговая настройка

### Шаг 1: Регистрация домена
1. Выберите регистратора доменов
2. Проверьте доступность домена
3. Зарегистрируйте домен
4. Настройте DNS записи (пока оставьте как есть)

### Шаг 2: Заказ сервера
1. Выберите VPS провайдера
2. Создайте аккаунт
3. Закажите сервер с Ubuntu 22.04 LTS
4. Получите IP адрес сервера

### Шаг 3: Настройка DNS
1. В панели управления доменом добавьте A-запись:
   - **Имя**: @ (или ваш домен)
   - **Тип**: A
   - **Значение**: IP адрес вашего сервера
   - **TTL**: 300

2. Добавьте CNAME запись для www:
   - **Имя**: www
   - **Тип**: CNAME
   - **Значение**: your-domain.com
   - **TTL**: 300

### Шаг 4: Подключение к серверу
```bash
ssh root@your-server-ip
```

### Шаг 5: Настройка сервера
```bash
# Скачайте скрипт настройки
wget https://raw.githubusercontent.com/your-repo/normaldance/main/scripts/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

### Шаг 6: Загрузка проекта
```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/normaldance.git /opt/normaldance
cd /opt/normaldance

# Настройте права доступа
chown -R normaldance:normaldance /opt/normaldance
```

### Шаг 7: Настройка SSL
```bash
# Замените your-domain.com на ваш домен
sudo sed -i 's/your-domain.com/your-actual-domain.com/g' /etc/nginx/sites-available/normaldance

# Получите SSL сертификат
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Шаг 8: Развертывание приложения
```bash
# Запустите скрипт развертывания
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

## 🔧 Настройка переменных окружения

Отредактируйте файл `.env.production`:
```bash
nano /opt/normaldance/.env.production
```

Замените следующие значения:
- `your-domain.com` → ваш домен
- `your_super_secret_key_change_me` → случайный секретный ключ
- `your_pinata_api_key` → ваш API ключ Pinata
- `your_pinata_secret_key` → ваш секретный ключ Pinata
- `your_ndt_program_id` → ID программы NDT
- `your_tracknft_program_id` → ID программы TrackNFT
- `your_staking_program_id` → ID программы Staking

## 📊 Мониторинг и управление

### Проверка статуса:
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Просмотр логов:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Перезапуск сервисов:
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Обновление приложения:
```bash
cd /opt/normaldance
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## 💰 Примерная стоимость

### Минимальная конфигурация:
- **Домен**: $10/год
- **Сервер**: $5-24/месяц
- **Итого**: $70-298/год

### Рекомендуемая конфигурация:
- **Домен**: $15/год
- **Сервер**: $24/месяц
- **Итого**: $303/год

## 🆘 Поддержка

Если возникли проблемы:
1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус сервисов: `systemctl status nginx`
3. Проверьте DNS: `nslookup your-domain.com`
4. Проверьте SSL: `curl -I https://your-domain.com`
