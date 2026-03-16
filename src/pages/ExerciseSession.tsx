import { useNavigate, useParams } from 'react-router-dom';
import { exercises } from '../data/exercises';
import ExerciseShell from '../components/exercise/ExerciseShell';
import { db } from '../db/index';
import { recalculateStreak } from '../db/streak';
import type { DreamEntry, TriggerLog } from '../db/schema';

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

// ─── Trigger Log helpers ──────────────────────────────────────────────────────

/**
 * Parse trigger-tracking exercise responses into structured TriggerLog fields.
 * Extracts a 1-10 integer from the intensity/body-location freeform response.
 */
function parseTriggerLog(responses: Record<string, string>): Omit<TriggerLog, 'id' | 'createdAt'> {
  const situation = responses['tt-situation'] ?? '';
  const emotion = responses['tt-emotion'] ?? '';
  const intensityText = responses['tt-intensity'] ?? '';
  const shadowInsight = responses['tt-shadow'] ?? '';

  // Extract the first 1–10 integer from the freeform response (e.g. "8/10. Tight chest…")
  const match = intensityText.match(/\b(10|[1-9])\b/);
  const intensity = match && match[1] !== undefined ? parseInt(match[1], 10) : 5;

  return {
    situation,
    emotion,
    intensity,
    bodyLocation: intensityText || undefined,
    shadowInsight: shadowInsight || undefined,
  };
}

async function saveTriggerLog(responses: Record<string, string>): Promise<void> {
  const parsed = parseTriggerLog(responses);
  await db.triggerLogs.add({
    id: crypto.randomUUID(),
    ...parsed,
    createdAt: new Date(),
  });
}

// ─── Inner Child helpers ──────────────────────────────────────────────────────

/**
 * Format inner-child responses into a journal entry with the letter as the
 * primary content.
 */
function formatInnerChildJournal(responses: Record<string, string>): string {
  const age = responses['ic-age'] ?? '';
  const whatNeeded = responses['ic-what-needed'] ?? '';
  const letter = responses['ic-letter'] ?? '';
  const reflection = responses['ic-reflection'] ?? '';

  const lines: string[] = ['# Letter to My Younger Self', ''];
  if (age.trim()) {
    lines.push('**About that time**', age.trim(), '');
  }
  if (whatNeeded.trim()) {
    lines.push('**What they needed**', whatNeeded.trim(), '');
  }
  if (letter.trim()) {
    lines.push('**The letter**', letter.trim(), '');
  }
  if (reflection.trim()) {
    lines.push('**Reflection**', reflection.trim(), '');
  }
  return lines.join('\n').trim();
}

async function saveInnerChildLetter(
  responses: Record<string, string>,
  startedAt: Date,
): Promise<void> {
  const now = new Date();
  const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000);
  const content = formatInnerChildJournal(responses);

  await Promise.all([
    db.exerciseCompletions.add({
      id: crypto.randomUUID(),
      exerciseId: 'inner-child',
      responses,
      completedAt: now,
      durationSeconds,
    }),
    db.journalEntries.add({
      id: crypto.randomUUID(),
      content,
      exerciseId: 'inner-child',
      tags: ['exercise', 'inner-child', 'letter'],
      createdAt: now,
      updatedAt: now,
    }),
  ]);
  await recalculateStreak();
}

// ─── Active Imagination helpers ───────────────────────────────────────────────

/**
 * Format active-imagination responses into a journal entry that foregrounds
 * the encounter dialogue (the freewrite recorded after meditation).
 */
function formatActiveImaginationJournal(responses: Record<string, string>): string {
  const whatArose = responses['ai-what-arose'] ?? '';
  const dialogue = responses['ai-dialogue'] ?? '';
  const meaning = responses['ai-meaning'] ?? '';
  const reflection = responses['ai-reflection'] ?? '';

  const lines: string[] = ['# Active Imagination — The Encounter', ''];
  if (whatArose.trim()) {
    lines.push('**What arose**', whatArose.trim(), '');
  }
  if (dialogue.trim()) {
    lines.push('**The encounter**', dialogue.trim(), '');
  }
  if (meaning.trim()) {
    lines.push('**What it represents**', meaning.trim(), '');
  }
  if (reflection.trim()) {
    lines.push('**Reflection**', reflection.trim(), '');
  }
  return lines.join('\n').trim();
}

async function saveActiveImagination(
  responses: Record<string, string>,
  startedAt: Date,
): Promise<void> {
  const now = new Date();
  const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000);
  const content = formatActiveImaginationJournal(responses);

  await Promise.all([
    db.exerciseCompletions.add({
      id: crypto.randomUUID(),
      exerciseId: 'active-imagination',
      responses,
      completedAt: now,
      durationSeconds,
    }),
    db.journalEntries.add({
      id: crypto.randomUUID(),
      content,
      exerciseId: 'active-imagination',
      tags: ['exercise', 'active-imagination', 'encounter'],
      createdAt: now,
      updatedAt: now,
    }),
  ]);
  await recalculateStreak();
}

// ─── Dream Log helpers ────────────────────────────────────────────────────────

/**
 * Split a freeform comma/newline/semicolon list into individual items,
 * trimming whitespace and filtering blanks.
 */
function splitList(text: string): string[] {
  return text
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parse dream-work exercise responses into structured DreamEntry fields.
 */
function parseDreamEntry(responses: Record<string, string>): Omit<DreamEntry, 'id' | 'createdAt'> {
  const content = responses['dw-record'] ?? '';
  const figures = splitList(responses['dw-figures'] ?? '');
  const emotions = splitList(responses['dw-emotion'] ?? '');
  const analysisParts = [responses['dw-shadow-figure'], responses['dw-reflection']].filter(Boolean);
  const analysisNotes = analysisParts.join('\n\n') || undefined;

  return { content, figures, emotions, analysisNotes };
}

async function saveDreamEntry(responses: Record<string, string>): Promise<void> {
  const parsed = parseDreamEntry(responses);
  await db.dreamEntries.add({
    id: crypto.randomUUID(),
    ...parsed,
    createdAt: new Date(),
  });
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
    if (ex.id === 'trigger-tracking') {
      void Promise.all([
        saveCompletion(ex.id, responses, mountedAt),
        saveTriggerLog(responses),
      ]).then(() => {
        navigate('/exercises/trigger-patterns');
      });
    } else if (ex.id === 'dream-work') {
      void Promise.all([
        saveCompletion(ex.id, responses, mountedAt),
        saveDreamEntry(responses),
      ]).then(() => {
        navigate('/exercises/dream-journal');
      });
    } else {
      void saveCompletion(ex.id, responses, mountedAt).then(() => {
        navigate('/exercises');
      });
    }
  }

  function handleSaveReflections(responses: Record<string, string>) {
    if (ex.id === 'inner-child') {
      void saveInnerChildLetter(responses, mountedAt).then(() => {
        navigate('/journal');
      });
    } else if (ex.id === 'active-imagination') {
      void saveActiveImagination(responses, mountedAt).then(() => {
        navigate('/journal');
      });
    } else if (ex.id === 'trigger-tracking') {
      void Promise.all([
        saveCompletionWithJournal(ex, responses, mountedAt),
        saveTriggerLog(responses),
      ]).then(() => {
        navigate('/exercises/trigger-patterns');
      });
    } else if (ex.id === 'dream-work') {
      void Promise.all([
        saveCompletionWithJournal(ex, responses, mountedAt),
        saveDreamEntry(responses),
      ]).then(() => {
        navigate('/exercises/dream-journal');
      });
    } else {
      void saveCompletionWithJournal(ex, responses, mountedAt).then(() => {
        navigate('/journal');
      });
    }
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
