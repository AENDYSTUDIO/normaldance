# 🧪 НЕДЕЛЯ 2: ТЕСТОВАЯ ИНФРАСТРУКТУРА

## ДЕНЬ 1-2: Unit тесты (80% покрытие)

### Приоритетные компоненты:
- ✅ Security (input-sanitizer, secrets-manager)
- Audio system (player, visualizer)
- Wallet system (invisible-wallet, adapters)
- Authentication (auth.ts, providers)
- API routes (tracks, payments)

### Команды:
```bash
npm run test:coverage  # Проверка покрытия
npm run test:watch     # Разработка тестов
```

## ДЕНЬ 3-4: E2E тесты

### Критические сценарии:
- Подключение кошелька
- Воспроизведение музыки
- Загрузка треков
- Платежные операции
- Telegram интеграция

### Команды:
```bash
npx playwright test
npm run test:e2e
```

## ДЕНЬ 5-6: Performance тесты

### Нагрузочное тестирование:
- API endpoints
- Audio streaming
- Database queries
- WebSocket connections

### Команды:
```bash
npm run test:performance
k6 run tests/performance/load-test.js
```

## ДЕНЬ 7: Интеграция и отчеты

### Настройка:
- CI/CD интеграция
- Coverage отчеты
- Performance метрики
- Автоматические проверки