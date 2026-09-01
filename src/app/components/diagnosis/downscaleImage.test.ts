import { describe, it, expect } from 'vitest';
import { computeDownscaledSize } from './downscaleImage';

describe('computeDownscaledSize', () => {
  it('never upscales', () => {
    expect(computeDownscaledSize(800, 600, 1200)).toEqual({ width: 800, height: 600 });
  });
  it('scales the long edge down to maxEdge, keeping aspect ratio', () => {
    expect(computeDownscaledSize(4000, 3000, 1200)).toEqual({ width: 1200, height: 900 });
    expect(computeDownscaledSize(3000, 4000, 1200)).toEqual({ width: 900, height: 1200 });
  });
  it('rounds to integers', () => {
    const { width, height } = computeDownscaledSize(1333, 1000, 1200);
    expect(Number.isInteger(width)).toBe(true);
    expect(Number.isInteger(height)).toBe(true);
  });
});
