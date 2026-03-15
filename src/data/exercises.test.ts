import { exercises, exerciseById, getExercisesByDepth, getExercisesByStage } from './exercises';

test('there are exactly 7 exercises', () => {
  expect(exercises.length).toBe(7);
});

test('all exercises have required fields', () => {
  for (const exercise of exercises) {
    expect(exercise.id).toBeTruthy();
    expect(exercise.title).toBeTruthy();
    expect(exercise.tagline).toBeTruthy();
    expect(exercise.description).toBeTruthy();
    expect(exercise.category).toBeTruthy();
    expect(['recognition', 'encounter', 'dialogue', 'integration', 'ongoing']).toContain(
      exercise.stage,
    );
    expect(exercise.estimatedMinutes).toBeGreaterThan(0);
    expect(['surface', 'deep', 'abyss']).toContain(exercise.depth);
    expect(exercise.steps.length).toBeGreaterThan(0);
  }
});

test('exercise IDs are unique', () => {
  const ids = exercises.map((e) => e.id);
  const uniqueIds = new Set(ids);
  expect(uniqueIds.size).toBe(exercises.length);
});

test('all 7 expected exercise IDs are present', () => {
  const ids = exercises.map((e) => e.id);
  expect(ids).toContain('shadow-journaling');
  expect(ids).toContain('three-two-one');
  expect(ids).toContain('inner-child');
  expect(ids).toContain('active-imagination');
  expect(ids).toContain('mirror-work');
  expect(ids).toContain('trigger-tracking');
  expect(ids).toContain('dream-work');
});

test('all steps have a valid type and id', () => {
  const validTypes = ['instruction', 'prompt', 'freewrite', 'timed-pause', 'choice', 'reflection'];
  for (const exercise of exercises) {
    for (const step of exercise.steps) {
      expect(validTypes).toContain(step.type);
      expect(step.id).toBeTruthy();
    }
  }
});

test('step IDs are unique within each exercise', () => {
  for (const exercise of exercises) {
    const stepIds = exercise.steps.map((s) => s.id);
    const unique = new Set(stepIds);
    expect(unique.size).toBe(exercise.steps.length);
  }
});

test('timed-pause steps have a positive durationSeconds', () => {
  for (const exercise of exercises) {
    for (const step of exercise.steps) {
      if (step.type === 'timed-pause') {
        expect(step.durationSeconds).toBeGreaterThan(0);
        expect(step.label).toBeTruthy();
      }
    }
  }
});

test('choice steps have at least 2 options', () => {
  for (const exercise of exercises) {
    for (const step of exercise.steps) {
      if (step.type === 'choice') {
        expect(step.options.length).toBeGreaterThanOrEqual(2);
        expect(step.question).toBeTruthy();
      }
    }
  }
});

test('exerciseById lookup works for all exercises', () => {
  for (const exercise of exercises) {
    expect(exerciseById[exercise.id]).toBe(exercise);
  }
});

test('getExercisesByDepth filters correctly', () => {
  const surface = getExercisesByDepth('surface');
  const deep = getExercisesByDepth('deep');
  const abyss = getExercisesByDepth('abyss');
  expect(surface.every((e) => e.depth === 'surface')).toBe(true);
  expect(deep.every((e) => e.depth === 'deep')).toBe(true);
  expect(abyss.every((e) => e.depth === 'abyss')).toBe(true);
  expect(surface.length + deep.length + abyss.length).toBe(exercises.length);
});

test('getExercisesByStage filters correctly', () => {
  const recognition = getExercisesByStage('recognition');
  const encounter = getExercisesByStage('encounter');
  const dialogue = getExercisesByStage('dialogue');
  expect(recognition.every((e) => e.stage === 'recognition')).toBe(true);
  expect(encounter.every((e) => e.stage === 'encounter')).toBe(true);
  expect(dialogue.every((e) => e.stage === 'dialogue')).toBe(true);
});

test('active-imagination is the only abyss-depth exercise', () => {
  const abyss = getExercisesByDepth('abyss');
  expect(abyss.length).toBe(1);
  expect(abyss[0]!.id).toBe('active-imagination');
});
