import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useInstallPrompt } from './useInstallPrompt';

// ── helpers ────────────────────────────────────────────────────────────────────

function makeDeferredEvent(outcome: 'accepted' | 'dismissed' = 'accepted') {
  return {
    preventDefault: vi.fn(),
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome }),
  };
}

// ── localStorage setup ────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── tests ──────────────────────────────────────────────────────────────────────

test('isInstallable is false initially', () => {
  const { result } = renderHook(() => useInstallPrompt());
  expect(result.current.isInstallable).toBe(false);
});

test('isDismissed is false when localStorage is empty', () => {
  const { result } = renderHook(() => useInstallPrompt());
  expect(result.current.isDismissed).toBe(false);
});

test('isDismissed is true when localStorage flag is set', () => {
  localStorage.setItem('shadow:install-prompt-dismissed', 'true');
  const { result } = renderHook(() => useInstallPrompt());
  expect(result.current.isDismissed).toBe(true);
});

test('isInstallable becomes true after beforeinstallprompt fires', () => {
  const { result } = renderHook(() => useInstallPrompt());

  act(() => {
    const event = Object.assign(new Event('beforeinstallprompt'), makeDeferredEvent());
    window.dispatchEvent(event);
  });

  expect(result.current.isInstallable).toBe(true);
});

test('dismiss sets isDismissed to true and persists to localStorage', () => {
  const { result } = renderHook(() => useInstallPrompt());

  act(() => {
    result.current.dismiss();
  });

  expect(result.current.isDismissed).toBe(true);
  expect(localStorage.getItem('shadow:install-prompt-dismissed')).toBe('true');
});

test('triggerInstall is a no-op when no deferred event exists', async () => {
  const { result } = renderHook(() => useInstallPrompt());
  // Should not throw.
  await act(async () => {
    await result.current.triggerInstall();
  });
  expect(result.current.isInstallable).toBe(false);
});

test('triggerInstall calls prompt and sets dismissed on accepted', async () => {
  const { result } = renderHook(() => useInstallPrompt());
  const deferredEvent = makeDeferredEvent('accepted');

  act(() => {
    const event = Object.assign(new Event('beforeinstallprompt'), deferredEvent);
    window.dispatchEvent(event);
  });

  await act(async () => {
    await result.current.triggerInstall();
  });

  expect(deferredEvent.prompt).toHaveBeenCalledOnce();
  expect(result.current.isDismissed).toBe(true);
  expect(localStorage.getItem('shadow:install-prompt-dismissed')).toBe('true');
});

test('appinstalled event clears the deferred event', () => {
  const { result } = renderHook(() => useInstallPrompt());

  act(() => {
    const event = Object.assign(new Event('beforeinstallprompt'), makeDeferredEvent());
    window.dispatchEvent(event);
  });

  expect(result.current.isInstallable).toBe(true);

  act(() => {
    window.dispatchEvent(new Event('appinstalled'));
  });

  expect(result.current.isInstallable).toBe(false);
});
