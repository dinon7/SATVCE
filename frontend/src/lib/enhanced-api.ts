/**
 * Enhanced API Client with Transaction Pooler Integration
 * 
 * This client provides:
 * - Automatic fallback to cached data when backend is unavailable
 * - Pooler-aware error handling
 * - Retry mechanisms with exponential backoff
 * - Performance monitoring
 * - Circuit breaker pattern
 */

import { auth } from '@clerk/nextjs/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    fallback: boolean;
    cached: boolean;
    performance?: {
        responseTime: number;
        retries: number;
    };
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class EnhancedApiClient {
    private cache = new Map<string, CacheEntry<any>>();
    private circuitBreaker = {
        failures: 0,
        lastFailure: 0,
        state: 'CLOSED' as 'CLOSED' | 'OPEN' | 'HALF_OPEN',
        threshold: 5,
        timeout: 30000, // 30 seconds
    };

    /**
     * Make an API request with enhanced error handling and fallback
     */
    async request<T>(
        endpoint: string,
        options: RequestInit = {},
        fallbackData?: T,
        cacheKey?: string
    ): Promise<ApiResponse<T>> {
        const startTime = Date.now();
        let retries = 0;
        const maxRetries = 3;

        // Check circuit breaker
        if (this.circuitBreaker.state === 'OPEN') {
            const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailure;
            if (timeSinceLastFailure < this.circuitBreaker.timeout) {
                return this.handleFallback<T>(fallbackData, cacheKey, 'Circuit breaker open');
            }
            this.circuitBreaker.state = 'HALF_OPEN';
        }

        // Check cache first
        if (cacheKey) {
            const cached = this.getFromCache<T>(cacheKey);
            if (cached) {
                return {
                    data: cached,
                    error: null,
                    fallback: false,
                    cached: true,
                    performance: { responseTime: 0, retries: 0 }
                };
            }
        }

        // Try backend request
        while (retries < maxRetries) {
            try {
                const { userId } = await auth();
                
                const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userId}`,
                        ...options.headers,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Cache successful response
                    if (cacheKey) {
                        this.setCache(cacheKey, data);
                    }

                    // Reset circuit breaker on success
                    this.circuitBreaker.failures = 0;
                    this.circuitBreaker.state = 'CLOSED';

                    return {
                        data,
                        error: null,
                        fallback: false,
                        cached: false,
                        performance: {
                            responseTime: Date.now() - startTime,
                            retries
                        }
                    };
                } else if (response.status === 503) {
                    // Service unavailable - likely pooler issue
                    throw new Error('Service unavailable - pooler may be down');
                } else {
                    // Other HTTP errors
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP ${response.status}`);
                }

            } catch (error) {
                retries++;
                this.circuitBreaker.failures++;
                this.circuitBreaker.lastFailure = Date.now();

                if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
                    this.circuitBreaker.state = 'OPEN';
                }

                // If this is the last retry, use fallback
                if (retries >= maxRetries) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    return this.handleFallback<T>(fallbackData, cacheKey, errorMessage);
                }

                // Exponential backoff
                await this.delay(Math.pow(2, retries) * 1000);
            }
        }

        return this.handleFallback<T>(fallbackData, cacheKey, 'Max retries exceeded');
    }

    /**
     * Handle fallback when backend is unavailable
     */
    private handleFallback<T>(
        fallbackData?: T,
        cacheKey?: string,
        errorMessage?: string
    ): ApiResponse<T> {
        // Try to get from cache even if expired
        if (cacheKey) {
            const cached = this.getFromCache<T>(cacheKey, true);
            if (cached) {
                return {
                    data: cached,
                    error: errorMessage || 'Backend unavailable',
                    fallback: true,
                    cached: true,
                    performance: { responseTime: 0, retries: 0 }
                };
            }
        }

        // Return fallback data or empty result
        return {
            data: fallbackData || null,
            error: errorMessage || 'Backend unavailable',
            fallback: true,
            cached: false,
            performance: { responseTime: 0, retries: 0 }
        };
    }

    /**
     * Get data from cache
     */
    private getFromCache<T>(key: string, includeExpired = false): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (!includeExpired && Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set data in cache
     */
    private setCache<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + CACHE_DURATION
        });
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Get circuit breaker status
     */
    getCircuitBreakerStatus() {
        return { ...this.circuitBreaker };
    }

    /**
     * Delay utility for retry backoff
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Convenience methods for common operations
    async get<T>(endpoint: string, fallbackData?: T, cacheKey?: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' }, fallbackData, cacheKey);
    }

    async post<T>(endpoint: string, data: any, fallbackData?: T): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        }, fallbackData);
    }

    async put<T>(endpoint: string, data: any, fallbackData?: T): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        }, fallbackData);
    }

    async patch<T>(endpoint: string, data: any, fallbackData?: T): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        }, fallbackData);
    }

    async delete<T>(endpoint: string, fallbackData?: T): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' }, fallbackData);
    }
}

// Export singleton instance
export const enhancedApi = new EnhancedApiClient();

// Export types for use in components
export type { ApiResponse, CacheEntry }; 