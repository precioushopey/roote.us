import { createContext, useCallback, useContext, useMemo, useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { messages, type MessageKey } from './messages';
import { type LocaleCode, DEFAULT_LOCALE, dirOf, isLocaleCode } from './locales';
import { writeStoredLocale } from './localeUrl';
import { interpolate } from './interpolate';

type Ctx = {
  locale: LocaleCode;
  dir: 'rtl' | 'ltr';
  setLocale: (l: LocaleCode) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({
  locale: localeProp = DEFAULT_LOCALE,
  children,
}: {
  locale?: LocaleCode;
  children: ReactNode;
}) {
  if (!isLocaleCode(localeProp)) {
    throw new Error(`LocaleProvider received an invalid locale: "${localeProp}"`);
  }
  const locale = localeProp;
  const dir = dirOf(locale);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    writeStoredLocale(locale);
  }, [locale, dir]);

  const setLocale = useCallback(
    (l: LocaleCode) => {
      const rest = location.pathname.split('/').slice(2).join('/');
      navigate(`/${l}${rest ? `/${rest}` : ''}${location.search}`);
    },
    [location.pathname, location.search, navigate],
  );

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      const table = messages[locale] as Record<string, string>;
      const raw = table[key] ?? (messages.en as Record<string, string>)[key] ?? key;
      return interpolate(raw, vars);
    },
    [locale],
  );

  const value = useMemo<Ctx>(() => ({ locale, dir, setLocale, t }), [locale, dir, setLocale, t]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useCtx(): Ctx {
  const c = useContext(LocaleContext);
  if (!c) throw new Error('useLocale/useT must be used within <LocaleProvider>');
  return c;
}

export function useLocale() {
  const { locale, dir, setLocale } = useCtx();
  return { locale, dir, setLocale };
}

export function useT() {
  return useCtx().t;
}

/** Prefixes a bare `PATHS.x` value with the current locale, e.g. `/products` -> `/en/products`. */
export function useLocalizedPath() {
  const { locale } = useCtx();
  return useCallback(
    (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`),
    [locale],
  );
}
