/**
 * Week 4 Admin Dashboard Component
 * 
 * Provides comprehensive admin interface for:
 * - Load testing management
 * - Performance optimization monitoring
 * - Error handling analytics
 * - System health monitoring
 */

import React, { useState, useEffect } from 'react';
import { useLoadTesting } from '../../hooks/useLoadTesting';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';
import { useErrorHandling } from '../../hooks/useErrorHandling';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Play, 
  Square, 
  BarChart3, 
  Activity, 
  AlertTriangle, 
  Settings,
  Download,
  RefreshCw,
  Zap,
  Shield,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface LoadTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  rampUpTime: number; // seconds
  testDuration: number; // seconds
  targetRPS: number;
  timeout: number; // milliseconds
  endpoints: string[];
  payloadSize: 'small' | 'medium' | 'large';
}

export const Week4Dashboard: React.FC = () => {
  const {
    isRunning: loadTestRunning,
    currentTest,
    testHistory,
    stressTestResult,
    benchmarkResults,
    runLoadTest,
    runStressTest,
    runBenchmarks,
    stopAllTests,
    clearResults,
    exportResults
  } = useLoadTesting();

  const {
    isMonitoring: perfMonitoring,
    currentMetrics,
    performanceHistory,
    optimizationResult,
    config: perfConfig,
    startMonitoring,
    stopMonitoring,
    runOptimization,
    updateConfig: updatePerfConfig,
    getPerformanceReport
  } = usePerformanceOptimization();

  const {
    errorReport,
    circuitBreakers,
    recentErrors,
    config: errorConfig,
    executeWithRetry,
    addFallbackStrategy,
    resetCircuitBreaker,
    updateConfig: updateErrorConfig,
    getErrorReport,
    clearErrorHistory,
    exportErrorReport
  } = useErrorHandling();

  const [activeTab, setActiveTab] = useState('overview');
  const [loadTestConfig, setLoadTestConfig] = useState<LoadTestConfig>({
    concurrentUsers: 10,
    requestsPerUser: 20,
    rampUpTime: 30, // 30 seconds
    testDuration: 60, // 60 seconds
    targetRPS: 50,
    timeout: 5000, // 5 seconds
    endpoints: ['/api/health', '/api/v1/subjects'],
    payloadSize: 'small'
  });

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      getErrorReport();
    }, 30000);

    return () => clearInterval(interval);
  }, [getErrorReport]);

  const handleLoadTest = async () => {
    try {
      await runLoadTest(loadTestConfig);
    } catch (error) {
      console.error('Load test failed:', error);
    }
  };

  const handleStressTest = async () => {
    try {
      await runStressTest(loadTestConfig);
    } catch (error) {
      console.error('Stress test failed:', error);
    }
  };

  const handleBenchmarks = async () => {
    try {
      await runBenchmarks();
    } catch (error) {
      console.error('Benchmarks failed:', error);
    }
  };

  const handleOptimization = async () => {
    try {
      await runOptimization();
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  const exportAllData = () => {
    const loadTestData = exportResults();
    const errorData = exportErrorReport();
    const perfData = JSON.stringify({
      performanceHistory,
      optimizationResult,
      config: perfConfig
    }, null, 2);

    // Create downloadable files
    const loadTestBlob = new Blob([loadTestData], { type: 'application/json' });
    const errorBlob = new Blob([errorData], { type: 'application/json' });
    const perfBlob = new Blob([perfData], { type: 'application/json' });

    const loadTestUrl = URL.createObjectURL(loadTestBlob);
    const errorUrl = URL.createObjectURL(errorBlob);
    const perfUrl = URL.createObjectURL(perfBlob);

    // Download files
    const loadTestLink = document.createElement('a');
    loadTestLink.href = loadTestUrl;
    loadTestLink.download = 'load-test-results.json';
    loadTestLink.click();

    const errorLink = document.createElement('a');
    errorLink.href = errorUrl;
    errorLink.download = 'error-report.json';
    errorLink.click();

    const perfLink = document.createElement('a');
    perfLink.href = perfUrl;
    perfLink.download = 'performance-data.json';
    perfLink.click();

    // Cleanup
    URL.revokeObjectURL(loadTestUrl);
    URL.revokeObjectURL(errorUrl);
    URL.revokeObjectURL(perfUrl);
  };

  const getHealthStatus = () => {
    if (!currentMetrics) return 'unknown';
    
    if (currentMetrics.errorRate > 0.05) return 'critical';
    if (currentMetrics.responseTime > 2000) return 'warning';
    if (currentMetrics.memoryUsage > 0.8) return 'warning';
    
    return 'healthy';
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Week 4: Testing & Optimization Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={exportAllData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {healthStatus === 'healthy' && <span className="text-green-600">Healthy</span>}
                {healthStatus === 'warning' && <span className="text-yellow-600">Warning</span>}
                {healthStatus === 'critical' && <span className="text-red-600">Critical</span>}
                {healthStatus === 'unknown' && <span className="text-gray-600">Unknown</span>}
              </div>
              <p className="text-sm text-gray-600">System Status</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {currentMetrics ? `${currentMetrics.responseTime.toFixed(0)}ms` : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Response Time</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {currentMetrics ? `${(currentMetrics.errorRate * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Error Rate</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {currentMetrics ? `${(currentMetrics.memoryUsage * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Memory Usage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => setActiveTab('overview')} variant={activeTab === 'overview' ? 'default' : 'outline'}>
          Overview
        </Button>
        <Button onClick={() => setActiveTab('load-testing')} variant={activeTab === 'load-testing' ? 'default' : 'outline'}>
          Load Testing
        </Button>
        <Button onClick={() => setActiveTab('performance')} variant={activeTab === 'performance' ? 'default' : 'outline'}>
          Performance
        </Button>
        <Button onClick={() => setActiveTab('errors')} variant={activeTab === 'errors' ? 'default' : 'outline'}>
          Error Handling
        </Button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={handleLoadTest} 
                  disabled={loadTestRunning}
                  className="h-20"
                >
                  <Play className="w-6 h-6 mr-2" />
                  {loadTestRunning ? 'Running...' : 'Start Load Test'}
                </Button>
                
                <Button 
                  onClick={handleOptimization}
                  variant="outline"
                  className="h-20"
                >
                  <Zap className="w-6 h-6 mr-2" />
                  Run Optimization
                </Button>
                
                <Button 
                  onClick={startMonitoring}
                  disabled={perfMonitoring}
                  variant="outline"
                  className="h-20"
                >
                  <Activity className="w-6 h-6 mr-2" />
                  {perfMonitoring ? 'Monitoring...' : 'Start Monitoring'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Load Tests</CardTitle>
              </CardHeader>
              <CardContent>
                {testHistory.length > 0 ? (
                  <div className="space-y-2">
                    {testHistory.slice(-3).map((test, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{test.testId.slice(0, 8)}...</span>
                        <Badge variant={test.errorRate < 5 ? 'default' : 'destructive'}>
                          {test.errorRate.toFixed(1)}% error
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No load tests run yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
              </CardHeader>
              <CardContent>
                {recentErrors.length > 0 ? (
                  <div className="space-y-2">
                    {recentErrors.slice(-3).map((error, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate">{error.message}</span>
                        <Badge variant={error.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {error.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent errors</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'load-testing' && (
        <div className="space-y-6">
          {/* Load Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Load Test Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Concurrent Users</label>
                  <input
                    type="number"
                    value={loadTestConfig.concurrentUsers}
                    onChange={(e) => setLoadTestConfig(prev => ({
                      ...prev,
                      concurrentUsers: parseInt(e.target.value) || 1
                    }))}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Requests per User</label>
                  <input
                    type="number"
                    value={loadTestConfig.requestsPerUser}
                    onChange={(e) => setLoadTestConfig(prev => ({
                      ...prev,
                      requestsPerUser: parseInt(e.target.value) || 1
                    }))}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="1000"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Target RPS</label>
                  <input
                    type="number"
                    value={loadTestConfig.targetRPS}
                    onChange={(e) => setLoadTestConfig(prev => ({
                      ...prev,
                      targetRPS: parseInt(e.target.value) || 1
                    }))}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button onClick={handleLoadTest} disabled={loadTestRunning}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Load Test
                </Button>
                
                <Button onClick={handleStressTest} disabled={loadTestRunning} variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Run Stress Test
                </Button>
                
                <Button onClick={handleBenchmarks} disabled={loadTestRunning} variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Run Benchmarks
                </Button>
                
                {loadTestRunning && (
                  <Button onClick={stopAllTests} variant="destructive">
                    <Square className="w-4 h-4 mr-2" />
                    Stop Tests
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Test Results */}
          {currentTest && (
            <Card>
              <CardHeader>
                <CardTitle>Current Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold">{currentTest.totalRequests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {((currentTest.successfulRequests / currentTest.totalRequests) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold text-red-600">
                      {currentTest.errorRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold">{currentTest.averageResponseTime.toFixed(0)}ms</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Response Time Distribution</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>P50: {currentTest.p50ResponseTime.toFixed(0)}ms</div>
                    <div>P95: {currentTest.p95ResponseTime.toFixed(0)}ms</div>
                    <div>P99: {currentTest.p99ResponseTime.toFixed(0)}ms</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benchmark Results */}
          {benchmarkResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benchmark Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benchmarkResults.map((result, index) => (
                    <div key={index} className="border rounded p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{result.endpoint}</h4>
                        <Badge variant={result.errorRate < 1 ? 'default' : 'destructive'}>
                          {result.errorRate.toFixed(1)}% error
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>Response: {result.averageResponseTime.toFixed(0)}ms</div>
                        <div>Throughput: {result.throughput.toFixed(1)} req/s</div>
                        <div>Recommendations: {result.recommendations.length}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Performance Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Performance Monitoring
                <Button 
                  onClick={perfMonitoring ? stopMonitoring : startMonitoring}
                  variant="outline"
                  size="sm"
                >
                  {perfMonitoring ? 'Stop' : 'Start'} Monitoring
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold">{currentMetrics.responseTime.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Throughput</p>
                    <p className="text-2xl font-bold">{currentMetrics.throughput.toFixed(1)} req/s</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Memory Usage</p>
                    <p className="text-2xl font-bold">{(currentMetrics.memoryUsage * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cache Hit Rate</p>
                    <p className="text-2xl font-bold">{(currentMetrics.cacheHitRate * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No performance metrics available</p>
              )}
            </CardContent>
          </Card>

          {/* Performance Optimization */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={handleOptimization} className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Run Performance Optimization
                </Button>
                
                {optimizationResult && (
                  <div className="border rounded p-4">
                    <h4 className="font-medium mb-2">Optimization Results</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Response Time: {optimizationResult.improvements.responseTime.toFixed(1)}% improvement</div>
                      <div>Throughput: {optimizationResult.improvements.throughput.toFixed(1)}% improvement</div>
                      <div>Memory Usage: {optimizationResult.improvements.memoryUsage.toFixed(1)}% improvement</div>
                      <div>Cache Hit Rate: {optimizationResult.improvements.cacheHitRate.toFixed(1)}% improvement</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cache TTL (minutes)</label>
                  <input
                    type="number"
                    value={perfConfig.cache.ttl / 60000}
                    onChange={(e) => updatePerfConfig({
                      cache: {
                        ...perfConfig.cache,
                        ttl: (parseInt(e.target.value) || 5) * 60000
                      }
                    })}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="60"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Cache Max Size</label>
                  <input
                    type="number"
                    value={perfConfig.cache.maxSize}
                    onChange={(e) => updatePerfConfig({
                      cache: {
                        ...perfConfig.cache,
                        maxSize: parseInt(e.target.value) || 1000
                      }
                    })}
                    className="w-full p-2 border rounded"
                    min="100"
                    max="10000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'errors' && (
        <div className="space-y-6">
          {/* Error Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Error Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {errorReport ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Errors</p>
                    <p className="text-2xl font-bold">{errorReport.summary.totalErrors}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Circuit Breaker Trips</p>
                    <p className="text-2xl font-bold text-red-600">{errorReport.summary.circuitBreakerTrips}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Retry Count</p>
                    <p className="text-2xl font-bold">{errorReport.summary.averageRetryCount.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold">
                      {errorReport.summary.totalErrors > 0 ? 
                        ((errorReport.summary.totalErrors / (errorReport.summary.totalErrors + 100)) * 100).toFixed(1) : 
                        '0'}%
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No error data available</p>
              )}
            </CardContent>
          </Card>

          {/* Circuit Breakers */}
          <Card>
            <CardHeader>
              <CardTitle>Circuit Breakers</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.from(circuitBreakers.entries()).length > 0 ? (
                <div className="space-y-2">
                  {Array.from(circuitBreakers.entries()).map(([operation, state]) => (
                    <div key={operation} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{operation}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={state.isOpen ? 'destructive' : 'default'}>
                          {state.isOpen ? 'Open' : 'Closed'}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {state.failureCount}/{errorConfig.circuitBreakerThreshold} failures
                        </span>
                        {state.isOpen && (
                          <Button 
                            onClick={() => resetCircuitBreaker(operation)}
                            size="sm"
                            variant="outline"
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No circuit breakers active</p>
              )}
            </CardContent>
          </Card>

          {/* Error Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Error Handling Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Max Retries</label>
                  <input
                    type="number"
                    value={errorConfig.maxRetries}
                    onChange={(e) => updateErrorConfig({
                      maxRetries: parseInt(e.target.value) || 3
                    })}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="10"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Retry Delay (ms)</label>
                  <input
                    type="number"
                    value={errorConfig.retryDelay}
                    onChange={(e) => updateErrorConfig({
                      retryDelay: parseInt(e.target.value) || 1000
                    })}
                    className="w-full p-2 border rounded"
                    min="100"
                    max="10000"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Circuit Breaker Threshold</label>
                  <input
                    type="number"
                    value={errorConfig.circuitBreakerThreshold}
                    onChange={(e) => updateErrorConfig({
                      circuitBreakerThreshold: parseInt(e.target.value) || 5
                    })}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="20"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button onClick={clearErrorHistory} variant="outline">
                  Clear Error History
                </Button>
                <Button onClick={getErrorReport} variant="outline">
                  Refresh Error Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}; 