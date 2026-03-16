import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import type { StreakRecord } from '../db/schema';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../db/hooks', () => ({
  useStreak: vi.fn(),
  useTodaysCheckIn: vi.fn(),
  useRecentActivity: vi.fn(),
  useCheckInCount: vi.fn(() => 0),
  todayDateString: vi.fn(() => '2026-03-15'),
}));

vi.mock('../data/daily-questions', () => ({
  getDailyQuestion: vi.fn(() => 'What quality in others irritates you most?'),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

import * as hooks from '../db/hooks';

const makeStreak = (overrides: Partial<StreakRecord> = {}): StreakRecord => ({
  key: 'current',
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  totalActiveDays: 0,
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.mocked(hooks.useStreak).mockReturnValue(makeStreak());
  vi.mocked(hooks.useTodaysCheckIn).mockReturnValue(null);
  vi.mocked(hooks.useRecentActivity).mockReturnValue([]);
  mockNavigate.mockClear();
});

describe('Home page', () => {
  it('renders the app title with glitch effect', () => {
    renderPage();
    const title = screen.getByRole('heading', { level: 1, name: /shadow/i });
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('glitch');
  });

  it('renders the daily question', () => {
    renderPage();
    expect(screen.getByText('What quality in others irritates you most?')).toBeInTheDocument();
  });

  it('renders the "Today\'s question" section label', () => {
    renderPage();
    expect(screen.getByText("Today's question")).toBeInTheDocument();
  });

  it('shows streak display when streak data is available', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(makeStreak({ currentStreak: 5 }));
    renderPage();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides streak display while streak data is loading', () => {
    vi.mocked(hooks.useStreak).mockReturnValue(undefined);
    renderPage();
    expect(screen.queryByText('days')).not.toBeInTheDocument();
  });

  it('shows check-in not done state when no check-in today', () => {
    vi.mocked(hooks.useTodaysCheckIn).mockReturnValue(null);
    renderPage();
    expect(screen.getByText('Check in')).toBeInTheDocument();
  });

  it('shows check-in done state when check-in exists today', () => {
    vi.mocked(hooks.useTodaysCheckIn).mockReturnValue({
      id: '1',
      date: '2026-03-15',
      presenceLevel: 3,
      emotion: 'calm',
      triggered: false,
      createdAt: new Date(),
    });
    renderPage();
    expect(screen.getByText('Checked in')).toBeInTheDocument();
  });

  it('shows "Begin today\'s check-in" button when not checked in', () => {
    vi.mocked(hooks.useTodaysCheckIn).mockReturnValue(null);
    renderPage();
    expect(screen.getByRole('button', { name: /begin today's check-in/i })).toBeInTheDocument();
  });

  it('hides "Begin today\'s check-in" button when already checked in', () => {
    vi.mocked(hooks.useTodaysCheckIn).mockReturnValue({
      id: '1',
      date: '2026-03-15',
      presenceLevel: 3,
      emotion: 'calm',
      triggered: false,
      createdAt: new Date(),
    });
    renderPage();
    expect(
      screen.queryByRole('button', { name: /begin today's check-in/i }),
    ).not.toBeInTheDocument();
  });

  it('navigates to /check-in when check-in button is clicked', () => {
    vi.mocked(hooks.useTodaysCheckIn).mockReturnValue(null);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /begin today's check-in/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/check-in');
  });

  it('navigates to /journal when Journal button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /journal/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/journal');
  });

  it('navigates to /exercises when Exercises button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /exercises/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/exercises');
  });

  it('navigates to /journal/new when "New entry" button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /new entry/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/journal/new');
  });

  it('does not render the activity feed when there is no recent activity', () => {
    vi.mocked(hooks.useRecentActivity).mockReturnValue([]);
    renderPage();
    expect(screen.queryByText('Recent')).not.toBeInTheDocument();
  });

  it('renders recent activity items', () => {
    vi.mocked(hooks.useRecentActivity).mockReturnValue([
      {
        type: 'checkIn',
        id: 'a1',
        date: new Date(),
        label: 'Daily check-in',
      },
      {
        type: 'journal',
        id: 'b2',
        date: new Date(Date.now() - 3_600_000),
        label: 'Journal entry',
      },
    ]);
    renderPage();
    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('Daily check-in')).toBeInTheDocument();
    expect(screen.getByText('Journal entry')).toBeInTheDocument();
  });

  it('shows relative time for activity items', () => {
    vi.mocked(hooks.useRecentActivity).mockReturnValue([
      {
        type: 'exercise',
        id: 'c3',
        date: new Date(Date.now() - 2 * 60_000),
        label: 'Exercise: mirror-work',
      },
    ]);
    renderPage();
    expect(screen.getByText('2m ago')).toBeInTheDocument();
  });

  it('navigates to /check-in when the check-in card is clicked (not done)', () => {
    vi.mocked(hooks.useTodaysCheckIn).mockReturnValue(null);
    renderPage();
    // The check-in Card has onClick when not done — clicking "Check in" label triggers it
    fireEvent.click(screen.getByText('Check in'));
    expect(mockNavigate).toHaveBeenCalledWith('/check-in');
  });
});
