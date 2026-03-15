# Phase 1: Foundation

## Overview

Scaffold the core app shell — Vite + React + TypeScript, design system, database, routing, and base UI components.

## Requirements

- [ ] Vite + React + TypeScript project with SWC plugin
- [ ] Install runtime deps: react-router-dom, zustand, dexie, dexie-react-hooks, framer-motion, date-fns, nanoid, vite-plugin-pwa
- [ ] Design tokens in CSS custom properties (tokens.css): backgrounds (#000, #0a0a0a, #141414), accents (#8b1a1a, #c0392b, #4a1942), text (#e8e0d4, #7a7a72)
- [ ] Typography setup (typography.css): Space Grotesk (body), Space Mono (quotes/timestamps/glitch)
- [ ] Self-host fonts in public/fonts/
- [ ] Glitch CSS animations (glitch.css) for persona-cracking effects
- [ ] Global styles (index.css): dark theme, box-sizing, smooth scrolling
- [ ] `<meta name="color-scheme" content="dark">` for dark keyboard on mobile
- [ ] Dexie database instance with all table schemas (journalEntries, exerciseCompletions, dailyCheckIns, triggerLogs, dreamEntries, userSettings, streaks)
- [ ] React Router setup with all routes per plan.md routing table
- [ ] Layout shell component with bottom nav (Home | Exercises | Journal | Profile)
- [ ] Bottom nav: 56px height, haptic on tap, env(safe-area-inset-bottom) padding
- [ ] Hide bottom nav when textarea is focused
- [ ] UI primitives: Button, Card, TextArea, Modal, ProgressBar
- [ ] SafeArea wrapper component for notched phones
- [ ] PageTransition component using framer-motion AnimatePresence
- [ ] PWA manifest via vite-plugin-pwa (portrait lock, dark theme)

## Acceptance Criteria

- [ ] `npm run dev` starts the app with dark theme on all routes
- [ ] Bottom nav navigates between sections
- [ ] Database initializes without errors
- [ ] `npm run check` passes (typecheck + lint + format + tests)
- [ ] App renders correctly in mobile viewport (375px width)

## Out of Scope

- Page content beyond placeholder text
- Any data entry or persistence features
- Service worker / offline functionality (Phase 9)
