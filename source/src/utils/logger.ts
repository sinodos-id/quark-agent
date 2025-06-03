import { Injectable } from '@nestjs/common';

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

@Injectable()
export class Logger {
  private static formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext | string,
    error?: Error | unknown,
  ): string {
    const timestamp = new Date().toISOString();
    let contextStr = '';

    if (typeof context === 'string') {
      contextStr = ` [${context}]`;
    } else if (context) {
      contextStr = ` ${JSON.stringify(context)}`;
    }

    let logMessage = `${timestamp} ${level}${contextStr}: ${message}`;

    if (error) {
      const errorMessage =
        error instanceof Error ? error.stack : JSON.stringify(error);
      logMessage += `\n${errorMessage}`;
    }

    return logMessage;
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
      process.stdout.write(
        this.formatMessage(LogLevel.INFO, message, context) + '\n',
      );
    }
  }

  static warn(message: string, context?: LogContext | string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      process.stdout.write(
        this.formatMessage(LogLevel.WARN, message, context) + '\n',
      );
    }
  }

  static error(
    message: string,
    error?: Error | unknown,
    context?: LogContext | string,
  ): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      process.stderr.write(
        this.formatMessage(LogLevel.ERROR, message, context, error) + '\n',
      );
    }
  }

  static debug(message: string, context?: LogContext | string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      process.stdout.write(
        this.formatMessage(LogLevel.DEBUG, message, context) + '\n',
      );
    }
  }
}
