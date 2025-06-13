/**
 * Performance Monitoring Utility
 * 
 * This module provides comprehensive performance monitoring functionality,
 * implementing various performance metrics and monitoring features.
 */

// Performance metrics interface
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

// Performance data storage
const performanceData: Record<string, PerformanceMetric[]> = {};

// Extend Performance interface to include memory
interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Start performance measurement
 * @param name - The name of the measurement
 * @returns The measurement start time
 */
export const startMeasurement = (name: string): number => {
  const startTime = performance.now();
  if (!performanceData[name]) {
    performanceData[name] = [];
  }
  return startTime;
};

/**
 * End performance measurement
 * @param name - The name of the measurement
 * @param startTime - The measurement start time
 */
export const endMeasurement = (name: string, startTime: number): void => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  performanceData[name].push({
    name,
    value: duration,
    timestamp: Date.now(),
  });
};

/**
 * Get performance metrics
 * @param name - The name of the measurement
 * @returns Array of performance metrics
 */
export const getMetrics = (name: string): PerformanceMetric[] => {
  return performanceData[name] || [];
};

/**
 * Calculate average performance
 * @param name - The name of the measurement
 * @returns The average performance value
 */
export const getAveragePerformance = (name: string): number => {
  const metrics = getMetrics(name);
  if (metrics.length === 0) return 0;
  const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
  return sum / metrics.length;
};

/**
 * Monitor component render performance
 * @param componentName - The name of the component
 * @returns A function to end the measurement
 */
export const monitorComponentRender = (componentName: string): () => void => {
  const startTime = startMeasurement(`render_${componentName}`);
  return () => endMeasurement(`render_${componentName}`, startTime);
};

/**
 * Monitor API call performance
 * @param endpoint - The API endpoint
 * @returns A function to end the measurement
 */
export const monitorApiCall = (endpoint: string): () => void => {
  const startTime = startMeasurement(`api_${endpoint}`);
  return () => endMeasurement(`api_${endpoint}`, startTime);
};

/**
 * Monitor user interaction performance
 * @param interactionName - The name of the interaction
 * @returns A function to end the measurement
 */
export const monitorUserInteraction = (interactionName: string): () => void => {
  const startTime = startMeasurement(`interaction_${interactionName}`);
  return () => endMeasurement(`interaction_${interactionName}`, startTime);
};

/**
 * Get performance report
 * @returns Object containing performance metrics
 */
export const getPerformanceReport = (): Record<string, number> => {
  const report: Record<string, number> = {};
  Object.keys(performanceData).forEach((name) => {
    report[name] = getAveragePerformance(name);
  });
  return report;
};

/**
 * Clear performance data
 * @param name - Optional name of the measurement to clear
 */
export const clearPerformanceData = (name?: string): void => {
  if (name) {
    delete performanceData[name];
  } else {
    Object.keys(performanceData).forEach((key) => {
      delete performanceData[key];
    });
  }
};

/**
 * Monitor memory usage
 * @returns Current memory usage in MB
 */
export const getMemoryUsage = (): number => {
  const perf = performance as ExtendedPerformance;
  if (perf.memory) {
    return perf.memory.usedJSHeapSize / (1024 * 1024);
  }
  return 0;
};

/**
 * Monitor network performance
 * @param url - The URL to monitor
 * @returns Promise that resolves with the performance data
 */
export const monitorNetworkPerformance = async (url: string): Promise<PerformanceMetric> => {
  const startTime = performance.now();
  try {
    const response = await fetch(url);
    const endTime = performance.now();
    const duration = endTime - startTime;
    const metric: PerformanceMetric = {
      name: `network_${url}`,
      value: duration,
      timestamp: Date.now(),
    };
    if (!performanceData[metric.name]) {
      performanceData[metric.name] = [];
    }
    performanceData[metric.name].push(metric);
    return metric;
  } catch (error) {
    console.error('Network performance monitoring failed:', error);
    throw error;
  }
};

/**
 * Monitor resource loading performance
 * @param resourceUrl - The URL of the resource
 * @returns Promise that resolves with the performance data
 */
export const monitorResourceLoading = (resourceUrl: string): Promise<PerformanceMetric> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const resource = new Image();
    resource.onload = () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const metric: PerformanceMetric = {
        name: `resource_${resourceUrl}`,
        value: duration,
        timestamp: Date.now(),
      };
      if (!performanceData[metric.name]) {
        performanceData[metric.name] = [];
      }
      performanceData[metric.name].push(metric);
      resolve(metric);
    };
    resource.src = resourceUrl;
  });
};

/**
 * Monitor animation performance
 * @param animationName - The name of the animation
 * @returns A function to end the measurement
 */
export const monitorAnimation = (animationName: string): () => void => {
  const startTime = startMeasurement(`animation_${animationName}`);
  return () => endMeasurement(`animation_${animationName}`, startTime);
};

/**
 * Monitor scroll performance
 * @param element - The element to monitor
 * @returns A function to stop monitoring
 */
export const monitorScroll = (element: HTMLElement): () => void => {
  let lastScrollTime = performance.now();
  let scrollCount = 0;

  const handleScroll = () => {
    const currentTime = performance.now();
    const duration = currentTime - lastScrollTime;
    scrollCount++;

    const metric: PerformanceMetric = {
      name: 'scroll',
      value: duration,
      timestamp: Date.now(),
    };

    if (!performanceData[metric.name]) {
      performanceData[metric.name] = [];
    }
    performanceData[metric.name].push(metric);

    lastScrollTime = currentTime;
  };

  element.addEventListener('scroll', handleScroll);

  return () => {
    element.removeEventListener('scroll', handleScroll);
  };
}; 