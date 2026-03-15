import styles from './StreakDisplay.module.css';
import type { StreakRecord } from '../../db/schema';

interface StreakDisplayProps {
  streak: StreakRecord;
  className?: string;
}

function daysSince(dateStr: string): number {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(dateStr + 'T00:00:00');
  last.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

export default function StreakDisplay({ streak, className }: StreakDisplayProps) {
  const { currentStreak, lastActiveDate } = streak;
  const days = daysSince(lastActiveDate);
  const wasActive = lastActiveDate !== '';
  const brokenStreak = wasActive && days > 1 && currentStreak === 0;
  const isActive = currentStreak > 0;

  return (
    <div className={[styles.container, className].filter(Boolean).join(' ')}>
      <div className={[styles.emberWrap, isActive ? styles.active : ''].filter(Boolean).join(' ')}>
        <div className={styles.flameBase} aria-hidden="true">
          <div className={styles.flameInner} />
          <div className={styles.flameCore} />
        </div>
        <span
          className={[styles.count, isActive ? styles.countActive : ''].filter(Boolean).join(' ')}
        >
          {currentStreak}
        </span>
      </div>
      <p className={styles.label}>{currentStreak === 1 ? 'day' : 'days'}</p>
      {brokenStreak && (
        <p className={styles.returnMessage}>You were away. The shadow waited. Welcome back.</p>
      )}
    </div>
  );
}
