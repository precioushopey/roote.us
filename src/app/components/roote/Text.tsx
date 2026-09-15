import { forwardRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
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
        'u-caps font-body text-sm font-medium',
        onDark ? 'text-cream-100' : 'text-muted-foreground',
        className,
      )}
    >
      {children}
    </p>
  );
}

/* --- DisplayTitle ----------------------------------------------------
   Lusitana display heading (`.display-heading` → `font-family:
   var(--font-display)`, same var every other `.font-display` element uses —
   no separate hardcoded family here; the class is named `display-heading`,
   not `text-display`, because `cn()`'s tailwind-merge pass otherwise reads
   `text-display` as a `text-{color}` utility conflicting with the
   `text-foreground`/`text-cream-100` class right after it, silently
   dropping it). Optional decorative "ghost" continuation word (aria-hidden).
   `fontSize` multiplies the step's clamp() by the `--roote-title-fit` custom
   property (default 1, untouched unless a caller attaches `useFitTitle`'s
   ref) so a shrink-to-fit hook can claw back a line for longer translations
   without fighting React's style diffing. */
export const DisplayTitle = forwardRef<
  HTMLHeadingElement,
  {
    children: ReactNode;
    as?: 'h1' | 'h2' | 'h3';
    step?: DisplayStep;
    ghost?: string;
    onDark?: boolean;
    align?: 'start' | 'center' | 'end';
    className?: string;
  }
>(function DisplayTitle(
  { children, as: Tag = 'h2', step = 'lg', ghost, onDark = false, align = 'start', className },
  ref,
) {
  return (
    <Tag
      ref={ref}
      style={{ fontSize: `calc(${displayClamp[step]} * var(--roote-title-fit, 1))` }}
      className={cn(
        'display-heading text-balance',
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
});

/* --- Prose --------------------------------------------------------------
   Body copy. Measure held under ~72 characters. */
export function Prose({
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
        'font-body font-regular text-sm sm:text-base md:text-lg',
        onDark ? 'text-cream-100' : 'text-muted-foreground',
        className,
      )}
    >
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
  // In-page anchors go through a plain <a> too — react-router's <Link> intercepts
  // the click and navigates via the History API instead of letting the browser
  // scroll to the target id, so a hash-only `to` would silently do nothing.
  const isHash = to.startsWith('#');
  const classes = cn(
    'group inline-flex items-center gap-2 font-body font-regular text-sm sm:text-base md:text-lg underline decoration-1 underline-offset-4',
    onDark
      ? 'text-cream-100 decoration-cream-100/40 hover:decoration-cream-100'
      : 'text-foreground decoration-border hover:decoration-deep-700',
    className,
  );
  const arrow = withArrow ? (
    <ArrowRight aria-hidden strokeWidth={1.6} className="h-3.5 w-3.5 rtl:-scale-x-100" />
  ) : null;

  if (external || isHash) {
    return (
      <a href={to} {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})} className={classes}>
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
