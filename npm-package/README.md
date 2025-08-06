# LLM Router

An intelligent routing system for optimal LLM model selection based on cost, latency, and quality preferences.

## Features

- 🧠 **Smart Prompt Classification**: Automatically classify prompts into categories (summarization, code generation, translation, etc.)
- 💰 **Cost Optimization**: Balance cost, latency, and quality based on your preferences
- 🔄 **Multi-Provider Support**: Support for OpenAI, Anthropic, Google, and other leading LLM providers
- ⚡ **Real-time Scoring**: Dynamic model scoring with configurable weights
- 🛠️ **Constraint Filtering**: Apply hard constraints like max cost, latency, and quality requirements
- 📊 **Detailed Analytics**: Get comprehensive breakdowns of model selection decisions

## Installation

```bash
npm install llm-router
```

## Quick Start

```typescript
import { routePrompt, getDefaultPreferences } from 'llm-router';

// Route a prompt with default preferences
const result = await routePrompt(
  "Summarize the following article about artificial intelligence.",
  getDefaultPreferences()
);

console.log(`Selected model: ${result.selectedModel.name}`);
console.log(`Score: ${Math.round(result.score.score * 100)}%`);
console.log(`Estimated cost: $${result.summary.estimatedCost}`);
```

## API Reference

### Core Functions

#### `routePrompt(prompt: string, preferences?: RoutingPreferences): Promise<RoutingResult>`

Routes a prompt to the optimal model based on the given preferences.

```typescript
import { routePrompt, RoutingPreferences } from 'llm-router';

const preferences: RoutingPreferences = {
  costWeight: 0.4,        // 40% weight on cost
  latencyWeight: 0.3,     // 30% weight on latency
  qualityWeight: 0.3,     // 30% weight on quality
  maxCostPer1kTokens: 0.01, // Max $0.01 per 1K tokens
  maxLatency: 5000,       // Max 5 seconds
  minQuality: 0.8,        // Min 80% quality
  preferredProviders: ['OpenAI', 'Anthropic'] // Only these providers
};

const result = await routePrompt("Your prompt here", preferences);
```

#### `classifyPrompt(prompt: string): PromptAnalysis`

Classifies a prompt into a specific type and analyzes its requirements.

```typescript
import { classifyPrompt } from 'llm-router';

const analysis = classifyPrompt("Write a Python function to calculate fibonacci numbers");
console.log(analysis.type); // "code_generation"
console.log(analysis.confidence); // 0.85
console.log(analysis.requiresTools); // false
```

#### `scoreModel(model: Model, analysis: PromptAnalysis, preferences: RoutingPreferences): ScoreResult`

Scores a specific model for a given prompt and preferences.

```typescript
import { scoreModel, modelRegistry } from 'llm-router';

const model = modelRegistry.find(m => m.id === 'gpt-4o');
const analysis = classifyPrompt("Your prompt");
const preferences = getDefaultPreferences();

const score = scoreModel(model, analysis, preferences);
console.log(`Model score: ${Math.round(score.score * 100)}%`);
```

### Types

#### `RoutingPreferences`

```typescript
interface RoutingPreferences {
  costWeight: number;           // 0-1 weight for cost optimization
  latencyWeight: number;        // 0-1 weight for latency optimization
  qualityWeight: number;        // 0-1 weight for quality optimization
  maxCostPer1kTokens?: number;  // Maximum cost per 1K tokens
  maxLatency?: number;          // Maximum latency in milliseconds
  minQuality?: number;          // Minimum quality score (0-1)
  preferredProviders?: string[]; // Preferred provider names
}
```

#### `RoutingResult`

```typescript
interface RoutingResult {
  selectedModel: Model;         // The selected model
  score: ScoreResult;           // Detailed scoring information
  analysis: PromptAnalysis;     // Prompt analysis results
  alternatives: ScoreResult[];  // Alternative model options
}
```

#### `Model`

```typescript
interface Model {
  id: string;                   // Unique model identifier
  name: string;                 // Display name
  provider: string;             // Provider name (OpenAI, Anthropic, etc.)
  costPer1kTokens: {
    input: number;              // Cost per 1K input tokens
    output: number;             // Cost per 1K output tokens
  };
  maxContextLength: number;     // Maximum context length
  averageLatency: number;       // Average latency in milliseconds
  quality: number;              // Quality score (0-1)
  supportedPromptTypes: PromptType[]; // Supported prompt types
  supportsTools: boolean;       // Whether model supports tools
  supportsFunctionCalling: boolean; // Whether model supports function calling
  description: string;          // Model description
}
```

### Model Registry

The package includes a pre-configured registry of popular LLM models:

```typescript
import { modelRegistry, getModelsByProvider } from 'llm-router';

// Get all OpenAI models
const openaiModels = getModelsByProvider('OpenAI');

// Get models that support code generation
const codeModels = modelRegistry.filter(m => 
  m.supportedPromptTypes.includes('code_generation')
);
```

### Prompt Types

Supported prompt types:
- `summarization` - Text summarization tasks
- `code_generation` - Code writing and generation
- `translation` - Language translation tasks
- `question_answering` - Q&A and information retrieval
- `creative_writing` - Creative content generation
- `analysis` - Analytical and comparative tasks
- `general` - General-purpose tasks

## Advanced Usage

### Custom Model Registry

```typescript
import { Model, routePrompt } from 'llm-router';

const customModels: Model[] = [
  {
    id: 'my-custom-model',
    name: 'My Custom Model',
    provider: 'Custom Provider',
    costPer1kTokens: { input: 0.001, output: 0.002 },
    maxContextLength: 32000,
    averageLatency: 1500,
    quality: 0.85,
    supportedPromptTypes: ['summarization', 'question_answering'],
    supportsTools: false,
    supportsFunctionCalling: false,
    description: 'My custom model for specific tasks'
  }
];

// Use custom models in routing
const result = await routePrompt("Your prompt", preferences, customModels);
```

### Batch Processing

```typescript
import { routePrompt, classifyPrompt } from 'llm-router';

const prompts = [
  "Summarize this article",
  "Write a Python function",
  "Translate to Spanish"
];

const results = await Promise.all(
  prompts.map(prompt => routePrompt(prompt))
);

// Analyze results
const classifications = prompts.map(prompt => classifyPrompt(prompt));
const modelSelections = results.map(r => r.selectedModel.name);
```

## Examples

### Cost-Optimized Routing

```typescript
const costOptimized = {
  costWeight: 0.7,
  latencyWeight: 0.2,
  qualityWeight: 0.1,
  maxCostPer1kTokens: 0.005
};

const result = await routePrompt("Your prompt", costOptimized);
```

### Quality-Focused Routing

```typescript
const qualityFocused = {
  costWeight: 0.1,
  latencyWeight: 0.2,
  qualityWeight: 0.7,
  minQuality: 0.9
};

const result = await routePrompt("Your prompt", qualityFocused);
```

### Fast Response Routing

```typescript
const fastResponse = {
  costWeight: 0.2,
  latencyWeight: 0.7,
  qualityWeight: 0.1,
  maxLatency: 2000
};

const result = await routePrompt("Your prompt", fastResponse);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 