# NormalDance Deployment Scripts

Автоматизированные скрипты для развертывания NormalDance на продакшн сервере.

## 🚀 Быстрый старт

### 1. Настройка переменных окружения

```bash
# Hetzner Cloud API
export HETZNER_TOKEN="your_hetzner_token"

# Domain APIs (выберите один)
export NAMECHEAP_API_KEY="your_namecheap_key"
export NAMECHEAP_USER="your_namecheap_user"

# Cloudflare (опционально)
export CLOUDFLARE_API_TOKEN="your_cloudflare_token"
export CLOUDFLARE_ZONE_ID="your_zone_id"

# Основные настройки
export DOMAIN="normaldance.com"
export EMAIL="admin@normaldance.com"
```

### 2. Полное развертывание

```bash
# Запуск полного развертывания
./scripts/deploy/deploy.sh full
```

## 📋 Компоненты развертывания

### 🖥️ Сервер (Hetzner Cloud)
- **Спецификации**: 4 vCPU, 8 GB RAM, 160 GB NVMe
- **Локация**: Nuremberg (nbg1)
- **ОС**: Ubuntu 22.04
- **Стоимость**: ~€15-20/месяц

### 🌐 Домен
- **Namecheap API**: Автоматическая покупка домена
- **Reg.ru API**: Альтернативный провайдер
- **Cloudflare**: DNS и SSL

### 🔒 SSL и безопасность
- **Let's Encrypt**: Бесплатные SSL сертификаты
- **Cloudflare**: Дополнительная защита
- **Nginx**: Reverse proxy с rate limiting
- **Fail2ban**: Защита от брутфорса
- **UFW**: Файрвол

### 🐳 Контейнеризация
- **Docker Compose**: Локальное развертывание
- **Kubernetes**: Масштабируемое развертывание
- **Nginx**: Load balancer и SSL termination

### 📊 Мониторинг
- **Prometheus**: Метрики приложения
- **Grafana**: Дашборды
- **Loki**: Агрегация логов
- **Promtail**: Сбор логов

## 🛠️ Отдельные команды

### Развертывание сервера
```bash
./scripts/deploy/deploy.sh server
```

### Настройка домена
```bash
./scripts/deploy/deploy.sh domain
```

### Развертывание приложения
```bash
./scripts/deploy/deploy.sh app
```

### Настройка SSL
```bash
./scripts/deploy/deploy.sh ssl
```

### Проверка здоровья
```bash
./scripts/deploy/deploy.sh health
```

## 📁 Структура файлов

```
scripts/deploy/
├── deploy.sh                 # Главный скрипт развертывания
├── hetzner-api.js           # Hetzner Cloud API
├── domain-api.js            # API покупки доменов
├── ssl-setup.sh             # Настройка SSL и безопасности
├── docker-compose.prod.yml  # Docker Compose для продакшна
├── k8s-deployment.yaml      # Kubernetes манифесты
└── README.md                # Эта документация
```

## 🔧 API интеграции

### Hetzner Cloud API
- Создание сервера с заданными характеристиками
- Настройка SSH ключей
- Создание и подключение томов
- Автоматическая настройка через user-data

### Namecheap API
- Проверка доступности домена
- Автоматическая покупка
- Настройка DNS записей

### Reg.ru API
- Альтернативный провайдер доменов
- API для российских доменов

### Cloudflare API
- Настройка DNS записей
- Включение SSL/TLS
- Настройка безопасности

## 🐳 Docker Compose

### Сервисы
- **app**: Основное приложение (Next.js)
- **websocket**: WebSocket сервер
- **api**: API сервер
- **postgres**: База данных
- **redis**: Кэш и сессии
- **nginx**: Reverse proxy
- **prometheus**: Мониторинг
- **grafana**: Дашборды
- **loki**: Логи
- **certbot**: SSL сертификаты

### Запуск
```bash
docker-compose -f scripts/deploy/docker-compose.prod.yml up -d
```

## ☸️ Kubernetes

### Компоненты
- **Namespace**: normaldance
- **Deployments**: app, websocket, api, postgres, redis
- **Services**: ClusterIP для внутренней связи
- **Ingress**: Nginx с SSL termination
- **HPA**: Автомасштабирование
- **ConfigMaps**: Конфигурация
- **Secrets**: Чувствительные данные

### Развертывание
```bash
kubectl apply -f scripts/deploy/k8s-deployment.yaml
```

## 🔒 Безопасность

### SSL/TLS
- Let's Encrypt сертификаты
- Автоматическое обновление
- HSTS заголовки
- Современные шифры

### Файрвол
- UFW с минимальными правилами
- SSH доступ только
- HTTP/HTTPS порты
- Блокировка по умолчанию

### Защита от атак
- Fail2ban для SSH
- Rate limiting в Nginx
- CSP заголовки
- XSS защита

## 📊 Мониторинг

### Метрики
- CPU и память сервера
- Запросы к приложению
- Состояние базы данных
- SSL сертификаты

### Логи
- Централизованный сбор
- Ротация логов
- Алерты на ошибки

### Дашборды
- Grafana с готовыми дашбордами
- Мониторинг производительности
- Алерты и уведомления

## 💰 Стоимость

### Ежемесячные расходы
- **Сервер**: €15-20 (4 vCPU, 8 GB RAM)
- **Домен**: €1-2 (годовая стоимость)
- **SSL**: Бесплатно (Let's Encrypt)
- **Мониторинг**: Бесплатно (самохостинг)

### Итого: ~€20-25/месяц

## 🚨 Troubleshooting

### Проблемы с сервером
```bash
# Проверка статуса
ssh -i ./keys/id_rsa ubuntu@SERVER_IP "systemctl status normaldance"

# Логи приложения
ssh -i ./keys/id_rsa ubuntu@SERVER_IP "docker-compose logs app"

# Перезапуск сервисов
ssh -i ./keys/id_rsa ubuntu@SERVER_IP "docker-compose restart"
```

### Проблемы с SSL
```bash
# Проверка сертификатов
ssh -i ./keys/id_rsa ubuntu@SERVER_IP "certbot certificates"

# Обновление сертификатов
ssh -i ./keys/id_rsa ubuntu@SERVER_IP "certbot renew --force-renewal"
```

### Проблемы с DNS
```bash
# Проверка DNS
nslookup DOMAIN
dig DOMAIN

# Проверка Cloudflare
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records"
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `./scripts/deploy/deploy.sh health`
2. Проверьте статус сервисов на сервере
3. Проверьте DNS и SSL сертификаты
4. Обратитесь к документации API провайдеров

## 🔄 Обновления

### Обновление приложения
```bash
# Загрузка новой версии
git pull origin main

# Переразвертывание
./scripts/deploy/deploy.sh app
```

### Обновление сервера
```bash
# Обновление системы
ssh -i ./keys/id_rsa ubuntu@SERVER_IP "sudo apt update && sudo apt upgrade -y"

# Перезапуск сервисов
ssh -i ./keys/id_rsa ubuntu@SERVER_IP "docker-compose restart"
```
