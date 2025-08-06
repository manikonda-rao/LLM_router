import { RoutingResult, RoutingPreferences, PromptAnalysis, Model } from './types';
import { modelRegistry, getModelsByPromptType } from './registry';
import { classifyPrompt } from './classify';
import { filterModelsByConstraints, sortModelsByScore, getDefaultPreferences } from './scorer';

export async function routePrompt(
  prompt: string,
  preferences: RoutingPreferences = getDefaultPreferences(),
  customModels?: Model[]
): Promise<RoutingResult> {
  // Step 1: Classify the prompt
  const analysis = classifyPrompt(prompt);
  
  // Step 2: Get models that support this prompt type
  const availableModels = customModels || modelRegistry;
  const supportedModels = getModelsByPromptType(analysis.type);
  
  // Step 3: Filter models by constraints
  const filteredModels = filterModelsByConstraints(supportedModels, analysis, preferences);
  
  if (filteredModels.length === 0) {
    // Fallback to all models if no models match constraints
    const allModels = filterModelsByConstraints(availableModels, analysis, preferences);
    if (allModels.length === 0) {
      throw new Error('No models available that meet the specified constraints');
    }
    
    // Use the best available model
    const scoredModels = sortModelsByScore(allModels, analysis, preferences);
    const selectedModel = scoredModels[0];
    
    return {
      selectedModel: selectedModel.model,
      score: selectedModel,
      analysis,
      alternatives: scoredModels.slice(1, 4) // Top 3 alternatives
    };
  }
  
  // Step 4: Score and sort models
  const scoredModels = sortModelsByScore(filteredModels, analysis, preferences);
  
  // Step 5: Return the best model and alternatives
  const selectedModel = scoredModels[0];
  const alternatives = scoredModels.slice(1, 4); // Top 3 alternatives
  
  return {
    selectedModel: selectedModel.model,
    score: selectedModel,
    analysis,
    alternatives
  };
}

export async function routePromptWithFallback(
  prompt: string,
  preferences: RoutingPreferences = getDefaultPreferences(),
  customModels?: Model[]
): Promise<RoutingResult> {
  try {
    return await routePrompt(prompt, preferences, customModels);
  } catch (error) {
    // Fallback to a default model if routing fails
    const availableModels = customModels || modelRegistry;
    const defaultModel = availableModels.find(m => m.id === 'gpt-3.5-turbo') || availableModels[0];
    const analysis = classifyPrompt(prompt);
    
    return {
      selectedModel: defaultModel,
      score: {
        model: defaultModel,
        score: 0.5,
        breakdown: {
          cost: 0.5,
          latency: 0.5,
          quality: 0.5
        }
      },
      analysis,
      alternatives: []
    };
  }
}

export function getRoutingSummary(result: RoutingResult): {
  promptType: string;
  confidence: number;
  selectedModel: string;
  estimatedCost: string;
  estimatedLatency: string;
  quality: string;
} {
  const { analysis, selectedModel, score } = result;
  
  // Calculate estimated cost
  const estimatedOutputTokens = Math.ceil(analysis.estimatedTokens * 0.5);
  const totalCost = 
    (analysis.estimatedTokens * selectedModel.costPer1kTokens.input / 1000) +
    (estimatedOutputTokens * selectedModel.costPer1kTokens.output / 1000);
  
  return {
    promptType: analysis.type,
    confidence: Math.round(analysis.confidence * 100),
    selectedModel: selectedModel.name,
    estimatedCost: `$${totalCost.toFixed(4)}`,
    estimatedLatency: `${selectedModel.averageLatency}ms`,
    quality: `${Math.round(selectedModel.quality * 100)}%`
  };
} 