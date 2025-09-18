# NORMALDANCE Smoke Test ✅

## Pre-flight Checks
- ✅ `npm run check:imports` - OK
- ✅ `npm run check:detect` - OK

## Test Scenarios

### 1. Wallet Connection (/)
```bash
# Test: Подключение Phantom кошелька
# Expected: Кнопка "Connect Wallet" → Phantom popup → Success
```

### 2. Auth/JWT Persistence
```bash
# Test: Обновить страницу после подключения
# Expected: Пользователь остается залогинен, редирект на /dashboard
```

### 3. Upload/IPFS (/upload)
```bash
# Test: Загрузить аудио файл
# Expected: Файл загружается в IPFS, возвращается CID
```

### 4. Tracks Display (/dashboard)
```bash
# Test: Отображение загруженных треков
# Expected: Треки отображаются, кнопка Play работает
```

### 5. Donations (API)
```bash
# Test: POST /api/donations с тестовыми данными
# Expected: Status 200, транзакция записана в БД
```

### 6. Zustand Persist
```bash
# Test: Перезагрузка страницы
# Expected: Auth state сохраняется, tracks state восстанавливается
```

## E2E Scenario
1. Connect Phantom wallet
2. Upload track
3. Play track on dashboard
4. Send test donation
5. Verify all states persist after reload

## Quick Commands
```bash
npm run dev          # Start dev server
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run migrations
```