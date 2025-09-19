# NORMALDANCE - Полное руководство по настройке музыкальной платформы

## 📋 Интерактивное оглавление

- [1. Введение и архитектура платформы](#1-введение-и-архитектура-платформы)
  - [1.1 Обзор архитектуры микросервисов](#11-обзор-архитектуры-микросервисов)
  - [1.2 Технологический стек](#12-технологический-стек)
  - [1.3 Масштабируемость и отказоустойчивость](#13-масштабируемость-и-отказоустойчивость)
- [2. SSL/TLS сертификаты и безопасность HTTPS](#2-ssltls-сертификаты-и-безопасность-https)
  - [2.1 Генерация CSR и Let's Encrypt с DNS-валидацией](#21-генерация-csr-и-lets-encrypt-с-dns-валидацией)
  - [2.2 Автоматическое обновление сертификатов](#22-автоматическое-обновление-сертификатов)
  - [2.3 OCSP Stapling и HSTS](#23-ocsp-stapling-и-hsts)
  - [2.4 Тестирование SSL Labs](#24-тестирование-ssl-labs)
  - [2.5 Шифровальные suites](#25-шифровальные-suites)
  - [2.6 HTTP/2 и HTTP/3 поддержка](#26-http2-и-http3-поддержка)
- [3. Инфраструктура и развертывание](#3-инфраструктура-и-развертывание)
  - [3.1 CI/CD конвейер](#31-cicd-конвейер)
  - [3.2 Docker и Kubernetes](#32-docker-и-kubernetes)
  - [3.3 Ansible конфигурации](#33-ansible-конфигурации)
  - [3.4 Мониторинг ресурсов](#34-мониторинг-ресурсов)
- [4. Базовая настройка и окружение](#4-базовая-настройка-и-окружение)
  - [4.1 PostgreSQL и Redis](#41-postgresql-и-redis)
  - [4.2 Объектное хранилище](#42-объектное-хранилище)
  - [4.3 CDN конфигурация](#43-cdn-конфигурация)
  - [4.4 Балансировщики нагрузки](#44-балансировщики-нагрузки)
- [5. Аутентификация и авторизация](#5-аутентификация-и-авторизация)
- [6. Обработка аудио и метаданных](#6-обработка-аудио-и-метаданных)
- [7. API разработка и документация](#7-api-разработка-и-документация)
- [8. Реализация медиасервера](#8-реализация-медиасервера)
- [9. Мониторинг и observability](#9-мониторинг-и-observability)
- [10. Оптимизация производительности](#10-оптимизация-производительности)
- [11. Пользовательские системы и монетизация](#11-пользовательские-системы-и-монетизация)
- [12. Контент-доставка и управление](#12-контент-доставка-и-управление)
- [Приложения](#приложения)

---

## 1. Введение и архитектура платформы

### 1.1 Обзор архитектуры микросервисов

NORMALDANCE построена на основе микросервисной архитектуры, обеспечивающей высокую масштабируемость и отказоустойчивость для музыкальной платформы.

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Web App - Next.js]
        MOBILE[Mobile App - React Native]
        ADMIN[Admin Panel]
    end
    
    subgraph "API Gateway"
        GATEWAY[Nginx + Kong]
    end
    
    subgraph "Microservices"
        AUTH[Auth Service]
        MUSIC[Music Service]
        USER[User Service]
        PAYMENT[Payment Service]
        STREAM[Streaming Service]
        NFT[NFT Service]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis)]
        S3[(Object Storage)]
        BLOCKCHAIN[Solana Blockchain]
    end
    
    WEB --> GATEWAY
    MOBILE --> GATEWAY
    ADMIN --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> MUSIC
    GATEWAY --> USER
    GATEWAY --> PAYMENT
    GATEWAY --> STREAM
    GATEWAY --> NFT
    
    AUTH --> POSTGRES
    MUSIC --> POSTGRES
    USER --> POSTGRES
    PAYMENT --> POSTGRES
    
    STREAM --> REDIS
    MUSIC --> S3
    NFT --> BLOCKCHAIN
```

#### Основные микросервисы

| Сервис | Назначение | Технологии | Порт |
|--------|------------|------------|------|
| **Auth Service** | Аутентификация и авторизация | Node.js, JWT, OAuth2 | 3001 |
| **Music Service** | Управление треками и метаданными | Node.js, FFmpeg, ID3 | 3002 |
| **User Service** | Профили пользователей | Node.js, Prisma | 3003 |
| **Payment Service** | Платежи и подписки | Node.js, Stripe, PayPal | 3004 |
| **Streaming Service** | Аудио стриминг | Node.js, WebSocket, HLS | 3005 |
| **NFT Service** | Блокчейн интеграция | Node.js, Solana Web3.js | 3006 |

### 1.2 Технологический стек

#### Backend Stack
```yaml
Runtime: Node.js 18+
Framework: Express.js, Fastify
Database: PostgreSQL 14+, Redis 7+
ORM: Prisma
Authentication: JWT, OAuth 2.0, OpenID Connect
Message Queue: Redis Pub/Sub, Bull Queue
File Storage: AWS S3, MinIO
Search: Elasticsearch
Monitoring: Prometheus, Grafana
```

#### Frontend Stack
```yaml
Web: Next.js 14, React 18, TypeScript
Mobile: React Native, Expo
State Management: Zustand, React Query
UI Framework: Tailwind CSS, Headless UI
Real-time: Socket.IO, WebRTC
Audio: Web Audio API, Howler.js
```

#### Infrastructure Stack
```yaml
Containerization: Docker, Docker Compose
Orchestration: Kubernetes, Helm
CI/CD: GitHub Actions, GitLab CI
Reverse Proxy: Nginx, Traefik
Load Balancer: HAProxy, Nginx
CDN: CloudFlare, AWS CloudFront
Monitoring: Prometheus, Grafana, Jaeger
```

### 1.3 Масштабируемость и отказоустойчивость

#### Горизонтальное масштабирование
```yaml
# kubernetes/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: music-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: music-service
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Circuit Breaker Pattern
```javascript
// services/circuit-breaker.js
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
  rollingCountTimeout: 10000,
  rollingCountBuckets: 10
};

const musicServiceBreaker = new CircuitBreaker(callMusicService, options);

musicServiceBreaker.fallback(() => ({
  error: 'Music service temporarily unavailable',
  cached: true
}));

async function callMusicService(trackId) {
  const response = await fetch(`http://music-service:3002/tracks/${trackId}`);
  if (!response.ok) throw new Error('Service unavailable');
  return response.json();
}
```

---

## 2. SSL/TLS сертификаты и безопасность HTTPS

### 2.1 Генерация CSR и Let's Encrypt с DNS-валидацией

#### Установка Certbot с DNS плагинами
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx python3-certbot-dns-cloudflare

# CentOS/RHEL
sudo dnf install certbot python3-certbot-nginx python3-certbot-dns-cloudflare
```

#### Конфигурация DNS API
```bash
# ~/.secrets/cloudflare.ini
dns_cloudflare_email = admin@dnb1st.ru
dns_cloudflare_api_key = your_global_api_key_here

# Или используйте API Token (рекомендуется)
dns_cloudflare_api_token = your_api_token_here

chmod 600 ~/.secrets/cloudflare.ini
```

#### Получение wildcard сертификатов
```bash
# Wildcard сертификат для всех поддоменов
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 60 \
  -d dnb1st.ru \
  -d "*.dnb1st.ru" \
  -d dnb1st.store \
  -d "*.dnb1st.store" \
  --email admin@dnb1st.ru \
  --agree-tos \
  --non-interactive

# Проверка полученных сертификатов
sudo certbot certificates
```

### 2.2 Автоматическое обновление сертификатов

#### Настройка автообновления
```bash
# Создание systemd timer для автообновления
sudo tee /etc/systemd/system/certbot-renewal.service << EOF
[Unit]
Description=Certbot Renewal
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
User=root
EOF

sudo tee /etc/systemd/system/certbot-renewal.timer << EOF
[Unit]
Description=Run certbot twice daily
Requires=certbot-renewal.service

[Timer]
OnCalendar=*-*-* 00,12:00:00
RandomizedDelaySec=3600
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Активация timer
sudo systemctl daemon-reload
sudo systemctl enable certbot-renewal.timer
sudo systemctl start certbot-renewal.timer
```

#### Скрипт проверки и обновления
```bash
#!/bin/bash
# scripts/ssl-renewal.sh

LOG_FILE="/var/log/certbot-renewal.log"
DOMAINS=("dnb1st.ru" "dnb1st.store")

echo "$(date): Starting SSL certificate renewal check" >> $LOG_FILE

# Проверка срока действия сертификатов
for domain in "${DOMAINS[@]}"; do
    EXPIRY_DATE=$(openssl x509 -in /etc/letsencrypt/live/$domain/cert.pem -noout -enddate | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    echo "$(date): $domain expires in $DAYS_UNTIL_EXPIRY days" >> $LOG_FILE
    
    if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
        echo "$(date): Certificate for $domain expires soon, attempting renewal" >> $LOG_FILE
        certbot renew --cert-name $domain --deploy-hook "systemctl reload nginx"
    fi
done

echo "$(date): SSL certificate renewal check completed" >> $LOG_FILE
```

### 2.3 OCSP Stapling и HSTS

#### Nginx конфигурация с OCSP Stapling
```nginx
# /etc/nginx/sites-available/dnb1st.ru
server {
    listen 443 ssl http2;
    server_name dnb1st.ru www.dnb1st.ru;
    
    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/dnb1st.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dnb1st.ru/privkey.pem;
    
    # SSL протоколы и шифры
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/dnb1st.ru/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # HSTS с preload
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    
    # Дополнительные заголовки безопасности
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # CSP для музыкальной платформы
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.gstatic.com; style-src 'self' 'unsafe-inline' *.googleapis.com; img-src 'self' data: *.cloudfront.net *.amazonaws.com; media-src 'self' *.cloudfront.net *.amazonaws.com; connect-src 'self' wss: *.solana.com *.phantom.app; font-src 'self' *.googleapis.com *.gstatic.com;" always;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2.4 Тестирование SSL Labs

#### Автоматическая проверка SSL
```bash
#!/bin/bash
# scripts/ssl-test.sh

DOMAINS=("dnb1st.ru" "dnb1st.store")
API_URL="https://api.ssllabs.com/api/v3"

for domain in "${DOMAINS[@]}"; do
    echo "Testing SSL configuration for $domain..."
    
    # Запуск анализа
    curl -s "$API_URL/analyze?host=$domain&publish=off&startNew=on" > /dev/null
    
    # Ожидание завершения анализа
    while true; do
        RESULT=$(curl -s "$API_URL/analyze?host=$domain")
        STATUS=$(echo $RESULT | jq -r '.status')
        
        if [ "$STATUS" = "READY" ]; then
            GRADE=$(echo $RESULT | jq -r '.endpoints[0].grade')
            echo "$domain: Grade $GRADE"
            break
        elif [ "$STATUS" = "ERROR" ]; then
            echo "$domain: Analysis failed"
            break
        else
            echo "Waiting for analysis to complete..."
            sleep 30
        fi
    done
done
```

### 2.5 Шифровальные suites

#### Оптимальная конфигурация шифров
```nginx
# Современные шифры для максимальной безопасности
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

# Отключение слабых шифров
ssl_ciphers '!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA';

# DH параметры для Perfect Forward Secrecy
ssl_dhparam /etc/nginx/dhparam.pem;

# Генерация DH параметров
# openssl dhparam -out /etc/nginx/dhparam.pem 4096
```

### 2.6 HTTP/2 и HTTP/3 поддержка

#### HTTP/2 конфигурация
```nginx
server {
    listen 443 ssl http2;
    
    # HTTP/2 Push для критических ресурсов
    location = / {
        http2_push /css/main.css;
        http2_push /js/app.js;
        http2_push /fonts/inter.woff2;
        proxy_pass http://127.0.0.1:3000;
    }
    
    # Оптимизация для HTTP/2
    http2_max_field_size 16k;
    http2_max_header_size 32k;
}
```

#### HTTP/3 (QUIC) поддержка
```nginx
# Требует Nginx с модулем QUIC
server {
    listen 443 ssl http2;
    listen 443 http3 reuseport;
    
    # Alt-Svc заголовок для HTTP/3
    add_header Alt-Svc 'h3=":443"; ma=86400' always;
    
    # QUIC конфигурация
    ssl_early_data on;
    quic_retry on;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 3. Инфраструктура и развертывание

### 3.1 CI/CD конвейер

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy NORMALDANCE

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: normaldance

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: normaldance_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:unit
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/normaldance_test
        REDIS_URL: redis://localhost:6379
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/normaldance_test
        REDIS_URL: redis://localhost:6379
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/normaldance_test

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      id: build
      uses: docker/build-push-action@v4
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
    - name: Deploy to staging
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.STAGING_USER }}
        key: ${{ secrets.STAGING_SSH_KEY }}
        script: |
          cd /opt/normaldance
          docker-compose pull
          docker-compose up -d
          docker system prune -f

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        script: |
          cd /opt/normaldance
          
          # Blue-Green Deployment
          docker-compose -f docker-compose.blue.yml pull
          docker-compose -f docker-compose.blue.yml up -d
          
          # Health check
          sleep 30
          if curl -f http://localhost:3001/health; then
            # Switch traffic
            docker-compose down
            mv docker-compose.yml docker-compose.green.yml
            mv docker-compose.blue.yml docker-compose.yml
            docker-compose up -d
            
            # Cleanup
            docker-compose -f docker-compose.green.yml down
            docker system prune -f
          else
            echo "Health check failed"
            docker-compose -f docker-compose.blue.yml down
            exit 1
          fi
```

### 3.2 Docker и Kubernetes

#### Multi-stage Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
RUN apk add --no-cache \
    ffmpeg \
    imagemagick \
    dumb-init

WORKDIR /app

# Создание пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S normaldance -u 1001

# Копирование файлов
COPY --from=base --chown=normaldance:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=normaldance:nodejs /app/dist ./dist
COPY --from=builder --chown=normaldance:nodejs /app/public ./public
COPY --chown=normaldance:nodejs package.json ./

USER normaldance

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

#### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: normaldance-app
  labels:
    app: normaldance
spec:
  replicas: 3
  selector:
    matchLabels:
      app: normaldance
  template:
    metadata:
      labels:
        app: normaldance
    spec:
      containers:
      - name: normaldance
        image: ghcr.io/normaldance:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: normaldance-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: normaldance-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: normaldance-service
spec:
  selector:
    app: normaldance
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

### 3.3 Ansible конфигурации

#### Playbook для развертывания
```yaml
# ansible/deploy.yml
---
- name: Deploy NORMALDANCE
  hosts: production
  become: yes
  vars:
    app_name: normaldance
    app_user: normaldance
    app_dir: /opt/normaldance
    docker_compose_version: "2.20.0"

  tasks:
  - name: Create application user
    user:
      name: "{{ app_user }}"
      system: yes
      shell: /bin/bash
      home: "{{ app_dir }}"
      create_home: yes

  - name: Install Docker
    apt:
      name: docker.io
      state: present
      update_cache: yes

  - name: Install Docker Compose
    get_url:
      url: "https://github.com/docker/compose/releases/download/v{{ docker_compose_version }}/docker-compose-linux-x86_64"
      dest: /usr/local/bin/docker-compose
      mode: '0755'

  - name: Add user to docker group
    user:
      name: "{{ app_user }}"
      groups: docker
      append: yes

  - name: Create application directory
    file:
      path: "{{ app_dir }}"
      state: directory
      owner: "{{ app_user }}"
      group: "{{ app_user }}"
      mode: '0755'

  - name: Copy docker-compose files
    template:
      src: "{{ item }}.j2"
      dest: "{{ app_dir }}/{{ item }}"
      owner: "{{ app_user }}"
      group: "{{ app_user }}"
      mode: '0644'
    loop:
      - docker-compose.yml
      - .env
    notify: restart application

  - name: Copy nginx configuration
    template:
      src: nginx.conf.j2
      dest: /etc/nginx/sites-available/{{ app_name }}
      backup: yes
    notify: reload nginx

  - name: Enable nginx site
    file:
      src: /etc/nginx/sites-available/{{ app_name }}
      dest: /etc/nginx/sites-enabled/{{ app_name }}
      state: link
    notify: reload nginx

  - name: Start application
    docker_compose:
      project_src: "{{ app_dir }}"
      state: present
    become_user: "{{ app_user }}"

  handlers:
  - name: restart application
    docker_compose:
      project_src: "{{ app_dir }}"
      restarted: yes
    become_user: "{{ app_user }}"

  - name: reload nginx
    systemd:
      name: nginx
      state: reloaded
```

### 3.4 Мониторинг ресурсов

#### Prometheus конфигурация
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'normaldance-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

---

## 4. Базовая настройка и окружение

### 4.1 PostgreSQL и Redis

#### PostgreSQL конфигурация для музыкальной платформы
```sql
-- Создание базы данных и пользователя
CREATE DATABASE normaldance;
CREATE USER normaldance_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE normaldance TO normaldance_user;

-- Подключение к базе данных
\c normaldance;

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Схема для музыкальных данных
CREATE SCHEMA music;
CREATE SCHEMA users;
CREATE SCHEMA payments;

-- Таблица треков с оптимизированными индексами
CREATE TABLE music.tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    genre VARCHAR(100),
    duration INTEGER, -- в секундах
    bitrate INTEGER,
    sample_rate INTEGER,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Полнотекстовый поиск
CREATE INDEX idx_tracks_search ON music.tracks USING GIN (
    to_tsvector('russian', title || ' ' || artist || ' ' || COALESCE(album, ''))
);

-- Индексы для быстрого поиска
CREATE INDEX idx_tracks_artist_gin ON music.tracks USING GIN (artist gin_trgm_ops);
CREATE INDEX idx_tracks_title_gin ON music.tracks USING GIN (title gin_trgm_ops);
CREATE INDEX idx_tracks_genre ON music.tracks (genre);
CREATE INDEX idx_tracks_duration ON music.tracks (duration);
CREATE INDEX idx_tracks_metadata ON music.tracks USING GIN (metadata);

-- Партиционирование по дате
CREATE TABLE music.tracks_2024 PARTITION OF music.tracks
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

#### PostgreSQL оптимизация
```bash
# /etc/postgresql/14/main/postgresql.conf

# Память
shared_buffers = 512MB
effective_cache_size = 2GB
maintenance_work_mem = 128MB
work_mem = 16MB

# Checkpoint
checkpoint_completion_target = 0.9
wal_buffers = 16MB
checkpoint_timeout = 10min
max_wal_size = 2GB

# Производительность
random_page_cost = 1.1
effective_io_concurrency = 200
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8

# Логирование
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
```

#### Redis конфигурация
```bash
# /etc/redis/redis.conf

# Основные настройки
bind 127.0.0.1
port 6379
timeout 300
keepalive 60

# Память
maxmemory 1gb
maxmemory-policy allkeys-lru

# Персистентность
save 900 1
save 300 10
save 60 10000

# AOF
appendonly yes
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Производительность
tcp-keepalive 300
tcp-backlog 511
databases 16
```

### 4.2 Объектное хранилище

#### MinIO конфигурация
```yaml
# docker-compose.minio.yml
version: '3.8'

services:
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: normaldance
      MINIO_ROOT_PASSWORD: secure_password_123
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  minio-client:
    image: minio/mc:latest
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      sleep 10;
      /usr/bin/mc alias set myminio http://minio:9000 normaldance secure_password_123;
      /usr/bin/mc mb myminio/music-files;
      /usr/bin/mc mb myminio/user-uploads;
      /usr/bin/mc mb myminio/thumbnails;
      /usr/bin/mc policy set public myminio/thumbnails;
      exit 0;
      "

volumes:
  minio_data:
```

#### S3 интеграция
```javascript
// services/storage.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Конфигурация для загрузки музыкальных файлов
const musicUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_MUSIC_BUCKET,
    acl: 'private',
    key: function (req, file, cb) {
      const userId = req.user.id;
      const timestamp = Date.now();
      const extension = file.originalname.split('.').pop();
      cb(null, `music/${userId}/${timestamp}.${extension}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// Генерация подписанных URL для приватного доступа
function generateSignedUrl(key, expiresIn = 3600) {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.S3_MUSIC_BUCKET,
    Key: key,
    Expires: expiresIn
  });
}

module.exports = {
  musicUpload,
  generateSignedUrl,
  s3
};
```

### 4.3 CDN конфигурация

#### CloudFlare настройка
```javascript
// config/cloudflare.js
const cloudflare = require('cloudflare');

const cf = cloudflare({
  token: process.env.CLOUDFLARE_API_TOKEN
});

// Настройка кэширования для музыкальных файлов
async function configureCaching() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  
  // Правила кэширования для аудио файлов
  await cf.zones.settings.edit(zoneId, 'cache_level', {
    value: 'aggressive'
  });
  
  // Page Rules для музыкальных файлов
  await cf.zones.pagerules.create(zoneId, {
    targets: [{
      target: 'url',
      constraint: {
        operator: 'matches',
        value: '*.dnb1st.ru/audio/*'
      }
    }],
    actions: [{
      id: 'cache_level',
      value: 'cache_everything'
    }, {
      id: 'edge_cache_ttl',
      value: 2592000 // 30 дней
    }, {
      id: 'browser_cache_ttl',
      value: 86400 // 1 день
    }]
  });
}

module.exports = { configureCaching };
```

### 4.4 Балансировщики нагрузки

#### HAProxy конфигурация
```bash
# /etc/haproxy/haproxy.cfg
global
    daemon
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog
    option dontlognull
    option redispatch
    retries 3

# Frontend для веб-трафика
frontend web_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/dnb1st.ru.pem
    redirect scheme https if !{ ssl_fc }
    
    # ACL для разных сервисов
    acl is_api path_beg /api/
    acl is_websocket hdr(Upgrade) -i websocket
    acl is_streaming path_beg /stream/
    
    # Маршрутизация
    use_backend api_backend if is_api
    use_backend websocket_backend if is_websocket
    use_backend streaming_backend if is_streaming
    default_backend web_backend

# Backend для основного приложения
backend web_backend
    balance roundrobin
    option httpchk GET /health
    server web1 127.0.0.1:3000 check
    server web2 127.0.0.1:3001 check
    server web3 127.0.0.1:3002 check

# Backend для API
backend api_backend
    balance leastconn
    option httpchk GET /api/health
    server api1 127.0.0.1:4000 check
    server api2 127.0.0.1:4001 check

# Backend для WebSocket
backend websocket_backend
    balance source
    option httpchk GET /ws/health
    server ws1 127.0.0.1:5000 check
    server ws2 127.0.0.1:5001 check

# Backend для стриминга
backend streaming_backend
    balance leastconn
    option httpchk GET /stream/health
    server stream1 127.0.0.1:6000 check
    server stream2 127.0.0.1:6001 check

# Статистика
listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
    stats admin if TRUE
```

---

## 5. Аутентификация и авторизация

### OAuth 2.0 и OpenID Connect
```javascript
// services/auth.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// Google OAuth стратегия
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// JWT стратегия
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));
```

---

## 6. Обработка аудио и метаданных

### FFmpeg интеграция
```javascript
// services/audio-processor.js
const ffmpeg = require('fluent-ffmpeg');
const NodeID3 = require('node-id3');

class AudioProcessor {
  async processAudioFile(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioCodec('libmp3lame')
        .audioBitrate(320)
        .audioFrequency(44100)
        .audioChannels(2)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .save(outputPath);
    });
  }

  async extractMetadata(filePath) {
    const tags = NodeID3.read(filePath);
    const probe = await this.probeFile(filePath);
    
    return {
      title: tags.title,
      artist: tags.artist,
      album: tags.album,
      genre: tags.genre,
      year: tags.year,
      duration: probe.format.duration,
      bitrate: probe.format.bit_rate,
      sampleRate: probe.streams[0].sample_rate
    };
  }

  probeFile(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  }
}
```

---

## 7. API разработка и документация

### OpenAPI спецификация
```yaml
# api/openapi.yml
openapi: 3.0.0
info:
  title: NORMALDANCE API
  version: 1.0.0
  description: API для музыкальной платформы NORMALDANCE

paths:
  /api/tracks:
    get:
      summary: Получить список треков
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Список треков
          content:
            application/json:
              schema:
                type: object
                properties:
                  tracks:
                    type: array
                    items:
                      $ref: '#/components/schemas/Track'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

components:
  schemas:
    Track:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        artist:
          type: string
        duration:
          type: integer
        createdAt:
          type: string
          format: date-time
```

---

## 8. Реализация медиасервера

### Icecast конфигурация
```xml
<!-- /etc/icecast2/icecast.xml -->
<icecast>
    <location>Russia</location>
    <admin>admin@dnb1st.ru</admin>
    
    <limits>
        <clients>1000</clients>
        <sources>10</sources>
        <queue-size>524288</queue-size>
        <client-timeout>30</client-timeout>
        <header-timeout>15</header-timeout>
        <source-timeout>10</source-timeout>
        <burst-on-connect>1</burst-on-connect>
        <burst-size>65535</burst-size>
    </limits>
    
    <authentication>
        <source-password>source_password</source-password>
        <relay-password>relay_password</relay-password>
        <admin-user>admin</admin-user>
        <admin-password>admin_password</admin-password>
    </authentication>
    
    <hostname>stream.dnb1st.ru</hostname>
    
    <listen-socket>
        <port>8000</port>
    </listen-socket>
    
    <mount type="normal">
        <mount-name>/live</mount-name>
        <password>mount_password</password>
        <max-listeners>500</max-listeners>
        <dump-file>/var/log/icecast2/live.dump</dump-file>
        <burst-size>65536</burst-size>
        <fallback-mount>/offline.mp3</fallback-mount>
        <fallback-override>1</fallback-override>
    </mount>
    
    <fileserve>1</fileserve>
    <paths>
        <basedir>/usr/share/icecast2</basedir>
        <logdir>/var/log/icecast2</logdir>
        <webroot>/usr/share/icecast2/web</webroot>
        <adminroot>/usr/share/icecast2/admin</adminroot>
        <alias source="/" destination="/status.xsl"/>
    </paths>
    
    <logging>
        <accesslog>access.log</accesslog>
        <errorlog>error.log</errorlog>
        <loglevel>3</loglevel>
        <logsize>10000</logsize>
    </logging>
</icecast>
```

---

## 9. Мониторинг и observability

### ELK Stack конфигурация
```yaml
# docker-compose.elk.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    ports:
      - "5044:5044"
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logstash/config:/usr/share/logstash/config
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

---

## 10. Оптимизация производительности

### Кэширование стратегий
```javascript
// services/cache.js
const Redis = require('redis');
const client = Redis.createClient({
  url: process.env.REDIS_URL
});

class CacheService {
  async cacheTrackMetadata(trackId, metadata, ttl = 3600) {
    const key = `track:metadata:${trackId}`;
    await client.setEx(key, ttl, JSON.stringify(metadata));
  }

  async getCachedTrackMetadata(trackId) {
    const key = `track:metadata:${trackId}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async cachePopularTracks(tracks, ttl = 1800) {
    const key = 'tracks:popular';
    await client.setEx(key, ttl, JSON.stringify(tracks));
  }
}
```

---

## 11. Пользовательские системы и монетизация

### Stripe интеграция
```javascript
// services/payment.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  async createSubscription(customerId, priceId) {
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async handleWebhook(payload, signature) {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
    }
  }
}
```

---

## 12. Контент-доставка и управление

### CDN оптимизация
```javascript
// services/cdn.js
class CDNService {
  constructor() {
    this.cloudfront = new AWS.CloudFront();
  }

  async invalidateCache(paths) {
    const params = {
      DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: paths.length,
          Items: paths
        }
      }
    };

    return await this.cloudfront.createInvalidation(params).promise();
  }

  generateSignedUrl(key, expiresIn = 3600) {
    const signer = new AWS.CloudFront.Signer(
      process.env.CLOUDFRONT_ACCESS_KEY_ID,
      process.env.CLOUDFRONT_PRIVATE_KEY
    );

    return signer.getSignedUrl({
      url: `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`,
      expires: Math.floor(Date.now() / 1000) + expiresIn
    });
  }
}
```

---

## Приложения

### A. Docker Compose для разработки
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/normaldance
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: normaldance
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### B. Ansible Playbook
```yaml
# ansible/site.yml
---
- hosts: all
  become: yes
  roles:
    - common
    - docker
    - nginx
    - ssl
    - monitoring
    - normaldance
```

### C. Скрипты автоматизации
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Deploying NORMALDANCE..."

# Сборка образов
docker-compose build

# Запуск миграций
docker-compose run --rm app npm run migrate

# Обновление сервисов
docker-compose up -d

# Проверка здоровья
sleep 30
if curl -f http://localhost:3000/health; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed!"
    exit 1
fi
```

---

*Документ создан для NORMALDANCE - современной музыкальной платформы с полным стеком технологий*