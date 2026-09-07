import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/app/components/ui/utils';
import { displayClamp, type DisplayStep } from '@/app/components/marketing/displayScale';

/* --- Eyebrow -----------------------------------------------------------
   Small context label above a section. i18n-safe caps via `.u-caps`
   (no-op under he/ar). Use only where it encodes real section context —
   not above every heading. */
export function Eyebrow({
  children,
  onDark = false,
  className,
}: {
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'u-caps font-body text-2xs font-semibold',
        onDark ? 'text-cream-100/70' : 'text-muted-foreground',
        className,
      )}
    >
      {children}
    </p>
  );
}

/* --- DisplayTitle ----------------------------------------------------
   Frank Ruhl Libre display heading. Optional decorative "ghost" continuation
   word (aria-hidden). */
export function DisplayTitle({
  children,
  as: Tag = 'h2',
  step = 'lg',
  ghost,
  onDark = false,
  align = 'start',
  className,
}: {
  children: string;
  as?: 'h1' | 'h2' | 'h3';
  step?: DisplayStep;
  ghost?: string;
  onDark?: boolean;
  align?: 'start' | 'center' | 'end';
  className?: string;
}) {
  return (
    <Tag
      style={{ fontSize: displayClamp[step], fontFamily: "'Frank Ruhl Libre', serif" }}
      className={cn(
        'text-display text-balance',
        onDark ? 'text-cream-100' : 'text-foreground',
        align === 'center' && 'text-center',
        align === 'end' && 'text-end',
        className,
      )}
    >
      {children}
      {ghost ? (
        <span aria-hidden="true" className={onDark ? 'text-ink-ghost' : 'text-accent-ghost'}>
          {' '}
          {ghost}
        </span>
      ) : null}
    </Tag>
  );
}

/* --- Prose --------------------------------------------------------------
   Body copy. Measure held under ~72 characters. */
export function Prose({
  children,
  size = 'md',
  onDark = false,
  className,
}: {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  onDark?: boolean;
  className?: string;
}) {
  const s = {
    sm: 'text-sm leading-relaxed',
    md: 'text-[0.9375rem] leading-[1.65]',
    lg: 'text-md leading-[1.7]',
  }[size];
  return (
    <p className={cn('font-body max-w-[62ch]', s, onDark ? 'text-cream-100/85' : 'text-muted-foreground', className)}>
      {children}
    </p>
  );
}

/* --- TextLink ---------------------------------------------------------
   Inline navigational link with an underline that thickens on hover.
   No trailing arrow by default (the arrow-suffix is a generated-page tell). */
export function TextLink({
  to,
  children,
  onDark = false,
  withArrow = false,
  className,
}: {
  to: string;
  children: ReactNode;
  onDark?: boolean;
  withArrow?: boolean;
  className?: string;
}) {
  const external = /^https?:\/\//.test(to);
  const classes = cn(
    'group inline-flex items-center gap-1.5 font-body text-sm underline decoration-1 underline-offset-4',
    onDark
      ? 'text-cream-100 decoration-cream-100/40 hover:decoration-cream-100'
      : 'text-foreground decoration-border hover:decoration-deep-700',
    className,
  );
  const arrow = withArrow ? (
    <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5 rtl:-scale-x-100" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : null;

  if (external) {
    return (
      <a href={to} rel="noopener noreferrer" target="_blank" className={classes}>
        {children}
        {arrow}
      </a>
    );
  }
  return (
    <Link to={to} className={classes}>
      {children}
      {arrow}
    </Link>
  );
}
