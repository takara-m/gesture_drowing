/**
 * Logger utility for production-safe logging
 *
 * In development mode: All logs are output
 * In production mode: Only errors are output
 */

const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  /**
   * Log informational messages (development only)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log warning messages (development only)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log error messages (always output)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log debug information (development only, prefixed with [DEBUG])
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
};

/**
 * Log with conditional output based on environment
 * @deprecated Use logger.log() instead
 */
export const devLog = logger.log;

/**
 * Always log errors, regardless of environment
 * @deprecated Use logger.error() instead
 */
export const errorLog = logger.error;
