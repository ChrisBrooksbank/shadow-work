import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page by default', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();
});
