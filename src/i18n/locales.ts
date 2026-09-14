/**
 * Locale registry — the single source of truth for which languages ROOTÉ
 * supports and their writing direction. Six language-only locales; English is
 * the default. `messages/<code>.ts` carries the UI strings for each; report /
 * plan / marketing CONTENT (`src/content/*.ts`, `roote.config.ts`
 * `LocalizedText`) is translated for all six too — `en`/`he` are simply the
 * per-entry authoring source, not a runtime restriction.
 */

export type LocaleCode = 'en' | 'he' | 'fr' | 'ru' | 'ar' | 'es';

export type LocaleMeta = {
  code: LocaleCode;
  /** Endonym, shown in the language picker. */
  label: string;
  /** English name — for `aria-label` and dev tooling. */
  englishName: string;
  dir: 'ltr' | 'rtl';
  /** BCP-47 tag for `Intl.*` formatting. */
  bcp47: string;
};

// Object order = language-picker order (PO #26, 2026-09-04): EN → HE → AR → RU → FR → ES.
export const LOCALES: Record<LocaleCode, LocaleMeta> = {
  en: { code: 'en', label: 'English', englishName: 'English', dir: 'ltr', bcp47: 'en-US' },
  he: { code: 'he', label: 'עברית', englishName: 'Hebrew', dir: 'rtl', bcp47: 'he-IL' },
  ar: { code: 'ar', label: 'العربية', englishName: 'Arabic', dir: 'rtl', bcp47: 'ar' },
  ru: { code: 'ru', label: 'Русский', englishName: 'Russian', dir: 'ltr', bcp47: 'ru-RU' },
  fr: { code: 'fr', label: 'Français', englishName: 'French', dir: 'ltr', bcp47: 'fr-FR' },
  es: { code: 'es', label: 'Español', englishName: 'Spanish', dir: 'ltr', bcp47: 'es-ES' },
};

export const ALL_LOCALES: LocaleCode[] = Object.keys(LOCALES) as LocaleCode[];

export const DEFAULT_LOCALE: LocaleCode = 'en';

export const RTL_LOCALES: LocaleCode[] = ALL_LOCALES.filter((c) => LOCALES[c].dir === 'rtl');

/** Locales the UI offers in the picker — all registered languages. */
export const ENABLED_LOCALES: LocaleCode[] = [...ALL_LOCALES];

export function isLocaleCode(v: unknown): v is LocaleCode {
  return typeof v === 'string' && v in LOCALES;
}

export function dirOf(code: LocaleCode): 'ltr' | 'rtl' {
  return LOCALES[code].dir;
}
