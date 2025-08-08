import { z } from "zod";
import { Logger } from "@/utils/logger";

const logger = new Logger("Config:Env");

// Schema for environment variables
const envSchema = z.object({
  // Basic app config
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(val => parseInt(val, 10)).optional(),
  
  // Provider API Keys
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_BASE_URL: z.string().url().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_BASE_URL: z.string().url().optional(),
  NOTDIAMOND_API_KEY: z.string().optional(),
  NOTDIAMOND_BASE_URL: z.string().url().optional(),
  
  // Rate limiting
  RATE_LIMIT_REQUESTS_PER_MINUTE: z.string().transform(val => parseInt(val, 10)).default('60'),
  RATE_LIMIT_BURST_LIMIT: z.string().transform(val => parseInt(val, 10)).default('10'),
  
  // Cache
  CACHE_TTL_SECONDS: z.string().transform(val => parseInt(val, 10)).default('3600'),
  
  // Failover
  FAILOVER_ENABLED: z.string().transform(val => val === 'true').default('true'),
  FAILOVER_MAX_RETRIES: z.string().transform(val => parseInt(val, 10)).default('3'),
  FAILOVER_RETRY_DELAY: z.string().transform(val => parseInt(val, 10)).default('1000'),
  
  // Evaluation
  EVAL_JOB_ENABLED: z.string().transform(val => val === 'true').default('true'),
  EVAL_JOB_SCHEDULE: z.string().default('0 2 * * *'),
  EVAL_MIN_SAMPLES: z.string().transform(val => parseInt(val, 10)).default('10'),
  
  // Monitoring
  PROMETHEUS_ENABLED: z.string().transform(val => val === 'true').default('true'),
  GRAFANA_ENABLED: z.string().transform(val => val === 'true').default('true'),
  
  // Security
  JWT_SECRET: z.string().min(32),
  API_KEY_SECRET: z.string().min(32),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FORMAT: z.enum(['json', 'text']).default('json'),
});

// Function to validate environment variables
const validateEnv = () => {
  try {
    logger.info("Validating environment variables");
    
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      REDIS_DB: process.env.REDIS_DB,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
      NOTDIAMOND_API_KEY: process.env.NOTDIAMOND_API_KEY,
      NOTDIAMOND_BASE_URL: process.env.NOTDIAMOND_BASE_URL,
      RATE_LIMIT_REQUESTS_PER_MINUTE: process.env.RATE_LIMIT_REQUESTS_PER_MINUTE,
      RATE_LIMIT_BURST_LIMIT: process.env.RATE_LIMIT_BURST_LIMIT,
      CACHE_TTL_SECONDS: process.env.CACHE_TTL_SECONDS,
      FAILOVER_ENABLED: process.env.FAILOVER_ENABLED,
      FAILOVER_MAX_RETRIES: process.env.FAILOVER_MAX_RETRIES,
      FAILOVER_RETRY_DELAY: process.env.FAILOVER_RETRY_DELAY,
      EVAL_JOB_ENABLED: process.env.EVAL_JOB_ENABLED,
      EVAL_JOB_SCHEDULE: process.env.EVAL_JOB_SCHEDULE,
      EVAL_MIN_SAMPLES: process.env.EVAL_MIN_SAMPLES,
      PROMETHEUS_ENABLED: process.env.PROMETHEUS_ENABLED,
      GRAFANA_ENABLED: process.env.GRAFANA_ENABLED,
      JWT_SECRET: process.env.JWT_SECRET,
      API_KEY_SECRET: process.env.API_KEY_SECRET,
      LOG_LEVEL: process.env.LOG_LEVEL,
      LOG_FORMAT: process.env.LOG_FORMAT,
    };

    const parsed = envSchema.parse(env);
    logger.info("Environment variables validated successfully");
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join("."));
      logger.error("Invalid environment variables", { error: { missingVars } });
      throw new Error(
        `❌ Invalid environment variables: ${missingVars.join(
          ", "
        )}. Please check your .env file`
      );
    }
    throw error;
  }
};

export const env = validateEnv();

// Helper functions for environment-specific configs
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Provider configuration helpers
export const getProviderConfigs = () => {
  const configs: Record<string, { apiKey: string; baseUrl?: string }> = {};

  if (env.OPENAI_API_KEY) {
    configs.openai = {
      apiKey: env.OPENAI_API_KEY,
      baseUrl: env.OPENAI_BASE_URL,
    };
  }

  if (env.ANTHROPIC_API_KEY) {
    configs.anthropic = {
      apiKey: env.ANTHROPIC_API_KEY,
      baseUrl: env.ANTHROPIC_BASE_URL,
    };
  }

  if (env.OPENROUTER_API_KEY) {
    configs.openrouter = {
      apiKey: env.OPENROUTER_API_KEY,
      baseUrl: env.OPENROUTER_BASE_URL,
    };
  }

  if (env.NOTDIAMOND_API_KEY) {
    configs.notdiamond = {
      apiKey: env.NOTDIAMOND_API_KEY,
      baseUrl: env.NOTDIAMOND_BASE_URL,
    };
  }

  return configs;
};

// Redis configuration helper
export const getRedisConfig = () => {
  if (!env.REDIS_URL) {
    return null;
  }

  return {
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB || 0,
  };
};
