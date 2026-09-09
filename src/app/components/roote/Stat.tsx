import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';
import { PendingChip } from '@/app/components/brand/PendingChip';

type Props = {
  label: string;
  /** Resolved value, or `null` when the client hasn't supplied it. */
  value: ReactNode | null;
  /** Shown as `[PENDING: pendingLabel]` when `value` is null. */
  pendingLabel?: string;
  hint?: string;
  onDark?: boolean;
  align?: 'start' | 'center';
  className?: string;
};

/**
 * A single figure. Deliberately quiet — label first, value in the display face
 * at a modest size. Not the giant-number-plus-gradient treatment.
 * Renders a [PENDING] chip instead of a fabricated value when `value` is null.
 */
export function Stat({ label, value, pendingLabel, hint, onDark = false, align = 'start', className }: Props) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      <p
        className={cn(
          'u-caps font-body text-sm font-semibold',
          onDark ? 'text-cream-100' : 'text-muted-foreground',
        )}
      >
        {label}
      </p>
      <div className={cn('mt-1.5 font-display text-xl', onDark ? 'text-cream-100' : 'text-foreground')}>
        {value === null ? <PendingChip label={pendingLabel ?? label} /> : value}
      </div>
      {hint ? (
        <p className={cn('mt-1 text-sm', onDark ? 'text-cream-100' : 'text-muted-foreground')}>{hint}</p>
      ) : null}
    </div>
  );
}
