# Moni Agent Guide

This file provides repository-specific instructions for coding agents working in this monorepo.

## Working Style

- Read the relevant code before editing.
- For multi-file or risky changes, outline the approach before making edits.
- Prefer small, targeted changes over broad refactors.
- Reuse existing packages, patterns, and dependencies before creating new abstractions.

## Git Rules

- Do not commit directly to `main` or `develop`.
- Prefer feature or fix branches from `develop`.
- Follow Conventional Commits:

```text
type(scope): short description
```

- Typical types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `ci`, `perf`.

## Monorepo Layout

```text
apps/
  mobile/   React Native 0.81 CLI app
  web/      Next.js 15 app router app
packages/
  api/      Shared Supabase client and TanStack Query hooks
  types/    Shared TypeScript types
  ui/       Shared React Native Paper components and theme
  config/   Shared TypeScript / ESLint / Prettier config packages
```

## Shared Code Rules

- Shared business logic belongs in `packages/`, not duplicated across apps.
- Shared types belong in `@moni/types`.
- Shared API hooks and Supabase helpers belong in `@moni/api`.
- Shared UI components and theme belong in `@moni/ui`.
- If the same logic appears in a second place, extract it.

## TypeScript and React

- Keep TypeScript strict. Avoid `any`.
- Use `import type` when importing types only.
- Prefer interfaces for object-shaped contracts and types for unions/primitives.
- Functional components are the default. A class component is acceptable only for cases like `ErrorBoundary`.
- Hooks must start with `use` and live in feature or shared hook folders.

## App Conventions

- Mobile code uses `StyleSheet.create`; avoid inline styles in JSX.
- Web code uses the existing web styling approach already present in the app.
- Add `testID` to interactive mobile elements that need automated tests.
- Use `@/` for app-internal imports and `@moni/*` for workspace packages.
- Do not use relative imports to reach across package or app boundaries.

## Testing and Validation

- Every change to behavior should include or update tests.
- Co-locate tests next to the implementation when possible.
- Before finishing, run the checks that match the scope of the change.
- For repo-wide verification, use:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

- Current test runners:
  - `apps/web`: Vitest
  - `apps/mobile`: Jest
  - `packages/ui`: Jest

## Lint and Tooling Notes

- ESLint is configured through the repo-root [`eslint.config.mjs`](./eslint.config.mjs).
- Use the package lint scripts as defined in `package.json`; do not switch web back to `next lint`.
- `apps/web` test runs are allowed to pass when no test files exist.

## Supabase and Environment

- Never hardcode secrets, API keys, or environment-specific URLs.
- Add new environment variables to the relevant example or documentation file.
- In Next.js server code, follow the current `getAll` / `setAll` cookie pattern used by Supabase SSR helpers.

## Forbidden Moves

- Do not duplicate code that should live in `packages/`.
- Do not commit secrets or local env files.
- Do not leave debug logging in production code.
- Do not bypass lint, typecheck, or tests before handing work off.
