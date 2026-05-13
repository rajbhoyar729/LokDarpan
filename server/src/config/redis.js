/**
 * Redis connection for BullMQ (separate connections recommended for Queue vs Worker).
 */
import Redis from 'ioredis';

export function createRedisConnection() {
  const url = process.env.REDIS_URL;
  if (url) {
    return new Redis(url, { maxRetriesPerRequest: null });
  }
  return new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
  });
}
