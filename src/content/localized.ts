/**
 * Inline localized text for self-contained content modules (products, programs,
 * solutions, assessment, legal registry). Same shape `roote.config.ts` uses.
 * Only the two content locales exist; other UI locales fall back to English via
 * the i18n layer, not here.
 *
 * Hebrew strings here are a competent first pass. Anything with legal or medical
 * weight is additionally flagged for formal review at its call site.
 */
export type LocalizedText = { en: string; he: string };

export const L = (en: string, he: string): LocalizedText => ({ en, he });

export function pickLocalized(text: LocalizedText, locale: 'en' | 'he'): string {
  return text[locale] || text.en;
}
