import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LearnTopic from './LearnTopic';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPage(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/learn/${slug}`]}>
      <Routes>
        <Route path="/learn/:slug" element={<LearnTopic />} />
      </Routes>
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockNavigate.mockClear();
});

describe('LearnTopic page', () => {
  it('renders the topic title', () => {
    renderPage('what-is-the-shadow');
    expect(
      screen.getByRole('heading', { level: 1, name: 'What Is the Shadow?' }),
    ).toBeInTheDocument();
  });

  it('renders reading time', () => {
    renderPage('what-is-the-shadow');
    expect(screen.getByText(/4 min read/)).toBeInTheDocument();
  });

  it('renders the summary', () => {
    renderPage('what-is-the-shadow');
    expect(screen.getByText(/The shadow is the part of you that you hide/)).toBeInTheDocument();
  });

  it('renders all section headings', () => {
    renderPage('what-is-the-shadow');
    expect(screen.getByRole('heading', { name: 'The part you disown' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Why it matters' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What the shadow contains' })).toBeInTheDocument();
  });

  it('renders section body text', () => {
    renderPage('what-is-the-shadow');
    expect(screen.getByText(/You carry more than you show the world/)).toBeInTheDocument();
  });

  it('renders related exercise links', () => {
    renderPage('what-is-the-shadow');
    expect(screen.getByRole('link', { name: /Shadow Journaling/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mirror Work/ })).toBeInTheDocument();
  });

  it('exercise links point to correct exercise routes', () => {
    renderPage('what-is-the-shadow');
    const link = screen.getByRole('link', { name: /Shadow Journaling/ });
    expect(link).toHaveAttribute('href', '/exercises/shadow-journaling');
  });

  it('renders "Next topic" section', () => {
    renderPage('what-is-the-shadow');
    expect(screen.getByText('Next topic')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /How the Shadow Forms/ })).toBeInTheDocument();
  });

  it('navigates to next topic when button clicked', () => {
    renderPage('what-is-the-shadow');
    fireEvent.click(screen.getByRole('button', { name: /How the Shadow Forms/ }));
    expect(mockNavigate).toHaveBeenCalledWith('/learn/how-the-shadow-forms');
  });

  it('navigates back to learn on back button click', () => {
    renderPage('what-is-the-shadow');
    fireEvent.click(screen.getByRole('button', { name: /← Learn/ }));
    expect(mockNavigate).toHaveBeenCalledWith('/learn');
  });

  it('wraps last concept next topic to first concept', () => {
    renderPage('archetypes');
    // Last concept wraps to first
    expect(screen.getByText('Next topic')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /What Is the Shadow\?/ })).toBeInTheDocument();
  });

  it('renders not-found state for unknown slug', () => {
    renderPage('unknown-slug');
    expect(screen.getByText('Topic not found.')).toBeInTheDocument();
  });

  it('back button works on not-found state', () => {
    renderPage('unknown-slug');
    fireEvent.click(screen.getByRole('button', { name: /← Back to Learn/ }));
    expect(mockNavigate).toHaveBeenCalledWith('/learn');
  });

  it('renders bold text within section body', () => {
    // "Projection" topic has bold text in its sections
    renderPage('projection');
    expect(
      screen.getByText('You react with more emotion than the situation seems to warrant.'),
    ).toBeInTheDocument();
  });

  it('renders the projection topic correctly', () => {
    renderPage('projection');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Projection: How to Spot It' }),
    ).toBeInTheDocument();
  });
});
