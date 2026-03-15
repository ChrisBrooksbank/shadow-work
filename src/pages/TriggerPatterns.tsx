import { Link } from 'react-router-dom';
import { useTriggerPatterns } from '../db/hooks';
import styles from './TriggerPatterns.module.css';

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

export default function TriggerPatterns() {
  const patterns = useTriggerPatterns();

  if (patterns === undefined) {
    return (
      <main className={styles.page}>
        <p className={styles.subtitle}>Loading…</p>
      </main>
    );
  }

  const { totalLogs, emotionCounts, averageIntensity, bodyKeywordCounts, recentLogs } = patterns;

  // Sort emotions by frequency descending
  const sortedEmotions = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a);
  const maxEmotionCount = sortedEmotions[0]?.[1] ?? 1;

  // Sort body keywords by frequency descending, show top 8
  const sortedKeywords = Object.entries(bodyKeywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const minEntriesForPatterns = 3;
  const hasPatterns = totalLogs >= minEntriesForPatterns;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Link to="/exercises" className={styles.backLink}>
          <BackArrow />
          Exercises
        </Link>
        <h1 className={styles.title}>Your Trigger Patterns</h1>
        <p className={styles.subtitle}>
          {totalLogs === 0
            ? 'Complete trigger tracking sessions to see patterns emerge.'
            : `Based on ${totalLogs} trigger log${totalLogs === 1 ? '' : 's'}.`}
        </p>
      </div>

      {totalLogs === 0 ? (
        <div className={styles.nudge}>
          <p className={styles.nudgeIcon}>◈</p>
          <p className={styles.nudgeTitle}>No triggers logged yet</p>
          <p className={styles.nudgeBody}>
            Complete the Trigger Tracking exercise to begin mapping your patterns. Patterns appear
            after {minEntriesForPatterns} or more entries.
          </p>
        </div>
      ) : (
        <>
          {/* ─── Stats ─────────────────────────────────────────────────── */}
          <div className={styles.statRow}>
            <div className={styles.statCard}>
              <p className={styles.statValue}>{totalLogs}</p>
              <p className={styles.statLabel}>Triggers logged</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statValue}>{averageIntensity.toFixed(1)}</p>
              <p className={styles.statLabel}>Avg intensity</p>
            </div>
          </div>

          {/* ─── Emotions ──────────────────────────────────────────────── */}
          {sortedEmotions.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Emotion frequency</p>
              {!hasPatterns && (
                <p className={styles.subtitle}>
                  Log {minEntriesForPatterns - totalLogs} more trigger
                  {minEntriesForPatterns - totalLogs === 1 ? '' : 's'} to see patterns.
                </p>
              )}
              <div className={styles.emotionList}>
                {sortedEmotions.map(([emotion, count]) => (
                  <div key={emotion} className={styles.emotionRow}>
                    <div className={styles.emotionMeta}>
                      <span className={styles.emotionName}>{emotion}</span>
                      <span className={styles.emotionCount}>
                        {count}× {hasPatterns && `(${Math.round((count / totalLogs) * 100)}%)`}
                      </span>
                    </div>
                    <div className={styles.emotionBarTrack}>
                      <div
                        className={styles.emotionBarFill}
                        style={{ width: `${(count / maxEmotionCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Body locations ────────────────────────────────────────── */}
          {sortedKeywords.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Where you feel it</p>
              <div className={styles.keywords}>
                {sortedKeywords.map(([keyword, count]) => (
                  <span key={keyword} className={styles.keyword}>
                    {keyword}
                    <span className={styles.keywordCount}>{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ─── Recent logs ───────────────────────────────────────────── */}
          {recentLogs.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Recent triggers</p>
              <div className={styles.logList}>
                {recentLogs.map((log) => (
                  <div key={log.id} className={styles.logCard}>
                    <div className={styles.logTop}>
                      <span className={styles.logEmotion}>{log.emotion || 'Unknown'}</span>
                      <span className={styles.logIntensity}>{log.intensity}/10</span>
                    </div>
                    {log.situation && <p className={styles.logSituation}>{log.situation}</p>}
                    <span className={styles.logDate}>{formatDate(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
