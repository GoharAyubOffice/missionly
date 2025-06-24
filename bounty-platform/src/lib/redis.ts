import { Redis } from '@upstash/redis';
import { getServerConfig } from '@/config';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const config = getServerConfig();
    
    redis = new Redis({
      url: config.UPSTASH_REDIS_REST_URL,
      token: config.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  
  return redis;
}

export type RedisClient = Redis;

// Export a singleton instance for convenience
export const redisClient = getRedisClient();