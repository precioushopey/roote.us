import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CartProvider } from '@/store/cart';
import { marketingRoutes } from './marketingRoutes';

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

describe('Magazine (/magazine)', () => {
  it('renders every section heading', () => {
    renderAt('/magazine');
    expect(screen.getByRole('heading', { level: 1, name: "Understand what's actually in your routine." })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Why hair loss happens' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How results typically develop' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The ingredient library' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Why treatments come in different forms' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Every ROOTÉ treatment' })).toBeInTheDocument();
  });

  it('renders a supplier-proprietary ingredient as [PENDING], not plain copy', () => {
    renderAt('/magazine');
    expect(screen.getByText('[PENDING: Procapil® — claim]')).toBeInTheDocument();
  });

  it('renders a non-proprietary ingredient with real copy, not [PENDING]', () => {
    renderAt('/magazine');
    expect(screen.getByText(/Minoxidil is a long-studied topical ingredient/)).toBeInTheDocument();
    expect(screen.queryByText('[PENDING: Minoxidil — claim]')).not.toBeInTheDocument();
  });

  it('renders the results-timeline note as [PENDING]', () => {
    renderAt('/magazine');
    expect(screen.getByText('[PENDING: results timeline]')).toBeInTheDocument();
  });

  it('links every one of the 6 real products to its own /products/:slug page', () => {
    renderAt('/magazine');
    for (const [name, slug] of [
      ['ROOTÉ Level 6', 'density-6'],
      ['ROOTÉ Level 10', 'density-10'],
      ['ROOTÉ Level 15', 'density-15'],
      ['ROOTÉ Gray Serum', 'gray-serum'],
      ['ROOTÉ Gray Support', 'gray-support'],
      ['ROOTÉ Regrowth Shampoo', 'regrowth-shampoo'],
    ] as const) {
      const link = screen.getByText(name).closest('a');
      expect(link, name).toHaveAttribute('href', `/en-us/products/${slug}`);
    }
  });
});
