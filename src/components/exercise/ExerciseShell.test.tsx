import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExerciseShell from './ExerciseShell';
import type { Exercise } from '../../data/exercises';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const surfaceExercise: Exercise = {
  id: 'test-surface',
  title: 'Test Surface Exercise',
  tagline: 'A surface level exercise.',
  description: 'A simple test exercise for unit tests.',
  category: 'journaling',
  stage: 'recognition',
  estimatedMinutes: 10,
  depth: 'surface',
  steps: [
    { type: 'instruction', id: 'step-1', title: 'Welcome', body: 'Read this.' },
    { type: 'prompt', id: 'step-2', question: 'What do you notice?' },
    { type: 'reflection', id: 'step-r', prompt: 'Final thoughts.' },
  ],
};

const deepExercise: Exercise = {
  ...surfaceExercise,
  id: 'test-deep',
  title: 'Test Deep Exercise',
  depth: 'deep',
};

const abyssExercise: Exercise = {
  ...surfaceExercise,
  id: 'test-abyss',
  title: 'Test Abyss Exercise',
  depth: 'abyss',
};

function renderShell(exercise = surfaceExercise, onClose = vi.fn(), onComplete = vi.fn()) {
  return render(<ExerciseShell exercise={exercise} onClose={onClose} onComplete={onComplete} />);
}

// ─── Intro phase ──────────────────────────────────────────────────────────────

describe('Intro phase', () => {
  it('renders the exercise title', () => {
    renderShell();
    expect(screen.getByText('Test Surface Exercise')).toBeInTheDocument();
  });

  it('renders the exercise tagline', () => {
    renderShell();
    expect(screen.getByText('A surface level exercise.')).toBeInTheDocument();
  });

  it('renders the exercise description', () => {
    renderShell();
    expect(screen.getByText('A simple test exercise for unit tests.')).toBeInTheDocument();
  });

  it('shows a Begin button', () => {
    renderShell();
    expect(screen.getByRole('button', { name: /begin/i })).toBeInTheDocument();
  });

  it('shows the estimated duration', () => {
    renderShell();
    expect(screen.getByText(/10 min/)).toBeInTheDocument();
  });

  it('shows a close button', () => {
    renderShell();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderShell(surfaceExercise, onClose);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows the Surface depth badge', () => {
    renderShell(surfaceExercise);
    expect(screen.getByText('Surface')).toBeInTheDocument();
  });

  it('shows the Deep depth badge', () => {
    renderShell(deepExercise);
    expect(screen.getByText('Deep')).toBeInTheDocument();
  });

  it('shows the Abyss depth badge', () => {
    renderShell(abyssExercise);
    expect(screen.getByText('Abyss')).toBeInTheDocument();
  });

  it('renders as a dialog', () => {
    renderShell();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

// ─── Safety check (abyss only) ────────────────────────────────────────────────

describe('Safety check phase', () => {
  it('shows the safety disclaimer after Begin on abyss exercise', () => {
    renderShell(abyssExercise);
    fireEvent.click(screen.getByRole('button', { name: /begin/i }));
    expect(screen.getByText(/Abyss-Level Exercise/i)).toBeInTheDocument();
  });

  it('does NOT show safety check for surface exercise', () => {
    renderShell(surfaceExercise);
    fireEvent.click(screen.getByRole('button', { name: /begin/i }));
    expect(screen.queryByText(/Abyss-Level Exercise/i)).not.toBeInTheDocument();
  });

  it('shows acknowledgment button on safety screen', () => {
    renderShell(abyssExercise);
    fireEvent.click(screen.getByRole('button', { name: /begin/i }));
    expect(screen.getByRole('button', { name: /I understand/i })).toBeInTheDocument();
  });

  it('advances to steps after acknowledging safety disclaimer', () => {
    renderShell(abyssExercise);
    fireEvent.click(screen.getByRole('button', { name: /begin/i }));
    fireEvent.click(screen.getByRole('button', { name: /I understand/i }));
    // Should now be on first step
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
});

// ─── Steps phase ──────────────────────────────────────────────────────────────

describe('Steps phase', () => {
  function advanceToSteps(exercise = surfaceExercise) {
    renderShell(exercise);
    fireEvent.click(screen.getByRole('button', { name: /begin/i }));
  }

  it('shows step content after Begin', () => {
    advanceToSteps();
    expect(screen.getByText('Read this.')).toBeInTheDocument();
  });

  it('shows progress bar during steps', () => {
    advanceToSteps();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows step label in header', () => {
    advanceToSteps();
    expect(screen.getByText(/Step 1 of/i)).toBeInTheDocument();
  });

  it('shows close button during steps', () => {
    advanceToSteps();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('does not show back button on first step', () => {
    advanceToSteps();
    expect(screen.queryByRole('button', { name: /go back/i })).not.toBeInTheDocument();
  });

  it('shows back button after advancing past first step', () => {
    advanceToSteps();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('navigates back when back button is clicked', () => {
    advanceToSteps();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    // Now on step 2
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    // Back on step 1
    expect(screen.getByText('Read this.')).toBeInTheDocument();
  });
});

// ─── Reflection phase ─────────────────────────────────────────────────────────

describe('Reflection phase', () => {
  function advanceToReflection() {
    renderShell();
    fireEvent.click(screen.getByRole('button', { name: /begin/i }));
    // Step 1: instruction — click Continue
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    // Step 2: prompt — click Continue
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  }

  it('shows "Reflection" label in header', () => {
    advanceToReflection();
    expect(screen.getByText('Reflection')).toBeInTheDocument();
  });

  it('shows the reflection prompt', () => {
    advanceToReflection();
    expect(screen.getByText('Final thoughts.')).toBeInTheDocument();
  });

  it('shows a Complete button', () => {
    advanceToReflection();
    expect(screen.getByRole('button', { name: /complete/i })).toBeInTheDocument();
  });
});

// ─── Complete phase ───────────────────────────────────────────────────────────

describe('Complete phase', () => {
  function advanceToComplete() {
    const onComplete = vi.fn();
    const onClose = vi.fn();
    render(<ExerciseShell exercise={surfaceExercise} onClose={onClose} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /begin/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i })); // step 1
    fireEvent.click(screen.getByRole('button', { name: /continue/i })); // step 2
    fireEvent.click(screen.getByRole('button', { name: /complete/i })); // reflection
    return { onComplete, onClose };
  }

  it('shows "Exercise complete" heading', () => {
    advanceToComplete();
    expect(screen.getByText(/exercise complete/i)).toBeInTheDocument();
  });

  it('shows a Done button', () => {
    advanceToComplete();
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
  });

  it('calls onComplete with responses when Done is clicked', () => {
    const { onComplete } = advanceToComplete();
    fireEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith(expect.any(Object));
  });

  it('calls onClose after Done is clicked', () => {
    const { onClose } = advanceToComplete();
    fireEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
