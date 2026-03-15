import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StreakDisplay from './StreakDisplay';
import type { StreakRecord } from '../../db/schema';

const makeStreak = (overrides: Partial<StreakRecord> = {}): StreakRecord => ({
  key: 'current',
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  totalActiveDays: 0,
  ...overrides,
});

describe('StreakDisplay', () => {
  it('renders the current streak count', () => {
    render(<StreakDisplay streak={makeStreak({ currentStreak: 7 })} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('shows "day" label for a 1-day streak', () => {
    render(<StreakDisplay streak={makeStreak({ currentStreak: 1 })} />);
    expect(screen.getByText('day')).toBeInTheDocument();
  });

  it('shows "days" label for a 0-day streak', () => {
    render(<StreakDisplay streak={makeStreak({ currentStreak: 0 })} />);
    expect(screen.getByText('days')).toBeInTheDocument();
  });

  it('shows "days" label for multi-day streaks', () => {
    render(<StreakDisplay streak={makeStreak({ currentStreak: 5 })} />);
    expect(screen.getByText('days')).toBeInTheDocument();
  });

  it('does not show broken streak message for fresh user', () => {
    render(<StreakDisplay streak={makeStreak()} />);
    expect(screen.queryByText(/You were away/)).not.toBeInTheDocument();
  });

  it('does not show broken streak message when streak is active', () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    render(<StreakDisplay streak={makeStreak({ currentStreak: 3, lastActiveDate: todayStr })} />);
    expect(screen.queryByText(/You were away/)).not.toBeInTheDocument();
  });

  it('shows broken streak message when user missed days and streak is 0', () => {
    // Use a fixed date far in the past so daysSince is always > 1
    render(
      <StreakDisplay streak={makeStreak({ currentStreak: 0, lastActiveDate: '2020-01-01' })} />,
    );
    expect(screen.getByText('You were away. The shadow waited. Welcome back.')).toBeInTheDocument();
  });

  it('does not show broken streak message when last active date was yesterday and streak > 0', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yyyy = yesterday.getFullYear();
    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const dd = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${yyyy}-${mm}-${dd}`;

    render(
      <StreakDisplay streak={makeStreak({ currentStreak: 2, lastActiveDate: yesterdayStr })} />,
    );
    expect(screen.queryByText(/You were away/)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<StreakDisplay streak={makeStreak()} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
