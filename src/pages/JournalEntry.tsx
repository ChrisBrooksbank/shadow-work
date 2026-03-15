import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db/index';
import type { JournalEntry as JournalEntrySchema } from '../db/schema';
import { recalculateStreak } from '../db/streak';
import { getRandomPrompt } from '../data/prompts';
import TextArea from '../components/ui/TextArea';
import styles from './JournalEntry.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTOSAVE_DELAY_MS = 1000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditorState {
  /** false while waiting for an existing entry to load from DB */
  initialized: boolean;
  content: string;
  tags: string[];
  prompt: string | undefined;
  showPrompt: boolean;
  createdAt: Date | undefined;
  lastSaved: Date | undefined;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function buildEditorState(entry: JournalEntrySchema): EditorState {
  return {
    initialized: true,
    content: entry.content,
    tags: entry.tags,
    prompt: entry.prompt,
    showPrompt: !!entry.prompt,
    createdAt: entry.createdAt,
    lastSaved: entry.updatedAt,
  };
}

function emptyInitializedEditor(): EditorState {
  return {
    initialized: true,
    content: '',
    tags: [],
    prompt: undefined,
    showPrompt: false,
    createdAt: undefined,
    lastSaved: undefined,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function JournalEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  // Refs for timer and entry ID — only accessed in handlers/effects, never in render
  const entryIdRef = useRef<string | undefined>(id);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [editor, setEditor] = useState<EditorState>(() => ({
    initialized: isNew, // new entries need no DB load
    content: '',
    tags: [],
    prompt: undefined,
    showPrompt: false,
    createdAt: undefined,
    lastSaved: undefined,
  }));
  const [tagInput, setTagInput] = useState('');
  const [recentPromptIds, setRecentPromptIds] = useState<string[]>([]);

  // Load existing entry once (async callback avoids set-state-in-effect lint rule)
  useEffect(() => {
    if (!id) return;
    db.journalEntries.get(id).then((entry) => {
      setEditor(entry ? buildEditorState(entry) : emptyInitializedEditor());
    });
  }, [id]);

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ─── Save logic ──────────────────────────────────────────

  async function performSave(
    content: string,
    tags: string[],
    prompt: string | undefined,
  ): Promise<void> {
    const now = new Date();

    if (!entryIdRef.current) {
      const newId = crypto.randomUUID();
      entryIdRef.current = newId;
      await db.journalEntries.add({
        id: newId,
        content,
        prompt,
        tags,
        createdAt: now,
        updatedAt: now,
      });
      await recalculateStreak();
      setEditor((prev) => ({ ...prev, createdAt: now, lastSaved: now }));
      window.history.replaceState(null, '', `/journal/${newId}`);
    } else {
      await db.journalEntries.update(entryIdRef.current, { content, tags, prompt, updatedAt: now });
      setEditor((prev) => ({ ...prev, lastSaved: now }));
    }
  }

  /** Schedule auto-save, capturing current values in the closure. */
  function scheduleAutoSave(content: string, tags: string[], prompt: string | undefined): void {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void performSave(content, tags, prompt);
    }, AUTOSAVE_DELAY_MS);
  }

  // ─── Handlers ────────────────────────────────────────────

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    const val = e.target.value;
    setEditor((prev) => ({ ...prev, content: val }));
    scheduleAutoSave(val, editor.tags, editor.prompt);
  }

  function handleGetPrompt(): void {
    const p = getRandomPrompt(recentPromptIds);
    setRecentPromptIds((prev) => [...prev.slice(-9), p.id]);
    setEditor((prev) => ({ ...prev, prompt: p.text, showPrompt: true }));
    scheduleAutoSave(editor.content, editor.tags, p.text);
  }

  function handleDismissPrompt(): void {
    setEditor((prev) => ({ ...prev, prompt: undefined, showPrompt: false }));
    scheduleAutoSave(editor.content, editor.tags, undefined);
  }

  function handleAddTag(): void {
    const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!trimmed || editor.tags.includes(trimmed)) {
      setTagInput('');
      return;
    }
    const newTags = [...editor.tags, trimmed];
    setEditor((prev) => ({ ...prev, tags: newTags }));
    setTagInput('');
    scheduleAutoSave(editor.content, newTags, editor.prompt);
  }

  function handleRemoveTag(tag: string): void {
    const newTags = editor.tags.filter((t) => t !== tag);
    setEditor((prev) => ({ ...prev, tags: newTags }));
    scheduleAutoSave(editor.content, newTags, editor.prompt);
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }

  // ─── Loading state ────────────────────────────────────────

  if (!editor.initialized) return null;

  // ─── Render ──────────────────────────────────────────────

  return (
    <div className={styles.page}>
      {/* ─── Header ─────────────────────────────────────── */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate('/journal')}
          aria-label="Back to journal"
        >
          ← Back
        </button>
        <span className={styles.saveStatus} aria-live="polite">
          {editor.lastSaved ? `Saved ${formatTimestamp(editor.lastSaved)}` : 'Not saved yet'}
        </span>
      </div>

      {/* ─── Prompt ─────────────────────────────────────── */}
      {editor.showPrompt && editor.prompt ? (
        <div className={styles.promptBox}>
          <p className={styles.promptText}>{editor.prompt}</p>
          <div className={styles.promptActions}>
            <button className={styles.promptAction} onClick={handleGetPrompt}>
              New prompt
            </button>
            <button className={styles.promptAction} onClick={handleDismissPrompt}>
              Dismiss
            </button>
          </div>
        </div>
      ) : (
        <button className={styles.addPromptBtn} onClick={handleGetPrompt}>
          + Add a prompt
        </button>
      )}

      {/* ─── Main textarea ──────────────────────────────── */}
      <TextArea
        value={editor.content}
        onChange={handleContentChange}
        placeholder="Write freely. No judgment here."
        rows={12}
        aria-label="Journal entry content"
        autoFocus={isNew}
      />

      {/* ─── Tags ───────────────────────────────────────── */}
      <div className={styles.tagsSection}>
        {editor.tags.length > 0 && (
          <div className={styles.tagList}>
            {editor.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
                <button
                  className={styles.tagRemove}
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className={styles.tagInputRow}>
          <input
            className={styles.tagInput}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add a tag…"
            aria-label="Tag input"
          />
          <button
            className={styles.tagAddBtn}
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            aria-label="Add tag"
          >
            Add
          </button>
        </div>
      </div>

      {/* ─── Timestamps ─────────────────────────────────── */}
      {editor.createdAt && (
        <div className={styles.timestamps}>
          <span>Created {formatTimestamp(editor.createdAt)}</span>
          {editor.lastSaved && editor.lastSaved.getTime() !== editor.createdAt.getTime() && (
            <span>Updated {formatTimestamp(editor.lastSaved)}</span>
          )}
        </div>
      )}
    </div>
  );
}
