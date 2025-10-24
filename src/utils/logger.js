// @ts-check
/**
 * Simple logging utility
 * @module utils/logger
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] || LOG_LEVELS.info;

/**
 * Create a logger instance
 * @param {string} context - Context name for log messages
 * @returns {Object} Logger instance
 */
export function createLogger(context) {
  const log = (level, message, meta = {}) => {
    if (LOG_LEVELS[level] >= currentLevel) {
      const timestamp = new Date().toISOString();
      const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
      console.error(`[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}${metaStr}`);
    }
  };

  return {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
  };
}
