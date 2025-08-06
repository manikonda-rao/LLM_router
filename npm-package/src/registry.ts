import { Model } from './types';

export const modelRegistry: Model[] = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    costPer1kTokens: {
      input: 0.005,
      output: 0.015
    },
    maxContextLength: 128000,
    averageLatency: 2000,
    quality: 0.95,
    supportedPromptTypes: ['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
    supportsTools: true,
    supportsFunctionCalling: true,
    description: 'Most capable GPT-4 model, optimized for speed and cost'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    costPer1kTokens: {
      input: 0.00015,
      output: 0.0006
    },
    maxContextLength: 128000,
    averageLatency: 1500,
    quality: 0.85,
    supportedPromptTypes: ['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
    supportsTools: true,
    supportsFunctionCalling: true,
    description: 'Fast and efficient GPT-4 model with lower cost'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    costPer1kTokens: {
      input: 0.0005,
      output: 0.0015
    },
    maxContextLength: 16385,
    averageLatency: 800,
    quality: 0.75,
    supportedPromptTypes: ['summarization', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
    supportsTools: true,
    supportsFunctionCalling: true,
    description: 'Fast and cost-effective for most tasks'
  },

  // Anthropic Models
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    costPer1kTokens: {
      input: 0.003,
      output: 0.015
    },
    maxContextLength: 200000,
    averageLatency: 2500,
    quality: 0.92,
    supportedPromptTypes: ['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
    supportsTools: true,
    supportsFunctionCalling: true,
    description: 'Most capable Claude model with excellent reasoning'
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    costPer1kTokens: {
      input: 0.00025,
      output: 0.00125
    },
    maxContextLength: 200000,
    averageLatency: 1200,
    quality: 0.80,
    supportedPromptTypes: ['summarization', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
    supportsTools: true,
    supportsFunctionCalling: true,
    description: 'Fast and efficient Claude model'
  },

  // Google Models
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    costPer1kTokens: {
      input: 0.00375,
      output: 0.0105
    },
    maxContextLength: 1000000,
    averageLatency: 3000,
    quality: 0.88,
    supportedPromptTypes: ['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
    supportsTools: true,
    supportsFunctionCalling: true,
    description: 'Google\'s most capable model with massive context window'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    costPer1kTokens: {
      input: 0.000075,
      output: 0.0003
    },
    maxContextLength: 1000000,
    averageLatency: 1500,
    quality: 0.82,
    supportedPromptTypes: ['summarization', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
    supportsTools: true,
    supportsFunctionCalling: true,
    description: 'Fast and cost-effective Gemini model'
  }
];

export function getModelById(id: string): Model | undefined {
  return modelRegistry.find(model => model.id === id);
}

export function getModelsByProvider(provider: string): Model[] {
  return modelRegistry.filter(model => model.provider === provider);
}

export function getModelsByPromptType(promptType: string): Model[] {
  return modelRegistry.filter(model => 
    model.supportedPromptTypes.includes(promptType as any)
  );
} 