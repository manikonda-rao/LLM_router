import { BaseProvider, ProviderConfig, ProviderRequest, ProviderResponse } from './base';

export class NotDiamondProvider extends BaseProvider {
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    super('NotDiamond', config);
    this.baseUrl = config.baseUrl || 'https://api.notdiamond.ai/v1';
  }

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    return this.retryWithBackoff(async () => {
      const startTime = Date.now();

      const response = await this.makeRequest(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens,
          top_p: request.topP,
          frequency_penalty: request.frequencyPenalty,
          presence_penalty: request.presencePenalty,
          stream: request.stream ?? false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createProviderError(
          errorData.error?.message || `NotDiamond API error: ${response.status}`,
          'NOTDIAMOND_ERROR',
          response.status,
          response.status >= 500 || response.status === 429
        );
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
        metadata: {
          model: data.model,
          finishReason: data.choices[0]?.finish_reason,
          latency,
        },
      };
    });
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw this.createProviderError(
          `Failed to list models: ${response.status}`,
          'NOTDIAMOND_ERROR',
          response.status
        );
      }

      const data = await response.json();
      return data.data?.map((model: { id: string }) => model.id) || [];
    } catch {
      // Return default models if API call fails
      return [
        'notdiamond-gpt-4o',
        'notdiamond-gpt-4o-mini',
        'notdiamond-claude-3-5-sonnet',
        'notdiamond-claude-3-haiku',
        'notdiamond-gemini-1.5-pro',
      ];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
} 