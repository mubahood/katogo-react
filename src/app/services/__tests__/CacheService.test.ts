// src/app/services/__tests__/CacheService.test.ts
/**
 * Basic tests for CacheService to ensure it works correctly
 * These tests run in isolation and don't affect existing functionality
 */

import CacheService from '../CacheService';
import { CACHE_KEYS } from '../../../Constants';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('CacheService', () => {
  beforeEach(() => {
    // Clear cache before each test
    CacheService.clearAll();
    localStorageMock.clear();
  });

  describe('Basic Operations', () => {
    test('should store and retrieve data', () => {
      const testData = { id: 1, name: 'Test Category' };
      
      // Store data
      const stored = CacheService.set('CATEGORIES', testData);
      expect(stored).toBe(true);
      
      // Retrieve data
      const retrieved = CacheService.get('CATEGORIES');
      expect(retrieved).toEqual(testData);
    });

    test('should return null for non-existent keys', () => {
      const result = CacheService.get('CATEGORIES');
      expect(result).toBeNull();
    });

    test('should handle expiration correctly', async () => {
      const testData = { id: 1, name: 'Test' };
      
      // Store with very short expiration (1ms)
      CacheService.set('CATEGORIES', testData, 1);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should return null after expiration
      const result = CacheService.get('CATEGORIES');
      expect(result).toBeNull();
    });

    test('should check existence correctly', () => {
      const testData = { id: 1, name: 'Test' };
      
      // Should not exist initially
      expect(CacheService.has('CATEGORIES')).toBe(false);
      
      // Should exist after storing
      CacheService.set('CATEGORIES', testData);
      expect(CacheService.has('CATEGORIES')).toBe(true);
    });

    test('should delete items correctly', () => {
      const testData = { id: 1, name: 'Test' };
      
      // Store and verify
      CacheService.set('CATEGORIES', testData);
      expect(CacheService.has('CATEGORIES')).toBe(true);
      
      // Delete and verify
      const deleted = CacheService.delete('CATEGORIES');
      expect(deleted).toBe(true);
      expect(CacheService.has('CATEGORIES')).toBe(false);
    });
  });

  describe('Statistics', () => {
    test('should track hits and misses', () => {
      const testData = { id: 1, name: 'Test' };
      
      // Initial stats
      let stats = CacheService.getStats();
      const initialHits = stats.hits;
      const initialMisses = stats.misses;
      
      // Cache miss
      CacheService.get('CATEGORIES');
      stats = CacheService.getStats();
      expect(stats.misses).toBe(initialMisses + 1);
      
      // Store data
      CacheService.set('CATEGORIES', testData);
      
      // Cache hit
      CacheService.get('CATEGORIES');
      stats = CacheService.getStats();
      expect(stats.hits).toBe(initialHits + 1);
    });

    test('should calculate hit rate correctly', () => {
      const testData = { id: 1, name: 'Test' };
      
      // Store data
      CacheService.set('CATEGORIES', testData);
      
      // 1 hit, 1 miss = 50% hit rate
      CacheService.get('CATEGORIES'); // hit
      CacheService.get('MANIFEST'); // miss
      
      const stats = CacheService.getStats();
      expect(stats.hitRate).toBe(50);
    });
  });

  describe('Storage Types', () => {
    test('should handle localStorage correctly', () => {
      const testData = { id: 1, name: 'Test' };
      
      CacheService.set('CATEGORIES', testData, undefined, 'localStorage');
      const retrieved = CacheService.get('CATEGORIES', 'localStorage');
      
      expect(retrieved).toEqual(testData);
    });

    test('should handle memory storage correctly', () => {
      const testData = { id: 1, name: 'Test' };
      
      CacheService.set('CATEGORIES', testData, undefined, 'memory');
      const retrieved = CacheService.get('CATEGORIES', 'memory');
      
      expect(retrieved).toEqual(testData);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid data gracefully', () => {
      // Circular reference object
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      // Should not throw error
      expect(() => {
        CacheService.set('CATEGORIES', circularObj);
      }).not.toThrow();
    });

    test('should handle storage quota exceeded', () => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = () => {
        throw new Error('QuotaExceededError');
      };
      
      const result = CacheService.set('CATEGORIES', { data: 'test' });
      expect(result).toBe(false);
      
      // Restore original method
      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('Cache Cleanup', () => {
    test('should clear all data', () => {
      // Store multiple items
      CacheService.set('CATEGORIES', { id: 1 });
      CacheService.set('MANIFEST', { id: 2 });
      
      // Verify they exist
      expect(CacheService.has('CATEGORIES')).toBe(true);
      expect(CacheService.has('MANIFEST')).toBe(true);
      
      // Clear all
      CacheService.clearAll();
      
      // Verify they're gone
      expect(CacheService.has('CATEGORIES')).toBe(false);
      expect(CacheService.has('MANIFEST')).toBe(false);
    });
  });
});

// Export for running tests
export default {};

// Console test runner for browser testing
if (typeof window !== 'undefined') {
  (window as any).runCacheTests = () => {
    console.log('🧪 Running Cache Tests...');
    
    try {
      // Basic functionality test
      console.log('Testing basic operations...');
      const testData = { id: 1, name: 'Test Category', items: [1, 2, 3] };
      
      CacheService.set('CATEGORIES', testData);
      const retrieved = CacheService.get('CATEGORIES');
      
      if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
        console.log('✅ Basic operations: PASSED');
      } else {
        console.log('❌ Basic operations: FAILED');
      }
      
      // Expiration test
      console.log('Testing expiration...');
      CacheService.set('MANIFEST', { test: true }, 100); // 100ms
      
      setTimeout(() => {
        const expired = CacheService.get('MANIFEST');
        if (expired === null) {
          console.log('✅ Expiration: PASSED');
        } else {
          console.log('❌ Expiration: FAILED');
        }
      }, 150);
      
      // Stats test
      console.log('Testing statistics...');
      CacheService.get('MANIFEST'); // This will be a miss since we're testing expiration
      CacheService.get('CATEGORIES'); // hit
      
      const stats = CacheService.getStats();
      if (stats.hits > 0 && stats.misses > 0) {
        console.log('✅ Statistics: PASSED');
      } else {
        console.log('❌ Statistics: FAILED');
      }
      
      console.log('📊 Cache Stats:', stats);
      console.log('🎉 Cache tests completed!');
      
    } catch (error) {
      console.error('❌ Cache tests failed:', error);
    }
  };
}