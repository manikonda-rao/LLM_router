export type PromptType = 
  | 'summarization'
  | 'code_generation'
  | 'translation'
  | 'question_answering'
  | 'creative_writing'
  | 'analysis'
  | 'general';

export interface Model {
  id: string;
  name: string;
  provider: string;
  costPer1kTokens: {
    input: number;
    output: number;
  };
  maxContextLength: number;
  averageLatency: number; // in milliseconds
  quality: number; // 0-1 scale
  supportedPromptTypes: PromptType[];
  supportsTools: boolean;
  supportsFunctionCalling: boolean;
  description: string;
}

export interface ScoreResult {
  model: Model;
  score: number;
  breakdown: {
    cost: number;
    latency: number;
    quality: number;
  };
}

export interface RoutingPreferences {
  costWeight: number; // 0-1
  latencyWeight: number; // 0-1
  qualityWeight: number; // 0-1
  maxCostPer1kTokens?: number;
  maxLatency?: number;
  minQuality?: number;
  preferredProviders?: string[];
}

export interface PromptAnalysis {
  type: PromptType;
  confidence: number;
  estimatedTokens: number;
  requiresTools: boolean;
  requiresFunctionCalling: boolean;
}

export interface RoutingResult {
  selectedModel: Model;
  score: ScoreResult;
  analysis: PromptAnalysis;
  alternatives: ScoreResult[];
} 