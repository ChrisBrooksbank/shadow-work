import { useRef, useState } from 'react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { db } from '../db';
import { useNotifications } from '../hooks/useNotifications';
import styles from './Settings.module.css';

const APP_VERSION = '0.1.0';

// ─── Export ───────────────────────────────────────────────────────────────────

async function exportData(): Promise<void> {
  const [
    journalEntries,
    exerciseCompletions,
    dailyCheckIns,
    triggerLogs,
    dreamEntries,
    userSettings,
    streaks,
  ] = await Promise.all([
    db.journalEntries.toArray(),
    db.exerciseCompletions.toArray(),
    db.dailyCheckIns.toArray(),
    db.triggerLogs.toArray(),
    db.dreamEntries.toArray(),
    db.userSettings.toArray(),
    db.streaks.toArray(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    version: APP_VERSION,
    journalEntries,
    exerciseCompletions,
    dailyCheckIns,
    triggerLogs,
    dreamEntries,
    userSettings,
    streaks,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shadow-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Import ───────────────────────────────────────────────────────────────────

type ImportMode = 'merge' | 'replace';

async function importData(json: string, mode: ImportMode): Promise<void> {
  const data = JSON.parse(json) as Record<string, unknown[]>;

  if (mode === 'replace') {
    await db.transaction(
      'rw',
      [
        db.journalEntries,
        db.exerciseCompletions,
        db.dailyCheckIns,
        db.triggerLogs,
        db.dreamEntries,
        db.userSettings,
        db.streaks,
      ],
      async () => {
        await Promise.all([
          db.journalEntries.clear(),
          db.exerciseCompletions.clear(),
          db.dailyCheckIns.clear(),
          db.triggerLogs.clear(),
          db.dreamEntries.clear(),
          db.userSettings.clear(),
          db.streaks.clear(),
        ]);
        await bulkPut(data);
      },
    );
  } else {
    await db.transaction(
      'rw',
      [
        db.journalEntries,
        db.exerciseCompletions,
        db.dailyCheckIns,
        db.triggerLogs,
        db.dreamEntries,
        db.userSettings,
        db.streaks,
      ],
      async () => {
        await bulkPut(data);
      },
    );
  }
}

async function bulkPut(data: Record<string, unknown[]>): Promise<void> {
  const tables = [
    { key: 'journalEntries', table: db.journalEntries },
    { key: 'exerciseCompletions', table: db.exerciseCompletions },
    { key: 'dailyCheckIns', table: db.dailyCheckIns },
    { key: 'triggerLogs', table: db.triggerLogs },
    { key: 'dreamEntries', table: db.dreamEntries },
    { key: 'userSettings', table: db.userSettings },
    { key: 'streaks', table: db.streaks },
  ] as const;

  await Promise.all(
    tables.map(({ key, table }) => {
      const rows = data[key];
      if (Array.isArray(rows) && rows.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (table as any).bulkPut(rows);
      }
      return Promise.resolve();
    }),
  );
}

// ─── Clear all ────────────────────────────────────────────────────────────────

async function clearAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.journalEntries,
      db.exerciseCompletions,
      db.dailyCheckIns,
      db.triggerLogs,
      db.dreamEntries,
      db.userSettings,
      db.streaks,
    ],
    async () => {
      await Promise.all([
        db.journalEntries.clear(),
        db.exerciseCompletions.clear(),
        db.dailyCheckIns.clear(),
        db.triggerLogs.clear(),
        db.dreamEntries.clear(),
        db.userSettings.clear(),
        db.streaks.clear(),
      ]);
    },
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [pendingImportJson, setPendingImportJson] = useState<string | null>(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { permission, enabled, reminderTime, requestPermission, setEnabled, setReminderTime } =
    useNotifications();

  function showStatus(type: 'success' | 'error', message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 4000);
  }

  async function handleExport() {
    try {
      await exportData();
      showStatus('success', 'Data exported successfully.');
    } catch {
      showStatus('error', 'Export failed. Please try again.');
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      try {
        JSON.parse(json);
        setPendingImportJson(json);
        setImportModalOpen(true);
      } catch {
        showStatus('error', 'Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  async function handleImportConfirm() {
    if (!pendingImportJson) return;
    setImportModalOpen(false);
    try {
      await importData(pendingImportJson, importMode);
      setPendingImportJson(null);
      showStatus('success', `Data imported (${importMode} mode).`);
    } catch {
      showStatus('error', 'Import failed. The file may be corrupt.');
    }
  }

  async function handleClearConfirm() {
    setClearModalOpen(false);
    try {
      await clearAllData();
      showStatus('success', 'All data cleared.');
    } catch {
      showStatus('error', 'Clear failed. Please try again.');
    }
  }

  async function handleNotificationToggle(checked: boolean) {
    if (!checked) {
      setEnabled(false);
      return;
    }
    if (permission === 'default') {
      await requestPermission();
      // After requesting, hook updates permission state; setEnabled only if now granted
      if (Notification.permission === 'granted') {
        setEnabled(true);
      }
    } else if (permission === 'granted') {
      setEnabled(true);
    }
    // if denied, do nothing — the UI shows a blocked message
  }

  return (
    <main className={styles.page}>
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your data and preferences</p>
      </div>

      {/* ─── Status banner ──────────────────────────────────────── */}
      {status && (
        <p
          className={status.type === 'success' ? styles.statusSuccess : styles.statusError}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </p>
      )}

      {/* ─── Data section ───────────────────────────────────────── */}
      <section aria-labelledby="data-heading">
        <p className={styles.sectionLabel} id="data-heading">
          Data
        </p>
        <div className={styles.actionList}>
          <div className={styles.actionRow}>
            <div className={styles.actionMeta}>
              <span className={styles.actionTitle}>Export data</span>
              <span className={styles.actionDesc}>
                Download all your entries as a JSON file you can keep or import later.
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              Export
            </Button>
          </div>

          <div className={styles.actionRow}>
            <div className={styles.actionMeta}>
              <span className={styles.actionTitle}>Import data</span>
              <span className={styles.actionDesc}>
                Restore from a previously exported JSON file. Choose merge or replace.
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Import data from file"
            >
              Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              className={styles.hiddenInput}
              aria-hidden="true"
            />
          </div>

          <div className={styles.actionRow}>
            <div className={styles.actionMeta}>
              <span className={styles.actionTitle}>Clear all data</span>
              <span className={styles.actionDesc}>
                Permanently delete all entries, check-ins, and settings from this device.
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setClearModalOpen(true)}>
              Clear
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Notifications ──────────────────────────────────────── */}
      <section aria-labelledby="notifications-heading">
        <p className={styles.sectionLabel} id="notifications-heading">
          Notifications
        </p>
        <div className={styles.actionList}>
          <div className={styles.actionRow}>
            <div className={styles.actionMeta}>
              <span className={styles.actionTitle}>Daily reminder</span>
              <span className={styles.actionDesc}>
                Receive a daily prompt to engage in shadow work practice.
              </span>
            </div>
            {permission === 'denied' ? (
              <span className={styles.blockedBadge}>Blocked</span>
            ) : (
              <label className={styles.toggleLabel} aria-label="Enable daily reminder">
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={enabled}
                  onChange={(e) => void handleNotificationToggle(e.target.checked)}
                />
                <span className={styles.toggleTrack} aria-hidden="true">
                  <span className={styles.toggleThumb} />
                </span>
              </label>
            )}
          </div>

          {permission === 'denied' && (
            <div className={styles.actionRow}>
              <p className={styles.deniedNote}>
                Notifications are blocked in your browser settings. Enable them there to use this
                feature.
              </p>
            </div>
          )}

          {permission === 'granted' && enabled && (
            <div className={styles.actionRow}>
              <div className={styles.actionMeta}>
                <span className={styles.actionTitle}>Reminder time</span>
                <span className={styles.actionDesc}>When to receive your daily prompt.</span>
              </div>
              <input
                type="time"
                className={styles.timeInput}
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                aria-label="Reminder time"
              />
            </div>
          )}
        </div>
      </section>

      {/* ─── Crisis resources ────────────────────────────────────── */}
      <section aria-labelledby="crisis-heading">
        <p className={styles.sectionLabel} id="crisis-heading">
          Crisis resources
        </p>
        <div className={styles.crisisCard}>
          <p className={styles.crisisWarning}>
            Shadow work can surface difficult emotions. If you are in crisis, please reach out.
          </p>
          <ul className={styles.crisisList}>
            <li>
              <span className={styles.crisisName}>988 Suicide &amp; Crisis Lifeline</span>
              <span className={styles.crisisContact}>Call or text 988 (US)</span>
            </li>
            <li>
              <span className={styles.crisisName}>Crisis Text Line</span>
              <span className={styles.crisisContact}>Text HOME to 741741</span>
            </li>
            <li>
              <span className={styles.crisisName}>
                International Association for Suicide Prevention
              </span>
              <span className={styles.crisisContact}>
                https://www.iasp.info/resources/Crisis_Centres/
              </span>
            </li>
          </ul>
          <p className={styles.disclaimer}>
            This app is not a substitute for professional mental health support. If you are
            struggling, please speak to a licensed therapist or counselor.
          </p>
        </div>
      </section>

      {/* ─── About ──────────────────────────────────────────────── */}
      <section aria-labelledby="about-heading">
        <p className={styles.sectionLabel} id="about-heading">
          About
        </p>
        <div className={styles.aboutCard}>
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>Version</span>
            <span className={styles.aboutValue}>{APP_VERSION}</span>
          </div>
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>Storage</span>
            <span className={styles.aboutValue}>Local device only</span>
          </div>
        </div>
      </section>

      {/* ─── Import confirmation modal ───────────────────────────── */}
      <Modal
        open={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setPendingImportJson(null);
        }}
        title="Import data"
      >
        <div className={styles.modalBody}>
          <p className={styles.modalText}>Choose how to handle existing data:</p>
          <div className={styles.radioGroup} role="radiogroup" aria-label="Import mode">
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="importMode"
                value="merge"
                checked={importMode === 'merge'}
                onChange={() => setImportMode('merge')}
                className={styles.radioInput}
              />
              <span>
                <strong>Merge</strong> — keep existing data and add new records
              </span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className={styles.radioInput}
              />
              <span>
                <strong>Replace</strong> — delete everything first, then import
              </span>
            </label>
          </div>
          <div className={styles.modalActions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setImportModalOpen(false);
                setPendingImportJson(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleImportConfirm}>
              Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Clear all confirmation modal ────────────────────────── */}
      <Modal open={clearModalOpen} onClose={() => setClearModalOpen(false)} title="Clear all data">
        <div className={styles.modalBody}>
          <p className={styles.modalText}>
            This will permanently delete all your journal entries, check-ins, exercises, and
            settings. This cannot be undone.
          </p>
          <div className={styles.modalActions}>
            <Button variant="ghost" size="sm" onClick={() => setClearModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleClearConfirm}>
              Delete everything
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
