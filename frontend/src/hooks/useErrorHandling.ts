/**
 * React Hook for Error Handling
 * 
 * Provides easy access to error handling features including:
 * - Retry logic with exponential backoff
 * - Circuit breaker pattern
 * - Error reporting and monitoring
 * - Graceful degradation
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  errorHandling, 
  ErrorConfig, 
  ErrorInfo, 
  CircuitBreakerState, 
  RetryResult, 
  ErrorReport 
} from '../lib/error-handling';

export interface UseErrorHandlingReturn {
  // State
  errorReport: ErrorReport | null;
  circuitBreakers: Map<string, CircuitBreakerState>;
  recentErrors: ErrorInfo[];
  config: ErrorConfig;
  
  // Actions
  executeWithRetry: <T>(
    operation: () => Promise<T>,
    context?: string,
    customConfig?: Partial<ErrorConfig>
  ) => Promise<RetryResult<T>>;
  addFallbackStrategy: (operationId: string, fallback: () => Promise<any>) => void;
  resetCircuitBreaker: (operationId: string) => void;
  updateConfig: (config: Partial<ErrorConfig>) => void;
  
  // Utilities
  getErrorReport: () => ErrorReport;
  clearErrorHistory: () => void;
  setErrorReportingEnabled: (enabled: boolean) => void;
  exportErrorReport: () => string;
}

export const useErrorHandling = (): UseErrorHandlingReturn => {
  const [errorReport, setErrorReport] = useState<ErrorReport | null>(null);
  const [circuitBreakers, setCircuitBreakers] = useState<Map<string, CircuitBreakerState>>(new Map());
  const [recentErrors, setRecentErrors] = useState<ErrorInfo[]>([]);
  const [config, setConfig] = useState<ErrorConfig>(errorHandling.getConfig());

  /**
   * Execute operation with retry logic
   */
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string,
    customConfig?: Partial<ErrorConfig>
  ): Promise<RetryResult<T>> => {
    try {
      const result = await errorHandling.executeWithRetry(operation, context, customConfig);
      
      // Update error report after execution
      setErrorReport(errorHandling.getErrorReport());
      setCircuitBreakers(errorHandling.getCircuitBreakerStatus());
      
      return result;
    } catch (error) {
      console.error('Execute with retry failed:', error);
      throw error;
    }
  }, []);

  /**
   * Add fallback strategy
   */
  const addFallbackStrategy = useCallback((operationId: string, fallback: () => Promise<any>) => {
    errorHandling.addFallbackStrategy(operationId, fallback);
  }, []);

  /**
   * Reset circuit breaker
   */
  const resetCircuitBreaker = useCallback((operationId: string) => {
    errorHandling.resetCircuitBreaker(operationId);
    setCircuitBreakers(errorHandling.getCircuitBreakerStatus());
  }, []);

  /**
   * Update configuration
   */
  const updateConfig = useCallback((newConfig: Partial<ErrorConfig>) => {
    errorHandling.updateConfig(newConfig);
    setConfig(errorHandling.getConfig());
  }, []);

  /**
   * Get error report
   */
  const getErrorReport = useCallback(() => {
    const report = errorHandling.getErrorReport();
    setErrorReport(report);
    setRecentErrors(report.recentErrors);
    return report;
  }, []);

  /**
   * Clear error history
   */
  const clearErrorHistory = useCallback(() => {
    errorHandling.clearErrorHistory();
    setErrorReport(null);
    setRecentErrors([]);
  }, []);

  /**
   * Set error reporting enabled
   */
  const setErrorReportingEnabled = useCallback((enabled: boolean) => {
    errorHandling.setErrorReportingEnabled(enabled);
  }, []);

  /**
   * Export error report as JSON
   */
  const exportErrorReport = useCallback(() => {
    const report = errorHandling.getErrorReport();
    const exportData = {
      timestamp: new Date().toISOString(),
      errorReport: report,
      circuitBreakers: Array.from(errorHandling.getCircuitBreakerStatus().entries()),
      config: errorHandling.getConfig()
    };
    
    return JSON.stringify(exportData, null, 2);
  }, []);

  // Update error report periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const report = errorHandling.getErrorReport();
      setErrorReport(report);
      setRecentErrors(report.recentErrors);
      setCircuitBreakers(errorHandling.getCircuitBreakerStatus());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    // State
    errorReport,
    circuitBreakers,
    recentErrors,
    config,
    
    // Actions
    executeWithRetry,
    addFallbackStrategy,
    resetCircuitBreaker,
    updateConfig,
    
    // Utilities
    getErrorReport,
    clearErrorHistory,
    setErrorReportingEnabled,
    exportErrorReport
  };
}; 