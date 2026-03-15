import 'fake-indexeddb/auto';
import { db } from './index';
import { queryStreak, queryTodaysCheckIn, queryRecentActivity, todayDateString } from './hooks';
import { toDateString } from './streak';

beforeEach(async () => {
  await Promise.all([
    db.dailyCheckIns.clear(),
    db.journalEntries.clear(),
    db.exerciseCompletions.clear(),
    db.streaks.clear(),
  ]);
});

// ── queryStreak ───────────────────────────────────────────────────────────────

test('queryStreak returns zero defaults when no cached record', async () => {
  const record = await queryStreak();
  expect(record.currentStreak).toBe(0);
  expect(record.longestStreak).toBe(0);
  expect(record.totalActiveDays).toBe(0);
  expect(record.lastActiveDate).toBe('');
});

test('queryStreak returns the cached record from DB', async () => {
  await db.streaks.put({
    key: 'current',
    currentStreak: 5,
    longestStreak: 10,
    lastActiveDate: '2026-03-14',
    totalActiveDays: 20,
  });

  const record = await queryStreak();
  expect(record.currentStreak).toBe(5);
  expect(record.longestStreak).toBe(10);
  expect(record.totalActiveDays).toBe(20);
});

// ── queryTodaysCheckIn ────────────────────────────────────────────────────────

test('queryTodaysCheckIn returns null when no check-in today', async () => {
  const result = await queryTodaysCheckIn();
  expect(result).toBeNull();
});

test('queryTodaysCheckIn returns null for a check-in from yesterday', async () => {
  const yesterday = new Date(Date.now() - 86_400_000);
  await db.dailyCheckIns.add({
    id: 'ci-yesterday',
    date: toDateString(yesterday),
    presenceLevel: 3,
    emotion: 'calm',
    triggered: false,
    createdAt: yesterday,
  });

  const result = await queryTodaysCheckIn();
  expect(result).toBeNull();
});

test('queryTodaysCheckIn returns the record when check-in exists for today', async () => {
  const today = todayDateString();
  await db.dailyCheckIns.add({
    id: 'ci-today',
    date: today,
    presenceLevel: 4,
    emotion: 'curious',
    triggered: false,
    createdAt: new Date(),
  });

  const result = await queryTodaysCheckIn();
  expect(result).not.toBeNull();
  expect(result?.id).toBe('ci-today');
  expect(result?.date).toBe(today);
});

// ── queryRecentActivity ────────────────────────────────────────────────────────

test('queryRecentActivity returns empty array when no activity', async () => {
  const items = await queryRecentActivity();
  expect(items).toHaveLength(0);
});

test('queryRecentActivity combines check-ins, journals, and exercises', async () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86_400_000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 86_400_000);

  await db.dailyCheckIns.add({
    id: 'ci-1',
    date: toDateString(now),
    presenceLevel: 3,
    emotion: 'calm',
    triggered: false,
    createdAt: now,
  });
  await db.journalEntries.add({
    id: 'j-1',
    content: 'thoughts',
    tags: [],
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  });
  await db.exerciseCompletions.add({
    id: 'ex-1',
    exerciseId: 'shadow-journal',
    responses: {},
    completedAt: yesterday,
    durationSeconds: 300,
  });

  const items = await queryRecentActivity();
  expect(items).toHaveLength(3);
  // Most recent first
  expect(items[0]?.type).toBe('checkIn');
  expect(items[1]?.type).toBe('exercise');
  expect(items[2]?.type).toBe('journal');
});

test('queryRecentActivity respects the limit', async () => {
  for (let i = 0; i < 5; i++) {
    await db.dailyCheckIns.add({
      id: `ci-${i}`,
      date: toDateString(new Date(Date.now() - i * 86_400_000)),
      presenceLevel: 3,
      emotion: 'calm',
      triggered: false,
      createdAt: new Date(Date.now() - i * 86_400_000),
    });
  }

  const items = await queryRecentActivity(3);
  expect(items).toHaveLength(3);
});

test('queryRecentActivity labels are correct per type', async () => {
  await db.dailyCheckIns.add({
    id: 'ci-1',
    date: toDateString(new Date()),
    presenceLevel: 3,
    emotion: 'calm',
    triggered: false,
    createdAt: new Date(),
  });
  await db.exerciseCompletions.add({
    id: 'ex-1',
    exerciseId: 'mirror-work',
    responses: {},
    completedAt: new Date(Date.now() - 1000),
    durationSeconds: 120,
  });

  const items = await queryRecentActivity();
  const checkIn = items.find((i) => i.type === 'checkIn');
  const exercise = items.find((i) => i.type === 'exercise');
  expect(checkIn?.label).toBe('Daily check-in');
  expect(exercise?.label).toBe('Exercise: mirror-work');
});

// ── todayDateString ────────────────────────────────────────────────────────────

test('todayDateString returns a valid YYYY-MM-DD string', () => {
  const s = todayDateString();
  expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});
