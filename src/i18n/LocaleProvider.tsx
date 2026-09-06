import { createContext, useCallback, useContext, useMemo, useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { messages, type MessageKey } from './messages';
import {
  type LocaleCode,
  type ContentLocale,
  type CurrencyCode,
  DEFAULT_LOCALE,
  DEFAULT_COUNTRY,
  dirOf,
  contentLocaleOf,
  countryDefault,
} from './locales';
import { parseLocaleRegion, formatLocaleRegion, writeStoredRegion } from './localeRegion';
import { interpolate } from './interpolate';

type Ctx = {
  locale: LocaleCode;
  /** the locale that actually has content (en/he) — for `buildReport` etc. */
  contentLocale: ContentLocale;
  dir: 'rtl' | 'ltr';
  country: string;
  currency: CurrencyCode;
  localeRegion: string;
  setLocale: (l: LocaleCode) => void;
  setCountry: (c: string) => void;
  /** Sets both axes in a single navigation — use when changing locale and country together
   *  (calling `setCountry` then `setLocale` back-to-back races: both read the same stale
   *  `location.pathname`/`country`/`locale` closure, so the second `navigate()` clobbers the first). */
  setLocaleRegion: (l: LocaleCode, c: string) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<Ctx | null>(null);

const DEFAULT_REGION = formatLocaleRegion(DEFAULT_LOCALE, DEFAULT_COUNTRY);

export function LocaleProvider({
  localeRegion = DEFAULT_REGION,
  children,
}: {
  /** Already-validated by `<LocaleGate>` in the real app; optional so tests that
   *  don't care about routing can render `<LocaleProvider>` bare, same as today. */
  localeRegion?: string;
  children: ReactNode;
}) {
  const parsed = parseLocaleRegion(localeRegion);
  if (!parsed) {
    throw new Error(`LocaleProvider received an invalid localeRegion: "${localeRegion}"`);
  }
  const { locale, country } = parsed;
  const dir = dirOf(locale);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    writeStoredRegion(localeRegion);
  }, [locale, dir, localeRegion]);

  const navigateToRegion = useCallback(
    (nextRegion: string) => {
      const rest = location.pathname.split('/').slice(2).join('/');
      navigate(`/${nextRegion}${rest ? `/${rest}` : ''}${location.search}`);
    },
    [location.pathname, location.search, navigate],
  );

  const setLocale = useCallback(
    (l: LocaleCode) => navigateToRegion(formatLocaleRegion(l, country)),
    [country, navigateToRegion],
  );

  const setCountry = useCallback(
    (c: string) => navigateToRegion(formatLocaleRegion(locale, c)),
    [locale, navigateToRegion],
  );

  const setLocaleRegion = useCallback(
    (l: LocaleCode, c: string) => navigateToRegion(formatLocaleRegion(l, c)),
    [navigateToRegion],
  );

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      const table = messages[locale] as Record<string, string>;
      const raw = table[key] ?? (messages.en as Record<string, string>)[key] ?? key;
      return interpolate(raw, vars);
    },
    [locale],
  );

  const value = useMemo<Ctx>(
    () => ({
      locale,
      contentLocale: contentLocaleOf(locale),
      dir,
      country,
      currency: countryDefault(country).currency,
      localeRegion,
      setLocale,
      setCountry,
      setLocaleRegion,
      t,
    }),
    [locale, dir, country, localeRegion, setLocale, setCountry, setLocaleRegion, t],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useCtx(): Ctx {
  const c = useContext(LocaleContext);
  if (!c) throw new Error('useLocale/useT must be used within <LocaleProvider>');
  return c;
}

export function useLocale() {
  const { locale, contentLocale, dir, country, currency, localeRegion, setLocale, setCountry, setLocaleRegion } =
    useCtx();
  return { locale, contentLocale, dir, country, currency, localeRegion, setLocale, setCountry, setLocaleRegion };
}

/** The en/he locale to feed content builders (`buildReport` etc). */
export function useContentLocale(): ContentLocale {
  return useCtx().contentLocale;
}

export function useT() {
  return useCtx().t;
}

/** Prefixes a bare `PATHS.x` value with the current locale-region, e.g. `/products` -> `/en-us/products`. */
export function useLocalizedPath() {
  const { localeRegion } = useCtx();
  return useCallback(
    (path: string) => (path === '/' ? `/${localeRegion}` : `/${localeRegion}${path}`),
    [localeRegion],
  );
}
