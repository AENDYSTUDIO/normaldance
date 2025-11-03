# 🐳 NormalDance Docker Documentation

Полная документация по запуску NormalDance на Docker.

## 📚 Структура документации

1. **[DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md)** - Быстрый старт за 5 минут ⚡
2. **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - Полный гайд с подробными инструкциями 📖
3. **[DOCKER_REQUIREMENTS.md](./DOCKER_REQUIREMENTS.md)** - Системные требования 🖥️
4. **[Dockerfile](./Dockerfile)** - Docker конфигурация приложения
5. **[docker-compose.yml](./docker-compose.yml)** - Полный стек (приложение + БД + Redis)
6. **[docker-compose-dev.yml](./docker-compose-dev.yml)** - Для разработки (БД + Redis)

## 🚀 Три варианта запуска

### Вариант 1️⃣: Быстрая разработка (Рекомендуется) ⭐

**Идеально для:** локальной разработки с горячей перезагрузкой

```bash
# 1. Запустить БД и Redis
docker-compose -f docker-compose-dev.yml up -d

# 2. Установить зависимости
npm install

# 3. Запустить приложение
npm run dev
```

**Преимущества:**
- ✅ Быстро запускается (30 секунд)
- ✅ Горячая перезагрузка при изменении кода
- ✅ Простая отладка
- ✅ Меньше ресурсов

**Доступно на:** http://localhost:3000

---

### Вариант 2️⃣: Полный Docker стек

**Идеально для:** тестирования в production-like окружении

```bash
# 1. Собрать образ
docker build -t normaldance:latest .

# 2. Запустить стек
docker-compose up -d

# 3. Проверить статус
docker-compose ps
```

**Преимущества:**
- ✅ Настоящая production среда
- ✅ Все компоненты в Docker
- ✅ Легче для CI/CD

**Недостатки:**
- ⏱️ Сборка 10-20 минут
- 💾 Требует 8+ GB RAM

**Доступно на:** http://localhost:3000

---

### Вариант 3️⃣: Интерактивное меню (Самое простое)

**Для всех ОС:**

```bash
# Windows PowerShell
.\docker-start.ps1

# Windows CMD
docker-start.bat

# macOS/Linux
chmod +x docker-start.sh
./docker-start.sh
```

Выбирайте опции из меню:
1. Start dev environment
2. Start full Docker stack
3. Stop containers
4. View logs
5. Connect to databases
...и т.д.

---

## 🛠️ Быстрые команды

### Запуск
```bash
# Только БД (быстро)
docker-compose -f docker-compose-dev.yml up -d

# Полный стек
docker-compose up -d

# С пересборкой
docker-compose up -d --build
```

### Остановка
```bash
# Остановить контейнеры
docker-compose down

# Остановить и удалить данные
docker-compose down -v
```

### Логи
```bash
# Все логи
docker-compose logs -f

# Только приложение
docker-compose logs -f frontend

# Только БД
docker-compose logs -f postgres

# Последние 100 строк
docker-compose logs --tail=100
```

### Статус
```bash
# Список контейнеров
docker-compose ps

# Статистика использования
docker stats

# Информация о Docker
docker system info
```

---

## 📊 Доступные сервисы

### PostgreSQL
- **URL:** `postgresql://normaldance:password@localhost:5432/normaldance`
- **GUI:** DBeaver, TablePlus, PgAdmin
- **CLI:** `docker exec -it $(docker-compose ps -q postgres) psql -U normaldance -d normaldance`

### Redis
- **URL:** `redis://localhost:6379`
- **GUI:** RedisInsight
- **CLI:** `docker exec -it $(docker-compose ps -q redis) redis-cli`

### NormalDance App
- **URL:** http://localhost:3000
- **Socket.IO:** ws://localhost:3000

---

## 🔧 Конфигурация

### Изменить порты

**docker-compose.yml:**
```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # localhost:3001 -> container:3000
  
  postgres:
    ports:
      - "5433:5432"  # localhost:5433 -> container:5432
```

### Изменить пароли

```yaml
postgres:
  environment:
    - POSTGRES_PASSWORD=my-secure-password
```

### Переменные окружения

Создайте `.env.docker`:
```env
NODE_ENV=production
DATABASE_URL=postgresql://normaldance:password@postgres:5432/normaldance
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

---

## 🗄️ Работа с БД

### Миграции
```bash
# Запустить миграции
docker-compose exec frontend npx prisma migrate dev

# Сбросить БД
docker-compose exec frontend npx prisma migrate reset

# Заполнить тестовыми данными
docker-compose exec frontend npx prisma db seed
```

### Prisma Studio
```bash
# Открыть веб-интерфейс для управления БД
docker-compose exec frontend npx prisma studio
```

### Резервная копия
```bash
# Экспортировать БД
docker exec $(docker-compose ps -q postgres) pg_dump -U normaldance normaldance > backup.sql

# Импортировать БД
docker exec -i $(docker-compose ps -q postgres) psql -U normaldance normaldance < backup.sql
```

---

## 🐛 Решение проблем

### Docker не запускается
```bash
# Убедитесь что Docker Desktop запущен
docker ps

# Проверьте статус
docker-compose ps

# Просмотрите ошибки
docker-compose logs -f
```

### Порты заняты
```bash
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Измените порт или убейте процесс
```

### Недостаточно памяти
- Откройте Docker Desktop → Settings → Resources
- Увеличьте Memory до 8+ GB
- Увеличьте CPUs до 4+
- Перезагрузите Docker

### БД не доступна
```bash
# Проверьте что postgres работает
docker-compose ps postgres

# Смотрите логи БД
docker-compose logs postgres

# Переподключитесь после перезагрузки
docker-compose restart postgres
```

---

## 📈 Производительность

### Рекомендуемые настройки Docker Desktop

**Минимум:**
- CPU: 2 cores
- RAM: 4 GB
- Swap: 1 GB

**Рекомендуется:**
- CPU: 4+ cores
- RAM: 8+ GB
- Swap: 2 GB

**Идеально:**
- CPU: 8+ cores
- RAM: 16+ GB
- Swap: 4 GB

---

## 🔐 Безопасность

### Для разработки (OK)
```yaml
postgres:
  environment:
    - POSTGRES_PASSWORD=password  # Default
```

### Для production (ОБЯЗАТЕЛЬНО)
```yaml
postgres:
  environment:
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}  # Из .env
```

Создайте `.env`:
```env
POSTGRES_PASSWORD=your-very-secure-password-here
REDIS_PASSWORD=your-redis-password-here
```

---

## 📱 Для iOS/Android

### Подключиться к Docker контейнерам с мобильного

На эмуляторе используйте:
```
http://10.0.2.2:3000  # Android emulator
http://127.0.0.1:3000  # iOS simulator
```

---

## 🎓 Примеры использования

### Пример 1: Локальная разработка
```bash
# Terminal 1: Запустить БД
docker-compose -f docker-compose-dev.yml up -d

# Terminal 2: Разработка
npm install
npm run dev
```

### Пример 2: Тестирование сборки
```bash
# Собрать образ
docker build -t normaldance:test .

# Запустить для тестирования
docker run -it -p 3000:3000 normaldance:test
```

### Пример 3: Развертывание
```bash
# Собрать с тегом
docker build -t myregistry.azurecr.io/normaldance:1.0 .

# Загрузить в реестр
docker push myregistry.azurecr.io/normaldance:1.0

# Развернуть на сервере
docker pull myregistry.azurecr.io/normaldance:1.0
docker-compose up -d
```

---

## 📚 Дополнительные ресурсы

- 📖 [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md) - За 5 минут
- 📚 [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Полный гайд
- 🖥️ [DOCKER_REQUIREMENTS.md](./DOCKER_REQUIREMENTS.md) - Требования
- 🐳 [Docker Official Docs](https://docs.docker.com/)
- 🐘 [PostgreSQL Docs](https://www.postgresql.org/docs/)
- 🟥 [Redis Docs](https://redis.io/docs/)

---

## 🆘 Нужна помощь?

1. **Быстрый вопрос?** → Смотрите [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md)
2. **Проблема?** → Смотрите "Решение проблем" выше
3. **Детали?** → Смотрите [DOCKER_SETUP.md](./DOCKER_SETUP.md)
4. **Требования?** → Смотрите [DOCKER_REQUIREMENTS.md](./DOCKER_REQUIREMENTS.md)

---

## ✅ Контрольный список

- [ ] Docker установлен (`docker --version`)
- [ ] Docker работает (`docker ps`)
- [ ] Docker Compose установлен (`docker-compose --version`)
- [ ] Node.js установлен (`node --version`)
- [ ] Порты 3000, 5432, 6379 свободны
- [ ] Минимум 4 GB RAM в Docker Desktop
- [ ] Прочитано [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md)

---

## 🎉 Готовы?

### Вариант 1 (Рекомендуется - 5 минут)
```bash
docker-compose -f docker-compose-dev.yml up -d
npm install && npm run dev
# Откройте http://localhost:3000
```

### Вариант 2 (Меню - самое простое)
```bash
# Windows PowerShell
.\docker-start.ps1

# Windows CMD
docker-start.bat

# macOS/Linux
./docker-start.sh
```

---

**Версия:** 0.3.0  
**Последнее обновление:** 2024  
**Лицензия:** MIT