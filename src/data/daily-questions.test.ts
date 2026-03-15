import { dailyQuestions, getDailyQuestion } from './daily-questions';

test('pool has at least 20 questions', () => {
  expect(dailyQuestions.length).toBeGreaterThanOrEqual(20);
});

test('every question is a non-empty string', () => {
  for (const q of dailyQuestions) {
    expect(typeof q).toBe('string');
    expect(q.trim().length).toBeGreaterThan(0);
  }
});

test('getDailyQuestion returns the same question for the same date', () => {
  const q1 = getDailyQuestion('2026-03-15');
  const q2 = getDailyQuestion('2026-03-15');
  expect(q1).toBe(q2);
});

test('getDailyQuestion returns a string from the pool', () => {
  const q = getDailyQuestion('2026-03-15');
  expect(dailyQuestions).toContain(q);
});

test('getDailyQuestion returns different questions for different dates', () => {
  const questions = new Set(
    Array.from({ length: dailyQuestions.length }, (_, i) => {
      const d = new Date(Date.UTC(2026, 0, 1 + i));
      const dateStr = d.toISOString().slice(0, 10);
      return getDailyQuestion(dateStr);
    }),
  );
  // Should see more than 1 unique question over many days
  expect(questions.size).toBeGreaterThan(1);
});
