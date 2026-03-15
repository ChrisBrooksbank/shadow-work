import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StepRenderer from './StepRenderer';
import type { ExerciseStep } from '../../data/exercises';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const instructionStep: ExerciseStep = {
  type: 'instruction',
  id: 'step-1',
  title: 'Welcome',
  body: 'Read this carefully.',
};

const instructionStepNoTitle: ExerciseStep = {
  type: 'instruction',
  id: 'step-1b',
  body: 'No title here.',
};

const promptStep: ExerciseStep = {
  type: 'prompt',
  id: 'step-2',
  question: 'How do you feel?',
  placeholder: 'Write here...',
};

const freewriteStep: ExerciseStep = {
  type: 'freewrite',
  id: 'step-3',
  prompt: 'Write freely for a few minutes.',
  placeholder: 'Anything goes...',
};

const freewriteTimedStep: ExerciseStep = {
  type: 'freewrite',
  id: 'step-3t',
  prompt: 'Timed freewrite.',
  durationSeconds: 60,
};

const timedPauseStep: ExerciseStep = {
  type: 'timed-pause',
  id: 'step-4',
  label: 'Breathe deeply',
  durationSeconds: 30,
};

const choiceStep: ExerciseStep = {
  type: 'choice',
  id: 'step-5',
  question: 'Choose your emotion',
  options: ['Happy', 'Sad', 'Angry'],
};

const reflectionStep: ExerciseStep = {
  type: 'reflection',
  id: 'step-6',
  prompt: 'What did you notice?',
  placeholder: 'Final thoughts...',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderStep(
  step: ExerciseStep,
  {
    responses = {},
    previousSteps = [],
    onAdvance = vi.fn(),
    setResponse = vi.fn(),
  }: {
    responses?: Record<string, string>;
    previousSteps?: ExerciseStep[];
    onAdvance?: () => void;
    setResponse?: (id: string, val: string) => void;
  } = {},
) {
  return render(
    <StepRenderer
      step={step}
      responses={responses}
      previousSteps={previousSteps}
      onAdvance={onAdvance}
      setResponse={setResponse}
    />,
  );
}

// ─── instruction ──────────────────────────────────────────────────────────────

describe('InstructionStep', () => {
  it('renders title and body', () => {
    renderStep(instructionStep);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Read this carefully.')).toBeInTheDocument();
  });

  it('renders without title when title is absent', () => {
    renderStep(instructionStepNoTitle);
    expect(screen.getByText('No title here.')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('calls onAdvance when Continue is clicked', () => {
    const onAdvance = vi.fn();
    renderStep(instructionStep, { onAdvance });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(onAdvance).toHaveBeenCalledOnce();
  });
});

// ─── prompt ───────────────────────────────────────────────────────────────────

describe('PromptStep', () => {
  it('renders the question', () => {
    renderStep(promptStep);
    expect(screen.getByText('How do you feel?')).toBeInTheDocument();
  });

  it('displays the current response value', () => {
    renderStep(promptStep, { responses: { 'step-2': 'Anxious' } });
    expect(screen.getByRole('textbox')).toHaveValue('Anxious');
  });

  it('calls setResponse on textarea change', () => {
    const setResponse = vi.fn();
    renderStep(promptStep, { setResponse });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Pretty good' } });
    expect(setResponse).toHaveBeenCalledWith('step-2', 'Pretty good');
  });

  it('calls onAdvance when Continue is clicked', () => {
    const onAdvance = vi.fn();
    renderStep(promptStep, { onAdvance });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(onAdvance).toHaveBeenCalledOnce();
  });
});

// ─── freewrite ────────────────────────────────────────────────────────────────

describe('FreewriteStep', () => {
  it('renders the prompt', () => {
    renderStep(freewriteStep);
    expect(screen.getByText('Write freely for a few minutes.')).toBeInTheDocument();
  });

  it('does not show a timer ring when durationSeconds is not set', () => {
    renderStep(freewriteStep);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('shows a timer ring when durationSeconds is set', () => {
    renderStep(freewriteTimedStep);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('calls setResponse on textarea change', () => {
    const setResponse = vi.fn();
    renderStep(freewriteStep, { setResponse });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Flowing words' } });
    expect(setResponse).toHaveBeenCalledWith('step-3', 'Flowing words');
  });

  it('calls onAdvance when Continue is clicked', () => {
    const onAdvance = vi.fn();
    renderStep(freewriteStep, { onAdvance });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(onAdvance).toHaveBeenCalledOnce();
  });
});

// ─── timed-pause ──────────────────────────────────────────────────────────────

describe('TimedPauseStep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the label and timer ring', () => {
    renderStep(timedPauseStep);
    expect(screen.getByText('Breathe deeply')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('does not show Continue button before timer completes', () => {
    renderStep(timedPauseStep);
    expect(screen.queryByRole('button', { name: /continue/i })).toBeNull();
  });

  it('shows Continue button after the full duration elapses', () => {
    renderStep(timedPauseStep);
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('calls onAdvance when Continue is clicked after timer finishes', () => {
    const onAdvance = vi.fn();
    renderStep(timedPauseStep, { onAdvance });
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(onAdvance).toHaveBeenCalledOnce();
  });
});

// ─── choice ───────────────────────────────────────────────────────────────────

describe('ChoiceStep', () => {
  it('renders the question and all options', () => {
    renderStep(choiceStep);
    expect(screen.getByText('Choose your emotion')).toBeInTheDocument();
    expect(screen.getByText('Happy')).toBeInTheDocument();
    expect(screen.getByText('Sad')).toBeInTheDocument();
    expect(screen.getByText('Angry')).toBeInTheDocument();
  });

  it('disables Continue when no option is selected', () => {
    renderStep(choiceStep, { responses: {} });
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('enables Continue when an option is already selected', () => {
    renderStep(choiceStep, { responses: { 'step-5': 'Happy' } });
    expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
  });

  it('calls setResponse when an option is clicked', () => {
    const setResponse = vi.fn();
    renderStep(choiceStep, { setResponse });
    fireEvent.click(screen.getByText('Sad'));
    expect(setResponse).toHaveBeenCalledWith('step-5', 'Sad');
  });

  it('calls onAdvance when Continue is clicked with a selection', () => {
    const onAdvance = vi.fn();
    renderStep(choiceStep, { responses: { 'step-5': 'Angry' }, onAdvance });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(onAdvance).toHaveBeenCalledOnce();
  });
});

// ─── reflection ───────────────────────────────────────────────────────────────

describe('ReflectionStep', () => {
  it('renders the prompt', () => {
    renderStep(reflectionStep);
    expect(screen.getByText('What did you notice?')).toBeInTheDocument();
  });

  it('shows a Complete button', () => {
    renderStep(reflectionStep);
    expect(screen.getByRole('button', { name: /complete/i })).toBeInTheDocument();
  });

  it('calls onAdvance when Complete is clicked', () => {
    const onAdvance = vi.fn();
    renderStep(reflectionStep, { onAdvance });
    fireEvent.click(screen.getByRole('button', { name: /complete/i }));
    expect(onAdvance).toHaveBeenCalledOnce();
  });

  it('shows previous text responses when provided', () => {
    renderStep(reflectionStep, {
      responses: { 'step-2': 'I felt anxious.' },
      previousSteps: [promptStep],
    });
    expect(screen.getByText('I felt anxious.')).toBeInTheDocument();
  });

  it('shows the question label alongside the previous response', () => {
    renderStep(reflectionStep, {
      responses: { 'step-2': 'Some text' },
      previousSteps: [promptStep],
    });
    expect(screen.getByText('How do you feel?')).toBeInTheDocument();
  });

  it('does not show the responses section when there are no prior text responses', () => {
    renderStep(reflectionStep, { responses: {}, previousSteps: [instructionStep] });
    expect(screen.queryByText('Your responses')).toBeNull();
  });

  it('calls setResponse on textarea change', () => {
    const setResponse = vi.fn();
    renderStep(reflectionStep, { setResponse });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Insight' } });
    expect(setResponse).toHaveBeenCalledWith('step-6', 'Insight');
  });
});
