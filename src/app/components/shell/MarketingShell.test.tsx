import { it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

/** Mounts under `/en-us` (region-rooted, matching real app routing) so the
 *  homepage/other-route distinction that gates `<AnalysisPrompt>` is exercised
 *  with real region-prefixed pathnames instead of a bare `/`. */
function renderShellAtRegionPath(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/en-us',
        element: (
          <LocaleProvider localeRegion="en-us">
            <CartProvider>
              <MarketingShell />
            </CartProvider>
          </LocaleProvider>
        ),
        children: [
          { index: true, element: <p>home content</p> },
          { path: 'products', element: <p>products content</p> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );
  render(<RouterProvider router={router} />);
}

function triggerExitIntent() {
  fireEvent.mouseOut(document, { clientY: -1 });
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

it('shows the exit-intent analysis prompt at the real (no-trailing-slash) homepage URL', () => {
  // '/en-us' is exactly what `useLocalizedPath()` (`withLocale('/')`) produces for
  // localeRegion="en-us" post-fix — the string every home link (wordmark, footer, etc.)
  // now actually navigates to, not a hardcoded guess at the old trailing-slash form.
  renderShellAtRegionPath('/en-us');
  triggerExitIntent();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

it('does not show the analysis prompt on a non-homepage marketing route', () => {
  renderShellAtRegionPath('/en-us/products');
  triggerExitIntent();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
