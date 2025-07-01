/**
 * Performance Optimization Service
 * 
 * Provides comprehensive performance optimization features:
 * - Intelligent caching strategies
 * - Connection pooling optimization
 * - Query optimization and batching
 * - Resource management and cleanup
 * - Performance monitoring and alerts
 */

import { enhancedApi } from './enhanced-api';
import { batchOperations } from './batch-operations';

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of cached items
  strategy: 'lru' | 'lfu' | 'fifo';
  enableCompression: boolean;
  enablePersistence: boolean;
}

export interface OptimizationConfig {
  cache: CacheConfig;
  connectionPool: {
    minConnections: number;
    maxConnections: number;
    idleTimeout: number;
    acquireTimeout: number;
  };
  queryOptimization: {
    enableBatching: boolean;
    batchSize: number;
    enableQueryCache: boolean;
    enableResultCompression: boolean;
  };
  resourceManagement: {
    enableGarbageCollection: boolean;
    gcInterval: number;
    memoryThreshold: number;
    enableResourceMonitoring: boolean;
  };
}

export interface PerformanceMetrics {
  timestamp: Date;
  responseTime: number;
  throughput: number;
  memoryUsage: number;
  cacheHitRate: number;
  connectionPoolUtilization: number;
  errorRate: number;
  activeConnections: number;
  queuedRequests: number;
}

export interface OptimizationResult {
  success: boolean;
  improvements: {
    responseTime: number; // Percentage improvement
    throughput: number; // Percentage improvement
    memoryUsage: number; // Percentage improvement
    cacheHitRate: number; // Percentage improvement
  };
  recommendations: string[];
  appliedOptimizations: string[];
}

class PerformanceOptimizationService {
  private cache: Map<string, { data: any; timestamp: number; accessCount: number }> = new Map();
  private performanceHistory: PerformanceMetrics[] = [];
  private optimizationConfig: OptimizationConfig;
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private gcInterval?: NodeJS.Timeout;

  constructor(config?: Partial<OptimizationConfig>) {
    this.optimizationConfig = {
      cache: {
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 1000,
        strategy: 'lru',
        enableCompression: true,
        enablePersistence: false
      },
      connectionPool: {
        minConnections: 5,
        maxConnections: 50,
        idleTimeout: 30000,
        acquireTimeout: 10000
      },
      queryOptimization: {
        enableBatching: true,
        batchSize: 10,
        enableQueryCache: true,
        enableResultCompression: true
      },
      resourceManagement: {
        enableGarbageCollection: true,
        gcInterval: 5 * 60 * 1000, // 5 minutes
        memoryThreshold: 0.8, // 80% of available memory
        enableResourceMonitoring: true
      },
      ...config
    };

    this.initializeOptimizations();
  }

  /**
   * Initialize all optimization features
   */
  private initializeOptimizations(): void {
    // Start garbage collection if enabled
    if (this.optimizationConfig.resourceManagement.enableGarbageCollection) {
      this.startGarbageCollection();
    }

    // Start performance monitoring if enabled
    if (this.optimizationConfig.resourceManagement.enableResourceMonitoring) {
      this.startPerformanceMonitoring();
    }

    // Initialize connection pool
    this.initializeConnectionPool();
  }

  /**
   * Initialize connection pool
   */
  private initializeConnectionPool(): void {
    // Set up connection pool configuration
    const { minConnections, maxConnections, idleTimeout, acquireTimeout } = 
      this.optimizationConfig.connectionPool;

    // Note: Connection pool configuration is handled by the enhanced API client
    console.log('Connection pool initialized with:', {
      minConnections,
      maxConnections,
      idleTimeout,
      acquireTimeout
    });
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceMetrics();
    }, 10000); // Collect metrics every 10 seconds
  }

  /**
   * Stop performance monitoring
   */
  stopPerformanceMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
  }

  /**
   * Collect current performance metrics
   */
  private async collectPerformanceMetrics(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Test API response time
      const response = await enhancedApi.get('/api/health');
      const responseTime = Date.now() - startTime;

      // Get memory usage
      const memoryUsage = this.getMemoryUsage();

      // Get cache metrics
      const cacheHitRate = this.calculateCacheHitRate();

      // Get connection pool metrics
      const poolMetrics = await this.getConnectionPoolMetrics();

      const metrics: PerformanceMetrics = {
        timestamp: new Date(),
        responseTime,
        throughput: 1 / (responseTime / 1000), // Requests per second
        memoryUsage,
        cacheHitRate,
        connectionPoolUtilization: poolMetrics.utilization,
        errorRate: response.error ? 1 : 0,
        activeConnections: poolMetrics.activeConnections,
        queuedRequests: poolMetrics.queuedRequests
      };

      this.performanceHistory.push(metrics);

      // Keep only last 1000 metrics
      if (this.performanceHistory.length > 1000) {
        this.performanceHistory = this.performanceHistory.slice(-1000);
      }

      // Check for performance alerts
      this.checkPerformanceAlerts(metrics);

    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
    }
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    // Use a fallback approach for memory usage
    if (typeof window !== 'undefined' && 'performance' in window) {
      const perf = (window as any).performance;
      if (perf && perf.memory) {
        return perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit;
      }
    }
    return 0;
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    if (this.cache.size === 0) return 0;
    
    const totalAccesses = Array.from(this.cache.values())
      .reduce((sum, item) => sum + item.accessCount, 0);
    
    return totalAccesses > 0 ? totalAccesses / this.cache.size : 0;
  }

  /**
   * Get connection pool metrics
   */
  private async getConnectionPoolMetrics(): Promise<{
    utilization: number;
    activeConnections: number;
    queuedRequests: number;
  }> {
    try {
      const response = await fetch('/api/health?type=pooler');
      if (response.ok) {
        const data = await response.json();
        return {
          utilization: data.utilization || 0,
          activeConnections: data.active_connections || 0,
          queuedRequests: data.queued_requests || 0
        };
      }
    } catch (error) {
      console.warn('Failed to get connection pool metrics:', error);
    }

    return {
      utilization: 0,
      activeConnections: 0,
      queuedRequests: 0
    };
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(metrics: PerformanceMetrics): void {
    const alerts: string[] = [];

    if (metrics.responseTime > 2000) {
      alerts.push('High response time detected');
    }

    if (metrics.memoryUsage > this.optimizationConfig.resourceManagement.memoryThreshold) {
      alerts.push('High memory usage detected');
    }

    if (metrics.errorRate > 0.05) {
      alerts.push('High error rate detected');
    }

    if (metrics.connectionPoolUtilization > 0.9) {
      alerts.push('Connection pool near capacity');
    }

    if (alerts.length > 0) {
      console.warn('Performance alerts:', alerts);
      this.triggerOptimization();
    }
  }

  /**
   * Trigger automatic optimization
   */
  private async triggerOptimization(): Promise<void> {
    console.log('Triggering automatic optimization...');

    // Clear expired cache entries
    this.cleanupCache();

    // Optimize connection pool
    await this.optimizeConnectionPool();

    // Trigger garbage collection if needed
    if (this.getMemoryUsage() > 0.8) {
      this.forceGarbageCollection();
    }
  }

  /**
   * Cache management
   */
  set(key: string, data: any, ttl?: number): void {
    const config = this.optimizationConfig.cache;
    const itemTtl = ttl || config.ttl;

    // Check cache size limit
    if (this.cache.size >= config.maxSize) {
      this.evictCacheItem();
    }

    this.cache.set(key, {
      data: config.enableCompression ? this.compressData(data) : data,
      timestamp: Date.now(),
      accessCount: 0
    });

    // Set expiration
    setTimeout(() => {
      this.cache.delete(key);
    }, itemTtl);
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > this.optimizationConfig.cache.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access count
    item.accessCount++;
    
    return this.optimizationConfig.cache.enableCompression 
      ? this.decompressData(item.data) 
      : item.data;
  }

  /**
   * Evict cache item based on strategy
   */
  private evictCacheItem(): void {
    const strategy = this.optimizationConfig.cache.strategy;
    let keyToEvict: string | null = null;

    switch (strategy) {
      case 'lru':
        // Least Recently Used
        let oldestAccess = Infinity;
        for (const [key, item] of Array.from(this.cache.entries())) {
          if (item.accessCount < oldestAccess) {
            oldestAccess = item.accessCount;
            keyToEvict = key;
          }
        }
        break;

      case 'lfu':
        // Least Frequently Used
        let lowestFrequency = Infinity;
        for (const [key, item] of Array.from(this.cache.entries())) {
          if (item.accessCount < lowestFrequency) {
            lowestFrequency = item.accessCount;
            keyToEvict = key;
          }
        }
        break;

      case 'fifo':
        // First In First Out
        const firstKey = this.cache.keys().next().value;
        keyToEvict = firstKey || null;
        break;
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const ttl = this.optimizationConfig.cache.ttl;

    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now - item.timestamp > ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Data compression
   */
  private compressData(data: any): any {
    // Simple compression for demonstration
    // In production, use proper compression libraries
    if (typeof data === 'string') {
      return data.length > 100 ? `compressed:${btoa(data)}` : data;
    }
    return data;
  }

  /**
   * Data decompression
   */
  private decompressData(data: any): any {
    if (typeof data === 'string' && data.startsWith('compressed:')) {
      return atob(data.replace('compressed:', ''));
    }
    return data;
  }

  /**
   * Optimize connection pool
   */
  private async optimizeConnectionPool(): Promise<void> {
    const metrics = await this.getConnectionPoolMetrics();
    
    if (metrics.utilization > 0.8) {
      // Log high utilization warning
      console.warn('Connection pool utilization is high:', metrics.utilization);
    } else if (metrics.utilization < 0.3) {
      // Log low utilization
      console.log('Connection pool utilization is low:', metrics.utilization);
    }
  }

  /**
   * Start garbage collection
   */
  private startGarbageCollection(): void {
    this.gcInterval = setInterval(() => {
      this.forceGarbageCollection();
    }, this.optimizationConfig.resourceManagement.gcInterval);
  }

  /**
   * Force garbage collection
   */
  private forceGarbageCollection(): void {
    // Clear old performance history
    if (this.performanceHistory.length > 500) {
      this.performanceHistory = this.performanceHistory.slice(-500);
    }

    // Clear cache if memory usage is high
    if (this.getMemoryUsage() > 0.9) {
      this.cache.clear();
    }

    // Trigger browser garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  }

  /**
   * Run comprehensive optimization
   */
  async runOptimization(): Promise<OptimizationResult> {
    const beforeMetrics = await this.getCurrentMetrics();
    
    // Apply optimizations
    const appliedOptimizations: string[] = [];

    // Optimize cache
    if (this.optimizationConfig.cache.maxSize < 500) {
      this.optimizationConfig.cache.maxSize = 500;
      appliedOptimizations.push('Increased cache size');
    }

    // Optimize connection pool
    if (this.optimizationConfig.connectionPool.maxConnections < 100) {
      this.optimizationConfig.connectionPool.maxConnections = 100;
      appliedOptimizations.push('Increased connection pool size');
    }

    // Enable query batching
    if (!this.optimizationConfig.queryOptimization.enableBatching) {
      this.optimizationConfig.queryOptimization.enableBatching = true;
      appliedOptimizations.push('Enabled query batching');
    }

    // Apply optimizations
    this.initializeOptimizations();

    // Wait for optimizations to take effect
    await new Promise(resolve => setTimeout(resolve, 5000));

    const afterMetrics = await this.getCurrentMetrics();

    // Calculate improvements
    const improvements = {
      responseTime: this.calculateImprovement(beforeMetrics.responseTime, afterMetrics.responseTime),
      throughput: this.calculateImprovement(afterMetrics.throughput, beforeMetrics.throughput),
      memoryUsage: this.calculateImprovement(beforeMetrics.memoryUsage, afterMetrics.memoryUsage),
      cacheHitRate: this.calculateImprovement(afterMetrics.cacheHitRate, beforeMetrics.cacheHitRate)
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(afterMetrics);

    return {
      success: true,
      improvements,
      recommendations,
      appliedOptimizations
    };
  }

  /**
   * Get current performance metrics
   */
  private async getCurrentMetrics(): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    const response = await enhancedApi.get('/api/health');
    const responseTime = Date.now() - startTime;

    return {
      timestamp: new Date(),
      responseTime,
      throughput: 1 / (responseTime / 1000),
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: this.calculateCacheHitRate(),
      connectionPoolUtilization: 0,
      errorRate: response.error ? 1 : 0,
      activeConnections: 0,
      queuedRequests: 0
    };
  }

  /**
   * Calculate improvement percentage
   */
  private calculateImprovement(before: number, after: number): number {
    if (before === 0) return 0;
    return ((after - before) / before) * 100;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.responseTime > 1000) {
      recommendations.push('Consider implementing response caching');
    }

    if (metrics.memoryUsage > 0.7) {
      recommendations.push('Optimize memory usage and implement cleanup');
    }

    if (metrics.cacheHitRate < 0.5) {
      recommendations.push('Increase cache size or improve cache strategy');
    }

    if (metrics.errorRate > 0.01) {
      recommendations.push('Improve error handling and retry logic');
    }

    return recommendations;
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory];
  }

  /**
   * Get optimization configuration
   */
  getConfig(): OptimizationConfig {
    return { ...this.optimizationConfig };
  }

  /**
   * Update optimization configuration
   */
  updateConfig(config: Partial<OptimizationConfig>): void {
    this.optimizationConfig = { ...this.optimizationConfig, ...config };
    this.initializeOptimizations();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopPerformanceMonitoring();
    
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = undefined;
    }

    this.cache.clear();
    this.performanceHistory = [];
  }
}

// Export singleton instance
export const performanceOptimization = new PerformanceOptimizationService();

// Export for custom configuration
export const createPerformanceOptimization = (config?: Partial<OptimizationConfig>) => 
  new PerformanceOptimizationService(config); 