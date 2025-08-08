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
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
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
      <Card className="border-green-500/30 bg-green-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-green-400">Selected Model</CardTitle>
              <CardDescription className="text-green-300">
                {selectedModel.name} by {selectedModel.provider}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              Score: {Math.round(score.score * 100)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Model Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-400">Cost</p>
              <p className="text-lg font-semibold text-white">
                ${(selectedModel.costPer1kTokens.input + selectedModel.costPer1kTokens.output).toFixed(4)}/1K tokens
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Latency</p>
              <p className="text-lg font-semibold text-white">{selectedModel.averageLatency}ms</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Quality</p>
              <p className="text-lg font-semibold text-white">{Math.round(selectedModel.quality * 100)}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Context</p>
              <p className="text-lg font-semibold text-white">{selectedModel.maxContextLength.toLocaleString()}</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Score Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Cost Score</span>
                <span className={`text-sm font-medium ${getScoreColor(score.breakdown.cost)}`}>
                  {Math.round(score.breakdown.cost * 100)}% ({getScoreLabel(score.breakdown.cost)})
                </span>
              </div>
              <Progress value={score.breakdown.cost * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Latency Score</span>
                <span className={`text-sm font-medium ${getScoreColor(score.breakdown.latency)}`}>
                  {Math.round(score.breakdown.latency * 100)}% ({getScoreLabel(score.breakdown.latency)})
                </span>
              </div>
              <Progress value={score.breakdown.latency * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Quality Score</span>
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
      <Card className="bg-white/[0.05] border-white/[0.1]">
        <CardHeader>
          <CardTitle className="text-white">Prompt Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-400">Original Prompt</p>
              <p className="mt-1 p-3 bg-white/[0.05] border border-white/[0.1] rounded-md text-sm text-white">{prompt}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-400">Type</p>
                <Badge variant="outline" className="text-white border-white/[0.2] bg-white/[0.05]">
                  {getPromptTypeDisplayName(analysis.type)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Confidence</p>
                <p className="text-lg font-semibold text-white">{Math.round(analysis.confidence * 100)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Estimated Tokens</p>
                <p className="text-lg font-semibold text-white">{analysis.estimatedTokens.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Requirements</p>
                <div className="space-y-1">
                  {analysis.requiresTools && <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">Tools</Badge>}
                  {analysis.requiresFunctionCalling && <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">Function Calling</Badge>}
                  {!analysis.requiresTools && !analysis.requiresFunctionCalling && (
                    <span className="text-sm text-zinc-500">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <Card className="bg-white/[0.05] border-white/[0.1]">
          <CardHeader>
            <CardTitle className="text-white">Alternative Models</CardTitle>
            <CardDescription className="text-zinc-400">Other models that could handle this prompt with detailed recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alternatives.map((alt, index) => {
                const costDiff = ((alt.model.costPer1kTokens.input + alt.model.costPer1kTokens.output) - 
                                 (selectedModel.costPer1kTokens.input + selectedModel.costPer1kTokens.output)) / 
                                (selectedModel.costPer1kTokens.input + selectedModel.costPer1kTokens.output) * 100;
                const latencyDiff = (alt.model.averageLatency - selectedModel.averageLatency) / selectedModel.averageLatency * 100;
                const qualityDiff = (alt.model.quality - selectedModel.quality) / selectedModel.quality * 100;
                
                const getRecommendation = () => {
                  if (costDiff < -20 && Math.abs(latencyDiff) < 30 && Math.abs(qualityDiff) < 10) {
                    return "💡 Great cost savings with minimal performance impact";
                  } else if (latencyDiff < -30 && Math.abs(costDiff) < 50) {
                    return "⚡ Significantly faster with reasonable cost";
                  } else if (qualityDiff > 5 && Math.abs(costDiff) < 100) {
                    return "🎯 Higher quality output for complex tasks";
                  } else if (costDiff < -50) {
                    return "💰 Much more cost-effective for budget-conscious use";
                  } else if (latencyDiff < -50) {
                    return "🚀 Much faster for time-sensitive applications";
                  } else {
                    return "🔄 Good alternative with balanced trade-offs";
                  }
                };

                const getStrengths = () => {
                  const strengths = [];
                  if (alt.model.quality > selectedModel.quality) {
                    strengths.push("Higher quality output");
                  }
                  if (alt.model.averageLatency < selectedModel.averageLatency) {
                    strengths.push("Faster response time");
                  }
                  if ((alt.model.costPer1kTokens.input + alt.model.costPer1kTokens.output) < 
                      (selectedModel.costPer1kTokens.input + selectedModel.costPer1kTokens.output)) {
                    strengths.push("Lower cost");
                  }
                  if (alt.model.maxContextLength > selectedModel.maxContextLength) {
                    strengths.push("Larger context window");
                  }
                  return strengths;
                };

                return (
                  <div key={alt.model.id} className="border border-white/[0.1] rounded-lg bg-white/[0.05] p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-zinc-500 bg-white/[0.1] px-2 py-1 rounded">#{index + 2}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-white">{alt.model.name}</p>
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                              {alt.model.provider}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400">{alt.model.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">Score: {Math.round(alt.score * 100)}%</p>
                        <p className="text-xs text-zinc-500">
                          ${(alt.model.costPer1kTokens.input + alt.model.costPer1kTokens.output).toFixed(4)}/1K • {alt.model.averageLatency}ms
                        </p>
                      </div>
                    </div>
                    
                    {/* Recommendation */}
                    <div className="mb-3 p-3 bg-white/[0.05] rounded-md border border-white/[0.1]">
                      <p className="text-sm text-white font-medium mb-1">Recommendation</p>
                      <p className="text-sm text-zinc-300">{getRecommendation()}</p>
                    </div>

                    {/* Strengths */}
                    {getStrengths().length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-zinc-400 mb-2">Key Strengths:</p>
                        <div className="flex flex-wrap gap-1">
                          {getStrengths().map((strength, idx) => (
                            <span key={idx} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detailed Comparison */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-zinc-400">Cost Comparison</p>
                        <p className={`font-medium ${costDiff < 0 ? 'text-green-400' : costDiff > 0 ? 'text-red-400' : 'text-white'}`}>
                          {costDiff > 0 ? '+' : ''}{costDiff.toFixed(1)}% vs selected
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-400">Speed Comparison</p>
                        <p className={`font-medium ${latencyDiff < 0 ? 'text-green-400' : latencyDiff > 0 ? 'text-red-400' : 'text-white'}`}>
                          {latencyDiff > 0 ? '+' : ''}{latencyDiff.toFixed(1)}% vs selected
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-400">Quality Comparison</p>
                        <p className={`font-medium ${qualityDiff > 0 ? 'text-green-400' : qualityDiff < 0 ? 'text-red-400' : 'text-white'}`}>
                          {qualityDiff > 0 ? '+' : ''}{qualityDiff.toFixed(1)}% vs selected
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 