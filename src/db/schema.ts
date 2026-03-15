export interface JournalEntry {
  id: string;
  content: string;
  prompt?: string;
  exerciseId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseCompletion {
  id: string;
  exerciseId: string;
  responses: Record<string, string>;
  completedAt: Date;
  durationSeconds: number;
}

export interface DailyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD, unique index
  presenceLevel: number; // 1-5
  emotion: string;
  triggered: boolean;
  triggerNote?: string;
  freewrite?: string;
  createdAt: Date;
}

export interface TriggerLog {
  id: string;
  situation: string;
  emotion: string;
  intensity: number; // 1-10
  bodyLocation?: string;
  shadowInsight?: string;
  createdAt: Date;
}

export interface DreamEntry {
  id: string;
  content: string;
  figures: string[];
  emotions: string[];
  analysisNotes?: string;
  createdAt: Date;
}

export interface UserSettings {
  key: 'settings';
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  reminderTime?: string; // HH:MM
}

export interface StreakRecord {
  key: 'current';
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalActiveDays: number;
}
