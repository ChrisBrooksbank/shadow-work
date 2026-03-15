import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TextArea from './TextArea';

describe('TextArea', () => {
  it('renders textarea', () => {
    render(<TextArea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<TextArea label="Reflection" />);
    expect(screen.getByLabelText('Reflection')).toBeInTheDocument();
  });

  it('renders hint text when provided', () => {
    render(<TextArea hint="Write freely without judgment" />);
    expect(screen.getByText('Write freely without judgment')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<TextArea onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('renders placeholder text', () => {
    render(<TextArea placeholder="Start writing..." />);
    expect(screen.getByPlaceholderText('Start writing...')).toBeInTheDocument();
  });

  it('renders as disabled when disabled prop is set', () => {
    render(<TextArea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
