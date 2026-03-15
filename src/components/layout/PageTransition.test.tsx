import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PageTransition from './PageTransition';

function renderWithRouter(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="*"
          element={
            <PageTransition>
              <div>page content</div>
            </PageTransition>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PageTransition', () => {
  it('renders children', () => {
    renderWithRouter('/');
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('renders children on a different route', () => {
    renderWithRouter('/journal');
    expect(screen.getByText('page content')).toBeInTheDocument();
  });
});
