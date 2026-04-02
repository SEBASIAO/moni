# Contributing to Moni

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 22.11.0 |
| pnpm | ≥ 9.0.0 |
| Supabase CLI | latest |
| Ruby + CocoaPods | (iOS only) |
| Android Studio | (Android only) |
| Xcode | (iOS only, macOS) |

## First-time setup

```bash
# 1. Clone the repo
git clone https://github.com/Moni-Labs-SAS/apps-template.git
cd apps-template

# 2. Install dependencies
pnpm install

# 3. Start Supabase local stack
cd apps/supabase
supabase start

# 4. Copy env files
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
# Fill in values from `supabase status`

# 5. iOS only — install CocoaPods
cd apps/mobile && pnpm pod-install
```

## Running the apps

```bash
# Web (Next.js)
pnpm dev:web

# Mobile — Metro bundler
pnpm dev:mobile

# Mobile — launch on Android emulator
cd apps/mobile && pnpm android

# Mobile — launch on iOS simulator (macOS)
cd apps/mobile && pnpm ios
```

## Git workflow (Gitflow)

```bash
# Always branch from develop for new features
git checkout develop
git pull origin develop
git checkout -b feature/MAR-42-my-feature

# Work, commit, push
git add -p
git commit -m "feat(auth): add biometric login support"
git push -u origin feature/MAR-42-my-feature

# Open PR → develop
# After merge, delete your branch
```

### Branch naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/<ticket>-<slug>` | `feature/MAR-42-login` |
| Bug fix | `fix/<slug>` | `fix/crash-on-logout` |
| Hotfix | `hotfix/<slug>` | `hotfix/auth-token-expiry` |
| Release | `release/<version>` | `release/1.2.0` |
| Chore | `chore/<slug>` | `chore/upgrade-rn-081` |

## Commit format

```
type(scope): short description (max 72 chars)

Optional body — explain WHY, not WHAT.

Closes #42
```

Types: `feat` `fix` `chore` `docs` `refactor` `test` `style` `ci` `perf`

## Quality gates

Before opening a PR, run locally:

```bash
pnpm typecheck   # TypeScript strict check
pnpm lint        # ESLint
pnpm test        # Jest + Vitest
pnpm build       # Turborepo build (web + packages)
```

All gates must pass. The CI pipeline enforces them on every PR.

## Adding a new shared package

1. Create `packages/<name>/` with `package.json` (name: `@moni/<name>`)
2. Add `"@moni/<name>": "workspace:*"` to consuming app's deps
3. Run `pnpm install` from root
4. Reference from apps via `import { ... } from '@moni/<name>'`

## Database changes

1. Create migration: `cd apps/supabase && supabase migration new <name>`
2. Write SQL in the generated file
3. Apply locally: `supabase db reset`
4. Regenerate types: `supabase gen types typescript --local > ../../packages/types/src/database.types.ts`
5. Commit migration file + updated `database.types.ts`
