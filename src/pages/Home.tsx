import { useNavigate } from 'react-router-dom';
import { useStreak, useTodaysCheckIn, useRecentActivity, todayDateString } from '../db/hooks';
import { getDailyQuestion } from '../data/daily-questions';
import StreakDisplay from '../components/ui/StreakDisplay';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import styles from './Home.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
}

const ACTIVITY_ICONS: Record<string, string> = {
  checkIn: '◈',
  journal: '▪',
  exercise: '◆',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const streak = useStreak();
  const todaysCheckIn = useTodaysCheckIn();
  const recentActivity = useRecentActivity(5);

  const question = getDailyQuestion(todayDateString());
  const checkInDone = todaysCheckIn != null;

  return (
    <main className={styles.page}>
      {/* ─── App title ──────────────────────────────────── */}
      <header className={styles.appHeader}>
        <h1 className={`${styles.appTitle} glitch glitch-layers glitch-text`} data-text="SHADOW">
          SHADOW
        </h1>
      </header>

      {/* ─── Daily question ─────────────────────────────── */}
      <section className={styles.questionSection}>
        <p className={styles.sectionLabel}>Today&apos;s question</p>
        <p className={`${styles.question} glitch glitch-layers glitch-text`} data-text={question}>
          {question}
        </p>
      </section>

      {/* ─── Streak + check-in status ───────────────────── */}
      <section className={styles.statusRow}>
        {streak !== undefined && (
          <Card className={styles.streakCard}>
            <StreakDisplay streak={streak} />
          </Card>
        )}
        <Card
          className={`${styles.checkInCard} ${checkInDone ? styles.checkInDone : ''}`}
          onClick={checkInDone ? undefined : () => navigate('/check-in')}
        >
          <div className={styles.checkInContent}>
            <span className={styles.checkInIcon} aria-hidden="true">
              {checkInDone ? '✓' : '○'}
            </span>
            <span className={styles.checkInLabel}>{checkInDone ? 'Checked in' : 'Check in'}</span>
          </div>
        </Card>
      </section>

      {/* ─── Quick actions ──────────────────────────────── */}
      <section className={styles.actionsSection}>
        {!checkInDone && (
          <Button fullWidth onClick={() => navigate('/check-in')}>
            Begin today&apos;s check-in
          </Button>
        )}
        <Button fullWidth variant="secondary" onClick={() => navigate('/journal/new')}>
          New entry
        </Button>
        <div className={styles.actionRow}>
          <Button variant="secondary" onClick={() => navigate('/journal')}>
            Journal
          </Button>
          <Button variant="secondary" onClick={() => navigate('/exercises')}>
            Exercises
          </Button>
        </div>
      </section>

      {/* ─── Recent activity feed ───────────────────────── */}
      {recentActivity && recentActivity.length > 0 && (
        <section className={styles.activitySection}>
          <p className={styles.sectionLabel}>Recent</p>
          <div className={styles.activityFeed}>
            {recentActivity.map((item) => (
              <div key={item.id} className={styles.activityItem}>
                <span className={styles.activityIcon} aria-hidden="true">
                  {ACTIVITY_ICONS[item.type] ?? '◎'}
                </span>
                <span className={styles.activityLabel}>{item.label}</span>
                <span className={styles.activityTime}>{formatRelativeTime(item.date)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
