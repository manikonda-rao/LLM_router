'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RoutingResult } from '@/types';
import { getPromptTypeDisplayName } from '@/lib/classify';

interface ResultCardProps {
  result: RoutingResult;
  prompt: string;
}

export function ResultCard({ result, prompt }: ResultCardProps) {
  const { selectedModel, score, analysis, alternatives } = result;
  
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-green-800">Selected Model</CardTitle>
              <CardDescription className="text-green-700">
                {selectedModel.name} by {selectedModel.provider}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Score: {Math.round(score.score * 100)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Model Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Cost</p>
              <p className="text-lg font-semibold text-green-800">
                ${(selectedModel.costPer1kTokens.input + selectedModel.costPer1kTokens.output).toFixed(4)}/1K tokens
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Latency</p>
              <p className="text-lg font-semibold text-green-800">{selectedModel.averageLatency}ms</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Quality</p>
              <p className="text-lg font-semibold text-green-800">{Math.round(selectedModel.quality * 100)}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Context</p>
              <p className="text-lg font-semibold text-green-800">{selectedModel.maxContextLength.toLocaleString()}</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Score Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cost Score</span>
                <span className={`text-sm font-medium ${getScoreColor(score.breakdown.cost)}`}>
                  {Math.round(score.breakdown.cost * 100)}% ({getScoreLabel(score.breakdown.cost)})
                </span>
              </div>
              <Progress value={score.breakdown.cost * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Latency Score</span>
                <span className={`text-sm font-medium ${getScoreColor(score.breakdown.latency)}`}>
                  {Math.round(score.breakdown.latency * 100)}% ({getScoreLabel(score.breakdown.latency)})
                </span>
              </div>
              <Progress value={score.breakdown.latency * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quality Score</span>
                <span className={`text-sm font-medium ${getScoreColor(score.breakdown.quality)}`}>
                  {Math.round(score.breakdown.quality * 100)}% ({getScoreLabel(score.breakdown.quality)})
                </span>
              </div>
              <Progress value={score.breakdown.quality * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Original Prompt</p>
              <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{prompt}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Type</p>
                <Badge variant="outline">{getPromptTypeDisplayName(analysis.type)}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Confidence</p>
                <p className="text-lg font-semibold">{Math.round(analysis.confidence * 100)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Estimated Tokens</p>
                <p className="text-lg font-semibold">{analysis.estimatedTokens.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Requirements</p>
                <div className="space-y-1">
                  {analysis.requiresTools && <Badge variant="secondary" className="text-xs">Tools</Badge>}
                  {analysis.requiresFunctionCalling && <Badge variant="secondary" className="text-xs">Function Calling</Badge>}
                  {!analysis.requiresTools && !analysis.requiresFunctionCalling && (
                    <span className="text-sm text-gray-500">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alternative Models</CardTitle>
            <CardDescription>Other models that could handle this prompt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alternatives.map((alt, index) => (
                <div key={alt.model.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 2}</span>
                    <div>
                      <p className="font-medium">{alt.model.name}</p>
                      <p className="text-sm text-gray-600">{alt.model.provider}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Score: {Math.round(alt.score * 100)}%</p>
                    <p className="text-xs text-gray-600">
                      ${(alt.model.costPer1kTokens.input + alt.model.costPer1kTokens.output).toFixed(4)}/1K • {alt.model.averageLatency}ms
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 