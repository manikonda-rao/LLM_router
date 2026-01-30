# Contributing to LLM Router

## Requirements

- Node.js 20+
- npm or pnpm
- Docker and Redis (optional)

## Setup

Install dependencies:

```bash
npm install
cd npm-package && npm install && cd ..
```

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build application |
| `npm run lint` | Run linter |
| `npm run format` | Format code |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create migrations |
| `npm test` | Run tests |

## Code Standards

- Use TypeScript with explicit types for public APIs
- Follow existing patterns in codebase
- Run `npm run lint` and `npm run format` before committing
- Write self-documenting code with comments only for complex logic

## Pull Request Guidelines

1. Create feature branch: `git checkout -b feat/description`
2. Keep changes focused and small
3. Update tests and documentation
4. Ensure all CI checks pass
5. Use conventional commit messages:
   - `feat(module): add feature`
   - `fix(module): resolve issue`
   - `docs: update documentation`
   - `chore: maintenance tasks`

## Key Areas

- Routing: `src/lib/router.ts`, `src/lib/failover.ts`
- Providers: `src/lib/providers/`
- Models: `src/config/registry.ts`
- Metrics: `src/lib/metrics/prometheus.ts`
- Database: `prisma/schema.prisma`

## Adding Providers

1. Create provider in `src/lib/providers/` extending `BaseProvider`
2. Add to `src/lib/providers/index.ts`
3. Update model registry
4. Add comprehensive error handling
5. Include metrics instrumentation

## Before Submitting

- [ ] Build succeeds: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] Format applied: `npm run format`
- [ ] Types check out
- [ ] Tests added/updated
- [ ] Documentation updated



