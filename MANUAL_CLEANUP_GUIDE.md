# 🧹 Полная очистка Cloud.ru и настройка с нуля

## 📋 Пошаговая инструкция

### 1. 🌐 Откройте Cloud.ru Dashboard
**Ссылка**: https://partners.cloud.ru/profile/apiKeys?customerId=fd8aec7e-aeba-4626-be40-87d9520dc825&projectId=ce41b029-e7ce-4100-b3b3-c38272211b05

### 2. 🗑️ Удалите все ресурсы
- **Сервисы**: Остановите и удалите все сервисы
- **Виртуальные машины**: Удалите все VM
- **Диски**: Удалите все диски
- **Сети**: Удалите все сети

### 3. 🚀 Создайте новый проект
- Нажмите **"Создать проект"**
- **Название**: NORMALDANCE
- **Описание**: Web3 Music Platform

### 4. 🏗️ Создайте базовую инфраструктуру
- **Сеть**: normaldance-network (10.0.0.0/16)
- **Подсеть**: normaldance-subnet (10.0.1.0/24)
- **Группа безопасности**: normaldance-sg
- **Правила безопасности**: порты 22, 80, 443, 3000, 3001

### 5. 🎵 Создайте сервисы NORMALDANCE
- **PostgreSQL**: normaldance-db (512MB RAM, 10GB storage)
- **Redis**: normaldance-redis (256MB RAM, 1GB storage)
- **Контейнер**: normaldance-app (1GB RAM, порты 3000, 3001)

### 6. ⚙️ Настройте переменные окружения
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@normaldance-db:5432/normaldance
REDIS_URL=redis://normaldance-redis:6379
NEXTAUTH_URL=https://normaldance.tk
NEXTAUTH_SECRET=your_super_secret_key_change_me
```

### 7. 🌐 Настройте домен
- Зарегистрируйте домен на https://freenom.com
- Выберите: **normaldance.tk**
- Настройте DNS записи

## 📊 Ваши данные Cloud.ru
- **API Key**: 7d6d24281a43e50068d35d63f7ead515
- **Customer ID**: fd8aec7e-aeba-4626-be40-87d9520dc825
- **Project ID**: ce41b029-e7ce-4100-b3b3-c38272211b05

## 🎯 После очистки
- ✅ Cloud.ru будет полностью очищен
- ✅ Создан новый проект NORMALDANCE
- ✅ Настроена базовая инфраструктура
- ✅ Готов к развертыванию кода

## 🚀 Следующие шаги
1. **Регистрация домена** на Freenom
2. **Настройка DNS** записей
3. **Развертывание кода** NORMALDANCE
4. **Тестирование** всех функций

**✅ Готово! Теперь можете начать очистку через веб-интерфейс.**
