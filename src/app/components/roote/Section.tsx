import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

type Tone = 'cream' | 'plain' | 'teal' | 'grid';
type Width = 'content' | 'readable';

const TONE: Record<Tone, string> = {
  cream: 'bg-background text-foreground',
  plain: 'bg-card text-foreground',
  teal: 'bg-ink text-ink-foreground',
  grid: 'bg-background text-foreground',
};

const WIDTH: Record<Width, string> = {
  content: 'max-w-[80rem]',
  readable: 'max-w-[45rem]',
};

/** Vertical rhythm between the section's own direct children — replaces
 *  hand-placed `mt-*` on each child. Only steps on the site's gap scale
 *  (gap-2, then multiples of 4) are offered. */
type Gap = 2 | 4 | 8 | 12 | 16 | 20;

const GAP: Record<Gap, string> = {
  2: 'gap-2',
  4: 'gap-4',
  8: 'gap-8',
  12: 'gap-12',
  16: 'gap-16',
  20: 'gap-20',
};

type Props = {
  children: ReactNode;
  id?: string;
  tone?: Tone;
  width?: Width;
  /** Gap between the section's own direct children (a flex column) — default
   *  4 matches the most common eyebrow/title/body rhythm. A section whose
   *  content is a single child (its own grid/flex block) is unaffected. */
  gap?: Gap;
  animate?: boolean;
  className?: string;
  innerClassName?: string;
};

/** Full-bleed band + centered measure. The building block of every page. */
export function Section({
  children,
  id,
  tone = 'cream',
  width = 'content',
  gap = 4,
  animate = true,
  className,
  innerClassName,
}: Props) {
  return (
    <section id={id} className={cn(TONE[tone], 'py-24', className)}>
      {/* data-animate sits on the inner wrapper, not the section itself — the
          section's own background must render solid and instant (no fade),
          only the content inside it rises up. Fading the section would fade
          its background too, showing the page's plain background through a
          colored band (e.g. teal) for a beat — a real, visible glitch on
          route change, not just a subtlety. */}
      <div
        data-animate={animate ? 'section' : undefined}
        className={cn('mx-auto flex flex-col px-6 md:px-12', WIDTH[width], GAP[gap], innerClassName)}
      >
        {children}
      </div>
    </section>
  );
}
