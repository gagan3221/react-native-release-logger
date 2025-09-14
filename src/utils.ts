import { LogLevelType } from './types';

export const LOG_LEVELS: Record<LogLevelType, number> = {
  debug: 0,
  log: 1,
  info: 2,
  warn: 3,
  error: 4,
};

export function formatLogEntry(
  level: LogLevelType,
  message: string,
  args?: any[],
  stack?: string
): string {
  const timestamp = new Date().toISOString();
  const argsStr = args && args.length > 0 ? ` | Args: ${JSON.stringify(args)}` : '';
  const stackStr = stack ? ` | Stack: ${stack}` : '';
  
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${argsStr}${stackStr}\n`;
}

export function shouldLog(currentLevel: LogLevelType, minLevel: LogLevelType): boolean {
  return LOG_LEVELS[currentLevel] >= LOG_LEVELS[minLevel];
}

export function formatArgs(args: any[]): string {
  return args
    .map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');
}

export function getStackTrace(): string {
  const error = new Error();
  const stack = error.stack;
  if (!stack) return '';
  
  // Remove the first few lines which are internal to the logger
  const lines = stack.split('\n');
  return lines.slice(3).join('\n');
}

export function generateLogFileName(prefix: string, index: number = 0): string {
  const date = new Date().toISOString().split('T')[0];
  const suffix = index > 0 ? `-${index}` : '';
  return `${prefix}-${date}${suffix}.log`;
}
