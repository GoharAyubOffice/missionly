import { Redis } from '@upstash/redis';
import { getServerConfig } from '@/config';

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!redis) {
    const config = getServerConfig();
    
    // Only create Redis client if credentials are available
    if (config.UPSTASH_REDIS_REST_URL && config.UPSTASH_REDIS_REST_TOKEN) {
      redis = new Redis({
        url: config.UPSTASH_REDIS_REST_URL,
        token: config.UPSTASH_REDIS_REST_TOKEN,
      });
    }
  }
  
  return redis;
}

export type RedisClient = Redis;

// Export a singleton instance for convenience (may be null in development)
export const redisClient = getRedisClient();