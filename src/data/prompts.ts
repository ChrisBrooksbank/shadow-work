export type PromptCategory = 'projection' | 'childhood' | 'self-examination' | 'integration';

export interface Prompt {
  id: string;
  category: PromptCategory;
  text: string;
}

export const prompts: Prompt[] = [
  // Projection prompts
  {
    id: 'proj-1',
    category: 'projection',
    text: 'The trait you most dislike in others — how might it live in you?',
  },
  {
    id: 'proj-2',
    category: 'projection',
    text: 'You feel most triggered when someone ___. What does that reaction reveal about your own shadow?',
  },
  {
    id: 'proj-3',
    category: 'projection',
    text: 'The person you most admire possesses ___. How have you denied that quality in yourself?',
  },
  {
    id: 'proj-4',
    category: 'projection',
    text: 'Who do you judge harshly? Describe them in detail — then ask where those qualities live in you.',
  },
  {
    id: 'proj-5',
    category: 'projection',
    text: 'What behavior in others makes you feel a disproportionate surge of anger or disgust? Sit with that feeling.',
  },
  {
    id: 'proj-6',
    category: 'projection',
    text: 'Whose success or talent stirs envy in you? What does that envy say about an unlived part of yourself?',
  },
  {
    id: 'proj-7',
    category: 'projection',
    text: 'Think of someone you idealize. What qualities do you place on them that you refuse to claim in yourself?',
  },
  {
    id: 'proj-8',
    category: 'projection',
    text: 'Who do you keep attracting into your life who frustrates you the same way? What pattern are they mirroring?',
  },
  {
    id: 'proj-9',
    category: 'projection',
    text: 'What have you criticized in a loved one that you secretly do yourself?',
  },
  {
    id: 'proj-10',
    category: 'projection',
    text: 'If you had to describe the "villain" in your life story — what shadow part of yourself might they represent?',
  },

  // Childhood prompts
  {
    id: 'child-1',
    category: 'childhood',
    text: 'As a child, you were told you were too ___. How did you learn to suppress that part of yourself?',
  },
  {
    id: 'child-2',
    category: 'childhood',
    text: 'The emotions that were not allowed in your family were ___. Where did they go?',
  },
  {
    id: 'child-3',
    category: 'childhood',
    text: 'You learned to hide ___ about yourself in order to be loved. Is that still true today?',
  },
  {
    id: 'child-4',
    category: 'childhood',
    text: 'What did the child version of you need most that was never given? Where do you still seek it?',
  },
  {
    id: 'child-5',
    category: 'childhood',
    text: 'Which beliefs about yourself did you absorb from a parent, teacher, or caregiver — and accepted as truth?',
  },
  {
    id: 'child-6',
    category: 'childhood',
    text: 'What role did you play in your family — the responsible one, the invisible one, the problem, the peacekeeper? How does that role still run your life?',
  },
  {
    id: 'child-7',
    category: 'childhood',
    text: 'When you were young, what made you feel ashamed? Do you carry that shame now?',
  },
  {
    id: 'child-8',
    category: 'childhood',
    text: 'What parts of yourself did you kill off to survive childhood?',
  },
  {
    id: 'child-9',
    category: 'childhood',
    text: 'If your younger self could write you a letter about what they needed — what would it say?',
  },
  {
    id: 'child-10',
    category: 'childhood',
    text: 'What were you punished or shamed for as a child that you now see was simply human?',
  },

  // Self-examination prompts
  {
    id: 'self-1',
    category: 'self-examination',
    text: 'The parts of yourself you are most ashamed of — describe them without flinching.',
  },
  {
    id: 'self-2',
    category: 'self-examination',
    text: 'If no one would ever judge you, what would you do? What does that tell you about who you really are?',
  },
  {
    id: 'self-3',
    category: 'self-examination',
    text: 'Your recurring patterns in relationships — what shadow need might they be serving?',
  },
  {
    id: 'self-4',
    category: 'self-examination',
    text: 'The lie you tell yourself most often — what truth is it protecting you from?',
  },
  {
    id: 'self-5',
    category: 'self-examination',
    text: 'Where in your life are you performing instead of actually living?',
  },
  {
    id: 'self-6',
    category: 'self-examination',
    text: 'What anger have you been calling something safer — stress, sadness, apathy?',
  },
  {
    id: 'self-7',
    category: 'self-examination',
    text: 'What are you protecting yourself from by staying exactly as you are right now?',
  },
  {
    id: 'self-8',
    category: 'self-examination',
    text: 'What desire have you buried because it felt too dangerous, too selfish, or too wrong to want?',
  },
  {
    id: 'self-9',
    category: 'self-examination',
    text: 'When do you feel most like an impostor — and what truth about yourself are you afraid to own?',
  },
  {
    id: 'self-10',
    category: 'self-examination',
    text: 'What need are you most ashamed to admit you have?',
  },
  {
    id: 'self-11',
    category: 'self-examination',
    text: 'Where do you abandon yourself in order to keep others comfortable?',
  },
  {
    id: 'self-12',
    category: 'self-examination',
    text: 'What mask do you wear so consistently you have forgotten it is a mask?',
  },

  // Integration prompts
  {
    id: 'integ-1',
    category: 'integration',
    text: 'I forgive myself for ___. Write it slowly. Mean it.',
  },
  {
    id: 'integ-2',
    category: 'integration',
    text: 'The gift hidden in your shadow — what power or quality have you been afraid to own?',
  },
  {
    id: 'integ-3',
    category: 'integration',
    text: 'I give myself permission to ___. What would change if you actually meant it?',
  },
  {
    id: 'integ-4',
    category: 'integration',
    text: 'What shadow quality — anger, ambition, sensuality, wildness — are you ready to reclaim?',
  },
  {
    id: 'integ-5',
    category: 'integration',
    text: 'Write a compassionate letter to the part of you that has caused the most harm. What does it need to hear?',
  },
  {
    id: 'integ-6',
    category: 'integration',
    text: 'How might your greatest flaw also be your greatest strength — if you stopped fighting it?',
  },
  {
    id: 'integ-7',
    category: 'integration',
    text: 'What have you never forgiven yourself for? Describe it — then offer yourself what you would offer a dear friend.',
  },
  {
    id: 'integ-8',
    category: 'integration',
    text: 'The part of you that you have judged most harshly — what was it trying to protect you from?',
  },
  {
    id: 'integ-9',
    category: 'integration',
    text: 'How can you honor a disowned part of yourself while still acting with integrity?',
  },
  {
    id: 'integ-10',
    category: 'integration',
    text: 'What would wholeness feel like — not perfection, but the full honest truth of who you are?',
  },
];

export const promptsByCategory: Record<PromptCategory, Prompt[]> = {
  projection: prompts.filter((p) => p.category === 'projection'),
  childhood: prompts.filter((p) => p.category === 'childhood'),
  'self-examination': prompts.filter((p) => p.category === 'self-examination'),
  integration: prompts.filter((p) => p.category === 'integration'),
};

/**
 * Returns a random prompt from the given category, avoiding recently shown prompt IDs.
 * Falls back to any prompt in the category if all have been recently shown.
 */
export function getPrompt(category: PromptCategory, recentIds: string[] = []): Prompt {
  const pool = promptsByCategory[category];
  const available = pool.filter((p) => !recentIds.includes(p.id));
  const source = available.length > 0 ? available : pool;
  const index = Math.floor(Math.random() * source.length);
  return source[index] ?? pool[0]!;
}

/**
 * Returns a random prompt from any category, avoiding recently shown prompt IDs.
 */
export function getRandomPrompt(recentIds: string[] = []): Prompt {
  const available = prompts.filter((p) => !recentIds.includes(p.id));
  const source = available.length > 0 ? available : prompts;
  const index = Math.floor(Math.random() * source.length);
  return source[index] ?? prompts[0]!;
}
