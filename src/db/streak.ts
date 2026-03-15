import { db } from './index';
import type { StreakRecord } from './schema';

/** Returns YYYY-MM-DD for a given Date (local time). */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns all dates (YYYY-MM-DD) that had at least one activity. */
async function getActiveDates(): Promise<Set<string>> {
  const [checkIns, journals, exercises] = await Promise.all([
    db.dailyCheckIns.toArray(),
    db.journalEntries.toArray(),
    db.exerciseCompletions.toArray(),
  ]);

  const dates = new Set<string>();
  for (const c of checkIns) dates.add(c.date);
  for (const j of journals) dates.add(toDateString(j.createdAt));
  for (const e of exercises) dates.add(toDateString(e.completedAt));
  return dates;
}

/**
 * Recalculates streak from raw DB data and persists it.
 * Call this after any activity is recorded.
 */
export async function recalculateStreak(): Promise<StreakRecord> {
  const activeDates = await getActiveDates();
  const today = toDateString(new Date());

  // Sort active dates descending
  const sorted = Array.from(activeDates).sort().reverse();

  if (sorted.length === 0) {
    const record: StreakRecord = {
      key: 'current',
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      totalActiveDays: 0,
    };
    await db.streaks.put(record);
    return record;
  }

  // Current streak: consecutive days ending today or yesterday
  const mostRecent = sorted[0]!;
  const daysBetween = dateDiffDays(today, mostRecent);

  let currentStreak = 0;
  if (daysBetween <= 1) {
    // Walk backwards from mostRecent counting consecutive days
    let prev = mostRecent;
    currentStreak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i]!;
      const diff = dateDiffDays(prev, curr);
      if (diff === 1) {
        currentStreak++;
        prev = curr;
      } else {
        break;
      }
    }
  }

  // Longest streak: scan all active dates in chronological order
  const ascending = [...sorted].reverse();
  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < ascending.length; i++) {
    const diff = dateDiffDays(ascending[i]!, ascending[i - 1]!);
    if (diff === 1) {
      run++;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 1;
    }
  }
  // Edge case: single active day
  if (longestStreak < 1) longestStreak = 1;
  if (currentStreak > longestStreak) longestStreak = currentStreak;

  const record: StreakRecord = {
    key: 'current',
    currentStreak,
    longestStreak,
    lastActiveDate: mostRecent,
    totalActiveDays: activeDates.size,
  };
  await db.streaks.put(record);
  return record;
}

/** Returns the cached streak record, or recalculates if absent. */
export async function getStreak(): Promise<StreakRecord> {
  const existing = await db.streaks.get('current');
  if (existing) return existing;
  return recalculateStreak();
}

/** Difference in calendar days: how many days is `later` after `earlier`? */
function dateDiffDays(later: string, earlier: string): number {
  const a = new Date(later + 'T00:00:00');
  const b = new Date(earlier + 'T00:00:00');
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}
