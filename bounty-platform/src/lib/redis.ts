import { Redis } from '@upstash/redis';
import { serverConfig } from '@/config/server';

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!redis) {
    // Only create Redis client if credentials are available
    if (serverConfig.UPSTASH_REDIS_REST_URL && serverConfig.UPSTASH_REDIS_REST_TOKEN) {
      redis = new Redis({
        url: serverConfig.UPSTASH_REDIS_REST_URL,
        token: serverConfig.UPSTASH_REDIS_REST_TOKEN,
      });
    }
  }
  
  return redis;
}

export type RedisClient = Redis;

// Export a singleton instance for convenience (may be null in development)
export const redisClient = getRedisClient();