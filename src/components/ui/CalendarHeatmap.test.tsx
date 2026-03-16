import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CalendarHeatmap from './CalendarHeatmap';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function renderHeatmap(activityByDate = {}) {
  return render(<CalendarHeatmap activityByDate={activityByDate} />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CalendarHeatmap', () => {
  it('renders the current month and year', () => {
    renderHeatmap();
    const now = new Date();
    const label = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders all 7 day-of-week headers', () => {
    renderHeatmap();
    // S M T W T F S — some letters repeat so just check total count
    const headers = screen.getAllByText(/^[SMTWF]$/);
    expect(headers.length).toBe(7);
  });

  it('renders a cell with title for day with activity', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}-05`;
    renderHeatmap({ [key]: 3 });

    const cell = screen.getByTitle(`${key}: 3 activities`);
    expect(cell).toBeInTheDocument();
  });

  it('navigates to the previous month', () => {
    renderHeatmap();

    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const expectedLabel = `${MONTH_NAMES[prevMonth.getMonth()]} ${prevMonth.getFullYear()}`;

    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('disables next month button when on current month', () => {
    renderHeatmap();
    const nextBtn = screen.getByRole('button', { name: /next month/i });
    expect(nextBtn).toBeDisabled();
  });

  it('enables next month button after navigating back', () => {
    renderHeatmap();

    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    const nextBtn = screen.getByRole('button', { name: /next month/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it('navigating back then forward returns to current month', () => {
    renderHeatmap();

    const now = new Date();
    const currentLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(screen.getByText(currentLabel)).toBeInTheDocument();
  });

  it('renders the legend', () => {
    renderHeatmap();
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('shows singular "activity" for count of 1', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}-03`;
    renderHeatmap({ [key]: 1 });

    const cell = screen.getByTitle(`${key}: 1 activity`);
    expect(cell).toBeInTheDocument();
  });

  it('renders empty state gracefully with no activity', () => {
    renderHeatmap({});
    const now = new Date();
    const label = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
