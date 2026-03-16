import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './index';
import type { DailyCheckIn, StreakRecord, TriggerLog } from './schema';
import type { ExerciseCategory } from '../data/exercises';
import { exercises } from '../data/exercises';

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

// ─── Trigger Patterns ─────────────────────────────────────────────────────────

const BODY_KEYWORDS = [
  'chest',
  'throat',
  'stomach',
  'belly',
  'gut',
  'head',
  'shoulders',
  'jaw',
  'neck',
  'hands',
  'heart',
  'back',
  'arms',
  'legs',
  'face',
];

export interface TriggerPattern {
  totalLogs: number;
  emotionCounts: Record<string, number>;
  averageIntensity: number;
  bodyKeywordCounts: Record<string, number>;
  recentLogs: TriggerLog[];
}

export async function queryTriggerPatterns(): Promise<TriggerPattern> {
  const logs = await db.triggerLogs.orderBy('createdAt').reverse().toArray();

  const emotionCounts: Record<string, number> = {};
  let totalIntensity = 0;
  const bodyKeywordCounts: Record<string, number> = {};

  for (const log of logs) {
    emotionCounts[log.emotion] = (emotionCounts[log.emotion] ?? 0) + 1;
    totalIntensity += log.intensity;

    const location = (log.bodyLocation ?? '').toLowerCase();
    for (const keyword of BODY_KEYWORDS) {
      if (location.includes(keyword)) {
        bodyKeywordCounts[keyword] = (bodyKeywordCounts[keyword] ?? 0) + 1;
      }
    }
  }

  return {
    totalLogs: logs.length,
    emotionCounts,
    averageIntensity: logs.length > 0 ? totalIntensity / logs.length : 0,
    bodyKeywordCounts,
    recentLogs: logs.slice(0, 5),
  };
}

/** Reactive hook — returns all trigger logs sorted newest-first. */
export function useTriggerLogs(): TriggerLog[] | undefined {
  return useLiveQuery(() => db.triggerLogs.orderBy('createdAt').reverse().toArray(), []);
}

/** Reactive hook — returns computed trigger pattern analysis. */
export function useTriggerPatterns(): TriggerPattern | undefined {
  return useLiveQuery(() => queryTriggerPatterns(), []);
}

// ─── Dream Entries ─────────────────────────────────────────────────────────────

/** Reactive hook — returns all dream entries sorted newest-first. */
export function useDreamEntries(): import('./schema').DreamEntry[] | undefined {
  return useLiveQuery(() => db.dreamEntries.orderBy('createdAt').reverse().toArray(), []);
}

// ─── Progress Stats ─────────────────────────────────────────────────────────────

export interface ProgressStats {
  totalExercises: number;
  exerciseCountsByCategory: Partial<Record<ExerciseCategory, number>>;
  mostPracticedCategory: ExerciseCategory | null;
  journalEntryCount: number;
}

async function queryProgressStats(): Promise<ProgressStats> {
  const [completions, journalEntryCount] = await Promise.all([
    db.exerciseCompletions.toArray(),
    db.journalEntries.count(),
  ]);

  const exerciseCountsByCategory: Partial<Record<ExerciseCategory, number>> = {};
  for (const completion of completions) {
    const exercise = exercises.find((e) => e.id === completion.exerciseId);
    if (exercise) {
      exerciseCountsByCategory[exercise.category] =
        (exerciseCountsByCategory[exercise.category] ?? 0) + 1;
    }
  }

  const mostPracticedEntry = Object.entries(exerciseCountsByCategory).sort(
    ([, a], [, b]) => (b ?? 0) - (a ?? 0),
  )[0];
  const mostPracticedCategory = (mostPracticedEntry?.[0] as ExerciseCategory) ?? null;

  return {
    totalExercises: completions.length,
    exerciseCountsByCategory,
    mostPracticedCategory,
    journalEntryCount,
  };
}

/** Reactive hook — returns aggregated progress statistics. */
export function useProgressStats(): ProgressStats | undefined {
  return useLiveQuery(() => queryProgressStats(), []);
}

// ─── Activity By Date ──────────────────────────────────────────────────────────

/** Maps YYYY-MM-DD date strings to activity counts (check-ins + journal entries + exercises). */
export type ActivityByDate = Record<string, number>;

function dateToKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function queryActivityByDate(): Promise<ActivityByDate> {
  const [checkIns, journals, completions] = await Promise.all([
    db.dailyCheckIns.toArray(),
    db.journalEntries.toArray(),
    db.exerciseCompletions.toArray(),
  ]);

  const result: ActivityByDate = {};

  function addDate(date: Date) {
    const key = dateToKey(date);
    result[key] = (result[key] ?? 0) + 1;
  }

  checkIns.forEach((c) => addDate(c.createdAt));
  journals.forEach((j) => addDate(j.createdAt));
  completions.forEach((e) => addDate(e.completedAt));

  return result;
}

/** Reactive hook — returns activity counts keyed by YYYY-MM-DD date string. */
export function useActivityByDate(): ActivityByDate | undefined {
  return useLiveQuery(() => queryActivityByDate(), []);
}
