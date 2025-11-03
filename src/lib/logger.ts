import { SecureLogger } from '@/lib/security/secure-logger';
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  minLevel: LogLevel;
  enabled: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      minLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      enabled: process.env.DISABLE_LOGGING !== 'true',
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
      SecureLogger.log(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
      SecureLogger.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
      SecureLogger.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog('error')) {
      const errorData = error instanceof Error 
        ? { message: error.message, stack: error.stack }
        : error;
      SecureLogger.error(this.formatMessage('error', message, errorData));
    }
  }
}

export const logger = new Logger();
