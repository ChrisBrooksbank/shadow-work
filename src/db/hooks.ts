import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './index';
import type { DailyCheckIn, StreakRecord } from './schema';

const DEFAULT_STREAK: StreakRecord = {
  key: 'current',
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  totalActiveDays: 0,
};

export interface RecentActivityItem {
  type: 'checkIn' | 'journal' | 'exercise';
  id: string;
  date: Date;
  label: string;
}

/** YYYY-MM-DD for today in local time */
export function todayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Reads the cached streak record from DB.
 * Returns the default zero-state if no record exists yet.
 * Call recalculateStreak() after any activity to update the cache.
 */
export async function queryStreak(): Promise<StreakRecord> {
  const r = await db.streaks.get('current');
  return r ?? DEFAULT_STREAK;
}

/** Reads today's check-in, or null if none recorded yet. */
export async function queryTodaysCheckIn(): Promise<DailyCheckIn | null> {
  const r = await db.dailyCheckIns.where('date').equals(todayDateString()).first();
  return r ?? null;
}

/** Returns the N most recent activity items across all activity types. */
export async function queryRecentActivity(limit = 10): Promise<RecentActivityItem[]> {
  const [checkIns, journals, exercises] = await Promise.all([
    db.dailyCheckIns.toArray(),
    db.journalEntries.toArray(),
    db.exerciseCompletions.toArray(),
  ]);

  const items: RecentActivityItem[] = [
    ...checkIns.map((c) => ({
      type: 'checkIn' as const,
      id: c.id,
      date: c.createdAt,
      label: 'Daily check-in',
    })),
    ...journals.map((j) => ({
      type: 'journal' as const,
      id: j.id,
      date: j.createdAt,
      label: 'Journal entry',
    })),
    ...exercises.map((e) => ({
      type: 'exercise' as const,
      id: e.id,
      date: e.completedAt,
      label: `Exercise: ${e.exerciseId}`,
    })),
  ];

  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  return items.slice(0, limit);
}

/** Reactive hook — returns the cached streak record, or undefined while loading. */
export function useStreak(): StreakRecord | undefined {
  return useLiveQuery(() => queryStreak(), []);
}

/** Reactive hook — returns today's check-in, or null if none yet. */
export function useTodaysCheckIn(): DailyCheckIn | null | undefined {
  return useLiveQuery(() => queryTodaysCheckIn(), []);
}

/**
 * Reactive hook — returns the N most recent activity items across
 * check-ins, journal entries, and exercise completions.
 */
export function useRecentActivity(limit = 10): RecentActivityItem[] | undefined {
  return useLiveQuery(() => queryRecentActivity(limit), [limit]);
}

/** Reactive hook — returns all journal entries sorted newest-first. */
export function useJournalEntries(): import('./schema').JournalEntry[] | undefined {
  return useLiveQuery(() => db.journalEntries.orderBy('createdAt').reverse().toArray(), []);
}
