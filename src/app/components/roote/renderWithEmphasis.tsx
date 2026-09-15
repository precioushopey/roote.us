import type { ReactNode } from 'react';

/** Splits on `*word*` markers, rendering the marked part(s) in italic (see
 *  `.font-script`, marketing.css — same font as the surrounding heading,
 *  italic only) and leaving everything else as plain text. Used for the
 *  personalization word in a headline — each locale's translation places
 *  its own `*...*` marker, since word order (and, for he/ar, whether the
 *  pronoun fuses onto the noun) differs per language. */
export function renderWithEmphasis(text: string): ReactNode[] {
  return text
    .split(/\*(.+?)\*/g)
    .map((part, i) => (i % 2 === 1 ? <span key={i} className="font-script">{part}</span> : part));
}
