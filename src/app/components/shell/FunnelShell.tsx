import { Outlet } from 'react-router';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';

export function FunnelShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4">
        <Wordmark />
        <LocaleToggle />
      </header>
      <Outlet />
    </div>
  );
}
