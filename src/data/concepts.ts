export interface ConceptSection {
  heading: string;
  body: string;
}

export interface Concept {
  slug: string;
  title: string;
  summary: string;
  sections: ConceptSection[];
  relatedExerciseIds: string[];
  readingTime: number; // minutes
}

export const concepts: Concept[] = [
  // ─── 1. What Is the Shadow? ──────────────────────────────────────────────────
  {
    slug: 'what-is-the-shadow',
    title: 'What Is the Shadow?',
    summary:
      'The shadow is the part of you that you hide — from others and from yourself. Understanding it is the first step toward becoming whole.',
    sections: [
      {
        heading: 'The part you disown',
        body: "You carry more than you show the world. Some parts of you — your anger, your neediness, your ambition, your shame — were labeled unacceptable early on. You learned to push them down, hide them, pretend they don't exist. That collection of disowned parts is what Carl Jung called the shadow.\n\nThe shadow isn't evil. It's simply everything you've concluded you shouldn't be. And because you've never looked at it directly, it runs your life from underground — driving your overreactions, your self-sabotage, your patterns you can't seem to break.",
      },
      {
        heading: 'Why it matters',
        body: "Jung put it plainly: \"Until you make the unconscious conscious, it will direct your life and you will call it fate.\"\n\nThe shadow doesn't disappear because you ignore it. It gets stronger. It leaks out sideways — in the way you snap at people you love, the way you shrink from opportunities that feel too big, the way you keep ending up in the same situations you swore you'd never be in again.\n\nShadow work is the practice of turning toward what you've been turning away from. Not to wallow in it — but to finally understand it, so it stops controlling you.",
      },
      {
        heading: 'What the shadow contains',
        body: "Your shadow isn't all darkness. It holds everything you've been told is unacceptable — and that includes qualities that are actually strengths.\n\nThe obvious shadow contents: rage, jealousy, shame, laziness, cruelty, the desires you've deemed wrong, the emotions you were taught not to feel.\n\nThe less obvious contents — what Jung called the golden shadow: your power, your creativity, your intelligence, your capacity for leadership and intensity and joy. These get suppressed too, when they felt too dangerous or too threatening to others.\n\nMeeting the shadow means meeting all of it.",
      },
    ],
    relatedExerciseIds: ['shadow-journaling', 'mirror-work'],
    readingTime: 4,
  },

  // ─── 2. How the Shadow Forms ─────────────────────────────────────────────────
  {
    slug: 'how-the-shadow-forms',
    title: 'How the Shadow Forms',
    summary:
      "Your shadow didn't appear by accident. It was built — piece by piece — through childhood conditioning, cultural rules, and the need to be loved.",
    sections: [
      {
        heading: 'The original split',
        body: "When you were very young, you were whole. You cried when you were sad. You were angry when you were hurt. You wanted what you wanted without apology. Then you learned which parts of that wholeness were acceptable — and which weren't.\n\nYour parents rewarded certain behaviors and punished others. Your culture told you what a good person looks like. Your peers let you know what made you an outcast. Over time, the parts that didn't fit got packed away. That packing away is how the shadow forms.",
      },
      {
        heading: 'The forces that shape it',
        body: 'Several forces drive shadow formation:\n\n**Parental conditioning.** Your earliest lessons came from the people you depended on for survival. If showing anger got you punished or withdrawn from, you learned to suppress it. If needing comfort was met with criticism, you learned to need nothing.\n\n**Cultural norms.** Every culture has rules about what a good person is. Those rules push anything that violates them underground. What gets suppressed varies — but every culture produces a shadow.\n\n**Trauma.** Painful experiences can cause entire aspects of yourself to be split off and hidden. The shadow often contains frozen pain — parts that retreated to protect you and never came back.\n\n**Religious and moral frameworks.** Strict moral systems create sharp lines between the acceptable self and the unacceptable. Anything that crosses those lines often gets labeled sinful, shameful, or wrong — and pushed into shadow.\n\n**Peer socialization.** School teaches you, often brutally, which parts of you invite ridicule. You suppress those parts fast.',
      },
      {
        heading: 'What this means for you',
        body: "Your shadow is a record of what it cost you to become the person you are. Every trait you've disowned, every feeling you learned not to feel — it's stored there.\n\nThat's not a flaw. It was survival. The problem is that what protected you as a child often limits you as an adult. The suppression that kept you safe back then is now the thing that's keeping you from being fully yourself.",
      },
    ],
    relatedExerciseIds: ['inner-child', 'shadow-journaling'],
    readingTime: 4,
  },

  // ─── 3. Projection ───────────────────────────────────────────────────────────
  {
    slug: 'projection',
    title: 'Projection: How to Spot It',
    summary:
      'When you react strongly to someone else, you might be looking at your own shadow. Projection is how the unconscious reveals itself.',
    sections: [
      {
        heading: 'What projection is',
        body: "Projection is the mechanism by which the shadow reveals itself. When you encounter a trait in someone else that exists in your own shadow — a trait you've denied, suppressed, or disowned — you react with disproportionate emotion.\n\nThat disproportionate charge is the signal. Jung observed that everything that irritates us about others can lead us to an understanding of ourselves. The intensity of your reaction is the clue. If something bothers you a little, maybe they're just annoying. If it bothers you enormously — if you feel a flash of rage, deep disgust, or irrational contempt — that's projection.",
      },
      {
        heading: 'How to recognize it',
        body: "You're likely projecting when:\n\n**You react with more emotion than the situation seems to warrant.** The person didn't do something that bad — but your response was intense.\n\n**You keep encountering the same type.** If you keep attracting the same \"kind\" of person who frustrates you in the same way, you're probably projecting shadow material onto them.\n\n**You judge others harshly for something you do yourself.** The behavior you condemn loudest in others is often the behavior you engage in but refuse to acknowledge.\n\n**You feel irrational contempt.** Not just dislike — something closer to disgust or moral outrage that feels bigger than the facts warrant.\n\n**You idealize someone.** Projection isn't only negative. Placing someone on a pedestal — believing they're extraordinary in ways you could never be — is golden shadow projection.",
      },
      {
        heading: 'Reclaiming the projection',
        body: "Recognizing a projection is the first step. The second step — the harder one — is asking: how does this quality live in me?\n\nThis doesn't mean you're exactly like the person who triggered you. It means the quality exists in you in some form, perhaps expressed differently, perhaps suppressed. Your job is to find it and acknowledge it.\n\nWhen you reclaim a projection, the emotional charge usually diminishes. The person who used to drive you crazy becomes less significant — not because they changed, but because you stopped needing them to carry your shadow.",
      },
    ],
    relatedExerciseIds: ['three-two-one', 'shadow-journaling', 'trigger-tracking'],
    readingTime: 5,
  },

  // ─── 4. The Persona ──────────────────────────────────────────────────────────
  {
    slug: 'the-persona',
    title: 'The Persona and the Shadow',
    summary:
      'The mask you wear for the world and the shadow you hide from it are two sides of the same coin. The stronger the persona, the deeper the shadow.',
    sections: [
      {
        heading: 'The mask you wear',
        body: "Jung called it the persona — the face you present to the world. It's not fake exactly; it's the role you've learned to play. The professional. The good parent. The agreeable one. The person who has it together.\n\nThe persona develops alongside the shadow. As you learned which parts of yourself were acceptable, those became your persona — your constructed social self. Everything else went into the shadow.\n\nThe persona isn't a problem in itself. You need some ability to adapt to different social contexts. The problem is when you forget it's a mask — when you identify with it so completely that you lose access to everything underneath.",
      },
      {
        heading: 'The stronger the mask, the deeper the shadow',
        body: "This is the paradox you need to understand: the more perfect your persona, the more material you've pushed into shadow.\n\nThe person who is always calm, always composed, always appropriate — has a shadow seething with suppressed rage and chaos. The person who is always kind, always giving, always selfless — has a shadow filled with buried resentment and unexpressed needs.\n\nWhatever your persona insists on being, your shadow is its opposite. That's not speculation — it's how psychic splitting works. What gets excluded from one side of the divide collects on the other.",
      },
      {
        heading: 'Loosening the mask',
        body: "You don't need to destroy your persona. You need to hold it more lightly — to know you're wearing a mask rather than believing you are the mask.\n\nShadow work loosens the grip of the persona by making the shadow material conscious. As you acknowledge what you've been hiding, you become less dependent on keeping the performance perfect. You develop range — the capacity to be more of yourself in more situations, rather than a fixed role.\n\nThe goal isn't to stop being professional, or kind, or composed. The goal is to choose it freely, rather than being trapped by it.",
      },
    ],
    relatedExerciseIds: ['mirror-work', 'shadow-journaling'],
    readingTime: 4,
  },

  // ─── 5. Integration vs. Elimination ─────────────────────────────────────────
  {
    slug: 'integration-vs-elimination',
    title: 'Integration, Not Elimination',
    summary:
      "The goal of shadow work is not to get rid of your darkness. It's to build a relationship with it — so it stops running your life from underground.",
    sections: [
      {
        heading: "You can't eliminate the shadow",
        body: "Here's the mistake most people make when they first encounter shadow work: they try to fix themselves. They want to root out the bad parts and become someone who no longer has them.\n\nThis doesn't work. The shadow is not a defect to be corrected. It's an intrinsic part of the psyche — the repository of everything you've had to split off to survive and function. You can suppress it, but you can't eliminate it. The attempt to do so just drives it deeper and makes it stronger.\n\nJung was clear about this: one does not become enlightened by imagining figures of light, but by making the darkness conscious. The work is not to be less — it's to be more whole.",
      },
      {
        heading: 'What integration actually means',
        body: "Integration means bringing shadow material into conscious awareness — not acting it out, but acknowledging it. Knowing it's there. Understanding where it came from and what it's been trying to do.\n\nYou don't have to become your anger to integrate anger. You have to admit you have it, understand what it's protecting, and find ways to express it that don't destroy you or other people.\n\nYou don't have to act on every repressed desire to integrate it. You have to stop pretending it doesn't exist, explore what it's really about, and make conscious choices about it rather than being driven by it unconsciously.",
      },
      {
        heading: 'What integration looks like in practice',
        body: "As you integrate shadow material, things change:\n\nYour overreactions diminish. When you've acknowledged a quality in yourself, it stops charging up so intensely when you encounter it in others.\n\nYou become more authentic. When you're not spending energy maintaining the performance of perfection, you have more capacity for genuine connection.\n\nYou develop compassion. Meeting your own darkness makes it harder to demonize others'. You recognize the shared humanity in the things people hide.\n\nYou have more range. Integration doesn't mean you become chaotic or unethical. It means you stop being rigidly controlled by your persona. You can access more of yourself in more situations.\n\nThis is what Jung meant by individuation — becoming, over time, a whole person rather than a divided one.",
      },
    ],
    relatedExerciseIds: ['shadow-journaling', 'active-imagination', 'three-two-one'],
    readingTime: 5,
  },

  // ─── 6. Shadow in Relationships ──────────────────────────────────────────────
  {
    slug: 'shadow-in-relationships',
    title: 'Shadow in Relationships',
    summary:
      'Your closest relationships are your richest source of shadow material. The people who trigger you most are often your best teachers.',
    sections: [
      {
        heading: 'Why relationships activate the shadow',
        body: "Relationships are shadow work's sharpest arena. Intimacy collapses the distance you normally maintain from yourself. The closer someone gets, the more your shadow has to work with.\n\nThe people you live with, the people you love, the people you chose to partner with — they trigger your shadow more intensely than strangers because they matter more. The charge is proportional to the stakes.",
      },
      {
        heading: 'The patterns you keep repeating',
        body: "If you keep finding yourself in the same relationship dynamics — the same conflicts, the same disappointments, the same roles — your shadow is involved.\n\nThe patterns aren't random. You unconsciously select partners, friends, and situations that fit your shadow template. This happens because the shadow's material feels familiar, and the familiar feels like home — even when it hurts.\n\nYou may keep attracting partners who withhold emotionally, because early in life love felt like it needed to be earned. You may keep choosing relationships where you play the caretaker, because need felt dangerous to express directly. The pattern will repeat until you bring it into awareness.",
      },
      {
        heading: 'What your partner mirrors',
        body: "Jung noticed that we often project our shadow onto the people we're closest to — especially romantic partners. You see in them the qualities you've denied in yourself.\n\nThis is why falling in love feels like discovering something essential and then, sometimes, ends in hating the very things you first loved. The projection mechanism is at work in both directions. You fell in love partly with your own golden shadow, projected onto them. And what irritates you most is probably a disowned quality in yourself.\n\nThis isn't a reason to leave relationships. It's a reason to approach them as one of the most powerful sites of self-knowledge available to you.",
      },
      {
        heading: 'Working with relationship shadow',
        body: "When a relationship triggers you, the first question to ask is: what shadow material is this activating?\n\nNot: what is wrong with them. That question keeps the shadow projected outward and you stuck.\n\nInstead: what does this reaction reveal about me? What have I suppressed that this person is carrying on my behalf? What do they reflect that I've been unwilling to see?\n\nThis doesn't excuse harmful behavior from others. It's about reclaiming your own wholeness, so you stop unconsciously creating the same suffering over and over.",
      },
    ],
    relatedExerciseIds: ['three-two-one', 'trigger-tracking', 'shadow-journaling'],
    readingTime: 5,
  },

  // ─── 7. The Golden Shadow ────────────────────────────────────────────────────
  {
    slug: 'the-golden-shadow',
    title: 'The Golden Shadow',
    summary:
      'Not everything in your shadow is dark. Your repressed gifts — your power, creativity, and full potential — are waiting to be reclaimed.',
    sections: [
      {
        heading: "The shadow you didn't expect",
        body: "When people talk about the shadow, they usually mean the dark stuff — the rage, the shame, the impulses you're ashamed of. But the shadow also contains what Robert Johnson called the golden shadow: the positive qualities you've suppressed.\n\nYour intelligence, if it threatened a parent. Your creativity, if it invited ridicule. Your leadership, if it felt dangerous to be that visible. Your sensuality, your power, your ambition — if any of these were labeled wrong, too much, or too dangerous to express, they went into the shadow alongside everything else.",
      },
      {
        heading: 'How the golden shadow shows up',
        body: "You experience the golden shadow most clearly through admiration and envy.\n\nWhen you deeply admire someone — when you find their confidence, their creativity, their magnetism almost unbearable to witness — you're likely projecting your golden shadow onto them. You're seeing in them a quality you've refused to claim in yourself.\n\nEnvy is the sharper signal. Not ordinary envy, but the specific ache of wanting what someone else has in a way that feels like more than wanting — like recognition of something stolen from you. That quality probably belongs to you, and at some point you were told it didn't.",
      },
      {
        heading: 'Reclaiming what you gave away',
        body: "Reclaiming the golden shadow is not the same as deciding to be good at things. It's the slower, more uncomfortable work of actually believing you're allowed.\n\nIf you suppressed your creativity because being artistic felt too exposed, reclaiming it means tolerating the vulnerability of making things and being seen making them.\n\nIf you suppressed your power because being assertive felt too risky, reclaiming it means tolerating the discomfort of taking up space, holding your ground, wanting things directly.\n\nThe golden shadow material tends to feel presumptuous to own. Like you're getting above yourself. That feeling of 'not allowed' is exactly what you're working against.\n\nYou don't reclaim it all at once. You reclaim it by reaching toward the thing that lights you up — the thing you've been dismissing as too big for you — and staying with it a little longer than your shadow allows.",
      },
    ],
    relatedExerciseIds: ['shadow-journaling', 'mirror-work', 'three-two-one'],
    readingTime: 4,
  },

  // ─── 8. Archetypes and the Collective Unconscious ───────────────────────────
  {
    slug: 'archetypes',
    title: 'Archetypes and the Collective Unconscious',
    summary:
      'Your shadow is personal — but it also connects to something larger. Understanding archetypes helps you recognize the universal patterns at work in your psyche.',
    sections: [
      {
        heading: 'Beyond the personal shadow',
        body: "Your personal shadow is shaped by your specific life — your family, your culture, your particular history. But Jung identified something deeper: the collective unconscious.\n\nUnlike the personal unconscious (your repressed personal memories and emotions), the collective unconscious is shared across humanity. It contains the inherited psychological structures — the patterns, images, and potentials — that every human carries simply by virtue of being human.\n\nThese structures are archetypes. They're not memories but templates — innate forms that shape how you experience the world and yourself.",
      },
      {
        heading: 'The major archetypes',
        body: "Jung identified several major archetypes that are especially relevant to shadow work:\n\n**The Shadow** — the archetype of everything you've repressed and disowned. It appears in dreams as threatening figures, dark strangers, or any force that pursues, confronts, or challenges you.\n\n**The Persona** — the mask you present to the world; the social role you've constructed. It's the archetype of social adaptation.\n\n**The Anima/Animus** — the contrasexual archetype. In people who identify as men, the anima represents the feminine dimension of the psyche. In people who identify as women, the animus represents the masculine. These archetypes carry qualities that have been suppressed because they didn't fit a gender role.\n\n**The Self** — the archetype of wholeness. Not the ego or the persona, but the center of the total psyche — the force that drives individuation. The Self is what you're moving toward when you do shadow work.",
      },
      {
        heading: 'Archetypes in your experience',
        body: "You encounter archetypes in dreams, in your intense reactions to stories and myths, in the figures that obsess you, and in the patterns that recur across your life.\n\nThe threatening figure who appears in recurring nightmares is likely your shadow archetype. The person you idealize to an almost irrational degree may be carrying your anima or animus projection. The pull you feel toward a particular story or myth often means an archetype within it is speaking to something unacknowledged in your own psyche.\n\nRecognizing archetypes doesn't explain everything away. It gives you a larger frame — one in which your personal struggles connect to patterns that every human has faced. That recognition can be surprisingly relieving. You're not uniquely broken. You're working through what humans have always had to work through.",
      },
      {
        heading: 'What this means for shadow work',
        body: "Understanding archetypes shifts shadow work from personal navel-gazing to something more spacious. Your shadow isn't just about what your parents told you or what your culture suppressed. It connects to the larger patterns of what it means to be human — what every person has had to split off and reintegrate.\n\nThis is why fairy tales, myths, and great literature speak so powerfully about shadow themes. They're working with the same material. The hero who must face a monster, the story of descent and return, the journey into the underworld — these are all maps of the same territory you're navigating when you do shadow work.",
      },
    ],
    relatedExerciseIds: ['active-imagination', 'dream-work', 'shadow-journaling'],
    readingTime: 6,
  },
];

export const conceptBySlug: Record<string, Concept> = Object.fromEntries(
  concepts.map((c) => [c.slug, c]),
);

/**
 * Returns the concept that comes after the given slug in the list.
 * Wraps around to the first concept after the last.
 */
export function getNextConcept(slug: string): Concept | undefined {
  const index = concepts.findIndex((c) => c.slug === slug);
  if (index === -1) return undefined;
  return concepts[(index + 1) % concepts.length];
}
