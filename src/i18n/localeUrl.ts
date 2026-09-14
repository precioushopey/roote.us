import {
  ENABLED_LOCALES,
  DEFAULT_LOCALE,
  isLocaleCode,
  type LocaleCode,
} from './locales';
import { LEGACY_PREFIX_REDIRECTS, LEGACY_EXACT_REDIRECTS } from '@/app/paths';

export function isValidLocaleSegment(seg: string): seg is LocaleCode {
  return isLocaleCode(seg) && ENABLED_LOCALES.includes(seg);
}

function detectLocaleFromAcceptLanguage(acceptLanguage: string): LocaleCode {
  const candidates = acceptLanguage
    .split(',')
    .map((tag) => tag.split(';')[0].trim().split('-')[0].toLowerCase());
  for (const c of candidates) {
    if (isLocaleCode(c) && ENABLED_LOCALES.includes(c)) return c;
  }
  return DEFAULT_LOCALE;
}

function applyLegacyRedirects(restPath: string): string {
  for (const [from, to] of LEGACY_EXACT_REDIRECTS) {
    if (restPath === from) return to;
  }
  for (const [from, to] of LEGACY_PREFIX_REDIRECTS) {
    if (restPath === from) return to;
    if (restPath.startsWith(`${from}/`)) return to + restPath.slice(from.length);
  }
  return restPath;
}

export const PREFERRED_LOCALE_KEY = 'roote.locale';

export function readStoredLocale(): string | null {
  try {
    return localStorage.getItem(PREFERRED_LOCALE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredLocale(locale: string): void {
  try {
    localStorage.setItem(PREFERRED_LOCALE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function resolveLocaleRedirect(
  pathname: string,
  storedLocale: string | null,
  acceptLanguage: string,
): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const [first] = segments;
  if (first && isValidLocaleSegment(first)) return null;

  const locale =
    storedLocale && isValidLocaleSegment(storedLocale)
      ? storedLocale
      : detectLocaleFromAcceptLanguage(acceptLanguage);

  const restPath = applyLegacyRedirects(segments.length ? `/${segments.join('/')}` : '/');
  return restPath === '/' ? `/${locale}` : `/${locale}${restPath}`;
}
