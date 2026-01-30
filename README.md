# LLM Router

Intelligent LLM routing system that directs prompts to optimal AI models based on cost, latency, quality, and performance characteristics.

**[Live Demo](https://llm-router-dusky.vercel.app/)**

## Features

- Multi-provider support: OpenAI, Anthropic, OpenRouter
- Intelligent routing based on type, cost, latency, and quality
- Automatic failover with configurable retry logic
- Prometheus/Grafana metrics and monitoring
- PostgreSQL storage with Prisma ORM
- Redis-based caching and rate limiting
- Automated quality evaluation system
- Docker containerization
- Comprehensive request tracking and audit logs
- React-based administrative interface

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (recommended)
- PostgreSQL
- Redis

### Docker Setup

```bash
docker-compose up -d
npm run db:push
```

Access points:
- Application: http://localhost:3000
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090

### Local Development

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

### Configuration

Set required environment variables:

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/route | Route prompt to optimal model |
| GET | /api/models | List available models |
| POST | /api/eval | Submit model evaluation |
| GET | /api/eval | Get evaluation history |
| POST | /api/feedback | Submit user feedback |
| GET | /api/feedback | Get feedback history |
| GET | /api/health | Health check |
| GET | /api/metrics | Prometheus metrics |

### Example Request

```bash
curl -X POST http://localhost:3000/api/route \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing",
    "preferences": {
      "costWeight": 0.3,
      "latencyWeight": 0.3,
      "qualityWeight": 0.4
    }
  }'
```

## Architecture

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Provider Adapters | `src/lib/providers/` | OpenAI, Anthropic, OpenRouter support |
| Model Registry | `src/config/registry.ts` | Configuration and model metadata |
| Routing Engine | `src/lib/router.ts` | Prompt classification and scoring |
| Failover System | `src/lib/failover.ts` | Automatic failover and retries |
| Caching | `src/lib/cache/redis.ts` | Redis-based caching and rate limiting |
| Monitoring | `src/lib/metrics/prometheus.ts` | Prometheus metrics collection |
| Database | `prisma/schema.prisma` | PostgreSQL with Prisma ORM |

### Request Flow

1. Rate limiting check
2. Cache lookup
3. Prompt classification
4. Model selection
5. Provider execution
6. Response caching
7. Metrics recording

### Model Configuration

Models are defined in `src/config/registry.ts` with properties including:
- Provider and endpoint
- Cost per token
- Context length
- Average latency
- Quality metrics
- Failover order

### Monitoring

Prometheus metrics are exposed at `/api/metrics`:
- `llm_requests_total` - Total requests processed
- `llm_requests_duration_seconds` - Request latency
- `llm_model_success_rate` - Model success rates
- `llm_failover_events_total` - Failover occurrences
- `llm_cache_hits_total` - Cache effectiveness

## Development

### Add a New Provider

1. Create provider class in `src/lib/providers/`
2. Extend `BaseProvider` class
3. Implement required methods
4. Register in `ProviderFactory`

### Add a New Model

1. Add configuration to `src/config/registry.ts`
2. Update model registry
3. Test with routing system

### Commands

```bash
npm run dev           # Start development server
npm run build         # Build production app
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm test              # Run test suite
npm run db:studio     # Open Prisma Studio
```

## Deployment

### Docker

```bash
docker build -t llm-router .
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

See `.env.example` for all configuration options.

## License

MIT
