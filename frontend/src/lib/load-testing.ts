/**
 * Load Testing Service for Transaction Pooler
 * 
 * Provides comprehensive load testing capabilities including:
 * - Concurrent request testing
 * - Stress testing with increasing load
 * - Performance benchmarking
 * - Error rate monitoring
 * - Pooler capacity testing
 */

import { enhancedApi } from './enhanced-api';
import { batchOperations } from './batch-operations';

export interface LoadTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  rampUpTime: number; // seconds
  testDuration: number; // seconds
  targetRPS: number; // requests per second
  timeout: number; // milliseconds
  endpoints: string[];
  payloadSize: 'small' | 'medium' | 'large';
}

export interface LoadTestResult {
  testId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  poolerMetrics: {
    activeConnections: number;
    queueSize: number;
    throughput: number;
    errorRate: number;
  };
  errors: Array<{
    endpoint: string;
    error: string;
    count: number;
    percentage: number;
  }>;
}

export interface StressTestResult extends LoadTestResult {
  breakingPoint: number; // RPS at which system breaks
  recoveryTime: number; // Time to recover after breaking
  maxConcurrentUsers: number;
  maxRPS: number;
}

export interface BenchmarkResult {
  endpoint: string;
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  recommendations: string[];
}

class LoadTestingService {
  private activeTests: Map<string, boolean> = new Map();
  private testResults: Map<string, LoadTestResult> = new Map();

  /**
   * Run a basic load test
   */
  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    const testId = this.generateTestId();
    this.activeTests.set(testId, true);
    
    const startTime = new Date();
    const results: Array<{
      endpoint: string;
      responseTime: number;
      success: boolean;
      error?: string;
    }> = [];

    try {
      // Calculate request distribution
      const totalRequests = config.concurrentUsers * config.requestsPerUser;
      const requestsPerSecond = config.targetRPS;
      const delayBetweenRequests = 1000 / requestsPerSecond;

      // Create concurrent user simulations
      const userPromises = Array.from({ length: config.concurrentUsers }, (_, userIndex) =>
        this.simulateUser(userIndex, config, delayBetweenRequests, results)
      );

      // Wait for all users to complete
      await Promise.all(userPromises);

    } catch (error) {
      console.error('Load test failed:', error);
    } finally {
      this.activeTests.set(testId, false);
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    // Calculate metrics
    const successfulRequests = results.filter(r => r.success).length;
    const failedRequests = results.filter(r => !r.success).length;
    const responseTimes = results.map(r => r.responseTime).filter(t => t > 0);

    const result: LoadTestResult = {
      testId,
      startTime,
      endTime,
      duration,
      totalRequests: results.length,
      successfulRequests,
      failedRequests,
      averageResponseTime: this.calculateAverage(responseTimes),
      p50ResponseTime: this.calculatePercentile(responseTimes, 50),
      p95ResponseTime: this.calculatePercentile(responseTimes, 95),
      p99ResponseTime: this.calculatePercentile(responseTimes, 99),
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      requestsPerSecond: results.length / (duration / 1000),
      errorRate: (failedRequests / results.length) * 100,
      poolerMetrics: await this.getPoolerMetrics(),
      errors: this.aggregateErrors(results)
    };

    this.testResults.set(testId, result);
    return result;
  }

  /**
   * Run a stress test to find breaking point
   */
  async runStressTest(config: LoadTestConfig): Promise<StressTestResult> {
    const baseConfig = { ...config };
    let currentRPS = 10;
    let breakingPoint = 0;
    let recoveryTime = 0;
    let maxConcurrentUsers = 0;
    let maxRPS = 0;

    const results: LoadTestResult[] = [];

    // Gradually increase load until system breaks
    while (currentRPS <= 1000) {
      const testConfig = { ...baseConfig, targetRPS: currentRPS };
      const result = await this.runLoadTest(testConfig);

      results.push(result);

      // Check if system is breaking (error rate > 5% or response time > 5s)
      if (result.errorRate > 5 || result.averageResponseTime > 5000) {
        breakingPoint = currentRPS;
        
        // Test recovery
        const recoveryStart = Date.now();
        await this.delay(10000); // Wait 10 seconds
        
        const recoveryTest = await this.runLoadTest({
          ...baseConfig,
          targetRPS: Math.floor(currentRPS * 0.5) // Test at 50% of breaking point
        });
        
        recoveryTime = Date.now() - recoveryStart;
        
        if (recoveryTest.errorRate < 1 && recoveryTest.averageResponseTime < 1000) {
          // System recovered
          break;
        }
      }

      maxConcurrentUsers = Math.max(maxConcurrentUsers, result.totalRequests);
      maxRPS = Math.max(maxRPS, result.requestsPerSecond);
      
      currentRPS *= 1.5; // Increase load by 50%
      
      // Wait between tests
      await this.delay(5000);
    }

    const lastResult = results[results.length - 1];
    
    return {
      ...lastResult,
      breakingPoint,
      recoveryTime,
      maxConcurrentUsers,
      maxRPS
    };
  }

  /**
   * Run performance benchmarks
   */
  async runBenchmarks(): Promise<BenchmarkResult[]> {
    const endpoints = [
      '/api/v1/subjects',
      '/api/v1/careers',
      '/api/v1/resources',
      '/api/v1/quiz/results',
      '/api/v1/users/profile'
    ];

    const results: BenchmarkResult[] = [];

    for (const endpoint of endpoints) {
      const result = await this.benchmarkEndpoint(endpoint);
      results.push(result);
    }

    return results;
  }

  /**
   * Simulate a single user
   */
  private async simulateUser(
    userIndex: number,
    config: LoadTestConfig,
    delayBetweenRequests: number,
    results: Array<{ endpoint: string; responseTime: number; success: boolean; error?: string }>
  ): Promise<void> {
    for (let i = 0; i < config.requestsPerUser; i++) {
      if (!this.activeTests.get(config.concurrentUsers.toString())) {
        break; // Test was stopped
      }

      const endpoint = config.endpoints[i % config.endpoints.length];
      const payload = this.generatePayload(config.payloadSize);

      try {
        const startTime = Date.now();
        
        let response;
        if (endpoint.includes('GET')) {
          response = await enhancedApi.get(endpoint);
        } else if (endpoint.includes('POST')) {
          response = await enhancedApi.post(endpoint, payload);
        } else {
          response = await enhancedApi.get(endpoint);
        }

        const responseTime = Date.now() - startTime;
        
        results.push({
          endpoint,
          responseTime,
          success: response.data !== null,
          error: response.error || undefined
        });

      } catch (error) {
        results.push({
          endpoint,
          responseTime: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Wait between requests
      await this.delay(delayBetweenRequests);
    }
  }

  /**
   * Benchmark a specific endpoint
   */
  private async benchmarkEndpoint(endpoint: string): Promise<BenchmarkResult> {
    const iterations = 100;
    const results: number[] = [];
    let errors = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = Date.now();
        const response = await enhancedApi.get(endpoint);
        const responseTime = Date.now() - startTime;
        
        if (response.data !== null) {
          results.push(responseTime);
        } else {
          errors++;
        }
      } catch (error) {
        errors++;
      }

      // Small delay between requests
      await this.delay(100);
    }

    const averageResponseTime = this.calculateAverage(results);
    const throughput = results.length / (averageResponseTime / 1000);
    const errorRate = (errors / iterations) * 100;

    const recommendations = this.generateRecommendations(averageResponseTime, errorRate, throughput);

    return {
      endpoint,
      averageResponseTime,
      throughput,
      errorRate,
      recommendations
    };
  }

  /**
   * Generate test payload based on size
   */
  private generatePayload(size: 'small' | 'medium' | 'large'): any {
    switch (size) {
      case 'small':
        return { test: 'data', timestamp: Date.now() };
      case 'medium':
        return {
          test: 'data',
          timestamp: Date.now(),
          metadata: {
            user: 'test-user',
            session: 'test-session',
            version: '1.0.0'
          },
          data: Array.from({ length: 10 }, (_, i) => ({ id: i, value: `value-${i}` }))
        };
      case 'large':
        return {
          test: 'data',
          timestamp: Date.now(),
          metadata: {
            user: 'test-user',
            session: 'test-session',
            version: '1.0.0',
            environment: 'production',
            region: 'us-east-1'
          },
          data: Array.from({ length: 100 }, (_, i) => ({
            id: i,
            value: `value-${i}`,
            metadata: {
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
              tags: [`tag-${i}`, `category-${i % 5}`]
            }
          }))
        };
    }
  }

  /**
   * Get current pooler metrics
   */
  private async getPoolerMetrics(): Promise<LoadTestResult['poolerMetrics']> {
    try {
      const response = await fetch('/api/health?type=pooler');
      if (response.ok) {
        const data = await response.json();
        return {
          activeConnections: data.active_connections || 0,
          queueSize: data.queue_size || 0,
          throughput: data.throughput || 0,
          errorRate: data.error_rate || 0
        };
      }
    } catch (error) {
      console.warn('Failed to get pooler metrics:', error);
    }

    return {
      activeConnections: 0,
      queueSize: 0,
      throughput: 0,
      errorRate: 0
    };
  }

  /**
   * Calculate average of numbers
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(numbers: number[], percentile: number): number {
    if (numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Aggregate errors by type
   */
  private aggregateErrors(results: Array<{ endpoint: string; success: boolean; error?: string }>): LoadTestResult['errors'] {
    const errorMap = new Map<string, number>();
    const totalErrors = results.filter(r => !r.success).length;

    results.forEach(result => {
      if (!result.success && result.error) {
        const key = `${result.endpoint}: ${result.error}`;
        errorMap.set(key, (errorMap.get(key) || 0) + 1);
      }
    });

    return Array.from(errorMap.entries()).map(([error, count]) => ({
      endpoint: error.split(': ')[0],
      error: error.split(': ')[1],
      count,
      percentage: (count / totalErrors) * 100
    }));
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(responseTime: number, errorRate: number, throughput: number): string[] {
    const recommendations: string[] = [];

    if (responseTime > 1000) {
      recommendations.push('Consider implementing caching for this endpoint');
    }
    if (responseTime > 2000) {
      recommendations.push('Database query optimization may be needed');
    }
    if (errorRate > 1) {
      recommendations.push('Error handling should be improved');
    }
    if (errorRate > 5) {
      recommendations.push('Critical: High error rate detected');
    }
    if (throughput < 10) {
      recommendations.push('Consider batch processing for better throughput');
    }

    return recommendations;
  }

  /**
   * Generate unique test ID
   */
  private generateTestId(): string {
    return `load_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stop all active tests
   */
  stopAllTests(): void {
    this.activeTests.forEach((_, testId) => {
      this.activeTests.set(testId, false);
    });
  }

  /**
   * Get test results
   */
  getTestResults(): Map<string, LoadTestResult> {
    return new Map(this.testResults);
  }

  /**
   * Clear test results
   */
  clearResults(): void {
    this.testResults.clear();
  }
}

// Export singleton instance
export const loadTesting = new LoadTestingService();

// Export for custom configuration
export const createLoadTesting = () => new LoadTestingService(); 