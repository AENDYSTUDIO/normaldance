import { logger } from "./src/lib/logger";

// Инициализация Sentry через next.config.ts с помощью @sentry/nextjs плагина
// Sentry инициализируется автоматически при использовании withSentryConfig
export async function register() {
  // Инициализация Sentry происходит через next.config.ts с помощью withSentryConfig
  // Это предотвращает конфликты с OpenTelemetry в Server Components
  logger.info(
    "Sentry initialization handled via next.config.ts withSentryConfig"
  );
}

// Обработка ошибок на сервере
export function onError(error: Error) {
  logger.error("Server error captured by instrumentation", {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });

  // Sentry автоматически обрабатывает ошибки через next.config.ts конфигурацию
  // Не нужно вызывать Sentry.captureException напрямую здесь
}

// Обработка ошибок запросов (для улучшения интеграции с Sentry)
export async function onRequestError(error: Error) {
  logger.error("Request error captured by instrumentation", {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });

  // Используем Sentry для отложенного логирования ошибок, избегая конфликта с OpenTelemetry
  try {
    // Проверяем наличие Sentry и его методов перед использованием
    const hasSentry =
      typeof process !== "undefined" && process.env.NODE_ENV !== "development";
    if (hasSentry) {
      // Отложенная загрузка Sentry для избежания конфликта с OpenTelemetry
      const Sentry = await import("@sentry/nextjs").catch(() => null);
      if (Sentry && Sentry.captureException) {
        Sentry.captureException(error);
      }
    }
  } catch (sentryError) {
    logger.error("Failed to send request error to Sentry", sentryError);
  }
}
