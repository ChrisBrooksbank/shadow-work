import { useEffect, useState, useCallback } from 'react';

const DISMISSED_KEY = 'shadow:install-prompt-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface UseInstallPromptReturn {
  /** True when the browser has fired beforeinstallprompt (app is installable). */
  isInstallable: boolean;
  /** True when the user has permanently dismissed the prompt. */
  isDismissed: boolean;
  /** Trigger the native install flow; resolves when the user responds. */
  triggerInstall: () => Promise<void>;
  /** Dismiss and remember the choice so the prompt never nags again. */
  dismiss: () => void;
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app is already installed, clean up any stored state.
    function handleAppInstalled() {
      setDeferredEvent(null);
    }
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;
    if (outcome === 'accepted') {
      setDeferredEvent(null);
    }
    // Whether accepted or dismissed, stop showing prompt.
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, 'true');
    } catch {
      // localStorage may be unavailable in private browsing.
    }
  }, [deferredEvent]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  return {
    isInstallable: deferredEvent !== null,
    isDismissed,
    triggerInstall,
    dismiss,
  };
}
