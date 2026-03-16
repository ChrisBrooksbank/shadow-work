import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { msUntilNextOccurrence, pickOneLiner, useNotifications } from './useNotifications';

// ── Notification mock ──────────────────────────────────────────────────────────

const mockNotificationConstructor = vi.fn();

function setupNotificationMock(
  permission: NotificationPermission = 'default',
  requestResult: NotificationPermission = 'granted',
) {
  const MockNotification = Object.assign(mockNotificationConstructor, {
    permission,
    requestPermission: vi.fn().mockResolvedValue(requestResult),
  });

  Object.defineProperty(window, 'Notification', {
    value: MockNotification,
    writable: true,
    configurable: true,
  });
}

// ── Setup / Teardown ───────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  mockNotificationConstructor.mockClear();
  vi.useFakeTimers();
  setupNotificationMock();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
});

// ── msUntilNextOccurrence ──────────────────────────────────────────────────────

describe('msUntilNextOccurrence', () => {
  test('returns positive ms when target is later today', () => {
    const now = new Date('2026-03-16T10:00:00');
    const ms = msUntilNextOccurrence('20:00', now);
    // 10 hours = 36000000 ms
    expect(ms).toBe(10 * 60 * 60 * 1000);
  });

  test('rolls over to tomorrow when target has already passed today', () => {
    const now = new Date('2026-03-16T21:00:00');
    const ms = msUntilNextOccurrence('20:00', now);
    // 23 hours until 20:00 next day
    expect(ms).toBe(23 * 60 * 60 * 1000);
  });

  test('rolls over when target is the same minute (already past)', () => {
    const now = new Date('2026-03-16T20:00:00');
    const ms = msUntilNextOccurrence('20:00', now);
    // Exactly at the boundary — seconds/ms are 0 on both sides
    // target == now → rolls to next day (24h)
    expect(ms).toBe(24 * 60 * 60 * 1000);
  });
});

// ── pickOneLiner ───────────────────────────────────────────────────────────────

test('pickOneLiner returns a non-empty string', () => {
  const result = pickOneLiner();
  expect(typeof result).toBe('string');
  expect(result.length).toBeGreaterThan(0);
});

// ── useNotifications ───────────────────────────────────────────────────────────

describe('useNotifications — initial state', () => {
  test('reads permission from Notification.permission', () => {
    setupNotificationMock('granted');
    const { result } = renderHook(() => useNotifications());
    expect(result.current.permission).toBe('granted');
  });

  test('enabled is false by default', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.enabled).toBe(false);
  });

  test('reminderTime defaults to 20:00', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.reminderTime).toBe('20:00');
  });

  test('reads persisted settings from localStorage', () => {
    localStorage.setItem(
      'shadow:notification-settings',
      JSON.stringify({ enabled: true, time: '09:00' }),
    );
    const { result } = renderHook(() => useNotifications());
    expect(result.current.enabled).toBe(true);
    expect(result.current.reminderTime).toBe('09:00');
  });
});

describe('useNotifications — requestPermission', () => {
  test('calls Notification.requestPermission and updates state', async () => {
    setupNotificationMock('default', 'granted');
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(window.Notification.requestPermission).toHaveBeenCalledOnce();
    expect(result.current.permission).toBe('granted');
  });

  test('updates permission to denied when user denies', async () => {
    setupNotificationMock('default', 'denied');
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.permission).toBe('denied');
  });
});

describe('useNotifications — setEnabled', () => {
  test('updates enabled state', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.setEnabled(true);
    });

    expect(result.current.enabled).toBe(true);
  });

  test('persists enabled to localStorage', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.setEnabled(true);
    });

    const stored = JSON.parse(localStorage.getItem('shadow:notification-settings')!);
    expect(stored.enabled).toBe(true);
  });

  test('can be disabled again', () => {
    localStorage.setItem(
      'shadow:notification-settings',
      JSON.stringify({ enabled: true, time: '20:00' }),
    );
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.setEnabled(false);
    });

    expect(result.current.enabled).toBe(false);
    const stored = JSON.parse(localStorage.getItem('shadow:notification-settings')!);
    expect(stored.enabled).toBe(false);
  });
});

describe('useNotifications — setReminderTime', () => {
  test('updates reminderTime state', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.setReminderTime('08:30');
    });

    expect(result.current.reminderTime).toBe('08:30');
  });

  test('persists reminderTime to localStorage', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.setReminderTime('07:15');
    });

    const stored = JSON.parse(localStorage.getItem('shadow:notification-settings')!);
    expect(stored.time).toBe('07:15');
  });
});

describe('useNotifications — notification scheduling', () => {
  test('does not schedule when disabled', () => {
    setupNotificationMock('granted');
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    renderHook(() => useNotifications());

    // No timer scheduled because enabled is false
    expect(mockNotificationConstructor).not.toHaveBeenCalled();
    // The setTimeout calls from the effect should be 0 because enabled=false
    const notificationTimers = setTimeoutSpy.mock.calls.filter(
      (call) => typeof call[1] === 'number' && (call[1] as number) > 1000,
    );
    expect(notificationTimers).toHaveLength(0);
  });

  test('fires Notification constructor after scheduled delay', () => {
    setupNotificationMock('granted');

    // Set time to something in the future relative to fake timer
    // Fake timers start at 0 epoch by default; we set time to 20:00 today
    // Using a fixed "now" approach: set time to something that's clearly in future
    localStorage.setItem(
      'shadow:notification-settings',
      JSON.stringify({ enabled: true, time: '20:00' }),
    );

    // Set current fake time to 2026-03-16 10:00:00 so 20:00 is 10h away
    vi.setSystemTime(new Date('2026-03-16T10:00:00'));

    renderHook(() => useNotifications());

    // Advance 10 hours = 36000000 ms
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 60 * 1000);
    });

    expect(mockNotificationConstructor).toHaveBeenCalledOnce();
    expect(mockNotificationConstructor).toHaveBeenCalledWith(
      'Shadow Work',
      expect.objectContaining({ icon: '/icons/icon-192.png' }),
    );
  });

  test('does not fire when permission is not granted', () => {
    setupNotificationMock('default'); // not granted

    localStorage.setItem(
      'shadow:notification-settings',
      JSON.stringify({ enabled: true, time: '20:00' }),
    );
    vi.setSystemTime(new Date('2026-03-16T10:00:00'));

    renderHook(() => useNotifications());

    act(() => {
      vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    });

    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  test('clears timer on unmount', () => {
    setupNotificationMock('granted');
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    localStorage.setItem(
      'shadow:notification-settings',
      JSON.stringify({ enabled: true, time: '20:00' }),
    );
    vi.setSystemTime(new Date('2026-03-16T10:00:00'));

    const { unmount } = renderHook(() => useNotifications());
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  test('reschedules 24h after firing', () => {
    setupNotificationMock('granted');

    localStorage.setItem(
      'shadow:notification-settings',
      JSON.stringify({ enabled: true, time: '20:00' }),
    );
    vi.setSystemTime(new Date('2026-03-16T10:00:00'));

    renderHook(() => useNotifications());

    // Fire first notification (10h)
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 60 * 1000);
    });
    expect(mockNotificationConstructor).toHaveBeenCalledTimes(1);

    // Advance another 24h for the next one
    act(() => {
      vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    });
    expect(mockNotificationConstructor).toHaveBeenCalledTimes(2);
  });
});
