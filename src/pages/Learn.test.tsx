import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Learn from './Learn';

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
      <Learn />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockNavigate.mockClear();
});

describe('Learn page', () => {
  it('renders the page title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Learn' })).toBeInTheDocument();
  });

  it('renders all 8 concept cards', () => {
    renderPage();
    expect(screen.getByText('What Is the Shadow?')).toBeInTheDocument();
    expect(screen.getByText('How the Shadow Forms')).toBeInTheDocument();
    expect(screen.getByText('Projection: How to Spot It')).toBeInTheDocument();
    expect(screen.getByText('The Persona and the Shadow')).toBeInTheDocument();
    expect(screen.getByText('Integration, Not Elimination')).toBeInTheDocument();
    expect(screen.getByText('Shadow in Relationships')).toBeInTheDocument();
    expect(screen.getByText('The Golden Shadow')).toBeInTheDocument();
    expect(screen.getByText('Archetypes and the Collective Unconscious')).toBeInTheDocument();
  });

  it('renders concept summaries', () => {
    renderPage();
    expect(screen.getByText(/The shadow is the part of you that you hide/)).toBeInTheDocument();
  });

  it('renders reading time labels', () => {
    renderPage();
    const readingTimes = screen.getAllByText(/min read/);
    expect(readingTimes.length).toBe(8);
  });

  it('navigates to topic page when card is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Read What Is the Shadow?' }));
    expect(mockNavigate).toHaveBeenCalledWith('/learn/what-is-the-shadow');
  });

  it('navigates to topic page on Enter keydown', () => {
    renderPage();
    const card = screen.getByRole('button', { name: 'Read How the Shadow Forms' });
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/learn/how-the-shadow-forms');
  });

  it('navigates to projection topic', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Read Projection: How to Spot It' }));
    expect(mockNavigate).toHaveBeenCalledWith('/learn/projection');
  });

  it('navigates to archetypes topic', () => {
    renderPage();
    fireEvent.click(
      screen.getByRole('button', { name: 'Read Archetypes and the Collective Unconscious' }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/learn/archetypes');
  });
});
