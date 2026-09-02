import { Link, Outlet } from 'react-router';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';
import { useRevealOnRoute } from '@/app/lib/useRevealOnRoute';

export function FunnelShell() {
  useRevealOnRoute();
  return (
    <div className="flex min-h-screen flex-col bg-grid-lines bg-background font-body text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" aria-label="ROOTÉ">
            <Wordmark className="w-28" />
          </Link>
          <LocaleToggle />
        </div>
      </header>
      <Outlet />
    </div>
  );
}
