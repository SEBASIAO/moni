# Moni — App Template

Production-ready monorepo template for Moni mobile apps targeting the Colombian market.

## Stack

| Layer | Technology |
|---|---|
| Mobile | React Native 0.81 (CLI) |
| Web | Next.js 15 (App Router) |
| Backend | Supabase (Auth, DB, Storage, Edge Functions) |
| Mobile UI | React Native Paper 5 (Material Design 3) |
| Web UI | shadcn/ui + Tailwind CSS |
| State | Zustand 5 |
| Data fetching | TanStack Query v5 |
| Monorepo | Turborepo 2 + pnpm 9 |
| Language | TypeScript 5 (strict) |
| Testing | Jest + RNTL (mobile) / Vitest + Testing Library (web) |

## Repository structure

```
apps/
  mobile/     React Native CLI app (@moni/mobile)
  web/        Next.js app (@moni/web)
  supabase/   Supabase local config, migrations, edge functions
packages/
  api/        Shared Supabase client + TanStack Query hooks (@moni/api)
  types/      Shared TypeScript types (@moni/types)
  ui/         Shared React Native Paper components + brand theme (@moni/ui)
  config/     Shared TypeScript, ESLint, Prettier configs
```

## Quick start

```bash
# Prerequisites: Node >= 22.11, pnpm >= 9, Supabase CLI
pnpm install
cd apps/supabase && supabase start
# Copy and fill .env files (see apps/*/.env.example)
pnpm dev:web       # Next.js on :3000
pnpm dev:mobile    # Metro bundler
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full setup guide.

## Using this template

1. Click **Use this template** on GitHub -> **Create a new repository**
2. Clone your new repository
3. Search and replace `moni` / `Moni` with your app name
4. Update `apps/supabase/config.toml` (`project_id`)
5. Run `pnpm install` and start building

## AI agent rules

See [CLAUDE.md](./CLAUDE.md) — always enter plan mode before acting.

## License

MIT — Moni SAS
