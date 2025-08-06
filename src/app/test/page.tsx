'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { routePromptAction } from '../actions/routePrompt';
import { getDefaultPreferences } from '@/lib/scorer';
import { RoutingResult } from '@/types';

interface TestPrompt {
  id: string;
  prompt: string;
  expectedType: string;
  description: string;
}

interface TestResult {
  prompt: TestPrompt;
  result: RoutingResult;
  success: boolean;
  error?: string;
}

const TEST_PROMPTS: TestPrompt[] = [
  {
    id: 'summarization-1',
    prompt: 'Summarize the following article about artificial intelligence and its impact on society.',
    expectedType: 'summarization',
    description: 'Basic summarization task'
  },
  {
    id: 'code-generation-1',
    prompt: 'Write a Python function to calculate the fibonacci sequence recursively.',
    expectedType: 'code_generation',
    description: 'Code generation task'
  },
  {
    id: 'translation-1',
    prompt: 'Translate this text to Spanish: "Hello, how are you today?"',
    expectedType: 'translation',
    description: 'Translation task'
  },
  {
    id: 'question-answering-1',
    prompt: 'What is the capital of France and what is its population?',
    expectedType: 'question_answering',
    description: 'Question answering task'
  },
  {
    id: 'creative-writing-1',
    prompt: 'Write a short story about a robot who discovers emotions for the first time.',
    expectedType: 'creative_writing',
    description: 'Creative writing task'
  },
  {
    id: 'analysis-1',
    prompt: 'Analyze the pros and cons of remote work versus office work.',
    expectedType: 'analysis',
    description: 'Analysis task'
  },
  {
    id: 'tools-1',
    prompt: 'Search for the current weather in New York City and provide a 5-day forecast.',
    expectedType: 'question_answering',
    description: 'Task requiring tools'
  },
  {
    id: 'function-calling-1',
    prompt: 'Send an email to john@example.com with the subject "Meeting Reminder" and body "Don\'t forget our meeting tomorrow at 2 PM."',
    expectedType: 'general',
    description: 'Task requiring function calling'
  }
];

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const runTestSuite = async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentTest(0);
    setProgress(0);

    const testResults: TestResult[] = [];
    const preferences = getDefaultPreferences();

    for (let i = 0; i < TEST_PROMPTS.length; i++) {
      setCurrentTest(i + 1);
      setProgress(((i + 1) / TEST_PROMPTS.length) * 100);

      const testPrompt = TEST_PROMPTS[i];
      
      try {
        const result = await routePromptAction(testPrompt.prompt, preferences);
        
        const success = result.result.analysis.type === testPrompt.expectedType;
        
        testResults.push({
          prompt: testPrompt,
          result: result.result,
          success
        });

        setResults([...testResults]);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        testResults.push({
          prompt: testPrompt,
          result: {} as RoutingResult,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        setResults([...testResults]);
      }
    }

    setIsRunning(false);
  };

  const getSuccessRate = () => {
    if (results.length === 0) return 0;
    const successful = results.filter(r => r.success).length;
    return Math.round((successful / results.length) * 100);
  };

  const getAverageScore = () => {
    if (results.length === 0) return 0;
    const scores = results.filter(r => r.success).map(r => r.result.score.score);
    if (scores.length === 0) return 0;
    return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Test Suite</h1>
            <p className="text-zinc-400 mt-2">
              Evaluate the LLM Router with various prompt types and scenarios
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="text-white border-white/[0.1] hover:bg-white/[0.1]"
            >
              Back to Router
            </Button>
            <Button
              onClick={runTestSuite}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRunning ? 'Running Tests...' : 'Run Test Suite'}
            </Button>
          </div>
        </div>

        {/* Progress */}
        {isRunning && (
          <Card className="mb-8 bg-white/[0.05] border-white/[0.1]">
            <CardHeader>
              <CardTitle className="text-white">Running Tests</CardTitle>
              <CardDescription className="text-zinc-400">
                Test {currentTest} of {TEST_PROMPTS.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        {results.length > 0 && !isRunning && (
          <Card className="mb-8 bg-white/[0.05] border-white/[0.1]">
            <CardHeader>
              <CardTitle className="text-white">Test Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{results.length}</p>
                  <p className="text-zinc-400">Total Tests</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{getSuccessRate()}%</p>
                  <p className="text-zinc-400">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{getAverageScore()}%</p>
                  <p className="text-zinc-400">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Individual Test Results</h2>
            {results.map((testResult, index) => (
              <Card key={testResult.prompt.id} className="bg-white/[0.05] border-white/[0.1]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">
                        Test {index + 1}: {testResult.prompt.description}
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Expected: {testResult.prompt.expectedType}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <Badge className="bg-green-600">PASS</Badge>
                      ) : (
                        <Badge variant="destructive">FAIL</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-400 mb-2">Prompt:</p>
                    <p className="text-white bg-zinc-800 p-3 rounded-md text-sm">
                      {testResult.prompt.prompt}
                    </p>
                  </div>
                  
                  {testResult.error ? (
                    <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-md">
                      <p className="text-red-400 text-sm">Error: {testResult.error}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-zinc-400">Detected Type</p>
                        <p className="text-white font-semibold">{testResult.result.analysis.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-400">Confidence</p>
                        <p className="text-white font-semibold">{Math.round(testResult.result.analysis.confidence * 100)}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-400">Selected Model</p>
                        <p className="text-white font-semibold">{testResult.result.selectedModel.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-400">Score</p>
                        <p className="text-white font-semibold">{Math.round(testResult.result.score.score * 100)}%</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Test Cases Preview */}
        {results.length === 0 && !isRunning && (
          <Card className="bg-white/[0.05] border-white/[0.1]">
            <CardHeader>
              <CardTitle className="text-white">Test Cases</CardTitle>
              <CardDescription className="text-zinc-400">
                The test suite includes {TEST_PROMPTS.length} different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {TEST_PROMPTS.map((testPrompt) => (
                  <div key={testPrompt.id} className="flex items-center justify-between p-3 border border-white/[0.1] rounded-md">
                    <div>
                      <p className="text-white font-medium">{testPrompt.description}</p>
                      <p className="text-zinc-400 text-sm">Expected: {testPrompt.expectedType}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {testPrompt.expectedType}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 