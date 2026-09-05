import {
  ENABLED_LOCALES,
  COUNTRY_DEFAULTS,
  DEFAULT_LOCALE,
  DEFAULT_COUNTRY,
  isLocaleCode,
  type LocaleCode,
} from './locales';
import { LEGACY_PREFIX_REDIRECTS, LEGACY_EXACT_REDIRECTS } from '@/app/paths';

export type ParsedLocaleRegion = { locale: LocaleCode; country: string };

export function parseLocaleRegion(segment: string): ParsedLocaleRegion | null {
  const parts = segment.split('-');
  if (parts.length !== 2) return null;
  const locale = parts[0].toLowerCase();
  const country = parts[1].toUpperCase();
  if (!isLocaleCode(locale) || !ENABLED_LOCALES.includes(locale)) return null;
  if (!(country in COUNTRY_DEFAULTS)) return null;
  return { locale, country };
}

export function isValidLocaleRegion(segment: string): boolean {
  return parseLocaleRegion(segment) !== null;
}

export function formatLocaleRegion(locale: LocaleCode, country: string): string {
  return `${locale}-${country.toLowerCase()}`;
}

function defaultCountryForLocale(locale: LocaleCode): string {
  if (COUNTRY_DEFAULTS[DEFAULT_COUNTRY]?.locale === locale) return DEFAULT_COUNTRY;
  const match = Object.values(COUNTRY_DEFAULTS).find((c) => c.locale === locale);
  return match ? match.country : DEFAULT_COUNTRY;
}

function detectLocaleFromAcceptLanguage(acceptLanguage: string): LocaleCode {
  const candidates = acceptLanguage
    .split(',')
    .map((tag) => tag.split(';')[0].trim().split('-')[0].toLowerCase());
  for (const candidate of candidates) {
    if (isLocaleCode(candidate) && ENABLED_LOCALES.includes(candidate)) return candidate;
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

export const PREFERRED_REGION_KEY = 'roote.localeRegion';

export function readStoredRegion(): string | null {
  try {
    return localStorage.getItem(PREFERRED_REGION_KEY);
  } catch {
    return null;
  }
}

export function writeStoredRegion(region: string): void {
  try {
    localStorage.setItem(PREFERRED_REGION_KEY, region);
  } catch {
    /* ignore */
  }
}

export function resolveLocaleRedirect(
  pathname: string,
  storedRegion: string | null,
  acceptLanguage: string,
): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const [first] = segments;
  if (first && isValidLocaleRegion(first)) return null;

  let region: string;
  if (storedRegion && isValidLocaleRegion(storedRegion)) {
    region = storedRegion;
  } else {
    const detectedLocale = detectLocaleFromAcceptLanguage(acceptLanguage);
    region = formatLocaleRegion(detectedLocale, defaultCountryForLocale(detectedLocale));
  }

  const restPath = applyLegacyRedirects(segments.length ? `/${segments.join('/')}` : '/');
  return restPath === '/' ? `/${region}` : `/${region}${restPath}`;
}
