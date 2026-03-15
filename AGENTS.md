# AGENTS.md - Operational Guide

Keep this file under 60 lines. It's loaded every iteration.

## Build Commands

```bash
npm run dev            # Vite dev server
npx tsc --noEmit       # Type check only
```

## Test Commands

```bash
npm test               # Vitest watch mode
npm run test:run       # Vitest single run
npm run test:coverage  # Coverage report
npm run test:e2e       # Playwright end-to-end
```

## Validation (run before committing)

```bash
npm run check          # Runs: typecheck + lint + format:check + test:run
```

## Lint & Format

```bash
npm run lint           # ESLint check
npm run lint:fix       # ESLint auto-fix
npm run format         # Prettier write
npm run format:check   # Prettier check
npm run knip           # Dead code detection
```

## Stack

- React 19 + TypeScript + Vite 8
- Vitest for unit tests, Playwright for e2e
- ESLint + Prettier + Husky pre-commit hooks
- Mobile-first PWA, fully client-side (IndexedDB)

## Project Notes

- Dark theme only — true black (#000) backgrounds
- All data stays local (no backend, no cloud)
- Reference plan.md for full architecture and data model
- Reference research.md for shadow work content/exercises
