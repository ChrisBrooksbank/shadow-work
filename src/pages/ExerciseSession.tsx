import { useNavigate, useParams } from 'react-router-dom';
import { exercises } from '../data/exercises';
import ExerciseShell from '../components/exercise/ExerciseShell';
import { db } from '../db/index';
import { recalculateStreak } from '../db/streak';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Bundle exercise responses into a readable journal entry body. */
function bundleResponses(exerciseTitle: string, responses: Record<string, string>): string {
  const lines: string[] = [`# ${exerciseTitle}`, ''];
  for (const [stepId, value] of Object.entries(responses)) {
    if (value.trim()) {
      lines.push(`**${stepId}**`, value.trim(), '');
    }
  }
  return lines.join('\n').trim();
}

async function saveCompletion(
  exerciseId: string,
  responses: Record<string, string>,
  startedAt: Date,
): Promise<void> {
  const now = new Date();
  const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000);
  await db.exerciseCompletions.add({
    id: crypto.randomUUID(),
    exerciseId,
    responses,
    completedAt: now,
    durationSeconds,
  });
  await recalculateStreak();
}

async function saveCompletionWithJournal(
  exercise: { id: string; title: string },
  responses: Record<string, string>,
  startedAt: Date,
): Promise<void> {
  const now = new Date();
  const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000);
  const content = bundleResponses(exercise.title, responses);

  await Promise.all([
    db.exerciseCompletions.add({
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      responses,
      completedAt: now,
      durationSeconds,
    }),
    db.journalEntries.add({
      id: crypto.randomUUID(),
      content,
      exerciseId: exercise.id,
      tags: ['exercise', exercise.id],
      createdAt: now,
      updatedAt: now,
    }),
  ]);
  await recalculateStreak();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExerciseSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const exercise = exercises.find((e) => e.id === id);

  if (!exercise) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Exercise not found.</p>
      </main>
    );
  }

  // startedAt is tracked inside ExerciseShell/useExerciseFlow; we approximate
  // duration from when the shell mounts to when completion fires.
  const mountedAt = new Date();
  // Capture as a non-nullable local so closures have a definite type.
  const ex = exercise;

  function handleComplete(responses: Record<string, string>) {
    void saveCompletion(ex.id, responses, mountedAt).then(() => {
      navigate('/exercises');
    });
  }

  function handleSaveReflections(responses: Record<string, string>) {
    void saveCompletionWithJournal(ex, responses, mountedAt).then(() => {
      navigate('/journal');
    });
  }

  return (
    <ExerciseShell
      exercise={exercise}
      onClose={() => navigate('/exercises')}
      onComplete={handleComplete}
      onSaveReflections={handleSaveReflections}
    />
  );
}
