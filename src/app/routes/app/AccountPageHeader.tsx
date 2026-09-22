import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { Bell } from 'lucide-react';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { DisplayTitle } from '@/app/components/roote';
import { useUpcomingReminders } from './useUpcomingReminders';

/**
 * The sticky mobile header shared by every `/account/*` page — a small
 * nav-label eyebrow (omit on a sub-page with no matching nav tab, e.g.
 * Reminders), the page's own title, and a reminders bell. Replaces the old
 * generic wordmark/cart/logout bar (2026-09-14); on `lg` it drops the bar
 * styling and renders as plain page content, since the sidebar covers that
 * role there.
 */
export function AccountPageHeader({ eyebrow, title }: { eyebrow?: string; title: ReactNode }) {
  const t = useT();
  const withLocale = useLocalizedPath();
  const { pathname } = useLocation();
  const remindersCount = useUpcomingReminders().length;
  const remindersHref = withLocale('/account/reminders');
  const onRemindersPage = pathname === remindersHref;

  return (
    <header className="-mx-6 -mt-8 sticky top-0 z-40 flex items-start justify-between gap-4 border-b border-ink-foreground/15 bg-white px-6 py-3 lg:static lg:mx-0 lg:mt-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
      <div className="flex flex-col gap-1">
        {eyebrow && <p className="u-caps font-body text-xs font-semibold text-accent">{eyebrow}</p>}
        <DisplayTitle as="h1" step="sm">
          {title}
        </DisplayTitle>
      </div>
      {!onRemindersPage && (
        <Link
          to={remindersHref}
          aria-label={t('app.reminders.manage')}
          className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-cream-100"
        >
          <Bell aria-hidden width={20} height={20} strokeWidth={1.5} />
          {remindersCount > 0 && (
            <span
              aria-hidden
              className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-sm font-semibold text-accent-foreground"
            >
              {remindersCount}
            </span>
          )}
        </Link>
      )}
    </header>
  );
}
