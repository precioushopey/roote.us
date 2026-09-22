import type { ComponentType } from 'react';
import { NavLink, Navigate, useLocation, useNavigate } from 'react-router';
import { Home, ClipboardList, LineChart, Package, User, type LucideProps } from 'lucide-react';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { seedProgram } from '@/store/devSeed';
import { useRevealOnRoute } from '@/app/lib/useRevealOnRoute';
import { useDocumentMeta } from '@/seo/useDocumentMeta';
import { useTrackingMigration } from './useTrackingMigration';
import { AccountPreDelivery } from './AccountPreDelivery';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { Button, LanguagePicker, RouteFade } from '@/app/components/roote';
import { packagingFor } from '@/domain/recommendation/recommend';
import { cn } from '@/app/components/ui/utils';
import { PATHS } from '@/app/paths';
import type { MessageKey } from '@/i18n/messages';

// Nav consolidation (2026-09-11): 10 sidebar pages folded into 5 — Progress now
// absorbs Photos/Scans/Before & After as tabs of one screen (AccountProgress.tsx),
// and Profile absorbs Orders/Subscription (AppProfile.tsx); Overview folded into
// Today as one combined dashboard+checklist (AccountToday.tsx, now the index route).
// 2026-09-23: un-consolidated Orders back into its own page (AppOrders.tsx, grid
// layout) — it now takes this slot, which used to be Care/Support; Care's own
// content (care-team messages, contact form, rescan link) moved into Profile
// instead (AppProfile.tsx), so nothing here was dropped, just relocated.
const TABS: Array<[to: string, key: MessageKey, icon: ComponentType<LucideProps>]> = [
  [PATHS.account, 'app.nav.today', Home],
  [PATHS.accountSection('program'), 'app.nav.plan', ClipboardList],
  [PATHS.accountSection('progress'), 'app.nav.progress', LineChart],
  [PATHS.accountSection('orders'), 'app.nav.orders', Package],
  [PATHS.accountSection('profile'), 'app.nav.profile', User],
];
// PO #22: reminders live under Profile, not the primary nav. Upcoming ones also
// surface on Today.

export function AppShell() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useRevealOnRoute();
  useTrackingMigration();
  useDocumentMeta();

  // Order history (its own page again as of 2026-09-23, was on Profile) doesn't
  // depend on having an active program — a signed-up guest who only ever placed
  // a cart order (no program) still needs to reach Profile and Orders to see it
  // (store/orders.ts is a flat, unauthenticated list; any account "sees" every
  // order already in this browser). Every other /account/* page still requires
  // a program.
  const noProgramNeeded = location.pathname.endsWith('/profile') || location.pathname.endsWith('/orders');

  if (!session.program && !noProgramNeeded) {
    if (import.meta.env.DEV) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="max-w-sm font-body text-sm text-muted-foreground">{t('app.noProgram.body')}</p>
          <Button to={withLocale(PATHS.analysis)} caps>
            {t('marketing.nav.cta')}
          </Button>
          {/* Dev-only shortcut into a mid-program /account, skipping the real
              analysis + checkout flow — kept, but de-emphasized under the
              real CTA above so it never reads as the intended user action. */}
          <button
            type="button"
            onClick={() => {
              const seed = seedProgram(locale);
              // planKeysForProgram reads live session.diagnosis (not the frozen
              // program snapshot) — without hydrating it too, the plan resolves
              // to zero treatments and Today shows an empty 0/0 routine.
              if (seed.diagnosis.gender) session.setGender(seed.diagnosis.gender);
              if (seed.diagnosis.hairGoal) session.setHairGoal(seed.diagnosis.hairGoal);
              Object.entries(seed.diagnosis.answers).forEach(([key, value]) => {
                session.setAnswer(key as keyof typeof seed.diagnosis.answers, value as never);
              });
              session.setAnalysis(seed.analysis);
              session.setReportId(seed.reportId);
              session.setProgram(seed.program);
              if (!auth.email && !auth.signUp('demo@roote.us', 'demo-demo-1').ok) {
                auth.signIn('demo@roote.us', 'demo-demo-1');
              }
            }}
            className="font-body text-sm text-muted-foreground underline"
          >
            {t('app.noProgram.devSeedCta')}
          </button>
        </div>
      );
    }
    return <Navigate to={withLocale('/')} replace />;
  }
  if (!auth.email) return <Navigate to={withLocale('/login')} replace />;

  // Checked out, but hasn't confirmed the package arrived yet — no real Day 1
  // to show, so the whole account app (sidebar, tabs, every route) is
  // replaced by one landing screen until they self-report delivery.
  if (session.program && !session.program.startDate) {
    return <AccountPreDelivery program={session.program} />;
  }

  // PO #24: "Prefer not to say" carries an explicit packaging preference instead
  const { gender, packagingPreference } = session.diagnosis;
  const pack =
    packagingPreference ?? (gender && gender !== 'unspecified' ? packagingFor(gender) : undefined);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-full px-3 py-2.5 font-body text-sm transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground',
    );

  // Mobile primary nav lives in a thumb-reach bottom bar, not a scroll strip
  // under the header (mobile-first pass, 2026-09-11) — floated as a rounded
  // pill, inset from the screen edges. Icon-only; the active tab expands into
  // an icon+label pill, the rest collapse to plain icon circles.

  function logout() {
    auth.signOut();
    navigate(withLocale('/'));
  }

  return (
    <div
      data-pack={pack}
      className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[248px_minmax(0,1fr)]"
    >
      {/* bg-cream-100, not bg-ink (taupe) — taupe is too close in value to
          the gold wordmark below for it to read; see brand/Wordmark.tsx. */}
      <aside className="sticky top-0 hidden h-screen flex-col border-e border-ink-foreground/15 bg-cream-100 px-4 py-6 text-ink-foreground lg:flex">
        <Wordmark className="w-24" />
        <nav aria-label={t('app.nav.label')} className="mt-8 flex flex-col gap-2">
          {TABS.map(([to, key]) => (
            <NavLink key={to} to={withLocale(to)} end={to === PATHS.account} className={navLinkClass}>
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-1 border-t border-ink-foreground/15 pt-4">
          {/* "Run a new hair analysis" now lives on Progress, "Shop products" on
              Profile (nav consolidation, 2026-09-11) — this row is just
              persistent chrome: Log out (text) at the start, language picker
              at the end. */}
          <button
            type="button"
            onClick={logout}
            className="rounded-full px-3 py-2 text-start font-body text-sm text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
          >
            {t('app.profile.logout')}
          </button>
          <div className="flex items-center gap-1 pe-1">
            <LanguagePicker
              compact
              locale={locale}
              onChange={setLocale}
              menuPosition="top"
              className="text-ink-foreground hover:text-ink-foreground"
            />
          </div>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 pb-24 lg:max-w-5xl lg:px-10 lg:py-10 xl:max-w-6xl">
        <RouteFade />
      </main>

      <nav
        aria-label={t('app.nav.label')}
        className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex items-center justify-between gap-1 rounded-full border border-ink-foreground/15 bg-white p-2 shadow-lg lg:hidden"
      >
        {TABS.map(([to, key, Icon]) => (
          <NavLink
            key={to}
            to={withLocale(to)}
            end={to === PATHS.account}
            aria-label={t(key)}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {({ isActive }) => (
              <span
                className={cn(
                  'flex h-10 items-center justify-center gap-2 rounded-full font-body text-sm font-medium transition-colors',
                  isActive ? 'bg-primary px-4 text-primary-foreground' : 'w-10 text-ink-foreground',
                )}
              >
                <Icon aria-hidden className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                {isActive ? <span aria-hidden className="whitespace-nowrap">{t(key)}</span> : null}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
