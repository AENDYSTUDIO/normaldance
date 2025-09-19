2
# Руководство по настройке проекта NORMALDANCE

## Содержание

- [1. DNS-конфигурация для высокопроизводительных сервисов](#1-dns-конфигурация-для-высокопроизводительных-сервисов)
- [2. Введение](#2-введение)
- [3. Обзор проекта NORMALDANCE](#3-обзор-проекта-normaldance)
- [4. Архитектура инфраструктуры](#4-архитектура-инфраструктуры)
- [5. Системные требования](#5-системные-требования)
- [6. Предварительные требования для развертывания](#6-предварительные-требования-для-развертывания)
- [7. Настройка окружения разработки](#7-настройка-окружения-разработки)
- [8. Docker-контейнеризация](#8-docker-контейнеризация)
- [9. Настройка базы данных](#9-настройка-базы-данных)
- [10. Мониторинг и логирование](#10-мониторинг-и-логирование)
- [11. Деплой и CI/CD](#11-деплой-и-cicd)
- [12. WebSocket и реальное время](#12-websocket-и-реальное-время)
- [13. Мобильное приложение](#13-мобильное-приложение)
- [14. Web3 и блокчейн интеграция](#14-web3-и-блокчейн-интеграция)
- [15. Безопасность](#15-безопасность)
- [16. Оптимизация производительности](#16-оптимизация-производительности)
- [Приложение A. Список Docker-образов](#приложение-a-список-docker-образов)
- [Приложение B. Конфигурационные файлы](#приложение-b-конфигурационные-файлы)
- [Приложение C. Скрипты развертывания](#приложение-c-скрипты-развертывания)
- [Приложение D. Тестирование](#приложение-d-тестирование)

---

## 1. DNS-конфигурация для высокопроизводительных сервисов
### для музыкальной платформы NORMALDANCE

DNS (Система доменных имен) является критически важным компонентом для высоконагруженных музыкальных платформ. Правильная настройка DNS обеспечивает быструю загрузку контента, надежность сервиса и оптимальное распределение нагрузки.

### 1.1 Активация доменов и настройка DNS-записей с геораспределением

#### Основные A-записи для NORMALDANCE
```bash
# Основные домены
dnb1st.ru 300 IN A 176.108.246.49
www.dnb1st.ru 300 IN A 176.108.246.49
dnb1st.store 300 IN A 176.108.246.49
www.dnb1st.store 300 IN A 176.108.246.49

# Региональные поддомены
eu.dnb1st.ru 300 IN A 185.199.108.153  # Европа
us.dnb1st.ru 300 IN A 140.82.112.3     # США
asia.dnb1st.ru 300 IN A 13.229.188.59  # Азия

# CDN поддомены
cdn.dnb1st.ru 300 IN CNAME d111111abcdef8.cloudfront.net.
static.dnb1st.ru 300 IN CNAME assets.dnb1st.ru.
assets.dnb1st.ru 300 IN A 176.108.246.49

# API поддомены
api.dnb1st.ru 300 IN A 176.108.246.49
api-v2.dnb1st.ru 300 IN A 176.108.246.49
ws.dnb1st.ru 300 IN A 176.108.246.49
stream.dnb1st.ru 300 IN A 176.108.246.49
```

### 1.2 Типы DNS-записей и их применение в музыкальных сервисах

#### A/AAAA записи для балансировки нагрузки
```bash
# Основные серверы
dnb1st.ru 300 IN A 176.108.246.49
dnb1st.ru 300 IN A 176.108.246.50  # Резервный сервер

# IPv6 поддержка
dnb1st.ru 300 IN AAAA 2001:db8::1
dnb1st.ru 300 IN AAAA 2001:db8::2
```

#### CNAME записи для псевдонимов сервисов
```bash
# Поддомены сервисов
www.dnb1st.ru 300 IN CNAME dnb1st.ru.
music.dnb1st.ru 300 IN CNAME dnb1st.ru.
player.dnb1st.ru 300 IN CNAME dnb1st.ru.
upload.dnb1st.ru 300 IN CNAME dnb1st.ru.

# CDN алиасы
cdn.dnb1st.ru 300 IN CNAME d111111abcdef8.cloudfront.net.
images.dnb1st.ru 300 IN CNAME cdn.dnb1st.ru.
```

#### MX записи для почтовых серверов
```bash
# Почтовые серверы с приоритетами
dnb1st.ru 300 IN MX 10 mx1.beget.com.
dnb1st.ru 300 IN MX 20 mx2.beget.com.
dnb1st.ru 300 IN MX 30 mx3.beget.com.

dnb1st.store 300 IN MX 10 mx1.beget.com.
dnb1st.store 300 IN MX 20 mx2.beget.com.
```

#### TXT записи для SPF/DKIM
```bash
# SPF политики
dnb1st.ru 300 IN TXT "v=spf1 include:_spf.beget.com ~all"
dnb1st.store 300 IN TXT "v=spf1 include:_spf.beget.com ~all"

# DMARC настройки
_dmarc.dnb1st.ru 300 IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@dnb1st.ru"
_dmarc.dnb1st.store 300 IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@dnb1st.store"

# DKIM подписи
default._domainkey.dnb1st.ru 300 IN TXT "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."
```

#### SRV записи для сервисных портов
```bash
# WebSocket сервисы
_ws._tcp.dnb1st.ru 300 IN SRV 10 5 3001 ws.dnb1st.ru.
_wss._tcp.dnb1st.ru 300 IN SRV 10 5 443 ws.dnb1st.ru.

# API endpoints
_api._tcp.dnb1st.ru 300 IN SRV 10 5 3000 api.dnb1st.ru.
_streaming._tcp.dnb1st.ru 300 IN SRV 10 5 8080 stream.dnb1st.ru.
```

### 1.3 Проверка и отладка DNS

#### Команды dig для анализа зон
```bash
# Основные проверки
dig dnb1st.ru A +short
dig dnb1st.store A +short
dig www.dnb1st.ru A +short

# Проверка MX записей
dig dnb1st.ru MX
dig dnb1st.store MX

# Проверка через конкретные DNS серверы
dig @8.8.8.8 dnb1st.ru A
dig @1.1.1.1 dnb1st.ru A
dig @ns1.beget.com dnb1st.ru A

# Полная трассировка DNS
dig +trace dnb1st.ru A
```

#### nslookup для тестирования резолверов
```bash
# Основные проверки
nslookup dnb1st.ru
nslookup dnb1st.store

# Проверка конкретных типов записей
nslookup -type=MX dnb1st.ru
nslookup -type=TXT dnb1st.ru
nslookup -type=CNAME www.dnb1st.ru

# Обратное разрешение
nslookup 176.108.246.49
```

#### mtr для трассировки маршрутов
```bash
# Трассировка маршрута
mtr dnb1st.ru
mtr dnb1st.store

# Отчет по трассировке
mtr --report dnb1st.ru
mtr --report-cycles 10 dnb1st.ru

# Трассировка с разрешением имен
mtr --report --no-dns dnb1st.ru
```

### 1.4 Оптимизация TTL для быстрой пропагации

#### Рекомендуемые TTL значения

| Тип записи | TTL (сек) | Назначение |
|------------|-------------|-------------|
| A/AAAA     | 300-600     | Основные домены |
| CNAME      | 600-1800    | Поддомены сервисов |
| MX         | 1800-3600   | Почтовые серверы |
| TXT        | 300-1800    | SPF, DKIM, DMARC |
| SRV        | 600-3600    | Сервисные порты |
| NS         | 86400       | Неймсерверы |

### 1.5 Настройка поддоменов с wildcard-сертификатами

#### Wildcard DNS записи
```bash
# Wildcard для всех поддоменов
*.dnb1st.ru 300 IN A 176.108.246.49
*.dnb1st.store 300 IN A 176.108.246.49

# Конкретные поддомены (приоритет над wildcard)
api.dnb1st.ru 300 IN A 176.108.246.49
ws.dnb1st.ru 300 IN A 176.108.246.49
cdn.dnb1st.ru 300 IN CNAME d111111abcdef8.cloudfront.net.
```

### 1.6 Контрольные точки и чеклист валидации DNS

#### Чеклист DNS настройки

- [ ] Основные A-записи настроены
- [ ] WWW поддомены работают
- [ ] MX записи для почты настроены
- [ ] SPF/DKIM/DMARC записи добавлены
- [ ] CDN поддомены настроены
- [ ] API поддомены доступны
- [ ] WebSocket поддомены работают
- [ ] TTL значения оптимизированы
- [ ] DNS распространился глобально
- [ ] SSL сертификаты валидны

#### Скрипт автоматической проверки
```bash
#!/bin/bash
# dns-check.sh

DOMAINS=("dnb1st.ru" "dnb1st.store" "www.dnb1st.ru" "api.dnb1st.ru")
EXPECTED_IP="176.108.246.49"

echo "🔍 Проверка DNS настроек NORMALDANCE"
echo "======================================"

for domain in "${DOMAINS[@]}"; do
    echo -n "Проверка $domain: "
    
    # Проверка A-записи
    RESOLVED_IP=$(dig +short $domain A | head -1)
    
    if [ "$RESOLVED_IP" = "$EXPECTED_IP" ]; then
        echo "✅ OK ($RESOLVED_IP)"
    else
        echo "❌ FAIL ($RESOLVED_IP, ожидался $EXPECTED_IP)"
    fi
done

echo ""
echo "📧 Проверка MX записей:"
dig dnb1st.ru MX +short
dig dnb1st.store MX +short

echo ""
echo "🔒 Проверка SSL сертификатов:"
for domain in "dnb1st.ru" "dnb1st.store"; do
    echo -n "SSL $domain: "
    if curl -s -I https://$domain | grep -q "HTTP/2 200"; then
        echo "✅ OK"
    else
        echo "❌ FAIL"
    fi
done
```

---

## 2. SSL/TLS сертификаты и безопасность HTTPS
### для музыкальной платформы NORMALDANCE

### 2.1 Введение в безопасность HTTPS для музыкальных платформ

Для музыкальной платформы NORMALDANCE безопасность HTTPS является критически важным аспектом, так как платформа обрабатывает потоковую передачу аудио, пользовательские данные, платежные транзакции и NFT операции. Правильная настройка SSL/TLS обеспечивает:

- **Защита аудио-потоков**: Шифрование потоковой передачи prevents unauthorized access to music content
- **Безопасность пользовательских данных**: Защита личной информации и предпочтений
- **Доверие пользователей**: Визуальные индикаторы безопасности в браузерах
- **SEO преимущества**: Ранжирование выше в поисковых системах
- **Соответствие требованиям**: GDPR, PCI DSS для платежей

#### Особенности безопасности для музыкальных сервисов

Музыкальные платформы имеют уникальные требования к безопасности:

```bash
# Требования к безопасности для NORMALDANCE
- Низкая задержка для аудио-стриминга
- Поддержка WebSocket для реального времени
- Защита от перехвата потоков
- Оптимизация для мобильных устройств
- Поддержка HTTP/2 и HTTP/3 для производительности
```

#### Архитектура безопасности NORMALDANCE

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │───►│   Load Balancer │───►│   Web Servers   │
│                 │    │    (SSL/TLS)    │    │   (Nginx)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                    │
                       ┌─────────────────┐         │
                       │   API Servers   │◄────────┘
                       │   (Node.js)     │
                       └─────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Database      │ │   Blockchain    │ │   File Storage  │
│   (PostgreSQL)  │ │   (Solana)      │ │   (IPFS/Filecoin)│
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 2.2 Генерация CSR и получение сертификатов Let's Encrypt с DNS-валидацией

Для музыкальной платформы NORMALDANCE мы используем DNS-валидацию Let's Encrypt для максимальной надежности и автоматизации.

#### Подготовка к получению сертификатов

```bash
# Установка необходимых инструментов
sudo apt update
sudo apt install certbot python3-certbot-dns-cloudflare -y

# Настройка Cloudflare API для автоматической валидации
sudo mkdir -p /etc/letsencrypt/cloudflare
sudo nano /etc/letsencrypt/cloudflare/cloudflare.ini
```

Конфигурация Cloudflare API:

```ini
# /etc/letsencrypt/cloudflare/cloudflare.ini
dns_cloudflare_api_token = your_cloudflare_api_token
```

Настройка прав доступа:

```bash
sudo chmod 600 /etc/letsencrypt/cloudflare/cloudflare.ini
```

#### Генерация CSR для основных доменов

```bash
# Генерация приватного ключа и CSR для основного домена
openssl req -new -newkey rsa:4096 -nodes -keyout dnb1st.ru.key -out dnb1st.ru.csr -subj "/C=RU/ST=Moscow/L=Moscow/O=Normaldance/OU=IT/CN=dnb1st.ru"

# Просмотр CSR
openssl req -in dnb1st.ru.csr -text -noout
```

#### Получение wildcard сертификата для NORMALDANCE

```bash
# Получение wildcard сертификата для всех поддоменов
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare/cloudflare.ini \
  --email admin@dnb1st.ru \
  --agree-tos \
  --no-eff-email \
  -d "*.dnb1st.ru" \
  -d "dnb1st.ru" \
  -d "*.dnb1st.store" \
  -d "dnb1st.store"

# Получение сертификатов для API и WebSocket сервисов
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare/cloudflare.ini \
  --email admin@dnb1st.ru \
  --agree-tos \
  --no-eff-email \
  -d "*.api.dnb1st.ru" \
  -d "api.dnb1st.ru" \
  -d "*.ws.dnb1st.ru" \
  -d "ws.dnb1st.ru"
```

#### Проверка полученных сертификатов

```bash
# Просмотр информации о сертификате
sudo openssl x509 -in /etc/letsencrypt/live/dnb1st.ru/fullchain.pem -text -noout

# Проверка срока действия
sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/dnb1st.ru/fullchain.pem

# Проверка цепочки сертификатов
sudo openssl verify -CAfile /etc/letsencrypt/live/dnb1st.ru/chain.pem /etc/letsencrypt/live/dnb1st.ru/fullchain.pem
```

#### Структура сертификатов для музыкальной платформы

```bash
# Структура каталогов с сертификатами
/etc/letsencrypt/live/dnb1st.ru/
├── cert.pem          # Сертификат домена
├── chain.pem         # Цепочка сертификатов
├── fullchain.pem     # Полная цепочка + сертификат
├── privkey.pem       # Приватный ключ
└── README            # Информация о сертификате

/etc/letsencrypt/live/api.dnb1st.ru/
├── cert.pem
├── chain.pem
├── fullchain.pem
├── privkey.pem
└── README

/etc/letsencrypt/live/ws.dnb1st.ru/
├── cert.pem
├── chain.pem
├── fullchain.pem
├── privkey.pem
└── README
```

### 2.3 Настройка автоматического обновления сертификатов с помощью certbot

Для музыкальной платформы NORMALDANCE автоматическое обновление сертификатов критически важно для бесперебойной работы.

#### Настройка cron-задачи для автоматического обновления

```bash
# Создание скрипта для обновления сертификатов
sudo nano /usr/local/bin/renew-ssl-certificates.sh
```

Содержимое скрипта:

```bash
#!/bin/bash
# /usr/local/bin/renew-ssl-certificates.sh

LOG_FILE="/var/log/ssl-renewal.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting SSL certificate renewal..." >> $LOG_FILE

# Обновление сертификатов с логированием
if sudo certbot renew --non-interactive --post-hook "systemctl reload nginx" >> $LOG_FILE 2>&1; then
    echo "[$DATE] SSL certificates renewed successfully" >> $LOG_FILE
    
    # Перезапуск сервисов для применения новых сертификатов
    sudo systemctl reload nginx
    sudo systemctl reload normaldance-api
    sudo systemctl reload normaldance-websocket
    
    echo "[$DATE] Services reloaded successfully" >> $LOG_FILE
else
    echo "[$DATE] SSL certificate renewal failed" >> $LOG_FILE
    exit 1
fi

echo "[$DATE] SSL certificate renewal completed" >> $LOG_FILE
```

Настройка прав доступа:

```bash
sudo chmod +x /usr/local/bin/renew-ssl-certificates.sh
```

#### Настройка cron-задачи

```bash
# Добавление задачи в crontab
sudo crontab -e
```

Добавить следующую строку:

```bash
# Ежедневная проверка обновления SSL сертификатов в 3:00 ночи
0 3 * * * /usr/local/bin/renew-ssl-certificates.sh
```

#### Мониторинг обновления сертификатов

```bash
# Скрипт для проверки статуса сертификатов
sudo nano /usr/local/bin/check-ssl-status.sh
```

Содержимое скрипта:

```bash
#!/bin/bash
# /usr/local/bin/check-ssl-status.sh

DOMAINS=("dnb1st.ru" "dnb1st.store" "api.dnb1st.ru" "ws.dnb1st.ru")
THRESHOLD_DAYS=30

echo "SSL Certificate Status Check - $(date)"
echo "====================================="

for domain in "${DOMAINS[@]}"; do
    if [ -f "/etc/letsencrypt/live/$domain/cert.pem" ]; then
        # Получение срока действия сертификата
        expiry_date=$(sudo openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$domain/cert.pem" | cut -d= -f2)
        expiry_timestamp=$(date -d "$expiry_date" +%s)
        current_timestamp=$(date +%s)
        days_left=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        echo "Domain: $domain"
        echo "  Expiry Date: $expiry_date"
        echo "  Days Left: $days_left"
        
        if [ $days_left -lt $THRESHOLD_DAYS ]; then
            echo "  ⚠️  WARNING: Certificate expires in less than $THRESHOLD_DAYS days!"
        else
            echo "  ✅ OK"
        fi
        echo ""
    else
        echo "❌ ERROR: Certificate not found for $domain"
    fi
done
```

Настройка прав доступа и cron-задачи для мониторинга:

```bash
sudo chmod +x /usr/local/bin/check-ssl-status.sh

# Еженедельная проверка статуса сертификатов
0 9 * * 1 /usr/local/bin/check-ssl-status.sh | mail -s "SSL Certificate Status Report" admin@dnb1st.ru
```

#### Настройка уведомлений об истечении срока действия

```bash
# Скрипт для отправки уведомлений
sudo nano /usr/local/bin/ssl-expiry-notification.sh
```

Содержимое скрипта:

```bash
#!/bin/bash
# /usr/local/bin/ssl-expiry-notification.sh

DOMAINS=("dnb1st.ru" "dnb1st.store" "api.dnb1st.ru" "ws.dnb1st.ru")
THRESHOLD_DAYS=14
EMAIL="admin@dnb1st.ru"

MESSAGE="SSL Certificate Expiry Notification\n\n"
MESSAGE+="The following certificates will expire soon:\n\n"

for domain in "${DOMAINS[@]}"; do
    if [ -f "/etc/letsencrypt/live/$domain/cert.pem" ]; then
        expiry_date=$(sudo openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$domain/cert.pem" | cut -d= -f2)
        expiry_timestamp=$(date -d "$expiry_date" +%s)
        current_timestamp=$(date +%s)
        days_left=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        if [ $days_left -lt $THRESHOLD_DAYS ]; then
            MESSAGE+="Domain: $domain\n"
            MESSAGE+="  Expiry Date: $expiry_date\n"
            MESSAGE+="  Days Left: $days_left\n\n"
        fi
    fi
done

# Отправка уведомления, если есть сертификаты с истекающим сроком действия
if echo -e "$MESSAGE" | grep -q "Days Left"; then
    echo -e "$MESSAGE" | mail -s "SSL Certificate Expiry Warning" $EMAIL
    echo "SSL expiry notification sent to $EMAIL"
fi
```

Настройка cron-задачи для уведомлений:

```bash
# Ежедневная проверка и отправка уведомлений
0 8 * * * /usr/local/bin/ssl-expiry-notification.sh
```

### 2.4 Конфигурация OCSP Stapling и HSTS с preload

Для музыкальной платформы NORMALDANCE OCSP Stapling и HSTS критически важны для производительности и безопасности.

#### Настройка OCSP Stapling

OCSP Stapling позволяет сократить задержку при проверке статуса сертификата и повысить приватность пользователей.

```bash
# Создание конфигурации OCSP Stapling
sudo nano /etc/nginx/ocsp-stapling.conf
```

Содержимое конфигурации:

```nginx
# /etc/nginx/ocsp-stapling.conf
# OCSP Stapling configuration for NORMALDANCE

# Включение OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;

# Настройка resolver для OCSP
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Пути к файлам OCSP
ssl_trusted_certificate /etc/letsencrypt/live/dnb1st.ru/chain.pem;

# Настройка кэширования OCSP
ssl_stapling_file /var/lib/nginx/ocsp.cache;
ssl_stapling_responder_timeout 5s;
ssl_stapling_verify_timeout 5s;

# Настройка буфера для OCSP ответов
ssl_buffer_size 4k;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
```

#### Настройка HSTS с preload

HSTS (HTTP Strict Transport Security) обеспечивает обязательное использование HTTPS для всех запросов.

```bash
# Создание конфигурации HSTS
sudo nano /etc/nginx/hsts.conf
```

Содержимое конфигурации:

```nginx
# /etc/nginx/hsts.conf
# HSTS configuration for NORMALDANCE

# Основной HSTS заголовок
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

# Дополнительные заголовки безопасности
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; media-src 'self' https:; child-src 'self'; worker-src 'self'" always;

# Защита от clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Защита от MIME-тип атаки
add_header X-Content-Type-Options "nosniff" always;

# Защита от XSS атак
add_header X-XSS-Protection "1; mode=block" always;

# Политика реферера
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Защита от кражи данных
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

#### Конфигурация Nginx с OCSP Stapling и HSTS

```bash
# Создание основной конфигурации Nginx
sudo nano /etc/nginx/sites-available/normaldance-ssl.conf
```

Содержимое конфигурации:

```nginx
# /etc/nginx/sites-available/normaldance-ssl.conf
# SSL configuration for NORMALDANCE with OCSP Stapling and HSTS

server {
    listen 80;
    server_name dnb1st.ru www.dnb1st.ru dnb1st.store www.dnb1st.ru;
    
    # Перенаправление на HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dnb1st.ru www.dnb1st.ru;
    
    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/dnb1st.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dnb1st.ru/privkey.pem;
    
    # Включение конфигураций безопасности
    include /etc/nginx/ocsp-stapling.conf;
    include /etc/nginx/hsts.conf;
    
    # Оптимизация SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;
    
    # Оптимизация для аудио-стриминга
    client_max_body_size 100M;
    client_body_timeout 300s;
    client_header_timeout 300s;
    keepalive_timeout 75s;
    
    # Кэширование для музыкальных файлов
    location ~* \.(mp3|wav|flac|aac|ogg|m4a)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        tcp_nodelay on;
        tcp_nopush on;
    }
    
    # WebSocket поддержка
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Таймауты для WebSocket
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_connect_timeout 60s;
    }
    
    # API прокси
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Оптимизация для API
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # Основное приложение
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Статические файлы
    location /static/ {
        alias /var/www/normaldance/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        tcp_nodelay on;
        tcp_nopush on;
    }
    
    # Логи
    access_log /var/log/nginx/normaldance.access.log;
    error_log /var/log/nginx/normaldance.error.log;
}

# Конфигурация для API сервиса
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.dnb1st.ru www.api.dnb1st.ru;
    
    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/api.dnb1st.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.dnb1st.ru/privkey.pem;
    
    # Включение конфигураций безопасности
    include /etc/nginx/ocsp-stapling.conf;
    include /etc/nginx/hsts.conf;
    
    # Оптимизация SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;
    
    # API прокси
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Оптимизация для API
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        
        # Включение сжатия
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_proxied any;
        gzip_comp_level 6;
        gzip_types
            text/plain
            text/css
            text/xml
            text/javascript
            application/json
            application/javascript
            application/xml+rss
            application/atom+xml
            image/svg+xml;
    }
    
    # Логи
    access_log /var/log/nginx/api.access.log;
    error_log /var/log/nginx/api.error.log;
}

# Конфигурация для WebSocket сервиса
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ws.dnb1st.ru www.ws.dnb1st.ru;
    
    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/ws.dnb1st.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ws.dnb1st.ru/privkey.pem;
    
    # Включение конфигураций безопасности
    include /etc/nginx/ocsp-stapling.conf;
    include /etc/nginx/hsts.conf;
    
    # Оптимизация SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;
    
    # WebSocket поддержка
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Таймауты для WebSocket
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_connect_timeout 60s;
    }
    
    # Логи
    access_log /var/log/nginx/ws.access.log;
    error_log /var/log/nginx/ws.error.log;
}
```

#### Активация конфигурации

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/normaldance-ssl.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2.5 Тестирование валидности сертификатов с помощью SSL Labs

Для музыкальной платформы NORMALDANCE регулярное тестирование SSL/TLS конфигурации критически важно для обеспечения безопасности и производительности.

#### Тестирование через SSL Labs Server Test

SSL Labs Server Test предоставляет comprehensive анализ SSL/TLS конфигурации.

```bash
# Запуск тестирования через curl
curl -s "https://api.ssllabs.com/api/v3/analyze?host=dnb1st.ru&all=done&startNew=on" | jq '.'

# Запуск тестирования для всех доменов
DOMAINS=("dnb1st.ru" "dnb1st.store" "api.dnb1st.ru" "ws.dnb1st.ru")

for domain in "${DOMAINS[@]}"; do
    echo "Testing $domain..."
    curl -s "https://api.ssllabs.com/api/v3/analyze?host=$domain&all=done&startNew=on" | jq '.'
    echo "----------------------------------------"
done
```

#### Интерпретация результатов теста

Основные показатели, на которые нужно обращать внимание:

| Показатель | Минимальный уровень | Оптимальный уровень | Описание |
|------------|-------------------|-------------------|----------|
| **Grade** | B | A+ | Общая оценка безопасности |
| **Protocol Support** | TLS 1.2 | TLS 1.3 | Поддержка протоколов |
| **Cipher Strength** | Strong | A+ | Сила шифрования |
| **Forward Secrecy** | Yes | Perfect | Совершенная прямая секретность |
| **HSTS** | Yes | Preload | HSTS статус |
| **OCSP Stapling** | Yes | Yes | OCSP Stapling статус |
| **Certificate Transparency** | Yes | Yes | Прозрачность сертификатов |

#### Автоматизация тестирования

Создадим скрипт для регулярного мониторинга SSL конфигурации:

```bash
# Скрипт для автоматического тестирования SSL
sudo nano /usr/local/bin/ssl-labs-monitor.sh
```

Содержимое скрипта:

```bash
#!/bin/bash
# /usr/local/bin/ssl-labs-monitor.sh

DOMAINS=("dnb1st.ru" "dnb1st.store" "api.dnb1st.ru" "ws.dnb1st.ru")
LOG_FILE="/var/log/ssl-labs-monitor.log"
ALERT_EMAIL="admin@dnb1st.ru"
MIN_GRADE="B"

echo "SSL Labs Monitor - $(date)" >> $LOG_FILE
echo "=====================================" >> $LOG_FILE

for domain in "${DOMAINS[@]}"; do
    echo "Testing $domain..." >> $LOG_FILE
    
    # Запрос тестирования
    ANALYSIS_ID=$(curl -s "https://api.ssllabs.com/api/v3/analyze?host=$domain&startNew=on" | jq -r '.status')
    
    # Ожидание завершения теста
    while [ "$ANALYSIS_ID" != "READY" ]; do
        sleep 30
        ANALYSIS_ID=$(curl -s "https://api.ssllabs.com/api/v3/analyze?host=$domain" | jq -r '.status')
    done
    
    # Получение результатов
    RESULTS=$(curl -s "https://api.ssllabs.com/api/v3/analyze?host=$domain&all=done")
    
    # Извлечение ключевых показателей
    GRADE=$(echo "$RESULTS" | jq -r '.endpoints[0].grade')
    PROTOCOLS=$(echo "$RESULTS" | jq -r '.endpoints[0].protocols[]')
    CIPHERS=$(echo "$RESULTS" | jq -r '.endpoints[0].suites[]')
    HSTS=$(echo "$RESULTS" | jq -r '.endpoints[0].hsts')
    OCSP=$(echo "$RESULTS" | jq -r '.endpoints[0].ocspStapling')
    
    echo "Domain: $domain" >> $LOG_FILE
    echo "Grade: $GRADE" >> $LOG_FILE
    echo "Protocols: $PROTOCOLS" >> $LOG_FILE
    echo "HSTS: $HSTS" >> $LOG_FILE
    echo "OCSP Stapling: $OCSP" >> $LOG_FILE
    echo "----------------------------------------" >> $LOG_FILE
    
    # Проверка минимального уровня оценки
    if [ "$GRADE" = "-" ] || [ "$GRADE" < "$MIN_GRADE" ]; then
        echo "⚠️  WARNING: $domain has grade $GRADE (minimum required: $MIN_GRADE)" >> $LOG_FILE
        echo "SSL Alert: $domain has grade $GRADE" | mail -s "SSL Alert for $domain" $ALERT_EMAIL
    else
        echo "✅ OK: $domain has grade $GRADE" >> $LOG_FILE
    fi
done

echo "SSL Labs Monitor completed - $(date)" >> $LOG_FILE
echo "" >> $LOG_FILE
```

Настройка прав доступа и cron-задачи:

```bash
sudo chmod +x /usr/local/bin/ssl-labs-monitor.sh

# Еженедельное тестирование SSL конфигурации
0 2 * * 0 /usr/local/bin/ssl-labs-monitor.sh
```

#### Тестирование с помощью OpenSSL

```bash
# Проверка SSL соединения
openssl s_client -connect dnb1st.ru:443 -servername dnb1st.ru < /dev/null

# Проверка цепочки сертификатов
openssl s_client -connect dnb1st.ru:443 -showcerts < /dev/null

# Проверка поддерживаемых протоколов
openssl s_client -connect dnb1st.ru:443 -tls1_2 < /dev/null
openssl s_client -connect dnb1st.ru:443 -tls1_3 < /dev/null

# Проверка поддерживаемых шифров
openssl s_client -connect dnb1st.ru:443 -cipher ECDHE-RSA-AES256-GCM-SHA384 < /dev/null
```

#### Тестирование производительности SSL

```bash
# Тестирование производительности SSL с помощью curl
curl -w "@curl-format.txt" -o /dev/null -s "https://dnb1st.ru"

# Формат для curl (curl-format.txt)
{
    "time_namelookup": %{time_namelookup},
    "time_connect": %{time_connect},
    "time_appconnect": %{time_appconnect},
    "time_pretransfer": %{time_pretransfer},
    "time_redirect": %{time_redirect},
    "time_starttransfer": %{time_starttransfer},
    "time_total": %{time_total},
    "size_download": %{size_download},
    "speed_download": %{speed_download}
}
```

#### Создание отчета о безопасности SSL

```bash
# Скрипт для генерации отчета о безопасности SSL
sudo nano /usr/local/bin/ssl-security-report.sh
```

Содержимое скрипта:

```bash
#!/bin/bash
# /usr/local/bin/ssl-security-report.sh

DOMAINS=("dnb1st.ru" "dnb1st.store" "api.dnb1st.ru" "ws.dnb1st.ru")
REPORT_FILE="/var/log/ssl-security-report-$(date +%Y%m%d).html"
EMAIL="admin@dnb1st.ru"

# Создание HTML отчета
cat > "$REPORT_FILE" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>SSL Security Report - NORMALDANCE</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .pass { color: green; }
        .fail { color: red; }
        .warning { color: orange; }
    </style>
</head>
<body>
    <h1>SSL Security Report - NORMALDANCE</h1>
    <p>Generated: $(date)</p>
    
    <table>
        <tr>
            <th>Domain</th>
            <th>Grade</th>
            <th>Protocol</th>
            <th>HSTS</th>
            <th>OCSP Stapling</th>
            <th>Forward Secrecy</th>
            <th>Status</th>
        </tr>
EOF

for domain in "${DOMAINS[@]}"; do
    # Получение данных через SSL Labs API
    RESULTS=$(curl -s "https://api.ssllabs.com/api/v3/analyze?host=$domain&all=done")
    
    # Извлечение показателей
    GRADE=$(echo "$RESULTS" | jq -r '.endpoints[0].grade')
    PROTOCOLS=$(echo "$RESULTS" | jq -r '.endpoints[0].protocols[]' | head -1)
    HSTS=$(echo "$RESULTS" | jq -r '.endpoints[0].hsts')
    OCSP=$(echo "$RESULTS" | jq -r '.endpoints[0].ocspStapling')
    FS=$(echo "$RESULTS" | jq -r '.endpoints[0].forwardSecrecy')
    
    # Определение статуса
    if [ "$GRADE" = "A+" ] || [ "$GRADE" = "A" ]; then
        STATUS="pass"
    elif [ "$GRADE" = "B" ] || [ "$GRADE" = "C" ]; then
        STATUS="warning"
    else
        STATUS="fail"
    fi
    
    # Добавление строки в таблицу
    cat >> "$REPORT_FILE" << EOF
        <tr>
            <td>$domain</td>
            <td class="$STATUS">$GRADE</td>
            <td>$PROTOCOLS</td>
            <td>$HSTS</td>
            <td>$OCSP</td>
            <td>$FS</td>
            <td class="$STATUS">$STATUS</td>
        </tr>
EOF
done

cat >> "$REPORT_FILE" << EOF
    </table>
</body>
</html>
EOF

# Отправка отчета по email
if command -v mailx &> /dev/null; then
    mailx -s "SSL Security Report - $(date +%Y-%m-%d)" -a "$REPORT_FILE" "$EMAIL" < /dev/null
else
    echo "SSL Security Report generated: $REPORT_FILE"
fi
```

Настройка cron-задачи для генерации отчетов:

```bash
# Ежемесячная генерация отчета о безопасности SSL
0 3 1 * * /usr/local/bin/ssl-security-report.sh
```

---

## 3. Введение

NORMALDANCE - это современная музыкальная платформа, объединяющая традиционные стриминговые сервисы с технологией блокчейн и NFT. Платформа предоставляет артистам и слушателям уникальные возможности для создания, распространения и монетизации музыкального контента.

### Цели руководства

Данное руководство предназначено для разработчиков, DevOps-инженеров и системных администраторов, отвечающих за развертывание и поддержку платформы NORMALDANCE. Основные цели руководства:

- Предоставить пошаговые инструкции по настройке окружения разработки
- Описать архитектуру инфраструктуры платформы
- Объяснить процесс контейнеризации и развертывания
- Документировать системы мониторинга и логирования
- Рассмотреть особенности мобильного приложения и Web3 интеграций

### Целевая аудитория

- Backend-разработчики
- Frontend-разработчики
- DevOps-инженеры
- Системные администратораторы
- QA-инженеры

---

## 2. Обзор проекта NORMALDANCE

NORMALDANCE - это комплексная музыкальная экосистема, построенная на современных технологических стеках. Платформа включает в себя:

### Основные компоненты

- **Веб-приложение**: React/Next.js фронтенд с поддержкой реального времени
- **Мобильное приложение**: React Native/Expo приложение для iOS и Android
- **Бэкенд API**: Node.js сервер с Socket.IO для WebSocket соединений
- **База данных**: Prisma + SQLite для разработки, PostgreSQL для продакшена
- **Блокчейн**: Solana программы для NFT и стейкинга
- **Мониторинг**: Prometheus + Grafana + Alertmanager
- **CI/CD**: GitLab CI/CD pipeline с автоматическим деплоем

### Ключевые особенности

- **NFT Marketplace**: Создание и торговля музыкальными NFT
- **Стейкинг**: Механизм вознаграждения для держателей токенов
- **Рекомендательная система**: Персонализированные рекомендации треков
- **Многоплатформенность**: Веб и мобильные приложения
- **Децентрализация**: Интеграция с блокчейном Solana

---

## 3. Архитектура инфраструктуры

### Общая архитектура

Платформа NORMALDANCE использует микросервисную архитектуру с следующими основными компонентами:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Mobile App    │    │   Admin Panel   │
│   (Next.js)     │◄──►│   (React Native)│◄──►│   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (Node.js)     │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   Blockchain    │    │   Monitoring    │
│   (PostgreSQL)  │    │   (Solana)      │    │   (Prometheus)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Технологический стек

**Frontend:**
- Next.js 14 с TypeScript
- React 18
- Socket.IO для реального времени
- Tailwind CSS для стилизации

**Backend:**
- Node.js с Express
- Prisma ORM
- SQLite (разработка) / PostgreSQL (продакшен)
- Socket.IO для WebSocket соединений

**Блокчейн:**
- Solana blockchain
- Anchor programs для NFT и стейкинга
- Phantom wallet integration

**Мониторинг:**
- Prometheus для сбора метрик
- Grafana для визуализации
- Alertmanager для оповещений

**DevOps:**
- Docker для контейнеризации
- Kubernetes для оркестрации
- GitLab CI/CD для автоматизации

```

### 2.6 Настройка шифровальных suites для максимальной безопасности и производительности

Для музыкальной платформы NORMALDANCE правильная настройка шифровальных suites критически важна для обеспечения безопасности аудио-потоков и высокой производительности.

#### Принципы выбора шифровальных suites

При выборе шифровальных suites для музыкальной платформы необходимо учитывать:

- **Безопасность**: Использование современных и безопасных алгоритмов шифрования
- **Производительность**: Оптимизация для потоковой передачи аудио
- **Совместимость**: Поддержка различных браузеров и устройств
- **Современные стандарты**: Соответствие текущим рекомендациям безопасности

#### Рекомендуемые шифровальные suites

Для музыкальной платформы NORMALDANCE рекомендуется следующий набор шифровальных suites:

```bash
# Конфигурация шифровальных suites для Nginx
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256';
ssl_prefer_server_ciphers off;
```

#### Детальная настройка шифровальных suites

```bash
# Создание конфигурации шифровальных suites
sudo nano /etc/nginx/ssl-ciphers.conf
```

Содержимое конфигурации:

```nginx
# /etc/nginx/ssl-ciphers.conf
# SSL Cipher Suites Configuration for NORMALDANCE

# Группа: Современные и безопасные шифры (Perfect Forward Secrecy)
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

# Группа: Дополнительные безопасные шифры
ssl_ciphers 'ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256';

# Группа: Устаревшие, но все еще безопасные шифры (для обратной совместимости)
ssl_ciphers 'AES256-GCM-SHA384:AES128-GCM-SHA256:AES256-SHA256:AES128-SHA256';

# Отключение слабых шифров
ssl_ciphers '!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA';

# Предпочтение серверных шифров
ssl_prefer_server_ciphers off;

# Включение Perfect Forward Secrecy
ssl_session_tickets off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;

# Оптимизация для аудио-потоков
ssl_buffer_size 4k;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
```

#### Конфигурация для аудио-стриминга

```bash
# Создание конфигурации для аудио-стриминга
sudo nano /etc/nginx/audio-streaming.conf
```

Содержимое конфигурации:

```nginx
# /etc/nginx/audio-streaming.conf
# Audio Streaming SSL Configuration for NORMALDANCE

# Оптимизация для аудио-потоков
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name stream.dnb1st.ru;
    
    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/stream.dnb1st.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stream.dnb1st.ru/privkey.pem;
    
    # Оптимизированные шифры для аудио-стриминга
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;
    
    # Оптимизация для потоковой передачи
    client_max_body_size 0;
    client_body_timeout 300s;
    client_header_timeout 300s;
    keepalive_timeout 75s;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    
    # Кэширование для аудио-файлов
    location ~* \.(mp3|wav|flac|aac|ogg|m4a)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS";
        add_header Access-Control-Allow-Headers "Range";
        
        # Оптимизация для потоковой передачи
        tcp_nodelay on;
        tcp_nopush on;
        sendfile on;
        
        # Поддержка Range запросов
        gzip off;
        chunked_transfer_encoding on;
        
        # Таймауты для аудио-потоков
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_connect_timeout 60s;
        
        # Буферизация для аудио
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # WebSocket для аудио-чата
    location /audio-chat/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Таймауты для WebSocket
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_connect_timeout 60s;
    }
}
```

#### Тестирование шифровальных suites

```bash
# Проверка поддерживаемых шифров
openssl s_client -connect dnb1st.ru:443 -cipher ECDHE-ECDSA-AES256-GCM-SHA384 < /dev/null

# Проверка всех поддерживаемых шифров
openssl s_client -connect dnb1st.ru:443 -tls1_2 < /dev/null | grep Cipher

# Тестирование производительности шифрования
openssl speed -evp aes-256-gcm
openssl speed -evp chacha20-poly1305
openssl speed -evp aes-128-gcm
```

#### Сравнение шифровальных suites

| Шифр | Ключ | Сложность | Безопасность | Производительность | Рекомендация |
|------|------|-----------|-------------|-------------------|--------------|
| ECDHE-ECDSA-AES256-GCM-SHA384 | 256 бит | Высокая | Отличная | Хорошая | Рекомендуется |
| ECDHE-ECDSA-CHACHA20-POLY1305 | 256 бит | Средняя | Отличная | Отличная | Рекомендуется |
| ECDHE-RSA-AES256-GCM-SHA384 | 256 бит | Высокая | Отличная | Хорошая | Рекомендуется |
| ECDHE-RSA-CHACHA20-POLY1305 | 256 бит | Средняя | Отличная | Отличная | Рекомендуется |
| AES256-GCM-SHA384 | 256 бит | Высокая | Хорошая | Хорошая | Допустимо |
| AES128-GCM-SHA256 | 128 бит | Средняя | Хорошая | Отличная | Допустимо |
| ECDHE-ECDSA-AES128-GCM-SHA256 | 128 бит | Средняя | Хорошая | Отличная | Допустимо |

#### Оптимизация для мобильных устройств

```bash
# Конфигурация для мобильных устройств
sudo nano /etc/nginx/mobile-ssl.conf
```

Содержимое конфигурации:

```nginx
# /etc/nginx/mobile-ssl.conf
# Mobile SSL Configuration for NORMALDANCE

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mobile.dnb1st.ru;
    
    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/mobile.dnb1st.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mobile.dnb1st.ru/privkey.pem;
    
    # Оптимизированные шифры для мобильных устройств
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256';
    ssl_prefer_server_ciphers off;
    
    # Оптимизация для мобильных устройств
    client_max_body_size 50M;
    client_body_timeout 300s;
    client_header_timeout 300s;
    keepalive_timeout 75s;
    
    # Поддержка мобильных браузеров
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Device-Type "mobile";
        
        # Оптимизация для мобильных сетей
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        
        # Сжатие для мобильных устройств
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_proxied any;
        gzip_comp_level 6;
        gzip_types
            text/plain
            text/css
            text/xml
            text/javascript
            application/json
            application/javascript
            application/xml+rss
            application/atom+xml
            image/svg+xml;
    }
}
```

#### Мониторинг производительности SSL

```bash
# Скрипт для мониторинга производительности SSL
sudo nano /usr/local/bin/ssl-performance-monitor.sh
```

Содержимое скрипта:

```bash
#!/bin/bash
# /usr/local/bin/ssl-performance-monitor.sh

DOMAINS=("dnb1st.ru" "dnb1st.store" "api.dnb1st.ru" "ws.dnb1st.ru" "stream.dnb1st.ru")
LOG_FILE="/var/log/ssl-performance-monitor.log"
ALERT_THRESHOLD=2000 # ms

echo "SSL Performance Monitor - $(date)" >> $LOG_FILE
echo "=====================================" >> $LOG_FILE

for domain in "${DOMAINS[@]}"; do
    echo "Testing $domain..." >> $LOG_FILE
    
    # Тестирование производительности SSL
    PERFORMANCE=$(curl -w "@curl-format.txt" -o /dev/null -s "https://$domain" | grep "time_appconnect")
    TIME_APPCONNECT=$(echo "$PERFORMANCE" | cut -d: -f2 | tr -d ' ')
    
    echo "SSL Handshake Time: $TIME_APPCONNECT ms" >> $LOG_FILE
    
    # Проверка пороговых значений
    if (( $(echo "$TIME_APPCONNECT > $ALERT_THRESHOLD" | bc -l) )); then
        echo "⚠️  WARNING: SSL handshake time for $domain is $TIME_APPCONNECT ms (threshold: $ALERT_THRESHOLD ms)" >> $LOG_FILE
        echo "SSL Performance Alert: $domain has slow SSL handshake" | mail -s "SSL Performance Alert" admin@dnb1st.ru
    else
        echo "✅ OK: SSL handshake time for $domain is $TIME_APPCONNECT ms" >> $LOG_FILE
    fi
    
    echo "----------------------------------------" >> $LOG_FILE
done

echo "SSL Performance Monitor completed - $(date)" >> $LOG_FILE
echo "" >> $LOG_FILE
```

Настройка cron-задачи для мониторинга производительности:

```bash
# Ежедневный мониторинг производительности SSL
0 4 * * * /usr/local/bin/ssl-performance-monitor.sh
```

---

## 4. Системные требования

### Требования для разработки

**Минимальные требования:**
- CPU: 4 ядра
- RAM: 8 GB
- HDD: 50 GB свободного места
- ОС: Windows 10/11, macOS 10.15+, Ubuntu 20.04+

**Рекомендуемые требования:**
- CPU: 8+ ядер
- RAM: 16+ GB
- SSD: 100+ GB свободного места
- ОС: Windows 11, macOS 12+, Ubuntu 22.04+

### Требования для продакшена

**Минимальные требования:**
- CPU: 8 ядер
- RAM: 16 GB
- HDD: 200 GB SSD
- ОС: Ubuntu 20.04 LTS / CentOS 8

**Рекомендуемые требования:**
- CPU: 16+ ядер
- RAM: 32+ GB
- SSD: 500+ GB
- ОС: Ubuntu 22.04 LTS
- Kubernetes кластер

---

## 5. Предварительные требования для развертывания

### Обязательные зависимости

**Node.js и npm:**
```bash
node --version    # v18.x или выше
npm --version     # v8.x или выше
```

**Docker и Docker Compose:**
```bash
docker --version     # v20.10 или выше
docker-compose --version  # v2.0 или выше
```

**Git:**
```bash
git --version  # v2.30 или выше
```

**Блокчейн инструменты:**
- Solana CLI
- Anchor CLI
- Phantom wallet

**Базы данных:**
- PostgreSQL 14+ (для продакшена)
- Redis (для кэширования)

### Сетевые требования

- **Порт 80**: HTTP трафик
- **Порт 443**: HTTPS трафик
- **Порт 3000**: Development сервер
- **Порт 5432**: PostgreSQL
- **Порт 6379**: Redis
- **Порт 9090**: Prometheus
- **Порт 3001**: Grafana

### SSL/TLS сертификаты

Для продакшена требуются SSL сертификаты:
- Let's Encrypt сертификаты (рекомендуется)
- Собственные корпоративные сертификаты
- Wildcard сертификаты для поддоменов

---

## 6. Настройка окружения разработки

### Клонирование репозитория

```bash
git clone https://gitlab.com/normaldance/normaldance.git
cd normaldance
```

### Установка Node.js зависимостей

```bash
# Установка зависимостей для основного приложения
npm install

# Установка зависимостей для мобильного приложения
cd mobile-app
npm install
cd ..

# Установка зависимостей для блокчейн программ
cd programs/ndt
npm install
cd ../../programs/staking
npm install
cd ../../programs/tracknft
npm install
```

### Настройка переменных окружения

Создайте файл `.env.local` в корневой директории:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# WebSocket
SOCKET_PORT=3001

# Blockchain
SOLANA_NETWORK="devnet"
PROGRAM_ID="your-program-id"

# Redis
REDIS_URL="redis://localhost:6379"

# Filecoin
FILENET_API_URL="https://api.filecoin.io"
```

### Инициализация базы данных

```bash
# Запуск миграций Prisma
npx prisma migrate dev

# Генерация Prisma клиента
npx prisma generate
```

### Запуск разработки

```bash
# Запуск основного приложения
npm run dev

# Запуск мобильного приложения (в отдельном терминале)
cd mobile-app
npm start

# Запуск WebSocket сервера
npm run websocket
```

---

## 7. Docker-контейнеризация

### Структура Docker-образов

Проект использует несколько Docker-образов:

- `Dockerfile`: Основной образ для Next.js приложения
- `Dockerfile.api`: API сервер
- `Dockerfile.websocket`: WebSocket сервер
- `Dockerfile.prod`: Оптимизированный образ для продакшена
- `Dockerfile.store`: Микросервис для хранения файлов

### Docker Compose конфигурации

Основные compose-файлы:

- `docker-compose.yml`: Разработка
- `docker-compose.prod.yml`: Продакшен
- `docker-compose.monitoring.yml`: Сервисы мониторинга
- `docker-compose.business.yml`: Бизнес-сервисы

### Зап контейнеров

```bash
# Разработка
docker-compose up -d

# Продакшен
docker-compose -f docker-compose.prod.yml up -d

# Мониторинг
docker-compose -f docker-compose.monitoring.yml up -d
```

### Оптимизация образов

- Использование многоэтапных сборок
- Кэширование слоев Docker
- Минимизация размера образов
- Безопасная конфигурация контейнеров

---

## 8. Настройка базы данных

### Архитектура базы данных

Используется Prisma ORM с поддержкой:
- SQLite для разработки
- PostgreSQL для продакшена
- Миграции для схемы
- Сеансы для кэширования

### Схема базы данных

Основные модели:
- `User`: Пользователи платформы
- `Track`: Музыкальные треки
- `NFT`: NFT токены
- `Stake`: Стейкинг записи
- `Playlist`: Плейлисты
- `Artist`: Артисты

### Миграции и seeding

```bash
# Создание миграции
npx prisma migrate create --name init

# Применение миграций
npx prisma migrate deploy

# Заполнение тестовыми данными
npx prisma db seed
```

### Оптимизация производительности

- Индексация часто используемых полей
- Оптимизация запросов
- Кэширование с помощью Redis
- Репликация для чтения

---

## 9. Мониторинг и логирование

### Архитектура мониторинга

**Prometheus:**
- Сбор метрик приложений
- Хранение временных рядов
- Алертинг на основе правил

**Grafana:**
- Визуализация метрик
- Панели мониторинга
- Отчеты и дашборды

**Alertmanager:**
- Управление оповещениями
- Маршрутизация уведомлений
- Интеграция с внешними системами

### Настройка мониторинга

```bash
# Запуск Prometheus
docker-compose -f docker-compose.monitoring.yml up prometheus

# Запуск Grafana
docker-compose -f docker-compose.monitoring.yml up grafana

# Запуск Alertmanager
docker-compose -f docker-compose.monitoring.yml up alertmanager
```

### Логирование

- Структурированные логи в JSON формате
- Агрегация логов с помощью Fluentd
- Хранение в Elasticsearch
- Поиск и анализ с Kibana

### Ключевые метрики

- Метрики производительности
- Метрики безопасности
- Метрики бизнес-показателей
- Метрики пользовательской активности

---

## 10. Деплой и CI/CD

### CI/CD Pipeline

GitLab CI/CD pipeline включает:

- Сборка и тестирование
- Docker-образы
- Деплой в staging
- Автоматический деплой в продакшен
- Мониторинг развертывания

### Стадии pipeline

1. **Сборка**: Компиляция TypeScript, сборка Docker-образов
2. **Тестирование**: Unit, интеграционные, E2E тесты
3. **Сканирование**: Безопасность, уязвимости
4. **Деплой**: Staging окружение
5. **Проверка**: Ручная проверка
6. **Продакшен**: Автоматический деплой

### Скрипты развертывания

```bash
# Ручной деплой
./deploy/scripts/deploy.sh

# Автоматический деплой через GitLab CI
git push origin main

# Откат развертывания
./deploy/scripts/rollback.sh
```

### Конфигурация Nginx

- Обратный прокси для Next.js
- SSL termination
- Load balancing
- Кэширование статических файлов

---

## 11. WebSocket и реальное время

### Архитектура WebSocket

Используется Socket.IO для:
- Реального времени уведомлений
- Онлайн-статуса пользователей
- Чата и комментариев
- Совместного прослушивания

### Компоненты WebSocket

- **Socket.IO сервер**: Node.js сервер
- **Клиентская библиотека**: React/React Native
- **Мiddleware**: Аутентификация и авторизация
- **Обработчики событий**: Логика обработки сообщений

### Настройка WebSocket

```bash
# Запуск WebSocket сервера
npm run websocket

# Тестирование соединения
curl -X GET http://localhost:3001/socket.io/
```

### Производительность WebSocket

- Подключения через WebSocket
- Fallback на HTTP long-polling
- Оптимизация сообщений
- Управление состоянием соединений

---

## 12. Мобильное приложение

### Технологический стек

- **React Native**: Кроссплатформенная разработка
- **Expo**: Разработка и сборка
- **Socket.IO**: Реальное время
- **Redux Toolkit**: Управление состоянием
- **React Navigation**: Навигация

### Структура приложения

```
mobile-app/
├── src/
│   ├── components/     # Компоненты UI
│   ├── screens/        # Экраны приложения
│   ├── navigation/     # Навигация
│   ├── services/       # API сервисы
│   ├── hooks/          # Кастомные хуки
│   └── lib/           # Утилиты и конфигурация
├── assets/            # Ресурсы
└── package.json       # Зависимости
```

### Настройка разработки

```bash
# Установка Expo CLI
npm install -g @expo/cli

# Запуск приложения
cd mobile-app
npm start
```

### Сборка для продакшена

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

---

## 13. Web3 и блокчейн интеграция

### Solana программы

Основные программы:
- **TrackNFT**: Создание NFT для треков
- **Staking**: Система стейкинга
- **NDT**: Токен платформы

### Настройка блокчейна

```bash
# Установка Solana CLI
sh -c "$(curl -sSf https://release.solana.com/stable/install)"

# Инициализация кошелька
solana-keygen new --outfile ~/.config/solana/id.json

# Деплой программ
anchor deploy
```

### Кошелек Phantom

- Интеграция с Phantom wallet
- Транзакции через Web3
- Управление NFT
- Стейкинг токенов

### Безопасность блокчейна

- Тестирование смарт-контрактов
- Аудит безопасности
- Валидация транзакций
- Резервное копирование кошельков

---

## 14. Безопасность

### Архитектура безопасности

- **Аутентификация**: NextAuth.js
- **Авторизация**: Ролевая модель
- **Шифрование**: TLS 1.3
- **Защита от DDoS**: Cloudflare
- **Валидация ввода**: Zod схемы

### Практики безопасности

- Регулярные обновления зависимостей
- Сканирование уязвимостей
- Тестирование на проникновение
- Безопасная разработка (DevSecOps)

### Защита данных

- Шифрование данных в покое
- Хеширование паролей
- Защита персональных данных
- Соответствие GDPR

---

## 15. Оптимизация производительности

### Frontend оптимизация

- Code splitting и lazy loading
- Оптимизация изображений
- Кэширование браузера
- Service Worker

### Backend оптимизация

- Кэширование Redis
- Оптимизация запросов к БД
- Пул соединений
- Асинхронная обработка

### База данных оптимизация

- Индексация
- Оптимизация запросов
- Репликация
- Шардинг

---

## Приложение A. Список Docker-образов

| Образ | Описание | Базовый образ | Размер |
|-------|----------|---------------|--------|
| `normaldance/web` | Веб-приложение Next.js | node:18-alpine | ~500MB |
| `normaldance/api` | API сервер | node:18-alpine | ~400MB |
| `normaldance/websocket` | WebSocket сервер | node:18-alpine | ~350MB |
| `normaldance/monitoring` | Prometheus | prom/prometheus | ~200MB |
| `normaldance/grafana` | Grafana | grafana/grafana | ~300MB |

---

## Приложение B. Конфигурационные файлы

### Основные конфигурационные файлы

- `docker-compose.yml` - Конфигурация Docker для разработки
- `docker-compose.prod.yml` - Конфигурация для продакшена
- `config/monitoring-config.json` - Конфигурация мониторинга
- `config/secrets-config.json` - Секреты конфигурации
- `deploy/nginx/dnb1st.ru.conf` - Nginx конфигурация

### Файлы окружения

- `.env.example` - Пример файла окружения
- `.env.local` - Локальное окружение
- `.env.production` - Продакшен окружение

---

## Приложение C. Скрипты развертывания

### Основные скрипты

- `deploy/scripts/deploy.sh` - Основной скрипт развертывания
- `deploy/scripts/server-setup.sh` - Настройка сервера
- `deploy/scripts/ssl-setup.sh` - Настройка SSL
- `deploy/docker/docker-compose.yml` - Docker конфигурация

### Автоматизация

- GitLab CI/CD pipeline
- Автоматические обновления
- Резервное копирование
- Мониторинг развертывания

---

## Приложение D. Тестирование

### Типы тестов

- **Unit тесты**: Jest + React Testing Library
- **Интеграционные тесты**: Supertest
- **E2E тесты**: Cypress
- **Тестирование производительности**: K6
- **Тестирование безопасности**: OWASP ZAP

### Конфигурация тестов

- `jest.config.js` - Конфигурация Jest
- `tests/unit/` - Unit тесты
- `tests/integration/` - Интеграционные тесты
- `tests/e2e/` - E2E тесты

### Запуск тестов

```bash
# Unit тесты
npm test

# Интеграционные тесты
npm run test:integration

# E2E тесты
npm run test:e2e

# Тестирование производительности
npm run test:performance