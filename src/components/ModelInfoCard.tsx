'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Model } from '@/types';

interface ModelInfoCardProps {
  model: Model;
  showDetails?: boolean;
}

export function ModelInfoCard({ model, showDetails = true }: ModelInfoCardProps) {
  const getQualityColor = (quality: number) => {
    if (quality >= 0.9) return 'text-green-600';
    if (quality >= 0.8) return 'text-blue-600';
    if (quality >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 0.9) return 'Excellent';
    if (quality >= 0.8) return 'Very Good';
    if (quality >= 0.7) return 'Good';
    if (quality >= 0.6) return 'Fair';
    return 'Poor';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{model.name}</CardTitle>
            <CardDescription>{model.provider}</CardDescription>
          </div>
          <div className="text-right">
            <Badge variant="outline" className={getQualityColor(model.quality)}>
              {getQualityLabel(model.quality)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Input Cost</p>
            <p className="text-lg font-semibold">${model.costPer1kTokens.input.toFixed(4)}/1K</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Output Cost</p>
            <p className="text-lg font-semibold">${model.costPer1kTokens.output.toFixed(4)}/1K</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Latency</p>
            <p className="text-lg font-semibold">{model.averageLatency}ms</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Context</p>
            <p className="text-lg font-semibold">{model.maxContextLength.toLocaleString()}</p>
          </div>
        </div>

        {/* Quality Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Quality Score</span>
            <span className={`text-sm font-medium ${getQualityColor(model.quality)}`}>
              {Math.round(model.quality * 100)}%
            </span>
          </div>
          <Progress value={model.quality * 100} className="h-2" />
        </div>

        {/* Capabilities */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">Capabilities</p>
          <div className="flex flex-wrap gap-2">
            {model.supportsTools && (
              <Badge variant="secondary" className="text-xs">Tools</Badge>
            )}
            {model.supportsFunctionCalling && (
              <Badge variant="secondary" className="text-xs">Function Calling</Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {model.supportedPromptTypes.length} Task Types
            </Badge>
          </div>
        </div>

        {/* Description */}
        {showDetails && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
            <p className="text-sm text-gray-700">{model.description}</p>
          </div>
        )}

        {/* Supported Prompt Types */}
        {showDetails && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Supported Tasks</p>
            <div className="flex flex-wrap gap-1">
              {model.supportedPromptTypes.map((type) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 