import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CartProvider } from '@/store/cart';
import { marketingRoutes } from './marketingRoutes';

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/en-us',
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
    { initialEntries: [`/en-us${path}`] },
  );
  render(<RouterProvider router={router} />);
}

describe('marketing routes', () => {
  it.each([
    ['/', 'Your hair is individual'],
    ['/how-it-works', 'How ROOTÉ works'],
    ['/science', 'Know what is in your program'],
    ['/products', 'Refills and add-ons'],
    ['/solutions', 'Understand your hair, then choose'],
    ['/solutions/thinning', 'Understand your hair density before choosing a treatment'],
    ['/solutions/gray-hair', 'Understand what is changing at the root'],
    ['/results', 'Progress should be documented, not promised'],
    ['/system', 'Analyze. Treat. Track.'],
    ['/products/density-6', 'ROOTÉ Density 6'],
    ['/about', 'About ROOTÉ'],
    ['/faq', 'Frequently asked questions'],
    ['/support', 'Support'],
    ['/terms', 'Terms of Service'],
    ['/terms-of-sale', 'Terms of Sale'],
    ['/privacy', 'Privacy Policy'],
  ])('renders %s', (path, heading) => {
    renderAt(path);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading);
  });

  it('shows the legal-entity details on the Terms of Sale page', () => {
    renderAt('/terms-of-sale');
    expect(screen.getByText('91 ENTERPRISE LLC')).toBeInTheDocument();
    expect(screen.getByText('46-4692938')).toBeInTheDocument();
    expect(screen.getByText('201403110138')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'support@roote.us' })).toHaveAttribute(
      'href',
      'mailto:support@roote.us',
    );
  });

  it('exposes a skip link to #main', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /skip/i })).toHaveAttribute('href', '#main');
  });
});

describe('bag routes', () => {
  beforeEach(() => localStorage.removeItem('roote.cart'));

  it('renders the empty bag at /bag', () => {
    renderAt('/bag');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your bag');
    expect(screen.getByText('Your bag is empty.')).toBeInTheDocument();
  });

  it('redirects /bag/checkout to /bag when the cart is empty', () => {
    renderAt('/bag/checkout');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your bag');
    expect(screen.getByText('Your bag is empty.')).toBeInTheDocument();
  });

  it('redirects /bag/success to /products when there is no completed order', () => {
    renderAt('/bag/success');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Refills and add-ons');
  });
});
