import { useInstallPrompt } from '../hooks/useInstallPrompt';
import styles from './InstallPrompt.module.css';

interface InstallPromptProps {
  /** Number of check-ins the user has completed. Prompt shows only when ≥ 1. */
  checkInCount: number;
}

/**
 * A non-blocking bottom banner that invites the user to install the PWA.
 * Only appears when the browser signals installability AND the user has
 * completed onboarding + at least one check-in. Permanently dismissible.
 */
export default function InstallPrompt({ checkInCount }: InstallPromptProps) {
  const { isInstallable, isDismissed, triggerInstall, dismiss } = useInstallPrompt();

  const shouldShow = isInstallable && !isDismissed && checkInCount >= 1;
  if (!shouldShow) return null;

  return (
    <div className={styles.banner} role="complementary" aria-label="Install app">
      <div className={styles.card}>
        <span className={styles.icon} aria-hidden="true">
          ◈
        </span>
        <div className={styles.text}>
          <p className={styles.title}>Add to home screen</p>
          <p className={styles.subtitle}>Access your shadow work offline, any time.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.installBtn} onClick={() => void triggerInstall()}>
            Install
          </button>
          <button
            className={styles.dismissBtn}
            onClick={dismiss}
            aria-label="Dismiss install prompt"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
