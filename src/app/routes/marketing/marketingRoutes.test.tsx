import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { marketingRoutes } from './marketingRoutes';

function renderAt(path: string) {
  const router = createMemoryRouter([marketingRoutes], { initialEntries: [path] });
  render(<LocaleProvider><RouterProvider router={router} /></LocaleProvider>);
}

describe('marketing routes', () => {
  it.each([
    ['/', 'Home'], ['/how-it-works', 'How It Works'], ['/science', 'Science'],
    ['/products', 'Products'], ['/results', 'Results'], ['/about', 'About'],
    ['/faq', 'FAQ'], ['/support', 'Support'], ['/blog', 'Blog'],
    ['/blog/understanding-the-norwood-scale', 'Post'], ['/terms', 'Terms'], ['/privacy', 'Privacy'],
  ])('renders %s', (path, heading) => {
    renderAt(path);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading);
  });

  it('exposes a skip link to #main', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /skip/i })).toHaveAttribute('href', '#main');
  });
});
