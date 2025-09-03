/**
 * Structured logging utility for frontend applications
 * 
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Structured logging with context
 * - Environment-aware logging
 * - Error reporting integration
 * - Performance monitoring
 * - User action tracking
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  url?: string;
  userAgent?: string;
}

export interface LogEntry extends LogContext {
  level: LogLevel;
  message: string;
  error?: Error;
}

class Logger {
  private sessionId: string;
  private userId?: string;
  private isProduction: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Initialize error reporting
    this.setupGlobalErrorHandling();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandling(): void {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        error: event.reason,
        component: 'Global',
        action: 'unhandledrejection',
      });
    });

    // Catch global JavaScript errors
    window.addEventListener('error', (event) => {
      this.error('Global JavaScript Error', {
        error: new Error(event.message),
        component: 'Global',
        action: 'error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      error,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isProduction) {
      // In production, only log warnings and errors
      return level === 'warn' || level === 'error';
    }
    // In development, log everything
    return true;
  }

  private formatConsoleOutput(entry: LogEntry): void {
    const { level, message, component, action, metadata, error } = entry;
    
    const prefix = component ? `[${component}]` : '';
    const actionSuffix = action ? ` (${action})` : '';
    const fullMessage = `${prefix} ${message}${actionSuffix}`;

    const style = {
      debug: 'color: #6B7280',
      info: 'color: #3B82F6',
      warn: 'color: #F59E0B',
      error: 'color: #EF4444; font-weight: bold',
    }[level];

    console.groupCollapsed(`%c${level.toUpperCase()}: ${fullMessage}`, style);
    
    if (metadata && Object.keys(metadata).length > 0) {
      console.log('Metadata:', metadata);
    }
    
    if (error) {
      console.error('Error:', error);
    }
    
    console.log('Context:', {
      timestamp: entry.timestamp,
      sessionId: entry.sessionId,
      userId: entry.userId,
      url: entry.url,
    });
    
    console.groupEnd();
  }

  private sendToRemoteLogging(entry: LogEntry): void {
    if (!this.isProduction) return;

    // In production, send logs to remote logging service
    // Example: DataDog, LogRocket, Sentry, etc.
    try {
      // Example implementation:
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // }).catch(() => {
      //   // Silently fail to avoid infinite loops
      // });
    } catch (error) {
      // Silently fail to avoid infinite loops
    }
  }

  debug(message: string, context: LogContext = {}): void {
    if (!this.shouldLog('debug')) return;

    const entry = this.createLogEntry('debug', message, context);
    this.formatConsoleOutput(entry);
    this.sendToRemoteLogging(entry);
  }

  info(message: string, context: LogContext = {}): void {
    if (!this.shouldLog('info')) return;

    const entry = this.createLogEntry('info', message, context);
    this.formatConsoleOutput(entry);
    this.sendToRemoteLogging(entry);
  }

  warn(message: string, context: LogContext = {}): void {
    if (!this.shouldLog('warn')) return;

    const entry = this.createLogEntry('warn', message, context);
    this.formatConsoleOutput(entry);
    this.sendToRemoteLogging(entry);
  }

  error(message: string, context: LogContext = {}, error?: Error): void {
    if (!this.shouldLog('error')) return;

    const entry = this.createLogEntry('error', message, context, error);
    this.formatConsoleOutput(entry);
    this.sendToRemoteLogging(entry);
  }

  // Convenience methods for common use cases
  apiCall(method: string, url: string, context: LogContext = {}): void {
    this.info(`API Call: ${method} ${url}`, {
      ...context,
      component: 'API',
      action: 'request',
      metadata: { method, url },
    });
  }

  apiError(method: string, url: string, error: Error, context: LogContext = {}): void {
    this.error(`API Error: ${method} ${url}`, {
      ...context,
      component: 'API',
      action: 'error',
      metadata: { method, url },
    }, error);
  }

  userAction(action: string, context: LogContext = {}): void {
    this.info(`User Action: ${action}`, {
      ...context,
      component: 'User',
      action,
    });
  }

  performance(operation: string, duration: number, context: LogContext = {}): void {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      ...context,
      component: 'Performance',
      action: operation,
      metadata: { duration },
    });
  }

  // Performance timing utility
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.performance(label, Math.round(duration));
    };
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, context?: LogContext, error?: Error) => logger.error(message, context, error),
  apiCall: (method: string, url: string, context?: LogContext) => logger.apiCall(method, url, context),
  apiError: (method: string, url: string, error: Error, context?: LogContext) => logger.apiError(method, url, error, context),
  userAction: (action: string, context?: LogContext) => logger.userAction(action, context),
  performance: (operation: string, duration: number, context?: LogContext) => logger.performance(operation, duration, context),
  time: (label: string) => logger.time(label),
  setUserId: (userId: string) => logger.setUserId(userId),
};

export default logger;
