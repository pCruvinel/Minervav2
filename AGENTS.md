# Repository Guidelines

## Project Structure & Module Organization
- `src/` is the main app code (React + TypeScript + Vite).
- `src/app/`, `src/routes/`, and `src/router.ts` define the TanStack Router setup; `src/routeTree.gen.ts` is generated and should not be edited by hand.
- `src/components/`, `src/hooks/`, `src/lib/`, `src/types/`, and `src/styles/` hold UI, logic, shared utilities, types, and the design system styles.
- `src/assets/` and `public/` store static assets used by the UI.
- `tests/` contains test setup (see `tests/setup.ts`); test files live across the repo but must match the naming convention below.
- `supabase/` holds backend functions and database assets used when the optional Supabase backend is enabled.

## Build, Test, and Development Commands
- `npm run dev` starts the Vite dev server.
- `npm run build` creates the production build.
- `npm run test` runs Vitest in watch mode.
- `npm run test:run` runs Vitest once for CI-like runs.
- `npm run test:ui` opens the Vitest UI.
- `npm run test:coverage` runs tests with V8 coverage reports.
- `npm run lint` checks ESLint rules; `npm run lint:fix` auto-fixes where possible.
- `npm run validate-colors` enforces design-system color usage.
- `npm run update-types` or `npm run update-types:local` regenerates Supabase TypeScript types.

## Coding Style & Naming Conventions
- TypeScript + React + Tailwind CSS are the default stack.
- Follow existing formatting; most TS/TSX files use 2-space indentation.
- Components use `PascalCase`, hooks use `useSomething`, and shared utilities prefer `camelCase`.
- Do not hardcode colors (hex/rgb/hsl or raw Tailwind color classes). Use design tokens like `bg-primary` and `text-success` instead; ESLint enforces this rule.
- Use the `@` import alias for `src` (configured in `vitest.config.ts`).

## Testing Guidelines
- Tests run with Vitest (`happy-dom` environment) and Testing Library.
- Name tests `*.test.ts` or `*.test.tsx` (per `vitest.config.ts`).
- Global test setup lives in `tests/setup.ts` (timezone, matchers, etc.).

## Commit & Pull Request Guidelines
- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). Keep the summary short and scoped.
- PRs should include a concise summary, linked issues (if any), and screenshots for UI changes. Note any test commands run and highlight any migrations or Supabase changes.

## Security & Configuration Tips
- Store secrets in `.env` and avoid committing credentials.
- If you touch Supabase schema or functions, regenerate types and mention the changes in the PR.
