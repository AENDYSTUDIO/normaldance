/**
 * Тесты для SecureLogger в NORMALDANCE.
 * Проверяет безопасное логирование с санитизацией данных.
 */

import { InputSanitizer } from "../input-sanitizer";
import { SecureLogger } from "../secure-logger";

// Mock для winston logger
jest.mock("winston", () => {
  const mLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };
  return {
    createLogger: jest.fn(() => mLogger),
  };
});

// Импортируем модуль после мока
const winston = require("winston");
const logger = winston.createLogger();

describe("SecureLogger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should sanitize and log info messages", () => {
    const message = "Test info message";
    const data = { user: "test@example.com" };

    SecureLogger.info(message, data);

    expect(logger.info).toHaveBeenCalledWith(
      InputSanitizer.sanitizeLog(message),
      InputSanitizer.sanitizeLog(data)
    );
  });

  test("should sanitize and log error messages", () => {
    const message = "Test error message";
    const error = new Error("Sample error");

    SecureLogger.error(message, error);

    expect(logger.error).toHaveBeenCalledWith(
      InputSanitizer.sanitizeLog(message),
      InputSanitizer.sanitizeLog(error.message),
      { stack: error.stack }
    );
  });

  test("should sanitize and log warning messages", () => {
    const message = "Test warning message";
    const data = { userId: 123 };

    SecureLogger.warn(message, data);

    expect(logger.warn).toHaveBeenCalledWith(
      InputSanitizer.sanitizeLog(message),
      InputSanitizer.sanitizeLog(data)
    );
  });

  test("should sanitize and log custom level messages", () => {
    const level = "debug";
    const message = "Test debug message";
    const data = { debugInfo: "debug value" };

    SecureLogger.log(level, message, data);

    expect(logger.log).toHaveBeenCalledWith(
      level,
      InputSanitizer.sanitizeLog(message),
      InputSanitizer.sanitizeLog(data)
    );
  });

  test("should sanitize and log security messages", () => {
    const message = "Security event occurred";
    const context = { ip: "192.168.1.1", userAgent: "Mozilla/5.0" };

    SecureLogger.security(message, context);

    const sanitizedMessage = InputSanitizer.sanitizeLog(message);
    const sanitizedContext = InputSanitizer.sanitizeLog(context);

    expect(logger.info).toHaveBeenCalledWith(
      `[SECURITY] ${sanitizedMessage}`,
      sanitizedContext
    );
  });

  test("should handle XSS attempts in logged data", () => {
    const xssMessage = '<script>alert("XSS")</script>';
    const xssData = {
      html: '<img src="x" onerror="alert(1)">',
      url: "javascript:alert(1)",
    };

    SecureLogger.info(xssMessage, xssData);

    // Проверяем, что санитизация была выполнена
    const sanitizedMessage = InputSanitizer.sanitizeLog(xssMessage);
    const sanitizedData = InputSanitizer.sanitizeLog(xssData);

    expect(logger.info).toHaveBeenCalledWith(sanitizedMessage, sanitizedData);
    expect(sanitizedMessage).not.toContain("<script>");
    expect(JSON.stringify(sanitizedData)).not.toContain("javascript:");
  });

  test("should handle SQL injection attempts in logged data", () => {
    const sqlMessage = "SELECT * FROM users WHERE id = 1 OR 1=1";
    const sqlData = {
      query: "DROP TABLE users; --",
      userInput: "'; DROP TABLE users; --",
    };

    SecureLogger.info(sqlMessage, sqlData);

    const sanitizedMessage = InputSanitizer.sanitizeLog(sqlMessage);
    const sanitizedData = InputSanitizer.sanitizeLog(sqlData);

    expect(logger.info).toHaveBeenCalledWith(sanitizedMessage, sanitizedData);
    expect(sanitizedMessage).not.toContain("OR 1=1");
    expect(JSON.stringify(sanitizedData)).not.toContain("DROP TABLE");
  });

  test("should handle path traversal attempts in logged data", () => {
    const pathMessage = "../../../etc/passwd";
    const pathData = {
      filePath: "../../../../windows/system32",
      path: "..\\..\\..\\windows\\system32",
    };

    SecureLogger.info(pathMessage, pathData);

    const sanitizedMessage = InputSanitizer.sanitizeLog(pathMessage);
    const sanitizedData = InputSanitizer.sanitizeLog(pathData);

    expect(logger.info).toHaveBeenCalledWith(sanitizedMessage, sanitizedData);
    expect(sanitizedMessage).not.toContain("../");
    expect(JSON.stringify(sanitizedData)).not.toContain("..\\");
  });
});
