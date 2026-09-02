import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { marketingRoutes } from './marketingRoutes';

function renderAt(path: string) {
  localStorage.setItem('roote.locale', 'en');
  const router = createMemoryRouter([marketingRoutes], { initialEntries: [path] });
  render(<LocaleProvider><RouterProvider router={router} /></LocaleProvider>);
}

describe('marketing routes', () => {
  it.each([
    ['/', 'Regrowth'],
    ['/how-it-works', 'How ROOTÉ works'],
    ['/science', 'The science behind your plan'],
    ['/products', 'Your regimen'],
    ['/about', 'About ROOTÉ'],
    ['/faq', 'Frequently asked questions'],
    ['/support', 'Support'],
    ['/terms', 'Terms of Service'],
    ['/privacy', 'Privacy Policy'],
  ])('renders %s', (path, heading) => {
    renderAt(path);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading);
  });

  it('exposes a skip link to #main', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /skip/i })).toHaveAttribute('href', '#main');
  });
});
