export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ProviderResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: {
    model: string;
    finishReason?: string;
    latency?: number;
  };
}

export interface ProviderRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
}

export interface ProviderError {
  code: string;
  message: string;
  status?: number;
  retryable?: boolean;
}

export abstract class BaseProvider {
  protected config: ProviderConfig;
  protected name: string;

  constructor(name: string, config: ProviderConfig) {
    this.name = name;
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      ...config,
    };
  }

  abstract generate(request: ProviderRequest): Promise<ProviderResponse>;
  abstract listModels(): Promise<string[]>;
  abstract isAvailable(): Promise<boolean>;

  protected async makeRequest(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  protected async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.maxRetries!
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  protected createProviderError(
    message: string,
    code: string = 'PROVIDER_ERROR',
    status?: number,
    retryable: boolean = false
  ): ProviderError {
    return {
      code,
      message,
      status,
      retryable,
    };
  }
} 