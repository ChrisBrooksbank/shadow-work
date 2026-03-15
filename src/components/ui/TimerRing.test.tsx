import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TimerRing from './TimerRing';

describe('TimerRing', () => {
  it('renders a progressbar role', () => {
    render(<TimerRing progress={0.5} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria-valuenow as percentage of progress', () => {
    render(<TimerRing progress={0.75} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('clamps aria-valuenow to 0 for negative progress', () => {
    render(<TimerRing progress={-0.5} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps aria-valuenow to 100 for progress > 1', () => {
    render(<TimerRing progress={2} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('uses custom label', () => {
    render(<TimerRing progress={0.3} label="Meditation timer" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Meditation timer');
  });

  it('shows remaining seconds when elapsed and duration provided (< 60s)', () => {
    render(<TimerRing progress={0.5} elapsed={15} duration={30} />);
    expect(screen.getByText('15s')).toBeInTheDocument();
  });

  it('shows mm:ss format when remaining time >= 60 seconds', () => {
    render(<TimerRing progress={0} elapsed={0} duration={90} />);
    expect(screen.getByText('1:30')).toBeInTheDocument();
  });

  it('shows 0s when elapsed exceeds duration', () => {
    render(<TimerRing progress={1} elapsed={60} duration={30} />);
    expect(screen.getByText('0s')).toBeInTheDocument();
  });

  it('does not render centre text when elapsed/duration not provided', () => {
    const { container } = render(<TimerRing progress={0.5} />);
    expect(container.querySelector('text')).toBeNull();
  });

  it('renders two circles (track + arc)', () => {
    const { container } = render(<TimerRing progress={0.5} />);
    expect(container.querySelectorAll('circle')).toHaveLength(2);
  });

  it('uses custom size', () => {
    const { container } = render(<TimerRing progress={0.5} size={200} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
  });
});
