# Критические исправления безопасности

## 🚨 НЕМЕДЛЕННО ТРЕБУЮТ ИСПРАВЛЕНИЯ

### 1. Обновить Axios (Critical)
```bash
npm update axios@^1.11.0
```

### 2. Удалить захардкоженные учетные данные
**Файл**: `mobile-app/src/services/mobileService.ts:213`
- Переместить в переменные окружения
- Использовать AWS Secrets Manager

### 3. Исправить Code Injection
**Файлы**: 
- `src/lib/telegram-integration-2025.ts:133`
- `.next/server/edge-runtime-webpack.js:272`

### 4. Санитизация XSS
**Файлы**:
- `src/app/api/tracks/route.ts:38-47`
- `src/lib/middleware.ts:30`
- `src/lib/image-optimizer.ts:8-39`
- `src/app/api/filecoin/route.ts:82-86`

### 5. Исправить SSRF
**Файлы**:
- `scripts/deploy/domain-api.js:49,223`

### 6. Санитизация логов
**Файлы**:
- `src/hooks/useRealtimeNotifications.ts:85`
- `src/lib/audio-loader.ts:300`
- `src/lib/redundancy-service.ts:255`
- `src/lib/redis-cache-manager.ts:144`

## 📋 План исправлений

1. **Обновить зависимости** (5 мин)
2. **Удалить hardcoded credentials** (10 мин)  
3. **Добавить input sanitization** (30 мин)
4. **Исправить SSRF** (15 мин)
5. **Санитизировать логи** (20 мин)

**Общее время**: ~1.5 часа

## ⚡ Быстрые исправления

### Обновление зависимостей:
```bash
npm audit fix --force
npm update axios@latest
```

### Санитизация входных данных:
```typescript
import DOMPurify from 'dompurify';

// Для XSS
const sanitized = DOMPurify.sanitize(userInput);

// Для логов
const sanitizedLog = userInput.replace(/[\r\n]/g, '');
```

### URL валидация для SSRF:
```javascript
const allowedHosts = ['api.example.com'];
const url = new URL(userUrl);
if (!allowedHosts.includes(url.hostname)) {
  throw new Error('Invalid host');
}
```