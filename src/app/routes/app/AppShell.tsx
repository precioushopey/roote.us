import { NavLink, Navigate, Outlet } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useRevealOnRoute } from '@/app/lib/useRevealOnRoute';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';
import { cn } from '@/app/components/ui/utils';

const TABS: Array<[to: string, key: string]> = [
  ['/app', 'app.nav.today'],
  ['/app/plan', 'app.nav.plan'],
  ['/app/progress', 'app.nav.progress'],
  ['/app/care', 'app.nav.care'],
];

export function AppShell() {
  const t = useT();
  const session = useSession();
  useRevealOnRoute();

  if (!session.program) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Wordmark className="w-24" />
          <LocaleToggle />
        </div>
        <nav
          aria-label={t('app.nav.label')}
          className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-2"
        >
          {TABS.map(([to, key]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm tracking-wide transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {t(key)}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
