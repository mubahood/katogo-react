// src/app/services/CacheUtils.ts
/**
 * CacheUtils - Utility functions for cache operations
 * 
 * Provides helper functions for common cache operations and data validation
 */

import CacheService, { CacheKey, StorageType } from './CacheService';
import { CACHE_KEYS } from '../constants';

/**
 * Cache-first data loader with fallback
 */
export class CacheUtils {
  /**
   * Get data with cache-first strategy
   * 1. Check cache first
   * 2. If miss or expired, execute fallback function
   * 3. Cache the result from fallback
   */
  static async getWithFallback<T>(
    cacheKey: CacheKey,
    fallbackFn: () => Promise<T>,
    options: {
      storageType?: StorageType;
      customDuration?: number;
      skipCache?: boolean;
      validateData?: (data: T) => boolean;
    } = {}
  ): Promise<T> {
    const {
      storageType = 'localStorage',
      customDuration,
      skipCache = false,
      validateData
    } = options;

    try {
      // Check cache first (unless explicitly skipped)
      if (!skipCache) {
        const cached = CacheService.get<T>(cacheKey, storageType);
        
        if (cached !== null) {
          // Validate cached data if validator provided
          if (!validateData || validateData(cached)) {
            return cached;
          } else {
            // Invalid cached data, remove it
            console.warn(`⚠️ Cached data validation failed for ${cacheKey}, removing from cache`, {
              dataType: typeof cached,
              isArray: Array.isArray(cached),
              dataLength: Array.isArray(cached) ? cached.length : 'N/A',
              sampleData: Array.isArray(cached) && cached.length > 0 ? cached[0] : cached
            });
            CacheService.delete(cacheKey, storageType);
          }
        }
      }

      // Cache miss or invalid data - fetch fresh data
      const freshData = await fallbackFn();

      // Validate fresh data before caching
      if (validateData && !validateData(freshData)) {
        console.error(`❌ Fresh data validation failed for ${cacheKey}`, {
          dataType: typeof freshData,
          isArray: Array.isArray(freshData),
          dataLength: Array.isArray(freshData) ? freshData.length : 'N/A',
          sampleData: Array.isArray(freshData) && freshData.length > 0 ? freshData[0] : freshData
        });
        throw new Error(`Fresh data validation failed for ${cacheKey}`);
      }

      // Cache the fresh data
      CacheService.set(cacheKey, freshData, customDuration, storageType);

      return freshData;
    } catch (error) {
      console.error(`Cache fallback failed for ${cacheKey}:`, error);
      throw error;
    }
  }

  /**
   * Preload data into cache (background operation)
   */
  static async preload<T>(
    cacheKey: CacheKey,
    dataFn: () => Promise<T>,
    options: {
      storageType?: StorageType;
      customDuration?: number;
      force?: boolean;
    } = {}
  ): Promise<boolean> {
    const { storageType = 'localStorage', customDuration, force = false } = options;

    try {
      // Skip if data already exists and not forcing refresh
      if (!force && CacheService.has(cacheKey, storageType)) {
        return true;
      }

      const data = await dataFn();
      return CacheService.set(cacheKey, data, customDuration, storageType);
    } catch (error) {
      console.warn(`Cache preload failed for ${cacheKey}:`, error);
      return false;
    }
  }

  /**
   * Refresh cached data in background
   */
  static async refreshInBackground<T>(
    cacheKey: CacheKey,
    dataFn: () => Promise<T>,
    options: {
      storageType?: StorageType;
      customDuration?: number;
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<void> {
    const { storageType = 'localStorage', customDuration, onSuccess, onError } = options;

    // Run in background - don't await
    setTimeout(async () => {
      try {
        const freshData = await dataFn();
        const success = CacheService.set(cacheKey, freshData, customDuration, storageType);
        
        if (success && onSuccess) {
          onSuccess(freshData);
        }
      } catch (error) {
        console.warn(`Background refresh failed for ${cacheKey}:`, error);
        if (onError) {
          onError(error as Error);
        }
      }
    }, 0);
  }

  /**
   * Cache multiple items with batch operation
   */
  static setBatch<T>(
    items: Array<{
      key: CacheKey;
      data: T;
      duration?: number;
      storageType?: StorageType;
    }>
  ): boolean[] {
    return items.map(item => 
      CacheService.set(
        item.key,
        item.data,
        item.duration,
        item.storageType || 'localStorage'
      )
    );
  }

  /**
   * Get multiple items from cache
   */
  static getBatch<T>(
    keys: Array<{
      key: CacheKey;
      storageType?: StorageType;
    }>
  ): Array<T | null> {
    return keys.map(item => 
      CacheService.get<T>(item.key, item.storageType || 'localStorage')
    );
  }

  /**
   * Invalidate related cache entries
   */
  static invalidatePattern(pattern: string, storageType?: StorageType): number {
    let invalidatedCount = 0;
    
    try {
      Object.entries(CACHE_KEYS).forEach(([key, cacheKey]) => {
        if (key.includes(pattern)) {
          const keyTyped = key as CacheKey;
          if (CacheService.delete(keyTyped, storageType || 'localStorage')) {
            invalidatedCount++;
          }
        }
      });
    } catch (error) {
      console.warn(`Cache invalidation failed for pattern ${pattern}:`, error);
    }

    return invalidatedCount;
  }

  /**
   * Warm up cache with essential data
   */
  static async warmUpCache(
    essentialData: Array<{
      key: CacheKey;
      dataFn: () => Promise<any>;
      priority: 'high' | 'medium' | 'low';
      storageType?: StorageType;
    }>
  ): Promise<void> {
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedData = essentialData.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    // Load high priority items first
    const highPriority = sortedData.filter(item => item.priority === 'high');
    await Promise.all(
      highPriority.map(item => 
        this.preload(item.key, item.dataFn, { storageType: item.storageType })
      )
    );

    // Load medium priority items
    const mediumPriority = sortedData.filter(item => item.priority === 'medium');
    await Promise.all(
      mediumPriority.map(item => 
        this.preload(item.key, item.dataFn, { storageType: item.storageType })
      )
    );

    // Load low priority items in background
    const lowPriority = sortedData.filter(item => item.priority === 'low');
    setTimeout(() => {
      Promise.all(
        lowPriority.map(item => 
          this.preload(item.key, item.dataFn, { storageType: item.storageType })
        )
      );
    }, 100);
  }

  /**
   * Get cache health status
   */
  static getCacheHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    stats: any;
  } {
    const stats = CacheService.getStats();
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check hit rate
    if (stats.hitRate < 30) {
      issues.push('Low cache hit rate (< 30%)');
      status = 'warning';
    }

    // Check storage usage
    if (stats.totalSize > 40 * 1024 * 1024) { // 40MB
      issues.push('High storage usage (> 40MB)');
      status = 'warning';
    }

    // Check for critical issues
    if (stats.hitRate < 10) {
      status = 'critical';
    }

    return { status, issues, stats };
  }

  /**
   * Data validators for common data types
   */
  static validators = {
    categories: (data: any[]): boolean => {
      if (!Array.isArray(data) || data.length === 0) {
        return false;
      }
      
      return data.every(item => {
        // Handle both plain objects and CategoryModel instances
        const isValidObject = item && 
          (typeof item.id === 'number' || typeof item.id === 'string') && 
          typeof item.category === 'string' &&
          item.category.length > 0;
        
        return isValidObject;
      });
    },

    products: (data: any): boolean => {
      if (Array.isArray(data)) {
        return data.every(item => 
          item && 
          (typeof item.id === 'number' || typeof item.id === 'string') && 
          typeof item.name === 'string'
        );
      }
      // Single product
      return data && 
        (typeof data.id === 'number' || typeof data.id === 'string') && 
        typeof data.name === 'string';
    },

    manifest: (data: any): boolean => {
      return data && typeof data === 'object' && 
             typeof data.app_name === 'string';
    },

    vendors: (data: any[]): boolean => {
      if (!Array.isArray(data)) {
        return false;
      }
      
      return data.every(item => 
        item && 
        (typeof item.id === 'number' || typeof item.id === 'string') && 
        typeof item.name === 'string'
      );
    }
  };
}

export default CacheUtils;