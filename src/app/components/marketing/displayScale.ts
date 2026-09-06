/**
 * Fluid sizes for Bodoni Moda display headings across the site. One place so
 * the scale tunes globally. Targets the brief §6 scale (28 → 80px).
 * `DISPLAY_CLAMP` is the default section-heading size; the named steps cover
 * hero (xl) down to small callouts (sm).
 */
export const DISPLAY_CLAMP = 'clamp(2.25rem, 6vw, 4rem)';

export const displayClamp = {
  sm: 'clamp(1.5rem, 3.5vw, 1.75rem)', // 24 → 28
  md: 'clamp(1.875rem, 5vw, 2.25rem)', // 30 → 36
  lg: 'clamp(2.25rem, 6vw, 3rem)', //     36 → 48
  xl: 'clamp(2.75rem, 8vw, 4rem)', //     44 → 64
  '2xl': 'clamp(3rem, 10vw, 5rem)', //    48 → 80
} as const;

export type DisplayStep = keyof typeof displayClamp;
