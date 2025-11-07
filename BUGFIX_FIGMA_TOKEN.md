# Bugfix: Figma Token Handling in MCP Server

**Дата исправления:** 2025-01-27  
**Файл:** `src/mcp/server.ts` (строки 76-86)

---

## 🐛 Проблема

В обработчике ресурса 'figma' (строки 76-84) код извлекал токен из URI пути через `path.split('/')`, но затем игнорировал извлеченный `token` и всегда использовал `process.env.FIGMA_ACCESS_TOKEN`.

### Исходный код (с ошибкой):
```typescript
case 'figma':
  const [fileKey, token] = path.split('/');
  if (token && fileKey) {
    const figmaToken = process.env.FIGMA_ACCESS_TOKEN; // ❌ Игнорирует извлеченный token
    data = await this.providers.figma.getFigmaTokens(fileKey, figmaToken || '');
  } else {
    data = { tokens: await this.providers.figma.getLocalDesignTokens() };
  }
  break;
```

**Проблема:** Извлеченный `token` из пути никогда не использовался.

---

## ✅ Исправление

Теперь код правильно использует токен из пути, если он предоставлен, с fallback на переменную окружения.

### Исправленный код:
```typescript
case 'figma':
  const [fileKey, token] = path.split('/');
  if (fileKey) {
    // Use token from path if provided, otherwise fallback to environment variable
    const figmaToken = token || process.env.FIGMA_ACCESS_TOKEN || '';
    data = await this.providers.figma.getFigmaTokens(fileKey, figmaToken);
  } else {
    // No fileKey provided, return local tokens
    data = { tokens: await this.providers.figma.getLocalDesignTokens() };
  }
  break;
```

**Изменения:**
1. ✅ Используется извлеченный `token` из пути, если он предоставлен
2. ✅ Fallback на `process.env.FIGMA_ACCESS_TOKEN`, если токен в пути отсутствует
3. ✅ Упрощена логика проверки (только `fileKey` вместо `token && fileKey`)

---

## 📋 Логика работы

### Варианты использования:

1. **С токеном в пути:** `figma://fileKey/token`
   - Использует токен из пути

2. **Без токена в пути:** `figma://fileKey`
   - Использует `FIGMA_ACCESS_TOKEN` из переменных окружения

3. **Без fileKey:** `figma://`
   - Возвращает локальные дизайн-токены

---

## ✅ Результат

- ✅ Извлеченный токен из пути теперь используется
- ✅ Корректный fallback на переменную окружения
- ✅ Упрощенная и понятная логика
- ✅ Поддержка всех вариантов использования

---

**Статус:** ✅ Исправлено и протестировано

