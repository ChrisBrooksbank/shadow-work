import { useNavigate } from 'react-router-dom';
import { useJournalEntries } from '../db/hooks';
import Button from '../components/ui/Button';
import styles from './Journal.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a Date as a readable group header, e.g. "Sunday, March 15" */
function formatDateHeader(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** YYYY-MM-DD key for grouping */
function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** HH:MM time string */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/** First N chars of content for preview */
function preview(content: string, maxLen = 100): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen).trimEnd() + '…';
}

interface DateGroup {
  key: string;
  label: string;
  entries: import('../db/schema').JournalEntry[];
}

function groupByDate(entries: import('../db/schema').JournalEntry[]): DateGroup[] {
  const map = new Map<string, DateGroup>();
  for (const entry of entries) {
    const k = dateKey(entry.createdAt);
    if (!map.has(k)) {
      map.set(k, { key: k, label: formatDateHeader(entry.createdAt), entries: [] });
    }
    map.get(k)!.entries.push(entry);
  }
  return Array.from(map.values());
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Journal() {
  const navigate = useNavigate();
  const entries = useJournalEntries();
  const groups = entries ? groupByDate(entries) : [];

  return (
    <main className={styles.page}>
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className={styles.header}>
        <h1 className={styles.title}>Journal</h1>
        <Button onClick={() => navigate('/journal/new')} aria-label="New journal entry">
          + New
        </Button>
      </div>

      {/* ─── Loading ─────────────────────────────────────────── */}
      {entries === undefined && <p className={styles.loadingText}>Loading…</p>}

      {/* ─── Empty state ─────────────────────────────────────── */}
      {entries !== undefined && entries.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon} aria-hidden="true">
            ▪
          </p>
          <p className={styles.emptyTitle}>No entries yet</p>
          <p className={styles.emptyBody}>Start writing. The shadow speaks through the page.</p>
          <Button onClick={() => navigate('/journal/new')}>Begin your first entry</Button>
        </div>
      )}

      {/* ─── Date-grouped entries ─────────────────────────────── */}
      {groups.length > 0 && (
        <div className={styles.groups}>
          {groups.map((group) => (
            <section key={group.key} className={styles.group}>
              <p className={styles.dateHeader}>{group.label}</p>
              <div className={styles.entryList}>
                {group.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={styles.entryCard}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/journal/${entry.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/journal/${entry.id}`)}
                  >
                    {entry.prompt && <p className={styles.entryPrompt}>{entry.prompt}</p>}
                    <p className={styles.entryPreview}>
                      {entry.content.trim() ? (
                        preview(entry.content)
                      ) : (
                        <span className={styles.entryEmpty}>Empty entry</span>
                      )}
                    </p>
                    <div className={styles.entryMeta}>
                      <span className={styles.entryTime}>{formatTime(entry.createdAt)}</span>
                      {entry.tags.length > 0 && (
                        <span className={styles.entryTags}>
                          {entry.tags.slice(0, 3).join(' · ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
