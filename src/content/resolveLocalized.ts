import { PENDING, type PendingMarker } from './pending';
import type { LocalizedText } from './roote.config';

/** An empty translation is unresolved, not blank — same rule as buildReport's private copy. */
export function resolveLocalized(
  text: LocalizedText,
  locale: 'en' | 'he',
  label: string,
): string | PendingMarker {
  const v = text[locale];
  return v ? v : PENDING(label);
}
