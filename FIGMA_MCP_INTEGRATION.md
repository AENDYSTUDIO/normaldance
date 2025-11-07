# Figma MCP Integration - NORMAL DANCE

## 📋 Обзор

Figma MCP провайдер интегрирован в NORMAL DANCE MCP сервер для анализа и улучшения дизайна проекта. Провайдер предоставляет инструменты для работы с Figma API, анализа UI компонентов и генерации рекомендаций по улучшению дизайна.

## 🚀 Возможности

### 1. Анализ UI компонентов
- Автоматический анализ компонентов на проблемы дизайна
- Проверка доступности (WCAG 2.1 AA)
- Оценка консистентности с дизайн-системой
- Генерация рекомендаций по улучшению

### 2. Интеграция с Figma API
- Получение дизайн-токенов из Figma файлов
- Сравнение Figma дизайн-системы с локальной
- Выявление различий и отсутствующих токенов

### 3. Генерация рекомендаций
- Общие рекомендации по улучшению дизайна
- Специфические рекомендации для компонентов
- Рекомендации по доступности
- Рекомендации по консистентности

### 4. Проверка доступности
- Проверка соответствия WCAG 2.1 AA
- Анализ контраста цветов
- Проверка наличия aria-labels
- Проверка keyboard navigation

## 🛠️ Использование

### MCP Tools

#### 1. `analyze_component_design`
Анализирует UI компонент и предоставляет рекомендации.

```typescript
{
  componentPath: "src/components/ui/button.tsx"
}
```

**Результат:**
- Список проблем дизайна
- Рекомендации по улучшению
- Оценка доступности (0-100)
- Оценка консистентности (0-100)

#### 2. `get_figma_tokens`
Получает дизайн-токены из Figma файла.

```typescript
{
  fileKey: "abc123xyz",
  accessToken: "figd_..." // опционально, использует FIGMA_ACCESS_TOKEN
}
```

**Результат:**
- Массив дизайн-токенов (цвета, spacing, типографика, etc.)

#### 3. `generate_design_recommendations`
Генерирует общие рекомендации по улучшению дизайна.

```typescript
{
  componentPath: "src/components/ui/button.tsx" // опционально
}
```

**Результат:**
- Список рекомендаций по улучшению дизайна

#### 4. `check_accessibility`
Проверяет соответствие компонента WCAG 2.1 AA.

```typescript
{
  componentPath: "src/components/ui/button.tsx"
}
```

**Результат:**
- Оценка доступности (0-100)
- Список проблем
- Рекомендации по исправлению

#### 5. `compare_design_systems`
Сравнивает Figma дизайн-систему с локальной.

```typescript
{
  figmaFileKey: "abc123xyz",
  accessToken: "figd_..." // опционально
}
```

**Результат:**
- Список различий
- Отсутствующие токены
- Рекомендации по синхронизации

### MCP Resources

#### `design://`
Получает полный отчет о дизайн-системе проекта.

**Результат:**
- Сводка дизайн-системы
- Все дизайн-токены
- Анализ компонентов
- Рекомендации

#### `figma://`
Получает дизайн-токены из Figma или локальной системы.

**Формат URI:**
- `figma://` - локальные токены
- `figma://{fileKey}/{token}` - токены из Figma

## 📦 Установка

### 1. Настройка переменных окружения

Добавьте Figma Access Token в `.env`:

```bash
FIGMA_ACCESS_TOKEN=figd_your_token_here
```

### 2. Получение Figma Access Token

1. Перейдите в Figma Settings
2. Account → Personal Access Tokens
3. Создайте новый токен
4. Скопируйте токен в `.env`

### 3. Запуск MCP сервера

```bash
npm run mcp:dev
```

## 🎨 Примеры использования

### Анализ компонента Button

```typescript
// Через MCP tool
await mcp.callTool('analyze_component_design', {
  componentPath: 'src/components/ui/button.tsx'
});

// Результат:
{
  componentName: 'button.tsx',
  filePath: 'src/components/ui/button.tsx',
  designIssues: [],
  recommendations: [
    'Добавить aria-label для иконок без текста',
    'Убедиться в достаточном контрасте цветов (WCAG AA)',
    'Использовать единые размеры из дизайн-системы',
    'Проверить соответствие spacing tokens'
  ],
  accessibilityScore: 85,
  consistencyScore: 90
}
```

### Получение токенов из Figma

```typescript
await mcp.callTool('get_figma_tokens', {
  fileKey: 'abc123xyz',
  accessToken: 'figd_...'
});

// Результат:
[
  {
    name: 'primary-color',
    type: 'color',
    value: '#3B82F6',
    description: 'Primary brand color'
  },
  // ...
]
```

### Сравнение дизайн-систем

```typescript
await mcp.callTool('compare_design_systems', {
  figmaFileKey: 'abc123xyz'
});

// Результат:
{
  differences: [
    'primary-color: Figma="#3B82F6" vs Local="hsl(var(--primary))"'
  ],
  missingTokens: [
    {
      name: 'new-brand-color',
      type: 'color',
      value: '#FF5733'
    }
  ],
  recommendations: [
    'Обновить primary-color для соответствия Figma',
    'Добавить токен new-brand-color из Figma'
  ]
}
```

## 🔧 Архитектура

### Структура файлов

```
src/mcp/
├── server.ts              # MCP сервер с Figma интеграцией
└── providers/
    └── figma.ts          # Figma MCP провайдер
```

### Ключевые классы

#### `FigmaContextProvider`
Основной класс провайдера с методами:
- `analyzeComponent()` - анализ компонента
- `getFigmaTokens()` - получение токенов из Figma
- `getLocalDesignTokens()` - получение локальных токенов
- `compareWithFigma()` - сравнение систем
- `generateDesignRecommendations()` - генерация рекомендаций
- `checkAccessibility()` - проверка доступности
- `generateDesignSystemReport()` - полный отчет

## 📊 Рекомендации по дизайну

### Общие рекомендации

1. **Использовать единые дизайн-токены**
   - Цвета из design system
   - Spacing tokens
   - Typography scale

2. **Улучшить доступность**
   - Контраст минимум 4.5:1 для текста
   - aria-labels для интерактивных элементов
   - Keyboard navigation

3. **Оптимизация для мобильных**
   - Responsive breakpoints
   - Touch-friendly размеры
   - Adaptive layouts

4. **Визуальная иерархия**
   - Правильные размеры шрифтов
   - Consistent spacing
   - Color semantics

5. **Производительность**
   - CSS variables вместо inline styles
   - Оптимизация анимаций
   - Lazy loading компонентов

## 🎯 Следующие шаги

1. **Настроить Figma Access Token**
   - Добавить в `.env`
   - Протестировать подключение

2. **Проанализировать компоненты**
   - Запустить анализ всех UI компонентов
   - Применить рекомендации

3. **Синхронизировать дизайн-систему**
   - Сравнить Figma с локальной системой
   - Обновить токены при необходимости

4. **Улучшить доступность**
   - Проверить все компоненты на WCAG соответствие
   - Исправить выявленные проблемы

5. **Автоматизировать проверки**
   - Добавить в CI/CD pipeline
   - Регулярные аудиты дизайна

## 📚 Дополнительные ресурсы

- [Figma API Documentation](https://www.figma.com/developers/api)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design Tokens Specification](https://tr.designtokens.org/)
- [MCP Documentation](https://modelcontextprotocol.io/)

## 🔒 Безопасность

- **Не коммитьте Figma Access Token** в репозиторий
- Используйте `.env` файлы и secrets management
- Ротация токенов каждые 90 дней
- Ограничьте права токена только необходимыми файлами

## ✅ Чеклист интеграции

- [x] Создан FigmaContextProvider
- [x] Интегрирован в MCP сервер
- [x] Добавлены MCP tools
- [x] Добавлены MCP resources
- [ ] Настроен Figma Access Token
- [ ] Протестирована интеграция
- [ ] Добавлена документация
- [ ] Настроен CI/CD для проверок

---

**Версия:** 1.0.0  
**Дата:** 2025-01-27  
**Статус:** ✅ Готов к использованию

