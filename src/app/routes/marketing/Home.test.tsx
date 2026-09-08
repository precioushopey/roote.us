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

  it('the dominant CTA is Start free hair analysis → the HairHealth.ai quiz', () => {
    renderHome();
    const ctas = screen.getAllByRole('link', { name: 'Start free hair analysis' });
    expect(ctas.length).toBeGreaterThan(1);
    for (const c of ctas) {
      expect(c).toHaveAttribute('href', 'https://roote.vercel.app/test/landbot/fullpage');
      expect(c).toHaveAttribute('target', '_blank');
    }
  });

  it('offers the three concern paths into the assessment', () => {
    renderHome();
    const heading = screen.getByRole('heading', { name: 'What would you like to understand?' });
    const section = heading.closest('section')!;
    const concernLinks = within(section)
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href') === 'https://roote.vercel.app/test/landbot/fullpage');
    expect(concernLinks).toHaveLength(3);
    for (const l of concernLinks) expect(l).toHaveAttribute('target', '_blank');
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
