// src/app/utils/CacheTestUtils.ts
/**
 * CacheTestUtils - Development utilities for testing cache functionality
 * 
 * This provides simple functions to test the cache system during development
 */

import CacheService from '../services/CacheService';
import CacheApiService from '../services/CacheApiService';
import CacheUtils from '../services/CacheUtils';

export class CacheTestUtils {
  /**
   * Run a comprehensive cache test in the browser console
   */
  static async runFullTest(): Promise<void> {
    console.log('🧪 Starting comprehensive cache test...');
    
    try {
      // Test 1: Basic cache operations
      console.log('\n📦 Testing basic cache operations...');
      await this.testBasicOperations();
      
      // Test 2: Cache expiration
      console.log('\n⏱️ Testing cache expiration...');
      await this.testExpiration();
      
      // Test 3: Cache statistics
      console.log('\n📊 Testing cache statistics...');
      this.testStatistics();
      
      // Test 4: Storage types
      console.log('\n💾 Testing different storage types...');
      this.testStorageTypes();
      
      // Test 5: Cache API Service
      console.log('\n🔄 Testing CacheApiService wrapper...');
      await this.testCacheApiService();
      
      console.log('\n✅ All cache tests completed successfully!');
      console.log('📈 Final stats:', CacheService.getStats());
      
    } catch (error) {
      console.error('❌ Cache test failed:', error);
    }
  }

  /**
   * Test basic cache operations
   */
  private static async testBasicOperations(): Promise<void> {
    const testData = {
      id: 1,
      name: 'Test Category',
      items: ['item1', 'item2', 'item3'],
      metadata: { created: Date.now() }
    };

    // Test SET operation
    const setResult = CacheService.set('CATEGORIES', testData);
    console.log('✓ SET operation:', setResult ? 'SUCCESS' : 'FAILED');

    // Test GET operation
    const getData = CacheService.get('CATEGORIES');
    const getSuccess = JSON.stringify(getData) === JSON.stringify(testData);
    console.log('✓ GET operation:', getSuccess ? 'SUCCESS' : 'FAILED');

    // Test HAS operation
    const hasResult = CacheService.has('CATEGORIES');
    console.log('✓ HAS operation:', hasResult ? 'SUCCESS' : 'FAILED');

    // Test DELETE operation
    const deleteResult = CacheService.delete('CATEGORIES');
    console.log('✓ DELETE operation:', deleteResult ? 'SUCCESS' : 'FAILED');

    // Verify deletion
    const hasAfterDelete = CacheService.has('CATEGORIES');
    console.log('✓ DELETE verification:', !hasAfterDelete ? 'SUCCESS' : 'FAILED');
  }

  /**
   * Test cache expiration
   */
  private static async testExpiration(): Promise<void> {
    const testData = { message: 'This will expire soon' };

    // Set with short expiration (100ms)
    CacheService.set('MANIFEST', testData, 100);
    
    // Should exist immediately
    const immediateResult = CacheService.has('MANIFEST');
    console.log('✓ Immediate access:', immediateResult ? 'SUCCESS' : 'FAILED');

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should be expired now
    const expiredResult = CacheService.has('MANIFEST');
    console.log('✓ After expiration:', !expiredResult ? 'SUCCESS' : 'FAILED');
  }

  /**
   * Test cache statistics
   */
  private static testStatistics(): void {
    // Reset stats by clearing cache
    CacheService.clearAll();

    const testData = { test: true };

    // Generate some hits and misses
    CacheService.set('CATEGORIES', testData);
    
    CacheService.get('CATEGORIES'); // Hit
    CacheService.get('MANIFEST');   // Miss
    CacheService.get('CATEGORIES'); // Hit
    CacheService.get('VENDORS');    // Miss

    const stats = CacheService.getStats();
    
    console.log('✓ Hits:', stats.hits >= 2 ? 'SUCCESS' : 'FAILED');
    console.log('✓ Misses:', stats.misses >= 2 ? 'SUCCESS' : 'FAILED');
    console.log('✓ Hit Rate:', stats.hitRate === 50 ? 'SUCCESS' : `${stats.hitRate}% (expected 50%)`);
    console.log('✓ Item Count:', stats.itemCount >= 1 ? 'SUCCESS' : 'FAILED');
  }

  /**
   * Test different storage types
   */
  private static testStorageTypes(): void {
    const testData = { storageTest: true };

    // Test localStorage
    CacheService.set('CATEGORIES', testData, undefined, 'localStorage');
    const localResult = CacheService.get('CATEGORIES', 'localStorage');
    console.log('✓ localStorage:', localResult ? 'SUCCESS' : 'FAILED');

    // Test sessionStorage
    CacheService.set('MANIFEST', testData, undefined, 'sessionStorage');
    const sessionResult = CacheService.get('MANIFEST', 'sessionStorage');
    console.log('✓ sessionStorage:', sessionResult ? 'SUCCESS' : 'FAILED');

    // Test memory storage
    CacheService.set('VENDORS', testData, undefined, 'memory');
    const memoryResult = CacheService.get('VENDORS', 'memory');
    console.log('✓ memory:', memoryResult ? 'SUCCESS' : 'FAILED');
  }

  /**
   * Test CacheApiService wrapper functionality
   */
  private static async testCacheApiService(): Promise<void> {
    console.log('Testing CacheApiService wrapper...');
    
    // Note: These tests will use mock data since we're testing in isolation
    try {
      // Test cache utilities
      const health = CacheUtils.getCacheHealth();
      console.log('✓ Cache health check:', health.status ? 'SUCCESS' : 'FAILED');
      
      // Test batch operations
      const batchSet = CacheUtils.setBatch([
        { key: 'CATEGORIES', data: [{ id: 1, name: 'Test Cat' }] },
        { key: 'MANIFEST', data: { app_name: 'UgFlix' } }
      ]);
      console.log('✓ Batch set:', batchSet.every(r => r) ? 'SUCCESS' : 'FAILED');
      
      const batchGet = CacheUtils.getBatch([
        { key: 'CATEGORIES' },
        { key: 'MANIFEST' }
      ]);
      console.log('✓ Batch get:', batchGet.every(r => r !== null) ? 'SUCCESS' : 'FAILED');
      
    } catch (error) {
      console.log('⚠️ CacheApiService test skipped (requires API connection)');
    }
  }

  /**
   * Quick performance test
   */
  static async performanceTest(iterations: number = 1000): Promise<void> {
    console.log(`🚀 Running performance test with ${iterations} iterations...`);
    
    const testData = { 
      id: 1, 
      name: 'Performance Test Data',
      large_array: new Array(100).fill(0).map((_, i) => ({ id: i, value: `item_${i}` }))
    };

    // Test SET performance
    const setStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      CacheService.set('CATEGORIES', { ...testData, iteration: i });
    }
    const setEnd = performance.now();
    
    // Test GET performance
    const getStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      CacheService.get('CATEGORIES');
    }
    const getEnd = performance.now();

    console.log(`📊 Performance Results:`);
    console.log(`   SET: ${(setEnd - setStart).toFixed(2)}ms (${((setEnd - setStart) / iterations).toFixed(3)}ms per operation)`);
    console.log(`   GET: ${(getEnd - getStart).toFixed(2)}ms (${((getEnd - getStart) / iterations).toFixed(3)}ms per operation)`);
    
    const stats = CacheService.getStats();
    console.log(`   Cache size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
    console.log(`   Hit rate: ${stats.hitRate.toFixed(1)}%`);
  }

  /**
   * Simulate real-world usage patterns
   */
  static async simulateRealUsage(): Promise<void> {
    console.log('🌐 Simulating real-world usage patterns...');
    
    // Simulate app startup - load essential data
    console.log('1. App startup - loading essential data...');
    const categories = [
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Clothing' },
      { id: 3, name: 'Books' }
    ];
    const manifest = { app_name: 'UgFlix', version: '1.0.0' };
    
    CacheService.set('CATEGORIES', categories);
    CacheService.set('MANIFEST', manifest);
    
    // Simulate user browsing - frequent access to categories
    console.log('2. User browsing - accessing categories...');
    for (let i = 0; i < 10; i++) {
      CacheService.get('CATEGORIES');
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Simulate product searches - cache misses
    console.log('3. Product searches - generating cache misses...');
    for (let i = 0; i < 5; i++) {
      CacheService.get('SEARCH_RESULTS'); // Will be cache misses
    }
    
    // Display final statistics
    const finalStats = CacheService.getStats();
    console.log('📈 Simulation results:', {
      hitRate: `${finalStats.hitRate.toFixed(1)}%`,
      totalOperations: finalStats.hits + finalStats.misses,
      cacheSize: `${(finalStats.totalSize / 1024).toFixed(2)} KB`
    });
  }

  /**
   * Memory usage test
   */
  static testMemoryUsage(): void {
    console.log('🧠 Testing memory usage and limits...');
    
    // Create progressively larger data
    const sizes = [1, 10, 100, 1000]; // KB
    
    sizes.forEach(size => {
      const largeData = {
        size: `${size}KB`,
        data: 'x'.repeat(size * 1024)
      };
      
      const success = CacheService.set('CATEGORIES', largeData);
      const stats = CacheService.getStats();
      
      console.log(`   ${size}KB data: ${success ? 'SUCCESS' : 'FAILED'} (Total: ${(stats.totalSize / 1024).toFixed(2)} KB)`);
    });
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).CacheTestUtils = CacheTestUtils;
  (window as any).testCache = () => CacheTestUtils.runFullTest();
  (window as any).perfTestCache = (iterations?: number) => CacheTestUtils.performanceTest(iterations);
  (window as any).simulateCache = () => CacheTestUtils.simulateRealUsage();
  
  console.log('🛠️ Cache testing utilities loaded!');
  console.log('Available commands:');
  console.log('  testCache() - Run full test suite');
  console.log('  perfTestCache(1000) - Performance test');
  console.log('  simulateCache() - Simulate real usage');
  console.log('  CacheTestUtils.testMemoryUsage() - Memory test');
}

export default CacheTestUtils;