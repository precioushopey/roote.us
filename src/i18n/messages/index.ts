import { en } from './en';
import { he } from './he';
import { fr } from './fr';
import { ru } from './ru';
import { ar } from './ar';
import { es } from './es';
import type { LocaleCode } from '../locales';

export type { MessageKey } from './en';
export type { LocaleCode } from '../locales';
export {
  LOCALES,
  ALL_LOCALES,
  DEFAULT_LOCALE,
  ENABLED_LOCALES,
  RTL_LOCALES,
  dirOf,
  isLocaleCode,
} from '../locales';

import type { MessageKey } from './en';

/** All six locale message tables. Full key parity is enforced by scripts/check-i18n-parity.mjs (pnpm i18n:check). */
export const messages: Record<LocaleCode, Partial<Record<MessageKey, string>>> = {
  en,
  he,
  fr,
  ru,
  ar,
  es,
};
