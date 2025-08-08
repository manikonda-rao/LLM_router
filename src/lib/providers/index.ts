export * from './base';
export * from './openai';
export * from './anthropic';
export * from './openrouter';
export * from './notdiamond';

import { BaseProvider, ProviderConfig } from './base';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { OpenRouterProvider } from './openrouter';
import { NotDiamondProvider } from './notdiamond';

export type ProviderType = 'openai' | 'anthropic' | 'openrouter' | 'notdiamond';

export class ProviderFactory {
  private static providers = new Map<string, BaseProvider>();

  static createProvider(type: ProviderType, config: ProviderConfig): BaseProvider {
    const key = `${type}_${config.apiKey.slice(0, 8)}`;
    
    if (this.providers.has(key)) {
      return this.providers.get(key)!;
    }

    let provider: BaseProvider;

    switch (type) {
      case 'openai':
        provider = new OpenAIProvider(config);
        break;
      case 'anthropic':
        provider = new AnthropicProvider(config);
        break;
      case 'openrouter':
        provider = new OpenRouterProvider(config);
        break;
      case 'notdiamond':
        provider = new NotDiamondProvider(config);
        break;
      default:
        throw new Error(`Unknown provider type: ${type}`);
    }

    this.providers.set(key, provider);
    return provider;
  }

  static getProvider(type: ProviderType, config: ProviderConfig): BaseProvider {
    return this.createProvider(type, config);
  }

  static async checkProviderAvailability(type: ProviderType, config: ProviderConfig): Promise<boolean> {
    try {
      const provider = this.createProvider(type, config);
      return await provider.isAvailable();
    } catch (error) {
      return false;
    }
  }
} 