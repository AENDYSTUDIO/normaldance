# Architect Mode Rules (Non-Obvious Only)

- **Custom server setup**: Socket.IO сервер вместо стандартного Next.js сервера в `server.ts`
- **Global Prisma singleton**: Единый экземпляр для предотвращения утечек памяти
- **Deflationary экономика**: Автоматическое распределение (2% burn, 20% staking, 30% treasury)
- **Multi-gateway CDN fallback**: Автоматический fallback через несколько шлюзов
- **Custom event emitter system**: Управление состоянием wallet через кастомные события