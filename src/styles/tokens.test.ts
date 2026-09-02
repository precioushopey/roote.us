import { describe, it, expect } from 'vitest';
import { palette, fonts } from './tokens';

describe('palette', () => {
  it('keeps the unchanged brand hex values', () => {
    expect(palette).toMatchObject({
      background: '#F9F6EF',
      foreground: '#2A2320',
      primary: '#745F50',
      secondary: '#F0E3D3',
      border: '#E4D9C8',
    });
  });

  it('uses the new gold accent', () => {
    expect(palette.accent).toBe('#A97B45');
  });

  it('carries the new ink / ghost surface tokens', () => {
    expect(palette.ink).toBe('#201812');
    expect(palette.inkForeground).toBe('#F4EFE4');
    expect(palette.accentGhost).toBe('#D8CCB9');
    expect(palette.inkGhost).toBe('#4A3F34');
  });
});

describe('fonts', () => {
  it('exposes the display and body stacks', () => {
    expect(fonts.display).toBe("'Playfair Display', 'Frank Ruhl Libre', Georgia, serif");
    expect(fonts.body).toBe("'Montserrat', 'Heebo', system-ui, sans-serif");
  });
  it('keeps the sans stack', () => {
    expect(fonts.sans).toBe("'Libre Franklin', 'Heebo', system-ui, sans-serif");
  });
  it('no longer exposes secondary', () => {
    expect('secondary' in fonts).toBe(false);
  });
});
