import { Link } from 'react-router';
import { ShoppingBag } from 'lucide-react';
import { useLocalizedPath } from '@/i18n/LocaleProvider';
import { PATHS } from '@/app/paths';

/** Bag icon + count badge. Account-area only (sidebar / mobile app header) —
 *  not shown on marketing/landing pages. */
export function CartLink({ label, count }: { label: string; count: number }) {
  const withLocale = useLocalizedPath();
  return (
    <Link
      to={withLocale(PATHS.bag)}
      aria-label={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-foreground hover:bg-ink-foreground/10"
    >
      <ShoppingBag width={20} height={20} strokeWidth={1.5} aria-hidden />
      {count > 0 && (
        <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-sm font-semibold text-accent-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
