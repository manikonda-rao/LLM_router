'use server';

import { routePromptWithFallback, getRoutingSummary } from '@/lib/router';
import { RoutingPreferences, RoutingResult } from '@/types';

export async function routePromptAction(
  prompt: string,
  preferences: RoutingPreferences
): Promise<{
  result: RoutingResult;
  summary: ReturnType<typeof getRoutingSummary>;
}> {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }
  
  const result = await routePromptWithFallback(prompt, preferences);
  const summary = getRoutingSummary(result);
  
  return {
    result,
    summary
  };
} 