# 🚀 Краткое руководство по быстрой настройке

## 📋 Шаг за шагом:

### 1. PostgreSQL (выберите один вариант)

#### 🥇 Supabase (рекомендуется, бесплатно)
```
1. Зайдите: https://supabase.com
2. Sign in with GitHub
3. Create new project → "my-normaldance-db"
4. Project Settings → Database → Копируйте Connection string
5. Получите: postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres
```

#### 🐳 Railway (просто)
```
1. Зайдите: https://railway.app
2. New Project → Provision PostgreSQL  
3. Copy connection string после развертывания
```

### 2. Solana Program IDs

#### 🧪 Для разработки (тестовые адреса):
```env
NEXT_PUBLIC_NDT_PROGRAM_ID="NDT11111111111111111111111111111111111111111"
NEXT_PUBLIC_NDT_MINT_ADDRESS="TOKEN11111111111111111111111111111111111111" 
NEXT_PUBLIC_TRACKNFT_PROGRAM_ID="NFT111111111111111111111111111111111111111"
NEXT_PUBLIC_STAKING_PROGRAM_ID="STAKE111111111111111111111111111111111111"
```

#### 🌍 Для production (если знаете адреса):
```
Когда развернете реальные программы, замените тестовые адреса на реальные
```

### 3. Обновить .env.production

```env
# PostgreSQL (замените YOUR_PASSWORD)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.abcdefg.supabase.co:5432/postgres

# Solana (тестовые для разработки)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_NDT_PROGRAM_ID="NDT11111111111111111111111111111111111111111"

# NextAuth
NEXTAUTH_SECRET="сгенерируйте-новый-64-символьный-секрет"
NEXTAUTH_URL=https://your-domain.com
```

### 4. Сгенерировать остальные секреты

```powershell
# Запустите для генерации всех оставшихся секретов
.\setup-github-secrets.ps1
```

---

## ✅ Готово к деплою!

После выполнения этих шагов у вас будет:
- ✅ PostgreSQL база данных в облаке  
- ✅ Solana адреса программ (тестовые или реальные)
- ✅ Все секреты настроены
- ✅ Приложение готово к production развертыванию

---

## 🔧 Если нужно развернуть реальные Solana программы:

```bash
# Установка инструментов
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs/ | sh
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest && avm use latest

# Настройка кошелька
solana config set --url devnet
solana airdrop 2  # для тестов

# Развертывание (если у вас есть programs/)
anchor build
anchor deploy --provider.cluster devnet
```

Результат покажет реальные program IDs для замены в .env. 

---

## 📢 Порядок действий:

1. **Выберите PostgreSQL провайдера** → создайте базу
2. **Скопируйте DATABASE_URL** в .env.production  
3. **Используйте тестовые Solana адреса** (для начала)
4. **Запустите PowerShell скрипт** для генерации секретов
5. **Деплой на production!** 🚀

Если что-то непонятно — спрашивайте! 👍
