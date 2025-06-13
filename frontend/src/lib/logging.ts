/**
 * Logging Utility
 * 
 * This module provides comprehensive logging functionality for the frontend application,
 * implementing different log levels, formatting, and persistence mechanisms.
 */

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Log entry interface
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  context?: string;
}

// Log storage interface
interface LogStorage {
  logs: LogEntry[];
  maxSize: number;
}

// Initialize log storage
const logStorage: LogStorage = {
  logs: [],
  maxSize: 1000, // Maximum number of logs to keep in memory
};

/**
 * Format log entry
 * @param entry - The log entry to format
 * @returns Formatted log string
 */
const formatLogEntry = (entry: LogEntry): string => {
  const { level, message, timestamp, context, data } = entry;
  let formatted = `[${timestamp}] ${level}${context ? ` [${context}]` : ''}: ${message}`;
  if (data) {
    formatted += `\nData: ${JSON.stringify(data, null, 2)}`;
  }
  return formatted;
};

/**
 * Add log entry to storage
 * @param entry - The log entry to add
 */
const addToStorage = (entry: LogEntry): void => {
  logStorage.logs.push(entry);
  if (logStorage.logs.length > logStorage.maxSize) {
    logStorage.logs.shift(); // Remove oldest log
  }
};

/**
 * Log message with specified level
 * @param level - The log level
 * @param message - The message to log
 * @param data - Optional data to include
 * @param context - Optional context
 */
const log = (
  level: LogLevel,
  message: string,
  data?: any,
  context?: string
): void => {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
    context,
  };

  // Format and log to console
  const formattedMessage = formatLogEntry(entry);
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage);
      break;
    case LogLevel.INFO:
      console.info(formattedMessage);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage);
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage);
      break;
  }

  // Add to storage
  addToStorage(entry);

  // In development, also log to localStorage
  if (process.env.NODE_ENV === 'development') {
    try {
      const storedLogs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      storedLogs.push(entry);
      localStorage.setItem('app_logs', JSON.stringify(storedLogs));
    } catch (error) {
      console.error('Failed to store log in localStorage:', error);
    }
  }
};

/**
 * Log debug message
 * @param message - The message to log
 * @param data - Optional data to include
 * @param context - Optional context
 */
export const debug = (message: string, data?: any, context?: string): void => {
  log(LogLevel.DEBUG, message, data, context);
};

/**
 * Log info message
 * @param message - The message to log
 * @param data - Optional data to include
 * @param context - Optional context
 */
export const info = (message: string, data?: any, context?: string): void => {
  log(LogLevel.INFO, message, data, context);
};

/**
 * Log warning message
 * @param message - The message to log
 * @param data - Optional data to include
 * @param context - Optional context
 */
export const warn = (message: string, data?: any, context?: string): void => {
  log(LogLevel.WARN, message, data, context);
};

/**
 * Log error message
 * @param message - The message to log
 * @param data - Optional data to include
 * @param context - Optional context
 */
export const error = (message: string, data?: any, context?: string): void => {
  log(LogLevel.ERROR, message, data, context);
};

/**
 * Get all stored logs
 * @returns Array of log entries
 */
export const getLogs = (): LogEntry[] => {
  return [...logStorage.logs];
};

/**
 * Clear all stored logs
 */
export const clearLogs = (): void => {
  logStorage.logs = [];
  if (process.env.NODE_ENV === 'development') {
    localStorage.removeItem('app_logs');
  }
};

/**
 * Export logs to file
 * @returns Blob containing log data
 */
export const exportLogs = (): Blob => {
  const logs = getLogs();
  const content = logs.map(formatLogEntry).join('\n');
  return new Blob([content], { type: 'text/plain' });
};

/**
 * Log user action
 * @param action - The action performed
 * @param details - Additional details about the action
 */
export const logUserAction = (action: string, details?: any): void => {
  info(`User Action: ${action}`, details, 'UserAction');
};

/**
 * Log API request
 * @param method - The HTTP method
 * @param url - The request URL
 * @param data - The request data
 */
export const logApiRequest = (method: string, url: string, data?: any): void => {
  debug(`API Request: ${method} ${url}`, data, 'API');
};

/**
 * Log API response
 * @param method - The HTTP method
 * @param url - The request URL
 * @param status - The response status
 * @param data - The response data
 */
export const logApiResponse = (
  method: string,
  url: string,
  status: number,
  data?: any
): void => {
  const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
  log(level, `API Response: ${method} ${url} (${status})`, data, 'API');
};

/**
 * Log error with stack trace
 * @param err - The error to log
 * @param context - Optional context
 */
export const logError = (err: Error, context?: string): void => {
  error(err.message, {
    stack: err.stack,
    name: err.name,
  }, context);
};