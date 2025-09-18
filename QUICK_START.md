# 🚀 NORMALDANCE - Быстрый старт

## Что уже готово:
✅ Next.js 15 приложение  
✅ Prisma ORM с базой данных  
✅ Web3 интеграция (Solana)  
✅ IPFS для хранения файлов  
✅ NextAuth аутентификация  
✅ Tailwind CSS + shadcn/ui  

## Быстрый деплой:

### 1. Настройка секретов
```bash
setup-secrets.bat
```

### 2. Проверка проекта
```bash
check-project.bat
```

### 3. Деплой на Vercel
```bash
quick-deploy.bat
```

### 4. Настройка переменных окружения
```bash
vercel-env-setup.bat
```

## Переменные окружения для Vercel:

```env
DATABASE_URL=postgresql://neondb_owner:npg_Z8K9X7Y6@ep-rough-forest-a5m2n3p4.us-east-2.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=[сгенерированный секрет]
NEXTAUTH_URL=https://normaldance.vercel.app
PINATA_API_KEY=[ваш ключ]
PINATA_SECRET_API_KEY=[ваш секретный ключ]
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PLATFORM_WALLET=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
```

## Тестирование:
После деплоя проверьте: `https://your-app.vercel.app/api/test`

## Что дальше:
1. Настроить Pinata IPFS ключи
2. Добавить реальные треки
3. Настроить Solana кошелек
4. Запустить маркетинг

🎵 **NORMALDANCE готов к запуску!**