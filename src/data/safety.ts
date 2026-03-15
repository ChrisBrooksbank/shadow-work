export interface GroundingStep {
  id: string;
  instruction: string;
  durationSeconds?: number;
}

export interface GroundingTechnique {
  id: string;
  title: string;
  description: string;
  steps: GroundingStep[];
}

export interface SafetyDisclaimer {
  id: string;
  depth: 'deep' | 'abyss';
  heading: string;
  body: string;
  acknowledgementPrompt: string;
}

export interface CrisisResource {
  id: string;
  name: string;
  description: string;
  contact: string;
  url?: string;
}

// ─── Grounding Techniques ────────────────────────────────────────────────────

export const groundingTechniques: GroundingTechnique[] = [
  {
    id: '54321-sensory',
    title: '5-4-3-2-1 Grounding',
    description:
      'Anchor yourself in the present moment by engaging each of your five senses in sequence.',
    steps: [
      {
        id: 'see',
        instruction: 'Name 5 things you can SEE right now. Look around slowly and notice each one.',
        durationSeconds: 30,
      },
      {
        id: 'touch',
        instruction:
          'Notice 4 things you can TOUCH. Feel the texture of your clothes, chair, or floor.',
        durationSeconds: 25,
      },
      {
        id: 'hear',
        instruction:
          'Identify 3 things you can HEAR. Listen for background sounds you usually ignore.',
        durationSeconds: 20,
      },
      {
        id: 'smell',
        instruction:
          'Find 2 things you can SMELL. Take a slow breath and notice what is in the air.',
        durationSeconds: 15,
      },
      {
        id: 'taste',
        instruction:
          'Notice 1 thing you can TASTE — the inside of your mouth, a drink, or recent food.',
        durationSeconds: 10,
      },
    ],
  },
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    description:
      'Regulate your nervous system with a four-count rhythmic breath used by first responders and therapists.',
    steps: [
      {
        id: 'inhale',
        instruction: 'Breathe IN slowly through your nose for 4 counts.',
        durationSeconds: 4,
      },
      {
        id: 'hold-in',
        instruction: 'HOLD the breath gently for 4 counts.',
        durationSeconds: 4,
      },
      {
        id: 'exhale',
        instruction: 'Breathe OUT slowly through your mouth for 4 counts.',
        durationSeconds: 4,
      },
      {
        id: 'hold-out',
        instruction: 'HOLD the empty breath for 4 counts.',
        durationSeconds: 4,
      },
      {
        id: 'repeat',
        instruction: 'Repeat the cycle 3 more times. Let your body slow down with each round.',
        durationSeconds: 48,
      },
    ],
  },
];

export const groundingTechniqueById: Record<string, GroundingTechnique> = Object.fromEntries(
  groundingTechniques.map((t) => [t.id, t]),
);

// ─── Safety Disclaimers ───────────────────────────────────────────────────────

export const safetyDisclaimers: SafetyDisclaimer[] = [
  {
    id: 'deep-disclaimer',
    depth: 'deep',
    heading: 'Before you go deeper',
    body: 'This exercise invites you into territory that can stir strong emotions — grief, anger, or discomfort that has been stored for a long time. That is not a warning to stay away. It is an invitation to go slowly.\n\nIf strong feelings arise, you can pause at any moment. Grounding tools are available throughout. You are in control of this process.',
    acknowledgementPrompt: 'I understand and I am ready to proceed',
  },
  {
    id: 'abyss-disclaimer',
    depth: 'abyss',
    heading: 'This is abyss-level work',
    body: 'You are about to engage with some of the deepest layers of the psyche — material that has been defended against for good reason. This work can be profoundly transformative and profoundly disorienting.\n\nPlease do not continue if you are in an acute mental health crisis, have recently experienced trauma, or are using substances. This app is not a substitute for therapy.\n\nIf at any point you feel overwhelmed, use the grounding tool or step away entirely. Crisis resources are always available in Settings.',
    acknowledgementPrompt: 'I am in a stable state and I am ready to proceed',
  },
];

export const safetyDisclaimerByDepth: Record<string, SafetyDisclaimer> = Object.fromEntries(
  safetyDisclaimers.map((d) => [d.depth, d]),
);

// ─── Crisis Resources ─────────────────────────────────────────────────────────

export const crisisResources: CrisisResource[] = [
  {
    id: '988-lifeline',
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential crisis support available 24/7 by call or text.',
    contact: 'Call or text 988',
    url: 'https://988lifeline.org',
  },
  {
    id: 'crisis-text-line',
    name: 'Crisis Text Line',
    description: 'Text-based crisis support available 24/7.',
    contact: 'Text HOME to 741741',
    url: 'https://www.crisistextline.org',
  },
  {
    id: 'nami-helpline',
    name: 'NAMI HelpLine',
    description:
      'National Alliance on Mental Illness — information, referrals, and support for mental health questions.',
    contact: '1-800-950-NAMI (6264)',
    url: 'https://nami.org/help',
  },
  {
    id: 'international-association',
    name: 'International Association for Suicide Prevention',
    description: 'Directory of crisis centers worldwide for international users.',
    contact: "Find your country's hotline",
    url: 'https://www.iasp.info/resources/Crisis_Centres/',
  },
];
