# Moni — Claude Agent Rules

This file governs how AI agents (Claude Code) operate in this repository.
**All rules are mandatory.** No exceptions.

---

## 1. Mandatory Workflow — Plan Before Act

**ALWAYS enter plan mode before making any change.**

1. Read and understand the relevant code
2. Propose your implementation approach in the plan
3. Wait for explicit user approval
4. Then implement

Never write code, run commands, or edit files without first entering plan mode.

---

## 2. Git Workflow (Gitflow)

```
main        ← production only — tagged releases, no direct commits
develop     ← integration branch — all features merge here first
feature/*   ← new features (branch from develop)
hotfix/*    ← urgent production fixes (branch from main, merge to main + develop)
release/*   ← release prep (branch from develop)
```

### Branch naming
- `feature/<ticket>-<short-description>` — e.g. `feature/MAR-42-login-screen`
- `hotfix/<short-description>` — e.g. `hotfix/crash-on-launch`
- `release/<version>` — e.g. `release/1.2.0`

### Commit format (Conventional Commits)
```
type(scope): short description

body (optional)

footer (optional — Co-authored-by, Closes #issue)
```
Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `ci`, `perf`

**Never commit directly to `main` or `develop`.**

---

## 3. Principles

### Don't reinvent the wheel
Before writing new code, check:
- Does `@moni/api` already have this query/mutation?
- Does `@moni/ui` already have this component?
- Does `@moni/types` already define this type?
- Is there a library in the existing deps that does this?

If something exists — use it. Only create new abstractions when genuinely needed.

### DRY (Don't Repeat Yourself)
- Shared logic → `packages/` (not inside individual apps)
- Shared types → `@moni/types`
- Shared API hooks → `@moni/api`
- Shared UI components → `@moni/ui`
- If code is copied to a second location, it must be extracted

### TDD (Test-Driven Development)
- Write tests before or alongside implementation — never after
- All new features and bug fixes require tests
- Co-locate test files: `Component.test.tsx` next to `Component.tsx`
- Coverage target: **80% statements** minimum

### Clean Code
- Functions do one thing, named to say what they do
- Max function length: ~30 lines (longer = extract helpers)
- No magic numbers — use named constants
- Explicit over clever

### Modular Architecture
- Features are self-contained in `src/features/<name>/`
- Each feature owns its: screens, components, hooks, store, types
- Cross-feature dependencies go through shared packages

---

## 4. Code Conventions

### TypeScript
- Strict mode everywhere — zero tolerance for `any`
- No `// @ts-ignore` or `// @ts-expect-error` without a comment explaining why
- Use `type` imports: `import type { Foo } from './foo'`
- Prefer interfaces for object shapes, types for unions/primitives

### React / React Native
- Functional components only — no class components (except ErrorBoundary)
- Custom hooks start with `use` and live in `hooks/` directories
- No inline styles in JSX — use `StyleSheet.create` (mobile) or Tailwind (web)
- Always use `testID` props on interactive elements for testing

### State Management
- Server/async state → TanStack Query (`@moni/api` hooks)
- UI/client state → Zustand stores
- Avoid prop drilling more than 2 levels — lift to a store

### Imports
- Path alias `@/` maps to `src/` — always use it for internal imports
- Workspace packages via `@moni/*` — never use relative paths to reach outside your app
- Import order (enforced by ESLint): builtin → external → internal → parent → sibling

### Environment variables
- Always add new vars to `.env.example` (with a dummy value)
- Never commit `.env` or `.env.local`
- Prefix client-safe vars with `NEXT_PUBLIC_` (web only)

---

## 5. Monorepo Structure

```
apps/
  mobile/     @moni/mobile — React Native 0.81 CLI
  web/        @moni/web    — Next.js 15 (App Router)
  supabase/                  — Supabase local config, migrations, edge functions
packages/
  api/        @moni/api    — Supabase client + TanStack Query hooks
  types/      @moni/types  — Shared TypeScript types
  ui/         @moni/ui     — React Native Paper components + theme
  config/
    typescript/ @moni/config-typescript
    eslint/     @moni/config-eslint
    prettier/   @moni/config-prettier
```

---

## 6. Forbidden Actions

- Never commit to `main` or `develop` directly
- Never use `any` type
- Never duplicate code that belongs in `packages/`
- Never use `console.log` in production code (use a proper logger)
- Never hardcode secrets, API keys, or URLs
- Never skip `pnpm lint` or `pnpm typecheck` before committing
- Never merge a PR without tests for changed logic
