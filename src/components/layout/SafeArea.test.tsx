import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SafeArea from './SafeArea';

describe('SafeArea', () => {
  it('renders children', () => {
    render(<SafeArea>Safe content</SafeArea>);
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('renders a wrapper div', () => {
    const { container } = render(<SafeArea>Content</SafeArea>);
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });

  it('applies custom className', () => {
    const { container } = render(<SafeArea className="extra">Content</SafeArea>);
    expect(container.firstChild).toHaveClass('extra');
  });
});
