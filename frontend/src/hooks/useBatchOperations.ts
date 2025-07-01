import { useState, useCallback } from 'react';
import { batchOperations, BatchOperation, BatchResult, BatchConfig } from '@/lib/batch-operations';

export interface UseBatchOperationsReturn {
  // State
  loading: boolean;
  error: string | null;
  stats: {
    queueSize: number;
    processing: number;
    activeBatches: number;
    completedResults: number;
  };
  
  // Operations
  addOperation: (
    type: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    priority?: 'high' | 'normal' | 'low',
    dependencies?: string[]
  ) => Promise<string>;
  
  getResult: (operationId: string) => BatchResult | null;
  waitForResult: (operationId: string, timeout?: number) => Promise<BatchResult>;
  
  // Batch operations
  executeBatch: (operations: Omit<BatchOperation, 'id' | 'retryCount' | 'timestamp'>[]) => Promise<BatchResult[]>;
  batchGet: (urls: string[], cacheKey?: string) => Promise<BatchResult[]>;
  batchPost: (url: string, dataArray: any[]) => Promise<BatchResult[]>;
  batchDelete: (urls: string[]) => Promise<BatchResult[]>;
  
  // Utilities
  clearResults: () => void;
  refetch: () => void;
}

export function useBatchOperations(): UseBatchOperationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Add operation to batch queue
   */
  const addOperation = useCallback(async (
    type: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    priority: 'high' | 'normal' | 'low' = 'normal',
    dependencies?: string[]
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      
      const operationId = await batchOperations.addOperation(type, url, data, priority, dependencies);
      
      return operationId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add operation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get result for a specific operation
   */
  const getResult = useCallback((operationId: string): BatchResult | null => {
    return batchOperations.getResult(operationId);
  }, []);

  /**
   * Wait for operation completion
   */
  const waitForResult = useCallback(async (operationId: string, timeout = 30000): Promise<BatchResult> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await batchOperations.waitForResult(operationId, timeout);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed or timed out';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Execute multiple operations in batch
   */
  const executeBatch = useCallback(async (
    operations: Omit<BatchOperation, 'id' | 'retryCount' | 'timestamp'>[]
  ): Promise<BatchResult[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await batchOperations.executeBatch(operations);
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch execution failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Batch GET operations for multiple resources
   */
  const batchGet = useCallback(async (urls: string[], cacheKey?: string): Promise<BatchResult[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await batchOperations.batchGet(urls, cacheKey);
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch GET failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Batch POST operations for multiple resources
   */
  const batchPost = useCallback(async (url: string, dataArray: any[]): Promise<BatchResult[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await batchOperations.batchPost(url, dataArray);
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch POST failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Batch DELETE operations for multiple resources
   */
  const batchDelete = useCallback(async (urls: string[]): Promise<BatchResult[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await batchOperations.batchDelete(urls);
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch DELETE failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear completed results
   */
  const clearResults = useCallback(() => {
    batchOperations.clearResults();
  }, []);

  /**
   * Refetch stats
   */
  const refetch = useCallback(() => {
    // This would trigger a re-render with updated stats
    // The stats are read directly from the batch operations service
  }, []);

  return {
    // State
    loading,
    error,
    stats: batchOperations.getStats(),
    
    // Operations
    addOperation,
    getResult,
    waitForResult,
    
    // Batch operations
    executeBatch,
    batchGet,
    batchPost,
    batchDelete,
    
    // Utilities
    clearResults,
    refetch
  };
}

// Hook for monitoring specific operation
export function useBatchOperation(operationId: string) {
  const { getResult, waitForResult, loading, error } = useBatchOperations();
  const [result, setResult] = useState<BatchResult | null>(null);

  const checkResult = useCallback(() => {
    const currentResult = getResult(operationId);
    if (currentResult) {
      setResult(currentResult);
    }
  }, [getResult, operationId]);

  const waitForOperation = useCallback(async () => {
    try {
      const operationResult = await waitForResult(operationId);
      setResult(operationResult);
      return operationResult;
    } catch (err) {
      throw err;
    }
  }, [waitForResult, operationId]);

  return {
    result,
    loading,
    error,
    checkResult,
    waitForOperation
  };
}

// Hook for batch operations with automatic result tracking
export function useBatchOperationsWithTracking() {
  const batchOps = useBatchOperations();
  const [trackedOperations, setTrackedOperations] = useState<Map<string, BatchResult>>(new Map());

  const addOperationWithTracking = useCallback(async (
    type: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    priority?: 'high' | 'normal' | 'low',
    dependencies?: string[]
  ) => {
    const operationId = await batchOps.addOperation(type, url, data, priority, dependencies);
    
    // Set up result tracking
    const checkResult = () => {
      const result = batchOps.getResult(operationId);
      if (result) {
        setTrackedOperations(prev => new Map(prev).set(operationId, result));
      }
    };

    // Check result periodically
    const interval = setInterval(checkResult, 100);
    
    // Clean up interval when result is found
    const cleanup = () => {
      clearInterval(interval);
    };

    return { operationId, cleanup };
  }, [batchOps]);

  return {
    ...batchOps,
    trackedOperations,
    addOperationWithTracking
  };
} 