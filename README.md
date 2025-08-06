# LLM Router

An intelligent routing system for optimal LLM model selection based on cost, latency, and quality preferences. Built with Next.js, TypeScript, and modern React patterns.

## 🚀 Features

- **🧠 Smart Prompt Classification**: Automatically classify prompts into categories (summarization, code generation, translation, etc.)
- **💰 Cost Optimization**: Balance cost, latency, and quality based on your preferences
- **🔄 Multi-Provider Support**: Support for OpenAI, Anthropic, Google, and other leading LLM providers
- **⚡ Real-time Scoring**: Dynamic model scoring with configurable weights
- **🛠️ Constraint Filtering**: Apply hard constraints like max cost, latency, and quality requirements
- **📊 Detailed Analytics**: Get comprehensive breakdowns of model selection decisions
- **🧪 Test Suite**: Built-in evaluation system to test routing accuracy

## 🏗️ Architecture

### Core Components

```
src/
├── lib/                    # Core routing logic
│   ├── classify.ts        # Prompt classification engine
│   ├── router.ts          # Main routing orchestration
│   ├── scorer.ts          # Model scoring algorithms
│   └── registry.ts        # Model registry and metadata
├── types/                 # TypeScript type definitions
│   └── index.ts          # Core types for the system
├── app/                   # Next.js app router
│   ├── page.tsx          # Main prompt input form
│   ├── results/          # Results display page
│   ├── test/             # Test suite page
│   └── actions/          # Server actions
├── components/            # React components
│   ├── PromptForm.tsx    # Main input form
│   ├── ResultCard.tsx    # Results display
│   └── ModelInfoCard.tsx # Model details
└── npm-package/          # Standalone npm package
```

### Data Flow

1. **Prompt Input** → User enters prompt and preferences
2. **Classification** → System analyzes prompt type and requirements
3. **Model Filtering** → Filter models by constraints and capabilities
4. **Scoring** → Score remaining models based on preferences
5. **Selection** → Return best model with alternatives
6. **Display** → Show detailed results and analysis

## 🛠️ Installation

```bash
# Clone the repository
git clone git@github.com:manikonda-rao/LLM_router.git
cd LLM_router

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📖 Usage

### Web Interface

1. **Navigate to the main page** (`/`)
2. **Enter your prompt** in the text area
3. **Configure preferences**:
   - Cost priority (0-100%)
   - Latency priority (0-100%)
   - Quality priority (0-100%)
   - Optional constraints (max cost, latency, quality)
4. **Submit** to get routing results
5. **View detailed results** on the results page

### Test Suite

1. **Navigate to the test page** (`/test`)
2. **Click "Run Test Suite"** to evaluate the system
3. **Review results** including:
   - Success rate
   - Average scores
   - Individual test results
   - Classification accuracy

### Programmatic Usage

```typescript
import { routePrompt, getDefaultPreferences } from '@/lib/router';

// Route a prompt with default preferences
const result = await routePrompt(
  "Summarize the following article about artificial intelligence.",
  getDefaultPreferences()
);

console.log(`Selected model: ${result.selectedModel.name}`);
console.log(`Score: ${Math.round(result.score.score * 100)}%`);
console.log(`Prompt type: ${result.analysis.type}`);
```

## 🧪 Testing

The project includes a comprehensive test suite that evaluates:

- **Prompt Classification**: Tests accuracy of prompt type detection
- **Model Selection**: Verifies optimal model selection
- **Constraint Handling**: Tests filtering and fallback behavior
- **Scoring Algorithms**: Validates scoring consistency

Run tests via the web interface at `/test` or use the programmatic API.

## 📦 NPM Package

The core logic is also available as a standalone npm package in the `npm-package/` directory:

```bash
cd npm-package
npm install
npm run build
```

### Publishing

```bash
cd npm-package
npm publish
```

## 🎯 Prompt Types

The system supports classification of these prompt types:

- **`summarization`** - Text summarization tasks
- **`code_generation`** - Code writing and generation
- **`translation`** - Language translation tasks
- **`question_answering`** - Q&A and information retrieval
- **`creative_writing`** - Creative content generation
- **`analysis`** - Analytical and comparative tasks
- **`general`** - General-purpose tasks

## 🤖 Supported Models

### OpenAI
- GPT-4o (Most capable, optimized for speed and cost)
- GPT-4o Mini (Fast and efficient with lower cost)
- GPT-3.5 Turbo (Fast and cost-effective)

### Anthropic
- Claude 3.5 Sonnet (Most capable with excellent reasoning)
- Claude 3 Haiku (Fast and efficient)

### Google
- Gemini 1.5 Pro (Massive context window)
- Gemini 1.5 Flash (Fast and cost-effective)

## ⚙️ Configuration

### Routing Preferences

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

### Model Metadata

Each model includes:
- **Cost per 1K tokens** (input/output)
- **Average latency** in milliseconds
- **Quality score** (0-1 scale)
- **Supported prompt types**
- **Capabilities** (tools, function calling)
- **Context length** limits

## 🔧 Development

### Adding New Models

1. **Update the registry** in `src/lib/registry.ts`
2. **Add model metadata** including costs, capabilities, etc.
3. **Test the model** using the test suite

### Custom Classification Rules

1. **Modify classification rules** in `src/lib/classify.ts`
2. **Add new keywords/patterns** for prompt types
3. **Update type definitions** if adding new prompt types

### Extending Scoring

1. **Modify scoring logic** in `src/lib/scorer.ts`
2. **Add new scoring factors** as needed
3. **Update normalization functions** for new metrics

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel

# Or connect GitHub repository for automatic deployments
```

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: `npm run build && netlify deploy`
- **Railway**: Connect GitHub repository
- **Docker**: Use the provided Dockerfile

## 📊 Performance

- **Classification**: ~1ms per prompt
- **Model Scoring**: ~5ms per model
- **Full Routing**: ~10-50ms total
- **Memory Usage**: <50MB for typical usage

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests** for new functionality
5. **Submit a pull request**

### Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Lint code
npm run lint
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [ShadCN](https://ui.shadcn.com/)
- Type safety with [TypeScript](https://www.typescriptlang.org/)
- Form handling with [React Hook Form](https://react-hook-form.com/)
- Validation with [Zod](https://zod.dev/)

## 📞 Support

For questions, issues, or contributions:

- **Issues**: [GitHub Issues](https://github.com/manikonda-rao/LLM_router/issues)
- **Discussions**: [GitHub Discussions](https://github.com/manikonda-rao/LLM_router/discussions)
- **Email**: shraddharaom@gmail.com

---

**Made with ❤️ for the AI community**
