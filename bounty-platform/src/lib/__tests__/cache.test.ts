// Test file to verify Redis connection and cache operations
// This would typically be run with a testing framework

import { 
  cacheGet, 
  cacheSet, 
  cacheDel, 
  cacheExists, 
  CacheKeys, 
  CacheTTL,
  invalidateEntityCache 
} from '../cache';

// Simple test function to verify cache operations
export async function testCacheOperations() {
  console.log('Testing cache operations...');
  
  try {
    // Test basic set/get operations
    const testKey = 'test:cache:operation';
    const testValue = { message: 'Hello Redis!', timestamp: Date.now() };
    
    // Set value
    const setResult = await cacheSet(testKey, testValue, { ttl: CacheTTL.SHORT });
    console.log('Cache set result:', setResult);
    
    // Get value
    const getValue = await cacheGet(testKey);
    console.log('Cache get result:', getValue);
    
    // Check existence
    const exists = await cacheExists(testKey);
    console.log('Cache exists result:', exists);
    
    // Test with namespace
    const namespacedKey = 'namespaced-test';
    await cacheSet(namespacedKey, 'namespaced value', { 
      namespace: 'test',
      ttl: CacheTTL.MEDIUM 
    });
    
    const namespacedValue = await cacheGet(namespacedKey, { namespace: 'test' });
    console.log('Namespaced cache result:', namespacedValue);
    
    // Clean up
    await cacheDel(testKey);
    await cacheDel(namespacedKey, { namespace: 'test' });
    
    console.log('✅ Cache operations test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Cache operations test failed:', error);
    return false;
  }
}

// Test cache key generation
export function testCacheKeys() {
  console.log('Testing cache key generation...');
  
  const userId = 'user123';
  const bountyId = 'bounty456';
  
  console.log('User cache key:', CacheKeys.user(userId));
  console.log('User profile cache key:', CacheKeys.userProfile(userId));
  console.log('Bounty cache key:', CacheKeys.bounty(bountyId));
  console.log('Bounty applications cache key:', CacheKeys.bountyApplications(bountyId));
  console.log('Search cache key:', CacheKeys.search('javascript', 'web-dev'));
  
  console.log('✅ Cache keys test completed');
}