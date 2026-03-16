import 'fake-indexeddb/auto';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Onboarding from './Onboarding';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: ({ children, className, ...rest }: React.ComponentProps<'div'>) => (
        <div className={className} {...rest}>
          {children}
        </div>
      ),
    },
  };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPage() {
  return render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockNavigate.mockClear();
});

describe('Onboarding page', () => {
  it('renders the first card on load', () => {
    renderPage();
    expect(screen.getByText('Something lives in your shadow.')).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
  });

  it('shows Next button on first card', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('shows Skip button on first card', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
  });

  it('advances to second card when Next is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(
      screen.getByText('A daily practice for what\u2019s beneath the surface.'),
    ).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
  });

  it('hides Skip button on second card', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
  });

  it('shows Begin button on last card', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('button', { name: /begin/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  it('shows the privacy card content on last card', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Your data never leaves this device.')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('navigates to home after Begin is clicked', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /begin/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('navigates to home after Skip is clicked', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /skip/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('renders dot indicators for each card', () => {
    renderPage();
    const dots = screen.getAllByRole('tab');
    expect(dots).toHaveLength(3);
  });

  it('marks the first dot as selected initially', () => {
    renderPage();
    const [dot0, dot1, dot2] = screen.getAllByRole('tab');
    expect(dot0).toHaveAttribute('aria-selected', 'true');
    expect(dot1).toHaveAttribute('aria-selected', 'false');
    expect(dot2).toHaveAttribute('aria-selected', 'false');
  });

  it('can navigate to a card by clicking its dot', () => {
    renderPage();
    const [, , dot2] = screen.getAllByRole('tab');
    fireEvent.click(dot2!);
    expect(screen.getByText('Your data never leaves this device.')).toBeInTheDocument();
  });
});
