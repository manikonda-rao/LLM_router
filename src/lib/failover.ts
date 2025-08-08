import { Logger } from '@/utils/logger';
import { ModelConfig } from '@/config/registry';
import { ProviderFactory, ProviderType, ProviderConfig } from '@/lib/providers';
import { ProviderRequest, ProviderResponse } from '@/lib/providers/base';

const logger = new Logger('Failover');

export interface FailoverMetrics {
  modelId: string;
  provider: string;
  successCount: number;
  failureCount: number;
  averageLatency: number;
  lastFailure?: Date;
  lastSuccess?: Date;
  failoverCount: number;
}

export interface FailoverResult {
  success: boolean;
  response?: ProviderResponse;
  modelId: string;
  provider: string;
  attempts: number;
  totalLatency: number;
  errors: string[];
  metrics: FailoverMetrics;
}

class FailoverManager {
  private metrics: Map<string, FailoverMetrics> = new Map();
  private config: {
    maxRetries: number;
    retryDelay: number;
    enabled: boolean;
  };

  constructor(config: { maxRetries?: number; retryDelay?: number; enabled?: boolean } = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      enabled: true,
      ...config,
    };
  }

  async executeWithFailover(
    modelId: string,
    request: ProviderRequest,
    providerConfigs: Map<ProviderType, ProviderConfig>
  ): Promise<FailoverResult> {
    if (!this.config.enabled) {
      return this.executeSingleAttempt(modelId, request, providerConfigs);
    }

    const model = this.getModelConfig(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const failoverModels = this.getFailoverModels(modelId);
    const allModels = [model, ...failoverModels];
    const errors: string[] = [];
    let totalLatency = 0;
    let attempts = 0;

    for (const attemptModel of allModels) {
      attempts++;
      const startTime = Date.now();

      try {
        logger.info(`Attempting request with model ${attemptModel.id} (attempt ${attempts})`);
        
        const provider = this.getProvider(attemptModel.provider as ProviderType, providerConfigs);
        if (!provider) {
          const error = `Provider ${attemptModel.provider} not configured`;
          errors.push(error);
          logger.warn(error);
          continue;
        }

        const response = await provider.generate(request);
        const latency = Date.now() - startTime;
        totalLatency += latency;

        // Update metrics
        this.updateMetrics(attemptModel.id, true, latency);

        logger.info(`Request successful with model ${attemptModel.id}`, {
          latency,
          attempts,
        });

        return {
          success: true,
          response,
          modelId: attemptModel.id,
          provider: attemptModel.provider,
          attempts,
          totalLatency,
          errors,
          metrics: this.getMetrics(attemptModel.id),
        };
      } catch (error) {
        const latency = Date.now() - startTime;
        totalLatency += latency;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(errorMessage);

        // Update metrics
        this.updateMetrics(attemptModel.id, false, latency);

        logger.warn(`Request failed with model ${attemptModel.id}`, {
          error: errorMessage,
          latency,
          attempt: attempts,
        });

        // If this is the last attempt, don't wait
        if (attempts < allModels.length) {
          await this.delay(this.config.retryDelay * attempts);
        }
      }
    }

    // All attempts failed
    logger.error('All failover attempts failed', {
      modelId,
      attempts,
      errors,
    });

    return {
      success: false,
      modelId,
      provider: model.provider,
      attempts,
      totalLatency,
      errors,
      metrics: this.getMetrics(modelId),
    };
  }

  private async executeSingleAttempt(
    modelId: string,
    request: ProviderRequest,
    providerConfigs: Map<ProviderType, ProviderConfig>
  ): Promise<FailoverResult> {
    const model = this.getModelConfig(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const provider = this.getProvider(model.provider as ProviderType, providerConfigs);
    if (!provider) {
      throw new Error(`Provider ${model.provider} not configured`);
    }

    const startTime = Date.now();
    try {
      const response = await provider.generate(request);
      const latency = Date.now() - startTime;
      this.updateMetrics(modelId, true, latency);

      return {
        success: true,
        response,
        modelId,
        provider: model.provider,
        attempts: 1,
        totalLatency: latency,
        errors: [],
        metrics: this.getMetrics(modelId),
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateMetrics(modelId, false, latency);

      return {
        success: false,
        modelId,
        provider: model.provider,
        attempts: 1,
        totalLatency: latency,
        errors: [errorMessage],
        metrics: this.getMetrics(modelId),
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getModelConfig(_modelId: string): ModelConfig | undefined {
    // TODO: Import from registry
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getFailoverModels(_modelId: string): ModelConfig[] {
    // TODO: Import from registry
    return [];
  }

  private getProvider(
    providerType: ProviderType,
    providerConfigs: Map<ProviderType, ProviderConfig>
  ) {
    const config = providerConfigs.get(providerType);
    if (!config) return null;

    return ProviderFactory.createProvider(providerType, config);
  }

  private updateMetrics(modelId: string, success: boolean, latency: number) {
    const metrics = this.metrics.get(modelId) || {
      modelId,
      provider: '',
      successCount: 0,
      failureCount: 0,
      averageLatency: 0,
      failoverCount: 0,
    };

    if (success) {
      metrics.successCount++;
      metrics.lastSuccess = new Date();
      metrics.averageLatency = this.calculateAverageLatency(
        metrics.averageLatency,
        latency,
        metrics.successCount + metrics.failureCount
      );
    } else {
      metrics.failureCount++;
      metrics.lastFailure = new Date();
      metrics.failoverCount++;
    }

    this.metrics.set(modelId, metrics);
  }

  private calculateAverageLatency(currentAvg: number, newLatency: number, totalCount: number): number {
    return (currentAvg * (totalCount - 1) + newLatency) / totalCount;
  }

  private getMetrics(modelId: string): FailoverMetrics {
    return this.metrics.get(modelId) || {
      modelId,
      provider: '',
      successCount: 0,
      failureCount: 0,
      averageLatency: 0,
      failoverCount: 0,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getMetricsForModel(modelId: string): FailoverMetrics | undefined {
    return this.metrics.get(modelId);
  }

  getAllMetrics(): FailoverMetrics[] {
    return Array.from(this.metrics.values());
  }

  resetMetrics(modelId?: string) {
    if (modelId) {
      this.metrics.delete(modelId);
    } else {
      this.metrics.clear();
    }
  }
}

export const failoverManager = new FailoverManager(); 