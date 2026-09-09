import { NavLink, Navigate, Outlet, useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { seedProgram } from '@/store/devSeed';
import { useRevealOnRoute } from '@/app/lib/useRevealOnRoute';
import { useDocumentMeta } from '@/seo/useDocumentMeta';
import { useTrackingMigration } from './useTrackingMigration';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';
import { CartLink } from '@/app/components/shell/CartLink';
import { Button } from '@/app/components/roote';
import { packagingFor } from '@/domain/recommendation/recommend';
import { cn } from '@/app/components/ui/utils';
import { PATHS } from '@/app/paths';
import type { MessageKey } from '@/i18n/messages';

const TABS: Array<[to: string, key: MessageKey]> = [
  [PATHS.account, 'app.nav.overview'],
  [PATHS.accountSection('today'), 'app.nav.today'],
  [PATHS.accountSection('program'), 'app.nav.plan'],
  [PATHS.accountSection('progress'), 'app.nav.progress'],
  [PATHS.accountSection('photos'), 'app.nav.photos'],
  [PATHS.accountSection('scans'), 'app.nav.scans'],
  [PATHS.accountSection('progress/before-after'), 'app.nav.beforeAfter'],
  [PATHS.accountSection('orders'), 'app.nav.orders'],
  [PATHS.accountSection('subscription'), 'app.nav.subscription'],
  [PATHS.accountSection('care'), 'app.nav.support'],
];
// PO #22: reminders live under Profile, not the primary nav. Upcoming ones also
// surface on Overview + Today.

export function AppShell() {
  const t = useT();
  const { locale } = useLocale();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const auth = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  useRevealOnRoute();
  useTrackingMigration();
  useDocumentMeta();

  if (!session.program) {
    if (import.meta.env.DEV) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="max-w-sm font-body text-sm text-muted-foreground">{t('app.noProgram.body')}</p>
          <Button
            onClick={() => {
              const seed = seedProgram(locale);
              session.setAnalysis(seed.analysis);
              session.setReportId(seed.reportId);
              session.setProgram(seed.program);
              if (!auth.email && !auth.signUp('demo@roote.us', 'demo-demo-1').ok) {
                auth.signIn('demo@roote.us', 'demo-demo-1');
              }
            }}
          >
            {t('app.noProgram.devSeedCta')}
          </Button>
        </div>
      );
    }
    return <Navigate to={withLocale('/')} replace />;
  }
  if (!auth.email) return <Navigate to={withLocale('/login')} replace />;

  // PO #24: "Prefer not to say" carries an explicit packaging preference instead
  const { gender, packagingPreference } = session.diagnosis;
  const pack =
    packagingPreference ?? (gender && gender !== 'unspecified' ? packagingFor(gender) : undefined);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'shrink-0 rounded-full px-4 py-2 font-body text-sm tracking-wide transition-colors',
      'lg:w-full lg:rounded-lg lg:px-3 lg:py-2.5',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-ink-foreground/70 hover:text-ink-foreground lg:hover:bg-ink-foreground/10',
    );

  function logout() {
    auth.signOut();
    navigate(withLocale('/'));
  }

  return (
    <div
      data-pack={pack}
      className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[248px_minmax(0,1fr)]"
    >
      <aside className="sticky top-0 hidden h-screen flex-col border-e border-ink-foreground/15 bg-ink px-4 py-6 text-ink-foreground lg:flex">
        <Wordmark className="w-24" />
        <nav aria-label={t('app.nav.label')} className="mt-8 flex flex-col gap-1">
          {TABS.map(([to, key]) => (
            <NavLink key={to} to={withLocale(to)} end={to === PATHS.account} className={navLinkClass}>
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-ink-foreground/15 pt-4">
          <NavLink
            to={withLocale(PATHS.accountSection('scans'))}
            className="rounded-lg px-3 py-2 font-body text-sm text-ink-foreground/70 hover:bg-ink-foreground/10 hover:text-ink-foreground"
          >
            {t('app.care.rescanLink')}
          </NavLink>
          <div className="flex items-center justify-between ps-3 pe-1">
            <NavLink
              to={withLocale(PATHS.products)}
              className="rounded-lg py-2 font-body text-sm text-ink-foreground/70 hover:text-ink-foreground"
            >
              {t('app.nav.shop')}
            </NavLink>
            <CartLink label={t('cart.open')} count={cart.count} />
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-2 text-start font-body text-sm text-ink-foreground/70 hover:bg-ink-foreground/10 hover:text-ink-foreground"
          >
            {t('app.profile.logout')}
          </button>
          <LocaleToggle className="text-ink-foreground/60 hover:text-ink-foreground" />
        </div>
      </aside>

      <header className="glass-dark sticky top-0 z-40 border-b border-ink-foreground/15 lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Wordmark className="w-24" />
          <div className="flex items-center gap-1">
            <CartLink label={t('cart.open')} count={cart.count} />
            <button type="button" onClick={logout} className="font-body text-xs text-ink-foreground/70 underline">
              {t('app.profile.logout')}
            </button>
            <LocaleToggle className="text-ink-foreground/70 hover:text-ink-foreground" />
          </div>
        </div>
        <nav aria-label={t('app.nav.label')} className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map(([to, key]) => (
            <NavLink key={to} to={withLocale(to)} end={to === PATHS.account} className={navLinkClass}>
              {t(key)}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 lg:mx-0 lg:max-w-5xl lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
