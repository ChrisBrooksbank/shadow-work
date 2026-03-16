import { concepts, conceptBySlug, getNextConcept } from './concepts';

test('there are exactly 8 concepts', () => {
  expect(concepts.length).toBe(8);
});

test('all concepts have required fields', () => {
  for (const concept of concepts) {
    expect(concept.slug).toBeTruthy();
    expect(concept.title).toBeTruthy();
    expect(concept.summary).toBeTruthy();
    expect(concept.sections.length).toBeGreaterThan(0);
    expect(concept.readingTime).toBeGreaterThan(0);
    expect(Array.isArray(concept.relatedExerciseIds)).toBe(true);
  }
});

test('concept slugs are unique', () => {
  const slugs = concepts.map((c) => c.slug);
  const unique = new Set(slugs);
  expect(unique.size).toBe(concepts.length);
});

test('all 8 expected slugs are present', () => {
  const slugs = concepts.map((c) => c.slug);
  expect(slugs).toContain('what-is-the-shadow');
  expect(slugs).toContain('how-the-shadow-forms');
  expect(slugs).toContain('projection');
  expect(slugs).toContain('the-persona');
  expect(slugs).toContain('integration-vs-elimination');
  expect(slugs).toContain('shadow-in-relationships');
  expect(slugs).toContain('the-golden-shadow');
  expect(slugs).toContain('archetypes');
});

test('all sections have a heading and body', () => {
  for (const concept of concepts) {
    for (const section of concept.sections) {
      expect(section.heading).toBeTruthy();
      expect(section.body).toBeTruthy();
    }
  }
});

test('relatedExerciseIds reference valid exercise IDs', () => {
  const validExerciseIds = new Set([
    'shadow-journaling',
    'three-two-one',
    'inner-child',
    'active-imagination',
    'mirror-work',
    'trigger-tracking',
    'dream-work',
  ]);
  for (const concept of concepts) {
    for (const id of concept.relatedExerciseIds) {
      expect(validExerciseIds.has(id)).toBe(true);
    }
  }
});

test('conceptBySlug lookup works for all concepts', () => {
  for (const concept of concepts) {
    expect(conceptBySlug[concept.slug]).toBe(concept);
  }
});

test('getNextConcept returns the next concept', () => {
  const first = concepts[0]!;
  const second = concepts[1]!;
  expect(getNextConcept(first.slug)).toBe(second);
});

test('getNextConcept wraps around from the last to the first concept', () => {
  const last = concepts[concepts.length - 1]!;
  const first = concepts[0]!;
  expect(getNextConcept(last.slug)).toBe(first);
});

test('getNextConcept returns undefined for unknown slug', () => {
  expect(getNextConcept('nonexistent-slug')).toBeUndefined();
});
