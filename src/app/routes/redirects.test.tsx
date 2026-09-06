import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import App from '@/app/App';

/**
 * Old IA → new IA (brief §0.4: preserve or redirect, don't break). The site is
 * `noindex`, but internal/bookmark links to `/diagnosis`, `/start`, `/app` must
 * still land somewhere sensible.
 */
function goTo(path: string) {
  act(() => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  render(<App />);
}

describe('legacy path redirects', () => {
  afterEach(() => {
    act(() => {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  });

  it('/diagnosis → /en-us/analysis (intro step renders)', () => {
    goTo('/diagnosis');
    expect(window.location.pathname).toBe('/en-us/analysis');
  });

  it('/diagnosis/gender → /en-us/analysis/gender (segments preserved)', () => {
    goTo('/diagnosis/gender');
    expect(window.location.pathname).toBe('/en-us/analysis/gender');
  });

  it('/start → /en-us/program', () => {
    goTo('/start');
    expect(window.location.pathname).toBe('/en-us/program');
  });

  it('/app → /en-us/account', () => {
    goTo('/app');
    expect(window.location.pathname).toBe('/en-us/account');
  });

  it('/app/progress → /en-us/account/progress', () => {
    goTo('/app/progress');
    expect(window.location.pathname).toBe('/en-us/account/progress');
  });

  it('unknown path → home', () => {
    goTo('/this-does-not-exist');
    expect(window.location.pathname).toBe('/en-us');
  });
});
