import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders progressbar role', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria-valuenow correctly', () => {
    render(<ProgressBar value={30} max={100} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '30');
  });

  it('sets aria-valuemax correctly', () => {
    render(<ProgressBar value={3} max={7} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '7');
  });

  it('renders aria-label when provided', () => {
    render(<ProgressBar value={50} label="Loading progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Loading progress');
  });

  it('clamps value to 0 when negative', () => {
    const { container } = render(<ProgressBar value={-10} />);
    const fill = container.querySelector('[style]');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  it('clamps value to 100% when over max', () => {
    const { container } = render(<ProgressBar value={200} max={100} />);
    const fill = container.querySelector('[style]');
    expect(fill).toHaveStyle({ width: '100%' });
  });

  it('computes percentage correctly', () => {
    const { container } = render(<ProgressBar value={1} max={4} />);
    const fill = container.querySelector('[style]');
    expect(fill).toHaveStyle({ width: '25%' });
  });
});
