import { describe, it, expect } from 'vitest';
import { primitives, palette, glass, fonts, displaySizes, radii, layout } from './tokens';

describe('primitive scales (brief §6)', () => {
  it('carries the pinned emerald / cream / gold / ink values', () => {
    expect(primitives).toMatchObject({
      emerald950: '#0A2A1C',
      emerald800: '#1B4B32',
      cream50: '#FCF9F3',
      cream100: '#F6EFE4',
      gold500: '#C6A15A',
      gold600: '#A98343',
      ink: '#172022',
      body: '#333A3C',
      muted: '#6F7676',
    });
  });
});

describe('semantic palette', () => {
  it('uses deep emerald for the filled CTA, not a brown', () => {
    expect(palette.primary).toBe('#1B4B32');
    expect(palette.primaryForeground).toBe('#FCF9F3');
  });

  it('uses cream as the page ground and ink as body text', () => {
    expect(palette.background).toBe('#FCF9F3');
    expect(palette.foreground).toBe('#172022');
  });

  it('keeps gold as an accent (non-text) and deep emerald for the ink band', () => {
    expect(palette.accent).toBe('#C6A15A');
    expect(palette.ink).toBe('#0A2A1C');
    expect(palette.inkForeground).toBe('#F6EFE4');
  });

  it('exposes the four semantic status colours', () => {
    for (const k of ['destructive', 'success', 'warning', 'info'] as const) {
      expect(palette[k]).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});

describe('glass tokens', () => {
  it('are the brief §6 values and are used for depth only', () => {
    expect(glass.light).toBe('rgba(255, 255, 255, 0.62)');
    expect(glass.dark).toBe('rgba(10, 42, 28, 0.7)');
    expect(glass.border).toBe('rgba(255, 255, 255, 0.18)');
    expect(glass.blur).toBe('20px');
  });
});

describe('fonts', () => {
  it('lead with Bodoni Moda (display) and Montserrat (body)', () => {
    expect(fonts.display.startsWith("'Bodoni Moda'")).toBe(true);
    expect(fonts.body.startsWith("'Montserrat'")).toBe(true);
  });
  it('body stack includes Hebrew + Arabic fallbacks', () => {
    expect(fonts.body).toContain('Noto Sans Hebrew');
    expect(fonts.body).toContain('Noto Sans Arabic');
  });
});

describe('scales', () => {
  it('display sizes follow the brief scale', () => {
    expect(displaySizes).toEqual({ sm: 28, md: 36, lg: 48, xl: 64, '2xl': 80 });
  });
  it('radius scale is Liquid-Glass large', () => {
    expect(radii.lg).toBe(16);
    expect(radii['2xl']).toBe(32);
  });
  it('layout maxima match the brief', () => {
    expect(layout).toEqual({ marketing: 1280, content: 1160, readable: 720 });
  });
});
