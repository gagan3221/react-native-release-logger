import ReleaseLogger from './ReleaseLogger';
import { ReleaseLoggerConfig, LoggerInstance, LogLevelType } from './types';

// Global logger instance
let globalLogger: ReleaseLogger | null = null;

/**
 * Initialize the release logger with configuration
 */
export function initializeReleaseLogger(config: ReleaseLoggerConfig = {}): LoggerInstance {
  globalLogger = new ReleaseLogger(config);
  return globalLogger;
}

/**
 * Get the global logger instance
 */
export function getReleaseLogger(): LoggerInstance {
  if (!globalLogger) {
    globalLogger = new ReleaseLogger();
  }
  return globalLogger;
}

/**
 * Replace console methods with release logger
 * This is useful for capturing existing console.log statements
 */
export function replaceConsole(config: ReleaseLoggerConfig = {}): void {
  const logger = globalLogger || new ReleaseLogger(config);
  
  // Store original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

  // Replace console methods
  console.log = (...args: any[]) => {
    originalConsole.log(...args);
    logger.log(...args);
  };

  console.info = (...args: any[]) => {
    originalConsole.info(...args);
    logger.info(...args);
  };

  console.warn = (...args: any[]) => {
    originalConsole.warn(...args);
    logger.warn(...args);
  };

  console.error = (...args: any[]) => {
    originalConsole.error(...args);
    logger.error(...args);
  };

  console.debug = (...args: any[]) => {
    originalConsole.debug(...args);
    logger.debug(...args);
  };

  // Store reference to restore later if needed
  (console as any)._originalMethods = originalConsole;
}

/**
 * Restore original console methods
 */
export function restoreConsole(): void {
  const originalMethods = (console as any)._originalMethods;
  if (originalMethods) {
    console.log = originalMethods.log;
    console.info = originalMethods.info;
    console.warn = originalMethods.warn;
    console.error = originalMethods.error;
    console.debug = originalMethods.debug;
    delete (console as any)._originalMethods;
  }
}

// Export types and classes
export { ReleaseLogger, ReleaseLoggerConfig, LoggerInstance, LogLevelType };
export default ReleaseLogger;
