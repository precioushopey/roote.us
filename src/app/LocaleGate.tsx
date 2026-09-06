import { Navigate, Outlet, useLocation, useParams } from 'react-router';
import { LocaleProvider, useLocalizedPath } from '@/i18n/LocaleProvider';
import { resolveLocaleRedirect, readStoredRegion } from '@/i18n/localeRegion';

function acceptLanguage(): string {
  return typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'he';
}

/** Element for the `/:localeRegion` route: validates the segment, redirects if
 *  invalid (a bare/legacy path structurally consumed the first real path
 *  segment as if it were the region), otherwise provides locale context. */
export function LocaleGate() {
  const { localeRegion } = useParams();
  const location = useLocation();
  const redirect = resolveLocaleRedirect(location.pathname, readStoredRegion(), acceptLanguage());
  if (redirect) return <Navigate to={redirect} replace />;
  return (
    <LocaleProvider localeRegion={localeRegion}>
      <Outlet />
    </LocaleProvider>
  );
}

/** Element for the top-level `*` catch-all: handles the true bare root and any
 *  path whose first segment isn't a real child under `/:localeRegion`. */
export function BareOrLegacyPathRedirect() {
  const location = useLocation();
  const redirect = resolveLocaleRedirect(location.pathname, readStoredRegion(), acceptLanguage());
  return <Navigate to={redirect ?? '/'} replace />;
}

/** `<Navigate>` for route-config entries that can't call hooks directly
 *  (module-scope route objects) — wraps the target with the current
 *  locale-region at render time. */
export function LocalizedNavigate({ to, replace }: { to: string; replace?: boolean }) {
  const withLocale = useLocalizedPath();
  return <Navigate to={withLocale(to)} replace={replace} />;
}
