# 🗄️ PostgreSQL & 🟣 Solana руководство по настройке

## PostgreSQL - где взять DATABASE_URL?

### 1. **Локальная разработка (SQLite - уже настроено)**
```env
DATABASE_URL=file:./db/dev.db
```

### 2. **Облачные PostgreSQL провайдеры:**

#### 🛠️ Supabase (рекомендуется - бесплатный план)
```bash
# 1. Зарегистрируйтесь на https://supabase.com
# 2. Создайте новый проект
# 3. Перейдите в Settings -> Database
# 4. Скопируйте "Connection string" -> "URI"

# Результат будет выглядеть так:
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### ☁️ Vercel Postgres
```bash
# 1. В Vercel Dashboard -> Storage
# 2. Create Database -> Postgres
# 3. В .env.local автоматически добавится: 
# POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING

# Используйте POSTGRES_URL:
DATABASE_URL=postgres://[user]:[password]@[host]:[port]/[database]
```

#### 🐳 Railway (простой)
```bash
# 1. Зарегистрируйтесь на https://railway.app
# 2. New Project -> Provision PostgreSQL
# 3. Copy connection string после развертывания
DATABASE_URL=postgresql://postgres:[password]@[host].railway.app:5432/railway
```

#### 🌊 DigitalOcean (предприятие)
```bash
# 1. В панели DigitalOcean -> Databases
# 2. Создайте PostgreSQL кластер
# 3. Коннект строка в настройках кластера
DATABASE_URL=postgresql://doadmin:[password]@[host].db.ondigitalocean.com:25060/defaultdb
```

---

## 🟣 Solana - где брать реальные адреса программ?

### 1. **Существующие (если уже развернули)**
Если у вас уже есть развернутые программы:

```bash
# Посмотреть текущие программы
solana program show --programs

# Проверить балансы
solana balance
```

### 2. **Создание новых программ**

#### 🛠️ Установка Anchor Framework
```bash
# Установить Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs/ | sh

# Установить Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"

# Установить Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

#### 📝 Создание проекта с программами
```bash
# Создание Anchor проекта
anchor init normaldance-programs
cd normaldance-programs

# Структура программ будет в programs/文件夹:
# programs/ndt-token/
# programs/tracknft/
# programs/staking/
```

#### 🚀 Развертывание программ
```bash
# 1. Подключить кошелек (devnet сначала)
solana config set --url devnet
solana config set --keypair ~/.config/solana/id.json

# 2. Получить SOL для газа на devnet
solana airdrop 2

# 3. Развернуть NDT токен программу
anchor build
anchor deploy --provider.cluster devnet

# 4. Solana покажет program ID:
# Program ID: 7xF2VdfQ7DmQ8wV4rK8qXxYqXpQpQpQpQpQpQpQpQpQp
```

### 3. **Program Templates (для тестирования)**

Если нужно быстро запустить без развертывания:

```bash
# NDT Token Program (пример)
NEXT_PUBLIC_NDT_PROGRAM_ID="7xF2VdfQ7DmQ8wV4rK8qXxYqXpQpQpQpQpQpQpQpQpQp"
NEXT_PUBLIC_NDT_MINT_ADDRESS="8xK8R8sXjLzRjK3XqG7mH4vN6mM4vP8qG4v9F8dKbN9Q"

# TrackNFT Program (пример) 
NEXT_PUBLIC_TRACKNFT_PROGRAM_ID="9yFgH8mLqXhK7nVz3XcTfJpKzRpYhGnMxQbE3JdKsWtVq"

# Staking Program (пример)
NEXT_PUBLIC_STAKING_PROGRAM_ID="2xKmP9bC7nYmR4LjQxHgVz6wQ5nYqGzLkPcX7DmJySrTg"
```

### 4. **Devnet vs Mainnet выбор**

#### 🧪 Devnet (для тестирования)
```bash
# Команды для devnet
solana config set --url devnet
solana airdrop 10  # 10 SOL бесплатно

# Test programs:
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

#### 🌍 Mainnet (для production)
```bash
# Команды для mainnet
solana config set --url mainnet-beta
# Нужны реальные SOL для газа

# Production programs:
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## 🔧 Быстрый старт для разработки

### PostgreSQL (Supabase - бесплатно):
```bash
# 1. https://supabase.com
# 2. New Project
# 3. Project Settings -> Database -> Connection string
# 4. Копируйте URI
```

### Solana (программы готовы или использовать тестовые):
```bash
# Если программы еще не развернуты, используйте тестовые адреса:
NEXT_PUBLIC_NDT_PROGRAM_ID="NDT11111111111111111111111111111111111111111"
NEXT_PUBLIC_TRACKNFT_PROGRAM_ID="TRACKNFT1111111111111111111111111111111111"
NEXT_PUBLIC_STAKING_PROGRAM_ID="STAKING111111111111111111111111111111111111"
```

---

## 🎯 Полный пример .env.production

```env
# PostgreSQL (Supabase пример)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.abcdefgh.supabase.co:5432/postgres

# Solana Mainnet (развернутые программы)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_NDT_PROGRAM_ID=7xF2VdfQ7DmQ8wV4rK8qXxYqXpQpQpQpQpQpQpQpQpQp
NEXT_PUBLIC_NDT_MINT_ADDRESS=8xK8R8sXjLzRjK3XqG7mH4vN6mM4vP8qG4v9F8dKbN9Q
NEXT_PUBLIC_TRACKNFT_PROGRAM_ID=9yFgH8mLqXhK7nVz3XcTfJpKzRpYhGnMxQbE3JdKsWtVq
NEXT_PUBLIC_STAKING_PROGRAM_ID=2xKmP9bC7nYmR4LjQxHgVz6wQ5nYqGzLkPcX7DmJySrTg
```

---

## 📚 Полезные ссылки:

- **Supabase**: https://supabase.com/docs/guides/database
- **Anchor Framework**: https://www.anchor-lang.com/
- **Solana CLI**: https://docs.solana.com/cli/install-solana-cli-tools
- **Solana Explorer**: https://explorer.solana.com/

---

## ⚠️ Важные заметки:

1. **PostgreSQL**: Используйте разные базы данных для dev/staging/prod
2. **Solana**: Всегда тестируйте на devnet перед mainnet
3. **Безопасность**: Никогда не коммитьте приватные ключи
4. **Gas Fees**: На mainnet нужны реальные SOL для развертывания
5. **Backups**: Регулярно бэкапьте базу данных

Готово к развертыванию! 🚀
