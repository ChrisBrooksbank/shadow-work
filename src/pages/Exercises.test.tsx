import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Exercises from './Exercises';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPage() {
  return render(
    <MemoryRouter>
      <Exercises />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockNavigate.mockClear();
});

describe('Exercises page', () => {
  it('renders the page title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Exercises' })).toBeInTheDocument();
  });

  it('renders all 7 exercises', () => {
    renderPage();
    expect(screen.getByText('Shadow Journaling')).toBeInTheDocument();
    expect(screen.getByText('The 3-2-1 Process')).toBeInTheDocument();
    expect(screen.getByText('Inner Child Work')).toBeInTheDocument();
    expect(screen.getByText('Active Imagination')).toBeInTheDocument();
    expect(screen.getByText('Mirror Work')).toBeInTheDocument();
    expect(screen.getByText('Trigger Tracking')).toBeInTheDocument();
    expect(screen.getByText('Dream Work')).toBeInTheDocument();
  });

  it('renders depth badges', () => {
    renderPage();
    // surface exercises
    const surfaceBadges = screen.getAllByText('Surface');
    expect(surfaceBadges.length).toBeGreaterThan(0);
    // deep exercises
    const deepBadges = screen.getAllByText('Deep');
    expect(deepBadges.length).toBeGreaterThan(0);
    // abyss exercises (Active Imagination is abyss)
    expect(screen.getByText('Abyss')).toBeInTheDocument();
  });

  it('renders estimated durations', () => {
    renderPage();
    expect(screen.getAllByText('15 min').length).toBeGreaterThan(0);
    expect(screen.getAllByText('20 min').length).toBeGreaterThan(0);
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('renders stage labels', () => {
    renderPage();
    expect(screen.getAllByText('Recognition').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Encounter').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dialogue').length).toBeGreaterThan(0);
  });

  it('navigates to exercise session when card is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Start Shadow Journaling' }));
    expect(mockNavigate).toHaveBeenCalledWith('/exercises/shadow-journaling');
  });

  it('navigates to exercise session on Enter keydown', () => {
    renderPage();
    const card = screen.getByRole('button', { name: 'Start The 3-2-1 Process' });
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/exercises/three-two-one');
  });

  it('navigates to active imagination exercise', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Start Active Imagination' }));
    expect(mockNavigate).toHaveBeenCalledWith('/exercises/active-imagination');
  });
});
