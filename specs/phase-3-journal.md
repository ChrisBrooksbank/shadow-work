# Phase 3: Journal System

## Overview

Freeform and prompted journaling with auto-save, the primary tool for shadow exploration.

## Requirements

- [ ] Journal list page with date-grouped entries
- [ ] JournalEntry write page:
  - Rich textarea with auto-save (debounced to IndexedDB)
  - Optional prompt display at top
  - Tag support
  - Created/updated timestamps
- [ ] JournalEntry view/edit page (same component, toggle mode)
- [ ] Prompt rotation system:
  - 4 prompt pools: projection, childhood, self-examination, integration
  - Avoids recently shown prompts
  - "New prompt" button to cycle
- [ ] Populate prompts.ts from research.md content
- [ ] Journal entries count toward daily streak
- [ ] "New entry" accessible from Home quick actions and Journal page
- [ ] Optional: entry created from exercise completion (receives exerciseId + pre-filled content)

## Acceptance Criteria

- [ ] Write a journal entry, close app, reopen — entry persists
- [ ] Auto-save works (no manual save button needed)
- [ ] Prompts rotate without immediate repeats
- [ ] Journal list shows entries grouped by date
- [ ] Writing a journal entry increments the streak

## Out of Scope

- Search/filter within journal entries
- Export (Phase 8 Settings)
- Rich text formatting (keep it plaintext)
