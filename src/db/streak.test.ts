import 'fake-indexeddb/auto';
import { db } from './index';
import { recalculateStreak, getStreak, toDateString } from './streak';

// Helper: clear all tables between tests
beforeEach(async () => {
  await Promise.all([
    db.dailyCheckIns.clear(),
    db.journalEntries.clear(),
    db.exerciseCompletions.clear(),
    db.streaks.clear(),
  ]);
});

function makeDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  // zero out time so toDateString is deterministic
  d.setHours(0, 0, 0, 0);
  return d;
}

test('toDateString formats dates correctly', () => {
  expect(toDateString(new Date('2026-01-05T00:00:00'))).toBe('2026-01-05');
  expect(toDateString(new Date('2026-12-31T00:00:00'))).toBe('2026-12-31');
});

test('returns zero streak when no activity', async () => {
  const record = await recalculateStreak();
  expect(record.currentStreak).toBe(0);
  expect(record.longestStreak).toBe(0);
  expect(record.totalActiveDays).toBe(0);
  expect(record.lastActiveDate).toBe('');
});

test('streak of 1 after a single check-in today', async () => {
  await db.dailyCheckIns.add({
    id: 'ci-today',
    date: toDateString(new Date()),
    presenceLevel: 3,
    emotion: 'calm',
    triggered: false,
    createdAt: new Date(),
  });

  const record = await recalculateStreak();
  expect(record.currentStreak).toBe(1);
  expect(record.totalActiveDays).toBe(1);
  expect(record.lastActiveDate).toBe(toDateString(new Date()));
});

test('streak of 3 for three consecutive check-in days ending today', async () => {
  for (let i = 0; i < 3; i++) {
    const d = makeDate(i);
    await db.dailyCheckIns.add({
      id: `ci-${i}`,
      date: toDateString(d),
      presenceLevel: 3,
      emotion: 'calm',
      triggered: false,
      createdAt: d,
    });
  }

  const record = await recalculateStreak();
  expect(record.currentStreak).toBe(3);
  expect(record.longestStreak).toBe(3);
  expect(record.totalActiveDays).toBe(3);
});

test('streak breaks when there is a gap', async () => {
  // Today and 3 days ago — gap at day 1 and day 2
  await db.dailyCheckIns.add({
    id: 'ci-today',
    date: toDateString(makeDate(0)),
    presenceLevel: 3,
    emotion: 'calm',
    triggered: false,
    createdAt: makeDate(0),
  });
  await db.dailyCheckIns.add({
    id: 'ci-3ago',
    date: toDateString(makeDate(3)),
    presenceLevel: 3,
    emotion: 'calm',
    triggered: false,
    createdAt: makeDate(3),
  });

  const record = await recalculateStreak();
  expect(record.currentStreak).toBe(1);
  expect(record.longestStreak).toBe(1);
  expect(record.totalActiveDays).toBe(2);
});

test('journal entry counts as an active day', async () => {
  await db.journalEntries.add({
    id: 'j-today',
    content: 'some thoughts',
    tags: [],
    createdAt: makeDate(0),
    updatedAt: makeDate(0),
  });

  const record = await recalculateStreak();
  expect(record.currentStreak).toBe(1);
  expect(record.totalActiveDays).toBe(1);
});

test('exercise completion counts as an active day', async () => {
  await db.exerciseCompletions.add({
    id: 'ex-today',
    exerciseId: 'shadow-journal',
    responses: {},
    completedAt: makeDate(0),
    durationSeconds: 300,
  });

  const record = await recalculateStreak();
  expect(record.currentStreak).toBe(1);
  expect(record.totalActiveDays).toBe(1);
});

test('multiple activity types on same day count as one active day', async () => {
  const today = makeDate(0);
  await db.dailyCheckIns.add({
    id: 'ci-today',
    date: toDateString(today),
    presenceLevel: 3,
    emotion: 'calm',
    triggered: false,
    createdAt: today,
  });
  await db.journalEntries.add({
    id: 'j-today',
    content: 'some thoughts',
    tags: [],
    createdAt: today,
    updatedAt: today,
  });

  const record = await recalculateStreak();
  expect(record.totalActiveDays).toBe(1);
  expect(record.currentStreak).toBe(1);
});

test('longest streak tracks historical best', async () => {
  // 5 days ago through 3 days ago = streak of 3
  for (let i = 3; i <= 5; i++) {
    const d = makeDate(i);
    await db.dailyCheckIns.add({
      id: `ci-${i}`,
      date: toDateString(d),
      presenceLevel: 3,
      emotion: 'calm',
      triggered: false,
      createdAt: d,
    });
  }
  // Today only = current streak of 1
  await db.dailyCheckIns.add({
    id: 'ci-0',
    date: toDateString(makeDate(0)),
    presenceLevel: 3,
    emotion: 'calm',
    triggered: false,
    createdAt: makeDate(0),
  });

  const record = await recalculateStreak();
  expect(record.currentStreak).toBe(1);
  expect(record.longestStreak).toBe(3);
});

test('getStreak returns cached record without recalculating', async () => {
  // Seed a record directly
  await db.streaks.put({
    key: 'current',
    currentStreak: 7,
    longestStreak: 14,
    lastActiveDate: '2026-01-01',
    totalActiveDays: 42,
  });

  const record = await getStreak();
  expect(record.currentStreak).toBe(7);
  expect(record.longestStreak).toBe(14);
});

test('getStreak recalculates when no cached record', async () => {
  // No DB record, no activity — should return zeros
  const record = await getStreak();
  expect(record.currentStreak).toBe(0);
});

test('streak is still valid if last activity was yesterday', async () => {
  await db.dailyCheckIns.add({
    id: 'ci-yesterday',
    date: toDateString(makeDate(1)),
    presenceLevel: 3,
    emotion: 'calm',
    triggered: false,
    createdAt: makeDate(1),
  });

  const record = await recalculateStreak();
  expect(record.currentStreak).toBe(1);
});

test('streak is zero if last activity was 2 days ago', async () => {
  await db.dailyCheckIns.add({
    id: 'ci-2ago',
    date: toDateString(makeDate(2)),
    presenceLevel: 3,
    emotion: 'calm',
    triggered: false,
    createdAt: makeDate(2),
  });

  const record = await recalculateStreak();
  expect(record.currentStreak).toBe(0);
});
