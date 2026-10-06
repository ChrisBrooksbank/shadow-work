import { useCallback, useEffect, useState } from 'react';

// ─── Constants ─────────────────────────────────────────────────────────────────

const SETTINGS_KEY = 'shadow:notification-settings';
/** Fired on window whenever settings are written, so the app-level scheduler can resync. */
const SETTINGS_CHANGED_EVENT = 'shadow:notification-settings-changed';
const NOTIFICATION_TITLE = 'Shadow Work';

const ONE_LINERS = [
  'Your shadow has something to show you today.',
  'What are you avoiding? It is time to look.',
  'The parts of you left in the dark are calling.',
  'Your unexamined self is waiting.',
  'Growth lives where comfort ends.',
  'What would you see if you looked within?',
  'The shadow knows what the ego denies.',
  'Every avoided feeling is a missed opportunity.',
  "Today's practice: meet yourself honestly.",
  'What you resist persists. Ready to look?',
  'Integration begins with honest observation.',
  'The wound is the place where the light enters.',
];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM" in 24-hour local time
}

export interface UseNotificationsReturn {
  /** Current Notification API permission state. */
  permission: NotificationPermission;
  /** Whether the daily reminder is enabled. */
  enabled: boolean;
  /** Reminder time as "HH:MM" string (24-hour). */
  reminderTime: string;
  /** Request browser notification permission (explains purpose first). */
  requestPermission: () => Promise<void>;
  /** Enable or disable the daily reminder. */
  setEnabled: (enabled: boolean) => void;
  /** Set the reminder time as "HH:MM" string. */
  setReminderTime: (time: string) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function readSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as NotificationSettings;
  } catch {
    // ignore
  }
  return { enabled: false, time: '20:00' };
}

function writeSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (private browsing etc.)
  }
  window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));
}

function currentPermission(): NotificationPermission {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
}

/**
 * Show the daily reminder. Prefers the service worker registration: on
 * Android Chrome (i.e. the installed PWA) `new Notification()` throws.
 */
function showReminder(): void {
  if (currentPermission() !== 'granted') return;
  const options: NotificationOptions = { body: pickOneLiner(), icon: '/icons/icon-192.png' };

  const fallback = () => {
    try {
      new Notification(NOTIFICATION_TITLE, options);
    } catch {
      // Constructor unsupported on this platform — nothing more we can do
    }
  };

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => (reg ? reg.showNotification(NOTIFICATION_TITLE, options) : fallback()))
      .catch(fallback);
  } else {
    fallback();
  }
}

/** Milliseconds until the next occurrence of "HH:MM" in local time. */
export function msUntilNextOccurrence(time: string, now = new Date()): number {
  const parts = time.split(':').map(Number);
  const h = parts[0] ?? 20;
  const m = parts[1] ?? 0;
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

/** Pick a random one-liner for the notification body. */
export function pickOneLiner(): string {
  return (
    ONE_LINERS[Math.floor(Math.random() * ONE_LINERS.length)] ??
    'Your shadow has something to show you today.'
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>(currentPermission);

  const [settings, setSettings] = useState<NotificationSettings>(readSettings);

  // ── Public API ────────────────────────────────────────────────────────────

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  // Write outside the state updater: writeSettings notifies the app-level
  // scheduler, which must not be updated while React is rendering.
  const setEnabled = useCallback((enabled: boolean) => {
    const next = { ...readSettings(), enabled };
    writeSettings(next);
    setSettings(next);
  }, []);

  const setReminderTime = useCallback((time: string) => {
    const next = { ...readSettings(), time };
    writeSettings(next);
    setSettings(next);
  }, []);

  return {
    permission,
    enabled: settings.enabled,
    reminderTime: settings.time,
    requestPermission,
    setEnabled,
    setReminderTime,
  };
}

/**
 * Schedules the daily reminder. Mount once at the app root so reminders fire
 * wherever the user is in the app, not only while the Settings page is open.
 */
export function useReminderScheduler(): void {
  const [settings, setSettings] = useState<NotificationSettings>(readSettings);
  const [permission, setPermission] = useState<NotificationPermission>(currentPermission);

  useEffect(() => {
    const sync = () => {
      setSettings(readSettings());
      setPermission(currentPermission());
    };
    window.addEventListener(SETTINGS_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SETTINGS_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (!settings.enabled || permission !== 'granted') return;

    let timer: ReturnType<typeof setTimeout>;
    function schedule(from: Date) {
      timer = setTimeout(
        () => {
          showReminder();
          // Schedule from a minute past the reminder so a timer that fires a
          // hair early can't trigger a duplicate; also stays correct across DST.
          schedule(new Date(Date.now() + 60_000));
        },
        from.getTime() - Date.now() + msUntilNextOccurrence(settings.time, from),
      );
    }
    schedule(new Date());

    return () => clearTimeout(timer);
  }, [settings.enabled, settings.time, permission]);
}
