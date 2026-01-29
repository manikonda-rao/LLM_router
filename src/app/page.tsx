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

        {/* Main Content - Form (moved to top) */}
        <div className="flex justify-center mb-16">
          <div className="w-full max-w-2xl">
            <PromptForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
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

            <TabsContent value="overview" className="space-y-8">
              {/* Stats Overview */}
              <div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-white/[0.05] border border-white/[0.1] rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-400">{models.length}</div>
                    <div className="text-zinc-400 text-sm">Available Models</div>
                  </div>
                  <div className="bg-white/[0.05] border border-white/[0.1] rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-400">{new Set(models.map(m => m.provider)).size}</div>
                    <div className="text-zinc-400 text-sm">LLM Providers</div>
                  </div>
                  <div className="bg-white/[0.05] border border-white/[0.1] rounded-lg p-4">
                    <div className="text-3xl font-bold text-purple-400">7</div>
                    <div className="text-zinc-400 text-sm">Prompt Types</div>
                  </div>
                  <div className="bg-white/[0.05] border border-white/[0.1] rounded-lg p-4">
                    <div className="text-3xl font-bold text-orange-400">∞</div>
                    <div className="text-zinc-400 text-sm">Max Context</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="models" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Available Models</h2>
                <p className="text-zinc-400">Select the best model for your task based on cost, performance, and capabilities</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.1] rounded-lg p-6 hover:border-white/[0.2] hover:bg-gradient-to-br hover:from-white/[0.12] hover:to-white/[0.05] transition-all duration-300 shadow-lg"
                  >
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">{model.name}</h3>
                        <span className="text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full">
                          {model.provider}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400">{model.description}</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/[0.1]">
                      <div className="bg-white/[0.05] rounded p-3">
                        <div className="text-xs text-zinc-400 mb-1">Cost/1K tokens</div>
                        <div className="text-sm font-semibold text-white">
                          <span className="text-green-400">${model.costPer1kTokens.input.toFixed(5)}</span>
                          <span className="text-zinc-500"> / </span>
                          <span className="text-orange-400">${model.costPer1kTokens.output.toFixed(5)}</span>
                        </div>
                        <div className="text-xs text-zinc-500">in / out</div>
                      </div>

                      <div className="bg-white/[0.05] rounded p-3">
                        <div className="text-xs text-zinc-400 mb-1">Latency</div>
                        <div className="text-sm font-semibold text-white text-purple-400">{model.averageLatency}ms</div>
                      </div>

                      <div className="bg-white/[0.05] rounded p-3">
                        <div className="text-xs text-zinc-400 mb-1">Quality Score</div>
                        <div className="text-sm font-semibold text-white">
                          <span className="text-blue-400">{(model.quality * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="bg-white/[0.05] rounded p-3">
                        <div className="text-xs text-zinc-400 mb-1">Max Context</div>
                        <div className="text-sm font-semibold text-white text-cyan-400">
                          {(model.maxContextLength / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>

                    {/* Capabilities */}
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-zinc-300 mb-2">Capabilities</div>
                      <div className="flex gap-2">
                        {model.supportsTools && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                            🔧 Tools
                          </span>
                        )}
                        {model.supportsFunctionCalling && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            ⚙️ Functions
                          </span>
                        )}
                        {!model.supportsTools && !model.supportsFunctionCalling && (
                          <span className="text-xs text-zinc-500">No special features</span>
                        )}
                      </div>
                    </div>

                    {/* Supported Prompt Types */}
                    <div>
                      <div className="text-xs font-semibold text-zinc-300 mb-2">Prompt Types</div>
                      <div className="flex flex-wrap gap-1">
                        {model.supportedPromptTypes.slice(0, 4).map((type) => (
                          <span key={type} className="text-xs bg-zinc-700/50 text-zinc-300 px-2 py-1 rounded">
                            {type.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {model.supportedPromptTypes.length > 4 && (
                          <span className="text-xs bg-zinc-700/50 text-zinc-400 px-2 py-1 rounded font-semibold">
                            +{model.supportedPromptTypes.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {models.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-zinc-400 text-lg">Loading models...</div>
                </div>
              )}
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
