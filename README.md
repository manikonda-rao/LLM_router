# LLM Router

A sophisticated LLM routing system that intelligently routes prompts to the most appropriate AI models based on cost, latency, quality, and other factors.

## Features

- 🤖 **Multi-Provider Support**: OpenAI, Anthropic, OpenRouter
- 🎯 **Intelligent Routing**: Route prompts based on type, cost, latency, and quality
- 🔄 **Failover & Retries**: Automatic failover with configurable retry logic
- 📊 **Metrics & Monitoring**: Prometheus/Grafana integration
- 🗄️ **Database Storage**: PostgreSQL with Prisma ORM
- ⚡ **Caching**: Redis-based caching and rate limiting
- 🔍 **Evaluation System**: Automated quality assessment
- 🐳 **Docker Support**: Complete containerization
- 📈 **Audit Logs**: Comprehensive request tracking
- 🎨 **Modern UI**: Beautiful React-based interface

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL
- Redis

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd LLM_router
```

2. Copy the environment template:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```env
# Basic Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/llm_router"

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# Provider API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# Security
JWT_SECRET=your_jwt_secret_min_32_chars
API_KEY_SECRET=your_api_key_secret_min_32_chars

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST_LIMIT=10

# Cache
CACHE_TTL_SECONDS=3600

# Failover
FAILOVER_ENABLED=true
FAILOVER_MAX_RETRIES=3
FAILOVER_RETRY_DELAY=1000

# Evaluation
EVAL_JOB_ENABLED=true
EVAL_JOB_SCHEDULE="0 2 * * *"
EVAL_MIN_SAMPLES=10

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### Docker Setup (Recommended)

1. Start all services:
```bash
docker-compose up -d
```

2. Initialize the database:
```bash
npm run db:push
```

3. Access the application:
- App: http://localhost:3000
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npm run db:generate
npm run db:push
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Core Routing
- `POST /api/route` - Route a prompt to the best model
- `GET /api/models` - List available models
- `POST /api/eval` - Submit model evaluation
- `GET /api/eval` - Get evaluation history
- `POST /api/feedback` - Submit user feedback
- `GET /api/feedback` - Get feedback history

### Monitoring
- `GET /api/health` - Health check
- `GET /api/metrics` - Prometheus metrics

### Example Usage

```bash
# Route a prompt
curl -X POST http://localhost:3000/api/route \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing in simple terms",
    "preferences": {
      "costWeight": 0.3,
      "latencyWeight": 0.3,
      "qualityWeight": 0.4
    }
  }'

# Get available models
curl http://localhost:3000/api/models

# Submit feedback
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "gpt-4o",
    "prompt": "What is AI?",
    "response": "AI is...",
    "feedback": {
      "rating": 5,
      "category": "accuracy",
      "comment": "Great explanation!"
    }
  }'
```

## Architecture

### Core Components

1. **Provider Adapters** (`src/lib/providers/`)
   - OpenAI, Anthropic, OpenRouter support
   - Unified interface for all providers
   - Automatic retry and error handling

2. **Model Registry** (`src/config/registry.ts`)
   - Typed configuration system
   - Model metadata and capabilities
   - Failover configuration

3. **Routing Engine** (`src/lib/router.ts`)
   - Intelligent prompt classification
   - Multi-factor scoring system
   - Cost, latency, and quality optimization

4. **Failover System** (`src/lib/failover.ts`)
   - Automatic failover with metrics
   - Configurable retry logic
   - Performance tracking

5. **Caching & Rate Limiting** (`src/lib/cache/redis.ts`)
   - Redis-based caching
   - Rate limiting with sliding windows
   - Configurable TTLs

6. **Monitoring** (`src/lib/metrics/prometheus.ts`)
   - Prometheus metrics collection
   - Grafana dashboards
   - Performance monitoring

7. **Database** (`prisma/schema.prisma`)
   - PostgreSQL with Prisma ORM
   - Audit logs and metrics storage
   - User feedback and evaluations

### Data Flow

1. **Request Processing**:
   - Rate limiting check
   - Cache lookup
   - Prompt classification
   - Model selection
   - Provider execution
   - Response caching
   - Metrics recording

2. **Failover Logic**:
   - Primary model failure
   - Automatic failover to backup models
   - Retry with exponential backoff
   - Metrics tracking

3. **Evaluation Pipeline**:
   - User feedback collection
   - Automated quality assessment
   - Model performance tracking
   - Quality score updates

## Configuration

### Model Configuration

Models are configured in `src/config/registry.ts`:

```typescript
{
  id: 'gpt-4o',
  name: 'GPT-4o',
  provider: 'openai',
  costPer1kTokens: { input: 0.005, output: 0.015 },
  maxContextLength: 128000,
  averageLatency: 2000,
  quality: 0.95,
  supportedPromptTypes: ['summarization', 'code_generation', 'translation', 'question_answering', 'creative_writing', 'analysis', 'general'],
  supportsTools: true,
  supportsFunctionCalling: true,
  description: 'Most capable GPT-4 model, optimized for speed and cost',
  isActive: true,
  priority: 9,
  failoverOrder: ['gpt-4o-mini', 'gpt-3.5-turbo'],
}
```

### Environment Variables

See the `.env.example` file for all available configuration options.

## Monitoring & Observability

### Metrics

The application exposes Prometheus metrics at `/api/metrics`:

- `llm_requests_total` - Total requests
- `llm_requests_duration_seconds` - Request duration
- `llm_model_success_rate` - Model success rates
- `llm_failover_events_total` - Failover events
- `llm_cache_hits_total` - Cache hit rate

### Dashboards

Grafana dashboards are automatically provisioned with:
- Request volume and latency
- Model performance metrics
- Failover statistics
- Cache performance
- Error rates

### Health Checks

Health checks are available at `/api/health` and include:
- Database connectivity
- Redis connectivity
- Provider availability
- Model registry status

## Development

### Adding New Providers

1. Create a new provider class in `src/lib/providers/`
2. Extend the `BaseProvider` class
3. Implement required methods
4. Add to the `ProviderFactory`

### Adding New Models

1. Add model configuration to `src/config/registry.ts`
2. Update the model registry
3. Test with the routing system

### Running Tests

```bash
npm test
```

### Code Quality

```bash
npm run lint
npm run format
```

## Deployment

### Production Deployment

1. Set up production environment variables
2. Build the Docker image:
```bash
docker build -t llm-router .
```

3. Deploy with Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

Kubernetes manifests are available in the `k8s/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our Discord community
