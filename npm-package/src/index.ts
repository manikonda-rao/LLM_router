// Core types
export type {
  PromptType,
  Model,
  ScoreResult,
  RoutingPreferences,
  PromptAnalysis,
  RoutingResult
} from './types';

// Core functions
export {
  classifyPrompt,
  getPromptTypeDisplayName
} from './classify';

export {
  scoreModel,
  filterModelsByConstraints,
  sortModelsByScore,
  getDefaultPreferences
} from './scorer';

export {
  routePrompt,
  routePromptWithFallback,
  getRoutingSummary
} from './router';

// Model registry
export {
  modelRegistry,
  getModelById,
  getModelsByProvider,
  getModelsByPromptType
} from './registry';

// Default export for convenience
import { routePrompt } from './router';
export default routePrompt; 