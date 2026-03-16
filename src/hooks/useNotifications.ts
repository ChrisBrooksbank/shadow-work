import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Constants ─────────────────────────────────────────────────────────────────

const SETTINGS_KEY = 'shadow:notification-settings';

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
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  });

  const [settings, setSettings] = useState<NotificationSettings>(readSettings);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Schedule / cancel daily notification timer ────────────────────────────
  useEffect(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!settings.enabled || permission !== 'granted') return;

    function fire() {
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        new Notification('Shadow Work', {
          body: pickOneLiner(),
          icon: '/icons/icon-192.png',
        });
      }
      // Reschedule for exactly 24 hours later
      timerRef.current = setTimeout(fire, 24 * 60 * 60 * 1000);
    }

    const delay = msUntilNextOccurrence(settings.time);
    timerRef.current = setTimeout(fire, delay);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [settings.enabled, settings.time, permission]);

  // ── Public API ────────────────────────────────────────────────────────────

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, enabled };
      writeSettings(next);
      return next;
    });
  }, []);

  const setReminderTime = useCallback((time: string) => {
    setSettings((prev) => {
      const next = { ...prev, time };
      writeSettings(next);
      return next;
    });
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
