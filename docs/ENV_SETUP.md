# NORMALDANCE – Настройка окружения

> Скопируйте эти переменные в `.env.local` (для разработки) или задайте их в переменных окружения хостинга (для продакшена). В продакшене критичные переменные обязательны: при их отсутствии приложение завершает работу (fail‑fast).

## Базовые

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change_this_to_long_random_string
JWT_SECRET=change_this_to_another_long_random_string
DATABASE_URL=postgresql://user:password@localhost:5432/normaldance
```

## Solana

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
# Обязательно в production:
NEXT_PUBLIC_NDT_PROGRAM_ID=So11111111111111111111111111111111111111112
NEXT_PUBLIC_NDT_MINT_ADDRESS=So11111111111111111111111111111111111111112
NEXT_PUBLIC_TRACKNFT_PROGRAM_ID=TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
NEXT_PUBLIC_STAKING_PROGRAM_ID=Stake11111111111111111111111111111111111111
NEXT_PUBLIC_PLATFORM_WALLET=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9ReYzd4
SOLANA_RPC_TIMEOUT=8000
SOLANA_PAY_WEBHOOK_URL=
```

## CORS / CSP

```env
# Через запятую. Для превью укажите точный домен превью.
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://normaldance.com,https://www.normaldance.com
```

## Rate limiting (Upstash)

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_URL=
```

## IPFS / Helia / Pinata

```env
PINATA_JWT=
PINATA_API_KEY=
PINATA_SECRET_KEY=
IPFS_BACKEND=helia
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io
```

## Sentry

```env
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

## OAuth (опционально)

```env
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
```

## Telegram / TON

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEB_APP_URL=
TELEGRAM_WEBHOOK_URL=
```

## Примечания
- В production переменные `NEXT_PUBLIC_*_PROGRAM_ID`, `NEXTAUTH_SECRET`, `JWT_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_SOLANA_RPC_URL` обязательны.
- Для CORS избегайте wildcard в продакшене — перечисляйте точные домены.
- Для Solana Pay добавьте `SOLANA_PAY_WEBHOOK_URL`, если используете вебхуки подтверждения платежей.
