# 🐳 Docker System Requirements

NormalDance требует определенных системных ресурсов для корректной работы на Docker.

## ✅ Минимальные требования

### CPU
- **Минимум:** 2 CPU cores
- **Рекомендуется:** 4+ CPU cores

### RAM (Память)
- **Минимум:** 4 GB
- **Рекомендуется:** 8+ GB

### Disk Space (Свободное место)
- **Для БД:** 500 MB - 2 GB
- **Для Docker образов:** 3-5 GB
- **Для логов и кэша:** 1-2 GB
- **Итого:** минимум 5-10 GB свободного места

### Network
- Стабильное интернет соединение для загрузки Docker образов
- Доступ к портам: 3000, 3001, 5432, 6379

## 🖥️ Поддерживаемые операционные системы

### Windows
- **Версия:** Windows 10 Pro/Enterprise/Education или Windows 11
- **WSL2:** Обязательна установка WSL2 (Windows Subsystem for Linux 2)
- **Docker Desktop:** Последняя версия с поддержкой WSL2
- **Гипервизор:** Hyper-V должен быть включен

### macOS
- **Версия:** macOS 11 (Big Sur) или новее
- **Архитектура:** Intel или Apple Silicon (M1/M2/M3)
- **Docker Desktop:** Последняя версия
- **Рекомендуется:** 8 GB RAM минимум для плавной работы

### Linux
- **Дистрибутивы:** Ubuntu 20.04+, Debian 10+, CentOS 8+, Fedora 32+
- **Ядро:** Linux 4.4+
- **Docker:** 20.10+
- **Docker Compose:** 2.0+

## 📋 Предварительные условия

### 1. Docker Installation

**Windows:**
```bash
# Скачайте Docker Desktop с https://www.docker.com/products/docker-desktop
# Установите и перезагрузитесь
# Убедитесь что WSL2 включен
wsl --list --verbose
```

**macOS:**
```bash
# Скачайте Docker Desktop с https://www.docker.com/products/docker-desktop
# или используйте Homebrew
brew install docker
brew install docker-compose
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Перезагрузитесь или выполните: newgrp docker
```

### 2. Проверка установки

```bash
docker --version
docker-compose --version
docker ps  # Должно работать без sudo
```

### 3. Node.js (для локальной разработки)

Если вы используете docker-compose-dev.yml (рекомендуется):
- **Node.js:** 18.x или выше
- **npm:** 9.x или выше

```bash
node --version
npm --version
```

## 🔧 Docker Desktop Настройки

### Windows/macOS

1. Откройте **Docker Desktop → Settings/Preferences**
2. Перейдите в **Resources**
3. Установите:
   - **CPUs:** минимум 4 (если есть)
   - **Memory:** минимум 6-8 GB
   - **Swap:** 2 GB (если есть опция)
   - **Disk image size:** 50+ GB

### Linux

Docker автоматически использует системные ресурсы. Убедитесь, что:
- Достаточно свободного места на диске
- Docker daemon запущен: `sudo systemctl start docker`

## 📊 Рекомендуемые конфигурации

### Для локальной разработки (Вариант 1 - Рекомендуется)
```
OS: Windows/macOS/Linux
CPU: 4+ cores
RAM: 8+ GB
Disk: 20+ GB SSD
Setup: docker-compose-dev.yml
App: Запускается локально (npm run dev)
```

### Для полного Docker стека (Вариант 2)
```
OS: Windows/macOS/Linux
CPU: 8+ cores
RAM: 16+ GB
Disk: 50+ GB SSD
Setup: docker-compose.yml
App: Запускается в контейнере
```

### Для продакшена (Вариант 3)
```
OS: Linux (рекомендуется)
CPU: 16+ cores
RAM: 32+ GB
Disk: 100+ GB SSD
Setup: docker-compose.full.yml
Infrastructure: Kubernetes (опционально)
```

## ⚙️ Проверка совместимости

```bash
# Проверить версию Docker
docker --version

# Проверить поддержку WSL2 (Windows)
wsl --list --verbose

# Проверить docker daemon
docker ps

# Проверить docker-compose
docker-compose --version

# Проверить доступную память
docker stats
```

## 🚨 Частые проблемы и решения

### Docker не запускается на Windows
**Проблема:** "Docker Desktop requires Windows Pro/Enterprise"
**Решение:** Используйте Docker Toolbox (устаревший) или обновитесь до Pro версии

### WSL2 не установлен
```bash
# Установите WSL2
wsl --install

# Установите Linux kernel update package
# Скачайте с https://aka.ms/wsl2kernel

# Установите по умолчанию WSL 2
wsl --set-default-version 2
```

### Недостаточно памяти
**Проблема:** "Cannot connect to Docker daemon"
**Решение:** Увеличьте выделенную память в Docker Desktop Settings

### Порты заняты
```bash
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Убейте процесс или измените порт
```

### Контейнер не запускается
```bash
# Проверьте логи
docker-compose logs -f

# Очистите и начните заново
docker-compose down -v
docker-compose up -d --build
```

## 📈 Масштабирование ресурсов

### Если приложение медленное
1. Увеличьте RAM в Docker Desktop (минимум 8 GB)
2. Увеличьте CPUs (минимум 4 cores)
3. Убедитесь, что SSD, а не HDD
4. Закройте другие приложения

### Если БД медленная
1. Увеличьте shared_buffers в PostgreSQL
2. Добавьте индексы на часто используемые колонки
3. Проверьте логи: `docker-compose logs postgres`

## 🔐 Безопасность

### Для продакшена измените пароли

**docker-compose.yml:**
```yaml
environment:
  - POSTGRES_PASSWORD=strong-password-here
  - REDIS_PASSWORD=strong-password-here
```

**Создайте `.env` файл:**
```env
DATABASE_PASSWORD=your-secure-password
REDIS_PASSWORD=your-secure-password
```

## 🆘 Диагностика

```bash
# Полная диагностика
docker system info

# Проверить диск
docker system df

# Проверить сеть
docker network inspect normaldance

# Проверить процессы
docker ps -a

# Проверить логи системы
docker-compose logs --tail=100
```

## 📚 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Docker Desktop System Requirements](https://docs.docker.com/desktop/install/)
- [WSL2 Installation Guide](https://docs.microsoft.com/en-us/windows/wsl/install)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Redis Docker](https://hub.docker.com/_/redis)

## ✓ Контрольный список перед запуском

- [ ] Docker Desktop установлен и запущен
- [ ] Docker версия 20.10+
- [ ] Docker Compose версия 2.0+
- [ ] WSL2 включен (Windows)
- [ ] Минимум 4 GB RAM выделено Docker
- [ ] Минимум 10 GB свободного места на диске
- [ ] Node.js 18+ установлен (для локальной разработки)
- [ ] Порты 3000, 5432, 6379 свободны
- [ ] Интернет соединение стабильно

---

**Готовы? Начните с:** `docker-compose -f docker-compose-dev.yml up -d`
