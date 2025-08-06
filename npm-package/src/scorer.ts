import { Model, ScoreResult, RoutingPreferences, PromptAnalysis } from './types';

export function scoreModel(
  model: Model,
  analysis: PromptAnalysis,
  preferences: RoutingPreferences
): ScoreResult {
  // Normalize values to 0-1 scale for scoring
  const normalizedCost = normalizeCost(model, analysis.estimatedTokens);
  const normalizedLatency = normalizeLatency(model.averageLatency);
  const normalizedQuality = model.quality; // Already 0-1
  
  // Apply user preferences
  const costScore = 1 - normalizedCost; // Lower cost = higher score
  const latencyScore = 1 - normalizedLatency; // Lower latency = higher score
  const qualityScore = normalizedQuality;
  
  // Calculate weighted score
  const totalWeight = preferences.costWeight + preferences.latencyWeight + preferences.qualityWeight;
  const normalizedWeights = {
    cost: preferences.costWeight / totalWeight,
    latency: preferences.latencyWeight / totalWeight,
    quality: preferences.qualityWeight / totalWeight
  };
  
  const finalScore = 
    costScore * normalizedWeights.cost +
    latencyScore * normalizedWeights.latency +
    qualityScore * normalizedWeights.quality;
  
  return {
    model,
    score: finalScore,
    breakdown: {
      cost: costScore,
      latency: latencyScore,
      quality: qualityScore
    }
  };
}

function normalizeCost(model: Model, estimatedTokens: number): number {
  // Estimate cost for input and output tokens
  const estimatedOutputTokens = Math.ceil(estimatedTokens * 0.5); // Rough estimate
  const totalCost = 
    (estimatedTokens * model.costPer1kTokens.input / 1000) +
    (estimatedOutputTokens * model.costPer1kTokens.output / 1000);
  
  // Normalize to 0-1 scale (assuming max cost of $1 for normalization)
  return Math.min(totalCost, 1);
}

function normalizeLatency(latencyMs: number): number {
  // Normalize latency to 0-1 scale (0 = instant, 1 = 10 seconds)
  const maxLatency = 10000; // 10 seconds
  return Math.min(latencyMs / maxLatency, 1);
}

export function filterModelsByConstraints(
  models: Model[],
  analysis: PromptAnalysis,
  preferences: RoutingPreferences
): Model[] {
  return models.filter(model => {
    // Check context length constraint
    if (analysis.estimatedTokens > model.maxContextLength) {
      return false;
    }
    
    // Check tool support constraint
    if (analysis.requiresTools && !model.supportsTools) {
      return false;
    }
    
    // Check function calling constraint
    if (analysis.requiresFunctionCalling && !model.supportsFunctionCalling) {
      return false;
    }
    
    // Check cost constraint
    if (preferences.maxCostPer1kTokens) {
      const maxCost = Math.max(model.costPer1kTokens.input, model.costPer1kTokens.output);
      if (maxCost > preferences.maxCostPer1kTokens) {
        return false;
      }
    }
    
    // Check latency constraint
    if (preferences.maxLatency && model.averageLatency > preferences.maxLatency) {
      return false;
    }
    
    // Check quality constraint
    if (preferences.minQuality && model.quality < preferences.minQuality) {
      return false;
    }
    
    // Check provider preference
    if (preferences.preferredProviders && preferences.preferredProviders.length > 0) {
      if (!preferences.preferredProviders.includes(model.provider)) {
        return false;
      }
    }
    
    return true;
  });
}

export function sortModelsByScore(models: Model[], analysis: PromptAnalysis, preferences: RoutingPreferences): ScoreResult[] {
  const scoredModels = models.map(model => scoreModel(model, analysis, preferences));
  
  return scoredModels.sort((a, b) => b.score - a.score);
}

export function getDefaultPreferences(): RoutingPreferences {
  return {
    costWeight: 0.3,
    latencyWeight: 0.3,
    qualityWeight: 0.4
  };
} 