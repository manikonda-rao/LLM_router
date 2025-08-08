import { Logger } from '@/utils/logger';

const logger = new Logger('Redis');

export interface RedisConfig {
  url: string;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (identifier: string) => string;
}

export interface CacheConfig {
  ttl: number;
  keyPrefix?: string;
}

class RedisManager {
  private client: unknown;
  private config: RedisConfig;
  private isConnected: boolean = false;

  constructor(config: RedisConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // TODO: Implement actual Redis connection
      // For now, we'll use a mock implementation
      this.isConnected = true;
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.error('Failed to connect to Redis', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      // TODO: Implement actual Redis disconnection
      this.isConnected = false;
      logger.info('Redis disconnected');
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, returning null');
      return null;
    }

    try {
      // TODO: Implement actual Redis GET
      logger.debug('Redis GET', { key });
      return null;
    } catch (error) {
      logger.error('Redis GET failed', { key, error });
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping SET');
      return;
    }

    try {
      // TODO: Implement actual Redis SET
      logger.debug('Redis SET', { key, ttl });
    } catch (error) {
      logger.error('Redis SET failed', { key, error });
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping DEL');
      return;
    }

    try {
      // TODO: Implement actual Redis DEL
      logger.debug('Redis DEL', { key });
    } catch (error) {
      logger.error('Redis DEL failed', { key, error });
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      // TODO: Implement actual Redis EXISTS
      logger.debug('Redis EXISTS', { key });
      return false;
    } catch (error) {
      logger.error('Redis EXISTS failed', { key, error });
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, returning 0');
      return 0;
    }

    try {
      // TODO: Implement actual Redis INCR
      logger.debug('Redis INCR', { key });
      return 1;
    } catch (error) {
      logger.error('Redis INCR failed', { key, error });
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping EXPIRE');
      return;
    }

    try {
      // TODO: Implement actual Redis EXPIRE
      logger.debug('Redis EXPIRE', { key, seconds });
    } catch (error) {
      logger.error('Redis EXPIRE failed', { key, seconds, error });
    }
  }
}

export class RateLimiter {
  private redis: RedisManager;
  private config: RateLimitConfig;

  constructor(redis: RedisManager, config: RateLimitConfig) {
    this.redis = redis;
    this.config = config;
  }

  async isRateLimited(identifier: string): Promise<{ limited: boolean; remaining: number; resetTime: number }> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`;

    const now = Date.now();

    try {
      // Get current count
      const currentCount = await this.redis.incr(key);
      
      if (currentCount === 1) {
        // First request in this window, set expiry
        await this.redis.expire(key, Math.ceil(this.config.windowMs / 1000));
      }

      const remaining = Math.max(0, this.config.maxRequests - currentCount);
      const resetTime = now + this.config.windowMs;

      return {
        limited: currentCount > this.config.maxRequests,
        remaining,
        resetTime,
      };
    } catch (error) {
      logger.error('Rate limiting check failed', { identifier, error });
      // On error, allow the request
      return {
        limited: false,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }
  }

  async reset(identifier: string): Promise<void> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`;

    await this.redis.del(key);
  }
}

export class CacheManager {
  private redis: RedisManager;
  private config: CacheConfig;

  constructor(redis: RedisManager, config: CacheConfig) {
    this.redis = redis;
    this.config = config;
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    const value = await this.redis.get(fullKey);
    
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Failed to parse cached value', { key, error });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const fullKey = this.getFullKey(key);
    const serializedValue = JSON.stringify(value);
    const finalTtl = ttl || this.config.ttl;

    await this.redis.set(fullKey, serializedValue, finalTtl);
  }

  async del(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    await this.redis.del(fullKey);
  }

  async exists(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    return await this.redis.exists(fullKey);
  }

  private getFullKey(key: string): string {
    const prefix = this.config.keyPrefix || 'cache';
    return `${prefix}:${key}`;
  }
}

// Singleton instances
let redisManager: RedisManager;
let rateLimiter: RateLimiter;
let cacheManager: CacheManager;

export function initializeRedis(config: RedisConfig): void {
  redisManager = new RedisManager(config);
}

export function initializeRateLimiter(config: RateLimitConfig): void {
  if (!redisManager) {
    throw new Error('Redis must be initialized before rate limiter');
  }
  rateLimiter = new RateLimiter(redisManager, config);
}

export function initializeCache(config: CacheConfig): void {
  if (!redisManager) {
    throw new Error('Redis must be initialized before cache');
  }
  cacheManager = new CacheManager(redisManager, config);
}

export function getRedisManager(): RedisManager {
  if (!redisManager) {
    throw new Error('Redis not initialized');
  }
  return redisManager;
}

export function getRateLimiter(): RateLimiter {
  if (!rateLimiter) {
    throw new Error('Rate limiter not initialized');
  }
  return rateLimiter;
}

export function getCacheManager(): CacheManager {
  if (!cacheManager) {
    throw new Error('Cache not initialized');
  }
  return cacheManager;
} 