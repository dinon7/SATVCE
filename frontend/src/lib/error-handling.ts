/**
 * Error Handling and Logging Utility
 * 
 * This module provides comprehensive error handling and logging functionality
 * for the frontend application. It implements user-friendly error messages,
 * consistent error logging, and proper error recovery mechanisms.
 */

import { toast } from 'react-hot-toast';
import { enhancedApi } from './enhanced-api';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN'
}

// Error interface
export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  code?: string;
}

// Error messages for different error types
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'Network error occurred. Please check your connection.',
  [ErrorType.AUTHENTICATION]: 'Authentication error. Please log in again.',
  [ErrorType.VALIDATION]: 'Invalid input. Please check your data.',
  [ErrorType.PERMISSION]: 'You don\'t have permission to perform this action.',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Handle API errors with proper logging and user feedback
 * @param error - The error to handle
 * @param showToast - Whether to show a toast notification
 * @returns The processed error
 */
export const handleApiError = (error: any, showToast: boolean = true): AppError => {
  // Log the error
  console.error('API Error:', error);

  // Process the error
  const appError: AppError = {
    type: ErrorType.UNKNOWN,
    message: ERROR_MESSAGES[ErrorType.UNKNOWN],
    details: error
  };

  // Determine error type and message
  if (error.response) {
    const status = error.response.status;
    if (status === 401 || status === 403) {
      appError.type = ErrorType.AUTHENTICATION;
      appError.message = ERROR_MESSAGES[ErrorType.AUTHENTICATION];
    } else if (status === 422) {
      appError.type = ErrorType.VALIDATION;
      appError.message = ERROR_MESSAGES[ErrorType.VALIDATION];
      appError.details = error.response.data.details;
    } else if (status === 403) {
      appError.type = ErrorType.PERMISSION;
      appError.message = ERROR_MESSAGES[ErrorType.PERMISSION];
    }
  } else if (error.request) {
    appError.type = ErrorType.NETWORK;
    appError.message = ERROR_MESSAGES[ErrorType.NETWORK];
  }

  // Show toast notification if requested
  if (showToast) {
    toast.error(appError.message);
  }

  return appError;
};

/**
 * Handle form validation errors
 * @param errors - The validation errors
 * @returns Formatted error messages
 */
export const handleValidationErrors = (errors: Record<string, string[]>): string[] => {
  return Object.entries(errors).map(([field, messages]) => {
    return `${field}: ${messages.join(', ')}`;
  });
};

/**
 * Log user actions for analytics and debugging
 * @param action - The action performed
 * @param details - Additional details about the action
 */
export const logUserAction = (action: string, details?: any): void => {
  console.log('User Action:', {
    action,
    details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Handle unexpected errors with proper recovery
 * @param error - The unexpected error
 * @param fallback - Fallback function to execute
 */
export const handleUnexpectedError = (error: any, fallback?: () => void): void => {
  console.error('Unexpected Error:', error);
  toast.error('An unexpected error occurred. Please try again.');
  
  if (fallback) {
    try {
      fallback();
    } catch (fallbackError) {
      console.error('Fallback Error:', fallbackError);
    }
  }
};

/**
 * Validate input data
 * @param data - The data to validate
 * @param rules - Validation rules
 * @returns Validation result
 */
export const validateInput = (data: any, rules: Record<string, (value: any) => boolean>): boolean => {
  try {
    return Object.entries(rules).every(([field, validator]) => {
      const value = data[field];
      return validator(value);
    });
  } catch (error) {
    console.error('Validation Error:', error);
    return false;
  }
};

/**
 * Format error message for display
 * @param error - The error to format
 * @returns Formatted error message
 */
export const formatErrorMessage = (error: AppError): string => {
  if (error.details && typeof error.details === 'object') {
    return `${error.message} (${JSON.stringify(error.details)})`;
  }
  return error.message;
};

export interface ErrorConfig {
  maxRetries: number;
  retryDelay: number; // Base delay in milliseconds
  maxRetryDelay: number; // Maximum delay in milliseconds
  circuitBreakerThreshold: number; // Number of failures before opening circuit
  circuitBreakerTimeout: number; // Time to wait before trying again
  errorReportingEnabled: boolean;
  gracefulDegradationEnabled: boolean;
  fallbackStrategies: {
    [key: string]: () => Promise<any>;
  };
}

export interface ErrorInfo {
  id: string;
  timestamp: Date;
  type: 'network' | 'timeout' | 'server' | 'client' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  endpoint?: string;
  statusCode?: number;
  retryCount: number;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  stack?: string;
  context?: Record<string, any>;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: Date | null;
  nextAttemptTime: Date | null;
  successCount: number;
  totalRequests: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
  retryCount: number;
  totalTime: number;
}

export interface ErrorReport {
  summary: {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    averageRetryCount: number;
    circuitBreakerTrips: number;
  };
  recentErrors: ErrorInfo[];
  recommendations: string[];
}

class ErrorHandlingService {
  private errorConfig: ErrorConfig;
  private errorHistory: ErrorInfo[] = [];
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private retryCounts: Map<string, number> = new Map();
  private isReportingEnabled: boolean;

  constructor(config?: Partial<ErrorConfig>) {
    this.errorConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      maxRetryDelay: 30000,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000,
      errorReportingEnabled: true,
      gracefulDegradationEnabled: true,
      fallbackStrategies: {},
      ...config
    };

    this.isReportingEnabled = this.errorConfig.errorReportingEnabled;
    this.initializeErrorHandling();
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // Set up global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleGlobalError(event.error, event.filename, event.lineno);
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.handleUnhandledRejection(event.reason);
      });
    }

    // Set up API error interceptors
    this.setupApiErrorInterceptors();
  }

  /**
   * Set up API error interceptors
   */
  private setupApiErrorInterceptors(): void {
    // Intercept fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          const errorInfo = this.createErrorInfo({
            type: this.categorizeError(response.status),
            severity: this.categorizeSeverity(response.status),
            message: `HTTP ${response.status}: ${response.statusText}`,
            endpoint: typeof args[0] === 'string' ? args[0] : 'unknown',
            statusCode: response.status
          });
          
          this.logError(errorInfo);
        }
        
        return response;
      } catch (error) {
        const errorInfo = this.createErrorInfo({
          type: 'network',
          severity: 'high',
          message: error instanceof Error ? error.message : 'Network error',
          endpoint: typeof args[0] === 'string' ? args[0] : 'unknown'
        });
        
        this.logError(errorInfo);
        throw error;
      }
    };
  }

  /**
   * Execute with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context?: string,
    customConfig?: Partial<ErrorConfig>
  ): Promise<RetryResult<T>> {
    const config = { ...this.errorConfig, ...customConfig };
    const operationId = context || 'unknown';
    const startTime = Date.now();
    let lastError: ErrorInfo | null = null;

    // Check circuit breaker
    if (this.isCircuitBreakerOpen(operationId)) {
      const errorInfo = this.createErrorInfo({
        type: 'server',
        severity: 'high',
        message: 'Circuit breaker is open',
        endpoint: operationId
      });
      
      return {
        success: false,
        error: errorInfo,
        retryCount: 0,
        totalTime: Date.now() - startTime
      };
    }

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Record success
        this.recordSuccess(operationId);
        
        return {
          success: true,
          data: result,
          retryCount: attempt,
          totalTime: Date.now() - startTime
        };

      } catch (error) {
        lastError = this.createErrorInfo({
          type: this.categorizeError(error),
          severity: this.categorizeSeverity(error),
          message: error instanceof Error ? error.message : 'Unknown error',
          endpoint: operationId,
          retryCount: attempt
        });

        this.logError(lastError);

        // Record failure
        this.recordFailure(operationId);

        // Check if we should retry
        if (attempt === config.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.retryDelay * Math.pow(2, attempt),
          config.maxRetryDelay
        );

        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.1 * delay;
        await this.delay(delay + jitter);
      }
    }

    // All retries failed, try graceful degradation
    if (config.gracefulDegradationEnabled) {
      const fallbackResult = await this.tryGracefulDegradation(operationId);
      if (fallbackResult) {
        return {
          success: true,
          data: fallbackResult,
          retryCount: config.maxRetries,
          totalTime: Date.now() - startTime
        };
      }
    }

    return {
      success: false,
      error: lastError!,
      retryCount: config.maxRetries,
      totalTime: Date.now() - startTime
    };
  }

  /**
   * Circuit breaker implementation
   */
  private isCircuitBreakerOpen(operationId: string): boolean {
    const circuitBreaker = this.getCircuitBreaker(operationId);
    
    if (!circuitBreaker.isOpen) {
      return false;
    }

    // Check if timeout has passed
    if (circuitBreaker.nextAttemptTime && Date.now() > circuitBreaker.nextAttemptTime.getTime()) {
      // Try to close the circuit
      circuitBreaker.isOpen = false;
      circuitBreaker.failureCount = 0;
      return false;
    }

    return true;
  }

  /**
   * Get or create circuit breaker for operation
   */
  private getCircuitBreaker(operationId: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(operationId)) {
      this.circuitBreakers.set(operationId, {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: null,
        nextAttemptTime: null,
        successCount: 0,
        totalRequests: 0
      });
    }
    return this.circuitBreakers.get(operationId)!;
  }

  /**
   * Record successful operation
   */
  private recordSuccess(operationId: string): void {
    const circuitBreaker = this.getCircuitBreaker(operationId);
    circuitBreaker.successCount++;
    circuitBreaker.totalRequests++;
    
    // Reset failure count on success
    if (circuitBreaker.failureCount > 0) {
      circuitBreaker.failureCount = Math.max(0, circuitBreaker.failureCount - 1);
    }
  }

  /**
   * Record failed operation
   */
  private recordFailure(operationId: string): void {
    const circuitBreaker = this.getCircuitBreaker(operationId);
    circuitBreaker.failureCount++;
    circuitBreaker.totalRequests++;
    circuitBreaker.lastFailureTime = new Date();

    // Open circuit if threshold is reached
    if (circuitBreaker.failureCount >= this.errorConfig.circuitBreakerThreshold) {
      circuitBreaker.isOpen = true;
      circuitBreaker.nextAttemptTime = new Date(
        Date.now() + this.errorConfig.circuitBreakerTimeout
      );
      
      console.warn(`Circuit breaker opened for ${operationId}`);
    }
  }

  /**
   * Try graceful degradation
   */
  private async tryGracefulDegradation(operationId: string): Promise<any> {
    const fallback = this.errorConfig.fallbackStrategies[operationId];
    if (fallback) {
      try {
        return await fallback();
      } catch (error) {
        console.error('Fallback strategy also failed:', error);
      }
    }
    return null;
  }

  /**
   * Create error info object
   */
  private createErrorInfo(partial: Partial<ErrorInfo>): ErrorInfo {
    return {
      id: this.generateErrorId(),
      timestamp: new Date(),
      type: 'unknown',
      severity: 'medium',
      message: 'Unknown error',
      retryCount: 0,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      stack: new Error().stack,
      ...partial
    };
  }

  /**
   * Categorize error type
   */
  private categorizeError(error: any): ErrorInfo['type'] {
    if (typeof error === 'number') {
      // HTTP status code
      if (error >= 500) return 'server';
      if (error >= 400) return 'client';
      return 'unknown';
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('timeout') || message.includes('timed out')) {
        return 'timeout';
      }
      if (message.includes('network') || message.includes('fetch')) {
        return 'network';
      }
    }

    return 'unknown';
  }

  /**
   * Categorize error severity
   */
  private categorizeSeverity(error: any): ErrorInfo['severity'] {
    if (typeof error === 'number') {
      if (error >= 500) return 'high';
      if (error >= 400) return 'medium';
      return 'low';
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('critical') || message.includes('fatal')) {
        return 'critical';
      }
      if (message.includes('timeout') || message.includes('network')) {
        return 'high';
      }
    }

    return 'medium';
  }

  /**
   * Log error
   */
  private logError(errorInfo: ErrorInfo): void {
    this.errorHistory.push(errorInfo);
    
    // Keep only last 1000 errors
    if (this.errorHistory.length > 1000) {
      this.errorHistory = this.errorHistory.slice(-1000);
    }

    // Report error if enabled
    if (this.isReportingEnabled) {
      this.reportError(errorInfo);
    }

    // Log to console based on severity
    switch (errorInfo.severity) {
      case 'critical':
        console.error('Critical error:', errorInfo);
        break;
      case 'high':
        console.error('High severity error:', errorInfo);
        break;
      case 'medium':
        console.warn('Medium severity error:', errorInfo);
        break;
      case 'low':
        console.log('Low severity error:', errorInfo);
        break;
    }
  }

  /**
   * Report error to external service
   */
  private async reportError(errorInfo: ErrorInfo): Promise<void> {
    try {
      // In production, send to error reporting service
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo)
      });
    } catch (error) {
      console.error('Failed to report error:', error);
    }
  }

  /**
   * Handle global errors
   */
  private handleGlobalError(error: Error, filename?: string, lineno?: number): void {
    const errorInfo = this.createErrorInfo({
      type: 'unknown',
      severity: 'high',
      message: error.message,
      context: { filename, lineno }
    });
    
    this.logError(errorInfo);
  }

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection(reason: any): void {
    const errorInfo = this.createErrorInfo({
      type: 'unknown',
      severity: 'high',
      message: reason instanceof Error ? reason.message : String(reason)
    });
    
    this.logError(errorInfo);
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user ID from context
   */
  private getUserId(): string | undefined {
    // In a real app, get from auth context
    return localStorage.getItem('userId') || undefined;
  }

  /**
   * Get session ID
   */
  private getSessionId(): string | undefined {
    return sessionStorage.getItem('sessionId') || undefined;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get error report
   */
  getErrorReport(): ErrorReport {
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    let totalRetryCount = 0;
    let circuitBreakerTrips = 0;

    this.errorHistory.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      totalRetryCount += error.retryCount;
    });

    // Count circuit breaker trips
    this.circuitBreakers.forEach(circuitBreaker => {
      if (circuitBreaker.isOpen) {
        circuitBreakerTrips++;
      }
    });

    const recommendations = this.generateRecommendations();

    return {
      summary: {
        totalErrors: this.errorHistory.length,
        errorsByType,
        errorsBySeverity,
        averageRetryCount: this.errorHistory.length > 0 ? totalRetryCount / this.errorHistory.length : 0,
        circuitBreakerTrips
      },
      recentErrors: this.errorHistory.slice(-10),
      recommendations
    };
  }

  /**
   * Generate recommendations based on error patterns
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const errorReport = this.getErrorReport();

    if (errorReport.summary.errorsByType.network > 10) {
      recommendations.push('Consider implementing offline mode and request queuing');
    }

    if (errorReport.summary.errorsByType.timeout > 5) {
      recommendations.push('Increase timeout values or implement request cancellation');
    }

    if (errorReport.summary.errorsByType.server > 20) {
      recommendations.push('Server errors are high - check backend health and implement better error handling');
    }

    if (errorReport.summary.circuitBreakerTrips > 3) {
      recommendations.push('Multiple circuit breaker trips - consider scaling or optimizing the service');
    }

    if (errorReport.summary.averageRetryCount > 2) {
      recommendations.push('High retry count - consider implementing better error recovery strategies');
    }

    return recommendations;
  }

  /**
   * Add fallback strategy
   */
  addFallbackStrategy(operationId: string, fallback: () => Promise<any>): void {
    this.errorConfig.fallbackStrategies[operationId] = fallback;
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): Map<string, CircuitBreakerState> {
    return new Map(this.circuitBreakers);
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(operationId: string): void {
    this.circuitBreakers.delete(operationId);
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Enable/disable error reporting
   */
  setErrorReportingEnabled(enabled: boolean): void {
    this.isReportingEnabled = enabled;
  }

  /**
   * Get error configuration
   */
  getConfig(): ErrorConfig {
    return { ...this.errorConfig };
  }

  /**
   * Update error configuration
   */
  updateConfig(config: Partial<ErrorConfig>): void {
    this.errorConfig = { ...this.errorConfig, ...config };
  }
}

// Export singleton instance
export const errorHandling = new ErrorHandlingService();

// Export for custom configuration
export const createErrorHandling = (config?: Partial<ErrorConfig>) => 
  new ErrorHandlingService(config); 