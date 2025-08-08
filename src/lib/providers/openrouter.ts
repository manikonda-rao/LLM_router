import { BaseProvider, ProviderConfig, ProviderRequest, ProviderResponse, ProviderError } from './base';

export class OpenRouterProvider extends BaseProvider {
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    super('OpenRouter', config);
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1';
  }

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    return this.retryWithBackoff(async () => {
      const startTime = Date.now();
      
      const response = await this.makeRequest(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/your-repo/llm-router',
          'X-Title': 'LLM Router',
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
          errorData.error?.message || `OpenRouter API error: ${response.status}`,
          'OPENROUTER_ERROR',
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
    return this.retryWithBackoff(async () => {
      const response = await this.makeRequest(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createProviderError(
          errorData.error?.message || `OpenRouter API error: ${response.status}`,
          'OPENROUTER_ERROR',
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