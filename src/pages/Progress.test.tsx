import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Progress from './Progress';
import type { StreakRecord } from '../db/schema';
import type { ProgressStats, TriggerPattern } from '../db/hooks';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../db/hooks', () => ({
  useStreak: vi.fn(),
  useProgressStats: vi.fn(),
  useActivityByDate: vi.fn(),
  useTriggerPatterns: vi.fn(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

import * as hooks from '../db/hooks';
import type { ActivityByDate } from '../db/hooks';

const makeStreak = (overrides: Partial<StreakRecord> = {}): StreakRecord => ({
  key: 'current',
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  totalActiveDays: 0,
  ...overrides,
});

const makeStats = (overrides: Partial<ProgressStats> = {}): ProgressStats => ({
  totalExercises: 0,
  exerciseCountsByCategory: {},
  mostPracticedCategory: null,
  journalEntryCount: 0,
  ...overrides,
});

const makeTriggerPattern = (overrides: Partial<TriggerPattern> = {}): TriggerPattern => ({
  totalLogs: 0,
  emotionCounts: {},
  averageIntensity: 0,
  bodyKeywordCounts: {},
  recentLogs: [],
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter>
      <Progress />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

const emptyActivity: ActivityByDate = {};

beforeEach(() => {
  vi.mocked(hooks.useStreak).mockReturnValue(makeStreak());
  vi.mocked(hooks.useProgressStats).mockReturnValue(makeStats());
  vi.mocked(hooks.useActivityByDate).mockReturnValue(emptyActivity);
  vi.mocked(hooks.useTriggerPatterns).mockReturnValue(makeTriggerPattern());
});

describe('Progress page', () => {
  it('renders the page title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /progress/i })).toBeInTheDocument();
  });

  it('shows loading state while data is undefined', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(undefined);
    vi.mocked(hooks.useProgressStats).mockReturnValue(undefined);
    vi.mocked(hooks.useActivityByDate).mockReturnValue(undefined);
    vi.mocked(hooks.useTriggerPatterns).mockReturnValue(undefined);
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty state for brand new users', () => {
    renderPage();
    expect(screen.getByText('The journey begins here')).toBeInTheDocument();
  });

  it('shows streak stats when user has activity', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(
      makeStreak({ currentStreak: 5, longestStreak: 12, totalActiveDays: 30 }),
    );
    vi.mocked(hooks.useProgressStats).mockReturnValue(makeStats({ journalEntryCount: 3 }));
    renderPage();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Current streak')).toBeInTheDocument();
    expect(screen.getByText('Longest streak')).toBeInTheDocument();
    expect(screen.getByText('Total days')).toBeInTheDocument();
  });

  it('shows journal entry count', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(makeStreak({ totalActiveDays: 5 }));
    vi.mocked(hooks.useProgressStats).mockReturnValue(makeStats({ journalEntryCount: 7 }));
    renderPage();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Journal entries')).toBeInTheDocument();
  });

  it('shows exercises done count', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(makeStreak({ totalActiveDays: 3 }));
    vi.mocked(hooks.useProgressStats).mockReturnValue(
      makeStats({ totalExercises: 4, exerciseCountsByCategory: { journaling: 4 } }),
    );
    renderPage();
    expect(screen.getByText('Exercises done')).toBeInTheDocument();
  });

  it('shows exercise breakdown section when exercises have been done', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(makeStreak({ totalActiveDays: 2 }));
    vi.mocked(hooks.useProgressStats).mockReturnValue(
      makeStats({
        totalExercises: 3,
        exerciseCountsByCategory: { journaling: 2, mirror: 1 },
        mostPracticedCategory: 'journaling',
      }),
    );
    renderPage();
    expect(screen.getByText('Exercise breakdown')).toBeInTheDocument();
    // category name appears in both the bar row and the "most practiced" note
    expect(screen.getAllByText('Shadow Journaling').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Mirror Work').length).toBeGreaterThanOrEqual(1);
  });

  it('shows most practiced note when there are exercise completions', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(makeStreak({ totalActiveDays: 2 }));
    vi.mocked(hooks.useProgressStats).mockReturnValue(
      makeStats({
        totalExercises: 2,
        exerciseCountsByCategory: { trigger: 2 },
        mostPracticedCategory: 'trigger',
      }),
    );
    renderPage();
    expect(screen.getByText(/most practiced/i)).toBeInTheDocument();
    // name appears in bar list and in the note; check the note specifically
    expect(screen.getAllByText('Trigger Tracking').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "No exercises completed yet" when total is zero but other activity exists', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(makeStreak({ totalActiveDays: 1 }));
    vi.mocked(hooks.useProgressStats).mockReturnValue(
      makeStats({ totalExercises: 0, journalEntryCount: 1 }),
    );
    renderPage();
    expect(screen.getByText('No exercises completed yet.')).toBeInTheDocument();
  });

  it('shows section labels for streaks and writing', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(makeStreak({ totalActiveDays: 1 }));
    vi.mocked(hooks.useProgressStats).mockReturnValue(makeStats({ journalEntryCount: 1 }));
    renderPage();
    expect(screen.getByText('Streaks')).toBeInTheDocument();
    expect(screen.getByText('Writing')).toBeInTheDocument();
  });

  it('does not show trigger analytics section when there are no trigger logs', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(makeStreak({ totalActiveDays: 1 }));
    vi.mocked(hooks.useProgressStats).mockReturnValue(makeStats({ journalEntryCount: 1 }));
    vi.mocked(hooks.useTriggerPatterns).mockReturnValue(makeTriggerPattern({ totalLogs: 0 }));
    renderPage();
    expect(screen.queryByText('Trigger patterns')).not.toBeInTheDocument();
  });

  it('shows trigger analytics section when trigger logs exist', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(makeStreak({ totalActiveDays: 2 }));
    vi.mocked(hooks.useProgressStats).mockReturnValue(makeStats({ journalEntryCount: 1 }));
    vi.mocked(hooks.useTriggerPatterns).mockReturnValue(
      makeTriggerPattern({
        totalLogs: 3,
        averageIntensity: 6.5,
        emotionCounts: { fear: 2, anger: 1 },
        bodyKeywordCounts: { chest: 2, throat: 1 },
      }),
    );
    renderPage();
    expect(screen.getByText('Trigger patterns')).toBeInTheDocument();
    expect(screen.getByText('Avg intensity')).toBeInTheDocument();
    expect(screen.getByText('6.5')).toBeInTheDocument();
    expect(screen.getByText('Trigger logs')).toBeInTheDocument();
  });

  it('shows top emotions in trigger analytics', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(makeStreak({ totalActiveDays: 1 }));
    vi.mocked(hooks.useProgressStats).mockReturnValue(makeStats({ journalEntryCount: 1 }));
    vi.mocked(hooks.useTriggerPatterns).mockReturnValue(
      makeTriggerPattern({
        totalLogs: 2,
        averageIntensity: 5,
        emotionCounts: { shame: 2, grief: 1 },
        bodyKeywordCounts: {},
      }),
    );
    renderPage();
    expect(screen.getByText('Common emotions')).toBeInTheDocument();
    expect(screen.getByText('shame')).toBeInTheDocument();
    expect(screen.getByText('grief')).toBeInTheDocument();
  });

  it('shows top body locations in trigger analytics', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(makeStreak({ totalActiveDays: 1 }));
    vi.mocked(hooks.useProgressStats).mockReturnValue(makeStats({ journalEntryCount: 1 }));
    vi.mocked(hooks.useTriggerPatterns).mockReturnValue(
      makeTriggerPattern({
        totalLogs: 1,
        averageIntensity: 7,
        emotionCounts: {},
        bodyKeywordCounts: { stomach: 1, jaw: 1 },
      }),
    );
    renderPage();
    expect(screen.getByText('Body locations')).toBeInTheDocument();
    expect(screen.getByText('stomach')).toBeInTheDocument();
    expect(screen.getByText('jaw')).toBeInTheDocument();
  });
});
