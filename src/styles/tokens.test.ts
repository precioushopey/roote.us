import { describe, it, expect } from 'vitest';
import { palette } from './tokens';

describe('palette', () => {
  it('exposes the exact brand hex values', () => {
    expect(palette).toMatchObject({
      background: '#F9F6EF',
      foreground: '#2A2320',
      primary: '#745F50',
      accent: '#8D7766',
      secondary: '#F0E3D3',
      border: '#E4D9C8',
    });
  });
});
