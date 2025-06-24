// Simple script to test Redis connection
// Run with: node scripts/test-redis.js

require('dotenv').config();
const { Redis } = require('@upstash/redis');

async function testRedisConnection() {
  console.log('Testing Upstash Redis connection...');
  
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    // Test basic operations
    console.log('1. Testing SET operation...');
    await redis.set('test:connection', 'Hello from bounty platform!');
    console.log('✅ SET operation successful');
    
    console.log('2. Testing GET operation...');
    const value = await redis.get('test:connection');
    console.log('✅ GET operation successful, value:', value);
    
    console.log('3. Testing TTL operation...');
    await redis.set('test:ttl', 'temporary value', { ex: 60 });
    const ttl = await redis.ttl('test:ttl');
    console.log('✅ TTL operation successful, TTL:', ttl, 'seconds');
    
    console.log('4. Testing DELETE operation...');
    await redis.del('test:connection', 'test:ttl');
    console.log('✅ DELETE operation successful');
    
    console.log('🎉 All Redis operations completed successfully!');
    console.log('Redis is ready for use in the bounty platform.');
    
  } catch (error) {
    console.error('❌ Redis connection test failed:');
    console.error('Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. UPSTASH_REDIS_REST_URL is correctly set in .env');
    console.error('2. UPSTASH_REDIS_REST_TOKEN is correctly set in .env');
    console.error('3. Your Upstash Redis instance is active');
    
    process.exit(1);
  }
}

testRedisConnection();