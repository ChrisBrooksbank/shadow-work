import { useStreak, useProgressStats, useActivityByDate, useTriggerPatterns } from '../db/hooks';
import type { ExerciseCategory } from '../data/exercises';
import CalendarHeatmap from '../components/ui/CalendarHeatmap';
import styles from './Progress.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  journaling: 'Shadow Journaling',
  process: '3-2-1 Process',
  'inner-child': 'Inner Child',
  imagination: 'Active Imagination',
  mirror: 'Mirror Work',
  trigger: 'Trigger Tracking',
  dream: 'Dream Work',
};

const ALL_CATEGORIES: ExerciseCategory[] = [
  'journaling',
  'process',
  'inner-child',
  'imagination',
  'mirror',
  'trigger',
  'dream',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Progress() {
  const streak = useStreak();
  const stats = useProgressStats();
  const activityByDate = useActivityByDate();
  const triggerPatterns = useTriggerPatterns();

  if (
    streak === undefined ||
    stats === undefined ||
    activityByDate === undefined ||
    triggerPatterns === undefined
  ) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Loading…</p>
      </main>
    );
  }

  const { currentStreak, longestStreak, totalActiveDays } = streak;
  const { totalExercises, exerciseCountsByCategory, mostPracticedCategory, journalEntryCount } =
    stats;

  const maxCount = Math.max(1, ...Object.values(exerciseCountsByCategory).map((v) => v ?? 0));
  const hasAnyActivity = totalActiveDays > 0 || journalEntryCount > 0 || totalExercises > 0;

  return (
    <main className={styles.page}>
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className={styles.header}>
        <h1 className={styles.title}>Progress</h1>
        <p className={styles.subtitle}>Your shadow work journey</p>
      </div>

      {!hasAnyActivity ? (
        /* ─── Empty state ───────────────────────────────────────── */
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>◈</p>
          <p className={styles.emptyTitle}>The journey begins here</p>
          <p className={styles.emptyBody}>
            Complete check-ins, journal entries, and exercises to track your progress over time.
          </p>
        </div>
      ) : (
        <>
          {/* ─── Streak stats ───────────────────────────────────────── */}
          <section>
            <p className={styles.sectionLabel}>Streaks</p>
            <div className={styles.statRow}>
              <div className={styles.statCard}>
                <p className={styles.statValue}>{currentStreak}</p>
                <p className={styles.statLabel}>Current streak</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statValue}>{longestStreak}</p>
                <p className={styles.statLabel}>Longest streak</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statValue}>{totalActiveDays}</p>
                <p className={styles.statLabel}>Total days</p>
              </div>
            </div>
          </section>

          {/* ─── Activity heatmap ───────────────────────────────────── */}
          <section>
            <p className={styles.sectionLabel}>Activity</p>
            <CalendarHeatmap activityByDate={activityByDate} />
          </section>

          {/* ─── Writing stats ──────────────────────────────────────── */}
          <section>
            <p className={styles.sectionLabel}>Writing</p>
            <div className={styles.statRow}>
              <div className={styles.statCard}>
                <p className={styles.statValue}>{journalEntryCount}</p>
                <p className={styles.statLabel}>Journal entries</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statValue}>{totalExercises}</p>
                <p className={styles.statLabel}>Exercises done</p>
              </div>
            </div>
          </section>

          {/* ─── Exercise breakdown ─────────────────────────────────── */}
          <section>
            <p className={styles.sectionLabel}>Exercise breakdown</p>
            {totalExercises === 0 ? (
              <p className={styles.emptySection}>No exercises completed yet.</p>
            ) : (
              <div className={styles.categoryList}>
                {ALL_CATEGORIES.map((category) => {
                  const count = exerciseCountsByCategory[category] ?? 0;
                  const isMostPracticed = category === mostPracticedCategory && count > 0;
                  return (
                    <div key={category} className={styles.categoryRow}>
                      <div className={styles.categoryMeta}>
                        <span className={styles.categoryName}>
                          {CATEGORY_LABELS[category]}
                          {isMostPracticed && (
                            <span className={styles.mostPracticedBadge} aria-label="most practiced">
                              ◆
                            </span>
                          )}
                        </span>
                        <span className={styles.categoryCount}>{count}</span>
                      </div>
                      <div className={styles.barTrack} aria-hidden="true">
                        <div
                          className={styles.barFill}
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {mostPracticedCategory && totalExercises > 0 && (
              <p className={styles.mostPracticedNote}>
                Most practiced:{' '}
                <span className={styles.mostPracticedName}>
                  {CATEGORY_LABELS[mostPracticedCategory]}
                </span>
              </p>
            )}
          </section>

          {/* ─── Trigger analytics ──────────────────────────────────── */}
          {triggerPatterns.totalLogs > 0 && (
            <section aria-label="Trigger analytics">
              <p className={styles.sectionLabel}>Trigger patterns</p>

              {/* Average intensity */}
              <div className={styles.statRow} style={{ marginBottom: 'var(--space-5)' }}>
                <div className={styles.statCard}>
                  <p className={styles.statValue}>{triggerPatterns.averageIntensity.toFixed(1)}</p>
                  <p className={styles.statLabel}>Avg intensity</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statValue}>{triggerPatterns.totalLogs}</p>
                  <p className={styles.statLabel}>Trigger logs</p>
                </div>
              </div>

              {/* Top emotions */}
              {Object.keys(triggerPatterns.emotionCounts).length > 0 && (
                <div className={styles.analyticsSubsection}>
                  <p className={styles.analyticsSubLabel}>Common emotions</p>
                  <div className={styles.categoryList}>
                    {Object.entries(triggerPatterns.emotionCounts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([emotion, count]) => {
                        const maxEmotion = Math.max(
                          ...Object.values(triggerPatterns.emotionCounts),
                        );
                        return (
                          <div key={emotion} className={styles.categoryRow}>
                            <div className={styles.categoryMeta}>
                              <span className={styles.categoryName}>{emotion}</span>
                              <span className={styles.categoryCount}>{count}</span>
                            </div>
                            <div className={styles.barTrack} aria-hidden="true">
                              <div
                                className={styles.barFill}
                                style={{ width: `${(count / maxEmotion) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Top body locations */}
              {Object.keys(triggerPatterns.bodyKeywordCounts).length > 0 && (
                <div className={styles.analyticsSubsection}>
                  <p className={styles.analyticsSubLabel}>Body locations</p>
                  <div className={styles.categoryList}>
                    {Object.entries(triggerPatterns.bodyKeywordCounts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([location, count]) => {
                        const maxLocation = Math.max(
                          ...Object.values(triggerPatterns.bodyKeywordCounts),
                        );
                        return (
                          <div key={location} className={styles.categoryRow}>
                            <div className={styles.categoryMeta}>
                              <span className={styles.categoryName}>{location}</span>
                              <span className={styles.categoryCount}>{count}</span>
                            </div>
                            <div className={styles.barTrack} aria-hidden="true">
                              <div
                                className={styles.barFill}
                                style={{ width: `${(count / maxLocation) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
