'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoutingPreferences } from '@/types';

const formSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
  costWeight: z.number().min(0).max(1),
  latencyWeight: z.number().min(0).max(1),
  qualityWeight: z.number().min(0).max(1),
  maxCostPer1kTokens: z.number().optional(),
  maxLatency: z.number().optional(),
  minQuality: z.number().min(0).max(1).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PromptFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function PromptForm({ onSubmit, isLoading = false }: PromptFormProps) {
  const [totalWeight, setTotalWeight] = useState(1);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      costWeight: 0.3,
      latencyWeight: 0.3,
      qualityWeight: 0.4,
    },
  });

  const handleWeightChange = (field: keyof Pick<FormData, 'costWeight' | 'latencyWeight' | 'qualityWeight'>) => {
    const value = form.getValues(field);
    const otherFields = ['costWeight', 'latencyWeight', 'qualityWeight'].filter(f => f !== field) as Array<keyof FormData>;
    const otherValues = otherFields.map(f => form.getValues(f)) as number[];
    const total = value + otherValues.reduce((sum, val) => sum + val, 0);
    
    setTotalWeight(total);
    
    if (total !== 1) {
      // Normalize other weights proportionally
      const remainingWeight = 1 - value;
      const otherTotal = otherValues.reduce((sum, val) => sum + val, 0);
      
      if (otherTotal > 0) {
        otherFields.forEach((f, i) => {
          const normalizedValue = (otherValues[i] / otherTotal) * remainingWeight;
          form.setValue(f, normalizedValue);
        });
      }
    }
  };

  const handleSubmit = (data: FormData) => {
    const preferences: RoutingPreferences = {
      costWeight: data.costWeight,
      latencyWeight: data.latencyWeight,
      qualityWeight: data.qualityWeight,
      maxCostPer1kTokens: data.maxCostPer1kTokens,
      maxLatency: data.maxLatency,
      minQuality: data.minQuality,
    };
    
    onSubmit({ ...data, ...preferences });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>LLM Router</CardTitle>
        <CardDescription>
          Enter your prompt and configure routing preferences to find the optimal model
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <textarea
              {...form.register('prompt')}
              id="prompt"
              placeholder="Enter your prompt here..."
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
            {form.formState.errors.prompt && (
              <p className="text-sm text-red-600">{form.formState.errors.prompt.message}</p>
            )}
          </div>

          {/* Routing Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Routing Preferences</h3>
            
            {/* Weight Sliders */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="costWeight">Cost Priority</Label>
                  <span className="text-sm text-gray-600">
                    {Math.round(form.watch('costWeight') * 100)}%
                  </span>
                </div>
                <input
                  {...form.register('costWeight', { valueAsNumber: true })}
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full"
                  onChange={(e) => {
                    form.setValue('costWeight', parseFloat(e.target.value));
                    handleWeightChange('costWeight');
                  }}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="latencyWeight">Latency Priority</Label>
                  <span className="text-sm text-gray-600">
                    {Math.round(form.watch('latencyWeight') * 100)}%
                  </span>
                </div>
                <input
                  {...form.register('latencyWeight', { valueAsNumber: true })}
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full"
                  onChange={(e) => {
                    form.setValue('latencyWeight', parseFloat(e.target.value));
                    handleWeightChange('latencyWeight');
                  }}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="qualityWeight">Quality Priority</Label>
                  <span className="text-sm text-gray-600">
                    {Math.round(form.watch('qualityWeight') * 100)}%
                  </span>
                </div>
                <input
                  {...form.register('qualityWeight', { valueAsNumber: true })}
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full"
                  onChange={(e) => {
                    form.setValue('qualityWeight', parseFloat(e.target.value));
                    handleWeightChange('qualityWeight');
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Weight Validation */}
            {totalWeight !== 1 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Weights should sum to 100% (currently {Math.round(totalWeight * 100)}%)
                </p>
              </div>
            )}

            {/* Optional Constraints */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCostPer1kTokens">Max Cost per 1K Tokens ($)</Label>
                <Input
                  {...form.register('maxCostPer1kTokens', { valueAsNumber: true })}
                  type="number"
                  step="0.001"
                  placeholder="0.01"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLatency">Max Latency (ms)</Label>
                <Input
                  {...form.register('maxLatency', { valueAsNumber: true })}
                  type="number"
                  placeholder="5000"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minQuality">Min Quality (%)</Label>
                <Input
                  {...form.register('minQuality', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="80"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || totalWeight !== 1}
          >
            {isLoading ? 'Routing...' : 'Find Optimal Model'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 