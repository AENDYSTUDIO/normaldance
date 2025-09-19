# Setup Guide для NORMALDANCE NFT System

## 1. Web3.Storage токен

1. Перейти на https://web3.storage
2. Зарегистрироваться/войти
3. Создать новый API токен
4. Скопировать токен в .env.local:
```
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 2. Phantom кошелек

1. Установить расширение: https://phantom.app
2. Создать новый кошелек или импортировать существующий
3. Переключиться на Devnet:
   - Settings → Developer Settings → Change Network → Devnet

## 3. Получить SOL на devnet

```bash
# Через CLI
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet

# Или через faucet
# https://faucet.solana.com
```

## 4. Тестирование

```bash
npm install
npm run dev
```

Открыть http://localhost:3000 и протестировать минтинг NFT