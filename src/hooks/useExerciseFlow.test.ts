import { renderHook, act } from '@testing-library/react';
import { useExerciseFlow } from './useExerciseFlow';
import { exerciseById } from '../data/exercises';
import type { Exercise } from '../data/exercises';

// ── fixtures ──────────────────────────────────────────────────────────────────

const surfaceExercise = exerciseById['shadow-journaling']!; // depth: surface
const abyssExercise = exerciseById['active-imagination']!; // depth: abyss

// A minimal synthetic exercise with just 2 main steps + 1 reflection.
const miniExercise: Exercise = {
  id: 'mini-test',
  title: 'Mini',
  tagline: 'Test',
  description: 'A minimal exercise for unit tests.',
  category: 'journaling',
  stage: 'recognition',
  estimatedMinutes: 5,
  depth: 'surface',
  steps: [
    { type: 'instruction', id: 'mini-step-1', body: 'Read this.' },
    { type: 'prompt', id: 'mini-step-2', question: 'What do you feel?' },
    { type: 'reflection', id: 'mini-reflection', prompt: 'Final thoughts.' },
  ],
};

const miniAbyssExercise: Exercise = { ...miniExercise, id: 'mini-abyss', depth: 'abyss' };

// ── initial state ─────────────────────────────────────────────────────────────

test('starts in intro phase', () => {
  const { result } = renderHook(() => useExerciseFlow(surfaceExercise));
  expect(result.current.phase).toBe('intro');
});

test('currentStep is null during intro', () => {
  const { result } = renderHook(() => useExerciseFlow(surfaceExercise));
  expect(result.current.currentStep).toBeNull();
});

test('progress is 0 during intro', () => {
  const { result } = renderHook(() => useExerciseFlow(surfaceExercise));
  expect(result.current.progress).toBe(0);
});

test('responses start empty', () => {
  const { result } = renderHook(() => useExerciseFlow(surfaceExercise));
  expect(result.current.responses).toEqual({});
});

test('canGoBack is false during intro', () => {
  const { result } = renderHook(() => useExerciseFlow(surfaceExercise));
  expect(result.current.canGoBack).toBe(false);
});

// ── surface exercise flow ─────────────────────────────────────────────────────

test('surface exercise: intro → steps on advance', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.advance());
  expect(result.current.phase).toBe('steps');
});

test('surface exercise: skips safety-check', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.advance());
  // Should go directly to steps, not safety-check
  expect(result.current.phase).toBe('steps');
  expect(result.current.currentStepIndex).toBe(0);
});

test('surface exercise: advances through each step', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.advance()); // intro → steps
  expect(result.current.currentStep?.id).toBe('mini-step-1');

  act(() => result.current.advance()); // step 0 → step 1
  expect(result.current.currentStepIndex).toBe(1);
  expect(result.current.currentStep?.id).toBe('mini-step-2');

  act(() => result.current.advance()); // step 1 → reflection
  expect(result.current.phase).toBe('reflection');
  expect(result.current.currentStep?.id).toBe('mini-reflection');

  act(() => result.current.advance()); // reflection → complete
  expect(result.current.phase).toBe('complete');
});

test('totalSteps excludes the reflection step', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  // miniExercise has 3 steps total; 2 main + 1 reflection
  expect(result.current.totalSteps).toBe(2);
});

// ── abyss exercise flow ───────────────────────────────────────────────────────

test('abyss exercise: intro → safety-check on advance', () => {
  const { result } = renderHook(() => useExerciseFlow(miniAbyssExercise));
  act(() => result.current.advance());
  expect(result.current.phase).toBe('safety-check');
});

test('abyss exercise: safety-check → steps on advance', () => {
  const { result } = renderHook(() => useExerciseFlow(miniAbyssExercise));
  act(() => result.current.advance()); // intro → safety-check
  act(() => result.current.advance()); // safety-check → steps
  expect(result.current.phase).toBe('steps');
});

test('abyss exercise: currentStep is null during safety-check', () => {
  const { result } = renderHook(() => useExerciseFlow(miniAbyssExercise));
  act(() => result.current.advance()); // intro → safety-check
  expect(result.current.currentStep).toBeNull();
});

test('abyss exercise: canGoBack is true during safety-check', () => {
  const { result } = renderHook(() => useExerciseFlow(miniAbyssExercise));
  act(() => result.current.advance()); // intro → safety-check
  expect(result.current.canGoBack).toBe(true);
});

// ── goBack navigation ─────────────────────────────────────────────────────────

test('goBack from first step returns to intro (surface)', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.advance()); // intro → steps
  act(() => result.current.goBack()); // steps[0] → intro
  expect(result.current.phase).toBe('intro');
});

test('goBack from first step returns to safety-check (abyss)', () => {
  const { result } = renderHook(() => useExerciseFlow(miniAbyssExercise));
  act(() => result.current.advance()); // intro → safety-check
  act(() => result.current.advance()); // safety-check → steps
  act(() => result.current.goBack()); // steps[0] → safety-check
  expect(result.current.phase).toBe('safety-check');
});

test('goBack from step 1 goes to step 0', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.advance()); // intro → steps
  act(() => result.current.advance()); // step 0 → step 1
  act(() => result.current.goBack()); // step 1 → step 0
  expect(result.current.currentStepIndex).toBe(0);
});

test('goBack from reflection returns to last main step', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.advance()); // intro → steps
  act(() => result.current.advance()); // step 0 → step 1
  act(() => result.current.advance()); // step 1 → reflection
  act(() => result.current.goBack()); // reflection → steps[last]
  expect(result.current.phase).toBe('steps');
  expect(result.current.currentStepIndex).toBe(1); // last main step index
});

test('goBack is no-op from intro', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.goBack());
  expect(result.current.phase).toBe('intro');
});

test('goBack is no-op from complete', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.advance()); // intro → steps
  act(() => result.current.advance()); // step 0
  act(() => result.current.advance()); // step 1
  act(() => result.current.advance()); // reflection
  act(() => result.current.advance()); // complete
  act(() => result.current.goBack());
  expect(result.current.phase).toBe('complete');
});

// ── canGoBack ─────────────────────────────────────────────────────────────────

test('canGoBack is false at first step', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.advance()); // intro → steps
  expect(result.current.canGoBack).toBe(false);
});

test('canGoBack is true at non-first step', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.advance()); // intro → steps
  act(() => result.current.advance()); // step 0 → step 1
  expect(result.current.canGoBack).toBe(true);
});

test('canGoBack is true during reflection', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.advance()); // intro → steps
  act(() => result.current.advance()); // step 0
  act(() => result.current.advance()); // step 1 → reflection
  expect(result.current.canGoBack).toBe(true);
});

// ── setResponse ───────────────────────────────────────────────────────────────

test('setResponse stores a value by step ID', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.setResponse('mini-step-2', 'I feel curious.'));
  expect(result.current.responses['mini-step-2']).toBe('I feel curious.');
});

test('setResponse accumulates multiple responses', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.setResponse('mini-step-1', 'Note A'));
  act(() => result.current.setResponse('mini-step-2', 'Note B'));
  expect(result.current.responses['mini-step-1']).toBe('Note A');
  expect(result.current.responses['mini-step-2']).toBe('Note B');
});

test('setResponse overwrites existing value', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.setResponse('mini-step-2', 'First'));
  act(() => result.current.setResponse('mini-step-2', 'Updated'));
  expect(result.current.responses['mini-step-2']).toBe('Updated');
});

// ── progress ──────────────────────────────────────────────────────────────────

test('progress is 0 during safety-check', () => {
  const { result } = renderHook(() => useExerciseFlow(miniAbyssExercise));
  act(() => result.current.advance()); // intro → safety-check
  expect(result.current.progress).toBe(0);
});

test('progress increases as steps advance', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.advance()); // intro → steps[0]
  const p0 = result.current.progress;

  act(() => result.current.advance()); // steps[0] → steps[1]
  const p1 = result.current.progress;

  expect(p1).toBeGreaterThan(p0);
});

test('progress is 1 when complete', () => {
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  act(() => result.current.advance());
  act(() => result.current.advance());
  act(() => result.current.advance());
  act(() => result.current.advance()); // complete
  expect(result.current.progress).toBe(1);
});

// ── startedAt ─────────────────────────────────────────────────────────────────

test('startedAt is a Date set at hook initialisation', () => {
  const before = new Date();
  const { result } = renderHook(() => useExerciseFlow(miniExercise));
  const after = new Date();
  expect(result.current.startedAt).toBeInstanceOf(Date);
  expect(result.current.startedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  expect(result.current.startedAt.getTime()).toBeLessThanOrEqual(after.getTime());
});

test('startedAt does not change across renders', () => {
  const { result, rerender } = renderHook(() => useExerciseFlow(miniExercise));
  const first = result.current.startedAt;
  rerender();
  expect(result.current.startedAt).toBe(first);
});

// ── full real exercises ───────────────────────────────────────────────────────

test('can complete the full shadow-journaling exercise', () => {
  const { result } = renderHook(() => useExerciseFlow(surfaceExercise));
  act(() => result.current.advance()); // intro → steps
  for (let i = 0; i < surfaceExercise.steps.length - 1; i++) {
    act(() => result.current.advance());
  }
  // Now should be in 'reflection'
  expect(result.current.phase).toBe('reflection');
  act(() => result.current.advance());
  expect(result.current.phase).toBe('complete');
});

test('active-imagination goes through safety-check', () => {
  const { result } = renderHook(() => useExerciseFlow(abyssExercise));
  expect(result.current.phase).toBe('intro');
  act(() => result.current.advance());
  expect(result.current.phase).toBe('safety-check');
  act(() => result.current.advance());
  expect(result.current.phase).toBe('steps');
});
