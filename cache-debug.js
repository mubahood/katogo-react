// Debug script to test cache functionality in browser console
// Copy and paste this into your browser console on localhost:5174/test

console.log('🔍 Cache Debug Script Started');

// 1. Check if CacheService is available
try {
  // Import the cache service (adjust path as needed)
  console.log('📦 Testing cache manually...');
  
  // Test data to cache
  const testData = [
    { id: 1, category: 'Test Category 1' },
    { id: 2, category: 'Test Category 2' }
  ];
  
  // Check localStorage before
  console.log('📋 LocalStorage keys before:', Object.keys(localStorage));
  
  // Manual cache test
  const testKey = 'BLITX_CACHE_TEST';
  const testItem = {
    data: testData,
    timestamp: Date.now(),
    expiration: Date.now() + (24 * 60 * 60 * 1000),
    version: '1.0.0',
    size: JSON.stringify(testData).length,
    accessCount: 0,
    lastAccessed: Date.now()
  };
  
  localStorage.setItem(testKey, JSON.stringify(testItem));
  console.log('✅ Test item stored');
  
  // Check localStorage after
  console.log('📋 LocalStorage keys after:', Object.keys(localStorage));
  console.log('📄 Stored item:', localStorage.getItem(testKey));
  
} catch (error) {
  console.error('❌ Cache test failed:', error);
}

// 2. Check current cache state
console.log('🗄️ Current localStorage content:', {...localStorage});

// 3. Check if constants are loaded
console.log('🔑 Expected cache keys should start with: BLITX_CACHE_');

console.log('🔍 Cache Debug Script Complete');