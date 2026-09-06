import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { useDocumentMeta } from './useDocumentMeta';

function Probe() {
  useDocumentMeta();
  return null;
}

function renderAt(path: string, localeRegion: string) {
  const router = createMemoryRouter(
    [{ path: '/:region/*', element: <LocaleProvider localeRegion={localeRegion}><Probe /></LocaleProvider> }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

describe('useDocumentMeta', () => {
  it('resolves route metadata from the bare path, stripping the locale-region prefix', () => {
    renderAt('/en-us/products', 'en-us');
    expect(document.title).toBe('ROOTÉ — Products');
  });

  it('canonicalizes against the full (region-prefixed) pathname', () => {
    renderAt('/en-us/products', 'en-us');
    const canonical = document.head.querySelector('link[rel="canonical"]');
    expect(canonical).toHaveAttribute('href', 'https://roote.us/en-us/products');
  });

  it('emits one hreflang alternate per shipped-locale x country combination, plus x-default', () => {
    renderAt('/en-us/products', 'en-us');
    const alternates = document.head.querySelectorAll('link[rel="alternate"][hreflang]');
    // 2 shipped locales (en, he) x 8 countries + x-default (spec §7)
    expect(alternates.length).toBe(17);
    const heIl = Array.from(alternates).find((el) => el.getAttribute('hreflang') === 'he-il');
    expect(heIl).toHaveAttribute('href', 'https://roote.us/he-il/products');
    const xDefault = Array.from(alternates).find((el) => el.getAttribute('hreflang') === 'x-default');
    expect(xDefault).toHaveAttribute('href', 'https://roote.us/products');
  });

  it('replaces hreflang alternates on route change rather than accumulating them', () => {
    const { rerender } = renderAt('/en-us/products', 'en-us');
    renderAt('/en-us/about', 'en-us');
    const alternates = document.head.querySelectorAll('link[rel="alternate"][hreflang]');
    expect(alternates.length).toBe(17);
  });
});
