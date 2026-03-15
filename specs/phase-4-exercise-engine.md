# Phase 4: Exercise Engine

## Overview

Build the core exercise state machine and step renderers — the guided experience framework that all exercises use.

## Requirements

- [ ] useExerciseFlow hook — state machine: `intro → safety-check (abyss only) → step[0..n] → reflection → complete`
- [ ] ExerciseShell component — full-screen modal, total immersion, no distractions
- [ ] Step renderer components:
  - `instruction` — read-only text with "Continue" button
  - `prompt` — question display with response textarea
  - `freewrite` — open textarea with optional timer
  - `timed-pause` — screen dims, TimerRing SVG fills, gentle vibration when done
  - `choice` — multiple choice selection
  - `reflection` — summary of responses with final thoughts textarea
- [ ] TimerRing SVG component — circular progress ring that fills over duration
- [ ] Exercise data structure in exercises.ts:
  - id, title, tagline, description, category, stage (recognition/encounter/dialogue/integration/ongoing)
  - estimatedMinutes, depth (surface/deep/abyss)
  - Array of steps with type and content
- [ ] Populate exercises.ts with all 7 exercise types:
  1. Shadow Journaling — 4 prompt pools
  2. The 3-2-1 Process — 3rd person → 2nd person → 1st person
  3. Inner Child Work — visualization + letter writing
  4. Active Imagination — guided meditation + freewrite
  5. Mirror Work — prompted self-confrontation
  6. Trigger Tracking — structured logging
  7. Dream Work — dream journal + analysis
- [ ] On completion: bundle responses, offer "Save reflections?" → auto-create journal entry
- [ ] Store completion in exerciseCompletions table
- [ ] Exercise completions count toward daily streak
- [ ] Exercises library page — grid of available exercises with depth/stage/duration metadata
- [ ] Depth level badges: surface / deep / abyss
- [ ] Safety disclaimer screen for abyss-depth exercises
- [ ] Haptic feedback on step completion

## Acceptance Criteria

- [ ] Complete a 3-2-1 Process exercise end-to-end
- [ ] TimerRing fills smoothly during timed pauses
- [ ] Save reflections creates a linked journal entry
- [ ] Exercise library shows all 7 types with metadata
- [ ] Abyss exercises show safety check before starting
- [ ] Exercise completion increments streak

## Out of Scope

- Trigger pattern analysis (Phase 5)
- Dream figure tracking (Phase 5)
