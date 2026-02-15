/**
 * Enhanced Logger with API Integration
 * 
 * Provides structured logging with console output and optional API integration.
 * Can send logs to your custom API endpoint for centralized logging.
 * 
 * =============================================================================
 * SETUP & CONFIGURATION
 * =============================================================================
 * 
 * 1. Environment Variables (add to .env.local):
 *    NEXT_PUBLIC_LOG_API_URL=https://your-api.com/api/logs  // Required for API logging
 *    NEXT_PUBLIC_LOG_API_KEY=your-api-key-here              // Optional authentication
 *    NEXT_PUBLIC_LOG_LEVEL=error                            // Optional: error|warn|info|debug
 * 
 * 2. Your API Endpoint should accept POST requests with this payload:
 *    {
 *      "level": "error",
 *      "message": "Failed to fetch data",
 *      "meta": { "error": {...}, "context": {...} },
 *      "timestamp": "2024-01-15T10:30:45.123Z",
 *      "environment": "production",
 *      "userAgent": "Mozilla/5.0...",
 *      "url": "https://yourapp.com/page"
 *    }
 * 
 * =============================================================================
 * USAGE EXAMPLES
 * =============================================================================
 * 
 * Basic Usage:
 * - logger.error('API Error', { error, context: { endpoint: '/api/users' } })
 * - logger.warn('Deprecated feature used', { feature: 'old-api', userId: 123 })
 * - logger.info('User action', { userId: 123, action: 'login' })
 * - logger.debug('Debug info', { data: complexObject })
 * 
 * Child Loggers (for components/services):
 * - const apiLogger = logger.child('API')
 * - apiLogger.error('Request failed', { endpoint: '/users', status: 500 })
 * 
 * Configuration at runtime:
 * - logger.configure({ logLevel: 'debug', enableAPI: false })
 * 
 * =============================================================================
 * LOG LEVELS & WHEN TO USE
 * =============================================================================
 * 
 * ERROR (0): Critical failures, exceptions, API errors
 *   logger.error('Database connection failed', { error, context: { db: 'users' } })
 * 
 * WARN (1): Non-critical issues, deprecated features, performance warnings
 *   logger.warn('Slow query detected', { query: 'SELECT * FROM users', duration: 5000 })
 * 
 * INFO (2): User actions, API calls, general application flow
 *   logger.info('User logged in', { userId: 123, method: 'oauth' })
 * 
 * DEBUG (3): Detailed debugging, variable states, development info
 *   logger.debug('Form validation', { field: 'email', value: 'user@example.com' })
 * 
 * =============================================================================
 * BEST PRACTICES
 * =============================================================================
 * 
 * 1. Always include context in meta object:
 *    logger.error('API failed', { 
 *      error: errorObject,           // Technical details
 *      context: { endpoint, userId } // Business context
 *    })
 * 
 * 2. Use child loggers for components:
 *    const userLogger = logger.child('UserService')
 *    userLogger.info('User created', { userId: 123 })
 * 
 * 3. Don't log sensitive data:
 *    logger.info('User login', { userId: 123 }) // ✅ Good
 *    logger.info('User login', { password: 'secret' }) // ❌ Bad
 * 
 * 4. Use appropriate log levels:
 *    - ERROR: Something is broken
 *    - WARN: Something might be wrong
 *    - INFO: Something happened
 *    - DEBUG: Something is happening (detailed)
 */

interface LogMeta {
  [key: string]: any;
}

interface LoggerConfig {
  enableConsole: boolean;
  enableAPI: boolean;
  apiUrl?: string;
  apiKey?: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

class Logger {
  private config: LoggerConfig = {
   // enableConsole: process.env.NODE_ENV !== 'production',
    enableConsole: true,
    enableAPI: !!process.env.NEXT_PUBLIC_LOG_API_URL,
    apiUrl: process.env.NEXT_PUBLIC_LOG_API_URL,
    apiKey: process.env.NEXT_PUBLIC_LOG_API_KEY,
    logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as any) || 'info'
  };


  private logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };

  private shouldLog(level: string): boolean {
    return this.logLevels[level as keyof typeof this.logLevels] <= this.logLevels[this.config.logLevel];
  }

  private formatMessage(level: string, message: string, meta?: LogMeta): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  private async sendToAPI(level: string, message: string, meta?: LogMeta): Promise<void> {
    if (!this.config.enableAPI || !this.config.apiUrl || !this.shouldLog(level)) {
      return;
    }

    try {
      const logPayload = {
        level,
        message,
        meta,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server'
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      // Use fetch with timeout to prevent blocking
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      await fetch(this.config.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(logPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
    } catch (error) {
      // Don't log API errors to avoid infinite loops
      // Only log to console if API logging fails
      if (this.config.enableConsole) {
        console.warn('Failed to send log to API:', error);
      }
    }
  }

  private logToConsole(level: string, message: string, meta?: LogMeta): void {
    if (!this.config.enableConsole || !this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Handle meta object properly - only log if it has meaningful content
    const hasMetaContent = meta && Object.keys(meta).length > 0;
    
    // Additional check for empty objects
    const isEmptyObject = meta && typeof meta === 'object' && Object.keys(meta).length === 0;
    
    switch (level) {
      case 'error':
        if (hasMetaContent && !isEmptyObject) {
          console.log(formattedMessage, meta);
        } else {
          console.log(formattedMessage);
        }
        break;
      case 'warn':
        if (hasMetaContent && !isEmptyObject) {
          console.warn(formattedMessage, meta);
        } else {
          console.warn(formattedMessage);
        }
        break;
      case 'info':
        if (hasMetaContent && !isEmptyObject) {
          console.info(formattedMessage, meta);
        } else {
          console.info(formattedMessage);
        }
        break;
      case 'debug':
        if (hasMetaContent && !isEmptyObject) {
          console.log(formattedMessage, meta);
        } else {
          console.log(formattedMessage);
        }
        break;
    }
  }

  /**
   * Log error messages - highest priority
   * Use for: API errors, exceptions, critical failures
   */
  error(message: string, meta?: LogMeta): void {
    this.logToConsole('error', message, meta);
    this.sendToAPI('error', message, meta);
  }

  /**
   * Log warning messages - medium priority  
   * Use for: deprecated features, non-critical issues, performance warnings
   */
  warn(message: string, meta?: LogMeta): void {
    this.logToConsole('warn', message, meta);
    this.sendToAPI('warn', message, meta);
  }

  /**
   * Log informational messages - normal priority
   * Use for: user actions, API calls, general application flow
   */
  info(message: string, meta?: LogMeta): void {
    this.logToConsole('info', message, meta);
    this.sendToAPI('info', message, meta);
  }

  /**
   * Log debug messages - lowest priority
   * Use for: detailed debugging, variable states, development info
   */
  debug(message: string, meta?: LogMeta): void {
    this.logToConsole('debug', message, meta);
    this.sendToAPI('debug', message, meta);
  }

  /**
   * Configure logger settings
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Create a child logger with a prefix for better organization
   */
  child(prefix: string): Logger {
    const childLogger = new Logger();
    childLogger.config = { ...this.config };
    
    // Override methods to add prefix
    const originalMethods = ['error', 'warn', 'info', 'debug'] as const;
    originalMethods.forEach(method => {
      const original = childLogger[method].bind(childLogger);
      childLogger[method] = (message: string, meta?: LogMeta) => {
        original(`[${prefix}] ${message}`, meta);
      };
    });
    
    return childLogger;
  }
}

// Create and export singleton instance
const logger = new Logger();

export default logger;
