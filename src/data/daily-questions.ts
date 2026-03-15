export const dailyQuestions: string[] = [
  'What quality in others irritates you most — and where does it live in you?',
  'What would you do if you knew no one would judge you?',
  'Which version of yourself are you hiding from the people closest to you?',
  'What emotion are you most afraid to feel fully?',
  'Who do you secretly envy, and what does that envy reveal?',
  'What story about yourself are you most attached to keeping true?',
  "When did you last pretend to be okay when you weren't?",
  'What part of you are you still trying to earn love for?',
  "What would the child version of you think of who you've become?",
  'What do you criticize in others that you refuse to see in yourself?',
  'Where in your life are you performing instead of living?',
  'What need are you ashamed to admit you have?',
  'What anger have you been calling something else — sadness, stress, indifference?',
  "Which of your beliefs about yourself came from someone else's fear?",
  'What would you reclaim if you stopped waiting for permission?',
  'Where do you abandon yourself to keep others comfortable?',
  'What have you never forgiven yourself for?',
  'What desire have you buried because it felt dangerous or wrong?',
  'When do you feel most like an impostor, and what truth is underneath that?',
  'What are you protecting yourself from by staying exactly as you are?',
  "Whose voice in your head tells you that you're too much — or not enough?",
  'What part of your past are you still running from?',
  'What would change if you stopped being the strong one?',
  "What do you want that you've told yourself you don't deserve?",
  "What mask do you wear so often you've forgotten it's a mask?",
];

/**
 * Returns a daily question deterministically based on the given date string (YYYY-MM-DD).
 * The same date always returns the same question, and consecutive dates cycle through the pool.
 */
export function getDailyQuestion(dateStr: string): string {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = Number(yearStr ?? '0');
  const month = Number(monthStr ?? '1');
  const day = Number(dayStr ?? '1');
  const dayOfYear = Math.floor(
    (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86_400_000,
  );
  const index = (year * 1000 + dayOfYear) % dailyQuestions.length;
  return dailyQuestions[index] ?? dailyQuestions[0]!;
}
