import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Landing } from './Landing';

function renderAt(path: string) {
  const router = createMemoryRouter(
    [{ path: '/', element: <Landing /> }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

describe('Landing', () => {
  it('shows the ROOTÉ wordmark and a diagnosis CTA', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: /ROOTÉ/ })).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /diagnosis|אבחון/i });
    expect(cta).toHaveAttribute('href', '/diagnosis');
  });
});
