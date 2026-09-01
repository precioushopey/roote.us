import { describe, it, expect } from 'vitest';

describe('test runner', () => {
  it('runs and has jsdom', () => {
    expect(typeof document).toBe('object');
    expect(document.createElement('div')).toBeTruthy();
  });

  it('has fake IndexedDB', () => {
    expect(typeof indexedDB).toBe('object');
  });
});
