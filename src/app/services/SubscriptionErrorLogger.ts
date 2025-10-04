/**
 * Centralized Error Logging Service
 * 
 * Provides comprehensive error tracking and logging for the subscription system
 * - Tracks all errors with context
 * - Prevents silent failures
 * - Provides debugging information
 * - Can be extended to send errors to backend/monitoring service
 */

interface ErrorLog {
  id: string;
  timestamp: Date;
  context: string;
  message: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

class SubscriptionErrorLogger {
  private errors: ErrorLog[] = [];
  private readonly MAX_ERRORS = 100;
  private readonly STORAGE_KEY = 'subscription_error_logs';

  constructor() {
    this.loadErrorsFromStorage();
  }

  /**
   * Log an error with context
   */
  logError(
    context: string,
    error: Error | string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: Record<string, any>
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      context,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' && error.stack ? error.stack : undefined,
      severity,
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    };

    // Add to in-memory array
    this.errors.unshift(errorLog);

    // Keep only last MAX_ERRORS
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(0, this.MAX_ERRORS);
    }

    // Persist to localStorage
    this.saveErrorsToStorage();

    // Console log based on severity
    this.logToConsole(errorLog);

    // Future: Send to backend monitoring service
    if (severity === 'critical') {
      this.notifyCriticalError(errorLog);
    }
  }

  /**
   * Log to console with appropriate severity
   */
  private logToConsole(errorLog: ErrorLog): void {
    const emoji = this.getSeverityEmoji(errorLog.severity);
    const prefix = `${emoji} [${errorLog.context}]`;

    switch (errorLog.severity) {
      case 'critical':
        console.error(prefix, errorLog.message, errorLog.metadata);
        if (errorLog.stack) console.error('Stack:', errorLog.stack);
        break;
      case 'high':
        console.error(prefix, errorLog.message, errorLog.metadata);
        break;
      case 'medium':
        console.warn(prefix, errorLog.message, errorLog.metadata);
        break;
      case 'low':
        console.log(prefix, errorLog.message, errorLog.metadata);
        break;
    }
  }

  /**
   * Get emoji for severity level
   */
  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '❌';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '📝';
    }
  }

  /**
   * Generate unique ID for error log
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all errors
   */
  getAllErrors(): ErrorLog[] {
    return [...this.errors];
  }

  /**
   * Get errors by context
   */
  getErrorsByContext(context: string): ErrorLog[] {
    return this.errors.filter(e => e.context === context);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): ErrorLog[] {
    return this.errors.filter(e => e.severity === severity);
  }

  /**
   * Get errors from last N minutes
   */
  getRecentErrors(minutes: number = 10): ErrorLog[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.errors.filter(e => e.timestamp >= cutoff);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
    this.saveErrorsToStorage();
    console.log('✅ Error logs cleared');
  }

  /**
   * Get error statistics
   */
  getStatistics(): {
    total: number;
    byContext: Record<string, number>;
    bySeverity: Record<string, number>;
    recentCount: number;
  } {
    const byContext: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    this.errors.forEach(error => {
      byContext[error.context] = (byContext[error.context] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byContext,
      bySeverity,
      recentCount: this.getRecentErrors(10).length,
    };
  }

  /**
   * Print error summary to console
   */
  printSummary(): void {
    const stats = this.getStatistics();
    
    console.group('📊 Subscription System Error Summary');
    console.log(`Total Errors: ${stats.total}`);
    console.log(`Recent (last 10 min): ${stats.recentCount}`);
    console.log('\nBy Context:', stats.byContext);
    console.log('\nBy Severity:', stats.bySeverity);
    
    const critical = this.getErrorsBySeverity('critical');
    if (critical.length > 0) {
      console.warn(`\n🚨 ${critical.length} CRITICAL errors found!`);
      critical.forEach(error => {
        console.error(`  - ${error.context}: ${error.message}`);
      });
    }
    
    console.groupEnd();
  }

  /**
   * Load errors from localStorage
   */
  private loadErrorsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        this.errors = parsed.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }
    } catch (error) {
      console.warn('⚠️ Failed to load error logs from storage:', error);
    }
  }

  /**
   * Save errors to localStorage
   */
  private saveErrorsToStorage(): void {
    try {
      const toStore = this.errors.slice(0, 50); // Store only last 50
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.warn('⚠️ Failed to save error logs to storage:', error);
    }
  }

  /**
   * Notify about critical errors (future: send to backend)
   */
  private notifyCriticalError(errorLog: ErrorLog): void {
    // For now, just log to console
    console.error('🚨🚨🚨 CRITICAL ERROR DETECTED 🚨🚨🚨');
    console.error('Context:', errorLog.context);
    console.error('Message:', errorLog.message);
    console.error('Metadata:', errorLog.metadata);
    
    // Future: Send to backend monitoring service
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   body: JSON.stringify(errorLog)
    // });
  }

  /**
   * Export errors as JSON for debugging
   */
  exportErrors(): string {
    return JSON.stringify(this.errors, null, 2);
  }

  /**
   * Import errors from JSON (for debugging)
   */
  importErrors(json: string): void {
    try {
      const parsed = JSON.parse(json);
      this.errors = parsed.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp),
      }));
      this.saveErrorsToStorage();
      console.log('✅ Errors imported successfully');
    } catch (error) {
      console.error('❌ Failed to import errors:', error);
    }
  }
}

// Create singleton instance
const errorLogger = new SubscriptionErrorLogger();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).subscriptionErrorLogger = errorLogger;
  console.log('🐛 Subscription error logger available at window.subscriptionErrorLogger');
  console.log('📊 Use subscriptionErrorLogger.printSummary() to see error stats');
}

export default errorLogger;

// Export helper functions for easy use
export const logSubscriptionError = (
  context: string,
  error: Error | string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  metadata?: Record<string, any>
) => {
  errorLogger.logError(context, error, severity, metadata);
};

export const getSubscriptionErrors = () => errorLogger.getAllErrors();
export const clearSubscriptionErrors = () => errorLogger.clearErrors();
export const printSubscriptionErrorSummary = () => errorLogger.printSummary();
