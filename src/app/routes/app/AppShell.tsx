import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { useRevealOnRoute } from '@/app/lib/useRevealOnRoute';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';
import { cn } from '@/app/components/ui/utils';
import type { MessageKey } from '@/i18n/messages';

const TABS: Array<[to: string, key: MessageKey]> = [
  ['/app', 'app.nav.today'],
  ['/app/plan', 'app.nav.plan'],
  ['/app/progress', 'app.nav.progress'],
  ['/app/care', 'app.nav.care'],
  ['/app/profile', 'app.nav.profile'],
];

export function AppShell() {
  const t = useT();
  const session = useSession();
  const auth = useAuth();
  const navigate = useNavigate();
  useRevealOnRoute();

  if (!session.program) return <Navigate to="/" replace />;
  if (!auth.email) return <Navigate to="/login" replace />;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'shrink-0 rounded-full px-4 py-2 text-sm tracking-wide transition-colors',
      'lg:w-full lg:rounded-lg lg:px-3 lg:py-2.5',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground lg:hover:bg-secondary/60',
    );

  function logout() {
    auth.signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-e border-border bg-card px-4 py-6 lg:flex">
        <Wordmark className="w-24" />
        <nav aria-label={t('app.nav.label')} className="mt-8 flex flex-col gap-1">
          {TABS.map(([to, key]) => (
            <NavLink key={to} to={to} end={to === '/app'} className={navLinkClass}>
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
          <NavLink
            to="/app/rescan"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            {t('app.care.rescanLink')}
          </NavLink>
          <Link
            to="/products"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            {t('app.nav.shop')}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-2 text-start text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            {t('app.profile.logout')}
          </button>
          <LocaleToggle />
        </div>
      </aside>

      {/* Mobile top bar + scrollable tabs */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Wordmark className="w-24" />
          <div className="flex items-center gap-3">
            <button type="button" onClick={logout} className="text-xs text-muted-foreground underline">
              {t('app.profile.logout')}
            </button>
            <LocaleToggle />
          </div>
        </div>
        <nav
          aria-label={t('app.nav.label')}
          className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-2"
        >
          {TABS.map(([to, key]) => (
            <NavLink key={to} to={to} end={to === '/app'} className={navLinkClass}>
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
