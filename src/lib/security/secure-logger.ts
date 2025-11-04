import { InputSanitizer } from "./input-sanitizer";

// Dynamically import Winston only on server (not in Edge Runtime)
let logger: any = null;

const getLogger = () => {
  if (logger) return logger;

  // Only initialize Winston on server-side, not in Edge Runtime
  if (typeof window === "undefined") {
    try {
      const winston = require("winston");

      const transports: any[] = [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ];

      // Add File transport only in production (not in tests or Edge Runtime)
      if (process.env.NODE_ENV === "production") {
        try {
          transports.push(
            new winston.transports.File({ filename: "logs/security.log" })
          );
        } catch (e) {
          // Ignore if fs is not available
        }
      }

      logger = winston.createLogger({
        level: "info",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.splat(),
          winston.format.json()
        ),
        transports,
      });
    } catch (e) {
      // Winston not available in Edge Runtime - use console fallback
      logger = null;
    }
  }

  return logger;
};

export class SecureLogger {
  static info(message: string, data?: unknown) {
    const sanitizedMsg = InputSanitizer.sanitizeLog(message);
    const sanitizedData = data ? InputSanitizer.sanitizeLog(data) : "";

    const winstonLogger = getLogger();
    if (winstonLogger) {
      winstonLogger.info(sanitizedMsg, sanitizedData);
    } else {
      console.info(`[INFO] ${sanitizedMsg}`, sanitizedData);
    }
  }

  static error(message: string, error?: Error) {
    const sanitizedMsg = InputSanitizer.sanitizeLog(message);
    const errorMsg = error?.message
      ? InputSanitizer.sanitizeLog(error.message)
      : "";

    const winstonLogger = getLogger();
    if (winstonLogger) {
      winstonLogger.error(sanitizedMsg, errorMsg, error?.stack ? { stack: error.stack } : {});
    } else {
      console.error(`[ERROR] ${sanitizedMsg}`, errorMsg, error?.stack ? { stack: error.stack } : "");
    }
  }

  static warn(message: string, data?: unknown) {
    const sanitizedMsg = InputSanitizer.sanitizeLog(message);
    const sanitizedData = data ? InputSanitizer.sanitizeLog(data) : "";

    const winstonLogger = getLogger();
    if (winstonLogger) {
      winstonLogger.warn(sanitizedMsg, sanitizedData);
    } else {
      console.warn(`[WARN] ${sanitizedMsg}`, sanitizedData);
    }
  }

  static log(level: string, message: string, data?: unknown) {
    const sanitizedMsg = InputSanitizer.sanitizeLog(message);
    const sanitizedData = data ? InputSanitizer.sanitizeLog(data) : "";

    const winstonLogger = getLogger();
    if (winstonLogger) {
      winstonLogger.log(level, sanitizedMsg, sanitizedData);
    } else {
      console.log(`[${level.toUpperCase()}] ${sanitizedMsg}`, sanitizedData);
    }
  }

  static security(message: string, context?: unknown) {
    const sanitizedMsg = InputSanitizer.sanitizeLog(message);
    const sanitizedCtx = context ? InputSanitizer.sanitizeLog(context) : "";

    const winstonLogger = getLogger();
    if (winstonLogger) {
      winstonLogger.info(`[SECURITY] ${sanitizedMsg}`, sanitizedCtx);
    } else {
      console.info(`[SECURITY] ${sanitizedMsg}`, sanitizedCtx);
    }
  }
}
