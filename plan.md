# Shadow PWA — Implementation Plan

## Context

Build a mobile-first PWA for exploring the Jungian shadow self. Edgy, visceral, deeply personal — not a self-help app, not academic. The repo has a comprehensive `research.md` with all the source material. Stack: React + Vite + TypeScript, fully client-side (IndexedDB), dark & moody aesthetic.

---

## Project Structure

```
C:\code\shadow\
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   ├── icons/                      # PWA icons (192, 512, maskable)
│   └── fonts/                      # Self-hosted (Space Grotesk, Space Mono)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── ui/                     # Button, Card, Modal, TextArea, ProgressBar
│   │   ├── layout/                 # Shell, BottomNav, PageTransition, SafeArea
│   │   ├── exercises/              # ExerciseShell, StepFlow, PromptCard, TimerRing
│   │   └── daily/                  # CheckInCard, StreakDisplay, MoodSelector
│   ├── pages/
│   │   ├── Home.tsx                # Daily dashboard
│   │   ├── DailyCheckIn.tsx        # 4-step check-in
│   │   ├── Exercises.tsx           # Exercise library grid
│   │   ├── ExerciseSession.tsx     # Guided exercise flow
│   │   ├── Journal.tsx             # Entry list
│   │   ├── JournalEntry.tsx        # Write/view entry
│   │   ├── Progress.tsx            # Streaks, stats, heatmap
│   │   ├── Learn.tsx               # Concept grid
│   │   ├── LearnTopic.tsx          # Single concept
│   │   ├── Settings.tsx            # Export, notifications, reset
│   │   └── Onboarding.tsx          # First-launch experience
│   ├── data/
│   │   ├── exercises.ts            # Exercise definitions with steps
│   │   ├── prompts.ts              # Journal prompt pools
│   │   ├── concepts.ts             # Learn content (rewritten from research.md)
│   │   ├── daily-questions.ts      # Daily shadow question pool
│   │   └── safety.ts               # Disclaimers, grounding techniques
│   ├── db/
│   │   ├── index.ts                # Dexie database instance
│   │   ├── schema.ts               # Table definitions
│   │   └── hooks.ts                # useJournalEntries, useStreak, etc.
│   ├── stores/
│   │   └── app-store.ts            # Zustand for transient UI state
│   ├── hooks/
│   │   ├── useExerciseFlow.ts      # Exercise state machine
│   │   ├── useNotifications.ts     # Local notification scheduling
│   │   └── useInstallPrompt.ts     # PWA install prompt
│   ├── lib/
│   │   ├── streak.ts               # Streak calculation
│   │   └── haptics.ts              # Vibration API wrappers
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       ├── tokens.css              # Design tokens
│       ├── glitch.css              # Glitch animations
│       └── typography.css          # Font faces, type scale
```

## Dependencies

- **react**, **react-dom** 18.x — UI framework
- **typescript** ~5.4
- **vite** 5.x + **@vitejs/plugin-react-swc** — build tool
- **vite-plugin-pwa** — service worker + manifest generation
- **react-router-dom** 6.x — routing
- **zustand** — lightweight state for transient UI
- **dexie** + **dexie-react-hooks** — typed IndexedDB with reactive queries
- **framer-motion** — page transitions, reveals, exercise step animations
- **date-fns** — date math for streaks/calendar
- **nanoid** — ID generation

~10 runtime deps total. Intentionally minimal.

## Routing

```
/                  → Home (daily dashboard)
/check-in          → DailyCheckIn
/exercises         → Exercise library
/exercises/:id     → ExerciseSession (guided flow)
/journal           → Journal list
/journal/new       → New entry (optional prompt)
/journal/:id       → View/edit entry
/progress          → Streaks, stats, heatmap
/learn             → Concept grid
/learn/:slug       → Topic deep-dive
/settings          → Settings
/onboarding        → First launch only
```

Bottom nav: **Home** | **Exercises** | **Journal** | **Profile** (progress + settings)

## Data Model (IndexedDB via Dexie)

| Table                 | Key Fields                                                                     | Purpose                  |
| --------------------- | ------------------------------------------------------------------------------ | ------------------------ |
| `journalEntries`      | id, content, prompt?, exerciseId?, tags[], createdAt                           | All journal writing      |
| `exerciseCompletions` | id, exerciseId, responses{}, completedAt, durationSeconds                      | Exercise session records |
| `dailyCheckIns`       | id, &date (unique), presenceLevel, emotion, triggered, triggerNote?            | One per day              |
| `triggerLogs`         | id, situation, emotion, intensity (1-10), bodyLocation?, shadowInsight?        | Trigger tracking         |
| `dreamEntries`        | id, content, figures[], emotions[], analysisNotes?                             | Dream journal            |
| `userSettings`        | key ('settings'), onboardingComplete, notificationsEnabled, reminderTime?      | App config               |
| `streaks`             | key ('current'), currentStreak, longestStreak, lastActiveDate, totalActiveDays | Streak state             |

## Exercise System

### 7 Exercise Types (from research.md)

1. **Shadow Journaling** — prompted writing from 4 prompt pools (projection, childhood, self-examination, integration)
2. **The 3-2-1 Process** — guided 3-step: 3rd person → 2nd person → 1st person
3. **Inner Child Work** — visualization + letter writing
4. **Active Imagination** — guided meditation + freewrite recording
5. **Mirror Work** — prompted self-confrontation sequence
6. **Trigger Tracking** — structured logging with pattern analysis
7. **Dream Work** — dream journal + analysis prompts

### Exercise Data Structure

Each exercise has: id, title, tagline, description, category, stage (recognition/encounter/dialogue/integration/ongoing), estimatedMinutes, depth (surface/deep/abyss), and an array of steps.

Step types: `instruction` | `prompt` | `freewrite` | `timed-pause` | `choice` | `reflection`

### Guided Flow (`useExerciseFlow`)

State machine: `intro → safety-check (abyss only) → step[0..n] → reflection → complete`

- One concept/prompt/action per screen — never walls of text
- Timed pauses: screen dims, SVG ring fills, gentle vibration when done
- On completion: bundle responses, offer "Save reflections?" → auto-creates journal entry

## Daily Practice System

### Check-In (< 2 minutes)

1. "How present do you feel?" — 1-5 abstract scale
2. "What emotion is closest to the surface?" — curated emotion grid
3. "Did anything trigger you today?" — yes/no + optional text
4. "One thing you noticed about yourself" — optional freewrite
5. Completion — rotating shadow quote, subtle fade. No confetti.

### Streaks

A day counts if: check-in OR journal entry OR exercise completed. On broken streak: _"You were away. The shadow waited. Welcome back."_ — no guilt mechanics.

### Notifications

Service worker scheduled local notifications. Rotating provocative one-liners: _"Your shadow has something to show you today."_

## UI/UX Direction

### Design Tokens

- **Backgrounds**: true black (`#000`), near-black cards (`#0a0a0a`, `#141414`)
- **Accents**: deep arterial red (`#8b1a1a`), ember (`#c0392b`), bruise purple (`#4a1942`)
- **Text**: warm bone white (`#e8e0d4`), ash gray (`#7a7a72`)
- **Fonts**: Space Grotesk (body), Space Mono (quotes, timestamps, glitch text)

### Key UX Patterns

- **Glitch effects** (CSS-only) — on app title, exercise transitions, daily question. Represents the persona cracking.
- **Timed pauses** — force sitting with discomfort. Slowly filling ring.
- **The void as aesthetic** — dark screen, single question, intentional emptiness mirrors looking inward.
- **Full-screen exercise modals** — total immersion, no distractions.
- **Haptic feedback** — vibration on step completion, streak milestones.
- **Privacy as feature** — no accounts, no cloud. Feels like a locked journal.
- **Depth levels** — surface / deep / abyss. Abyss exercises show safety check first.

### Mobile Specifics

- Bottom nav 56px, haptic on tap
- `env(safe-area-inset-bottom)` for notched phones
- Hide bottom nav when textarea focused (maximize writing space)
- `<meta name="color-scheme" content="dark">` for dark keyboard
- Portrait orientation lock in manifest

## Implementation Phases

### Phase 1: Foundation

- Scaffold Vite + React + TS, install deps, configure PWA plugin
- Design tokens, typography, global styles, glitch CSS
- Dexie DB instance + all table schemas
- Layout shell, bottom nav, routing
- Basic UI primitives (Button, Card, TextArea, Modal)
- **Ship**: App runs, navigates, dark theme renders, DB initializes

### Phase 2: Daily Practice Core

- DailyCheckIn page (4-step flow)
- Streak logic + StreakDisplay with ember animation
- Home page — daily question, streak, check-in status, quick actions
- DB hooks: useStreak(), useTodaysCheckIn(), useRecentActivity()

### Phase 3: Journal System

- Journal list page with date grouping
- JournalEntry write/view page with auto-save
- Prompt rotation system (avoids recently shown)
- Populate prompts.ts from research.md

### Phase 4: Exercise Engine

- useExerciseFlow state machine
- ExerciseShell + step renderers (instruction, prompt, freewrite, timed-pause, choice, reflection)
- TimerRing SVG component
- Populate exercises.ts — all 7 types with multiple prompt variants
- Exercise completion → optional journal entry save
- Exercises library page

### Phase 5: Specialized Exercises

- Trigger Tracking + pattern analysis
- Dream Work + DreamEntry storage
- Inner Child, Active Imagination, Mirror Work guided flows
- Safety disclaimers for depth exercises

### Phase 6: Learn Section

- Rewrite research.md content in direct 2nd-person tone
- Learn grid + LearnTopic pages
- Contextual exercise links from each topic

### Phase 7: Progress & Analytics

- Calendar heatmap (custom component)
- Streak stats, exercise completion counts
- Most common trigger emotions, stage progress mapping

### Phase 8: Onboarding & Polish

- 3-4 swipeable intro cards with framer-motion
- Page transitions (AnimatePresence)
- Glitch effects, haptic feedback
- Settings page (data export/import JSON, crisis resources)

### Phase 9: PWA & Notifications

- Verify offline works end-to-end
- Custom install prompt (after onboarding + first check-in)
- Notification scheduling via service worker
- Real device testing (iOS Safari, Android Chrome)

### Phase 10: Testing & Edge Cases

- All exercises end-to-end on mobile
- Midnight streak edge cases, timezone handling
- Lighthouse audit, bundle size
- Accessibility: focus management, ARIA, color contrast (WCAG AA)

## Verification

- `npm run dev` — app loads, dark theme, all routes work
- Complete onboarding flow on mobile viewport
- Do a daily check-in → verify streak increments on Home
- Write a journal entry with prompt → verify auto-save and list display
- Complete a 3-2-1 Process exercise → save reflections → appears in journal
- Kill dev server → verify app loads offline (service worker)
- Run Lighthouse → PWA score, accessibility score
- Test install prompt on Android Chrome
