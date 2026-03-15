import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import TriggerPatterns from './TriggerPatterns';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../db/hooks', () => ({
  useTriggerPatterns: vi.fn(),
}));

import { useTriggerPatterns } from '../db/hooks';
const mockUseTriggerPatterns = vi.mocked(useTriggerPatterns);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPage() {
  return render(
    <MemoryRouter>
      <TriggerPatterns />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockUseTriggerPatterns.mockReset();
});

describe('TriggerPatterns page', () => {
  it('shows loading state while data is undefined', () => {
    mockUseTriggerPatterns.mockReturnValue(undefined);
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty state when no logs exist', () => {
    mockUseTriggerPatterns.mockReturnValue({
      totalLogs: 0,
      emotionCounts: {},
      averageIntensity: 0,
      bodyKeywordCounts: {},
      recentLogs: [],
    });
    renderPage();
    expect(screen.getByText('No triggers logged yet')).toBeInTheDocument();
    expect(screen.getByText(/Complete the Trigger Tracking exercise/)).toBeInTheDocument();
  });

  it('renders page title', () => {
    mockUseTriggerPatterns.mockReturnValue({
      totalLogs: 0,
      emotionCounts: {},
      averageIntensity: 0,
      bodyKeywordCounts: {},
      recentLogs: [],
    });
    renderPage();
    expect(screen.getByRole('heading', { name: 'Your Trigger Patterns' })).toBeInTheDocument();
  });

  it('shows total logs and average intensity stats', () => {
    mockUseTriggerPatterns.mockReturnValue({
      totalLogs: 5,
      emotionCounts: { Anger: 3, Fear: 2 },
      averageIntensity: 7.4,
      bodyKeywordCounts: { chest: 3, throat: 1 },
      recentLogs: [],
    });
    renderPage();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('7.4')).toBeInTheDocument();
    expect(screen.getByText('Triggers logged')).toBeInTheDocument();
    expect(screen.getByText('Avg intensity')).toBeInTheDocument();
  });

  it('renders emotion frequency section when logs exist', () => {
    mockUseTriggerPatterns.mockReturnValue({
      totalLogs: 4,
      emotionCounts: { Anger: 3, Shame: 1 },
      averageIntensity: 6,
      bodyKeywordCounts: {},
      recentLogs: [],
    });
    renderPage();
    expect(screen.getByText('Emotion frequency')).toBeInTheDocument();
    expect(screen.getByText('Anger')).toBeInTheDocument();
    expect(screen.getByText('Shame')).toBeInTheDocument();
  });

  it('renders body location keywords when present', () => {
    mockUseTriggerPatterns.mockReturnValue({
      totalLogs: 3,
      emotionCounts: { Fear: 3 },
      averageIntensity: 7,
      bodyKeywordCounts: { chest: 2, stomach: 1 },
      recentLogs: [],
    });
    renderPage();
    expect(screen.getByText('Where you feel it')).toBeInTheDocument();
    expect(screen.getByText('chest')).toBeInTheDocument();
    expect(screen.getByText('stomach')).toBeInTheDocument();
  });

  it('renders recent trigger logs', () => {
    const createdAt = new Date('2026-03-10T12:00:00Z');
    mockUseTriggerPatterns.mockReturnValue({
      totalLogs: 1,
      emotionCounts: { Anger: 1 },
      averageIntensity: 8,
      bodyKeywordCounts: {},
      recentLogs: [
        {
          id: 'tl-1',
          situation: 'My coworker interrupted me again',
          emotion: 'Anger',
          intensity: 8,
          createdAt,
        },
      ],
    });
    renderPage();
    expect(screen.getByText('Recent triggers')).toBeInTheDocument();
    expect(screen.getByText('My coworker interrupted me again')).toBeInTheDocument();
    expect(screen.getByText('8/10')).toBeInTheDocument();
  });

  it('shows percentage when 3+ logs exist', () => {
    mockUseTriggerPatterns.mockReturnValue({
      totalLogs: 4,
      emotionCounts: { Anger: 2, Fear: 2 },
      averageIntensity: 6,
      bodyKeywordCounts: {},
      recentLogs: [],
    });
    renderPage();
    // 2/4 = 50%
    const percentages = screen.getAllByText(/50%/);
    expect(percentages.length).toBeGreaterThan(0);
  });

  it('has a back link to exercises', () => {
    mockUseTriggerPatterns.mockReturnValue({
      totalLogs: 0,
      emotionCounts: {},
      averageIntensity: 0,
      bodyKeywordCounts: {},
      recentLogs: [],
    });
    renderPage();
    const link = screen.getByRole('link', { name: /Exercises/ });
    expect(link).toHaveAttribute('href', '/exercises');
  });
});
