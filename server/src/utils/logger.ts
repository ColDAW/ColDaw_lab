/**
 * Unified logging utility for ColDaw server
 * Controls log output based on environment
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  /**
   * Debug logs - only shown in development
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.log('[DEBUG]', new Date().toISOString(), ...args);
    }
  },

  /**
   * Info logs - shown in all environments
   */
  info: (...args: any[]) => {
    console.log('[INFO]', new Date().toISOString(), ...args);
  },

  /**
   * Warning logs - shown in all environments
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', new Date().toISOString(), ...args);
  },

  /**
   * Error logs - shown in all environments
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', new Date().toISOString(), ...args);
  },

  /**
   * Success logs - shown in all environments
   */
  success: (...args: any[]) => {
    console.log('[SUCCESS]', new Date().toISOString(), ...args);
  },
};

export default logger;
