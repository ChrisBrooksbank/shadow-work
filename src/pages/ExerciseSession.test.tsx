import 'fake-indexeddb/auto';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ExerciseSession from './ExerciseSession';
import { db } from '../db/index';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// Stub ExerciseShell to avoid portal/animation complexity
vi.mock('../components/exercise/ExerciseShell', () => ({
  default: vi.fn(
    ({
      onComplete,
      onSaveReflections,
      onClose,
    }: {
      onComplete?: (r: Record<string, string>) => void;
      onSaveReflections?: (r: Record<string, string>) => void;
      onClose: () => void;
    }) => (
      <div data-testid="exercise-shell">
        <button onClick={() => onComplete?.({ 'step-1': 'my answer' })}>Done</button>
        <button onClick={() => onSaveReflections?.({ 'step-1': 'my answer' })}>
          Save to journal
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ),
  ),
}));

Object.defineProperty(navigator, 'vibrate', { value: vi.fn(), writable: true });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderForExercise(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/exercises/${id}`]}>
      <Routes>
        <Route path="/exercises/:id" element={<ExerciseSession />} />
      </Routes>
    </MemoryRouter>,
  );
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(async () => {
  mockNavigate.mockClear();
  await Promise.all([
    db.exerciseCompletions.clear(),
    db.journalEntries.clear(),
    db.streaks.clear(),
    db.triggerLogs.clear(),
    db.dreamEntries.clear(),
  ]);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ExerciseSession', () => {
  it('renders not-found message for unknown exercise id', () => {
    renderForExercise('unknown-exercise');
    expect(screen.getByText(/exercise not found/i)).toBeInTheDocument();
  });

  it('renders ExerciseShell for a valid exercise', () => {
    renderForExercise('shadow-journaling');
    expect(screen.getByTestId('exercise-shell')).toBeInTheDocument();
  });

  it('close button navigates to /exercises', () => {
    renderForExercise('shadow-journaling');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockNavigate).toHaveBeenCalledWith('/exercises');
  });

  it('Done stores completion in exerciseCompletions and navigates to /exercises', async () => {
    renderForExercise('shadow-journaling');
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(async () => {
      const completions = await db.exerciseCompletions.toArray();
      expect(completions).toHaveLength(1);
      expect(completions[0]!.exerciseId).toBe('shadow-journaling');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/exercises');
    });
  });

  it('Done stores responses in the completion record', async () => {
    renderForExercise('shadow-journaling');
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(async () => {
      const completions = await db.exerciseCompletions.toArray();
      expect(completions[0]!.responses).toEqual({ 'step-1': 'my answer' });
    });
  });

  it('Save to journal stores completion AND a journal entry', async () => {
    renderForExercise('shadow-journaling');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(async () => {
      const completions = await db.exerciseCompletions.toArray();
      const journals = await db.journalEntries.toArray();
      expect(completions).toHaveLength(1);
      expect(journals).toHaveLength(1);
    });
  });

  it('Save to journal links the journal entry to the exercise', async () => {
    renderForExercise('shadow-journaling');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(async () => {
      const journals = await db.journalEntries.toArray();
      expect(journals[0]!.exerciseId).toBe('shadow-journaling');
    });
  });

  it('Save to journal includes exercise responses in journal content', async () => {
    renderForExercise('shadow-journaling');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(async () => {
      const journals = await db.journalEntries.toArray();
      expect(journals[0]!.content).toContain('my answer');
    });
  });

  it('Save to journal navigates to /journal', async () => {
    renderForExercise('shadow-journaling');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/journal');
    });
  });

  it('completion updates the streak', async () => {
    renderForExercise('shadow-journaling');
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(async () => {
      const streak = await db.streaks.get('current');
      expect(streak).toBeDefined();
      expect(streak!.totalActiveDays).toBe(1);
    });
  });
});

describe('ExerciseSession — inner-child', () => {
  it('Done stores completion and navigates to /exercises', async () => {
    renderForExercise('inner-child');
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(async () => {
      const completions = await db.exerciseCompletions.toArray();
      expect(completions).toHaveLength(1);
      expect(completions[0]!.exerciseId).toBe('inner-child');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/exercises');
    });
  });

  it('Save to journal stores completion AND a journal entry with letter tag', async () => {
    renderForExercise('inner-child');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(async () => {
      const completions = await db.exerciseCompletions.toArray();
      const journals = await db.journalEntries.toArray();
      expect(completions).toHaveLength(1);
      expect(journals).toHaveLength(1);
      expect(journals[0]!.tags).toContain('letter');
    });
  });

  it('Save to journal formats the entry under "Letter to My Younger Self"', async () => {
    renderForExercise('inner-child');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(async () => {
      const journals = await db.journalEntries.toArray();
      expect(journals[0]!.content).toContain('Letter to My Younger Self');
    });
  });

  it('Save to journal uses the inner-child letter format (not the generic bundler)', async () => {
    renderForExercise('inner-child');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(async () => {
      const journals = await db.journalEntries.toArray();
      // The inner-child formatter produces a "Letter to My Younger Self" heading,
      // confirming it uses the specialized format rather than the generic bundler.
      expect(journals[0]!.content).toContain('Letter to My Younger Self');
    });
  });

  it('Save to journal navigates to /journal', async () => {
    renderForExercise('inner-child');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/journal');
    });
  });

  it('Save to journal links the entry to the inner-child exercise', async () => {
    renderForExercise('inner-child');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(async () => {
      const journals = await db.journalEntries.toArray();
      expect(journals[0]!.exerciseId).toBe('inner-child');
    });
  });
});

describe('ExerciseSession — active-imagination', () => {
  it('Done stores completion and navigates to /exercises', async () => {
    renderForExercise('active-imagination');
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(async () => {
      const completions = await db.exerciseCompletions.toArray();
      expect(completions).toHaveLength(1);
      expect(completions[0]!.exerciseId).toBe('active-imagination');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/exercises');
    });
  });

  it('Save to journal stores completion AND a journal entry with encounter tag', async () => {
    renderForExercise('active-imagination');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(async () => {
      const completions = await db.exerciseCompletions.toArray();
      const journals = await db.journalEntries.toArray();
      expect(completions).toHaveLength(1);
      expect(journals).toHaveLength(1);
      expect(journals[0]!.tags).toContain('encounter');
    });
  });

  it('Save to journal formats the entry under "Active Imagination — The Encounter"', async () => {
    renderForExercise('active-imagination');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(async () => {
      const journals = await db.journalEntries.toArray();
      expect(journals[0]!.content).toContain('Active Imagination — The Encounter');
    });
  });

  it('Save to journal links the entry to active-imagination exercise', async () => {
    renderForExercise('active-imagination');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(async () => {
      const journals = await db.journalEntries.toArray();
      expect(journals[0]!.exerciseId).toBe('active-imagination');
    });
  });

  it('Save to journal navigates to /journal', async () => {
    renderForExercise('active-imagination');
    fireEvent.click(screen.getByRole('button', { name: 'Save to journal' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/journal');
    });
  });
});
