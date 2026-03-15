# Phase 8: Onboarding & Polish

## Overview

First-launch experience, page transitions, visual polish, and settings page.

## Requirements

- [ ] Onboarding flow (3-4 swipeable cards with framer-motion):
  - Introduce shadow work concept (not academic — visceral)
  - Explain what the app does
  - Privacy promise ("Your data never leaves this device")
  - "Begin" button that marks onboarding complete in userSettings
- [ ] Redirect to /onboarding on first launch (onboardingComplete === false)
- [ ] Page transitions using framer-motion AnimatePresence:
  - Subtle slide/fade between pages
  - Exercise entry: dramatic reveal
- [ ] Glitch effects polish:
  - App title glitch on home
  - Exercise transition glitch
  - Daily question glitch text
- [ ] Haptic feedback:
  - Step completion vibration
  - Streak milestone vibration
  - Bottom nav tap
- [ ] Settings page:
  - Data export (JSON download of all IndexedDB tables)
  - Data import (JSON upload, merge or replace)
  - Clear all data (with confirmation)
  - Crisis resources / mental health disclaimer
  - App version display
- [ ] Portrait orientation lock in PWA manifest

## Acceptance Criteria

- [ ] First launch shows onboarding, subsequent launches go to Home
- [ ] Page transitions are smooth, not jarring
- [ ] Glitch effects work on mobile without performance issues
- [ ] Data export produces valid JSON that can be re-imported
- [ ] Settings clear-all requires confirmation and works completely

## Out of Scope

- Account creation or cloud sync
- Theme customization (dark only)
