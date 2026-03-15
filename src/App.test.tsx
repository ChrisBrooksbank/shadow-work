import 'fake-indexeddb/auto';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page by default', () => {
  render(<App />);
  expect(screen.getByText("Today's question")).toBeInTheDocument();
});
