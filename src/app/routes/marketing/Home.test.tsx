import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CartProvider } from '@/store/cart';
import { marketingRoutes } from './marketingRoutes';

function renderHome(locale: 'en' | 'he' = 'en') {
  const localeRegion = locale === 'he' ? 'he-il' : 'en-us';
  const router = createMemoryRouter(
    [
      {
        element: (
          <LocaleProvider localeRegion={localeRegion}>
            <CartProvider>
              <Outlet />
            </CartProvider>
          </LocaleProvider>
        ),
        children: [marketingRoutes],
      },
    ],
    { initialEntries: ['/'] },
  );
  render(<RouterProvider router={router} />);
}

describe('Home (redesigned)', () => {
  it('leads with the personalized-system positioning, not a product grid', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your hair is individual');
    expect(screen.getByText('Personalized Hair Growth System')).toBeInTheDocument();
  });

  it('the dominant CTA is Start free hair analysis → /analysis', () => {
    renderHome();
    const ctas = screen.getAllByRole('link', { name: 'Start free hair analysis' });
    expect(ctas.length).toBeGreaterThan(1);
    for (const c of ctas) expect(c).toHaveAttribute('href', '/en-us/analysis');
  });

  it('offers the three concern paths into the assessment', () => {
    renderHome();
    const heading = screen.getByRole('heading', { name: 'What would you like to understand?' });
    const section = heading.closest('section')!;
    const concernLinks = within(section)
      .getAllByRole('link')
      .map((l) => l.getAttribute('href'))
      .filter((h): h is string => !!h && h.startsWith('/en-us/analysis?concern='));
    expect(concernLinks.sort()).toEqual([
      '/en-us/analysis?concern=both',
      '/en-us/analysis?concern=gray',
      '/en-us/analysis?concern=thinning',
    ]);
  });

  it('shows the 5-step Analyze → Track sequence', () => {
    renderHome();
    for (const step of ['Analyze', 'Understand', 'Personalize', 'Treat', 'Track']) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
  });

  it('has a single h1', () => {
    renderHome();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('renders in Hebrew too', () => {
    renderHome('he');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('השיער שלך ייחודי');
  });
});
