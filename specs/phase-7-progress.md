# Phase 7: Progress & Analytics

## Overview

Visual progress tracking — streaks, heatmaps, and practice statistics to show the user their journey.

## Requirements

- [ ] Progress page with:
  - Current streak + longest streak display
  - Total active days count
  - Calendar heatmap (custom component, not a library)
    - Shows activity density per day
    - Color scale from dark to ember red
    - Scrollable by month
  - Exercise completion counts by type
  - Most practiced exercise type
- [ ] Trigger analytics (if trigger logs exist):
  - Most common trigger emotions (bar chart or ranked list)
  - Average intensity over time (trend line or simple display)
  - Most common body locations
- [ ] Stage progress mapping:
  - Show which shadow work stages user has engaged with (recognition → encounter → dialogue → integration)
  - Based on exercise completions by stage
- [ ] Journal entry count and writing streak
- [ ] All stats derived from IndexedDB data — no separate analytics store

## Acceptance Criteria

- [ ] Heatmap renders with real activity data
- [ ] Streak numbers match actual activity
- [ ] Exercise stats reflect actual completions
- [ ] Page loads quickly even with many entries
- [ ] Empty state is handled gracefully (new users see encouraging message, not empty charts)

## Out of Scope

- Data export (Phase 8)
- Comparative analytics or benchmarks
- AI-generated insights
