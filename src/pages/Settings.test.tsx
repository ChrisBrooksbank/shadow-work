import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Settings from './Settings';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../db', () => {
  const makeTable = () => ({
    toArray: vi.fn().mockResolvedValue([]),
    clear: vi.fn().mockResolvedValue(undefined),
    bulkPut: vi.fn().mockResolvedValue(undefined),
  });

  return {
    db: {
      journalEntries: makeTable(),
      exerciseCompletions: makeTable(),
      dailyCheckIns: makeTable(),
      triggerLogs: makeTable(),
      dreamEntries: makeTable(),
      userSettings: makeTable(),
      streaks: makeTable(),
      transaction: vi.fn((_mode: string, _tables: unknown[], fn: () => Promise<void>) => fn()),
    },
  };
});

// Mock URL.createObjectURL / revokeObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock');
URL.revokeObjectURL = vi.fn();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPage() {
  return render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(async () => {
  vi.clearAllMocks();
  const { db } = await import('../db');
  const tables = [
    db.journalEntries,
    db.exerciseCompletions,
    db.dailyCheckIns,
    db.triggerLogs,
    db.dreamEntries,
    db.userSettings,
    db.streaks,
  ];
  for (const t of tables) {
    vi.mocked(t.toArray).mockResolvedValue([]);
    vi.mocked(t.clear).mockResolvedValue(undefined);
  }
  vi.mocked(db.transaction).mockImplementation(
    // Dexie's transaction overloads are complex; cast for testing
    ((...args: Parameters<(typeof db)['transaction']>) => {
      const fn = args[args.length - 1] as () => Promise<void>;
      return fn() as ReturnType<(typeof db)['transaction']>;
    }) as typeof db.transaction,
  );
});

describe('Settings page', () => {
  it('renders the page title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
  });

  it('renders data section with export, import, and clear actions', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import data from file/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('renders crisis resources section', () => {
    renderPage();
    expect(screen.getByText(/988 Suicide/i)).toBeInTheDocument();
    expect(screen.getByText(/Crisis Text Line/i)).toBeInTheDocument();
  });

  it('renders app version', () => {
    renderPage();
    expect(screen.getByText('0.1.0')).toBeInTheDocument();
  });

  it('renders mental health disclaimer', () => {
    renderPage();
    expect(screen.getByText(/not a substitute for professional/i)).toBeInTheDocument();
  });

  describe('export', () => {
    it('calls toArray on all tables and triggers download on export click', async () => {
      const { db } = await import('../db');
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      await waitFor(() => {
        expect(db.journalEntries.toArray).toHaveBeenCalled();
        expect(db.exerciseCompletions.toArray).toHaveBeenCalled();
        expect(URL.createObjectURL).toHaveBeenCalled();
      });
    });

    it('shows success status after export', async () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/exported successfully/i);
      });
    });
  });

  describe('clear all data', () => {
    it('opens confirmation modal when Clear is clicked', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /clear/i }));
      const dialog = screen.getByRole('dialog', { name: /clear all data/i });
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByText(/permanently delete/i)).toBeInTheDocument();
    });

    it('closes modal when Cancel is clicked', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /clear/i }));
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByRole('dialog', { name: /clear all data/i })).not.toBeInTheDocument();
    });

    it('calls clear on all tables and shows success when confirmed', async () => {
      const { db } = await import('../db');
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /clear/i }));
      fireEvent.click(screen.getByRole('button', { name: /delete everything/i }));
      await waitFor(() => {
        expect(db.journalEntries.clear).toHaveBeenCalled();
        expect(db.exerciseCompletions.clear).toHaveBeenCalled();
        expect(screen.getByRole('status')).toHaveTextContent(/all data cleared/i);
      });
    });
  });

  describe('import data', () => {
    const validExport = JSON.stringify({
      exportedAt: '2026-01-01T00:00:00.000Z',
      version: '0.1.0',
      journalEntries: [
        { id: 'j1', content: 'test', tags: [], createdAt: new Date(), updatedAt: new Date() },
      ],
      exerciseCompletions: [],
      dailyCheckIns: [],
      triggerLogs: [],
      dreamEntries: [],
      userSettings: [],
      streaks: [],
    });

    function uploadFile(content: string) {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File([content], 'export.json', { type: 'application/json' });
      fireEvent.change(input, { target: { files: [file] } });
    }

    it('opens import modal when a valid JSON file is selected', async () => {
      renderPage();
      uploadFile(validExport);
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /import data/i })).toBeInTheDocument();
      });
    });

    it('shows error status for invalid JSON files', async () => {
      renderPage();
      uploadFile('not json {{{{');
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/invalid json/i);
      });
    });

    it('closes modal and imports when confirmed in merge mode', async () => {
      const { db } = await import('../db');
      renderPage();
      uploadFile(validExport);
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /import data/i })).toBeInTheDocument();
      });
      // merge is default; confirm
      fireEvent.click(screen.getByRole('button', { name: /^import$/i }));
      await waitFor(() => {
        expect(db.journalEntries.bulkPut).toHaveBeenCalled();
        expect(screen.getByRole('status')).toHaveTextContent(/imported.*merge/i);
      });
    });

    it('clears tables before import in replace mode', async () => {
      const { db } = await import('../db');
      renderPage();
      uploadFile(validExport);
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /import data/i })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('radio', { name: /replace/i }));
      fireEvent.click(screen.getByRole('button', { name: /^import$/i }));
      await waitFor(() => {
        expect(db.journalEntries.clear).toHaveBeenCalled();
        expect(screen.getByRole('status')).toHaveTextContent(/imported.*replace/i);
      });
    });

    it('cancels import modal without importing', async () => {
      const { db } = await import('../db');
      renderPage();
      uploadFile(validExport);
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /import data/i })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByRole('dialog', { name: /import data/i })).not.toBeInTheDocument();
      expect(db.journalEntries.bulkPut).not.toHaveBeenCalled();
    });
  });
});
