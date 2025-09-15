# Makefile для NORMALDANCE Git-воркфлоу
# Обеспечивает безопасное управление ключами и автоматизацию процессов

.PHONY: help install-hooks feature key-get key-drop key-shell rollback hotfix clean security-audit docker-up docker-down docker-logs docker-shell deps test build dev lint format docs key-status

# Цвета для вывода
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

# Конфигурация
VAULT_ADDR ?= https://vault.example.com
VAULT_TOKEN ?=
VAULT_PATH ?= secret/data/normaldance/keys
TEMP_DIR ?= /tmp
TTL_MINUTES ?= 30
REMOTE ?= origin
MAIN_BRANCH ?= main

# Переменные окружения
export VAULT_ADDR
export VAULT_TOKEN
export VAULT_PATH
export TEMP_DIR
export TTL_MINUTES
export REMOTE
export MAIN_BRANCH

# Логирование
log-info = @echo "$(GREEN)[INFO]$(NC) $1"
log-warn = @echo "$(YELLOW)[WARN]$(NC) $1"
log-error = @echo "$(RED)[ERROR]$(NC) $1"

# Проверка зависимостей
check-deps:
	@$(call log-info, "Проверка зависимостей...")
	@command -v git >/dev/null 2>&1 || { $(call log-error, "Git не установлен"); exit 1; }
	@command -v curl >/dev/null 2>&1 || { $(call log-error, "curl не установлен"); exit 1; }
	@command -v jq >/dev/null 2>&1 || { $(call log-error, "jq не установлен"); exit 1; }
	@$(call log-info, "Все зависимости установлены")

# Установка Git хуков
install-hooks: check-deps
	@$(call log-info, "Установка Git хуков...")
	@mkdir -p .git/hooks
	@cp scripts/hooks/pre-commit .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@$(call log-info, "Git хуки успешно установлены")

# Создание feature-ветки
feature: check-deps
	@if [ -z "$(name)" ]; then \
		$(call log-error, "Укажите имя ветки: make feature name=key-auth"); \
		exit 1; \
	fi
	@$(call log-info, "Создание feature-ветки: $(name)")
	@git checkout -b feature/$(name)

# Извлечение ключей
key-get: check-deps
	@$(call log-info, "Извлечение ключей...")
	@./scripts/key-get.sh

# Очистка ключей
key-drop: check-deps
	@$(call log-info, "Очистка ключей...")
	@./scripts/key-drop.sh

# Запуск изолированного окружения с ключами
key-shell: key-get
	@$(call log-info, "Запуск изолированного окружения...")
	@if [ -n "$$(docker ps -q -f name=key-shell)" ]; then \
		$(call log-warn, "Контейнер key-shell уже запущен"); \
		docker exec -it key-shell /bin/bash; \
	else \
		docker run --rm -it --name key-shell \
			-v $(TEMP_DIR):/keys:ro \
			-v $(PWD):/workspace \
			-w /workspace \
			--tmpfs /tmp:size=1m \
			--tmpfs /var/tmp:size=1m \
			ubuntu:22.04 /bin/bash; \
	fi

# Docker окружение для разработки
docker-up: check-deps
	@$(call log-info, "Запуск Docker окружения...")
	@docker compose -f docker-compose.dev.yml up -d
	@$(call log-info, "Docker окружение запущено")

docker-down: check-deps
	@$(call log-info, "Остановка Docker окружения...")
	@docker compose -f docker-compose.dev.yml down
	@$(call log-info, "Docker окружение остановлено")

docker-logs: check-deps
	@$(call log-info, "Просмотр логов Docker контейнеров...")
	@docker compose -f docker-compose.dev.yml logs -f

docker-shell: check-deps
	@$(call log-info, "Запуск shell в Docker контейнере...")
	@docker compose -f docker-compose.dev.yml exec app /bin/bash || true

# Очистка временных файлов
clean:
	@$(call log-info, "Очистка временных файлов...")
	@find . -name "*.tmp" -delete
	@find . -name "*.log" -delete
	@find . -name ".DS_Store" -delete
	@find . -name "Thumbs.db" -delete
	@rm -rf node_modules/.cache || true
	@$(call log-info, "Временные файлы удалены")

# Аудит безопасности
security-audit: check-deps
	@$(call log-info, "Запуск аудита безопасности...")
	@./scripts/security-audit.sh

# Зависимости/тесты/сборка/линт
deps:
	@npm install

test: deps
	@npm test

build: deps
	@npm run build

dev: deps
	@npm run dev

lint: deps
	@npm run lint || true

format: deps
	@npm run format || true

docs:
	@npm run docs || true

# Проверка статуса ключей
key-status:
	@if [ -f "$(TEMP_DIR)/keys.json" ]; then \
		$(call log-info, "Ключи активны: $(TEMP_DIR)/keys.json"); \
		$(call log-info, "Время жизни: $(TTL_MINUTES) минут"); \
	else \
		$(call log-warn, "Ключи не активны"); \
	fi

# Показ справки
help:
	@echo "$(GREEN)NORMALDANCE Git-воркфлоу$(NC)"
	@echo ""
	@echo "$(YELLOW)Основные команды:$(NC)"
	@echo "  make feature name=<branch>    - Создать feature-ветку"
	@echo "  make key-get                  - Извлечь ключи"
	@echo "  make key-drop                 - Очистить ключи"
	@echo "  make key-shell                - Запустить изолированное окружение"
	@echo "  make key-status               - Проверить статус ключей"
	@echo "  make install-hooks            - Установить Git хуки"
	@echo ""
	@echo "$(YELLOW)Разработка:$(NC)"
	@echo "  make deps                     - Установить зависимости"
	@echo "  make test                     - Запустить тесты"
	@echo "  make build                    - Собрать проект"
	@echo "  make dev                      - Запустить разработку"
	@echo "  make lint                     - Проверить качество кода"
	@echo "  make format                   - Отформатировать код"
	@echo ""
	@echo "$(YELLOW)Docker:$(NC)"
	@echo "  make docker-up                - Запустить Docker окружение"
	@echo "  make docker-down              - Остановить Docker окружение"
	@echo "  make docker-logs              - Просмотреть логи"
	@echo "  make docker-shell             - Shell в контейнере"
	@echo ""
	@echo "$(YELLOW)Безопасность:$(NC)"
	@echo "  make security-audit           - Запустить аудит безопасности"
	@echo "  make clean                    - Очистить временные файлы"

.DEFAULT_GOAL := help
