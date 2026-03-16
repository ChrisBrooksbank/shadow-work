import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DreamJournal from './DreamJournal';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../db/hooks', () => ({
  useDreamEntries: vi.fn(),
}));

import { useDreamEntries } from '../db/hooks';
const mockUseDreamEntries = vi.mocked(useDreamEntries);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPage() {
  return render(
    <MemoryRouter>
      <DreamJournal />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockUseDreamEntries.mockReset();
});

describe('DreamJournal page', () => {
  it('shows loading state while data is undefined', () => {
    mockUseDreamEntries.mockReturnValue(undefined);
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders page title', () => {
    mockUseDreamEntries.mockReturnValue([]);
    renderPage();
    expect(screen.getByRole('heading', { name: 'Dream Journal' })).toBeInTheDocument();
  });

  it('shows empty state when no dreams exist', () => {
    mockUseDreamEntries.mockReturnValue([]);
    renderPage();
    expect(screen.getByText('No dreams recorded yet')).toBeInTheDocument();
    expect(screen.getByText(/Complete the Dream Work exercise/)).toBeInTheDocument();
  });

  it('shows entry count when dreams exist', () => {
    mockUseDreamEntries.mockReturnValue([
      {
        id: 'de-1',
        content: 'I was in a dark forest.',
        figures: ['old woman', 'wolf'],
        emotions: ['fear', 'awe'],
        analysisNotes: 'The wolf may represent my aggression.',
        createdAt: new Date('2026-03-10T08:00:00Z'),
      },
    ]);
    renderPage();
    expect(screen.getByText('1 dream recorded.')).toBeInTheDocument();
  });

  it('renders dream content', () => {
    mockUseDreamEntries.mockReturnValue([
      {
        id: 'de-1',
        content: 'I was standing in a burning house.',
        figures: [],
        emotions: [],
        createdAt: new Date('2026-03-10T08:00:00Z'),
      },
    ]);
    renderPage();
    expect(screen.getByText('I was standing in a burning house.')).toBeInTheDocument();
  });

  it('renders figures as tags', () => {
    mockUseDreamEntries.mockReturnValue([
      {
        id: 'de-1',
        content: 'A dream.',
        figures: ['dark figure', 'child'],
        emotions: [],
        createdAt: new Date('2026-03-10T08:00:00Z'),
      },
    ]);
    renderPage();
    expect(screen.getByText('Figures')).toBeInTheDocument();
    expect(screen.getByText('dark figure')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('renders emotions as tags', () => {
    mockUseDreamEntries.mockReturnValue([
      {
        id: 'de-1',
        content: 'A dream.',
        figures: [],
        emotions: ['dread', 'wonder'],
        createdAt: new Date('2026-03-10T08:00:00Z'),
      },
    ]);
    renderPage();
    expect(screen.getByText('Emotions')).toBeInTheDocument();
    expect(screen.getByText('dread')).toBeInTheDocument();
    expect(screen.getByText('wonder')).toBeInTheDocument();
  });

  it('renders analysis notes when present', () => {
    mockUseDreamEntries.mockReturnValue([
      {
        id: 'de-1',
        content: 'A dream.',
        figures: [],
        emotions: [],
        analysisNotes: 'This dream signals unresolved anger.',
        createdAt: new Date('2026-03-10T08:00:00Z'),
      },
    ]);
    renderPage();
    expect(screen.getByText('This dream signals unresolved anger.')).toBeInTheDocument();
  });

  it('does not render figures or emotions sections when empty', () => {
    mockUseDreamEntries.mockReturnValue([
      {
        id: 'de-1',
        content: 'A minimal dream.',
        figures: [],
        emotions: [],
        createdAt: new Date('2026-03-10T08:00:00Z'),
      },
    ]);
    renderPage();
    expect(screen.queryByText('Figures')).not.toBeInTheDocument();
    expect(screen.queryByText('Emotions')).not.toBeInTheDocument();
  });

  it('has a back link to exercises', () => {
    mockUseDreamEntries.mockReturnValue([]);
    renderPage();
    const link = screen.getByRole('link', { name: /Exercises/ });
    expect(link).toHaveAttribute('href', '/exercises');
  });

  it('renders multiple entries', () => {
    mockUseDreamEntries.mockReturnValue([
      {
        id: 'de-1',
        content: 'First dream.',
        figures: ['stranger'],
        emotions: ['fear'],
        createdAt: new Date('2026-03-11T08:00:00Z'),
      },
      {
        id: 'de-2',
        content: 'Second dream.',
        figures: [],
        emotions: ['joy'],
        createdAt: new Date('2026-03-10T08:00:00Z'),
      },
    ]);
    renderPage();
    expect(screen.getByText('2 dreams recorded.')).toBeInTheDocument();
    expect(screen.getByText('First dream.')).toBeInTheDocument();
    expect(screen.getByText('Second dream.')).toBeInTheDocument();
  });
});
