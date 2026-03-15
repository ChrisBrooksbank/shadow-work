import {
  groundingTechniques,
  groundingTechniqueById,
  safetyDisclaimers,
  safetyDisclaimerByDepth,
  crisisResources,
} from './safety';

// ─── Grounding Techniques ─────────────────────────────────────────────────────

test('there are at least 2 grounding techniques', () => {
  expect(groundingTechniques.length).toBeGreaterThanOrEqual(2);
});

test('all grounding techniques have required fields', () => {
  for (const technique of groundingTechniques) {
    expect(technique.id).toBeTruthy();
    expect(technique.title).toBeTruthy();
    expect(technique.description).toBeTruthy();
    expect(technique.steps.length).toBeGreaterThan(0);
  }
});

test('grounding technique IDs are unique', () => {
  const ids = groundingTechniques.map((t) => t.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('all grounding steps have id and instruction', () => {
  for (const technique of groundingTechniques) {
    for (const step of technique.steps) {
      expect(step.id).toBeTruthy();
      expect(step.instruction).toBeTruthy();
    }
  }
});

test('5-4-3-2-1 sensory technique is present and has 5 steps', () => {
  const technique = groundingTechniqueById['54321-sensory'];
  expect(technique).toBeDefined();
  expect(technique!.steps.length).toBe(5);
});

test('box breathing technique is present and has 5 steps', () => {
  const technique = groundingTechniqueById['box-breathing'];
  expect(technique).toBeDefined();
  expect(technique!.steps.length).toBe(5);
});

test('groundingTechniqueById contains all techniques', () => {
  for (const technique of groundingTechniques) {
    expect(groundingTechniqueById[technique.id]).toBe(technique);
  }
});

// ─── Safety Disclaimers ───────────────────────────────────────────────────────

test('there are disclaimers for deep and abyss depths', () => {
  const depths = safetyDisclaimers.map((d) => d.depth);
  expect(depths).toContain('deep');
  expect(depths).toContain('abyss');
});

test('all safety disclaimers have required fields', () => {
  for (const disclaimer of safetyDisclaimers) {
    expect(disclaimer.id).toBeTruthy();
    expect(disclaimer.heading).toBeTruthy();
    expect(disclaimer.body).toBeTruthy();
    expect(disclaimer.acknowledgementPrompt).toBeTruthy();
    expect(['deep', 'abyss']).toContain(disclaimer.depth);
  }
});

test('safetyDisclaimerByDepth lookup works', () => {
  expect(safetyDisclaimerByDepth['deep']).toBeDefined();
  expect(safetyDisclaimerByDepth['abyss']).toBeDefined();
  expect(safetyDisclaimerByDepth['deep']!.depth).toBe('deep');
  expect(safetyDisclaimerByDepth['abyss']!.depth).toBe('abyss');
});

// ─── Crisis Resources ─────────────────────────────────────────────────────────

test('there are at least 3 crisis resources', () => {
  expect(crisisResources.length).toBeGreaterThanOrEqual(3);
});

test('all crisis resources have required fields', () => {
  for (const resource of crisisResources) {
    expect(resource.id).toBeTruthy();
    expect(resource.name).toBeTruthy();
    expect(resource.description).toBeTruthy();
    expect(resource.contact).toBeTruthy();
  }
});

test('crisis resource IDs are unique', () => {
  const ids = crisisResources.map((r) => r.id);
  expect(new Set(ids).size).toBe(ids.length);
});
