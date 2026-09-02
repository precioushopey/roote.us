/** JS-side mirror of the CSS custom properties in theme.css. Keep in sync by hand. */
export const palette = {
  background: '#F9F6EF',   // Ivory
  foreground: '#2A2320',
  card: '#FFFFFF',
  primary: '#745F50',      // Gray Brown
  primaryForeground: '#F9F6EF',
  accent: '#A97B45',       // Brass / gold  (was #8D7766)
  accentForeground: '#F9F6EF',
  accentGhost: '#D8CCB9',  // two-tone ghost word on light grounds
  secondary: '#F0E3D3',    // Cream
  muted: '#EFE7DA',
  mutedForeground: '#6E635A',
  border: '#E4D9C8',
  ring: '#A97B45',         // follows accent
  ink: '#201812',          // dark editorial surface (hero band, CtaBand, footer)
  inkForeground: '#F4EFE4',
  inkGhost: '#4A3F34',     // two-tone ghost word on ink grounds
} as const;

export const fonts = {
  sans: "'Libre Franklin', 'Heebo', system-ui, sans-serif",
  display: "'Playfair Display', 'Frank Ruhl Libre', Georgia, serif",
  body: "'Montserrat', 'Heebo', system-ui, sans-serif",
} as const;
