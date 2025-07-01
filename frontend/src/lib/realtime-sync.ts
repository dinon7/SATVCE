/**
 * Real-time Data Synchronization Service
 * 
 * Provides real-time data synchronization with:
 * - WebSocket connections for live updates
 * - Conflict resolution for concurrent changes
 * - Offline queue for pending changes
 * - Automatic reconnection and recovery
 */

import { enhancedApi } from './enhanced-api';
import { batchOperations } from './batch-operations';

export interface SyncEvent {
  id: string;
  type: 'create' | 'update' | 'delete' | 'sync' | 'conflict' | 'error';
  resource: string;
  resourceId: string;
  data?: any;
  timestamp: number;
  userId?: string;
  version?: number;
}

export interface SyncConfig {
  wsUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  conflictResolution: 'last-write-wins' | 'manual' | 'merge';
  offlineQueueSize: number;
  syncInterval: number;
}

export interface SyncStatus {
  connected: boolean;
  lastSync: number | null;
  pendingChanges: number;
  conflicts: number;
  errors: number;
}

const DEFAULT_CONFIG: SyncConfig = {
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  conflictResolution: 'last-write-wins',
  offlineQueueSize: 100,
  syncInterval: 10000
};

class RealtimeSyncService {
  private ws: WebSocket | null = null;
  private config: SyncConfig;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private syncTimer: NodeJS.Timeout | null = null;
  private offlineQueue: SyncEvent[] = [];
  private eventListeners: Map<string, Set<(event: SyncEvent) => void>> = new Map();
  private status: SyncStatus = {
    connected: false,
    lastSync: null,
    pendingChanges: 0,
    conflicts: 0,
    errors: 0
  };

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize real-time synchronization
   */
  async initialize(): Promise<void> {
    try {
      await this.connect();
      this.startHeartbeat();
      this.startPeriodicSync();
      this.loadOfflineQueue();
    } catch (error) {
      console.error('Failed to initialize real-time sync:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Connect to WebSocket server
   */
  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.status.connected = true;
          this.reconnectAttempts = 0;
          this.syncOfflineQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.status.connected = false;
          this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.status.errors++;
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send data through WebSocket
   */
  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // Queue for offline processing
      this.queueOfflineEvent({
        id: this.generateEventId(),
        type: 'sync',
        resource: 'unknown',
        resourceId: 'unknown',
        data,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const event: SyncEvent = JSON.parse(data);
      this.processEvent(event);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      this.status.errors++;
    }
  }

  /**
   * Process synchronization events
   */
  private processEvent(event: SyncEvent): void {
    // Update status
    if (event.type === 'conflict') {
      this.status.conflicts++;
    } else if (event.type === 'error') {
      this.status.errors++;
    }

    // Handle specific event types
    switch (event.type) {
      case 'create':
      case 'update':
      case 'delete':
        this.handleDataChange(event);
        break;
      case 'sync':
        this.handleSyncRequest(event);
        break;
      case 'conflict':
        this.handleConflict(event);
        break;
    }

    this.status.lastSync = Date.now();
  }

  /**
   * Handle data change events
   */
  private handleDataChange(event: SyncEvent): void {
    // Update local cache
    this.updateLocalCache(event);
    
    // Trigger UI updates
    this.emit('dataChange', event);
  }

  /**
   * Handle sync requests
   */
  private async handleSyncRequest(event: SyncEvent): Promise<void> {
    try {
      // Send current state for the requested resource
      const currentData = await this.getCurrentData(event.resource, event.resourceId);
      
      this.send({
        type: 'sync_response',
        resource: event.resource,
        resourceId: event.resourceId,
        data: currentData,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to handle sync request:', error);
    }
  }

  /**
   * Handle conflicts
   */
  private handleConflict(event: SyncEvent): void {
    switch (this.config.conflictResolution) {
      case 'last-write-wins':
        this.resolveConflictLastWriteWins(event);
        break;
      case 'manual':
        this.emit('conflict', event);
        break;
      case 'merge':
        this.resolveConflictMerge(event);
        break;
    }
  }

  /**
   * Resolve conflict using last-write-wins strategy
   */
  private resolveConflictLastWriteWins(event: SyncEvent): void {
    // Accept the most recent change
    this.updateLocalCache(event);
    this.emit('conflictResolved', event);
  }

  /**
   * Resolve conflict using merge strategy
   */
  private async resolveConflictMerge(event: SyncEvent): Promise<void> {
    try {
      // Get current local data
      const localData = await this.getCurrentData(event.resource, event.resourceId);
      
      // Merge changes
      const mergedData = this.mergeData(localData, event.data);
      
      // Update with merged data
      await this.updateData(event.resource, event.resourceId, mergedData);
      
      this.emit('conflictResolved', { ...event, data: mergedData });
    } catch (error) {
      console.error('Failed to merge conflict:', error);
      this.emit('conflict', event);
    }
  }

  /**
   * Merge two data objects
   */
  private mergeData(local: any, remote: any): any {
    if (!local) return remote;
    if (!remote) return local;

    // Simple merge strategy - can be enhanced
    return { ...local, ...remote };
  }

  /**
   * Update local cache
   */
  private updateLocalCache(event: SyncEvent): void {
    // This would integrate with your existing cache system
    // For now, we'll emit an event for components to handle
    this.emit('cacheUpdate', event);
  }

  /**
   * Get current data for a resource
   */
  private async getCurrentData(resource: string, resourceId: string): Promise<any> {
    try {
      const response = await enhancedApi.get(`/api/v1/${resource}/${resourceId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get current data for ${resource}/${resourceId}:`, error);
      return null;
    }
  }

  /**
   * Update data for a resource
   */
  private async updateData(resource: string, resourceId: string, data: any): Promise<void> {
    try {
      await enhancedApi.put(`/api/v1/${resource}/${resourceId}`, data);
    } catch (error) {
      console.error(`Failed to update data for ${resource}/${resourceId}:`, error);
      throw error;
    }
  }

  /**
   * Queue event for offline processing
   */
  private queueOfflineEvent(event: SyncEvent): void {
    if (this.offlineQueue.length >= this.config.offlineQueueSize) {
      this.offlineQueue.shift(); // Remove oldest event
    }
    
    this.offlineQueue.push(event);
    this.status.pendingChanges = this.offlineQueue.length;
    this.saveOfflineQueue();
  }

  /**
   * Sync offline queue when connection is restored
   */
  private async syncOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    console.log(`Syncing ${this.offlineQueue.length} offline events`);

    const events = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const event of events) {
      try {
        this.send(event);
        await this.delay(100); // Small delay between events
      } catch (error) {
        console.error('Failed to sync offline event:', error);
        this.offlineQueue.push(event); // Re-queue failed events
      }
    }

    this.status.pendingChanges = this.offlineQueue.length;
    this.saveOfflineQueue();
  }

  /**
   * Save offline queue to localStorage
   */
  private saveOfflineQueue(): void {
    try {
      localStorage.setItem('realtime_sync_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Load offline queue from localStorage
   */
  private loadOfflineQueue(): void {
    try {
      const saved = localStorage.getItem('realtime_sync_queue');
      if (saved) {
        this.offlineQueue = JSON.parse(saved);
        this.status.pendingChanges = this.offlineQueue.length;
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'heartbeat', timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Start periodic sync for offline changes
   */
  private startPeriodicSync(): void {
    this.syncTimer = setInterval(() => {
      if (this.status.connected && this.offlineQueue.length > 0) {
        this.syncOfflineQueue();
      }
    }, this.config.syncInterval);
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
        this.scheduleReconnect();
      });
    }, delay);
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add event listener
   */
  on(eventType: string, callback: (event: SyncEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  /**
   * Remove event listener
   */
  off(eventType: string, callback: (event: SyncEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(eventType: string, event: SyncEvent): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    this.status.connected = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const realtimeSync = new RealtimeSyncService();

// Export for custom configuration
export const createRealtimeSync = (config: Partial<SyncConfig>) => 
  new RealtimeSyncService(config); 