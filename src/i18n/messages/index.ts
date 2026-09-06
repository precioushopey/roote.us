import { en } from './en';
import { he } from './he';
import { fr } from './fr';
import { ru } from './ru';
import { ar } from './ar';
import { es } from './es';
import type { LocaleCode } from '../locales';

export type { MessageKey } from './en';
export type { LocaleCode, ContentLocale } from '../locales';
export {
  LOCALES,
  ALL_LOCALES,
  DEFAULT_LOCALE,
  SHIPPED_LOCALES,
  ENABLED_LOCALES,
  RTL_LOCALES,
  dirOf,
  contentLocaleOf,
  isLocaleCode,
} from '../locales';

/**
 * The locale the running UI is currently limited to. Widens to `LocaleCode`
 * in WP2 when `LocaleProvider` + `CountryLanguageSelector` are wired; kept as
 * `'en' | 'he'` for now so `buildReport` / `resolvePlanTreatments` (which only
 * have en/he content) stay sound without call-site churn.
 */
export type Locale = 'en' | 'he';

import type { MessageKey } from './en';

/** Every registered locale. `en` / `he` are complete; the rest are empty
 *  scaffolds whose keys resolve to English via `t()`. */
export const messages: Record<LocaleCode, Partial<Record<MessageKey, string>>> = {
  en,
  he,
  fr,
  ru,
  ar,
  es,
};
