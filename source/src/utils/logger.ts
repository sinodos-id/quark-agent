import { Injectable } from '@nestjs/common';
import { asyncLocalStorage } from '../middleware/correlation.middleware';

/**
 * Log levels for the application
 * In production:
 * - ERROR: Always logged
 * - WARN: Always logged
 * - INFO: Always logged
 * - DEBUG: Only logged when LOG_LEVEL=debug
 */
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

type LogContext = Record<string, unknown>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  context?: LogContext;
  error?: string;
}

@Injectable()
export class Logger {
  private static getCurrentCorrelationId(): string | undefined {
    const store = asyncLocalStorage.getStore();
    return store?.correlationId;
  }

  private static formatLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext | string,
    error?: Error | unknown,
  ): LogEntry {
    const timestamp = new Date().toISOString();
    const correlationId = this.getCurrentCorrelationId();

    let contextObj: LogContext | undefined;
    if (typeof context === 'string') {
      contextObj = { service: context };
    } else if (context) {
      contextObj = context;
    }

    let errorStr: string | undefined;
    if (error) {
      errorStr = error instanceof Error ? error.stack : JSON.stringify(error);
    }

    return {
      timestamp,
      level,
      message,
      correlationId,
      ...(contextObj && { context: contextObj }),
      ...(errorStr && { error: errorStr }),
    };
  }

  private static shouldLog(level: LogLevel): boolean {
    // Always log ERROR and WARN
    if (level === LogLevel.ERROR || level === LogLevel.WARN) {
      return true;
    }

    // In production, check LOG_LEVEL for DEBUG
    if (process.env.NODE_ENV === 'production') {
      if (level === LogLevel.DEBUG) {
        return process.env.LOG_LEVEL === 'debug';
      }
      // Always log INFO in production
      return true;
    }

    // In development, log everything
    return true;
  }

  static log(message: string, context?: LogContext | string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const logEntry = this.formatLogEntry(LogLevel.INFO, message, context);
      process.stdout.write(JSON.stringify(logEntry) + '\n');
    }
  }

  static warn(message: string, context?: LogContext | string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const logEntry = this.formatLogEntry(LogLevel.WARN, message, context);
      process.stdout.write(JSON.stringify(logEntry) + '\n');
    }
  }

  static error(
    message: string,
    error?: Error | unknown,
    context?: LogContext | string,
  ): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const logEntry = this.formatLogEntry(
        LogLevel.ERROR,
        message,
        context,
        error,
      );
      process.stderr.write(JSON.stringify(logEntry) + '\n');
    }
  }

  static debug(message: string, context?: LogContext | string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const logEntry = this.formatLogEntry(LogLevel.DEBUG, message, context);
      process.stdout.write(JSON.stringify(logEntry) + '\n');
    }
  }
}
