'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PromptForm } from '@/components/PromptForm';
import { RoutingPreferences } from '@/types';
import { routePromptAction } from './actions/routePrompt';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Model {
  id: string;
  name: string;
  provider: string;
  costPer1kTokens: {
    input: number;
    output: number;
  };
  maxContextLength: number;
  averageLatency: number;
  quality: number;
  supportedPromptTypes: string[];
  supportsTools: boolean;
  supportsFunctionCalling: boolean;
  description: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch models
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setModels(data.data.models);
        }
      })
      .catch(err => console.error('Failed to fetch models:', err));
  }, []);

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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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

        {/* Main Content - Form */}
        <div className="flex justify-center mb-12">
          <PromptForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Models Display - Now in tabs */}
        <div className="mb-12">
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="models">Available Models</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            </TabsContent>
            
            <TabsContent value="models" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map((model) => (
                  <div key={model.id} className="bg-white/[0.05] border border-white/[0.1] rounded-lg p-6 hover:bg-white/[0.08] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                        {model.provider}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">{model.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Cost (1K tokens):</span>
                        <span className="text-white">${model.costPer1kTokens.input.toFixed(4)} / ${model.costPer1kTokens.output.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Latency:</span>
                        <span className="text-white">{model.averageLatency}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Quality:</span>
                        <span className="text-white">{(model.quality * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Context:</span>
                        <span className="text-white">{model.maxContextLength.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1">
                      {model.supportedPromptTypes.slice(0, 3).map((type) => (
                        <span key={type} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                          {type}
                        </span>
                      ))}
                      {model.supportedPromptTypes.length > 3 && (
                        <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                          +{model.supportedPromptTypes.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
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
