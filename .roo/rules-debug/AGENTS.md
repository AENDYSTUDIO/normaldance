# Debug Mode Rules (Non-Obvious Only)

- **ESLint полностью отключен**: Все правила намеренно отключены в `eslint.config.mjs` для ускорения сборки
- **Custom Socket.IO путь**: Путь `/api/socketio` вместо стандартного `/socket.io`
- **Multi-gateway IPFS health monitoring**: Автоматическая проверка доступности файлов через несколько шлюзов
- **Wallet операции возвращают 0 при ошибках**: Тихие сбои вместо исключений
- **Production builds требуют NODE_ENV=production**: Сборка без этого флага может работать некорректно
- **Global Prisma instance connection pooling**: Пул соединений предотвращает утечки памяти