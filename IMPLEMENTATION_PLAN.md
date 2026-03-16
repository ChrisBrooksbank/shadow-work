# Implementation Plan

## Status

- Planning iterations: 1
- Build iterations: 0
- Last updated: 2026-03-15

## Tasks

### Phase 1 — Foundation

- [x] Create index.html, vite.config.ts, src/main.tsx, src/App.tsx — bare minimum to run `npm run dev` (spec: phase-1-foundation.md)
- [x] Add CSS design tokens: tokens.css (colors), typography.css (Space Grotesk + Space Mono font-face), index.css (global dark theme resets) (spec: phase-1-foundation.md)
- [x] Self-host fonts: download Space Grotesk + Space Mono woff2 files to public/fonts/ (spec: phase-1-foundation.md)
- [x] Add glitch.css with keyframe animations for persona-cracking glitch effects (spec: phase-1-foundation.md)
- [x] Set up Dexie database: src/db/index.ts + schema.ts with all 7 tables (journalEntries, exerciseCompletions, dailyCheckIns, triggerLogs, dreamEntries, userSettings, streaks) (spec: phase-1-foundation.md)
- [x] Set up React Router in App.tsx with all routes from plan.md routing table (spec: phase-1-foundation.md)
- [x] Build Layout shell + BottomNav component (56px, safe-area inset, hide on textarea focus, haptic on tap) (spec: phase-1-foundation.md)
- [x] Build UI primitives: Button, Card, TextArea, Modal, ProgressBar in src/components/ui/ (spec: phase-1-foundation.md)
- [x] Build SafeArea wrapper + PageTransition component using framer-motion AnimatePresence (spec: phase-1-foundation.md)
- [x] Add vite-plugin-pwa to vite.config.ts with PWA manifest (portrait lock, dark theme, name/icons stubs) (spec: phase-1-foundation.md)
- [x] Add stub page components for all routes so navigation works end-to-end (spec: phase-1-foundation.md)

### Phase 2 — Daily Practice

- [x] Create src/data/daily-questions.ts with 20+ provocative shadow questions (spec: phase-2-daily-practice.md)
- [x] Implement streak.ts logic: a day counts if check-in OR journal entry OR exercise completed (spec: phase-2-daily-practice.md)
- [x] Add DB hooks to src/db/hooks.ts: useStreak(), useTodaysCheckIn(), useRecentActivity() (spec: phase-2-daily-practice.md)
- [x] Build DailyCheckIn page — 4-step guided flow (presence scale → emotion grid → trigger yes/no → freewrite → completion screen with shadow quote) (spec: phase-2-daily-practice.md)
- [x] Build StreakDisplay component with ember/fire animation (spec: phase-2-daily-practice.md)
- [x] Build Home page dashboard: daily question with glitch effect, streak display, check-in status, quick action buttons, recent activity feed (spec: phase-2-daily-practice.md)

### Phase 3 — Journal

- [x] Create src/data/prompts.ts with 4 pool categories (projection, childhood, self-examination, integration) populated from research.md (spec: phase-3-journal.md)
- [x] Build Journal list page with date-grouped entries (spec: phase-3-journal.md)
- [x] Build JournalEntry write/view/edit page: auto-save debounced to IndexedDB, optional prompt at top, tag support, timestamps (spec: phase-3-journal.md)
- [x] Add journal entries to streak calculation; add "New entry" access from Home quick actions (spec: phase-3-journal.md)

### Phase 4 — Exercise Engine

- [x] Create src/data/exercises.ts with data structures and all 7 exercise definitions (Shadow Journaling, 3-2-1 Process, Inner Child Work, Active Imagination, Mirror Work, Trigger Tracking, Dream Work) (spec: phase-4-exercise-engine.md)
- [x] Build useExerciseFlow hook — state machine: intro → safety-check (abyss only) → step[0..n] → reflection → complete (spec: phase-4-exercise-engine.md)
- [x] Build TimerRing SVG component — circular progress ring that fills over duration (spec: phase-4-exercise-engine.md)
- [x] Build step renderer components: instruction, prompt, freewrite, timed-pause, choice, reflection (spec: phase-4-exercise-engine.md)
- [x] Build ExerciseShell component — full-screen modal, immersive layout, depth badges, safety disclaimer for abyss exercises (spec: phase-4-exercise-engine.md)
- [x] Build Exercise library page — grid of all exercises with depth/stage/duration metadata (spec: phase-4-exercise-engine.md)
- [x] On exercise completion: bundle responses, offer "Save reflections?" → auto-create journal entry; store in exerciseCompletions; count toward streak (spec: phase-4-exercise-engine.md)

### Phase 5 — Specialized Exercises

- [x] Create src/data/safety.ts with safety disclaimers and grounding techniques (5-4-3-2-1 sensory, breathing exercise) (spec: phase-5-specialized-exercises.md)
- [x] Trigger Tracking enhancements: structured input form (situation, emotion, intensity, body location, shadow insight), store in triggerLogs, pattern analysis summary (spec: phase-5-specialized-exercises.md)
- [x] Dream Work enhancements: DreamEntry storage in dreamEntries, figure tracking, emotion tagging, analysis notes, dream journal list view (spec: phase-5-specialized-exercises.md)
- [x] Inner Child Work guided flow: visualization prompts step-by-step, letter writing step with save (spec: phase-5-specialized-exercises.md)
- [x] Active Imagination guided flow: meditation timer with ambient state, freewrite recording after meditation (spec: phase-5-specialized-exercises.md)
- [x] Mirror Work guided flow: prompted self-confrontation sequence, timed holds with prompts (spec: phase-5-specialized-exercises.md)
- [x] Surface grounding technique as accessible overlay mid-exercise (spec: phase-5-specialized-exercises.md)

### Phase 6 — Learn

- [x] Create src/data/concepts.ts with all 8 topics (slug, title, summary, body, relatedExerciseIds, readingTime) rewritten from research.md in direct 2nd-person tone (spec: phase-6-learn.md)
- [x] Build Learn grid page — card layout of all topics with summaries (spec: phase-6-learn.md)
- [x] Build LearnTopic page — single topic deep-dive with readable typography, section headings, "Try this exercise" links, "Next topic" navigation (spec: phase-6-learn.md)

### Phase 7 — Progress

- [x] Build Progress page: current streak + longest streak, total active days, exercise completion counts by type, most practiced type (spec: phase-7-progress.md)
- [x] Build custom CalendarHeatmap component — activity density per day, ember red color scale, scrollable by month (spec: phase-7-progress.md)
- [x] Add trigger analytics section: most common emotions, average intensity trend, most common body locations (shown only if trigger logs exist) (spec: phase-7-progress.md)
- [x] Add stage progress mapping: show which shadow work stages user has engaged (based on exercise completions by stage) (spec: phase-7-progress.md)

### Phase 8 — Onboarding & Polish

- [x] Build Onboarding flow: 3-4 swipeable framer-motion cards (intro shadow work, what app does, privacy promise), "Begin" button sets onboardingComplete in userSettings; redirect first-launch to /onboarding (spec: phase-8-onboarding-polish.md)
- [x] Polish page transitions: subtle slide/fade via AnimatePresence, dramatic reveal for exercise entry (spec: phase-8-onboarding-polish.md)
- [x] Polish glitch effects: app title on Home, exercise transitions, daily question text (spec: phase-8-onboarding-polish.md)
- [x] Build Settings page: data export (JSON download), data import (merge/replace), clear all data (with confirmation modal), crisis resources, app version (spec: phase-8-onboarding-polish.md)

### Phase 9 — PWA & Notifications

- [ ] Configure vite-plugin-pwa service worker: cache app shell + assets offline, runtime caching for fonts (spec: phase-9-pwa-notifications.md)
- [ ] Create PWA icons: 192x192, 512x512, maskable variant in public/icons/ (spec: phase-9-pwa-notifications.md)
- [ ] Build useInstallPrompt hook + custom install prompt UI (shows after onboarding + first check-in, dismissible, no nag) (spec: phase-9-pwa-notifications.md)
- [ ] Build useNotifications hook: request permission, schedule daily local push notification at user-configured time with rotating one-liners (spec: phase-9-pwa-notifications.md)
- [ ] Add notification settings to Settings page: enable/disable toggle, reminder time picker (spec: phase-9-pwa-notifications.md)

## Completed

<!-- Completed tasks move here -->

## Notes

- All data is client-side (IndexedDB via Dexie) — no backend, no auth
- Dark theme only; mobile-first at 375px base viewport
- Build one task per iteration; mark complete before moving on
- Phase 1 tasks must be done in order (later tasks depend on earlier ones)
- Fonts: Space Grotesk + Space Mono from Google Fonts or Fontsource; self-host in public/fonts/
- research.md is the source of truth for all shadow work content (prompts, concepts, exercise descriptions)
- plan.md has the full routing table, DB schema, and component tree — consult it when implementing
