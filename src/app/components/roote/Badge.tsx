import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

export type BadgeTone = 'neutral' | 'teal' | 'gold' | 'success' | 'warning' | 'info' | 'review';

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-cream-200 text-foreground',
  teal: 'bg-deep-950 text-cream-100',
  gold: 'bg-transparent text-foreground ring-1 ring-accent',
  success: 'bg-[color-mix(in_srgb,var(--success)_16%,transparent)] text-[color-mix(in_srgb,var(--success)_82%,#000)]',
  warning: 'bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[color-mix(in_srgb,var(--warning)_82%,#000)]',
  info: 'bg-[color-mix(in_srgb,var(--info)_16%,transparent)] text-deep-900',
  review: 'bg-transparent text-foreground ring-1 ring-dashed ring-accent',
};

/** A small status marker. `review` is the "needs medical / legal review" flavour.
 *  Every tone's text color assumes a light background. `onDark` is unused since
 *  the 2026-09-08 retint dropped the site's dark "anchor" surfaces — kept in
 *  case a future dark surface needs it. */
export function Badge({
  children,
  tone = 'neutral',
  onDark = false,
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-sm font-semibold',
        TONE[tone],
        onDark && 'text-cream-100',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A neutral, non-status chip — filters, tags, ingredient names. */
export function Pill({
  children,
  active = false,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 font-body text-sm',
        active ? 'border-deep-800 bg-deep-950 text-cream-100' : 'border-border bg-transparent text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}
