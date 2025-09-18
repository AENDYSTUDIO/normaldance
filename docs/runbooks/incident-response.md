# 🚨 Incident Response Runbook

## Быстрые действия при инцидентах

### 1. Классификация инцидентов

**P0 - Критический (< 15 минут)**
- Полная недоступность платформы
- Потеря пользовательских данных
- Критические уязвимости безопасности

**P1 - Высокий (< 1 час)**
- Частичная недоступность функций
- Медленная работа (>10s загрузка)
- Проблемы с аудио плеером

**P2 - Средний (< 4 часа)**
- Проблемы с отдельными функциями
- Проблемы с IPFS загрузкой

### 2. Первичная диагностика (5 минут)

```bash
# Проверка статуса сервисов
curl -f https://normaldance.com/api/health || echo "API DOWN"
curl -f https://normaldance.com/api/socketio || echo "Socket.IO DOWN"
curl -f https://normaldance.com/api/ipfs/status || echo "IPFS DOWN"

# Проверка метрик
curl -s https://normaldance.com/api/socket/metrics | jq '.activeConnections'
curl -s https://normaldance.com/api/solana/metrics | jq '.networkHealth'
```

### 3. Действия по типам инцидентов

#### 🔴 Полная недоступность платформы
1. Проверить статус хостинга (Vercel/Railway)
2. Откатиться на последний стабильный деплой
3. Уведомить пользователей

```bash
# Быстрый откат на Vercel
vercel rollback --token=$VERCEL_TOKEN
```

#### 🟡 Проблемы с аудио плеером
1. Проверить IPFS gateway
2. Переключиться на fallback gateway

```bash
# Проверка IPFS gateway
curl -I https://ipfs.io/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn
```

#### 🟠 Проблемы с Socket.IO уведомлениями
1. Проверить метрики Socket.IO
2. Перезапустить Socket.IO сервер

```bash
# Метрики Socket.IO
curl -s https://normaldance.com/api/socket/metrics | jq '.'
```

### 4. Восстановление из бэкапов

```bash
# Получение списка бэкапов
curl -s https://normaldance.com/api/ipfs/status?detailed=true | jq '.recentBackups'

# Восстановление конкретного бэкапа
curl -X POST https://normaldance.com/api/ipfs/restore \
  -H "Content-Type: application/json" \
  -d '{"manifestCid": "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"}'
```

### 5. Коммуникация

#### Шаблоны сообщений

**Начало инцидента:**
```
🚨 INCIDENT DETECTED
Severity: P1
Impact: Audio playback issues
ETA: Investigating
```

**Разрешение:**
```
✅ INCIDENT RESOLVED
Duration: 23 minutes
Root cause: IPFS gateway overload
```

### 6. Контакты экстренного реагирования

**Команда разработки:**
- Lead Developer: +7-XXX-XXX-XXXX
- DevOps Engineer: +7-XXX-XXX-XXXX

**Внешние сервисы:**
- Vercel Support: support@vercel.com
- Pinata Support: team@pinata.cloud