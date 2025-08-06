'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResultCard } from '@/components/ResultCard';
import { RoutingResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StoredResult {
  result: RoutingResult;
  summary: {
    promptType: string;
    confidence: number;
    selectedModel: string;
    estimatedCost: string;
    estimatedLatency: string;
    quality: string;
  };
  prompt: string;
}

export default function ResultsPage() {
  const [result, setResult] = useState<StoredResult | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedResult = sessionStorage.getItem('routingResult');
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult);
        setResult(parsedResult);
      } catch (error) {
        console.error('Failed to parse stored result:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center">
        <div className="text-white">Loading results...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>No Results Found</CardTitle>
              <CardDescription>
                No routing results found. Please go back and submit a prompt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/')} className="w-full">
                Go Back to Router
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Routing Results</h1>
            <p className="text-zinc-400 mt-2">
              Model selection and analysis for your prompt
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="text-white border-white/[0.1] hover:bg-white/[0.1]"
            >
              New Prompt
            </Button>
            <Button
              onClick={() => router.push('/test')}
              className="bg-white/[0.1] text-white hover:bg-white/[0.15]"
            >
              Run Tests
            </Button>
          </div>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8 bg-white/[0.05] border-white/[0.1]">
          <CardHeader>
            <CardTitle className="text-white">Quick Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-400">Prompt Type</p>
                <p className="text-lg font-semibold text-white">{result.summary.promptType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Confidence</p>
                <p className="text-lg font-semibold text-white">{result.summary.confidence}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Selected Model</p>
                <p className="text-lg font-semibold text-white">{result.summary.selectedModel}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Estimated Cost</p>
                <p className="text-lg font-semibold text-white">{result.summary.estimatedCost}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Latency</p>
                <p className="text-lg font-semibold text-white">{result.summary.estimatedLatency}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg p-6">
          <ResultCard result={result.result} prompt={result.prompt} />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            onClick={() => {
              sessionStorage.removeItem('routingResult');
              router.push('/');
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Start Over
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Copy results to clipboard
              const resultText = `Prompt: ${result.prompt}\nSelected Model: ${result.summary.selectedModel}\nCost: ${result.summary.estimatedCost}\nLatency: ${result.summary.estimatedLatency}`;
              navigator.clipboard.writeText(resultText);
              alert('Results copied to clipboard!');
            }}
          >
            Copy Results
          </Button>
        </div>
      </div>
    </div>
  );
} 