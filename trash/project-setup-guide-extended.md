# Настройка инфраструктуры проекта: пошаговое руководство для высоконагруженных музыкальных платформ

## Оглавление
- [Глава 1: DNS-конфигурация для высокопроизводительных сервисов](#глава-1-dns-конфигурация-для-высокопроизводительных-сервисов)
- [Глава 2: SSL/TLS сертификаты и безопасность HTTPS](#глава-2-ssltls-сертификаты-и-безопасность-https)
- [Глава 3: Серверная инфраструктура для высоких нагрузок](#глава-3-серверная-инфраструктура-для-высоких-нагрузок)
- [Глава 4: Nginx продвинутая настройка для медиасервисов](#глава-4-nginx-продвинутая-настройка-для-медиасервисов)
- [Глава 5: Базы данных для музыкальных платформ](#глава-5-базы-данных-для-музыкальных-платформ)
- [Глава 6: Аудио-стриминг низколатентной передачи](#глава-6-аудио-стриминг-низколатентной-передачи)
- [Глава 7: Развертывание и CI/CD для медиасервисов](#глава-7-развертывание-и-cicd-для-медиасервисов)
- [Глава 8: Безопасность музыкальных платформ](#глава-8-безопасность-музыкальных-платформ)
- [Глава 9: Мониторинг и observability для медиасервисов](#глава-9-мониторинг-и-observability-для-медиасервисов)
- [Глава 10: Оптимизация производительности для аудио-сервисов](#глава-10-оптимизация-производительности-для-аудио-сервисов)
- [Глава 11: Пользовательские системы и монетизация](#глава-11-пользовательские-системы-и-монетизация)
- [Глава 12: Контент-доставка и управление](#глава-12-контент-доставка-и-управление)
- [Приложения](#приложения)

---

## Глава 1: DNS-конфигурация для высокопроизводительных сервисов

### 1.1 Активация доменов и настройка DNS-записей с геораспределением

#### Основные A-записи с георасределением
```bash
# Основные домены
@ 300 IN A 176.108.246.49
www 300 IN A 176.108.246.49

# Региональные поддомены
eu 300 IN A 185.199.108.153  # Европа
us 300 IN A 140.82.112.3     # США
asia 300 IN A 13.229.188.59  # Азия

# CDN поддомены
cdn 300 IN CNAME d111111abcdef8.cloudfront.net.
static 300 IN CNAME assets.dnb1st.ru.

# API поддомены
api 300 IN A 176.108.246.49
api-v2 300 IN A 176.108.246.49
ws 300 IN A 176.108.246.49
```

#### MX-записи для почты с приоритетами
```bash
@ 300 IN MX 10 mx1.beget.com.
@ 300 IN MX 20 mx2.beget.com.
@ 300 IN MX 30 mx3.beget.com.
```

#### Расширенные TXT записи
```bash
@ 300 IN TXT "v=spf1 include:_spf.beget.com ~all"
_dmarc 300 IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@dnb1st.ru"
default._domainkey 300 IN TXT "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."
```

#### SRV записи для сервисов
```bash
_sip._tcp 300 IN SRV 10 5 5060 sip.dnb1st.ru.
_xmpp-server._tcp 300 IN SRV 5 0 5269 xmpp.dnb1st.ru.
_minecraft._tcp 300 IN SRV 0 5 25565 mc.dnb1st.ru.
```

### 1.2 Конфигурация DNSSEC для защиты от DNS-спуфинга

```bash
# Генерация ключей DNSSEC
dnssec-keygen -a RSASHA256 -b 2048 -n ZONE dnb1st.ru
dnssec-keygen -a RSASHA256 -b 2048 -n ZONE -f KSK dnb1st.ru

# Подписание зоны
dnssec-signzone -o dnb1st.ru -k Kdnb1st.ru.+008+12345.key dnb1st.ru.zone Kdnb1st.ru.+008+54321.key

# DS записи для родительской зоны
dig DNSKEY dnb1st.ru | dnssec-dsfromkey -f - dnb1st.ru
```

### 1.3 Настройка GeoDNS для распределения трафика

```nginx
# /etc/nginx/conf.d/geodns.conf
geo $geo_country {
    default US;
    ~^185\.199\. EU;
    ~^13\.229\. ASIA;
    ~^176\.108\. RU;
}

map $geo_country $backend_pool {
    US us-backend;
    EU eu-backend;
    ASIA asia-backend;
    RU ru-backend;
    default ru-backend;
}

upstream us-backend {
    server 140.82.112.3:3000;
    server 140.82.112.4:3000 backup;
}

upstream eu-backend {
    server 185.199.108.153:3000;
    server 185.199.108.154:3000 backup;
}
```

### 1.4 Реализация Anycast для глобального балансирования

```bash
# BGP конфигурация для Anycast
# /etc/bird/bird.conf
router id 176.108.246.49;

protocol bgp {
    local as 65001;
    neighbor 203.0.113.1 as 65000;
    export filter {
        if net = 176.108.246.0/24 then accept;
        reject;
    };
}

protocol static {
    route 176.108.246.49/32 via "lo";
}
```

---

## Глава 2: SSL/TLS сертификаты и безопасность HTTPS

### 2.1 Генерация CSR и получение сертификатов Let's Encrypt с DNS-валидацией

```bash
# Установка Certbot с DNS плагином
sudo apt install certbot python3-certbot-dns-cloudflare

# Конфигурация DNS API
cat > ~/.secrets/cloudflare.ini << EOF
dns_cloudflare_email = admin@dnb1st.ru
dns_cloudflare_api_key = your_api_key_here
EOF
chmod 600 ~/.secrets/cloudflare.ini

# Получение wildcard сертификата
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d dnb1st.ru \
  -d "*.dnb1st.ru" \
  -d dnb1st.store \
  -d "*.dnb1st.store"
```

### 2.2 Конфигурация TLS 1.3 с оптимальными параметрами

```nginx
# /etc/nginx/conf.d/ssl.conf
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;

# TLS 1.3 early data
ssl_early_data on;
proxy_set_header Early-Data $ssl_early_data;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/dnb1st.ru/chain.pem;

# HSTS с preload
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

# Certificate Transparency
add_header Expect-CT "max-age=86400, enforce, report-uri=\"https://dnb1st.ru/ct-report\"" always;
```

### 2.3 Настройка ECC-сертификатов для улучшения производительности

```bash
# Генерация ECC ключа
openssl ecparam -genkey -name prime256v1 -out ecc-private.key

# CSR для ECC сертификата
openssl req -new -key ecc-private.key -out ecc-csr.pem \
  -subj "/C=RU/ST=Moscow/L=Moscow/O=DNB1ST/CN=dnb1st.ru"

# Получение ECC сертификата через Certbot
certbot certonly --csr ecc-csr.pem --preferred-challenges dns
```

---

## Глава 3: Серверная инфраструктура для высоких нагрузок

### 3.1 Оптимизация ядра Linux для высоких нагрузок

```bash
# /etc/sysctl.d/99-audio-streaming.conf
# Сетевые оптимизации
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 30000
net.core.rmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_default = 262144
net.core.wmem_max = 16777216

# TCP оптимизации
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.ipv4.tcp_congestion_control = bbr
net.ipv4.tcp_slow_start_after_idle = 0

# Файловые дескрипторы
fs.file-max = 2097152
fs.nr_open = 2097152

# Аудио оптимизации
kernel.sched_rt_runtime_us = 950000
kernel.sched_rt_period_us = 1000000
```

### 3.2 Конфигурация cgroups для аудио-приложений

```bash
# Создание cgroup для аудио процессов
sudo mkdir -p /sys/fs/cgroup/cpu/audio
echo 800000 > /sys/fs/cgroup/cpu/audio/cpu.cfs_quota_us
echo 1000000 > /sys/fs/cgroup/cpu/audio/cpu.cfs_period_us

# Настройка приоритетов
echo 1000 > /sys/fs/cgroup/cpu/audio/cpu.shares
echo 0 > /sys/fs/cgroup/cpu/audio/cpu.rt_runtime_us

# Добавление процессов в cgroup
echo $PID > /sys/fs/cgroup/cpu/audio/cgroup.procs
```

### 3.3 Настройка автоматического масштабирования

```bash
#!/bin/bash
# auto-scale.sh
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85

while true; do
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
    
    if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
        docker-compose up -d --scale dnb1st-platform=3
        echo "Scaled up due to CPU: $CPU_USAGE%"
    fi
    
    if (( $(echo "$MEMORY_USAGE > $MEMORY_THRESHOLD" | bc -l) )); then
        docker-compose up -d --scale dnb1st-platform=3
        echo "Scaled up due to Memory: $MEMORY_USAGE%"
    fi
    
    sleep 60
done
```

---

## Глава 4: Nginx продвинутая настройка для медиасервисов

### 4.1 Конфигурация для потоковой передачи медиа (HLS, DASH)

```nginx
# /etc/nginx/conf.d/streaming.conf
server {
    listen 443 ssl http2;
    server_name stream.dnb1st.ru;
    
    # HLS стриминг
    location /hls/ {
        alias /var/www/streams/hls/;
        
        # CORS для медиа
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Range" always;
        
        # Кэширование сегментов
        location ~* \.m3u8$ {
            expires 1s;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
        
        location ~* \.ts$ {
            expires 1h;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # DASH стриминг
    location /dash/ {
        alias /var/www/streams/dash/;
        
        location ~* \.mpd$ {
            expires 1s;
            add_header Cache-Control "no-cache";
        }
        
        location ~* \.(m4s|mp4)$ {
            expires 1h;
            add_header Cache-Control "public";
        }
    }
    
    # WebRTC signaling
    location /webrtc/ {
        proxy_pass http://webrtc_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.2 Настройка X-Accel-Buffering для аудио-стриминга

```nginx
# Конфигурация для низколатентного стриминга
location /stream/ {
    proxy_pass http://audio_backend;
    
    # Отключение буферизации для real-time
    proxy_buffering off;
    proxy_cache off;
    proxy_request_buffering off;
    
    # X-Accel настройки
    proxy_set_header X-Accel-Buffering no;
    proxy_set_header X-Accel-Charset utf-8;
    
    # Таймауты для длительных соединений
    proxy_connect_timeout 1s;
    proxy_send_timeout 86400s;
    proxy_read_timeout 86400s;
    
    # Заголовки для стриминга
    proxy_set_header Connection "";
    proxy_http_version 1.1;
    
    # Chunked transfer encoding
    chunked_transfer_encoding on;
}
```

### 4.3 Load balancing с health checks

```nginx
upstream audio_backend {
    least_conn;
    
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s backup;
    server 127.0.0.1:3002 max_fails=3 fail_timeout=30s backup;
    
    keepalive 32;
    keepalive_requests 1000;
    keepalive_timeout 60s;
}

# Health check endpoint
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}

# Upstream health check
location /upstream_health {
    proxy_pass http://audio_backend/health;
    proxy_connect_timeout 1s;
    proxy_send_timeout 1s;
    proxy_read_timeout 1s;
}
```

---

## Глава 5: Базы данных для музыкальных платформ

### 5.1 Установка PostgreSQL с репликацией Patroni

```yaml
# /etc/patroni/patroni.yml
scope: dnb1st-cluster
namespace: /db/
name: postgresql0

restapi:
  listen: 0.0.0.0:8008
  connect_address: 176.108.246.49:8008

etcd:
  hosts: 176.108.246.49:2379,176.108.246.50:2379,176.108.246.51:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 30
    maximum_lag_on_failover: 1048576
    postgresql:
      use_pg_rewind: true
      parameters:
        max_connections: 1000
        shared_buffers: 512MB
        effective_cache_size: 2GB
        maintenance_work_mem: 128MB
        checkpoint_completion_target: 0.9
        wal_buffers: 16MB
        default_statistics_target: 100
        random_page_cost: 1.1
        effective_io_concurrency: 200

postgresql:
  listen: 0.0.0.0:5432
  connect_address: 176.108.246.49:5432
  data_dir: /var/lib/postgresql/14/main
  bin_dir: /usr/lib/postgresql/14/bin
  pgpass: /tmp/pgpass
  authentication:
    replication:
      username: replicator
      password: rep-pass
    superuser:
      username: postgres
      password: postgres-pass
```

### 5.2 Оптимизация для музыкального контента

```sql
-- Создание индексов для музыкального поиска
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Таблица треков с оптимизированными индексами
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    genre VARCHAR(100),
    duration INTEGER, -- в секундах
    bitrate INTEGER,
    file_path TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Полнотекстовый поиск
CREATE INDEX idx_tracks_search ON tracks USING GIN (
    to_tsvector('russian', title || ' ' || artist || ' ' || COALESCE(album, ''))
);

-- Индексы для быстрого поиска
CREATE INDEX idx_tracks_artist_gin ON tracks USING GIN (artist gin_trgm_ops);
CREATE INDEX idx_tracks_title_gin ON tracks USING GIN (title gin_trgm_ops);
CREATE INDEX idx_tracks_genre ON tracks (genre);
CREATE INDEX idx_tracks_duration ON tracks (duration);

-- Партиционирование по дате
CREATE TABLE tracks_2024 PARTITION OF tracks
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 5.3 Интеграция с Redis для кэширования

```python
# redis_config.py
import redis
import json
from typing import Optional, Any

class MusicCache:
    def __init__(self):
        self.redis_client = redis.Redis(
            host='localhost',
            port=6379,
            db=0,
            decode_responses=True,
            socket_keepalive=True,
            socket_keepalive_options={},
            health_check_interval=30
        )
    
    def cache_track_metadata(self, track_id: int, metadata: dict, ttl: int = 3600):
        """Кэширование метаданных трека"""
        key = f"track:metadata:{track_id}"
        self.redis_client.setex(key, ttl, json.dumps(metadata))
    
    def get_track_metadata(self, track_id: int) -> Optional[dict]:
        """Получение метаданных трека из кэша"""
        key = f"track:metadata:{track_id}"
        data = self.redis_client.get(key)
        return json.loads(data) if data else None
    
    def cache_playlist(self, user_id: int, playlist_data: list, ttl: int = 1800):
        """Кэширование плейлиста пользователя"""
        key = f"user:playlist:{user_id}"
        self.redis_client.setex(key, ttl, json.dumps(playlist_data))
    
    def increment_play_count(self, track_id: int) -> int:
        """Увеличение счетчика прослушиваний"""
        key = f"track:plays:{track_id}"
        return self.redis_client.incr(key)
```

---

## Глава 6: Аудио-стриминг низколатентной передачи

### 6.1 Архитектура WebSocket для низколатентного стриминга с Socket.IO

```javascript
// server/audio-streaming.js
const io = require('socket.io')(server, {
    cors: {
        origin: ["https://dnb1st.ru", "https://dnb1st.store"],
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

class AudioStreamManager {
    constructor() {
        this.activeStreams = new Map();
        this.listeners = new Map();
    }
    
    startStream(streamId, socket) {
        const stream = {
            id: streamId,
            broadcaster: socket.id,
            listeners: new Set(),
            quality: 'high',
            bitrate: 320,
            sampleRate: 44100
        };
        
        this.activeStreams.set(streamId, stream);
        socket.join(`stream:${streamId}`);
        
        socket.on('audio-chunk', (data) => {
            // Обработка аудио чанка
            const processedChunk = this.processAudioChunk(data);
            
            // Трансляция всем слушателям
            socket.to(`stream:${streamId}`).emit('audio-data', {
                chunk: processedChunk,
                timestamp: Date.now(),
                sequence: data.sequence
            });
        });
    }
    
    processAudioChunk(audioData) {
        // Применение фильтров и эффектов
        return {
            data: audioData.data,
            format: 'opus',
            bitrate: audioData.bitrate || 128,
            channels: audioData.channels || 2,
            sampleRate: audioData.sampleRate || 44100
        };
    }
    
    joinStream(streamId, socket) {
        const stream = this.activeStreams.get(streamId);
        if (!stream) return false;
        
        stream.listeners.add(socket.id);
        socket.join(`stream:${streamId}`);
        
        // Отправка информации о стриме
        socket.emit('stream-info', {
            id: streamId,
            quality: stream.quality,
            bitrate: stream.bitrate,
            listeners: stream.listeners.size
        });
        
        return true;
    }
}

const streamManager = new AudioStreamManager();

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    socket.on('start-broadcast', (data) => {
        streamManager.startStream(data.streamId, socket);
    });
    
    socket.on('join-stream', (data) => {
        streamManager.joinStream(data.streamId, socket);
    });
    
    socket.on('disconnect', () => {
        // Очистка ресурсов
        streamManager.cleanup(socket.id);
    });
});
```

### 6.2 Кодирование аудио в формате Opus с WebRTC

```javascript
// client/audio-encoder.js
class OpusAudioEncoder {
    constructor(options = {}) {
        this.sampleRate = options.sampleRate || 48000;
        this.channels = options.channels || 2;
        this.bitrate = options.bitrate || 128000;
        this.frameSize = options.frameSize || 960; // 20ms at 48kHz
        
        this.initializeEncoder();
    }
    
    async initializeEncoder() {
        // Инициализация Opus encoder через WebAssembly
        this.encoder = await OpusEncoder.create({
            sampleRate: this.sampleRate,
            channels: this.channels,
            application: 'audio', // 'voip', 'audio', 'restricted_lowdelay'
            bitrate: this.bitrate,
            complexity: 10 // 0-10, higher = better quality but more CPU
        });
    }
    
    encodeFrame(pcmData) {
        try {
            const encoded = this.encoder.encode(pcmData);
            return {
                data: encoded,
                timestamp: performance.now(),
                frameSize: this.frameSize,
                channels: this.channels,
                sampleRate: this.sampleRate
            };
        } catch (error) {
            console.error('Encoding error:', error);
            return null;
        }
    }
    
    setBitrate(bitrate) {
        this.bitrate = bitrate;
        this.encoder.setBitrate(bitrate);
    }
}

// Использование с MediaStream
class AudioStreamer {
    constructor(socket) {
        this.socket = socket;
        this.encoder = new OpusAudioEncoder({
            sampleRate: 48000,
            channels: 2,
            bitrate: 128000
        });
        this.isStreaming = false;
    }
    
    async startStreaming() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 48000,
                    channelCount: 2,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            const audioContext = new AudioContext({ sampleRate: 48000 });
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 2, 2);
            
            processor.onaudioprocess = (event) => {
                if (!this.isStreaming) return;
                
                const inputBuffer = event.inputBuffer;
                const leftChannel = inputBuffer.getChannelData(0);
                const rightChannel = inputBuffer.getChannelData(1);
                
                // Интерливинг каналов
                const interleavedData = this.interleaveChannels(leftChannel, rightChannel);
                
                // Кодирование в Opus
                const encoded = this.encoder.encodeFrame(interleavedData);
                if (encoded) {
                    this.socket.emit('audio-chunk', encoded);
                }
            };
            
            source.connect(processor);
            processor.connect(audioContext.destination);
            
            this.isStreaming = true;
            
        } catch (error) {
            console.error('Failed to start streaming:', error);
        }
    }
    
    interleaveChannels(left, right) {
        const length = left.length + right.length;
        const result = new Float32Array(length);
        
        let index = 0;
        for (let i = 0; i < left.length; i++) {
            result[index++] = left[i];
            result[index++] = right[i];
        }
        
        return result;
    }
    
    stopStreaming() {
        this.isStreaming = false;
    }
}
```

### 6.3 Адаптивный битрейт для разных устройств

```javascript
// adaptive-bitrate.js
class AdaptiveBitrateController {
    constructor(socket) {
        this.socket = socket;
        this.currentBitrate = 128000;
        this.targetBitrate = 128000;
        this.bitrateHistory = [];
        this.networkStats = {
            rtt: 0,
            packetLoss: 0,
            bandwidth: 0
        };
        
        this.startNetworkMonitoring();
    }
    
    startNetworkMonitoring() {
        setInterval(() => {
            this.measureNetworkQuality();
            this.adjustBitrate();
        }, 5000); // Проверка каждые 5 секунд
    }
    
    async measureNetworkQuality() {
        const startTime = performance.now();
        
        // Измерение RTT
        this.socket.emit('ping', startTime);
        this.socket.once('pong', (timestamp) => {
            this.networkStats.rtt = performance.now() - timestamp;
        });
        
        // Оценка пропускной способности
        if (navigator.connection) {
            this.networkStats.bandwidth = navigator.connection.downlink * 1000000; // Mbps to bps
        }
    }
    
    adjustBitrate() {
        const { rtt, bandwidth } = this.networkStats;
        
        // Алгоритм адаптации битрейта
        if (rtt > 200) {
            // Высокая задержка - снижаем битрейт
            this.targetBitrate = Math.max(64000, this.currentBitrate * 0.8);
        } else if (rtt < 50 && bandwidth > this.currentBitrate * 2) {
            // Хорошее соединение - можем увеличить битрейт
            this.targetBitrate = Math.min(320000, this.currentBitrate * 1.2);
        }
        
        // Плавное изменение битрейта
        if (Math.abs(this.targetBitrate - this.currentBitrate) > 16000) {
            const step = (this.targetBitrate - this.currentBitrate) * 0.1;
            this.currentBitrate += step;
            
            // Уведомление энкодера о новом битрейте
            this.socket.emit('bitrate-change', {
                bitrate: Math.round(this.currentBitrate),
                reason: this.getBitrateChangeReason()
            });
        }
    }
    
    getBitrateChangeReason() {
        const { rtt, bandwidth } = this.networkStats;
        
        if (rtt > 200) return 'high_latency';
        if (bandwidth < this.currentBitrate) return 'low_bandwidth';
        if (rtt < 50 && bandwidth > this.currentBitrate * 2) return 'good_connection';
        
        return 'optimization';
    }
}
```

---

## Глава 7: Развертывание и CI/CD для медиасервисов

### 7.1 Docker-контейнеризация с multi-stage builds

```dockerfile
# Dockerfile.audio-service
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Установка аудио библиотек
RUN apk add --no-cache \
    ffmpeg \
    opus-dev \
    libsamplerate-dev \
    alsa-lib-dev

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

RUN apk add --no-cache \
    ffmpeg \
    opus \
    libsamplerate \
    alsa-lib \
    dumb-init

WORKDIR /app

# Создание пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S audiouser -u 1001

COPY --from=builder --chown=audiouser:nodejs /app/dist ./dist
COPY --from=builder --chown=audiouser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=audiouser:nodejs /app/package.json ./package.json

USER audiouser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

### 7.2 GitHub Actions с blue-green deployment

```yaml
# .github/workflows/deploy-audio-service.yml
name: Deploy Audio Service

on:
  push:
    branches: [main]
    paths: ['audio-service/**']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: dnb1st/audio-service

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run audio quality tests
      run: npm run test:audio
    
    - name: Performance tests
      run: npm run test:performance

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
          type=sha,prefix={{branch}}-
    
    - name: Build and push
      id: build
      uses: docker/build-push-action@v4
      with:
        context: ./audio-service
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Deploy to Blue Environment
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          # Blue-Green Deployment
          cd /var/www/dnb1st
          
          # Update blue environment
          docker pull ${{ needs.build.outputs.image-tag }}
          docker-compose -f docker-compose.blue.yml up -d
          
          # Health check
          sleep 30
          if curl -f http://localhost:3001/health; then
            # Switch traffic to blue
            docker-compose -f docker-compose.yml down
            mv docker-compose.yml docker-compose.green.yml
            mv docker-compose.blue.yml docker-compose.yml
            docker-compose up -d
            
            # Cleanup old green
            docker-compose -f docker-compose.green.yml down
            echo "Deployment successful"
          else
            echo "Health check failed, rolling back"
            docker-compose -f docker-compose.blue.yml down
            exit 1
          fi
```

### 7.3 Kubernetes Helm charts для масштабирования

```yaml
# helm/audio-service/values.yaml
replicaCount: 3

image:
  repository: ghcr.io/dnb1st/audio-service
  tag: "latest"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 3000
  targetPort: 3000

ingress:
  enabled: true
  className: "nginx"
  annotations:
    nginx.ingress.kubernetes.io/websocket-services: "audio-service"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "86400"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "86400"
  hosts:
    - host: stream.dnb1st.ru
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

nodeSelector:
  workload: audio-processing

tolerations:
  - key: "audio-workload"
    operator: "Equal"
    value: "true"
    effect: "NoSchedule"

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app.kubernetes.io/name
            operator: In
            values:
            - audio-service
        topologyKey: kubernetes.io/hostname
```

---

*Документ создан для проекта DNB1ST - высоконагруженная музыкальная платформа и магазин на базе современных технологий*