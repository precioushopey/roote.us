/**
 * Inline localized text for self-contained content modules (products, programs,
 * solutions, assessment, legal registry). Same shape `roote.config.ts` uses.
 * All six UI locales are supported: `en` / `he` are always present, `ar` /
 * `ru` / `fr` / `es` are typed optional and fall back to `text.en` via
 * `pickLocalized` if a given entry is ever missing one.
 *
 * Hebrew strings here are a competent first pass. Anything with legal or medical
 * weight is additionally flagged for formal review at its call site.
 */
import type { LocaleCode } from '@/i18n/locales';

export type LocalizedText = { en: string; he: string; ar?: string; ru?: string; fr?: string; es?: string };

export const L = (en: string, he: string): LocalizedText => ({ en, he });

/** Extended form for entries translated into all six locales. */
export const L6 = (t: LocalizedText): LocalizedText => t;

export function pickLocalized(text: LocalizedText, locale: LocaleCode): string {
  return text[locale] || text.en;
}
