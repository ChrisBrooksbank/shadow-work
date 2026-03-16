import { Link } from 'react-router-dom';
import { useDreamEntries } from '../db/hooks';
import styles from './DreamJournal.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10 3L5 8L10 13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DreamJournal() {
  const entries = useDreamEntries();

  if (entries === undefined) {
    return (
      <main className={styles.page}>
        <p className={styles.subtitle}>Loading…</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Link to="/exercises" className={styles.backLink}>
          <BackArrow />
          Exercises
        </Link>
        <h1 className={styles.title}>Dream Journal</h1>
        <p className={styles.subtitle}>
          {entries.length === 0
            ? 'Complete a Dream Work session to begin your dream journal.'
            : `${entries.length} dream${entries.length === 1 ? '' : 's'} recorded.`}
        </p>
      </div>

      {entries.length === 0 ? (
        <div className={styles.nudge}>
          <p className={styles.nudgeIcon}>◑</p>
          <p className={styles.nudgeTitle}>No dreams recorded yet</p>
          <p className={styles.nudgeBody}>
            Complete the Dream Work exercise to start mapping your nightly shadow transmissions.
          </p>
        </div>
      ) : (
        <div className={styles.entryList}>
          {entries.map((entry) => (
            <div key={entry.id} className={styles.entryCard}>
              <div className={styles.entryTop}>
                <span className={styles.entryDate}>{formatDate(entry.createdAt)}</span>
              </div>

              {entry.content && <p className={styles.entryContent}>{entry.content}</p>}

              {entry.figures.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel}>Figures</span>
                  <div className={styles.tags}>
                    {entry.figures.map((figure) => (
                      <span key={figure} className={styles.tag}>
                        {figure}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {entry.emotions.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel}>Emotions</span>
                  <div className={styles.tags}>
                    {entry.emotions.map((emotion) => (
                      <span key={emotion} className={`${styles.tag} ${styles.tagEmotion}`}>
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {entry.analysisNotes && <p className={styles.entryAnalysis}>{entry.analysisNotes}</p>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
