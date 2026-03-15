import { useState, useCallback } from 'react';
import type { Exercise, ExerciseStep } from '../data/exercises';

export type FlowPhase = 'intro' | 'safety-check' | 'steps' | 'reflection' | 'complete';

export interface UseExerciseFlowReturn {
  phase: FlowPhase;
  currentStepIndex: number;
  currentStep: ExerciseStep | null;
  /** Number of steps before the final reflection step. */
  totalSteps: number;
  /** 0–1 completion fraction, useful for a progress bar. */
  progress: number;
  responses: Record<string, string>;
  /** Whether the user can navigate backward from the current position. */
  canGoBack: boolean;
  startedAt: Date;
  /** Move forward: intro → (safety-check) → steps → reflection → complete. */
  advance: () => void;
  /** Move back one step/phase (no-op from intro or complete). */
  goBack: () => void;
  /** Store a user response for a given step ID. */
  setResponse: (stepId: string, value: string) => void;
}

export function useExerciseFlow(exercise: Exercise): UseExerciseFlowReturn {
  const [phase, setPhase] = useState<FlowPhase>('intro');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  // Capture start time once — lazy initialiser ensures it never changes.
  const [startedAt] = useState<Date>(() => new Date());

  // The last step of every exercise is always a `reflection` type.
  // Treat it as a distinct phase so the UI can render it differently
  // (e.g. show a summary of all prior responses alongside the textarea).
  const mainSteps = exercise.steps.slice(0, -1);
  const reflectionStep = exercise.steps[exercise.steps.length - 1] ?? null;
  const totalSteps = mainSteps.length;

  // Resolve the step that should be rendered right now.
  let currentStep: ExerciseStep | null = null;
  if (phase === 'steps') {
    currentStep = mainSteps[currentStepIndex] ?? null;
  } else if (phase === 'reflection') {
    currentStep = reflectionStep;
  }

  // Progress: 0 during intro/safety-check, climbs through steps, 1 on complete.
  let progress = 0;
  if (phase === 'steps') {
    progress = totalSteps > 0 ? currentStepIndex / (totalSteps + 1) : 0;
  } else if (phase === 'reflection') {
    progress = totalSteps > 0 ? totalSteps / (totalSteps + 1) : 0.9;
  } else if (phase === 'complete') {
    progress = 1;
  }

  const advance = useCallback(() => {
    switch (phase) {
      case 'intro':
        setPhase(exercise.depth === 'abyss' ? 'safety-check' : 'steps');
        break;
      case 'safety-check':
        setPhase('steps');
        break;
      case 'steps':
        if (currentStepIndex < mainSteps.length - 1) {
          setCurrentStepIndex((i) => i + 1);
        } else {
          // All main steps done — move to the reflection phase.
          setPhase('reflection');
        }
        break;
      case 'reflection':
        setPhase('complete');
        break;
      case 'complete':
        // No-op: caller handles post-completion navigation.
        break;
    }
  }, [phase, currentStepIndex, mainSteps.length, exercise.depth]);

  const goBack = useCallback(() => {
    switch (phase) {
      case 'intro':
      case 'complete':
        // No-op from terminal phases.
        break;
      case 'safety-check':
        setPhase('intro');
        break;
      case 'steps':
        if (currentStepIndex > 0) {
          setCurrentStepIndex((i) => i - 1);
        } else {
          setPhase(exercise.depth === 'abyss' ? 'safety-check' : 'intro');
        }
        break;
      case 'reflection':
        // Return to the last main step.
        setPhase('steps');
        setCurrentStepIndex(mainSteps.length - 1);
        break;
    }
  }, [phase, currentStepIndex, mainSteps.length, exercise.depth]);

  const canGoBack =
    phase === 'safety-check' ||
    phase === 'reflection' ||
    (phase === 'steps' && currentStepIndex > 0);

  const setResponse = useCallback((stepId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [stepId]: value }));
  }, []);

  return {
    phase,
    currentStepIndex,
    currentStep,
    totalSteps,
    progress,
    responses,
    canGoBack,
    startedAt,
    advance,
    goBack,
    setResponse,
  };
}
