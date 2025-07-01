import { useState, useEffect, useCallback } from 'react';
import { usePoolerStatus } from './usePoolerStatus';

export interface PoolerMetrics {
  responseTime: number;
  activeConnections: number;
  queueSize: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  lastCheck: Date;
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHitRate: number;
}

export interface EnhancedPoolerStatus {
  // Basic status
  status: 'healthy' | 'degraded' | 'unhealthy' | 'checking';
  isBackendAvailable: boolean;
  loading: boolean;
  
  // Detailed metrics
  metrics: PoolerMetrics;
  performance: PerformanceMetrics;
  
  // Historical data
  history: PoolerMetrics[];
  
  // Actions
  refetch: () => Promise<void>;
  clearHistory: () => void;
  
  // Configuration
  setCheckInterval: (interval: number) => void;
  setMetricsRetention: (retention: number) => void;
}

interface UseEnhancedPoolerStatusConfig {
  checkInterval?: number;
  metricsRetention?: number;
  enableHistory?: boolean;
  enablePerformanceTracking?: boolean;
}

const DEFAULT_CONFIG: Required<UseEnhancedPoolerStatusConfig> = {
  checkInterval: 30000, // 30 seconds
  metricsRetention: 100, // Keep last 100 metrics
  enableHistory: true,
  enablePerformanceTracking: true
};

export function useEnhancedPoolerStatus(
  config: UseEnhancedPoolerStatusConfig = {}
): EnhancedPoolerStatus {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Use basic pooler status
  const basicStatus = usePoolerStatus();
  
  // Enhanced state
  const [metrics, setMetrics] = useState<PoolerMetrics>({
    responseTime: 0,
    activeConnections: 0,
    queueSize: 0,
    throughput: 0,
    errorRate: 0,
    uptime: 0,
    lastCheck: new Date()
  });
  
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    avgResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHitRate: 0
  });
  
  const [history, setHistory] = useState<PoolerMetrics[]>([]);
  const [checkInterval, setCheckInterval] = useState(finalConfig.checkInterval);
  const [metricsRetention, setMetricsRetention] = useState(finalConfig.metricsRetention);

  /**
   * Fetch detailed metrics from backend
   */
  const fetchDetailedMetrics = useCallback(async (): Promise<PoolerMetrics> => {
    try {
      const response = await fetch('/api/health?type=detailed');
      if (response.ok) {
        const data = await response.json();
        
        return {
          responseTime: data.response_time_ms || 0,
          activeConnections: data.active_connections || 0,
          queueSize: data.queue_size || 0,
          throughput: data.throughput || 0,
          errorRate: data.error_rate || 0,
          uptime: data.uptime || 0,
          lastCheck: new Date()
        };
      }
    } catch (error) {
      console.warn('Failed to fetch detailed metrics:', error);
    }

    // Fallback to basic metrics
    return {
      responseTime: basicStatus.poolerStatus?.responseTime || 0,
      activeConnections: basicStatus.poolerStatus?.activeConnections || 0,
      queueSize: basicStatus.poolerStatus?.queueSize || 0,
      throughput: 0,
      errorRate: 0,
      uptime: 0,
      lastCheck: new Date()
    };
  }, [basicStatus.poolerStatus]);

  /**
   * Calculate performance metrics from history
   */
  const calculatePerformanceMetrics = useCallback((metricsHistory: PoolerMetrics[]): PerformanceMetrics => {
    if (metricsHistory.length === 0) {
      return {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        cacheHitRate: 0
      };
    }

    const responseTimes = metricsHistory.map(m => m.responseTime).filter(t => t > 0);
    const sortedResponseTimes = responseTimes.sort((a, b) => a - b);

    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const p95ResponseTime = sortedResponseTimes.length > 0
      ? sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)]
      : 0;

    const p99ResponseTime = sortedResponseTimes.length > 0
      ? sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)]
      : 0;

    const totalRequests = metricsHistory.length;
    const successfulRequests = metricsHistory.filter(m => m.errorRate === 0).length;
    const failedRequests = totalRequests - successfulRequests;

    // Calculate cache hit rate (this would need to be provided by the backend)
    const cacheHitRate = 0; // Placeholder

    return {
      avgResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      totalRequests,
      successfulRequests,
      failedRequests,
      cacheHitRate
    };
  }, []);

  /**
   * Update metrics and history
   */
  const updateMetrics = useCallback(async () => {
    const newMetrics = await fetchDetailedMetrics();
    setMetrics(newMetrics);

    if (finalConfig.enableHistory) {
      setHistory(prevHistory => {
        const updatedHistory = [...prevHistory, newMetrics];
        
        // Keep only the last N metrics
        if (updatedHistory.length > metricsRetention) {
          return updatedHistory.slice(-metricsRetention);
        }
        
        return updatedHistory;
      });
    }
  }, [fetchDetailedMetrics, finalConfig.enableHistory, metricsRetention]);

  /**
   * Enhanced refetch function
   */
  const refetch = useCallback(async () => {
    await Promise.all([
      basicStatus.refetch(),
      updateMetrics()
    ]);
  }, [basicStatus.refetch, updateMetrics]);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  /**
   * Set check interval
   */
  const setCheckIntervalHandler = useCallback((interval: number) => {
    setCheckInterval(interval);
  }, []);

  /**
   * Set metrics retention
   */
  const setMetricsRetentionHandler = useCallback((retention: number) => {
    setMetricsRetention(retention);
  }, []);

  // Update performance metrics when history changes
  useEffect(() => {
    if (finalConfig.enablePerformanceTracking) {
      const newPerformance = calculatePerformanceMetrics(history);
      setPerformance(newPerformance);
    }
  }, [history, calculatePerformanceMetrics, finalConfig.enablePerformanceTracking]);

  // Initial fetch
  useEffect(() => {
    updateMetrics();
  }, [updateMetrics]);

  // Set up periodic updates
  useEffect(() => {
    const interval = setInterval(updateMetrics, checkInterval);
    return () => clearInterval(interval);
  }, [updateMetrics, checkInterval]);

  return {
    // Basic status
    status: basicStatus.status,
    isBackendAvailable: basicStatus.isBackendAvailable,
    loading: basicStatus.loading,
    
    // Detailed metrics
    metrics,
    performance,
    
    // Historical data
    history,
    
    // Actions
    refetch,
    clearHistory,
    
    // Configuration
    setCheckInterval: setCheckIntervalHandler,
    setMetricsRetention: setMetricsRetentionHandler
  };
}

// Hook for monitoring specific metrics
export function usePoolerMetric(metricName: keyof PoolerMetrics) {
  const { metrics } = useEnhancedPoolerStatus();
  return metrics[metricName];
}

// Hook for performance alerts
export function usePerformanceAlerts() {
  const { performance, metrics } = useEnhancedPoolerStatus();
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const newAlerts: string[] = [];

    // Response time alerts
    if (metrics.responseTime > 1000) {
      newAlerts.push('High response time detected');
    }

    // Error rate alerts
    if (metrics.errorRate > 0.05) {
      newAlerts.push('High error rate detected');
    }

    // Queue size alerts
    if (metrics.queueSize > 50) {
      newAlerts.push('Large queue size detected');
    }

    // Performance degradation alerts
    if (performance.avgResponseTime > 2000) {
      newAlerts.push('Performance degradation detected');
    }

    setAlerts(newAlerts);
  }, [metrics, performance]);

  return alerts;
} 