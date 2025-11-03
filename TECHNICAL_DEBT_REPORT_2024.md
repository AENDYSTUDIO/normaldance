# 🔴 ТЕХНИЧЕСКИЙ ДОЛГ И ПРОБЛЕМЫ - NORMALDANCE 0.3.0

**Дата создания:** 2024  
**Версия проекта:** 0.3.0  
**Статус:** ТРЕБУЕТ НЕМЕДЛЕННОГО ВНИМАНИЯ  

---

## 📊 SUMMARY SCORECARD

| Критерий | Оценка | Статус | Приоритет |
|----------|--------|--------|-----------|
| **Merge Conflicts** | 🔴 9/10 | Критично | P0 |
| **ESM/CommonJS Issues** | 🔴 8/10 | Блокирует | P0 |
| **Prisma Schema** | 🟠 7/10 | Серьёзно | P1 |
| **Security** | 🟠 6/10 | Важно | P1 |
| **Dependencies** | 🟠 7/10 | Серьёзно | P1 |
| **Type Safety** | 🟡 5/10 | Нужна работа | P2 |
| **Testing** | 🟡 4/10 | Недостаточно | P2 |
| **CI/CD** | 🟠 6/10 | Конфликты | P1 |
| **Документация** | 🟡 5/10 | Устарела | P3 |
| **Код Качество** | 🟡 5/10 | Дублирование | P2 |

**Итоговый Score:** 🔴 **4.8/10** — **НЕ ГОТОВ К PRODUCTION**

---

## 🔴 **КАТЕГОРИЯ A: КРИТИЧЕСКИЕ БЛОКЕРЫ** (P0)

### A1. Merge Conflicts (КРИТИЧНО)

```
Статус: ❌ БЛОКИРУЕТ РАЗРАБОТКУ
Риск: ОЧЕНЬ ВЫСОКИЙ
Найдено: 8 конфликтов в 6 файлах
Время исправления: 2-4 часа
```

**Найденные конфликты:**

#### 1.1. `next.config.ts` (3 конфликта)

**Конфликт 1: CSP Header (строки 76-86)**
```typescript
// ❌ HEAD версия
value: require("./config/csp").getCspHeader(),

// ✅ Feature версия
value: [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval' https://telegram.org https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.ipfs.io https://*.ipfs.dweb.link https://ipfs.io",
  "connect-src 'self' https://api.mainnet-beta.solana.com https://ton.org https://tonapi.io",
].join("; "),
```

**Проблемы:**
- ❌ HEAD версия использует `require()` в ESM проекте
- ❌ Файл `config/csp.js` может не существовать
- ✅ Feature версия корректна, но может быть неполная

**Решение:** Использовать feature версию (inline CSP)

**Конфликт 2: Webpack configuration (строки 409-413)**
```typescript
// ❌ Конфликт между комментариями
<<<<<<< HEAD
  // Конфигурация webpack
=======
  // Конфигурация webpack - оптимизирована для Vercel
>>>>>>> bc71d7127c2a35bd8fe59f3b81f67380bae7d337
```

**Решение:** Использовать feature версию (оптимизировано для Vercel)

**Конфликт 3: Node modules fallback (строки 446-450)**
```typescript
// Аналогичный конфликт комментариев
// Решение: Использовать feature версию
```

#### 1.2. `.github/workflows/ci-cd.yml` (1 конфликт)

**Конфликт: Job structure (строки 114-118)**
```yaml
# ❌ HEAD версия (более полная)
jobs:
  quick-checks:
    name: Quick Checks
    runs-on: ubuntu-latest
    # ... полный набор шагов ...
  
  security:
    name: Security Audit
    # ...
  
  test:
    name: Unit Tests
    # ...
  
  build:
    name: Build Check
    # ...
  
  all-checks-passed:
    name: All Checks Passed
    # ...

# ❌ Feature версия (минимальная)
jobs:
  test:
    runs-on: ubuntu-latest
    # ... только тесты ...
```

**Решение:** Использовать HEAD версию (более полная и правильная)

#### 1.3. `package-lock.json` (версия конфликт)

```json
// ❌ КОНФЛИКТ
"version": "0.0.3"  // HEAD
vs
"version": "0.2.0"  // Feature
```

**Решение:**
```bash
npm install  # Переинициализировать lock file
```

#### 1.4. `docker-compose.yml` (3 конфликта)

**Конфликт 1: User setting (строки 50-54)**
```yaml
# HEAD версия
user: "1000:1000"

# Feature версия  
dockerfile: docker/nextjs.Dockerfile
```

**Конфликт 2: PostgreSQL config (строки 125-129)**
```yaml
user: "999:999"  # HEAD
vs
POSTGRES_DB: normaldance  # Feature
```

**Конфликт 3: Networks (строки 153-157)**
```yaml
user: "999:999"  # HEAD
vs
networks:
  - normaldance  # Feature
```

**Решение:** Объединить оба подхода - использовать оба блока

#### 1.5. `monitoring/prometheus.yml` (5 конфликтов)

**Конфликты в job configurations:**
```yaml
# Множественные конфликты между:
# - targets конфигурацией
# - scrape_interval путями
# - Kubernetes конфигурацией

# Решение: Использовать feature версию (более новая)
```

#### 1.6. `.gitignore` (1 конфликт)

```
# ❌ КОНФЛИКТ
<<<<<<< HEAD
MVP/node_modules/
=======
.gemini/
```

**Решение:** Добавить оба паттерна
```
MVP/node_modules/
.gemini/
```

---

### A2. ESM vs CommonJS Mismatch (КРИТИЧНО)

```
Статус: ❌ РАЗБИВАЕТ НА ЗАПУСКЕ
Приоритет: P0
Найдено: 10+ случаев require()
Время исправления: 3-5 часов
```

**Проблема:** Проект в ESM (`"type": "module"`), но код использует `require()`

#### Найденные случаи:

**Проблема 1: next.config.ts (строки 4-11)**
```typescript
// ❌ ОШИБКА (ESM проект не поддерживает require)
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

// ✅ ИСПРАВЛЕНО
import withBundleAnalyzer from "@next/bundle-analyzer";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Или используй динамический импорт:
const { default: withBundleAnalyzer } = await import("@next/bundle-analyzer");
```

**Проблема 2: next.config.ts (строка 76