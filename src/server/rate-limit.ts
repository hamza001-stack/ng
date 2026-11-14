import 'server-only';
import { Redis } from 'ioredis';
import { log } from './logger';

const memory = new Map<string, { count: number; reset: number }>();

let redis: Redis | null | undefined;

function getRedis() {
  if (redis !== undefined) return redis;
  const url = process.env.REDIS_URL;
  if (!url) {
    redis = null;
    return redis;
  }
  redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
  redis.on('error', (error) => log('warn', 'redis_error', { detail: error.message }));
  return redis;
}

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const client = getRedis();
  if (client) {
    try {
      const redisKey = `rl:v2:${key}`;
      const count = await client.incr(redisKey);
      if (count === 1) await client.pexpire(redisKey, windowMs);
      return { ok: count <= limit, remaining: Math.max(0, limit - count) };
    } catch (error) {
      log('warn', 'rate_limit_redis_fallback', {
        detail: error instanceof Error ? error.message : 'unknown',
      });
    }
  }
  const current = memory.get(key);
  if (!current || current.reset < now) {
    memory.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  current.count += 1;
  return { ok: current.count <= limit, remaining: Math.max(0, limit - current.count) };
}

export function clientKey(request: Request, bucket: string) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  return `${bucket}:${ip}`;
}
