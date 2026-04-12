# CLAUDE.md

## Project Overview

SHADOW — a dark, private PWA for Jungian shadow work. Daily check-ins, guided exercises (journaling, 3-2-1 process, inner child work, active imagination, mirror work, dream work, trigger tracking), and progress tracking. Everything stays on-device.

**Live:** https://shadow-work-app.netlify.app

## Tech Stack

- React 19 + TypeScript
- Vite
- Dexie (IndexedDB for local data)
- Framer Motion (animations)
- CSS Modules
- PWA — offline-first, installable

## Development Commands

```bash
npm install
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run check      # Lint, typecheck, test, format
```

## Architecture

- `src/features/` — Feature modules (check-in, exercises, journal, dreams, triggers, progress)
- `src/db/` — Dexie schema and database operations
- `src/components/` — Shared UI components

## Data Privacy

All user data is stored locally in IndexedDB. No server, no accounts, no analytics, no telemetry. Privacy is architectural, not a policy choice.

## Design Aesthetic

Dark theme. Minimal. Atmospheric. Avoid bright colours, playful fonts, or gamification aesthetics — the app deals with difficult inner material and should feel serious and safe.

## Deployment

Deployed on Netlify. Auto-deploys from main branch.
