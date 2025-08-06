'use server';

import { classifyPrompt, getPromptTypeDisplayName } from '@/lib/classify';
import { PromptAnalysis } from '@/types';

export async function classifyPromptAction(prompt: string): Promise<{
  analysis: PromptAnalysis;
  displayName: string;
}> {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }
  
  const analysis = classifyPrompt(prompt);
  const displayName = getPromptTypeDisplayName(analysis.type);
  
  return {
    analysis,
    displayName
  };
} 