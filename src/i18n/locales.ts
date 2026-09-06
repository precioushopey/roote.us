/**
 * Locale registry — the single source of truth for which languages ROOTÉ
 * supports, their writing direction, and how a country maps to a default
 * language + currency (brief §24).
 *
 * `shipped: true`  → fully translated, key-parity enforced by messages.test.ts.
 * `shipped: false` → machine-draft scaffold. Registered so the whole i18n
 *   pipeline (language picker, RTL layout for Arabic, country→locale routing)
 *   is exercised end-to-end; every key falls back to English at runtime until a
 *   professional translation pass fills `messages/<code>.ts`.
 *
 * WP2 wires this into `LocaleProvider` + `CountryLanguageSelector`. Until then
 * the provider stays on `en` / `he`.
 */

export type LocaleCode = 'en' | 'he' | 'fr' | 'ru' | 'ar' | 'es';

/** Locales that carry real, human-authored content. `buildReport` / config
 *  `LocalizedText` only have these two. */
export type ContentLocale = 'en' | 'he';

export type LocaleMeta = {
  code: LocaleCode;
  /** Endonym, shown in the language picker. */
  label: string;
  /** English name — for `aria-label` and dev tooling. */
  englishName: string;
  dir: 'ltr' | 'rtl';
  /** BCP-47 tag for `Intl.*` formatting. */
  bcp47: string;
  shipped: boolean;
};

// Object order = picker order = the PO's launch roadmap (#26, 2026-09-04):
// EN → HE → AR → RU → FR → ES. Arabic is next because the RTL architecture is
// already needed for Hebrew and it is strategically relevant to the Israeli market.
export const LOCALES: Record<LocaleCode, LocaleMeta> = {
  en: { code: 'en', label: 'English', englishName: 'English', dir: 'ltr', bcp47: 'en-US', shipped: true },
  he: { code: 'he', label: 'עברית', englishName: 'Hebrew', dir: 'rtl', bcp47: 'he-IL', shipped: true },
  ar: { code: 'ar', label: 'العربية', englishName: 'Arabic', dir: 'rtl', bcp47: 'ar', shipped: false },
  ru: { code: 'ru', label: 'Русский', englishName: 'Russian', dir: 'ltr', bcp47: 'ru-RU', shipped: false },
  fr: { code: 'fr', label: 'Français', englishName: 'French', dir: 'ltr', bcp47: 'fr-FR', shipped: false },
  es: { code: 'es', label: 'Español', englishName: 'Spanish', dir: 'ltr', bcp47: 'es-ES', shipped: false },
};

/** The order languages are slated to ship in (PO #26). */
export const LOCALE_ROADMAP: readonly LocaleCode[] = ['en', 'he', 'ar', 'ru', 'fr', 'es'];

export const ALL_LOCALES: LocaleCode[] = Object.keys(LOCALES) as LocaleCode[];

export const DEFAULT_LOCALE: LocaleCode = 'he';

export const SHIPPED_LOCALES: LocaleCode[] = ALL_LOCALES.filter((c) => LOCALES[c].shipped);

export const RTL_LOCALES: LocaleCode[] = ALL_LOCALES.filter((c) => LOCALES[c].dir === 'rtl');

/**
 * Locales the UI actually offers in the picker. Scaffolds are hidden in normal
 * builds; `VITE_I18N_SHOW_SCAFFOLDS=1` reveals them so the Arabic RTL layout
 * and the picker itself can be reviewed before translations land.
 */
export const ENABLED_LOCALES: LocaleCode[] = (() => {
  try {
    if (import.meta.env?.VITE_I18N_SHOW_SCAFFOLDS === '1') return ALL_LOCALES;
  } catch {
    /* import.meta.env not available (e.g. some test envs) */
  }
  return SHIPPED_LOCALES;
})();

export function isLocaleCode(v: unknown): v is LocaleCode {
  return typeof v === 'string' && v in LOCALES;
}

export function dirOf(code: LocaleCode): 'ltr' | 'rtl' {
  return LOCALES[code].dir;
}

/** Map any locale onto the nearest locale that has real content. Non-Hebrew
 *  falls back to English (the only other content locale). */
export function contentLocaleOf(code: LocaleCode): ContentLocale {
  return code === 'he' ? 'he' : 'en';
}

/* --- country → default language + currency (brief §24) -------------------
   Manual override in the picker always wins; this only seeds the first visit
   (geo-IP is a backend concern — BE-11, still stubbed). */

export type CurrencyCode = 'USD' | 'GBP' | 'ILS' | 'EUR' | 'RUB';

export type CountryDefault = {
  country: string; // ISO 3166-1 alpha-2
  label: string;
  locale: LocaleCode;
  currency: CurrencyCode;
};

export const COUNTRY_DEFAULTS: Record<string, CountryDefault> = {
  US: { country: 'US', label: 'United States', locale: 'en', currency: 'USD' },
  GB: { country: 'GB', label: 'United Kingdom', locale: 'en', currency: 'GBP' },
  IL: { country: 'IL', label: 'ישראל', locale: 'he', currency: 'ILS' },
  FR: { country: 'FR', label: 'France', locale: 'fr', currency: 'EUR' },
  ES: { country: 'ES', label: 'España', locale: 'es', currency: 'EUR' },
  RU: { country: 'RU', label: 'Россия', locale: 'ru', currency: 'RUB' },
  CA: { country: 'CA', label: 'Canada', locale: 'en', currency: 'USD' },
  AE: { country: 'AE', label: 'الإمارات', locale: 'ar', currency: 'USD' },
};

export const DEFAULT_COUNTRY = 'IL';

/**
 * Currencies actually offered at commerce launch (PO decision #3, 2026-09-04):
 * USD (91 ENTERPRISE LLC is a US company) + ILS (large Israeli customer base).
 * GBP switches on with UK commerce; EUR after that; RUB is not a launch currency.
 * `COUNTRY_DEFAULTS` above is the full roadmap table — a country that maps to a
 * non-launch currency should fall back to USD in the checkout until it activates.
 */
export const LAUNCH_CURRENCIES: readonly CurrencyCode[] = ['USD', 'ILS'];

export function launchCurrencyFor(country: string): CurrencyCode {
  const c = countryDefault(country).currency;
  return LAUNCH_CURRENCIES.includes(c) ? c : 'USD';
}

export function countryDefault(country: string): CountryDefault {
  return COUNTRY_DEFAULTS[country] ?? COUNTRY_DEFAULTS[DEFAULT_COUNTRY];
}
