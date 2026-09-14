import { Link, Outlet } from 'react-router';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LanguagePicker } from '@/app/components/roote';
import { useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useRevealOnRoute } from '@/app/lib/useRevealOnRoute';

export function FunnelShell() {
  useRevealOnRoute();
  const withLocale = useLocalizedPath();
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to={withLocale('/')} aria-label="ROOTÉ">
            <Wordmark className="w-28" />
          </Link>
          <LanguagePicker compact locale={locale} onChange={setLocale} />
        </div>
      </header>
      <Outlet />
    </div>
  );
}
