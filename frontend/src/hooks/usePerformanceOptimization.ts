/**
 * React Hook for Performance Optimization
 * 
 * Provides easy access to performance optimization features including:
 * - Performance monitoring
 * - Automatic optimization
 * - Cache management
 * - Resource monitoring
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  performanceOptimization, 
  OptimizationConfig, 
  PerformanceMetrics, 
  OptimizationResult 
} from '../lib/performance-optimization';

export interface UsePerformanceOptimizationReturn {
  // State
  isMonitoring: boolean;
  currentMetrics: PerformanceMetrics | null;
  performanceHistory: PerformanceMetrics[];
  optimizationResult: OptimizationResult | null;
  config: OptimizationConfig;
  
  // Actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  runOptimization: () => Promise<OptimizationResult>;
  updateConfig: (config: Partial<OptimizationConfig>) => void;
  
  // Cache management
  setCache: (key: string, data: any, ttl?: number) => void;
  getCache: (key: string) => any;
  
  // Utilities
  getPerformanceReport: () => {
    averageResponseTime: number;
    averageThroughput: number;
    averageMemoryUsage: number;
    averageCacheHitRate: number;
  };
  exportMetrics: () => string;
}

export const usePerformanceOptimization = (): UsePerformanceOptimizationReturn => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetrics[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [config, setConfig] = useState<OptimizationConfig>(performanceOptimization.getConfig());
  
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start performance monitoring
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    performanceOptimization.startPerformanceMonitoring();
    setIsMonitoring(true);
    
    // Set up interval to update metrics
    monitoringIntervalRef.current = setInterval(() => {
      const history = performanceOptimization.getPerformanceHistory();
      if (history.length > 0) {
        setCurrentMetrics(history[history.length - 1]);
        setPerformanceHistory([...history]);
      }
    }, 5000); // Update every 5 seconds
  }, [isMonitoring]);

  /**
   * Stop performance monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;
    
    performanceOptimization.stopPerformanceMonitoring();
    setIsMonitoring(false);
    
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
  }, [isMonitoring]);

  /**
   * Run optimization
   */
  const runOptimization = useCallback(async (): Promise<OptimizationResult> => {
    try {
      const result = await performanceOptimization.runOptimization();
      setOptimizationResult(result);
      return result;
    } catch (error) {
      console.error('Optimization failed:', error);
      throw error;
    }
  }, []);

  /**
   * Update configuration
   */
  const updateConfig = useCallback((newConfig: Partial<OptimizationConfig>) => {
    performanceOptimization.updateConfig(newConfig);
    setConfig(performanceOptimization.getConfig());
  }, []);

  /**
   * Set cache value
   */
  const setCache = useCallback((key: string, data: any, ttl?: number) => {
    performanceOptimization.set(key, data, ttl);
  }, []);

  /**
   * Get cache value
   */
  const getCache = useCallback((key: string) => {
    return performanceOptimization.get(key);
  }, []);

  /**
   * Get performance report
   */
  const getPerformanceReport = useCallback(() => {
    if (performanceHistory.length === 0) {
      return {
        averageResponseTime: 0,
        averageThroughput: 0,
        averageMemoryUsage: 0,
        averageCacheHitRate: 0
      };
    }

    const total = performanceHistory.reduce((acc, metrics) => ({
      responseTime: acc.responseTime + metrics.responseTime,
      throughput: acc.throughput + metrics.throughput,
      memoryUsage: acc.memoryUsage + metrics.memoryUsage,
      cacheHitRate: acc.cacheHitRate + metrics.cacheHitRate
    }), {
      responseTime: 0,
      throughput: 0,
      memoryUsage: 0,
      cacheHitRate: 0
    });

    const count = performanceHistory.length;

    return {
      averageResponseTime: total.responseTime / count,
      averageThroughput: total.throughput / count,
      averageMemoryUsage: total.memoryUsage / count,
      averageCacheHitRate: total.cacheHitRate / count
    };
  }, [performanceHistory]);

  /**
   * Export metrics as JSON
   */
  const exportMetrics = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      currentMetrics,
      performanceHistory,
      optimizationResult,
      config,
      performanceReport: getPerformanceReport()
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [currentMetrics, performanceHistory, optimizationResult, config, getPerformanceReport]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    isMonitoring,
    currentMetrics,
    performanceHistory,
    optimizationResult,
    config,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    runOptimization,
    updateConfig,
    
    // Cache management
    setCache,
    getCache,
    
    // Utilities
    getPerformanceReport,
    exportMetrics
  };
}; 