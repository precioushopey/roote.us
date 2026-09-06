import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, useParams } from 'react-router';
import { LocaleGate, BareOrLegacyPathRedirect } from './LocaleGate';
import { PREFERRED_REGION_KEY } from '@/i18n/localeRegion';

function RegionProbe() {
  const { localeRegion } = useParams();
  return <p>region:{localeRegion}</p>;
}

function renderApp(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/:localeRegion',
        element: <LocaleGate />,
        children: [
          { index: true, element: <RegionProbe /> },
          { path: 'products', element: <p>products page</p> },
        ],
      },
      { path: '*', element: <BareOrLegacyPathRedirect /> },
    ],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

describe('LocaleGate', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('renders children when the segment is a valid locale-region', () => {
    renderApp('/en-us');
    expect(screen.getByText('region:en-us')).toBeInTheDocument();
  });

  it('preserves the rest of the path when redirecting an invalid segment (bare legacy path)', () => {
    vi.stubGlobal('navigator', { language: 'en-US' });
    renderApp('/products');
    expect(screen.getByText('products page')).toBeInTheDocument();
  });
});

describe('BareOrLegacyPathRedirect', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('redirects the bare root to an Accept-Language-detected region', () => {
    vi.stubGlobal('navigator', { language: 'he-IL' });
    renderApp('/');
    expect(screen.getByText('region:he-il')).toBeInTheDocument();
  });

  it('respects a stored region preference over Accept-Language', () => {
    localStorage.setItem(PREFERRED_REGION_KEY, 'en-us');
    vi.stubGlobal('navigator', { language: 'he-IL' });
    renderApp('/');
    expect(screen.getByText('region:en-us')).toBeInTheDocument();
  });
});
