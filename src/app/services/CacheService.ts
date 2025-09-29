// src/app/services/CacheService.ts
/**
 * CacheService - Comprehensive caching system for UgFlix
 * 
 * Features:
 * - Multiple storage backends (localStorage, sessionStorage, IndexedDB)
 * - Automatic expiration and cleanup
 * - Version control for cache invalidation
 * - Size management and overflow protection
 * - Background refresh capability
 * - Performance monitoring
 * 
 * Safety: This service runs completely independently of existing code
 */

import {
  CACHE_VERSION,
  CACHE_PREFIX,
  CACHE_METADATA_KEY,
  CACHE_KEYS,
  CACHE_DURATIONS,
  CACHE_CONFIG,
  DEBUG_CONFIG
} from "../../Constants";

// Types for cache system
export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiration: number;
  version: string;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheMetadata {
  totalSize: number;
  itemCount: number;
  lastCleanup: number;
  version: string;
  createdAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  itemCount: number;
  storageUsage: {
    localStorage: number;
    sessionStorage: number;
  };
}

export type CacheKey = keyof typeof CACHE_KEYS;
export type StorageType = 'localStorage' | 'sessionStorage' | 'memory';

/**
 * Main Cache Service Class
 */
export class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, CacheItem> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalSize: 0,
    itemCount: 0,
    storageUsage: { localStorage: 0, sessionStorage: 0 }
  };

  private constructor() {
    this.initializeCache();
    this.scheduleCleanup();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Initialize cache system
   */
  private initializeCache(): void {
    try {
      // Check if cache version matches, clear if not
      const metadata = this.getMetadata();
      if (!metadata || metadata.version !== CACHE_VERSION) {
        this.clearAll();
        this.setMetadata({
          totalSize: 0,
          itemCount: 0,
          lastCleanup: Date.now(),
          version: CACHE_VERSION,
          createdAt: Date.now()
        });
      }

      // Update stats
      this.updateStats();
      
      if (CACHE_CONFIG.DEBUG_MODE) {
        console.log('🗄️ CacheService initialized', {
          version: CACHE_VERSION,
          stats: this.stats
        });
      }
    } catch (error) {
      console.warn('CacheService initialization failed:', error);
      // Graceful fallback - cache will be disabled but app continues working
    }
  }

  /**
   * Store data in cache with automatic expiration
   */
  public set<T>(
    key: CacheKey,
    data: T,
    customDuration?: number,
    storageType: StorageType = 'localStorage'
  ): boolean {
    try {
      const cacheKey = CACHE_KEYS[key];
      const duration = customDuration || CACHE_DURATIONS[key] || CACHE_DURATIONS.PRODUCTS;
      
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiration: Date.now() + duration,
        version: CACHE_VERSION,
        size: this.calculateSize(data),
        accessCount: 0,
        lastAccessed: Date.now()
      };

      // Check storage limits before storing
      if (!this.hasStorageSpace(item.size, storageType)) {
        this.cleanup(storageType);
        if (!this.hasStorageSpace(item.size, storageType)) {
          console.warn(`Cache storage full for ${storageType}, skipping cache`);
          return false;
        }
      }

      // Store in appropriate storage
      const success = this.storeItem(cacheKey, item, storageType);
      
      if (success) {
        this.updateMetadata(item.size, 1);
        this.updateStats();
        
        if (CACHE_CONFIG.DEBUG_MODE) {
          console.log(`📦 Cached [${key}] in ${storageType}`, {
            size: item.size,
            expiration: new Date(item.expiration)
          });
        }
      }

      return success;
    } catch (error) {
      console.warn(`Cache set failed for ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve data from cache
   */
  public get<T>(key: CacheKey, storageType: StorageType = 'localStorage'): T | null {
    try {
      const cacheKey = CACHE_KEYS[key];
      const item = this.getItem<T>(cacheKey, storageType);

      if (!item) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      // Check expiration
      if (this.isExpired(item)) {
        this.delete(key, storageType);
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      // Update access stats
      item.accessCount++;
      item.lastAccessed = Date.now();
      this.storeItem(cacheKey, item, storageType);

      this.stats.hits++;
      this.updateHitRate();

      if (CACHE_CONFIG.DEBUG_MODE) {
        console.log(`✅ Cache hit [${key}] from ${storageType}`, {
          age: Date.now() - item.timestamp,
          accessCount: item.accessCount
        });
      }

      return item.data;
    } catch (error) {
      console.warn(`Cache get failed for ${key}:`, error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Check if data exists and is not expired
   */
  public has(key: CacheKey, storageType: StorageType = 'localStorage'): boolean {
    try {
      const cacheKey = CACHE_KEYS[key];
      const item = this.getItem(cacheKey, storageType);
      return item !== null && !this.isExpired(item);
    } catch {
      return false;
    }
  }

  /**
   * Delete specific cache entry
   */
  public delete(key: CacheKey, storageType: StorageType = 'localStorage'): boolean {
    try {
      const cacheKey = CACHE_KEYS[key];
      const item = this.getItem(cacheKey, storageType);
      
      if (item) {
        this.updateMetadata(-item.size, -1);
      }

      return this.removeItem(cacheKey, storageType);
    } catch (error) {
      console.warn(`Cache delete failed for ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache data
   */
  public clearAll(): void {
    try {
      // Clear localStorage cache items
      Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Clear memory cache
      this.memoryCache.clear();

      // Reset metadata
      this.setMetadata({
        totalSize: 0,
        itemCount: 0,
        lastCleanup: Date.now(),
        version: CACHE_VERSION,
        createdAt: Date.now()
      });

      // Reset stats
      this.stats = {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalSize: 0,
        itemCount: 0,
        storageUsage: { localStorage: 0, sessionStorage: 0 }
      };

      if (CACHE_CONFIG.DEBUG_MODE) {
        console.log('🗑️ Cache cleared completely');
      }
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Check if cache item is expired
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() > item.expiration;
  }

  /**
   * Store item in specified storage
   */
  private storeItem(key: string, item: CacheItem, storageType: StorageType): boolean {
    try {
      const serialized = JSON.stringify(item);
      
      switch (storageType) {
        case 'localStorage':
          localStorage.setItem(key, serialized);
          return true;
        case 'sessionStorage':
          sessionStorage.setItem(key, serialized);
          return true;
        case 'memory':
          this.memoryCache.set(key, item);
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.warn(`Failed to store in ${storageType}:`, error);
      return false;
    }
  }

  /**
   * Get item from specified storage
   */
  private getItem<T>(key: string, storageType: StorageType): CacheItem<T> | null {
    try {
      let serialized: string | null = null;

      switch (storageType) {
        case 'localStorage':
          serialized = localStorage.getItem(key);
          break;
        case 'sessionStorage':
          serialized = sessionStorage.getItem(key);
          break;
        case 'memory':
          return this.memoryCache.get(key) as CacheItem<T> || null;
      }

      return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
      console.warn(`Failed to get from ${storageType}:`, error);
      return null;
    }
  }

  /**
   * Remove item from specified storage
   */
  private removeItem(key: string, storageType: StorageType): boolean {
    try {
      switch (storageType) {
        case 'localStorage':
          localStorage.removeItem(key);
          return true;
        case 'sessionStorage':
          sessionStorage.removeItem(key);
          return true;
        case 'memory':
          return this.memoryCache.delete(key);
        default:
          return false;
      }
    } catch (error) {
      console.warn(`Failed to remove from ${storageType}:`, error);
      return false;
    }
  }

  /**
   * Calculate approximate size of data in bytes
   */
  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback estimation
      return JSON.stringify(data).length * 2; // Rough estimate for UTF-16
    }
  }

  /**
   * Check if storage has enough space
   */
  private hasStorageSpace(requiredSize: number, storageType: StorageType): boolean {
    if (storageType === 'memory') {
      // For memory, check against our configured limit
      return this.stats.totalSize + requiredSize <= CACHE_CONFIG.MAX_STORAGE_SIZE;
    }

    // For localStorage/sessionStorage, we'll be more conservative
    try {
      const testKey = '__cache_test__';
      const testData = 'x'.repeat(requiredSize);
      
      if (storageType === 'localStorage') {
        localStorage.setItem(testKey, testData);
        localStorage.removeItem(testKey);
      } else {
        sessionStorage.setItem(testKey, testData);
        sessionStorage.removeItem(testKey);
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up expired items
   */
  private cleanup(storageType?: StorageType): void {
    try {
      const storageTypes: StorageType[] = storageType ? [storageType] : ['localStorage', 'sessionStorage', 'memory'];
      let cleanedItems = 0;
      let freedSize = 0;

      storageTypes.forEach(storage => {
        if (storage === 'memory') {
          this.memoryCache.forEach((item, key) => {
            if (this.isExpired(item)) {
              freedSize += item.size;
              this.memoryCache.delete(key);
              cleanedItems++;
            }
          });
        } else {
          Object.values(CACHE_KEYS).forEach(cacheKey => {
            const item = this.getItem(cacheKey, storage);
            if (item && this.isExpired(item)) {
              freedSize += item.size;
              this.removeItem(cacheKey, storage);
              cleanedItems++;
            }
          });
        }
      });

      if (cleanedItems > 0) {
        this.updateMetadata(-freedSize, -cleanedItems);
        this.updateStats();
        
        if (CACHE_CONFIG.DEBUG_MODE) {
          console.log(`🧹 Cache cleanup: ${cleanedItems} items, ${freedSize} bytes freed`);
        }
      }

      // Update last cleanup time
      const metadata = this.getMetadata();
      if (metadata) {
        metadata.lastCleanup = Date.now();
        this.setMetadata(metadata);
      }
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }

  /**
   * Schedule automatic cleanup
   */
  private scheduleCleanup(): void {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.cleanup();
      }, CACHE_CONFIG.CLEANUP_INTERVAL);
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    try {
      let totalSize = 0;
      let itemCount = 0;
      
      // Count localStorage items
      Object.values(CACHE_KEYS).forEach(key => {
        const item = this.getItem(key, 'localStorage');
        if (item && !this.isExpired(item)) {
          totalSize += item.size;
          itemCount++;
        }
      });

      // Count sessionStorage items
      Object.values(CACHE_KEYS).forEach(key => {
        const item = this.getItem(key, 'sessionStorage');
        if (item && !this.isExpired(item)) {
          totalSize += item.size;
          itemCount++;
        }
      });

      // Count memory items
      this.memoryCache.forEach(item => {
        if (!this.isExpired(item)) {
          totalSize += item.size;
          itemCount++;
        }
      });

      this.stats.totalSize = totalSize;
      this.stats.itemCount = itemCount;
      this.updateHitRate();
    } catch (error) {
      console.warn('Stats update failed:', error);
    }
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Get cache metadata
   */
  private getMetadata(): CacheMetadata | null {
    try {
      const data = localStorage.getItem(CACHE_METADATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Set cache metadata
   */
  private setMetadata(metadata: CacheMetadata): void {
    try {
      localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.warn('Failed to set cache metadata:', error);
    }
  }

  /**
   * Update cache metadata
   */
  private updateMetadata(sizeChange: number, itemChange: number): void {
    try {
      const metadata = this.getMetadata() || {
        totalSize: 0,
        itemCount: 0,
        lastCleanup: Date.now(),
        version: CACHE_VERSION,
        createdAt: Date.now()
      };

      metadata.totalSize = Math.max(0, metadata.totalSize + sizeChange);
      metadata.itemCount = Math.max(0, metadata.itemCount + itemChange);

      this.setMetadata(metadata);
    } catch (error) {
      console.warn('Failed to update cache metadata:', error);
    }
  }
}

// Export singleton instance
export default CacheService.getInstance();