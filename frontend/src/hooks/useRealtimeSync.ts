import { useState, useEffect, useCallback } from 'react';
import { realtimeSync, SyncEvent, SyncStatus } from '@/lib/realtime-sync';

export interface UseRealtimeSyncReturn {
  // Status
  status: SyncStatus;
  connected: boolean;
  loading: boolean;
  error: string | null;
  
  // Events
  events: SyncEvent[];
  pendingChanges: number;
  conflicts: number;
  
  // Actions
  initialize: () => Promise<void>;
  disconnect: () => void;
  clearEvents: () => void;
  
  // Event handling
  on: (eventType: string, callback: (event: SyncEvent) => void) => void;
  off: (eventType: string, callback: (event: SyncEvent) => void) => void;
}

export function useRealtimeSync(): UseRealtimeSyncReturn {
  const [status, setStatus] = useState<SyncStatus>({
    connected: false,
    lastSync: null,
    pendingChanges: 0,
    conflicts: 0,
    errors: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<SyncEvent[]>([]);

  /**
   * Initialize real-time sync
   */
  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await realtimeSync.initialize();
      
      // Set up event listeners
      realtimeSync.on('dataChange', (event) => {
        setEvents(prev => [...prev, event]);
      });
      
      realtimeSync.on('conflict', (event) => {
        setEvents(prev => [...prev, event]);
      });
      
      realtimeSync.on('conflictResolved', (event) => {
        setEvents(prev => [...prev, event]);
      });
      
      realtimeSync.on('cacheUpdate', (event) => {
        setEvents(prev => [...prev, event]);
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize real-time sync';
      setError(errorMessage);
      console.error('Real-time sync initialization failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Disconnect from real-time sync
   */
  const disconnect = useCallback(() => {
    realtimeSync.disconnect();
  }, []);

  /**
   * Clear events
   */
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  /**
   * Add event listener
   */
  const on = useCallback((eventType: string, callback: (event: SyncEvent) => void) => {
    realtimeSync.on(eventType, callback);
  }, []);

  /**
   * Remove event listener
   */
  const off = useCallback((eventType: string, callback: (event: SyncEvent) => void) => {
    realtimeSync.off(eventType, callback);
  }, []);

  // Update status periodically
  useEffect(() => {
    const updateStatus = () => {
      const currentStatus = realtimeSync.getStatus();
      setStatus(currentStatus);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    // Status
    status,
    connected: status.connected,
    loading,
    error,
    
    // Events
    events,
    pendingChanges: status.pendingChanges,
    conflicts: status.conflicts,
    
    // Actions
    initialize,
    disconnect,
    clearEvents,
    
    // Event handling
    on,
    off
  };
}

// Hook for monitoring specific resource
export function useResourceSync(resource: string, resourceId?: string) {
  const { events, on, off } = useRealtimeSync();
  const [resourceEvents, setResourceEvents] = useState<SyncEvent[]>([]);

  useEffect(() => {
    const handleResourceEvent = (event: SyncEvent) => {
      if (event.resource === resource && (!resourceId || event.resourceId === resourceId)) {
        setResourceEvents(prev => [...prev, event]);
      }
    };

    on('dataChange', handleResourceEvent);
    on('conflict', handleResourceEvent);
    on('conflictResolved', handleResourceEvent);

    return () => {
      off('dataChange', handleResourceEvent);
      off('conflict', handleResourceEvent);
      off('conflictResolved', handleResourceEvent);
    };
  }, [resource, resourceId, on, off]);

  return {
    events: resourceEvents,
    latestEvent: resourceEvents[resourceEvents.length - 1] || null
  };
}

// Hook for conflict resolution
export function useConflictResolution() {
  const { events, on, off } = useRealtimeSync();
  const [conflicts, setConflicts] = useState<SyncEvent[]>([]);

  useEffect(() => {
    const handleConflict = (event: SyncEvent) => {
      if (event.type === 'conflict') {
        setConflicts(prev => [...prev, event]);
      }
    };

    const handleConflictResolved = (event: SyncEvent) => {
      if (event.type === 'conflict' && (event as any).resolved) {
        setConflicts(prev => prev.filter(c => c.id !== event.id));
      }
    };

    on('conflict', handleConflict);
    on('conflictResolved', handleConflictResolved);

    return () => {
      off('conflict', handleConflict);
      off('conflictResolved', handleConflictResolved);
    };
  }, [on, off]);

  const resolveConflict = useCallback(async (conflictId: string, resolution: 'accept' | 'reject' | 'merge') => {
    // This would integrate with the conflict resolution system
    console.log(`Resolving conflict ${conflictId} with resolution: ${resolution}`);
  }, []);

  return {
    conflicts,
    resolveConflict,
    hasConflicts: conflicts.length > 0
  };
}

// Hook for offline queue monitoring
export function useOfflineQueue() {
  const { status, on, off } = useRealtimeSync();
  const [queueEvents, setQueueEvents] = useState<SyncEvent[]>([]);

  useEffect(() => {
    const handleOfflineEvent = (event: SyncEvent) => {
      if (!status.connected) {
        setQueueEvents(prev => [...prev, event]);
      }
    };

    on('dataChange', handleOfflineEvent);
    on('sync', handleOfflineEvent);

    return () => {
      off('dataChange', handleOfflineEvent);
      off('sync', handleOfflineEvent);
    };
  }, [status.connected, on, off]);

  return {
    queueEvents,
    pendingChanges: status.pendingChanges,
    isOffline: !status.connected
  };
}

// Hook for sync status monitoring
export function useSyncStatus() {
  const { status, connected, loading, error } = useRealtimeSync();

  const getStatusColor = () => {
    if (loading) return 'blue';
    if (error) return 'red';
    if (connected) return 'green';
    return 'yellow';
  };

  const getStatusText = () => {
    if (loading) return 'Connecting...';
    if (error) return 'Error';
    if (connected) return 'Connected';
    return 'Disconnected';
  };

  return {
    status,
    connected,
    loading,
    error,
    statusColor: getStatusColor(),
    statusText: getStatusText(),
    lastSync: status.lastSync ? new Date(status.lastSync).toLocaleTimeString() : 'Never'
  };
} 