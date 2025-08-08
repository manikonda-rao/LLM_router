import { BaseProvider, ProviderConfig, ProviderRequest, ProviderResponse, ProviderError } from './base';

export class AnthropicProvider extends BaseProvider {
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    super('Anthropic', config);
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
  }

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    return this.retryWithBackoff(async () => {
      const startTime = Date.now();
      
      const response = await this.makeRequest(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          max_tokens: request.maxTokens ?? 1000,
          temperature: request.temperature ?? 0.7,
          top_p: request.topP,
          system: request.messages.find(m => m.role === 'system')?.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createProviderError(
          errorData.error?.message || `Anthropic API error: ${response.status}`,
          'ANTHROPIC_ERROR',
          response.status,
          response.status >= 500 || response.status === 429
        );
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.content[0]?.text || '',
        usage: data.usage ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        } : undefined,
        metadata: {
          model: data.model,
          finishReason: data.stop_reason,
          latency,
        },
      };
    });
  }

  async listModels(): Promise<string[]> {
    return this.retryWithBackoff(async () => {
      const response = await this.makeRequest(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'anthropic-version': '2023-06-01',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createProviderError(
          errorData.error?.message || `Anthropic API error: ${response.status}`,
          'ANTHROPIC_ERROR',
          response.status
        );
      }

      const data = await response.json();
      return data.data.map((model: any) => model.id);
    });
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.listModels();
      return true;
    } catch (error) {
      return false;
    }
  }
} 