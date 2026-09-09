import { Link } from 'react-router';
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
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xs text-ink-foreground hover:bg-ink-foreground/10"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-sm font-semibold text-accent-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
