/**
 * Batch Operations Service
 * 
 * Provides efficient batch processing for multiple API operations
 * with intelligent queuing, deduplication, and performance optimization.
 */

import { enhancedApi } from './enhanced-api';

// Batch operation types
export type BatchOperationType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface BatchOperation {
  id: string;
  type: BatchOperationType;
  url: string;
  data?: any;
  priority: 'high' | 'normal' | 'low';
  retryCount: number;
  timestamp: number;
  dependencies?: string[]; // IDs of operations that must complete first
}

export interface BatchResult {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
  responseTime: number;
}

export interface BatchConfig {
  maxBatchSize: number;
  maxConcurrentBatches: number;
  batchTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  priorityQueue: boolean;
}

// Default configuration
const DEFAULT_CONFIG: BatchConfig = {
  maxBatchSize: 10,
  maxConcurrentBatches: 3,
  batchTimeout: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
  priorityQueue: true
};

class BatchOperationsService {
  private queue: BatchOperation[] = [];
  private processing: Set<string> = new Set();
  private results: Map<string, BatchResult> = new Map();
  private config: BatchConfig;
  private batchTimer: NodeJS.Timeout | null = null;
  private activeBatches = 0;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add operation to batch queue
   */
  async addOperation(
    type: BatchOperationType,
    url: string,
    data?: any,
    priority: 'high' | 'normal' | 'low' = 'normal',
    dependencies?: string[]
  ): Promise<string> {
    const id = this.generateOperationId();
    const operation: BatchOperation = {
      id,
      type,
      url,
      data,
      priority,
      retryCount: 0,
      timestamp: Date.now(),
      dependencies
    };

    this.queue.push(operation);
    this.scheduleBatchProcessing();

    return id;
  }

  /**
   * Get result for a specific operation
   */
  getResult(operationId: string): BatchResult | null {
    return this.results.get(operationId) || null;
  }

  /**
   * Wait for operation completion
   */
  async waitForResult(operationId: string, timeout = 30000): Promise<BatchResult> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const result = this.results.get(operationId);
      if (result) {
        return result;
      }
      
      // Check if operation failed
      if (!this.queue.find(op => op.id === operationId) && 
          !this.processing.has(operationId)) {
        throw new Error(`Operation ${operationId} not found or failed`);
      }
      
      await this.delay(100);
    }
    
    throw new Error(`Operation ${operationId} timed out`);
  }

  /**
   * Execute multiple operations in batch
   */
  async executeBatch(operations: Omit<BatchOperation, 'id' | 'retryCount' | 'timestamp'>[]): Promise<BatchResult[]> {
    const operationIds = await Promise.all(
      operations.map(op => 
        this.addOperation(op.type, op.url, op.data, op.priority, op.dependencies)
      )
    );

    const results = await Promise.all(
      operationIds.map(id => this.waitForResult(id))
    );

    return results;
  }

  /**
   * Batch GET operations for multiple resources
   */
  async batchGet(urls: string[], cacheKey?: string): Promise<BatchResult[]> {
    const operations = urls.map(url => ({
      type: 'GET' as const,
      url,
      priority: 'normal' as const
    }));

    return this.executeBatch(operations);
  }

  /**
   * Batch POST operations for multiple resources
   */
  async batchPost(url: string, dataArray: any[]): Promise<BatchResult[]> {
    const operations = dataArray.map((data, index) => ({
      type: 'POST' as const,
      url: `${url}/batch`,
      data: { ...data, batchIndex: index },
      priority: 'normal' as const
    }));

    return this.executeBatch(operations);
  }

  /**
   * Batch DELETE operations for multiple resources
   */
  async batchDelete(urls: string[]): Promise<BatchResult[]> {
    const operations = urls.map(url => ({
      type: 'DELETE' as const,
      url,
      priority: 'normal' as const
    }));

    return this.executeBatch(operations);
  }

  /**
   * Clear completed results
   */
  clearResults(): void {
    this.results.clear();
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queueSize: this.queue.length,
      processing: this.processing.size,
      activeBatches: this.activeBatches,
      completedResults: this.results.size
    };
  }

  // Private methods

  private generateOperationId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private scheduleBatchProcessing(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.config.batchTimeout);
  }

  private async processBatch(): Promise<void> {
    if (this.activeBatches >= this.config.maxConcurrentBatches || this.queue.length === 0) {
      return;
    }

    this.activeBatches++;

    try {
      // Sort queue by priority and dependencies
      const sortedQueue = this.sortQueueByPriority();
      
      // Take operations up to max batch size
      const batchOperations = sortedQueue.slice(0, this.config.maxBatchSize);
      
      // Remove from queue and add to processing
      batchOperations.forEach(op => {
        this.queue = this.queue.filter(qop => qop.id !== op.id);
        this.processing.add(op.id);
      });

      // Execute batch
      await this.executeBatchOperations(batchOperations);

    } finally {
      this.activeBatches--;
      
      // Process next batch if queue is not empty
      if (this.queue.length > 0) {
        this.scheduleBatchProcessing();
      }
    }
  }

  private sortQueueByPriority(): BatchOperation[] {
    return [...this.queue].sort((a, b) => {
      // Check dependencies first
      if (a.dependencies?.some(dep => this.processing.has(dep) || this.queue.some(qop => qop.id === dep))) {
        return 1; // Move dependent operations to end
      }
      if (b.dependencies?.some(dep => this.processing.has(dep) || this.queue.some(qop => qop.id === dep))) {
        return -1;
      }

      // Sort by priority
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      // Sort by timestamp (FIFO for same priority)
      return a.timestamp - b.timestamp;
    });
  }

  private async executeBatchOperations(operations: BatchOperation[]): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Group operations by type for efficiency
      const groupedOperations = this.groupOperationsByType(operations);
      
      // Execute each group
      for (const [type, ops] of Object.entries(groupedOperations)) {
        await this.executeOperationGroup(type as BatchOperationType, ops);
      }

    } catch (error) {
      console.error('Batch execution failed:', error);
      
      // Mark all operations as failed
      operations.forEach(op => {
        this.results.set(op.id, {
          id: op.id,
          success: false,
          error: error instanceof Error ? error.message : 'Batch execution failed',
          responseTime: Date.now() - startTime
        });
        this.processing.delete(op.id);
      });
    }
  }

  private groupOperationsByType(operations: BatchOperation[]): Record<BatchOperationType, BatchOperation[]> {
    return operations.reduce((groups, op) => {
      if (!groups[op.type]) {
        groups[op.type] = [];
      }
      groups[op.type].push(op);
      return groups;
    }, {} as Record<BatchOperationType, BatchOperation[]>);
  }

  private async executeOperationGroup(type: BatchOperationType, operations: BatchOperation[]): Promise<void> {
    const startTime = Date.now();

    if (type === 'GET') {
      // Batch GET requests
      await this.executeBatchGet(operations);
    } else {
      // Execute other operations individually (can be optimized later)
      await Promise.all(
        operations.map(op => this.executeSingleOperation(op))
      );
    }
  }

  private async executeBatchGet(operations: BatchOperation[]): Promise<void> {
    try {
      // Create batch request
      const urls = operations.map(op => op.url);
      const batchUrl = '/api/v1/batch/get';
      
      const response = await enhancedApi.post<Record<string, any>>(batchUrl, { urls });
      
      if (response.data) {
        // Process results
        operations.forEach((op, index) => {
          const result: BatchResult = {
            id: op.id,
            success: true,
            data: response.data && response.data[op.url],
            responseTime: Date.now() - op.timestamp
          };
          this.results.set(op.id, result);
          this.processing.delete(op.id);
        });
      } else {
        // Handle case where response.data is null
        operations.forEach(op => {
          const result: BatchResult = {
            id: op.id,
            success: false,
            error: response.error || 'Batch request failed',
            responseTime: Date.now() - op.timestamp
          };
          this.results.set(op.id, result);
          this.processing.delete(op.id);
        });
      }
    } catch (error) {
      // Fallback to individual requests
      await Promise.all(
        operations.map(op => this.executeSingleOperation(op))
      );
    }
  }

  private async executeSingleOperation(operation: BatchOperation): Promise<void> {
    const startTime = Date.now();
    
    try {
      let response;
      
      switch (operation.type) {
        case 'GET':
          response = await enhancedApi.get(operation.url);
          break;
        case 'POST':
          response = await enhancedApi.post(operation.url, operation.data);
          break;
        case 'PUT':
          response = await enhancedApi.put(operation.url, operation.data);
          break;
        case 'DELETE':
          response = await enhancedApi.delete(operation.url);
          break;
        case 'PATCH':
          response = await enhancedApi.patch(operation.url, operation.data);
          break;
      }

      const result: BatchResult = {
        id: operation.id,
        success: response.data !== undefined,
        data: response.data,
        error: response.error || undefined,
        responseTime: Date.now() - startTime
      };

      this.results.set(operation.id, result);

    } catch (error) {
      const result: BatchResult = {
        id: operation.id,
        success: false,
        error: error instanceof Error ? error.message : 'Operation failed',
        responseTime: Date.now() - startTime
      };

      this.results.set(operation.id, result);
    } finally {
      this.processing.delete(operation.id);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const batchOperations = new BatchOperationsService();

// Export for custom configuration
export const createBatchOperations = (config: Partial<BatchConfig>) => 
  new BatchOperationsService(config); 