# Ask Mode Rules (Non-Obvious Only)

- **Custom MCP protocol**: Система `protocol://` URI (track://, user://, nft://, staking://) для доступа к провайдерам
- **Multi-gateway IPFS/Filecoin redundancy**: Автоматический fallback через несколько шлюзов с проверкой доступности
- **Dual Jest environments**: Отдельные окружения для основного приложения и mobile-app с extensive mocking
- **File chunking**: Файлы >10MB автоматически разделяются в `ipfs-enhanced.ts` с восстановлением через манифест
- **Russian locale**: Все финансовые расчеты используют русские локальные конвенции