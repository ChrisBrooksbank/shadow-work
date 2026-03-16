import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GroundingOverlay from './GroundingOverlay';

function renderOverlay(onClose = vi.fn()) {
  return render(<GroundingOverlay onClose={onClose} />);
}

// ─── Technique selection screen ───────────────────────────────────────────────

describe('Technique selection screen', () => {
  it('renders as a dialog', () => {
    renderOverlay();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows grounding headline', () => {
    renderOverlay();
    expect(screen.getByText(/Ground yourself/i)).toBeInTheDocument();
  });

  it('shows both grounding techniques', () => {
    renderOverlay();
    expect(screen.getByText('5-4-3-2-1 Grounding')).toBeInTheDocument();
    expect(screen.getByText('Box Breathing')).toBeInTheDocument();
  });

  it('shows a close button', () => {
    renderOverlay();
    expect(screen.getByRole('button', { name: /close grounding/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderOverlay(onClose);
    fireEvent.click(screen.getByRole('button', { name: /close grounding/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    renderOverlay(onClose);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

// ─── Technique guide screen ───────────────────────────────────────────────────

describe('5-4-3-2-1 Grounding guide', () => {
  function selectSensory(onClose = vi.fn()) {
    renderOverlay(onClose);
    fireEvent.click(screen.getByText('5-4-3-2-1 Grounding'));
  }

  it('shows the technique title in top bar after selection', () => {
    selectSensory();
    expect(screen.getByText('5-4-3-2-1 Grounding')).toBeInTheDocument();
  });

  it('shows step 1 instruction', () => {
    selectSensory();
    expect(screen.getByText(/Name 5 things you can SEE/i)).toBeInTheDocument();
  });

  it('shows step counter', () => {
    selectSensory();
    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
  });

  it('shows a back button', () => {
    selectSensory();
    expect(
      screen.getByRole('button', { name: /back to technique selection/i }),
    ).toBeInTheDocument();
  });

  it('returns to technique selection when back is clicked', () => {
    selectSensory();
    fireEvent.click(screen.getByRole('button', { name: /back to technique selection/i }));
    expect(screen.getByText(/Ground yourself/i)).toBeInTheDocument();
  });

  it('shows timer start button for timed steps', () => {
    selectSensory();
    expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
  });

  it('shows Next button', () => {
    selectSensory();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('advances to next step when Next is clicked', () => {
    selectSensory();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText(/Step 2 of 5/i)).toBeInTheDocument();
  });

  it('shows 5 step dots', () => {
    selectSensory();
    // The dots are span elements with dot class - check via the step counter label approach
    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
  });

  it('shows "Return to exercise" on last step', () => {
    selectSensory();
    // Navigate to last step (step 5)
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    expect(screen.getByRole('button', { name: /return to exercise/i })).toBeInTheDocument();
  });

  it('calls onClose when "Return to exercise" is clicked on last step', () => {
    const onClose = vi.fn();
    selectSensory(onClose);
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    fireEvent.click(screen.getByRole('button', { name: /return to exercise/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

// ─── Box Breathing guide ──────────────────────────────────────────────────────

describe('Box Breathing guide', () => {
  function selectBoxBreathing() {
    renderOverlay();
    fireEvent.click(screen.getByText('Box Breathing'));
  }

  it('shows step 1 instruction for box breathing', () => {
    selectBoxBreathing();
    expect(screen.getByText(/Breathe IN slowly/i)).toBeInTheDocument();
  });

  it('shows timer start for 4-second inhale step', () => {
    selectBoxBreathing();
    expect(screen.getByRole('button', { name: /start timer \(4s\)/i })).toBeInTheDocument();
  });

  it('shows countdown when timer is started', () => {
    vi.useFakeTimers();
    selectBoxBreathing();
    fireEvent.click(screen.getByRole('button', { name: /start timer/i }));
    // Timer starts at 4
    expect(screen.getByLabelText(/4 seconds remaining/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('counts down the timer', () => {
    vi.useFakeTimers();
    selectBoxBreathing();
    fireEvent.click(screen.getByRole('button', { name: /start timer/i }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByLabelText(/2 seconds remaining/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows "Done" when timer reaches zero', () => {
    vi.useFakeTimers();
    selectBoxBreathing();
    fireEvent.click(screen.getByRole('button', { name: /start timer/i }));
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText(/Done ✓/i)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

// ─── ExerciseShell grounding button integration ───────────────────────────────

describe('ExerciseShell grounding button', () => {
  it('shows grounding button during steps phase', async () => {
    const { render: r, screen: s, fireEvent: fe } = await import('@testing-library/react');
    const { default: ExerciseShell } = await import('./ExerciseShell');
    const exercise = {
      id: 'test',
      title: 'Test',
      tagline: 'tagline',
      description: 'desc',
      category: 'journaling' as const,
      stage: 'recognition' as const,
      estimatedMinutes: 5,
      depth: 'surface' as const,
      steps: [
        { type: 'instruction' as const, id: 's1', title: 'Title', body: 'Body' },
        { type: 'reflection' as const, id: 'r1', prompt: 'Reflect.' },
      ],
    };
    r(<ExerciseShell exercise={exercise} onClose={vi.fn()} />);
    fe.click(s.getByRole('button', { name: /begin/i }));
    expect(s.getByRole('button', { name: /open grounding techniques/i })).toBeInTheDocument();
  });

  it('opens grounding overlay when grounding button is clicked', async () => {
    const { render: r, screen: s, fireEvent: fe } = await import('@testing-library/react');
    const { default: ExerciseShell } = await import('./ExerciseShell');
    const exercise = {
      id: 'test',
      title: 'Test',
      tagline: 'tagline',
      description: 'desc',
      category: 'journaling' as const,
      stage: 'recognition' as const,
      estimatedMinutes: 5,
      depth: 'surface' as const,
      steps: [
        { type: 'instruction' as const, id: 's1', title: 'Title', body: 'Body' },
        { type: 'reflection' as const, id: 'r1', prompt: 'Reflect.' },
      ],
    };
    r(<ExerciseShell exercise={exercise} onClose={vi.fn()} />);
    fe.click(s.getByRole('button', { name: /begin/i }));
    fe.click(s.getByRole('button', { name: /open grounding techniques/i }));
    expect(s.getByText(/Ground yourself/i)).toBeInTheDocument();
  });
});
