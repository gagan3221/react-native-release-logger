import {
  ReleaseLoggerConfig,
  LoggerInstance,
  LogLevelType,
  LogEntry,
} from "./types";
import {
  formatLogEntry,
  shouldLog,
  formatArgs,
  getStackTrace,
  generateLogFileName,
} from "./utils";
import platformLogger from "./PlatformLogger";

class ReleaseLogger implements LoggerInstance {
  private config: Required<ReleaseLoggerConfig>;
  private logQueue: LogEntry[] = [];
  private isWriting: boolean = false;
  private currentLogFile: string = "";

  constructor(config: ReleaseLoggerConfig = {}) {
    this.config = {
      maxFileSize: config.maxFileSize || 5 * 1024 * 1024, // 5MB
      maxFiles: config.maxFiles || 5,
      logDirectory: config.logDirectory || "", // Will be set in initializeLogger
      filePrefix: config.filePrefix || "app-log",
      enabled: config.enabled !== false,
      minLevel: config.minLevel || "log",
      includeStackTrace: config.includeStackTrace !== false,
    };

    this.initializeLogger();
  }

  private async initializeLogger(): Promise<void> {
    try {
      // Set log directory if not provided
      if (!this.config.logDirectory) {
        const documentsPath = await platformLogger.getDocumentsPath();
        this.config.logDirectory = `${documentsPath}/logs`;
      }

      // Create log directory if it doesn't exist
      const dirExists = await platformLogger.fileExists(this.config.logDirectory);
      if (!dirExists) {
        await platformLogger.createDirectory(this.config.logDirectory);
      }

      // Set current log file
      this.currentLogFile = `${this.config.logDirectory}/${generateLogFileName(
        this.config.filePrefix
      )}`;

      // Clean up old log files
      await this.cleanupOldLogs();
    } catch (error) {
      console.warn("ReleaseLogger: Failed to initialize logger", error);
    }
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.config.enabled) return;

    try {
      const logLine = formatLogEntry(
        entry.level,
        entry.message,
        entry.args,
        entry.stack
      );

      // Check if current file exists and get its size
      const fileExists = await platformLogger.fileExists(this.currentLogFile);
      let fileSize = 0;

      if (fileExists) {
        fileSize = await platformLogger.getFileSize(this.currentLogFile);
      }

      // Rotate log file if it's too large
      if (fileSize + logLine.length > this.config.maxFileSize) {
        await this.rotateLogFile();
      }

      // Append to current log file
      await platformLogger.writeLogEntry(this.currentLogFile, logLine);
    } catch (error) {
      console.warn("ReleaseLogger: Failed to write log entry", error);
    }
  }

  private async rotateLogFile(): Promise<void> {
    try {
      const files = await this.getLogFiles();
      const currentFiles = files
        .filter((file) => file.startsWith(this.config.filePrefix))
        .sort();

      // If we have reached max files, delete the oldest
      if (currentFiles.length >= this.config.maxFiles) {
        const filesToDelete = currentFiles.slice(
          0,
          currentFiles.length - this.config.maxFiles + 1
        );
        for (const file of filesToDelete) {
          await platformLogger.deleteLogFile(`${this.config.logDirectory}/${file}`);
        }
      }

      // Create new log file
      this.currentLogFile = `${this.config.logDirectory}/${generateLogFileName(
        this.config.filePrefix
      )}`;
    } catch (error) {
      console.warn("ReleaseLogger: Failed to rotate log file", error);
    }
  }

  private async cleanupOldLogs(): Promise<void> {
    try {
      const files = await this.getLogFiles();
      const logFiles = files
        .filter(
          (file) =>
            file.startsWith(this.config.filePrefix) && file.endsWith(".log")
        )
        .sort();

      if (logFiles.length > this.config.maxFiles) {
        const filesToDelete = logFiles.slice(
          0,
          logFiles.length - this.config.maxFiles
        );
        for (const file of filesToDelete) {
          await platformLogger.deleteLogFile(`${this.config.logDirectory}/${file}`);
        }
      }
    } catch (error) {
      console.warn("ReleaseLogger: Failed to cleanup old logs", error);
    }
  }

  private async processLogQueue(): Promise<void> {
    if (this.isWriting || this.logQueue.length === 0) return;

    this.isWriting = true;

    try {
      while (this.logQueue.length > 0) {
        const entry = this.logQueue.shift();
        if (entry) {
          await this.writeToFile(entry);
        }
      }
    } catch (error) {
      console.warn("ReleaseLogger: Error processing log queue", error);
    } finally {
      this.isWriting = false;
    }
  }

  private addToQueue(level: LogLevelType, args: any[]): void {
    if (!this.config.enabled || !shouldLog(level, this.config.minLevel)) {
      return;
    }

    const message = formatArgs(args);
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      args: args.length > 1 ? args.slice(1) : undefined,
    };

    // Add stack trace for errors if enabled
    if (level === "error" && this.config.includeStackTrace) {
      entry.stack = getStackTrace();
    }

    this.logQueue.push(entry);

    // Process queue asynchronously
    setTimeout(() => this.processLogQueue(), 0);
  }

  // Public logging methods
  log(...args: any[]): void {
    this.addToQueue("log", args);
  }

  info(...args: any[]): void {
    this.addToQueue("info", args);
  }

  warn(...args: any[]): void {
    this.addToQueue("warn", args);
  }

  error(...args: any[]): void {
    this.addToQueue("error", args);
  }

  debug(...args: any[]): void {
    this.addToQueue("debug", args);
  }

  // Utility methods
  async getLogs(): Promise<string> {
    try {
      const fileExists = await platformLogger.fileExists(this.currentLogFile);
      if (!fileExists) return "";

      return await platformLogger.readLogFile(this.currentLogFile);
    } catch (error) {
      console.warn("ReleaseLogger: Failed to read logs", error);
      return "";
    }
  }

  async clearLogs(): Promise<void> {
    try {
      const files = await this.getLogFiles();
      const logFiles = files.filter(
        (file) =>
          file.startsWith(this.config.filePrefix) && file.endsWith(".log")
      );

      for (const file of logFiles) {
        await platformLogger.deleteLogFile(`${this.config.logDirectory}/${file}`);
      }

      // Reset current log file
      this.currentLogFile = `${this.config.logDirectory}/${generateLogFileName(
        this.config.filePrefix
      )}`;
    } catch (error) {
      console.warn("ReleaseLogger: Failed to clear logs", error);
    }
  }

  async getLogFiles(): Promise<string[]> {
    try {
      const dirExists = await platformLogger.fileExists(this.config.logDirectory);
      if (!dirExists) return [];

      return await platformLogger.listLogFiles(this.config.logDirectory);
    } catch (error) {
      console.warn("ReleaseLogger: Failed to read log directory", error);
      return [];
    }
  }

  async exportLogs(): Promise<string> {
    try {
      const files = await this.getLogFiles();
      const logFiles = files
        .filter(
          (file) =>
            file.startsWith(this.config.filePrefix) && file.endsWith(".log")
        )
        .sort();

      let allLogs = "";
      for (const file of logFiles) {
        const filePath = `${this.config.logDirectory}/${file}`;
        const content = await platformLogger.readLogFile(filePath);
        allLogs += `\n=== ${file} ===\n${content}\n`;
      }

      return allLogs;
    } catch (error) {
      console.warn("ReleaseLogger: Failed to export logs", error);
      return "";
    }
  }
}

export default ReleaseLogger;
