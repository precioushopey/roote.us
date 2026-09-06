import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
}

describe('WP4 marketing pages', () => {
  it('Products: the six SKUs, prices as [PENDING], Density gated behind review', () => {
    renderAt('/products');
    for (const name of [
      'ROOTÉ Density 6',
      'ROOTÉ Density 10',
      'ROOTÉ Density 15',
      'ROOTÉ Gray Support',
      'ROOTÉ Regrowth Shampoo',
      'ROOTÉ Gray Serum',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(screen.getAllByText('[PENDING: price]').length).toBe(6);
    // cosmetic SKUs get an add-to-bag; Density SKUs get a review note instead
    expect(screen.getAllByRole('button', { name: /add to bag|add/i }).length).toBe(3);
  });

  it('Product detail: no invented price, review badge on Density', () => {
    renderAt('/products/density-10');
    expect(screen.getByRole('heading', { level: 1, name: 'ROOTÉ Density 10' })).toBeInTheDocument();
    expect(screen.getByText(/requires treatment review/i)).toBeInTheDocument();
    expect(screen.queryByText(/\$\d/)).not.toBeInTheDocument();
  });

  it('Product detail: cosmetic SKU has no review badge', () => {
    renderAt('/products/regrowth-shampoo');
    expect(screen.queryByText(/requires treatment review/i)).not.toBeInTheDocument();
  });

  it('Solution page: routes into the assessment with a concern hint', () => {
    renderAt('/solutions/thinning');
    const ctas = screen.getAllByRole('link', { name: 'Start free hair analysis' });
    expect(ctas.some((c) => c.getAttribute('href') === '/en-us/analysis?concern=thinning')).toBe(true);
  });

  it('Results page is an honest empty state (no fabricated proof)', () => {
    renderAt('/results');
    expect(screen.getAllByText('Verified ROOTÉ results coming soon.').length).toBe(3);
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
});
