export type ExerciseStage = 'recognition' | 'encounter' | 'dialogue' | 'integration' | 'ongoing';
export type ExerciseDepth = 'surface' | 'deep' | 'abyss';
export type ExerciseCategory =
  | 'journaling'
  | 'process'
  | 'inner-child'
  | 'imagination'
  | 'mirror'
  | 'trigger'
  | 'dream';

export type StepType =
  | 'instruction'
  | 'prompt'
  | 'freewrite'
  | 'timed-pause'
  | 'choice'
  | 'reflection';

export interface InstructionStep {
  type: 'instruction';
  id: string;
  title?: string;
  body: string;
}

export interface PromptStep {
  type: 'prompt';
  id: string;
  question: string;
  placeholder?: string;
}

export interface FreewriteStep {
  type: 'freewrite';
  id: string;
  prompt: string;
  durationSeconds?: number;
  placeholder?: string;
}

export interface TimedPauseStep {
  type: 'timed-pause';
  id: string;
  label: string;
  durationSeconds: number;
  /** When true, renders a breathing/ambient animation for meditation steps. */
  ambient?: boolean;
}

export interface ChoiceStep {
  type: 'choice';
  id: string;
  question: string;
  options: string[];
}

export interface ReflectionStep {
  type: 'reflection';
  id: string;
  prompt: string;
  placeholder?: string;
}

export type ExerciseStep =
  | InstructionStep
  | PromptStep
  | FreewriteStep
  | TimedPauseStep
  | ChoiceStep
  | ReflectionStep;

export interface Exercise {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: ExerciseCategory;
  stage: ExerciseStage;
  estimatedMinutes: number;
  depth: ExerciseDepth;
  steps: ExerciseStep[];
}

export const exercises: Exercise[] = [
  // ─── 1. Shadow Journaling ───────────────────────────────────────────────────
  {
    id: 'shadow-journaling',
    title: 'Shadow Journaling',
    tagline: "Write what you've been afraid to admit.",
    description:
      'A guided journaling session that moves through four shadow prompt pools: projection, childhood, self-examination, and integration. Each response is a step toward making the unconscious conscious.',
    category: 'journaling',
    stage: 'recognition',
    estimatedMinutes: 15,
    depth: 'surface',
    steps: [
      {
        type: 'instruction',
        id: 'sj-intro',
        title: 'Shadow Journaling',
        body: "You're about to write without a filter. There's no right answer — only what's true for you right now. This session moves through four areas: what you project onto others, what childhood shaped, what you see when you look honestly at yourself, and what wants to be reclaimed.\n\nWrite quickly. Don't edit yourself.",
      },
      {
        type: 'prompt',
        id: 'sj-projection',
        question:
          'The trait you most dislike in others — describe it in detail. Then ask: how does this quality live in you?',
        placeholder: 'Write without censoring...',
      },
      {
        type: 'prompt',
        id: 'sj-childhood',
        question:
          'As a child, you learned to hide ___ in order to be loved. What was it? Is that still true today?',
        placeholder: 'Take your time with this one...',
      },
      {
        type: 'prompt',
        id: 'sj-self',
        question:
          'The parts of yourself you are most ashamed of — describe them without flinching.',
        placeholder: 'No one will read this but you...',
      },
      {
        type: 'prompt',
        id: 'sj-integration',
        question:
          'The gift hidden in your shadow — what power or quality have you been afraid to own?',
        placeholder: 'What wants to be reclaimed?',
      },
      {
        type: 'reflection',
        id: 'sj-reflection',
        prompt:
          'Looking at everything you just wrote — what surprised you? What pattern do you notice? Offer yourself one sentence of compassion.',
        placeholder: 'Final thoughts...',
      },
    ],
  },

  // ─── 2. The 3-2-1 Process ────────────────────────────────────────────────────
  {
    id: 'three-two-one',
    title: 'The 3-2-1 Process',
    tagline: 'Turn a projection back into yourself.',
    description:
      'A structured technique from Integral Psychology. You begin by describing a person who disturbs or fascinates you in the third person, then speak directly to them, then become them — reclaiming the projected shadow material as your own.',
    category: 'process',
    stage: 'encounter',
    estimatedMinutes: 20,
    depth: 'deep',
    steps: [
      {
        type: 'instruction',
        id: '321-intro',
        title: 'The 3-2-1 Process',
        body: "This exercise converts a projection back into owned experience. It works with someone who triggers a strong reaction in you — intense irritation, fascination, envy, or dislike.\n\nYou'll move through three perspectives:\n\u2022 3rd person (IT) — describe them\n\u2022 2nd person (YOU) — speak to them\n\u2022 1st person (I) — become them\n\nChoose someone now. It can be someone in your life, someone from your past, or even a public figure.",
      },
      {
        type: 'prompt',
        id: '321-choose',
        question:
          "Who is the person you're working with? Name them and describe your reaction in one or two sentences.",
        placeholder:
          'e.g., "My coworker Marcus. He makes me furious — always taking credit, always performing."',
      },
      {
        type: 'instruction',
        id: '321-3rd-intro',
        title: 'Step 1 of 3 — Third Person (IT)',
        body: 'Describe this person as if you\'re talking about them to someone else. Use "he," "she," or "they." What are their qualities — especially the ones that bother or fascinate you most? Be specific and unfiltered.',
      },
      {
        type: 'freewrite',
        id: '321-3rd',
        prompt:
          "Write about them in the third person. Describe what they're like, what they do, what bothers you about them.",
        placeholder: '"She is... He always... They never..."',
      },
      {
        type: 'instruction',
        id: '321-2nd-intro',
        title: 'Step 2 of 3 — Second Person (YOU)',
        body: 'Now speak directly to this person in your imagination. Use "you." Say the things you\'ve never said. Express the feelings directly. Let yourself be honest — even if it feels uncomfortable or unfair.',
      },
      {
        type: 'freewrite',
        id: '321-2nd',
        prompt: 'Write directly to this person. Tell them exactly what you think and feel.',
        placeholder: '"You make me feel... You always... I hate that you..."',
      },
      {
        type: 'instruction',
        id: '321-1st-intro',
        title: 'Step 3 of 3 — First Person (I)',
        body: "This is the most important step. Become this person. Write as if you ARE them — in the first person. Own the qualities you just described. Speak from inside their perspective.\n\nThis isn't about excusing their behavior. It's about recognizing where these qualities — in some form — also live in you.",
      },
      {
        type: 'freewrite',
        id: '321-1st',
        prompt:
          'Write as this person, in the first person. Own their qualities as if they are yours.',
        placeholder: '"I am... I need to... I control because... I manipulate because..."',
      },
      {
        type: 'reflection',
        id: '321-reflection',
        prompt:
          'What landed? Where do those qualities — however differently expressed — actually live in you? What did you reclaim or recognize?',
        placeholder: 'Final reflection...',
      },
    ],
  },

  // ─── 3. Inner Child Work ─────────────────────────────────────────────────────
  {
    id: 'inner-child',
    title: 'Inner Child Work',
    tagline: 'Meet the part of you that got left behind.',
    description:
      "A visualization and letter-writing exercise that connects you with the wounded inner child stored in your shadow. You'll meet yourself at a specific age, listen to what that child needed, and offer what was never given.",
    category: 'inner-child',
    stage: 'dialogue',
    estimatedMinutes: 25,
    depth: 'deep',
    steps: [
      {
        type: 'instruction',
        id: 'ic-intro',
        title: 'Inner Child Work',
        body: "The shadow often holds a wounded child — the version of you that learned to hide, shrink, or perform in order to be safe and loved. This exercise invites you to meet that part of yourself.\n\nFind somewhere you won't be interrupted. If it's safe to do so, close your eyes during the visualization steps.",
      },
      {
        type: 'prompt',
        id: 'ic-age',
        question:
          'What age comes to mind when you think of a time you felt most hurt, unseen, or told you were "too much" or "not enough"? Write that age and one memory or feeling from that time.',
        placeholder:
          'e.g., "Around 8. My dad told me to stop crying, that I was being dramatic..."',
      },
      {
        type: 'instruction',
        id: 'ic-viz-prepare',
        title: 'Visualization — Step 1 of 4',
        body: "Find a comfortable position — sitting or lying down. Allow your body to settle.\n\nClose your eyes. Take three slow, deep breaths. With each exhale, let your ordinary thoughts drift away.\n\nYou're creating an interior space of safety and openness. There's nothing you need to do or be right now.",
      },
      {
        type: 'timed-pause',
        id: 'ic-viz-settle',
        label: 'Breathe and let the mind quiet',
        durationSeconds: 30,
      },
      {
        type: 'instruction',
        id: 'ic-viz-place',
        title: 'Visualization — Step 2 of 4',
        body: "In your mind's eye, allow a safe place to appear — a sun-filled room, a meadow, a garden, or wherever you feel completely protected.\n\nNotice what you see. What you hear. What you feel underfoot. Let the space become real around you.\n\nThis is a place where nothing can harm you or the child you're about to meet.",
      },
      {
        type: 'timed-pause',
        id: 'ic-viz-space',
        label: 'Build the safe space in your mind',
        durationSeconds: 45,
      },
      {
        type: 'instruction',
        id: 'ic-viz-child',
        title: 'Visualization — Step 3 of 4',
        body: "Across this safe space, you see your younger self — the child at the age you named.\n\nNotice what they look like. Their posture. Their expression. What they are wearing.\n\nDon't approach yet. Just observe with compassion. This child has been waiting a long time to be seen.",
      },
      {
        type: 'timed-pause',
        id: 'ic-viz-observe',
        label: 'Observe your younger self with compassion',
        durationSeconds: 60,
      },
      {
        type: 'instruction',
        id: 'ic-viz-connect',
        title: 'Visualization — Step 4 of 4',
        body: 'Now slowly walk toward your younger self. Let them see you approaching.\n\nKneel or sit beside them. Meet their eyes. Let them know you are safe — you are their future self, and you have come back for them.\n\nAsk silently: "What do you need? What did you never get to say?" Then simply listen. You don\'t need to fix anything. Just stay present.',
      },
      {
        type: 'timed-pause',
        id: 'ic-viz-listen',
        label: 'Listen to your younger self',
        durationSeconds: 90,
      },
      {
        type: 'prompt',
        id: 'ic-what-needed',
        question:
          "What did that child need most that they didn't receive? What did they carry alone?",
        placeholder: 'Write what you sensed, saw, or felt during the visualization...',
      },
      {
        type: 'freewrite',
        id: 'ic-letter',
        prompt:
          "Write a letter to your younger self. Offer the protection, validation, or comfort they didn't receive. Tell them what you know now. Mean it.",
        placeholder: 'Dear [your name] at [age]...',
      },
      {
        type: 'reflection',
        id: 'ic-reflection',
        prompt:
          'What did writing that letter stir in you? Where does that child still show up in your current life — in your triggers, your fears, your patterns?',
        placeholder: 'Final reflection...',
      },
    ],
  },

  // ─── 4. Active Imagination ───────────────────────────────────────────────────
  {
    id: 'active-imagination',
    title: 'Active Imagination',
    tagline: 'Let the unconscious speak.',
    description:
      "Jung's original technique for engaging with unconscious contents. You enter a meditative state, allow an image or figure to arise, and then engage with it — writing down the encounter afterward. A direct conversation with the shadow.",
    category: 'imagination',
    stage: 'dialogue',
    estimatedMinutes: 30,
    depth: 'abyss',
    steps: [
      {
        type: 'instruction',
        id: 'ai-intro',
        title: 'Active Imagination',
        body: "This is Jung's original technique for contacting the unconscious directly. Unlike passive fantasy, you remain present and engaged — a witness and participant, not a spectator.\n\nYou'll enter a relaxed, receptive state and allow whatever wants to arise to come forward: an image, a figure, a scene, a voice. Then you'll record and reflect on what emerged.\n\nThis exercise works with whatever is alive in your unconscious right now.",
      },
      {
        type: 'instruction',
        id: 'ai-prepare',
        title: 'Prepare',
        body: "Find a quiet position. You can sit or lie down. Close your eyes.\n\nFor the next few minutes, breathe slowly and allow your ordinary thinking mind to quiet. Don't force images — just become receptive. If thoughts arise, let them pass like clouds.\n\nWhen you're ready, begin the timed pause below.",
      },
      {
        type: 'timed-pause',
        id: 'ai-meditation',
        label: 'Receptive meditation',
        durationSeconds: 300,
        ambient: true,
      },
      {
        type: 'prompt',
        id: 'ai-what-arose',
        question:
          "What arose? Describe any image, figure, scene, sensation, emotion, or fragment that came. Don't interpret yet — just describe what you encountered.",
        placeholder:
          'An old woman in a dark corridor. A burning house. A feeling of dread in my chest. Anything...',
      },
      {
        type: 'freewrite',
        id: 'ai-dialogue',
        prompt:
          'Now engage with what arose. If a figure appeared, speak to them — and let them respond. If it was a scene, step into it. Write the encounter as it unfolds, in dialogue or narrative form.',
        placeholder: 'I asked the figure: "Who are you?" It said...',
      },
      {
        type: 'prompt',
        id: 'ai-meaning',
        question:
          'What might this image or figure represent as a part of yourself? What quality, emotion, or repressed aspect could it be carrying?',
        placeholder: 'The dark figure might represent my anger. The burning house might be...',
      },
      {
        type: 'reflection',
        id: 'ai-reflection',
        prompt:
          'What does this encounter want you to know? What is the unconscious pointing toward?',
        placeholder: 'Final reflection...',
      },
    ],
  },

  // ─── 5. Mirror Work ──────────────────────────────────────────────────────────
  {
    id: 'mirror-work',
    title: 'Mirror Work',
    tagline: 'Look yourself in the eye.',
    description:
      "A confrontational practice of standing before a mirror and speaking truths you've been avoiding. Developed by Louise Hay and adapted for shadow work — the mirror forces you to meet what you've been hiding from yourself.",
    category: 'mirror',
    stage: 'encounter',
    estimatedMinutes: 15,
    depth: 'deep',
    steps: [
      {
        type: 'instruction',
        id: 'mw-intro',
        title: 'Mirror Work',
        body: "For this exercise, you'll need a mirror — a bathroom mirror works fine. Stand or sit where you can look directly into your own eyes.\n\nThis is one of the most confronting exercises in shadow work. The mirror removes the ability to hide. What you'll likely notice is resistance — the urge to look away, to minimize, to perform.\n\nThat resistance is the shadow. Stay with it.",
      },
      {
        type: 'instruction',
        id: 'mw-setup',
        title: 'Set up',
        body: "Go to your mirror now. Stand or sit comfortably. Look into your own eyes.\n\nTake three slow breaths. Notice what you feel — awkwardness, self-consciousness, judgment, or something else. That's where we'll begin.",
      },
      {
        type: 'prompt',
        id: 'mw-first-look',
        question:
          'What do you notice when you look at yourself? What is your first reaction — and what does that reaction reveal?',
        placeholder: 'Describe without judgment...',
      },
      {
        type: 'instruction',
        id: 'mw-truth-guide',
        title: 'During the pause:',
        body: "While looking in the mirror, speak aloud (or silently if you need to):\n\n\u2022 Something you've been ashamed to admit\n\u2022 Something you've been pretending isn't true\n\u2022 Something you've been hiding from people who love you\n\nStay with whatever arises. Don't look away.",
      },
      {
        type: 'timed-pause',
        id: 'mw-truth-hold',
        label: "Hold your gaze — say what you've been afraid to say",
        durationSeconds: 90,
      },
      {
        type: 'prompt',
        id: 'mw-what-said',
        question: 'What did you say to yourself? What truth came forward?',
        placeholder: 'Write it down now...',
      },
      {
        type: 'instruction',
        id: 'mw-compassion-guide',
        title: 'During the pause:',
        body: "Now look at yourself with the same eyes you'd use to look at someone you love.\n\nSay: \"I see you. I know what you're carrying. I'm not going to look away.\"\n\nOr whatever words feel true.",
      },
      {
        type: 'timed-pause',
        id: 'mw-compassion-hold',
        label: 'Hold your gaze — offer yourself compassion',
        durationSeconds: 60,
      },
      {
        type: 'reflection',
        id: 'mw-reflection',
        prompt:
          'What shifted during this exercise? What did it feel like to stay present with yourself rather than looking away?',
        placeholder: 'Final reflection...',
      },
    ],
  },

  // ─── 6. Trigger Tracking ────────────────────────────────────────────────────
  {
    id: 'trigger-tracking',
    title: 'Trigger Tracking',
    tagline: 'Follow the charge back to the source.',
    description:
      'A structured logging and inquiry practice. When something provokes a disproportionate reaction, you capture it in detail — situation, emotion, intensity, body sensation — and trace it back to its shadow origin.',
    category: 'trigger',
    stage: 'recognition',
    estimatedMinutes: 10,
    depth: 'surface',
    steps: [
      {
        type: 'instruction',
        id: 'tt-intro',
        title: 'Trigger Tracking',
        body: "A trigger is a disproportionate reaction — an emotional charge that's bigger than the situation seems to warrant. That excess charge is shadow material trying to surface.\n\nThis exercise captures a recent trigger in detail and traces it back to its source. Use it when something got under your skin and you want to understand why.",
      },
      {
        type: 'prompt',
        id: 'tt-situation',
        question: 'Describe the trigger. What happened — exactly what was said or done?',
        placeholder: 'Be specific. What were the exact words, actions, or circumstances?',
      },
      {
        type: 'choice',
        id: 'tt-emotion',
        question: 'What was the primary emotion you felt?',
        options: [
          'Anger',
          'Shame',
          'Fear',
          'Disgust',
          'Sadness',
          'Envy',
          'Humiliation',
          'Abandonment',
        ],
      },
      {
        type: 'prompt',
        id: 'tt-intensity',
        question:
          'How intense was the reaction, on a scale of 1 to 10? And where did you feel it in your body?',
        placeholder: 'e.g., "8/10. Tight chest, heat rising in my face, urge to flee."',
      },
      {
        type: 'prompt',
        id: 'tt-earliest',
        question:
          'When is the earliest time you remember feeling this exact feeling? How old were you, and what was happening?',
        placeholder: 'Follow the thread back...',
      },
      {
        type: 'prompt',
        id: 'tt-shadow',
        question:
          "What shadow quality might this trigger be pointing to — in yourself? What does it say about what you've repressed or denied?",
        placeholder: 'This is the shadow insight — what does the reaction reveal about you?',
      },
      {
        type: 'reflection',
        id: 'tt-reflection',
        prompt: 'What do you want to do with this insight? What, if anything, does it ask of you?',
        placeholder: 'Final reflection...',
      },
    ],
  },

  // ─── 7. Dream Work ──────────────────────────────────────────────────────────
  {
    id: 'dream-work',
    title: 'Dream Work',
    tagline: "Decode the shadow's nightly transmissions.",
    description:
      "Dreams are the shadow's primary language. This exercise guides you through recording a dream in full detail, identifying the shadow figures, exploring what each element represents as a part of yourself, and integrating the dream's message.",
    category: 'dream',
    stage: 'encounter',
    estimatedMinutes: 20,
    depth: 'deep',
    steps: [
      {
        type: 'instruction',
        id: 'dw-intro',
        title: 'Dream Work',
        body: "Every character in a dream is a part of you. The shadow communicates most directly through dreams — through dark figures, threatening strangers, recurring symbols, and the emotions that linger on waking.\n\nThis exercise works with a specific dream: one that felt significant, disturbing, or that you can't stop thinking about.",
      },
      {
        type: 'freewrite',
        id: 'dw-record',
        prompt:
          "Record the dream in full detail. Write in present tense as if it's happening now. Include images, figures, settings, emotions, and anything that felt strange or significant.",
        placeholder:
          "I'm standing in a house I don't recognize. There's a figure in the hallway...",
      },
      {
        type: 'prompt',
        id: 'dw-figures',
        question:
          'List the main figures or symbols in the dream. Who or what appeared? Include both human figures and any significant objects or settings.',
        placeholder: 'e.g., "A threatening man. My childhood home. A locked door. A black dog."',
      },
      {
        type: 'prompt',
        id: 'dw-emotion',
        question:
          'What was the dominant emotion in the dream — and what emotion lingered when you woke? Describe both.',
        placeholder: 'In the dream I felt... When I woke I felt...',
      },
      {
        type: 'prompt',
        id: 'dw-shadow-figure',
        question:
          'Choose the figure or element that disturbed or fascinated you most. If that figure were a part of yourself — a shadow quality or disowned aspect — what might it represent?',
        placeholder: 'The threatening man might be my repressed anger. The locked door might be...',
      },
      {
        type: 'freewrite',
        id: 'dw-dialogue',
        prompt:
          'Use active imagination: close your eyes and re-enter the dream. Approach the most significant figure and ask: "Who are you? What do you want me to know?" Write the dialogue.',
        placeholder: 'I approached the figure and asked... It said...',
      },
      {
        type: 'reflection',
        id: 'dw-reflection',
        prompt:
          'What is this dream trying to bring to your attention? What shadow material might it be surfacing — and what does that ask of you in waking life?',
        placeholder: 'Final reflection...',
      },
    ],
  },
];

export const exerciseById: Record<string, Exercise> = Object.fromEntries(
  exercises.map((e) => [e.id, e]),
);

/**
 * Returns exercises filtered by depth level.
 */
export function getExercisesByDepth(depth: ExerciseDepth): Exercise[] {
  return exercises.filter((e) => e.depth === depth);
}

/**
 * Returns exercises filtered by stage.
 */
export function getExercisesByStage(stage: ExerciseStage): Exercise[] {
  return exercises.filter((e) => e.stage === stage);
}
