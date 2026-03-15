# Phase 9: PWA & Notifications

## Overview

Offline support, install prompt, and local push notifications for daily reminders.

## Requirements

- [ ] Service worker via vite-plugin-pwa:
  - Cache app shell and assets for offline use
  - Runtime caching strategy for fonts
  - Verify full offline functionality
- [ ] Custom install prompt:
  - Show after onboarding + first check-in (not immediately)
  - useInstallPrompt hook to capture beforeinstallprompt event
  - Dismissible, doesn't nag
- [ ] PWA icons:
  - 192x192 and 512x512 PNG icons
  - Maskable icon variant
  - Store in public/icons/
- [ ] Local push notifications:
  - Request permission (explain why first)
  - useNotifications hook for scheduling
  - Daily reminder at user-configured time (default: evening)
  - Rotating provocative one-liners: "Your shadow has something to show you today."
  - Notification tap opens app to Home
- [ ] Notification settings in Settings page:
  - Enable/disable toggle
  - Reminder time picker
- [ ] Real device testing checklist:
  - iOS Safari: verify install, offline, notifications (limited)
  - Android Chrome: verify install, offline, notifications
  - Lighthouse PWA audit score

## Acceptance Criteria

- [ ] App loads fully offline after first visit
- [ ] Install prompt appears at the right time, not before
- [ ] Notifications fire at scheduled time with rotating messages
- [ ] Lighthouse PWA score is green
- [ ] Icons display correctly on both iOS and Android home screens

## Out of Scope

- Background sync
- Push notifications via server (local only)
- App store distribution
