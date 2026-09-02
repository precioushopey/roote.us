import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollCondense } from './useScrollCondense';

afterEach(() => { Object.defineProperty(window, 'scrollY', { value: 0, configurable: true }); });

describe('useScrollCondense', () => {
  it('is false at the top and true past the threshold', () => {
    const { result } = renderHook(() => useScrollCondense(80));
    expect(result.current).toBe(false);
    act(() => { Object.defineProperty(window, 'scrollY', { value: 120, configurable: true }); window.dispatchEvent(new Event('scroll')); });
    expect(result.current).toBe(true);
  });
});
