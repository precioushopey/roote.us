/** JS-side mirror of the CSS custom properties in theme.css. Keep in sync by hand. */
export const palette = {
  background: '#F9F6EF',   // Ivory
  foreground: '#2A2320',
  card: '#FFFFFF',
  primary: '#745F50',      // Gray Brown
  primaryForeground: '#F9F6EF',
  accent: '#8D7766',       // Gray Orange
  accentForeground: '#F9F6EF',
  secondary: '#F0E3D3',    // Cream
  muted: '#EFE7DA',
  mutedForeground: '#6E635A',
  border: '#E4D9C8',
  ring: '#8D7766',
} as const;

export const fonts = {
  sans: "'Libre Franklin', 'Heebo', system-ui, sans-serif",
  secondary: "'DM Sans', 'Heebo', sans-serif",
} as const;
