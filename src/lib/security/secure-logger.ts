import winston from "winston";
import { InputSanitizer } from "./input-sanitizer";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export class SecureLogger {
  static info(message: string, data?: unknown) {
    logger.info(
      InputSanitizer.sanitizeLog(message),
      data ? InputSanitizer.sanitizeLog(data) : ""
    );
  }

  static error(message: string, error?: Error) {
    logger.error(
      InputSanitizer.sanitizeLog(message),
      error?.message ? InputSanitizer.sanitizeLog(error.message) : ""
    );
  }

  static warn(message: string, data?: unknown) {
    logger.warn(
      InputSanitizer.sanitizeLog(message),
      data ? InputSanitizer.sanitizeLog(data) : ""
    );
  }

  static log(level: string, message: string, data?: unknown) {
    logger.log(
      level,
      InputSanitizer.sanitizeLog(message),
      data ? InputSanitizer.sanitizeLog(data) : ""
    );
  }
}
