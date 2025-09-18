# 📊 Monitoring Guide

## Ключевые метрики для мониторинга

### 1. Системные метрики

**Доступность сервисов:**
- API Health: `GET /api/health` (должен возвращать 200)
- Socket.IO: `GET /api/socketio` (должен возвращать 200)
- IPFS Status: `GET /api/ipfs/status` (status: OK/DEGRADED/FAILED)

**Производительность:**
- Response Time P95 < 2s
- Error Rate < 1%
- Uptime > 99.9%

### 2. Web3 метрики

**Solana транзакции:**
- Confirmation Time P95 < 30s
- Transaction Success Rate > 95%
- Network Health: healthy/degraded/down

**Мониторинг команды:**
```bash
# Проверка метрик Solana
curl -s https://normaldance.com/api/solana/metrics | jq '{
  networkHealth: .networkHealth,
  successRate: (.successfulTransactions / .totalTransactions * 100),
  avgConfirmTime: .averageConfirmationTime
}'
```

### 3. Socket.IO метрики

**Realtime уведомления:**
- Active Connections > 0
- Average Latency < 100ms
- Delivery Rate > 98%
- Reconnect Rate < 5%

**Мониторинг команды:**
```bash
# Socket.IO статус
curl -s https://normaldance.com/api/socket/metrics | jq '{
  activeConnections: .activeConnections,
  averageLatency: .averageLatency,
  deliveryRate: .deliveryRate,
  reconnects: .reconnects
}'
```

### 4. IPFS/CDN метрики

**Файловое хранилище:**
- Gateway Availability > 2/3
- File Retrieval Success Rate > 99%
- Average Download Time < 5s

**Мониторинг команды:**
```bash
# IPFS статус
curl -s https://normaldance.com/api/ipfs/status | jq '{
  status: .status,
  healthyBackups: .healthyBackups,
  totalBackups: .totalBackups,
  gatewayHealth: .gatewayHealth
}'
```

### 5. Безопасность метрики

**Security audit:**
- Security Score > 90
- Critical Issues = 0
- High Issues < 2

**Мониторинг команды:**
```bash
# Security check
curl -s https://normaldance.com/api/security/check | jq '{
  score: .score,
  criticalIssues: [.issues[] | select(.severity == "critical")],
  highIssues: [.issues[] | select(.severity == "high")]
}'
```

### 6. Алерты и пороги

**Критические алерты (немедленно):**
- API недоступен > 1 минуты
- Error Rate > 5%
- Security Score < 70
- IPFS Status = FAILED

**Предупреждения (в течение 15 минут):**
- Response Time P95 > 5s
- Socket.IO Latency > 500ms
- Transaction Success Rate < 90%
- IPFS Status = DEGRADED

### 7. Дашборды

**Основной дашборд:**
- `/dashboard/solana` - Solana метрики
- `/api/socket/metrics` - Socket.IO статус
- `/api/ipfs/status` - IPFS здоровье

**Команды для быстрой проверки:**
```bash
# Общий статус системы
echo "=== SYSTEM STATUS ==="
curl -s https://normaldance.com/api/health && echo " ✅ API OK" || echo " ❌ API DOWN"
curl -s https://normaldance.com/api/socketio && echo " ✅ Socket.IO OK" || echo " ❌ Socket.IO DOWN"

echo "=== IPFS STATUS ==="
curl -s https://normaldance.com/api/ipfs/status | jq -r '.status' | sed 's/OK/✅ OK/; s/DEGRADED/⚠️ DEGRADED/; s/FAILED/❌ FAILED/'

echo "=== SOLANA STATUS ==="
curl -s https://normaldance.com/api/solana/metrics | jq -r '.networkHealth' | sed 's/healthy/✅ HEALTHY/; s/degraded/⚠️ DEGRADED/; s/down/❌ DOWN/'
```

### 8. Автоматизированный мониторинг

**Cron задачи (каждые 5 минут):**
```bash
#!/bin/bash
# /etc/cron.d/normaldance-monitoring

*/5 * * * * /opt/normaldance/scripts/health-check.sh
```

**health-check.sh:**
```bash
#!/bin/bash
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://normaldance.com/api/health)
if [ "$API_STATUS" != "200" ]; then
  echo "API DOWN: $API_STATUS" | logger -t normaldance-monitor
  # Отправка алерта в Slack/Telegram
fi

SOCKET_STATUS=$(curl -s https://normaldance.com/api/socket/metrics | jq -r '.activeConnections')
if [ "$SOCKET_STATUS" == "0" ]; then
  echo "No active Socket.IO connections" | logger -t normaldance-monitor
fi
```