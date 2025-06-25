import { redisClient } from './redis';

export interface CacheOptions {
  /** Time to live in seconds */
  ttl?: number;
  /** Namespace for the cache key */
  namespace?: string;
}

export interface CacheSetOptions extends CacheOptions {
  /** Set only if key doesn't exist */
  nx?: boolean;
  /** Set only if key exists */
  xx?: boolean;
}

/**
 * Generate a namespaced cache key
 */
function generateKey(key: string, namespace?: string): string {
  const prefix = 'bounty-platform';
  if (namespace) {
    return `${prefix}:${namespace}:${key}`;
  }
  return `${prefix}:${key}`;
}

/**
 * Get a value from cache
 */
export async function cacheGet<T = any>(
  key: string,
  options: CacheOptions = {}
): Promise<T | null> {
  try {
    const cacheKey = generateKey(key, options.namespace);
    if (!redisClient) {
      console.warn('Redis client is not available.');
      return null;
    }
    const value = await redisClient.get(cacheKey);
    
    if (value === null) {
      return null;
    }
    
    // Try to parse JSON, fall back to raw value
    try {
      return typeof value === 'string' ? JSON.parse(value) : (value as T);
    } catch {
      return value as T;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set a value in cache
 */
export async function cacheSet<T = any>(
  key: string,
  value: T,
  options: CacheSetOptions = {}
): Promise<boolean> {
  try {
    const cacheKey = generateKey(key, options.namespace);
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (!redisClient) {
      console.warn('Redis client is not available.');
      return false;
    }
    let result;
    
    if (options.ttl && options.nx) {
      result = await redisClient.set(cacheKey, serializedValue, { ex: options.ttl, nx: true });
    } else if (options.ttl && options.xx) {
      result = await redisClient.set(cacheKey, serializedValue, { ex: options.ttl, xx: true });
    } else if (options.ttl) {
      result = await redisClient.set(cacheKey, serializedValue, { ex: options.ttl });
    } else if (options.nx) {
      result = await redisClient.set(cacheKey, serializedValue, { nx: true });
    } else if (options.xx) {
      result = await redisClient.set(cacheKey, serializedValue, { xx: true });
    } else {
      result = await redisClient.set(cacheKey, serializedValue);
    }
    return result === 'OK';
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

/**
 * Delete a value from cache
 */
export async function cacheDel(
  key: string,
  options: CacheOptions = {}
): Promise<boolean> {
  try {
    const cacheKey = generateKey(key, options.namespace);
    if (!redisClient) {
      console.warn('Redis client is not available.');
      return false;
    }
    const result = await redisClient.del(cacheKey);
    return result > 0;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

/**
 * Check if a key exists in cache
 */
export async function cacheExists(
  key: string,
  options: CacheOptions = {}
): Promise<boolean> {
  try {
    const cacheKey = generateKey(key, options.namespace);
    if (!redisClient) {
      console.warn('Redis client is not available.');
      return false;
    }
    const result = await redisClient.exists(cacheKey);
    return result > 0;
  } catch (error) {
    console.error('Cache exists error:', error);
    return false;
  }
}

/**
 * Set expiration time for a key
 */
export async function cacheExpire(
  key: string,
  ttl: number,
  options: CacheOptions = {}
): Promise<boolean> {
  try {
    const cacheKey = generateKey(key, options.namespace);
    if (!redisClient) {
      console.warn('Redis client is not available.');
      return false;
    }
    const result = await redisClient.expire(cacheKey, ttl);
    return result === 1;
  } catch (error) {
    console.error('Cache expire error:', error);
    return false;
  }
}

/**
 * Get remaining TTL for a key
 */
export async function cacheTTL(
  key: string,
  options: CacheOptions = {}
): Promise<number> {
  try {
    const cacheKey = generateKey(key, options.namespace);
    if (!redisClient) {
      console.warn('Redis client is not available.');
      return -1;
    }
    return await redisClient.ttl(cacheKey);
  } catch (error) {
    console.error('Cache TTL error:', error);
    return -1;
  }
}

/**
 * Delete multiple keys by pattern
 */
export async function cacheDelPattern(
  pattern: string,
  options: CacheOptions = {}
): Promise<number> {
  try {
    const cachePattern = generateKey(pattern, options.namespace);
    if (!redisClient) {
      console.warn('Redis client is not available.');
      return 0;
    }
    const keys = await redisClient.keys(cachePattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    return await redisClient.del(...keys);
  } catch (error) {
    console.error('Cache delete pattern error:', error);
    return 0;
  }
}

/**
 * Increment a numeric value in cache
 */
export async function cacheIncr(
  key: string,
  options: CacheOptions = {}
): Promise<number> {
  try {
    const cacheKey = generateKey(key, options.namespace);
    if (!redisClient) {
      console.warn('Redis client is not available.');
      return 0;
    }
    return await redisClient.incr(cacheKey);
  } catch (error) {
    console.error('Cache increment error:', error);
    return 0;
  }
}

/**
 * Decrement a numeric value in cache
 */
export async function cacheDecr(
  key: string,
  options: CacheOptions = {}
): Promise<number> {
  try {
    const cacheKey = generateKey(key, options.namespace);
    if (!redisClient) {
      console.warn('Redis client is not available.');
      return 0;
    }
    return await redisClient.decr(cacheKey);
  } catch (error) {
    console.error('Cache decrement error:', error);
    return 0;
  }
}

// Cache invalidation utilities
export const CacheKeys = {
  // User-related cache keys
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:profile:${id}`,
  userReputation: (id: string) => `user:reputation:${id}`,
  
  // Bounty-related cache keys
  bounty: (id: string) => `bounty:${id}`,
  bountyList: (filters: string = 'default') => `bounties:list:${filters}`,
  bountyApplications: (bountyId: string) => `bounty:applications:${bountyId}`,
  bountySubmissions: (bountyId: string) => `bounty:submissions:${bountyId}`,
  
  // Application-related cache keys
  application: (id: string) => `application:${id}`,
  userApplications: (userId: string) => `user:applications:${userId}`,
  
  // Payment-related cache keys
  payment: (id: string) => `payment:${id}`,
  userPayments: (userId: string) => `user:payments:${userId}`,
  
  // Review-related cache keys
  review: (id: string) => `review:${id}`,
  bountyReviews: (bountyId: string) => `bounty:reviews:${bountyId}`,
  userReviews: (userId: string) => `user:reviews:${userId}`,
  
  // Search and analytics
  search: (query: string, filters: string = '') => `search:${query}:${filters}`,
  stats: (type: string) => `stats:${type}`,
} as const;

export const CacheTTL = {
  // Short-lived cache (5 minutes)
  SHORT: 300,
  // Medium-lived cache (1 hour)
  MEDIUM: 3600,
  // Long-lived cache (24 hours)
  LONG: 86400,
  // Very long-lived cache (7 days)
  WEEK: 604800,
} as const;

/**
 * Invalidate cache entries related to a specific entity
 */
export async function invalidateEntityCache(
  entityType: 'user' | 'bounty' | 'application' | 'payment' | 'review',
  entityId: string
): Promise<void> {
  try {
    const patterns: string[] = [];
    
    switch (entityType) {
      case 'user':
        patterns.push(
          CacheKeys.user(entityId),
          CacheKeys.userProfile(entityId),
          CacheKeys.userReputation(entityId),
          CacheKeys.userApplications(entityId),
          CacheKeys.userPayments(entityId),
          CacheKeys.userReviews(entityId)
        );
        break;
        
      case 'bounty':
        patterns.push(
          CacheKeys.bounty(entityId),
          CacheKeys.bountyApplications(entityId),
          CacheKeys.bountySubmissions(entityId),
          CacheKeys.bountyReviews(entityId),
          `${CacheKeys.bountyList('*')}`
        );
        break;
        
      case 'application':
        patterns.push(CacheKeys.application(entityId));
        break;
        
      case 'payment':
        patterns.push(CacheKeys.payment(entityId));
        break;
        
      case 'review':
        patterns.push(CacheKeys.review(entityId));
        break;
    }
    
    // Delete all matching patterns
    await Promise.all(
      patterns.map(pattern => cacheDelPattern(pattern))
    );
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Warm up cache with commonly accessed data
 */
export async function warmupCache(): Promise<void> {
  try {
    // This function can be called on app startup or periodically
    // to pre-populate cache with frequently accessed data
    console.log('Cache warmup initiated');
    
    // Add warmup logic here as needed
    // For example: cache popular bounties, featured users, etc.
    
  } catch (error) {
    console.error('Cache warmup error:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalKeys: number;
  memoryUsage: string;
  hitRate?: number;
}> {
  try {
    if (!redisClient) {
      console.warn('Redis client is not available.');
      return {
        totalKeys: 0,
        memoryUsage: 'Error',
      };
    }
    const keys = await redisClient.dbsize();
    
    return {
      totalKeys: keys,
      memoryUsage: 'N/A', // Upstash doesn't expose memory info via REST API
      hitRate: undefined, // Would need to track this separately
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return {
      totalKeys: 0,
      memoryUsage: 'Error',
    };
  }
}