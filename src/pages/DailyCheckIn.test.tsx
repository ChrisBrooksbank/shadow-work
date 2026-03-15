import 'fake-indexeddb/auto';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DailyCheckIn from './DailyCheckIn';
import { db } from '../db/index';
import { todayDateString } from '../db/hooks';

// Mock navigator.vibrate to avoid jsdom errors
Object.defineProperty(navigator, 'vibrate', { value: vi.fn(), writable: true });

function renderPage() {
  return render(
    <MemoryRouter>
      <DailyCheckIn />
    </MemoryRouter>,
  );
}

beforeEach(async () => {
  await Promise.all([db.dailyCheckIns.clear(), db.streaks.clear()]);
});

describe('DailyCheckIn flow', () => {
  it('shows "already checked in" message when check-in exists for today', async () => {
    await db.dailyCheckIns.add({
      id: 'existing',
      date: todayDateString(),
      presenceLevel: 3,
      emotion: 'calm',
      triggered: false,
      createdAt: new Date(),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/already checked in today/i)).toBeInTheDocument();
    });
  });

  it('renders step 1 presence question on first load', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/how present do you feel/i)).toBeInTheDocument();
    });
  });

  it('Continue button is disabled until presence is selected', async () => {
    renderPage();

    await waitFor(() => screen.getByText(/how present do you feel/i));

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it('selects a presence level and enables Continue', async () => {
    renderPage();

    await waitFor(() => screen.getByText(/how present do you feel/i));

    // Click presence level 3
    const presenceBtn = screen.getByRole('button', { name: /3/i });
    fireEvent.click(presenceBtn);

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).not.toBeDisabled();
  });

  it('advances to emotion step after presence selection', async () => {
    renderPage();

    await waitFor(() => screen.getByText(/how present do you feel/i));

    fireEvent.click(screen.getByRole('button', { name: /3/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/what emotion is closest/i)).toBeInTheDocument();
    });
  });

  it('can go back from emotion to presence', async () => {
    renderPage();

    await waitFor(() => screen.getByText(/how present do you feel/i));
    fireEvent.click(screen.getByRole('button', { name: /3/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/what emotion is closest/i));
    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    await waitFor(() => {
      expect(screen.getByText(/how present do you feel/i)).toBeInTheDocument();
    });
  });

  it('selects an emotion and advances to trigger step', async () => {
    renderPage();

    await waitFor(() => screen.getByText(/how present do you feel/i));
    fireEvent.click(screen.getByRole('button', { name: /3/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/what emotion is closest/i));
    fireEvent.click(screen.getByRole('button', { name: /calm/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/did anything trigger you today/i)).toBeInTheDocument();
    });
  });

  it('shows trigger note textarea when Yes is selected', async () => {
    renderPage();

    await waitFor(() => screen.getByText(/how present do you feel/i));
    fireEvent.click(screen.getByRole('button', { name: /3/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/what emotion is closest/i));
    fireEvent.click(screen.getByRole('button', { name: /calm/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/did anything trigger you today/i));
    fireEvent.click(screen.getByRole('button', { name: /yes/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/briefly describe/i)).toBeInTheDocument();
    });
  });

  it('does not show trigger note textarea when No is selected', async () => {
    renderPage();

    await waitFor(() => screen.getByText(/how present do you feel/i));
    fireEvent.click(screen.getByRole('button', { name: /3/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/what emotion is closest/i));
    fireEvent.click(screen.getByRole('button', { name: /calm/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/did anything trigger you today/i));
    fireEvent.click(screen.getByRole('button', { name: /no/i }));

    expect(screen.queryByPlaceholderText(/briefly describe/i)).not.toBeInTheDocument();
  });

  it('advances to freewrite step after trigger', async () => {
    renderPage();

    await waitFor(() => screen.getByText(/how present do you feel/i));
    fireEvent.click(screen.getByRole('button', { name: /3/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/what emotion is closest/i));
    fireEvent.click(screen.getByRole('button', { name: /calm/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/did anything trigger you today/i));
    fireEvent.click(screen.getByRole('button', { name: /no/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/one thing you noticed/i)).toBeInTheDocument();
    });
  });

  it('completes the full check-in flow and shows completion screen', async () => {
    renderPage();

    await waitFor(() => screen.getByText(/how present do you feel/i));
    fireEvent.click(screen.getByRole('button', { name: /3/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/what emotion is closest/i));
    fireEvent.click(screen.getByRole('button', { name: /calm/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/did anything trigger you today/i));
    fireEvent.click(screen.getByRole('button', { name: /no/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/one thing you noticed/i));
    fireEvent.click(screen.getByRole('button', { name: /complete check-in/i }));

    await waitFor(() => {
      expect(screen.getByText(/you showed up/i)).toBeInTheDocument();
    });
  });

  it('persists check-in to IndexedDB after completion', async () => {
    renderPage();

    await waitFor(() => screen.getByText(/how present do you feel/i));
    fireEvent.click(screen.getByRole('button', { name: /4/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/what emotion is closest/i));
    fireEvent.click(screen.getByRole('button', { name: /anxious/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/did anything trigger you today/i));
    fireEvent.click(screen.getByRole('button', { name: /no/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/one thing you noticed/i));
    fireEvent.click(screen.getByRole('button', { name: /complete check-in/i }));

    await waitFor(async () => {
      const entries = await db.dailyCheckIns.toArray();
      expect(entries).toHaveLength(1);
      expect(entries[0]?.emotion).toBe('anxious');
      expect(entries[0]?.presenceLevel).toBe(4);
      expect(entries[0]?.triggered).toBe(false);
    });
  });

  it('shows progress bar on step screens', async () => {
    renderPage();

    await waitFor(() => screen.getByText(/how present do you feel/i));
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('shows step label text on step screens', async () => {
    renderPage();

    await waitFor(() => screen.getByText(/step 1 of 4/i));
  });
});
