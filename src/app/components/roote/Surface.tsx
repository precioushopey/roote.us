import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/app/components/ui/utils';

type Radius = 'md' | 'lg' | 'xl' | '2xl';
// A single small, uniform corner radius everywhere — the Radius steps stay
// so callers don't need to change (they don't carry meaning any more, but
// removing them would ripple through every <Card radius="..."> call site
// for no benefit).
const R: Record<Radius, string> = {
  md: 'rounded-sm',
  lg: 'rounded-sm',
  xl: 'rounded-sm',
  '2xl': 'rounded-sm',
};

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  radius?: Radius;
  /** hairline border — off by default; opt in for a card that needs one */
  bordered?: boolean;
  /** soft raised shadow — use sparingly, only for a genuinely floating element */
  raised?: boolean;
  tone?: 'card' | 'cream' | 'teal';
  padded?: boolean;
};

const TONE: Record<NonNullable<CardProps['tone']>, string> = {
  card: 'bg-card text-card-foreground',
  cream: 'bg-cream-100 text-foreground',
  teal: 'bg-deep-950 text-cream-100',
};

/** Flat content surface. Most cards on the site are this — not glass. */
export function Card({
  children,
  radius = 'lg',
  bordered = false,
  raised = false,
  tone = 'card',
  padded = true,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        R[radius],
        TONE[tone],
        bordered && 'border border-border',
        raised && 'shadow-[0_16px_40px_-24px_rgba(6,46,49,0.35)]',
        padded && 'p-6',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  radius?: Radius;
  tone?: 'light' | 'dark';
  padded?: boolean;
};

/**
 * Solid, shadowed surface for a panel that needs to read as floating over
 * imagery or content (sticky nav, the assessment result card, modals) —
 * distinguished by elevation, not translucency. Do not use it as a default
 * card.
 */
export function GlassCard({
  children,
  radius = 'xl',
  tone = 'light',
  padded = true,
  className,
  ...rest
}: GlassCardProps) {
  return (
    <div
      className={cn(
        R[radius],
        tone === 'light' ? 'bg-white text-foreground' : 'bg-deep-950 text-cream-100',
        'shadow-[0_24px_60px_-32px_rgba(6,46,49,0.45)]',
        padded && 'p-6',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
