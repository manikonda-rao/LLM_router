import { z } from 'zod';
import { Model, PromptType } from '@/types';

// Configuration schemas
export const ModelConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.enum(['openai', 'anthropic', 'openrouter', 'google', 'notdiamond']),
  costPer1kTokens: z.object({
    input: z.number().positive(),
    output: z.number().positive(),
  }),
  maxContextLength: z.number().positive(),
  averageLatency: z.number().positive(),
  quality: z.number().min(0).max(1),
  supportedPromptTypes: z.array(z.enum(['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'])),
  supportsTools: z.boolean(),
  supportsFunctionCalling: z.boolean(),
  description: z.string(),
  isActive: z.boolean().default(true),
  priority: z.number().min(0).max(10).default(5),
  failoverOrder: z.array(z.string()).optional(),
});

export const RegistryConfigSchema = z.object({
  models: z.array(ModelConfigSchema),
  defaultPreferences: z.object({
    costWeight: z.number().min(0).max(1).default(0.3),
    latencyWeight: z.number().min(0).max(1).default(0.3),
    qualityWeight: z.number().min(0).max(1).default(0.4),
  }),
  failover: z.object({
    enabled: z.boolean().default(true),
    maxRetries: z.number().min(1).max(5).default(3),
    retryDelay: z.number().min(100).max(5000).default(1000),
  }),
  rateLimiting: z.object({
    enabled: z.boolean().default(true),
    requestsPerMinute: z.number().min(1).default(60),
    burstLimit: z.number().min(1).default(10),
  }),
});

export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type RegistryConfig = z.infer<typeof RegistryConfigSchema>;

// Default configuration
export const defaultRegistryConfig: RegistryConfig = {
  models: [
    // OpenAI Models
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      costPer1kTokens: { input: 0.005, output: 0.015 },
      maxContextLength: 128000,
      averageLatency: 2000,
      quality: 0.95,
      supportedPromptTypes: ['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
      supportsTools: true,
      supportsFunctionCalling: true,
      description: 'Most capable GPT-4 model, optimized for speed and cost',
      isActive: true,
      priority: 9,
      failoverOrder: ['gpt-4o-mini', 'gpt-3.5-turbo'],
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      costPer1kTokens: { input: 0.00015, output: 0.0006 },
      maxContextLength: 128000,
      averageLatency: 1500,
      quality: 0.85,
      supportedPromptTypes: ['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
      supportsTools: true,
      supportsFunctionCalling: true,
      description: 'Fast and efficient GPT-4 model with lower cost',
      isActive: true,
      priority: 7,
      failoverOrder: ['gpt-3.5-turbo'],
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      costPer1kTokens: { input: 0.0005, output: 0.0015 },
      maxContextLength: 16385,
      averageLatency: 800,
      quality: 0.75,
      supportedPromptTypes: ['summarization', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
      supportsTools: true,
      supportsFunctionCalling: true,
      description: 'Fast and cost-effective for most tasks',
      isActive: true,
      priority: 5,
    },
    // Anthropic Models
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      costPer1kTokens: { input: 0.003, output: 0.015 },
      maxContextLength: 200000,
      averageLatency: 2500,
      quality: 0.92,
      supportedPromptTypes: ['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
      supportsTools: true,
      supportsFunctionCalling: true,
      description: 'Most capable Claude model with excellent reasoning',
      isActive: true,
      priority: 8,
      failoverOrder: ['claude-3-haiku', 'gpt-4o-mini'],
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      costPer1kTokens: { input: 0.00025, output: 0.00125 },
      maxContextLength: 200000,
      averageLatency: 1200,
      quality: 0.80,
      supportedPromptTypes: ['summarization', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
      supportsTools: true,
      supportsFunctionCalling: true,
      description: 'Fast and efficient Claude model',
      isActive: true,
      priority: 6,
      failoverOrder: ['gpt-3.5-turbo'],
    },
    // NotDiamond Models (Intelligent Routing)
    {
      id: 'notdiamond-gpt-4o',
      name: 'NotDiamond GPT-4o',
      provider: 'notdiamond',
      costPer1kTokens: { input: 0.005, output: 0.015 },
      maxContextLength: 128000,
      averageLatency: 1800,
      quality: 0.96,
      supportedPromptTypes: ['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
      supportsTools: true,
      supportsFunctionCalling: true,
      description: 'Intelligently routed GPT-4o with optimized performance',
      isActive: true,
      priority: 10,
      failoverOrder: ['notdiamond-gpt-4o-mini', 'notdiamond-claude-3-5-sonnet'],
    },
    {
      id: 'notdiamond-gpt-4o-mini',
      name: 'NotDiamond GPT-4o Mini',
      provider: 'notdiamond',
      costPer1kTokens: { input: 0.00015, output: 0.0006 },
      maxContextLength: 128000,
      averageLatency: 1200,
      quality: 0.88,
      supportedPromptTypes: ['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
      supportsTools: true,
      supportsFunctionCalling: true,
      description: 'Intelligently routed GPT-4o Mini with cost optimization',
      isActive: true,
      priority: 8,
      failoverOrder: ['notdiamond-claude-3-haiku'],
    },
    {
      id: 'notdiamond-claude-3-5-sonnet',
      name: 'NotDiamond Claude 3.5 Sonnet',
      provider: 'notdiamond',
      costPer1kTokens: { input: 0.003, output: 0.015 },
      maxContextLength: 200000,
      averageLatency: 2200,
      quality: 0.94,
      supportedPromptTypes: ['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
      supportsTools: true,
      supportsFunctionCalling: true,
      description: 'Intelligently routed Claude 3.5 Sonnet with enhanced reasoning',
      isActive: true,
      priority: 9,
      failoverOrder: ['notdiamond-claude-3-haiku', 'notdiamond-gpt-4o-mini'],
    },
    {
      id: 'notdiamond-claude-3-haiku',
      name: 'NotDiamond Claude 3 Haiku',
      provider: 'notdiamond',
      costPer1kTokens: { input: 0.00025, output: 0.00125 },
      maxContextLength: 200000,
      averageLatency: 1000,
      quality: 0.85,
      supportedPromptTypes: ['summarization', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
      supportsTools: true,
      supportsFunctionCalling: true,
      description: 'Intelligently routed Claude 3 Haiku with speed optimization',
      isActive: true,
      priority: 7,
      failoverOrder: ['notdiamond-gpt-4o-mini'],
    },
    {
      id: 'notdiamond-gemini-1.5-pro',
      name: 'NotDiamond Gemini 1.5 Pro',
      provider: 'notdiamond',
      costPer1kTokens: { input: 0.00375, output: 0.0105 },
      maxContextLength: 1000000,
      averageLatency: 2800,
      quality: 0.91,
      supportedPromptTypes: ['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
      supportsTools: true,
      supportsFunctionCalling: true,
      description: 'Intelligently routed Gemini 1.5 Pro with massive context',
      isActive: true,
      priority: 8,
      failoverOrder: ['notdiamond-claude-3-5-sonnet'],
    },
  ],
  defaultPreferences: {
    costWeight: 0.3,
    latencyWeight: 0.3,
    qualityWeight: 0.4,
  },
  failover: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 60,
    burstLimit: 10,
  },
};

// Registry class
export class ModelRegistry {
  private config: RegistryConfig;
  private models: Map<string, ModelConfig>;

  constructor(config?: Partial<RegistryConfig>) {
    this.config = { ...defaultRegistryConfig, ...config };
    this.models = new Map();
    this.initializeModels();
  }

  private initializeModels() {
    for (const modelConfig of this.config.models) {
      this.models.set(modelConfig.id, modelConfig);
    }
  }

  getModel(id: string): ModelConfig | undefined {
    return this.models.get(id);
  }

  getActiveModels(): ModelConfig[] {
    return Array.from(this.models.values()).filter(model => model.isActive);
  }

  getModelsByProvider(provider: string): ModelConfig[] {
    return this.getActiveModels().filter(model => model.provider === provider);
  }

  getModelsByPromptType(promptType: PromptType): ModelConfig[] {
    return this.getActiveModels().filter(model => 
      model.supportedPromptTypes.includes(promptType)
    );
  }

  getFailoverModels(modelId: string): ModelConfig[] {
    const model = this.getModel(modelId);
    if (!model?.failoverOrder) return [];

    return model.failoverOrder
      .map(id => this.getModel(id))
      .filter((model): model is ModelConfig => model !== undefined && model.isActive);
  }

  updateModel(id: string, updates: Partial<ModelConfig>): void {
    const model = this.getModel(id);
    if (model) {
      const updatedModel = { ...model, ...updates };
      this.models.set(id, updatedModel);
    }
  }

  addModel(modelConfig: ModelConfig): void {
    this.models.set(modelConfig.id, modelConfig);
  }

  removeModel(id: string): void {
    this.models.delete(id);
  }

  getConfig(): RegistryConfig {
    return this.config;
  }

  // Convert to legacy Model format for compatibility
  toLegacyModels(): Model[] {
    return this.getActiveModels().map(modelConfig => ({
      id: modelConfig.id,
      name: modelConfig.name,
      provider: modelConfig.provider,
      costPer1kTokens: modelConfig.costPer1kTokens,
      maxContextLength: modelConfig.maxContextLength,
      averageLatency: modelConfig.averageLatency,
      quality: modelConfig.quality,
      supportedPromptTypes: modelConfig.supportedPromptTypes,
      supportsTools: modelConfig.supportsTools,
      supportsFunctionCalling: modelConfig.supportsFunctionCalling,
      description: modelConfig.description,
    }));
  }
}

// Singleton instance
export const modelRegistry = new ModelRegistry(); 