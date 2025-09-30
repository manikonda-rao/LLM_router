### Contributing to LLM Router

Thank you for your interest in improving this project! This guide explains how to set up your environment, follow coding standards, and submit changes.

## Getting Started

- **Requirements**:
  - Node.js 20+
  - pnpm or npm (examples below use npm)
  - Docker (optional, for running with Prometheus/Grafana)
  - Redis (optional, for cache layer)

- **Install dependencies**:
  - Root app (Next.js):
    - `npm install`
  - Library in `npm-package/` (TypeScript library):
    - `cd npm-package && npm install && cd ..`

- **Environment**:
  - Copy env template if provided and set required keys for providers (OpenAI, Anthropic, etc.). See `src/config/env.ts` for required variables.
  - For Prisma, set your database URL before running migrations.

## Common Scripts (Root)

- `npm run dev` — Start Next.js dev server
- `npm run build` — Build Next.js app
- `npm start` — Start the built app
- `npm run lint` — Lint the project
- `npm run format` — Format files with Prettier
- `npm run db:generate` — Generate Prisma client
- `npm run db:push` — Push schema to DB
- `npm run db:migrate` — Create/apply migrations (dev)
- `npm run db:studio` — Prisma Studio
- `npm run docker:build` — Build Docker image
- `npm run docker:run` — Start docker-compose (Prometheus/Grafana)
- `npm run docker:stop` — Stop docker-compose
- `npm run eval:run` — Run evaluation job (`src/jobs/evalJob.ts`)

## Library Workflow (npm-package/)

Inside `npm-package/`:

- `npm run build` — Compile to `dist/`
- `npm run dev` — TypeScript watch mode
- `npm test` — Run tests (Jest)
- `npm run lint` — ESLint
- `npm run format` — Prettier

If you are contributing to the published library surface, ensure types and exports in `npm-package/src/index.ts` are updated and that `npm-package/README.md` reflects changes.

## Branching & Pull Requests

- Create a feature branch from `main`: `git checkout -b feat/short-description`
- Keep PRs focused and small. Include context, screenshots for UI, and performance notes for routing changes.
- Link issues in the PR description when applicable.
- Ensure CI checks pass: build, lint, typecheck, and tests where applicable.

## Code Style & Quality

- TypeScript preferred with explicit types for exported APIs.
- Follow existing patterns in `src/lib/providers/`, `src/lib/router.ts`, and related utilities.
- Run `npm run lint` and `npm run format` before committing.
- Write clear, self-documenting code. Add concise comments for non-obvious logic.

## Commit Messages

Use clear, conventional messages:

- `feat(router): add latency-aware fallback`
- `fix(openai): handle 429 with exponential backoff`
- `docs: update setup instructions`
- `chore: bump dependencies`

## Database (Prisma)

- Edit `prisma/schema.prisma` as needed.
- Generate client: `npm run db:generate`
- For schema changes in development: `npm run db:migrate`
- Verify changes with `npm run db:studio`

## Monitoring & Ops

- Prometheus and Grafana configs live under `monitoring/`.
- To run locally via Docker: `npm run docker:run`
- Grafana dashboards are in `monitoring/grafana/dashboards/`.
- App metrics endpoint: see `src/app/api/metrics/route.ts` and `src/lib/metrics/prometheus.ts`.

## Running with Docker

- Build image: `npm run docker:build`
- Bring up services: `npm run docker:run`
- Tear down: `npm run docker:stop`

## Feature Areas

- Routing logic: `src/lib/router.ts`, `src/lib/failover.ts`
- Scoring & classification: `src/lib/scorer.ts`, `src/lib/classify.ts`
- Providers: `src/lib/providers/`
- Registry & model configs: `src/config/registry.ts`, `src/lib/registry.ts`
- API routes: `src/app/api/**`
- UI components: `src/components/**`

## Adding/Updating Providers

- Implement provider in `src/lib/providers/` using `base.ts` as a guide.
- Wire it into `src/lib/providers/index.ts` and update the registry.
- Ensure env vars and error handling are in place; add metrics labels.

## Tests

- Add unit tests where practical (particularly for routing, scoring, and provider adapters).
- For `npm-package/`, use Jest tests under `npm-package/src/**/__tests__`.

## Security & Secrets

- Do not commit secrets. Use environment variables.
- Rotate keys and avoid printing sensitive data in logs.

## Opening a PR Checklist

- [ ] Build succeeds: `npm run build`
- [ ] Lint & format: `npm run lint` and `npm run format`
- [ ] Types OK in both root and `npm-package/`
- [ ] Tests updated/passing (when applicable)
- [ ] Docs updated: `README.md`, `CONTRIBUTION.md`, and `npm-package/README.md` if needed

Thanks for contributing!


