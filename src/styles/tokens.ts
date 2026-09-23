/**
 * JS-side mirror of the design tokens in `theme.css`. Keep in sync by hand;
 * `tokens.test.ts` fails if the two drift. Consumed by JS that can't read CSS
 * custom properties (canvas, tests, docs tooling).
 */

/** Primitive colour scales — brief §6. */
export const primitives = {
  cream50: '#FCF9F3',
  cream100: '#F6EFE4',
  cream200: '#EDE1CF',
  cream300: '#E6DAC6',
  // Gold, the logo's colour (2026-09-23). 500 is the logo gold (too faint for fills or
  // small text); 950 is the deepest surface; 800/900 are the text-safe darks.
  // See theme.css for the contrast numbers.
  gold950: '#2A2110',
  gold900: '#5C4510',
  gold800: '#6E5310',
  gold700: '#8A6A1F',
  gold600: '#A98343',
  gold500: '#C6A15A',
  // Yellow ochre, the button colour: 800 is the fill (cream label), 900 its hover tint.
  ochre800: '#8B6009',
  ochre900: '#6B4906',
  // Warm sand "anchor" tone — replaces the old near-black ink band.
  taupe500: '#E0C9B6',
  ink: '#172022',
  body: '#333A3C',
  muted: '#6F7676',
  line: 'rgba(23, 32, 34, 0.14)',
} as const;

/** Semantic surface palette (maps onto shadcn CSS var names in theme.css). */
export const palette = {
  background: primitives.cream50,
  foreground: primitives.ink,
  card: '#FFFFFF',
  primary: primitives.ochre800, // yellow ochre fill; carries cream text
  primaryForeground: primitives.cream50,
  secondary: primitives.cream100,
  muted: primitives.cream200,
  mutedForeground: primitives.muted,
  accent: primitives.gold800, // the text-safe dark gold
  accentForeground: primitives.cream50,
  border: primitives.cream300,
  ring: primitives.gold600,
  ink: primitives.taupe500, // editorial "anchor" band — warm taupe, not dark
  inkForeground: primitives.ink,
  accentGhost: '#F3E6C6',
  inkGhost: '#4D3D16',
  destructive: '#B3261E',
  success: '#1F7A53',
  warning: '#A8681C',
  info: primitives.gold700,
} as const;

export const fonts = {
  display: "'Lusitana', 'Frank Ruhl Libre', 'Bodoni Moda', 'Didot', 'Bodoni 72', Georgia, serif",
  body: "'Montserrat', 'Heebo', 'Noto Sans Hebrew', 'Noto Sans Arabic', system-ui, sans-serif",
} as const;

/** Display type scale (px) — brief §6. clamp() lives in displayScale.ts. */
export const displaySizes = { sm: 28, md: 36, lg: 48, xl: 64, '2xl': 80 } as const;

/** Radius scale (px). */
export const radii = { sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, pill: 9999 } as const;

/** Marketing layout maxima (px) — brief §6. */
export const layout = { content: 1280, readable: 720 } as const;

/** Motion curves/durations — mirrors the `--ease-*`/`--duration-*` vars in theme.css.
 * The `*Bezier` arrays are the same curve in the `[x1,y1,x2,y2]` shape the `motion`
 * library's `ease` transition option expects (it doesn't parse CSS `cubic-bezier()` strings). */
const easeEntranceBezier = [0.16, 1, 0.3, 1] as const;
const easeStandardBezier = [0.4, 0, 0.2, 1] as const;
export const motion = {
  easeEntrance: `cubic-bezier(${easeEntranceBezier.join(', ')})`,
  easeStandard: `cubic-bezier(${easeStandardBezier.join(', ')})`,
  easeEntranceBezier,
  easeStandardBezier,
  durationPress: 100,
  durationRoute: 180,
} as const;
