/**
 * React Hook for Load Testing
 * 
 * Provides easy access to load testing functionality including:
 * - Running load tests
 * - Stress testing
 * - Performance benchmarking
 * - Real-time test monitoring
 */

import { useState, useCallback, useRef } from 'react';
import { loadTesting, LoadTestConfig, LoadTestResult, StressTestResult, BenchmarkResult } from '../lib/load-testing';

export interface UseLoadTestingReturn {
  // State
  isRunning: boolean;
  currentTest: LoadTestResult | null;
  testHistory: LoadTestResult[];
  stressTestResult: StressTestResult | null;
  benchmarkResults: BenchmarkResult[];
  
  // Actions
  runLoadTest: (config: LoadTestConfig) => Promise<LoadTestResult>;
  runStressTest: (config: LoadTestConfig) => Promise<StressTestResult>;
  runBenchmarks: () => Promise<BenchmarkResult[]>;
  stopAllTests: () => void;
  clearResults: () => void;
  
  // Utilities
  getTestResults: () => Map<string, LoadTestResult>;
  exportResults: () => string;
}

export const useLoadTesting = (): UseLoadTestingReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<LoadTestResult | null>(null);
  const [testHistory, setTestHistory] = useState<LoadTestResult[]>([]);
  const [stressTestResult, setStressTestResult] = useState<StressTestResult | null>(null);
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Run a load test
   */
  const runLoadTest = useCallback(async (config: LoadTestConfig): Promise<LoadTestResult> => {
    try {
      setIsRunning(true);
      setCurrentTest(null);
      
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      
      const result = await loadTesting.runLoadTest(config);
      
      setCurrentTest(result);
      setTestHistory(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error('Load test failed:', error);
      throw error;
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Run a stress test
   */
  const runStressTest = useCallback(async (config: LoadTestConfig): Promise<StressTestResult> => {
    try {
      setIsRunning(true);
      setStressTestResult(null);
      
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      
      const result = await loadTesting.runStressTest(config);
      
      setStressTestResult(result);
      setTestHistory(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error('Stress test failed:', error);
      throw error;
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Run performance benchmarks
   */
  const runBenchmarks = useCallback(async (): Promise<BenchmarkResult[]> => {
    try {
      setIsRunning(true);
      setBenchmarkResults([]);
      
      const results = await loadTesting.runBenchmarks();
      
      setBenchmarkResults(results);
      
      return results;
    } catch (error) {
      console.error('Benchmarks failed:', error);
      throw error;
    } finally {
      setIsRunning(false);
    }
  }, []);

  /**
   * Stop all running tests
   */
  const stopAllTests = useCallback(() => {
    loadTesting.stopAllTests();
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsRunning(false);
  }, []);

  /**
   * Clear all test results
   */
  const clearResults = useCallback(() => {
    loadTesting.clearResults();
    setCurrentTest(null);
    setTestHistory([]);
    setStressTestResult(null);
    setBenchmarkResults([]);
  }, []);

  /**
   * Get all test results
   */
  const getTestResults = useCallback(() => {
    return loadTesting.getTestResults();
  }, []);

  /**
   * Export results as JSON
   */
  const exportResults = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      currentTest,
      testHistory,
      stressTestResult,
      benchmarkResults,
      allResults: Array.from(loadTesting.getTestResults().entries())
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [currentTest, testHistory, stressTestResult, benchmarkResults]);

  return {
    // State
    isRunning,
    currentTest,
    testHistory,
    stressTestResult,
    benchmarkResults,
    
    // Actions
    runLoadTest,
    runStressTest,
    runBenchmarks,
    stopAllTests,
    clearResults,
    
    // Utilities
    getTestResults,
    exportResults
  };
}; 