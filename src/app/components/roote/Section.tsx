import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

type Tone = 'cream' | 'plain' | 'teal' | 'grid';
type Width = 'marketing' | 'content' | 'readable';

const TONE: Record<Tone, string> = {
  cream: 'bg-background text-foreground',
  plain: 'bg-card text-foreground',
  teal: 'bg-ink text-ink-foreground',
  grid: 'bg-background text-foreground',
};

const WIDTH: Record<Width, string> = {
  marketing: 'max-w-[80rem]',
  content: 'max-w-[72.5rem]',
  readable: 'max-w-[45rem]',
};

type Props = {
  children: ReactNode;
  id?: string;
  tone?: Tone;
  width?: Width;
  /** vertical rhythm; `tight` for stacked sections, `flush` to remove top pad */
  space?: 'default' | 'tight' | 'flush';
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
  space = 'default',
  animate = true,
  className,
  innerClassName,
}: Props) {
  const pad =
    space === 'flush'
      ? 'pb-20 md:pb-28'
      : space === 'tight'
        ? 'py-12 md:py-16'
        : tone === 'teal'
          ? 'py-24 md:py-32'
          : 'py-20 md:py-28';
  return (
    <section
      id={id}
      data-animate={animate ? 'section' : undefined}
      className={cn(TONE[tone], pad, className)}
    >
      <div className={cn('mx-auto px-6 md:px-10', WIDTH[width], innerClassName)}>{children}</div>
    </section>
  );
}
