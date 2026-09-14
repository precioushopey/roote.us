import { Navigate, Outlet, useLocation, useParams } from 'react-router';
import { LocaleProvider, useLocalizedPath } from '@/i18n/LocaleProvider';
import { resolveLocaleRedirect, readStoredLocale, isValidLocaleSegment } from '@/i18n/localeUrl';
import { isLocaleCode } from '@/i18n/locales';

function acceptLanguage(): string {
  return typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en';
}

export function LocaleGate() {
  const { locale } = useParams();
  const location = useLocation();
  const redirect = resolveLocaleRedirect(location.pathname, readStoredLocale(), acceptLanguage());
  if (redirect) return <Navigate to={redirect} replace />;
  const safe = locale && isValidLocaleSegment(locale) && isLocaleCode(locale) ? locale : undefined;
  return (
    <LocaleProvider locale={safe}>
      <Outlet />
    </LocaleProvider>
  );
}

export function BareOrLegacyPathRedirect() {
  const location = useLocation();
  const redirect = resolveLocaleRedirect(location.pathname, readStoredLocale(), acceptLanguage());
  return <Navigate to={redirect ?? '/'} replace />;
}

export function LocalizedNavigate({ to, replace }: { to: string; replace?: boolean }) {
  const withLocale = useLocalizedPath();
  return <Navigate to={withLocale(to)} replace={replace} />;
}
