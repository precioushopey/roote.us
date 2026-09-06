import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CartProvider } from '@/store/cart';
import { marketingRoutes } from './marketingRoutes';

function renderHome(locale: 'en' | 'he' = 'en') {
  localStorage.setItem('roote.locale', locale);
  const router = createMemoryRouter([marketingRoutes], { initialEntries: ['/'] });
  render(
    <LocaleProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </LocaleProvider>,
  );
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
    for (const c of ctas) expect(c).toHaveAttribute('href', '/analysis');
  });

  it('offers the three concern paths into the assessment', () => {
    renderHome();
    const heading = screen.getByRole('heading', { name: 'What would you like to understand?' });
    const section = heading.closest('section')!;
    const concernLinks = within(section)
      .getAllByRole('link')
      .map((l) => l.getAttribute('href'))
      .filter((h): h is string => !!h && h.startsWith('/analysis?concern='));
    expect(concernLinks.sort()).toEqual([
      '/analysis?concern=both',
      '/analysis?concern=gray',
      '/analysis?concern=thinning',
    ]);
  });

  it('shows the 5-step Analyze → Track sequence', () => {
    renderHome();
    for (const step of ['Analyze', 'Understand', 'Personalize', 'Treat', 'Track']) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
  });

  it('renders the sample scan card with [PENDING] values, never invented numbers', () => {
    renderHome();
    expect(screen.getByText('[PENDING: density]')).toBeInTheDocument();
    expect(screen.getByText('[PENDING: pattern]')).toBeInTheDocument();
    expect(screen.getByText('[PENDING: progression]')).toBeInTheDocument();
  });

  it('program durations show a [PENDING] price, never a fabricated one', () => {
    renderHome();
    expect(screen.getAllByText('[PENDING: program price]').length).toBe(3);
  });

  it('results section is an honest empty state', () => {
    renderHome();
    expect(screen.getAllByText('Verified ROOTÉ results coming soon.').length).toBeGreaterThan(0);
  });

  it('renders the 12-question FAQ as an accordion', () => {
    renderHome();
    const faqRegion = screen.getByRole('heading', { name: 'Questions, answered plainly.' }).closest('section')!;
    const buttons = within(faqRegion).getAllByRole('button');
    expect(buttons.length).toBe(12);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
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
