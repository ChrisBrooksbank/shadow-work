import 'fake-indexeddb/auto';
import { db } from './index';

test('db has all required tables', () => {
  const tableNames = db.tables.map((t) => t.name);
  expect(tableNames).toContain('journalEntries');
  expect(tableNames).toContain('exerciseCompletions');
  expect(tableNames).toContain('dailyCheckIns');
  expect(tableNames).toContain('triggerLogs');
  expect(tableNames).toContain('dreamEntries');
  expect(tableNames).toContain('userSettings');
  expect(tableNames).toContain('streaks');
});

test('db can add and retrieve a journal entry', async () => {
  await db.journalEntries.add({
    id: 'test-1',
    content: 'test content',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const entry = await db.journalEntries.get('test-1');
  expect(entry?.content).toBe('test content');
});

test('db enforces unique date constraint on dailyCheckIns', async () => {
  const checkIn = {
    id: 'ci-1',
    date: '2026-01-01',
    presenceLevel: 3,
    emotion: 'calm',
    triggered: false,
    createdAt: new Date(),
  };
  await db.dailyCheckIns.add(checkIn);

  await expect(db.dailyCheckIns.add({ ...checkIn, id: 'ci-2' })).rejects.toThrow();
});
