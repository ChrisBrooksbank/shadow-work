import 'fake-indexeddb/auto';
import { render, screen } from '@testing-library/react';
import { db } from './db/index';
import App from './App';

beforeAll(async () => {
  // Mark onboarding complete so tests land on Home
  await db.userSettings.put({
    key: 'settings',
    onboardingComplete: true,
    notificationsEnabled: false,
  });
});

test('renders home page by default', () => {
  render(<App />);
  expect(screen.getByText("Today's question")).toBeInTheDocument();
});
