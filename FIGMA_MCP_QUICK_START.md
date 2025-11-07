# Figma MCP - Быстрый старт

## 🚀 Быстрая настройка

### 1. Получить Figma Access Token

1. Откройте [Figma Settings](https://www.figma.com/settings)
2. Перейдите в раздел "Personal Access Tokens"
3. Создайте новый токен
4. Скопируйте токен (начинается с `figd_`)

### 2. Добавить токен в .env

```bash
# Добавьте в .env файл
FIGMA_ACCESS_TOKEN=figd_your_token_here
```

### 3. Запустить MCP сервер

```bash
npm run mcp:dev
```

---

## 📖 Примеры использования

### Анализ компонента Button

```typescript
// Через MCP tool
await mcp.callTool('analyze_component_design', {
  componentPath: 'src/components/ui/button.tsx'
});
```

### Получить токены из Figma

```typescript
await mcp.callTool('get_figma_tokens', {
  fileKey: 'abc123xyz', // File key из URL Figma
  // accessToken опционально, используется из .env
});
```

### Генерация рекомендаций

```typescript
await mcp.callTool('generate_design_recommendations', {
  componentPath: 'src/components/ui/button.tsx' // опционально
});
```

### Проверка доступности

```typescript
await mcp.callTool('check_accessibility', {
  componentPath: 'src/components/ui/button.tsx'
});
```

### Сравнение с Figma

```typescript
await mcp.callTool('compare_design_systems', {
  figmaFileKey: 'abc123xyz' // File key из URL Figma
});
```

---

## 🔍 Как получить Figma File Key

Figma File Key находится в URL файла:

```
https://www.figma.com/file/{FILE_KEY}/Design-System
```

Например:
- URL: `https://www.figma.com/file/abc123xyz/Design-System`
- File Key: `abc123xyz`

---

## 📋 Доступные инструменты

1. **analyze_component_design** - Анализ UI компонента
2. **get_figma_tokens** - Получение токенов из Figma
3. **generate_design_recommendations** - Генерация рекомендаций
4. **check_accessibility** - Проверка доступности (WCAG)
5. **compare_design_systems** - Сравнение дизайн-систем

---

## 📚 Документация

- Полная документация: `FIGMA_MCP_INTEGRATION.md`
- Рекомендации по улучшению: `DESIGN_IMPROVEMENTS.md`

---

## ✅ Чеклист

- [ ] Получен Figma Access Token
- [ ] Добавлен токен в .env
- [ ] Запущен MCP сервер
- [ ] Протестирована интеграция
- [ ] Проанализированы компоненты
- [ ] Применены рекомендации

---

**Готово к использованию!** 🎨

