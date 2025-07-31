/**
 * Simple logging utility
 */

const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor(level = LogLevel.INFO) {
    this.level = level;
  }

  setLevel(level) {
    this.level = level;
  }

  error(message, ...args) {
    if (this.level >= LogLevel.ERROR) {
      console.error(`[ERROR] ${new Date().toISOString()}:`, message, ...args);
    }
  }

  warn(message, ...args) {
    if (this.level >= LogLevel.WARN) {
      console.warn(`[WARN] ${new Date().toISOString()}:`, message, ...args);
    }
  }

  info(message, ...args) {
    if (this.level >= LogLevel.INFO) {
      console.log(`[INFO] ${new Date().toISOString()}:`, message, ...args);
    }
  }

  debug(message, ...args) {
    if (this.level >= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${new Date().toISOString()}:`, message, ...args);
    }
  }
}

// Create default logger instance
const logger = new Logger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

export { Logger, LogLevel, logger };