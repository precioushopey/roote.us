import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { useHeroLogoReveal } from './useHeroLogoReveal';

function renderAt(path: string) {
  const result: { current: number } = { current: 1 };
  function Probe() {
    result.current = useHeroLogoReveal(300);
    return null;
  }
  const router = createMemoryRouter(
    [{ path: '/:region/*', element: <LocaleProvider localeRegion="en-us"><Probe /></LocaleProvider> }],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return result;
}

afterEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  vi.unstubAllGlobals();
});

describe('useHeroLogoReveal', () => {
  it('stays at 1 on a non-home route regardless of scroll', () => {
    const result = renderAt('/en-us/products');
    expect(result.current).toBe(1);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 50, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(1);
  });

  it('goes from 0 at the top to 1 past the scroll distance on the home route', () => {
    const result = renderAt('/en-us');
    expect(result.current).toBe(0);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 150, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(0.5);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 600, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(1);
  });

  it('pins at 1 under prefers-reduced-motion even on the home route', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    const result = renderAt('/en-us');
    expect(result.current).toBe(1);
  });
});
