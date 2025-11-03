# 🚀 Docker Quick Start Guide

Самый быстрый способ запустить NormalDance на Docker.

## ⚡ За 5 минут (рекомендуется)

### 1. Запустите только базы данных:

**Windows (PowerShell):**
```powershell
.\docker-start.ps1
# Выберите опцию 1
```

**Windows (CMD):**
```cmd
docker-start.bat
REM Выберите опцию 1
```

**macOS/Linux:**
```bash
chmod +x docker-start.sh
./docker-start.sh
# Выберите опцию 1
```

### 2. Установите зависимости и запустите приложение:

```bash
npm install
npm run dev
```

### 3. Откройте браузер:

```
http://localhost:3000
```

---

## 📊 Что запустилось?

После выполнения команд у вас будут работать:

- **PostgreSQL** на `localhost:5432`
  - User: `normaldance`
  - Password: `password`

- **Redis** на `localhost:6379`

- **NormalDance App** на `http://localhost:3000`

---

## 🛑 Остановка

```bash
# Остановить базы данных
docker-compose -f docker-compose-dev.yml down

# Остановить все (включая приложение)
docker-compose down
```

---

## 🐛 Проблемы?

### Docker не запускается
```bash
# Убедитесь, что Docker Desktop запущен
docker ps
```

### Порт 3000 занят
Используйте другой порт:
```bash
PORT=3001 npm run dev
```

### Порты БД занята
Измените порты в `docker-compose-dev.yml`:
```yaml
ports:
  - "5433:5432"  # используйте 5433 вместо 5432
```

### Как подключиться к PostgreSQL?

**Через psql:**
```bash
docker exec -it $(docker-compose ps -q postgres) psql -U normaldance -d normaldance
```

**Через GUI (рекомендуется):**
- DBeaver: https://dbeaver.io/
- TablePlus: https://tableplus.com/
- PgAdmin: http://localhost:5050

**Credentials:**
- Host: `localhost:5432`
- User: `normaldance`
- Password: `password`
- Database: `normaldance`

### Как подключиться к Redis?

```bash
docker exec -it $(docker-compose ps -q redis) redis-cli
```

---

## 📚 Полная документация

Для более подробной информации смотрите `DOCKER_SETUP.md`

---

## 🎯 Что дальше?

1. **Создайте `.env` файл** (если нужен):
```bash
cp .env.example .env
```

2. **Запустите миграции БД**:
```bash
npm run db:migrate
```

3. **Заполните тестовые данные**:
```bash
npm run db:seed
```

4. **Откройте Prisma Studio**:
```bash
npm run db:studio
```

---

## 🔥 Полный Docker стек (продвинутый уровень)

Если хотите запустить ВСЁ в Docker (включая приложение):

```bash
# Windows PowerShell
.\docker-start.ps1
# Выберите опцию 2

# Windows CMD
docker-start.bat
REM Выберите опцию 2

# macOS/Linux
./docker-start.sh
# Выберите опцию 2
```

⚠️ **Внимание:** Полная сборка Docker образа занимает 10-20 минут!

---

## 💡 Полезные команды

```bash
# Просмотр логов приложения
docker-compose logs -f frontend

# Просмотр логов БД
docker-compose logs -f postgres

# Проверить статус контейнеров
docker-compose ps

# Выполнить команду в контейнере
docker-compose exec frontend npm test

# Перезагрузить контейнер
docker-compose restart frontend

# Полная пересборка
docker-compose up -d --build
```

---

## 🆘 Нужна помощь?

1. Проверьте логи: `docker-compose logs -f`
2. Перезагрузите Docker Desktop
3. Очистите кэш: `docker system prune -a`
4. Смотрите полный гайд: `DOCKER_SETUP.md`

---

**Happy coding! 🎉**