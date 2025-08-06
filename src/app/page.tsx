'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PromptForm } from '@/components/PromptForm';
import { RoutingPreferences } from '@/types';
import { routePromptAction } from './actions/routePrompt';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: { prompt: string } & RoutingPreferences) => {
    setIsLoading(true);
    
    try {
      const { prompt, ...preferences } = data;
      const result = await routePromptAction(prompt, preferences);
      
      // Store result in sessionStorage for the results page
      sessionStorage.setItem('routingResult', JSON.stringify({
        result: result.result,
        summary: result.summary,
        prompt: prompt
      }));
      
      // Redirect to results page
      router.push('/results');
    } catch (error) {
      console.error('Routing failed:', error);
      alert('Failed to route prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-8 text-center mb-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
              LLM Router
            </h1>
            <p className="text-xl text-zinc-400">
              Intelligent routing for optimal model selection based on cost, latency, and quality
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          <PromptForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-white/[0.1] p-6 bg-white/[0.05]">
            <h3 className="text-lg font-semibold text-white mb-2">Smart Classification</h3>
            <p className="text-zinc-400">
              Automatically classify prompts into categories like summarization, code generation, and more
            </p>
          </div>
          
          <div className="rounded-lg border border-white/[0.1] p-6 bg-white/[0.05]">
            <h3 className="text-lg font-semibold text-white mb-2">Cost Optimization</h3>
            <p className="text-zinc-400">
              Balance cost, latency, and quality based on your preferences and constraints
            </p>
          </div>
          
          <div className="rounded-lg border border-white/[0.1] p-6 bg-white/[0.05]">
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Provider</h3>
            <p className="text-zinc-400">
              Support for OpenAI, Anthropic, Google, and other leading LLM providers
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/test')}
              className="inline-flex items-center justify-center rounded-lg bg-white/[0.1] px-4 py-2 text-sm font-medium text-white hover:bg-white/[0.15] transition-colors"
            >
              Run Test Suite →
            </button>
            <button
              onClick={() => router.push('/results')}
              className="inline-flex items-center justify-center rounded-lg border border-white/[0.1] px-4 py-2 text-sm font-medium text-white hover:bg-white/[0.15] transition-colors"
            >
              View Recent Results →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
