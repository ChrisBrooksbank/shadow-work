import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JournalEntry from './JournalEntry';
import type { JournalEntry as JournalEntryType } from '../db/schema';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockDbGet = vi.fn();
const mockDbAdd = vi.fn().mockResolvedValue(undefined);
const mockDbUpdate = vi.fn().mockResolvedValue(undefined);

vi.mock('../db/index', () => ({
  db: {
    journalEntries: {
      get: (...args: unknown[]) => mockDbGet(...args),
      add: (...args: unknown[]) => mockDbAdd(...args),
      update: (...args: unknown[]) => mockDbUpdate(...args),
    },
  },
}));

vi.mock('../db/streak', () => ({
  recalculateStreak: vi.fn().mockResolvedValue(undefined),
}));

const mockGetRandomPrompt = vi.fn();
vi.mock('../data/prompts', () => ({
  getRandomPrompt: (...args: unknown[]) => mockGetRandomPrompt(...args),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<JournalEntryType> = {}): JournalEntryType {
  return {
    id: 'entry-123',
    content: 'Existing journal content.',
    tags: [],
    createdAt: new Date('2026-03-15T09:00:00'),
    updatedAt: new Date('2026-03-15T09:05:00'),
    ...overrides,
  };
}

/** Render at /journal/new (new entry mode) */
function renderNew() {
  return render(
    <MemoryRouter initialEntries={['/journal/new']}>
      <Routes>
        <Route path="/journal/new" element={<JournalEntry />} />
      </Routes>
    </MemoryRouter>,
  );
}

/** Render at /journal/:id (existing entry mode) */
function renderExisting(id = 'entry-123') {
  return render(
    <MemoryRouter initialEntries={[`/journal/${id}`]}>
      <Routes>
        <Route path="/journal/:id" element={<JournalEntry />} />
      </Routes>
    </MemoryRouter>,
  );
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockNavigate.mockClear();
  mockDbGet.mockResolvedValue(undefined);
  mockDbAdd.mockClear();
  mockDbUpdate.mockClear();
  mockGetRandomPrompt.mockReturnValue({ id: 'self-1', text: 'What are you hiding from yourself?' });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('JournalEntry — new entry mode', () => {
  it('renders the textarea for writing', () => {
    renderNew();
    expect(screen.getByRole('textbox', { name: /journal entry content/i })).toBeInTheDocument();
  });

  it('shows "Not saved yet" status initially', () => {
    renderNew();
    expect(screen.getByText(/not saved yet/i)).toBeInTheDocument();
  });

  it('shows "Add a prompt" button', () => {
    renderNew();
    expect(screen.getByText(/\+ add a prompt/i)).toBeInTheDocument();
  });

  it('shows prompt box when "Add a prompt" is clicked', () => {
    renderNew();
    fireEvent.click(screen.getByText(/\+ add a prompt/i));
    expect(screen.getByText('What are you hiding from yourself?')).toBeInTheDocument();
  });

  it('shows "New prompt" and "Dismiss" buttons when prompt is shown', () => {
    renderNew();
    fireEvent.click(screen.getByText(/\+ add a prompt/i));
    expect(screen.getByRole('button', { name: /new prompt/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
  });

  it('cycles to a new prompt when "New prompt" is clicked', () => {
    mockGetRandomPrompt
      .mockReturnValueOnce({ id: 'self-1', text: 'First prompt.' })
      .mockReturnValueOnce({ id: 'self-2', text: 'Second prompt.' });

    renderNew();
    fireEvent.click(screen.getByText(/\+ add a prompt/i));
    expect(screen.getByText('First prompt.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /new prompt/i }));
    expect(screen.getByText('Second prompt.')).toBeInTheDocument();
  });

  it('dismisses the prompt when "Dismiss" is clicked', () => {
    renderNew();
    fireEvent.click(screen.getByText(/\+ add a prompt/i));
    expect(screen.getByText('What are you hiding from yourself?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByText('What are you hiding from yourself?')).not.toBeInTheDocument();
    expect(screen.getByText(/\+ add a prompt/i)).toBeInTheDocument();
  });

  it('navigates back to /journal when back button is clicked', () => {
    renderNew();
    fireEvent.click(screen.getByRole('button', { name: /back to journal/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/journal');
  });

  it('auto-saves after debounce delay when content is typed', async () => {
    vi.useFakeTimers();
    try {
      renderNew();
      const textarea = screen.getByRole('textbox', { name: /journal entry content/i });
      fireEvent.change(textarea, { target: { value: 'My shadow work entry.' } });

      expect(mockDbAdd).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      expect(mockDbAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'My shadow work entry.',
          tags: [],
        }),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not auto-save when nothing has been typed', async () => {
    vi.useFakeTimers();
    try {
      renderNew();
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(mockDbAdd).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('adds a tag when the Add button is clicked', () => {
    renderNew();
    const tagInput = screen.getByRole('textbox', { name: /tag input/i });
    fireEvent.change(tagInput, { target: { value: 'shadow' } });
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));

    expect(screen.getByText('shadow')).toBeInTheDocument();
  });

  it('adds a tag when Enter is pressed in the tag input', () => {
    renderNew();
    const tagInput = screen.getByRole('textbox', { name: /tag input/i });
    fireEvent.change(tagInput, { target: { value: 'anger' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });

    expect(screen.getByText('anger')).toBeInTheDocument();
  });

  it('clears the tag input after adding a tag', () => {
    renderNew();
    const tagInput = screen.getByRole('textbox', { name: /tag input/i });
    fireEvent.change(tagInput, { target: { value: 'shadow' } });
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));

    expect(tagInput).toHaveValue('');
  });

  it('does not add duplicate tags', () => {
    renderNew();
    const tagInput = screen.getByRole('textbox', { name: /tag input/i });
    fireEvent.change(tagInput, { target: { value: 'shadow' } });
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));
    fireEvent.change(tagInput, { target: { value: 'shadow' } });
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));

    const tags = screen.getAllByText('shadow');
    expect(tags).toHaveLength(1);
  });

  it('removes a tag when the × button is clicked', () => {
    renderNew();
    const tagInput = screen.getByRole('textbox', { name: /tag input/i });
    fireEvent.change(tagInput, { target: { value: 'fear' } });
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));

    expect(screen.getByText('fear')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /remove tag fear/i }));
    expect(screen.queryByText('fear')).not.toBeInTheDocument();
  });

  it('normalises tag to lowercase with hyphens', () => {
    renderNew();
    const tagInput = screen.getByRole('textbox', { name: /tag input/i });
    fireEvent.change(tagInput, { target: { value: 'Inner Child' } });
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));

    expect(screen.getByText('inner-child')).toBeInTheDocument();
  });

  it('"Add" button is disabled when tag input is empty', () => {
    renderNew();
    expect(screen.getByRole('button', { name: /add tag/i })).toBeDisabled();
  });
});

describe('JournalEntry — existing entry mode', () => {
  it('shows loading state (returns null) while entry is loading', () => {
    mockDbGet.mockReturnValue(new Promise(() => {}));
    const { container } = renderExisting();
    expect(container.firstChild).toBeNull();
  });

  it('renders existing entry content once loaded', async () => {
    const entry = makeEntry({ content: 'Existing journal content.' });
    mockDbGet.mockResolvedValue(entry);

    renderExisting();

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /journal entry content/i })).toHaveValue(
        'Existing journal content.',
      );
    });
  });

  it('shows existing prompt when entry has one', async () => {
    const entry = makeEntry({ prompt: 'What are you projecting?' });
    mockDbGet.mockResolvedValue(entry);

    renderExisting();

    await waitFor(() => {
      expect(screen.getByText('What are you projecting?')).toBeInTheDocument();
    });
  });

  it('shows existing tags when entry has tags', async () => {
    const entry = makeEntry({ tags: ['projection', 'anger'] });
    mockDbGet.mockResolvedValue(entry);

    renderExisting();

    await waitFor(() => {
      expect(screen.getByText('projection')).toBeInTheDocument();
      expect(screen.getByText('anger')).toBeInTheDocument();
    });
  });

  it('shows the created timestamp', async () => {
    const entry = makeEntry({ createdAt: new Date('2026-03-15T09:00:00') });
    mockDbGet.mockResolvedValue(entry);

    renderExisting();

    await waitFor(() => {
      expect(screen.getByText(/created/i)).toBeInTheDocument();
    });
  });

  it('saves changes to existing entry after debounce', async () => {
    const entry = makeEntry();
    mockDbGet.mockResolvedValue(entry);

    renderExisting();

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /journal entry content/i })).toBeInTheDocument();
    });

    vi.useFakeTimers();
    try {
      const textarea = screen.getByRole('textbox', { name: /journal entry content/i });
      fireEvent.change(textarea, { target: { value: 'Updated content.' } });

      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      expect(mockDbUpdate).toHaveBeenCalledWith(
        'entry-123',
        expect.objectContaining({ content: 'Updated content.' }),
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
