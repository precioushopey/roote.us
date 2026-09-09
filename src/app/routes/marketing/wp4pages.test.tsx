import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CartProvider } from '@/store/cart';
import { marketingRoutes } from './marketingRoutes';
import { containsForbiddenClaim } from '@/content/claims';

function renderAt(path: string, locale: 'en' | 'he' = 'en') {
  const localeRegion = locale === 'he' ? 'he-il' : 'en-us';
  const router = createMemoryRouter(
    [
      {
        path: '/:localeRegion',
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
    { initialEntries: [`/${localeRegion}${path}`] },
  );
  render(<RouterProvider router={router} />);
}

describe('WP4 marketing pages', () => {
  it('Products: the six SKUs, competitor-matched prices, Density gated behind review', () => {
    renderAt('/products');
    for (const name of [
      'ROOTÉ Level 6',
      'ROOTÉ Level 10',
      'ROOTÉ Level 15',
      'ROOTÉ Gray Support',
      'ROOTÉ Regrowth Shampoo',
      'ROOTÉ Gray Serum',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    const catalogSection = screen.getByRole('heading', { name: 'Every product, in one place.' }).closest('section')!;
    expect(within(catalogSection).queryAllByText('[PENDING: price]').length).toBe(0);
    for (const price of ['$47.00', '$50.00', '$53.00', '$38.00', '$40.00', '$52.00']) {
      expect(within(catalogSection).getByText(price)).toBeInTheDocument();
    }
    // cosmetic SKUs get an add-to-bag; Density SKUs get no note/button (review-gated)
    expect(within(catalogSection).getAllByRole('button', { name: /add to bag|add/i }).length).toBe(3);
  });

  it('Product detail: shows the product\'s real client-supplied price, review badge on Density', () => {
    renderAt('/products/density-10');
    const heading = screen.getByRole('heading', { level: 1, name: 'ROOTÉ Level 10' });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/requires treatment review/i)).toBeInTheDocument();
    // content/products.ts has a real, client-supplied price for every SKU — the
    // hero should show it directly, not a [PENDING] chip.
    const hero = heading.closest('section')!;
    expect(within(hero).getByText('$50.00')).toBeInTheDocument();
    expect(within(hero).queryByText('[PENDING: price]')).not.toBeInTheDocument();
  });

  it('Products: bundles show a struck-through compare-at price and a Save badge', () => {
    renderAt('/products');
    const bundlesSection = screen.getByRole('heading', { name: 'Stock up once, skip the reorder.' }).closest('section')!;
    // Complete System: $183 sum of components, discounted to $165 (~10% off, matches heyhair.co's pattern).
    expect(within(bundlesSection).getAllByText('$183.00').length).toBeGreaterThan(0);
    expect(within(bundlesSection).getAllByText('$165.00').length).toBeGreaterThan(0);
    expect(within(bundlesSection).getAllByText('Save $18.00').length).toBeGreaterThan(0);
    // Gray Support Bundle: competitor-matched $70 vs. its own $90 component sum (~22% off).
    expect(within(bundlesSection).getAllByText('$90.00').length).toBeGreaterThan(0);
    expect(within(bundlesSection).getAllByText('$70.00').length).toBeGreaterThan(0);
    expect(within(bundlesSection).getAllByText('Save $20.00').length).toBeGreaterThan(0);
  });

  it('Product detail: cosmetic SKU has no review badge', () => {
    renderAt('/products/regrowth-shampoo');
    expect(screen.queryByText(/requires treatment review/i)).not.toBeInTheDocument();
  });

  it('Solution page: routes into the HairHealth.ai assessment quiz', () => {
    renderAt('/solutions/thinning');
    const ctas = screen.getAllByRole('link', { name: 'Start free hair analysis' });
    expect(ctas.some((c) => c.getAttribute('href') === 'https://roote.vercel.app/test/landbot/fullpage')).toBe(true);
  });

  it('no forbidden marketing claim renders on the rebuilt pages', () => {
    for (const path of ['/science', '/solutions/gray-hair', '/products/gray-serum', '/system']) {
      const router = createMemoryRouter(
        [
          {
            element: (
              <LocaleProvider localeRegion="en-us">
                <CartProvider>
                  <Outlet />
                </CartProvider>
              </LocaleProvider>
            ),
            children: [marketingRoutes],
          },
        ],
        { initialEntries: [path] },
      );
      const { container } = render(<RouterProvider router={router} />);
      expect(containsForbiddenClaim(container.textContent ?? ''), path).toBe(false);
    }
  });

  it('renders a rebuilt page in Hebrew', () => {
    renderAt('/system', 'he');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('לנתח. לטפל. לעקוב.');
  });

  it('Science: "Read more" on an ingredient card navigates to the Magazine', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderAt('/science');
    const readMoreButtons = screen.getAllByRole('button', { name: 'Read more' });
    await user.click(readMoreButtons[0]);
    expect(await screen.findByRole('heading', { level: 1, name: "Understand what's actually in your routine." })).toBeInTheDocument();
  });
});
