import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import BottomNav from './BottomNav';

// Mock haptics to avoid Vibration API errors in test environment
vi.mock('../../lib/haptics', () => ({
  hapticTap: vi.fn(),
}));

function renderNav(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BottomNav />
    </MemoryRouter>,
  );
}

describe('BottomNav', () => {
  it('renders all four nav items', () => {
    renderNav();
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /exercises/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /journal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
  });

  it('marks Home as active on root path', () => {
    renderNav('/');
    expect(screen.getByRole('button', { name: /home/i })).toHaveAttribute('aria-current', 'page');
  });

  it('marks Exercises as active on /exercises path', () => {
    renderNav('/exercises');
    expect(screen.getByRole('button', { name: /exercises/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('marks Journal as active on /journal path', () => {
    renderNav('/journal');
    expect(screen.getByRole('button', { name: /journal/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('marks Profile as active on /progress path', () => {
    renderNav('/progress');
    expect(screen.getByRole('button', { name: /profile/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('hides when a textarea is focused', () => {
    const { container } = render(
      <MemoryRouter>
        <textarea data-testid="txt" />
        <BottomNav />
      </MemoryRouter>,
    );

    // Initially visible
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Focus textarea
    fireEvent.focusIn(container.querySelector('textarea')!);

    // Nav should be hidden
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

    // Blur textarea
    fireEvent.focusOut(container.querySelector('textarea')!);

    // Nav should be visible again
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
