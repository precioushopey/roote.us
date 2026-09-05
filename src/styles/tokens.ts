/**
 * JS-side mirror of the design tokens in `theme.css`. Keep in sync by hand;
 * `tokens.test.ts` fails if the two drift. Consumed by JS that can't read CSS
 * custom properties (canvas, tests, docs tooling).
 */

/** Primitive colour scales — brief §6. */
export const primitives = {
  emerald950: '#0A2A1C',
  emerald900: '#123726',
  emerald800: '#1B4B32',
  emerald700: '#235E3F',
  emerald600: '#34805A',
  cream50: '#FCF9F3',
  cream100: '#F6EFE4',
  cream200: '#EDE1CF',
  cream300: '#E6DAC6',
  gold500: '#C6A15A',
  gold600: '#A98343',
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
  primary: primitives.emerald800,
  primaryForeground: primitives.cream50,
  secondary: primitives.cream100,
  muted: primitives.cream200,
  mutedForeground: primitives.muted,
  accent: primitives.gold500, // non-text / ≥24px only
  accentForeground: primitives.ink,
  border: primitives.cream300,
  ring: primitives.gold500,
  ink: primitives.emerald950, // dark editorial band
  inkForeground: primitives.cream100,
  accentGhost: '#E6D8BD',
  inkGhost: '#284A3A',
  destructive: '#B3261E',
  success: '#1F7A53',
  warning: '#A8681C',
  info: primitives.emerald700,
} as const;

/** Glass surfaces — genuine depth only (sticky nav, floating result card, modals). */
export const glass = {
  light: 'rgba(255, 255, 255, 0.62)',
  dark: 'rgba(10, 42, 28, 0.85)',
  border: 'rgba(255, 255, 255, 0.18)',
  borderDark: 'rgba(255, 255, 255, 0.1)',
  blur: '20px',
} as const;

export const fonts = {
  display: "'Bodoni Moda', 'Frank Ruhl Libre', 'Didot', 'Bodoni 72', Georgia, serif",
  body: "'Montserrat', 'Heebo', 'Noto Sans Hebrew', 'Noto Sans Arabic', system-ui, sans-serif",
} as const;

/** Display type scale (px) — brief §6. clamp() lives in displayScale.ts. */
export const displaySizes = { sm: 28, md: 36, lg: 48, xl: 64, '2xl': 80 } as const;

/** Radius scale (px). */
export const radii = { sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, pill: 9999 } as const;

/** Marketing layout maxima (px) — brief §6. */
export const layout = { marketing: 1280, content: 1160, readable: 720 } as const;
