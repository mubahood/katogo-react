/**
 * Production-Ready Logging Utility
 * Replaces console.log with environment-aware logging
 * 
 * Features:
 * - Only logs in development mode
 * - Color-coded log levels
 * - Timestamps
 * - Error tracking
 * - Performance monitoring
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  timestamp?: boolean;
  caller?: string;
  data?: any;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;
  
  constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development';
    this.isProduction = import.meta.env.MODE === 'production';
  }

  /**
   * Format timestamp for logs
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().split('T')[1].split('.')[0];
  }

  /**
   * Get emoji for log level
   */
  private getEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      log: '📝',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🐛'
    };
    return emojis[level] || '📝';
  }

  /**
   * Format log message
   */
  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const parts: string[] = [];
    
    // Add timestamp if enabled
    if (options?.timestamp !== false) {
      parts.push(`[${this.getTimestamp()}]`);
    }
    
    // Add emoji
    parts.push(this.getEmoji(level));
    
    // Add caller if provided
    if (options?.caller) {
      parts.push(`[${options.caller}]`);
    }
    
    // Add message
    parts.push(message);
    
    return parts.join(' ');
  }

  /**
   * Core logging method
   */
  private _log(level: LogLevel, message: string, data?: any, options?: LogOptions): void {
    // In production, only log errors
    if (this.isProduction && level !== 'error') {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, options);
    
    // Log based on level
    switch (level) {
      case 'error':
        console.error(formattedMessage, data || '');
        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'info':
        console.info(formattedMessage, data || '');
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage, data || '');
        }
        break;
      default:
        console.log(formattedMessage, data || '');
    }
  }

  /**
   * Log general information (development only)
   */
  log(message: string, data?: any, options?: LogOptions): void {
    this._log('log', message, data, options);
  }

  /**
   * Log informational message (development only)
   */
  info(message: string, data?: any, options?: LogOptions): void {
    this._log('info', message, data, options);
  }

  /**
   * Log warning message (development only)
   */
  warn(message: string, data?: any, options?: LogOptions): void {
    this._log('warn', message, data, options);
  }

  /**
   * Log error message (always logged, even in production)
   */
  error(message: string, error?: Error | any, options?: LogOptions): void {
    this._log('error', message, error, options);
    
    // In production, send to error tracking service
    if (this.isProduction) {
      this.trackError(message, error);
    }
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, data?: any, options?: LogOptions): void {
    this._log('debug', message, data, options);
  }

  /**
   * Group related logs
   */
  group(label: string, callback: () => void): void {
    if (!this.isDevelopment) return;
    
    console.group(`${this.getEmoji('log')} ${label}`);
    callback();
    console.groupEnd();
  }

  /**
   * Measure execution time
   */
  time(label: string): void {
    if (!this.isDevelopment) return;
    console.time(`⏱️ ${label}`);
  }

  /**
   * End time measurement
   */
  timeEnd(label: string): void {
    if (!this.isDevelopment) return;
    console.timeEnd(`⏱️ ${label}`);
  }

  /**
   * Log table data
   */
  table(data: any, columns?: string[]): void {
    if (!this.isDevelopment) return;
    console.table(data, columns);
  }

  /**
   * Track error in production (integrate with error tracking service)
   */
  private trackError(message: string, error?: Error | any): void {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(error, { extra: { message } });
    
    // For now, just ensure it's logged
    if (error instanceof Error) {
      console.error('Error Stack:', error.stack);
    }
  }

  /**
   * Module-specific logger factory
   */
  createModuleLogger(moduleName: string) {
    return {
      log: (message: string, data?: any) => 
        this.log(message, data, { caller: moduleName }),
      info: (message: string, data?: any) => 
        this.info(message, data, { caller: moduleName }),
      warn: (message: string, data?: any) => 
        this.warn(message, data, { caller: moduleName }),
      error: (message: string, error?: Error | any) => 
        this.error(message, error, { caller: moduleName }),
      debug: (message: string, data?: any) => 
        this.debug(message, data, { caller: moduleName }),
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for module-specific loggers
export const createLogger = (moduleName: string) => 
  logger.createModuleLogger(moduleName);

// Export class for testing
export { Logger };

// Usage examples:
// import { logger } from './utils/logger';
// logger.log('User logged in', { userId: 123 });
// logger.error('Failed to load data', error);
// logger.time('API Call');
// ... api call ...
// logger.timeEnd('API Call');

// Module-specific logger:
// const log = createLogger('MoviesPage');
// log.info('Loading movies', { page: 1 });
