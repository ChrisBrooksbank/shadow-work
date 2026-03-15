# Phase 2: Daily Practice Core

## Overview

Build the daily check-in flow, streak system, and home dashboard — the daily loop that keeps users returning.

## Requirements

- [ ] DailyCheckIn page — 4-step guided flow:
  1. "How present do you feel?" — 1-5 abstract scale
  2. "What emotion is closest to the surface?" — curated emotion grid
  3. "Did anything trigger you today?" — yes/no + optional text
  4. "One thing you noticed about yourself" — optional freewrite
  5. Completion screen — rotating shadow quote, subtle fade (no confetti)
- [ ] Store check-in in IndexedDB (dailyCheckIns table, unique by date)
- [ ] Streak logic (streak.ts): a day counts if check-in OR journal entry OR exercise completed
- [ ] StreakDisplay component with ember animation
- [ ] Broken streak message: "You were away. The shadow waited. Welcome back." — no guilt
- [ ] Home page dashboard:
  - Daily shadow question (from daily-questions.ts pool)
  - Current streak display
  - Today's check-in status (done/not done)
  - Quick action buttons (check-in, journal, exercise)
  - Recent activity feed
- [ ] DB hooks: useStreak(), useTodaysCheckIn(), useRecentActivity()
- [ ] Daily question pool (daily-questions.ts) — provocative shadow questions
- [ ] Glitch effect on the daily question text

## Acceptance Criteria

- [ ] Complete a check-in flow end-to-end, data persists in IndexedDB
- [ ] Streak increments after check-in
- [ ] Home page shows current streak and check-in status
- [ ] Daily question rotates (doesn't repeat recently shown)
- [ ] Broken streak shows compassionate message, not guilt

## Out of Scope

- Journal entries contributing to streaks (Phase 3)
- Exercise completions contributing to streaks (Phase 4)
- Notifications (Phase 9)
