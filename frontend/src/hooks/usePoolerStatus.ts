import { useState, useEffect } from 'react';

type PoolerStatusType = 'healthy' | 'degraded' | 'unhealthy' | 'checking';

interface PoolerStatus {
  isHealthy: boolean;
  responseTime: number;
  activeConnections: number;
  queueSize: number;
  lastChecked: Date;
  error?: string;
}

interface UsePoolerStatusReturn {
  status: PoolerStatusType;
  lastCheck: Date | null;
  error: string | null;
  isChecking: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
  isBackendAvailable: boolean;
  poolerStatus: PoolerStatus | null;
}

export function usePoolerStatus(): UsePoolerStatusReturn {
  const [poolerStatus, setPoolerStatus] = useState<PoolerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setIsChecking(true);
      
      // Check basic health first
      const healthResponse = await fetch('/api/health');
      if (!healthResponse.ok) {
        throw new Error('Basic health check failed');
      }

      // Check pooler status
      const poolerResponse = await fetch('/api/health?type=pooler');
      if (poolerResponse.ok) {
        const data = await poolerResponse.json();
        const status: PoolerStatus = {
          isHealthy: data.status === 'healthy',
          responseTime: data.response_time_ms || 0,
          activeConnections: data.active_connections || 0,
          queueSize: data.queue_size || 0,
          lastChecked: new Date(),
        };
        setPoolerStatus(status);
        setIsBackendAvailable(true);
      } else {
        throw new Error('Pooler health check failed');
      }
    } catch (error) {
      console.warn('Pooler status check failed:', error);
      setPoolerStatus({
        isHealthy: false,
        responseTime: 0,
        activeConnections: 0,
        queueSize: 0,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setIsBackendAvailable(false);
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Determine status type based on pooler status
  const getStatusType = (): PoolerStatusType => {
    if (isChecking) return 'checking';
    if (!poolerStatus) return 'unhealthy';
    if (poolerStatus.isHealthy) return 'healthy';
    if (poolerStatus.responseTime > 1000 || poolerStatus.queueSize > 10) return 'degraded';
    return 'unhealthy';
  };

  return {
    status: getStatusType(),
    lastCheck: poolerStatus?.lastChecked || null,
    error: poolerStatus?.error || null,
    isChecking,
    loading,
    refetch: checkStatus,
    isBackendAvailable,
    poolerStatus
  };
} 