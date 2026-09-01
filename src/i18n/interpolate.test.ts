import { describe, it, expect } from 'vitest';
import { interpolate } from './interpolate';

describe('interpolate', () => {
  it('substitutes {var} tokens', () => {
    expect(interpolate('Hello {name}', { name: 'World' })).toBe('Hello World');
  });

  it('substitutes numbers', () => {
    expect(interpolate('{count} items', { count: 3 })).toBe('3 items');
  });

  it('leaves unmatched tokens as-is', () => {
    expect(interpolate('Hello {name}', {})).toBe('Hello {name}');
  });

  it('returns the template unchanged with no vars', () => {
    expect(interpolate('Hello world')).toBe('Hello world');
  });
});
