export interface LogLevel {
  LOG: 'log';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
  DEBUG: 'debug';
}

export type LogLevelType = LogLevel[keyof LogLevel];

export interface LogEntry {
  timestamp: string;
  level: LogLevelType;
  message: string;
  args?: any[];
  stack?: string;
}

export interface ReleaseLoggerConfig {
  /** Maximum file size in bytes before rotation (default: 5MB) */
  maxFileSize?: number;
  /** Maximum number of log files to keep (default: 5) */
  maxFiles?: number;
  /** Custom log file directory (default: DocumentDirectoryPath/logs) */
  logDirectory?: string;
  /** Log file name prefix (default: 'app-log') */
  filePrefix?: string;
  /** Enable/disable logging (default: true) */
  enabled?: boolean;
  /** Minimum log level to capture (default: 'log') */
  minLevel?: LogLevelType;
  /** Include stack trace for errors (default: true) */
  includeStackTrace?: boolean;
}

export interface LoggerInstance {
  log: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  getLogs: () => Promise<string>;
  clearLogs: () => Promise<void>;
  getLogFiles: () => Promise<string[]>;
  exportLogs: () => Promise<string>;
}
