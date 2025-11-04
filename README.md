# 🎵 NORMAL DANCE - Open Source (70%)

**Публичный репозиторий с 70% компонентов платформы**

## 📦 Что включено:

✅ **Основная функциональность:**
- Музыкальный каталог и браузинг
- Web3 интеграция кошельков (Solana, MetaMask)
- Аутентификация пользователей
- Базовый музыкальный плеер
- Управление плейлистами

✅ **Технологии:**
- Next.js 14 + React 18
- TypeScript
- Tailwind CSS
- Vercel deployment
- Prisma ORM

✅ **API эндпоинты:**
- `/api/auth` - Аутентификация
- `/api/tracks` - Музыкальный каталог
- `/api/users` - Управление пользователями
- `/api/playlists` - Плейлисты

## 🔗 Bridge Integration

Этот репозиторий подключается к commercial IP через **secure bridge system**:

```typescript
import { bridgeClient } from '@/lib/bridge/bridge-client';

// Вызвать G.Rave memorial API
await bridgeClient.createGraveMemorial(params);

// Вызвать AI рекомендации  
await bridgeClient.getAIRecommendations(userId);

// Вызвать Telegram Mini App API
await bridgeClient.handleTelegramAction(action);
```

## 🚀 Развертывание

```bash
# Локальная разработка
npm run dev

# Deploy в production
npm run deploy:production
```

## 📚 Связанные репозитории

🔒 **Commercial IP (30%)**: [normaldance-ip](https://github.com/AENDYSTUDIO/normaldance-ip) *(Private)*

📖 **Документация**: [Deployment Guide](../old-normaldance/VERCEL_DEPLOYMENT_GUIDE_RU.md)

---

**Этот репозиторий содержит только открытый код. Коммерческий IP защищен в приватном репозитории.**
