import Dexie, { type EntityTable } from 'dexie';
import type {
  DailyCheckIn,
  DreamEntry,
  ExerciseCompletion,
  JournalEntry,
  StreakRecord,
  TriggerLog,
  UserSettings,
} from './schema';

class ShadowDatabase extends Dexie {
  journalEntries!: EntityTable<JournalEntry, 'id'>;
  exerciseCompletions!: EntityTable<ExerciseCompletion, 'id'>;
  dailyCheckIns!: EntityTable<DailyCheckIn, 'id'>;
  triggerLogs!: EntityTable<TriggerLog, 'id'>;
  dreamEntries!: EntityTable<DreamEntry, 'id'>;
  userSettings!: EntityTable<UserSettings, 'key'>;
  streaks!: EntityTable<StreakRecord, 'key'>;

  constructor() {
    super('shadow-db');

    this.version(1).stores({
      journalEntries: 'id, createdAt, exerciseId, *tags',
      exerciseCompletions: 'id, exerciseId, completedAt',
      dailyCheckIns: 'id, &date, createdAt',
      triggerLogs: 'id, createdAt, emotion',
      dreamEntries: 'id, createdAt',
      userSettings: 'key',
      streaks: 'key',
    });
  }
}

export const db = new ShadowDatabase();
