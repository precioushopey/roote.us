import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CartProvider } from '@/store/cart';
import { MarketingShell } from './MarketingShell';

function renderShell() {
  const router = createMemoryRouter(
    [
      {
        element: (
          <LocaleProvider localeRegion="en-us">
            <CartProvider>
              <MarketingShell />
            </CartProvider>
          </LocaleProvider>
        ),
        children: [{ path: '/', element: <p>child content</p> }],
      },
    ],
    { initialEntries: ['/'] },
  );
  render(<RouterProvider router={router} />);
}

it('has a localized, non-empty skip link that targets #main', () => {
  renderShell();
  expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
});

it('renders the nested route inside a focusable #main landmark', () => {
  renderShell();
  const main = document.getElementById('main');
  expect(main?.tagName).toBe('MAIN');
  expect(main).toHaveAttribute('tabindex', '-1');
  expect(screen.getByText('child content')).toBeInTheDocument();
});
