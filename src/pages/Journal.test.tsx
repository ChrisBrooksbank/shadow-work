import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Journal from './Journal';
import type { JournalEntry } from '../db/schema';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../db/hooks', () => ({
  useJournalEntries: vi.fn(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

import * as hooks from '../db/hooks';

function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: crypto.randomUUID(),
    content: 'Some journal content here.',
    tags: [],
    createdAt: new Date('2026-03-15T10:00:00'),
    updatedAt: new Date('2026-03-15T10:00:00'),
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <Journal />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.mocked(hooks.useJournalEntries).mockReturnValue([]);
  mockNavigate.mockClear();
});

describe('Journal list page', () => {
  it('renders the Journal heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /journal/i })).toBeInTheDocument();
  });

  it('shows loading state when entries are undefined', () => {
    vi.mocked(hooks.useJournalEntries).mockReturnValue(undefined);
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    renderPage();
    expect(screen.getByText('No entries yet')).toBeInTheDocument();
    expect(screen.getByText(/start writing/i)).toBeInTheDocument();
  });

  it('renders a "Begin your first entry" button in empty state', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /begin your first entry/i })).toBeInTheDocument();
  });

  it('navigates to /journal/new when "+ New" button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /new journal entry/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/journal/new');
  });

  it('navigates to /journal/new from empty state button', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /begin your first entry/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/journal/new');
  });

  it('renders journal entries when present', () => {
    const entry = makeEntry({ content: 'I noticed my anger.' });
    vi.mocked(hooks.useJournalEntries).mockReturnValue([entry]);
    renderPage();
    expect(screen.getByText('I noticed my anger.')).toBeInTheDocument();
  });

  it('shows date header for grouped entries', () => {
    const entry = makeEntry({ createdAt: new Date('2026-03-15T10:00:00') });
    vi.mocked(hooks.useJournalEntries).mockReturnValue([entry]);
    renderPage();
    // Header format: "Sunday, March 15"
    expect(screen.getByText(/march 15/i)).toBeInTheDocument();
  });

  it('navigates to /journal/:id when an entry is clicked', () => {
    const entry = makeEntry({ id: 'abc-123', content: 'Deep reflection.' });
    vi.mocked(hooks.useJournalEntries).mockReturnValue([entry]);
    renderPage();
    fireEvent.click(screen.getByText('Deep reflection.'));
    expect(mockNavigate).toHaveBeenCalledWith('/journal/abc-123');
  });

  it('truncates long content to preview', () => {
    const longContent = 'A'.repeat(200);
    const entry = makeEntry({ content: longContent });
    vi.mocked(hooks.useJournalEntries).mockReturnValue([entry]);
    renderPage();
    expect(screen.getByText(/A{100}…/)).toBeInTheDocument();
  });

  it('shows prompt label when entry has a prompt', () => {
    const entry = makeEntry({ prompt: 'What are you avoiding?' });
    vi.mocked(hooks.useJournalEntries).mockReturnValue([entry]);
    renderPage();
    expect(screen.getByText('What are you avoiding?')).toBeInTheDocument();
  });

  it('shows tags when entry has tags', () => {
    const entry = makeEntry({ tags: ['shadow', 'anger'] });
    vi.mocked(hooks.useJournalEntries).mockReturnValue([entry]);
    renderPage();
    expect(screen.getByText('shadow · anger')).toBeInTheDocument();
  });

  it('groups entries by date', () => {
    const day1 = makeEntry({
      id: '1',
      createdAt: new Date('2026-03-15T10:00:00'),
      content: 'Day one.',
    });
    const day2 = makeEntry({
      id: '2',
      createdAt: new Date('2026-03-14T09:00:00'),
      content: 'Day two.',
    });
    vi.mocked(hooks.useJournalEntries).mockReturnValue([day1, day2]);
    renderPage();
    expect(screen.getByText('Day one.')).toBeInTheDocument();
    expect(screen.getByText('Day two.')).toBeInTheDocument();
    // Two distinct date headers
    expect(screen.getByText(/march 15/i)).toBeInTheDocument();
    expect(screen.getByText(/march 14/i)).toBeInTheDocument();
  });

  it('shows "Empty entry" for entries with no content', () => {
    const entry = makeEntry({ content: '' });
    vi.mocked(hooks.useJournalEntries).mockReturnValue([entry]);
    renderPage();
    expect(screen.getByText('Empty entry')).toBeInTheDocument();
  });
});
