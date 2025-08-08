import { Logger } from '@/utils/logger';

const logger = new Logger('Prometheus');

export interface MetricValue {
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

export interface Metric {
  name: string;
  help: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  values: MetricValue[];
}

class PrometheusMetrics {
  private metrics: Map<string, Metric> = new Map();
  private registry: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultMetrics();
  }

  private initializeDefaultMetrics() {
    // Request metrics
    this.createMetric('llm_requests_total', 'Total number of LLM requests', 'counter');
    this.createMetric('llm_requests_duration_seconds', 'Request duration in seconds', 'histogram');
    this.createMetric('llm_requests_cost_total', 'Total cost of requests', 'counter');
    
    // Model metrics
    this.createMetric('llm_model_requests_total', 'Total requests per model', 'counter');
    this.createMetric('llm_model_latency_seconds', 'Model latency in seconds', 'histogram');
    this.createMetric('llm_model_success_rate', 'Model success rate', 'gauge');
    
    // Provider metrics
    this.createMetric('llm_provider_requests_total', 'Total requests per provider', 'counter');
    this.createMetric('llm_provider_errors_total', 'Total errors per provider', 'counter');
    
    // Failover metrics
    this.createMetric('llm_failover_events_total', 'Total failover events', 'counter');
    this.createMetric('llm_failover_duration_seconds', 'Failover duration in seconds', 'histogram');
    
    // Rate limiting metrics
    this.createMetric('llm_rate_limit_hits_total', 'Total rate limit hits', 'counter');
    this.createMetric('llm_rate_limit_remaining', 'Remaining rate limit quota', 'gauge');
    
    // Cache metrics
    this.createMetric('llm_cache_hits_total', 'Total cache hits', 'counter');
    this.createMetric('llm_cache_misses_total', 'Total cache misses', 'counter');
    this.createMetric('llm_cache_hit_ratio', 'Cache hit ratio', 'gauge');
  }

  private createMetric(name: string, help: string, type: Metric['type']): void {
    this.metrics.set(name, {
      name,
      help,
      type,
      values: [],
    });
  }

  increment(name: string, value: number = 1, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Metric ${name} not found`);
      return;
    }

    const existingValue = metric.values.find(v => 
      JSON.stringify(v.labels || {}) === JSON.stringify(labels || {})
    );

    if (existingValue) {
      existingValue.value += value;
      existingValue.timestamp = Date.now();
    } else {
      metric.values.push({
        value,
        timestamp: Date.now(),
        labels,
      });
    }
  }

  set(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Metric ${name} not found`);
      return;
    }

    const existingValue = metric.values.find(v => 
      JSON.stringify(v.labels || {}) === JSON.stringify(labels || {})
    );

    if (existingValue) {
      existingValue.value = value;
      existingValue.timestamp = Date.now();
    } else {
      metric.values.push({
        value,
        timestamp: Date.now(),
        labels,
      });
    }
  }

  observe(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Metric ${name} not found`);
      return;
    }

    metric.values.push({
      value,
      timestamp: Date.now(),
      labels,
    });
  }

  getMetric(name: string): Metric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  // Generate Prometheus format
  generatePrometheusFormat(): string {
    const lines: string[] = [];
    
    for (const metric of this.metrics.values()) {
      // Add help text
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} ${metric.type}`);
      
      // Add metric values
      for (const value of metric.values) {
        const labels = value.labels 
          ? `{${Object.entries(value.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`
          : '';
        
        lines.push(`${metric.name}${labels} ${value.value}`);
      }
      
      lines.push(''); // Empty line between metrics
    }
    
    return lines.join('\n');
  }

  // Reset metrics (useful for testing)
  reset(): void {
    for (const metric of this.metrics.values()) {
      metric.values = [];
    }
  }

  // Get metrics for specific time range
  getMetricsInRange(startTime: number, endTime: number): Metric[] {
    const filteredMetrics: Metric[] = [];
    
    for (const metric of this.metrics.values()) {
      const filteredValues = metric.values.filter(
        value => value.timestamp >= startTime && value.timestamp <= endTime
      );
      
      if (filteredValues.length > 0) {
        filteredMetrics.push({
          ...metric,
          values: filteredValues,
        });
      }
    }
    
    return filteredMetrics;
  }
}

// Singleton instance
export const prometheusMetrics = new PrometheusMetrics();

// Convenience functions
export function incrementMetric(name: string, value?: number, labels?: Record<string, string>): void {
  prometheusMetrics.increment(name, value, labels);
}

export function setMetric(name: string, value: number, labels?: Record<string, string>): void {
  prometheusMetrics.set(name, value, labels);
}

export function observeMetric(name: string, value: number, labels?: Record<string, string>): void {
  prometheusMetrics.observe(name, value, labels);
}

// Specific metric helpers
export function recordRequest(modelId: string, provider: string, duration: number, cost?: number): void {
  incrementMetric('llm_requests_total', 1, { model: modelId, provider });
  observeMetric('llm_requests_duration_seconds', duration / 1000, { model: modelId, provider });
  
  if (cost) {
    incrementMetric('llm_requests_cost_total', cost, { model: modelId, provider });
  }
  
  incrementMetric('llm_model_requests_total', 1, { model: modelId });
  incrementMetric('llm_provider_requests_total', 1, { provider });
}

export function recordError(modelId: string, provider: string, errorType: string): void {
  incrementMetric('llm_provider_errors_total', 1, { model: modelId, provider, error_type: errorType });
}

export function recordFailover(modelId: string, duration: number): void {
  incrementMetric('llm_failover_events_total', 1, { model: modelId });
  observeMetric('llm_failover_duration_seconds', duration / 1000, { model: modelId });
}

export function recordRateLimit(identifier: string, limited: boolean): void {
  if (limited) {
    incrementMetric('llm_rate_limit_hits_total', 1, { identifier });
  }
}

export function recordCacheHit(key: string): void {
  incrementMetric('llm_cache_hits_total', 1, { key });
}

export function recordCacheMiss(key: string): void {
  incrementMetric('llm_cache_misses_total', 1, { key });
} 