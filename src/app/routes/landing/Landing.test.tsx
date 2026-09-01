import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { Landing } from './Landing';

function renderAt(path: string) {
  const router = createMemoryRouter(
    [{ path: '/', element: <Landing /> }],
    { initialEntries: [path] },
  );
  return render(
    <LocaleProvider>
      <RouterProvider router={router} />
    </LocaleProvider>
  );
}

describe('Landing', () => {
  it('shows the ROOTÉ logo and at least one diagnosis CTA, every CTA pointing at /diagnosis', () => {
    renderAt('/');
    expect(screen.getAllByRole('img', { name: 'ROOTÉ' }).length).toBeGreaterThan(0);
    const ctas = screen.getAllByRole('link', { name: /diagnosis|אבחון/i });
    expect(ctas.length).toBeGreaterThan(0);
    ctas.forEach((cta) => expect(cta).toHaveAttribute('href', '/diagnosis'));
  });

  it('renders the how-it-works, science, and plan sections the footer nav anchors to', () => {
    renderAt('/');
    expect(document.getElementById('how-it-works')).toBeInTheDocument();
    expect(document.getElementById('science')).toBeInTheDocument();
    expect(document.getElementById('plan')).toBeInTheDocument();
  });

  it('shows pending chips for unproven clinical stats rather than an invented figure', () => {
    renderAt('/');
    expect(screen.getAllByText(/\[PENDING:/).length).toBeGreaterThanOrEqual(3);
  });

  it('lists the real formula ingredients from roote.config', () => {
    renderAt('/');
    expect(screen.getByText('Minoxidil')).toBeInTheDocument();
    expect(screen.getByText('Finasteride')).toBeInTheDocument();
  });

  it('labels the before/after photos as an illustrative example, never a results claim', () => {
    localStorage.setItem('roote.locale', 'en');
    renderAt('/');
    expect(screen.getByText(/not ROOTÉ product results/)).toBeInTheDocument();
    expect(screen.getByAltText('Before')).toBeInTheDocument();
    expect(screen.getByAltText('After')).toBeInTheDocument();
  });
});
