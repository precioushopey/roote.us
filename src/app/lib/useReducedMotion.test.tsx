import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches, media: q, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
  }));
}
afterEach(() => vi.unstubAllGlobals());

describe('useReducedMotion', () => {
  it('returns true when the media query matches', () => {
    mockMatchMedia(true);
    expect(renderHook(() => useReducedMotion()).result.current).toBe(true);
  });
  it('returns false when it does not match', () => {
    mockMatchMedia(false);
    expect(renderHook(() => useReducedMotion()).result.current).toBe(false);
  });
});
