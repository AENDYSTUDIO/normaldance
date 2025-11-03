# 🐳 Docker Setup Guide для NormalDance

Этот документ содержит инструкции по запуску приложения на Docker.

## Быстрый старт

### Вариант 1: Запустить только базы данных (рекомендуется для разработки)

Если у вас есть Node.js установлен локально, вы можете запустить только PostgreSQL и Redis в Docker:

```bash
# Запустить только БД и Redis
docker-compose -f docker-compose-dev.yml up -d

# Проверить статус
docker-compose -f docker-compose-dev.yml ps

# Просмотреть логи
docker-compose -f docker-compose-dev.yml logs -f
```

После этого приложение будет использовать:
- PostgreSQL на `localhost:5432`
- Redis на `localhost:6379`

Затем запустите приложение локально:

```bash
npm install
npm run dev
```

Приложение будет доступно на http://localhost:3000

### Вариант 2: Запустить полный стек (всё в Docker)

⚠️ **ВНИМАНИЕ**: Полная Docker сборка может занять 10-20 минут и требует значительных ресурсов.

```bash
# Собрать образ приложения
docker build -t normaldance:latest .

# Запустить полный стек
docker-compose up -d

# Проверить статус
docker-compose ps

# Просмотреть логи приложения
docker-compose logs -f frontend
```

Приложение будет доступно на http://localhost:3000

## Управление Docker контейнерами

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Только приложения
docker-compose logs -f frontend

# Только БД
docker-compose logs -f postgres

# Только Redis
docker-compose logs -f redis
```

### Остановка контейнеров

```bash
# Остановить все сервисы
docker-compose down

# Остановить и удалить volumes (данные)
docker-compose down -v

# Остановить только БД
docker-compose stop postgres
```

### Перезапуск контейнеров

```bash
# Перезагрузить всё
docker-compose restart

# Пересоздать контейнеры
docker-compose up -d --force-recreate
```

## Доступ к базам данных

### PostgreSQL

```bash
# Подключиться через psql в контейнере
docker exec -it normaldance_postgres_1 psql -U normaldance -d normaldance

# Внутри psql
\dt              # Список таблиц
\d table_name    # Описание таблицы
SELECT COUNT(*) FROM table_name;  # Количество записей
\q               # Выход
```

Или используйте GUI клиент:
- **PgAdmin**: подключиться к `localhost:5432` с credentials `normaldance:password`
- **DBeaver**: https://dbeaver.io/
- **TablePlus**: https://tableplus.com/

### Redis

```bash
# Подключиться через redis-cli
docker exec -it normaldance_redis_1 redis-cli

# Внутри redis-cli
PING              # Проверить соединение
KEYS *            # Все ключи
GET key_name      # Получить значение
FLUSHALL          # Очистить БД
EXIT              # Выход
```

Или используйте GUI клиент:
- **RedisInsight**: https://redis.com/redis-enterprise/redisinsight/

## Отладка

### Контейнер не запускается

```bash
# Проверить ошибки
docker-compose logs frontend

# Проверить статус контейнера
docker-compose ps

# Пересоздать контейнер
docker-compose up -d --force-recreate
```

### Проблема с портами

```bash
# Проверить какой процесс использует порт
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Если порт занят, используйте другой порт в docker-compose.yml
# ports:
#   - "3001:3000"   # Вместо 3000:3000
```

### Проблема с памятью

Docker контейнеры требуют достаточно памяти:
- **Рекомендуется**: минимум 4 GB RAM
- **Оптимально**: 8+ GB RAM

Проверьте Docker Desktop settings → Resources

### Очистить всё и начать заново

```bash
# Остановить и удалить всё
docker-compose down -v

# Удалить images
docker rmi normaldance:latest

# Очистить docker cache
docker system prune -a --volumes

# Начать заново
docker-compose up -d --build
```

## Переменные окружения

Создайте `.env.docker` файл для переопределения переменных:

```env
NODE_ENV=production
DATABASE_URL=postgresql://normaldance:password@postgres:5432/normaldance
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

Используйте его в docker-compose:

```bash
docker-compose up -d --env-file .env.docker
```

## Миграции БД

```bash
# Запустить миграции Prisma
docker-compose exec frontend npx prisma migrate dev

# Заполнить БД тестовыми данными
docker-compose exec frontend npx prisma db seed

# Открыть Prisma Studio
docker-compose exec frontend npx prisma studio
```

## Продакшен деплой

Для продакшена используйте:

```bash
docker-compose -f docker-compose.full.yml up -d
```

Это включает:
- Nginx reverse proxy
- SSL сертификаты
- Оптимизированные настройки безопасности
- Мониторинг

## Полезные команды

```bash
# Размер образов
docker images | grep normaldance

# Статистика контейнеров
docker stats

# Инспектировать контейнер
docker inspect normaldance_frontend_1

# Выполнить команду в контейнере
docker-compose exec frontend npm run db:migrate

# Просмотреть сетевое соединение контейнеров
docker network ls
docker network inspect normaldance_normaldance
```

## Поддержка

Если у вас есть проблемы:

1. Проверьте логи: `docker-compose logs -f`
2. Убедитесь, что Docker Desktop запущен
3. Проверьте доступные ресурсы
4. Очистите кэш и начните заново (см. выше)

## Дополнительно

- 📖 [Docker Documentation](https://docs.docker.com/)
- 🐘 [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- 🟥 [Redis Documentation](https://redis.io/docs/)
- 🐳 [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)