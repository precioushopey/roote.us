import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';
import { Eyebrow, DisplayTitle, Prose } from './Text';
import type { DisplayStep } from '@/app/components/marketing/displayScale';

export type SectionIntroProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  titleStep?: DisplayStep;
  body?: ReactNode;
  /** True when this sits on the teal/ink band — swaps the eyebrow/body to
   *  ink-foreground text instead of the cream-surface defaults. */
  onInk?: boolean;
  className?: string;
};

/**
 * A section's opening eyebrow + heading + optional body, stacked with the
 * site's standard gap. The most repeated block on marketing pages — use
 * this instead of hand-rolling the same `<Eyebrow>`/`<DisplayTitle>`/
 * `<Prose>` stack again.
 */
export function SectionIntro({ eyebrow, title, titleStep = 'lg', body, onInk = false, className }: SectionIntroProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {eyebrow ? <Eyebrow className={onInk ? 'text-ink-foreground' : undefined}>{eyebrow}</Eyebrow> : null}
      <DisplayTitle as="h2" step={titleStep}>
        {title}
      </DisplayTitle>
      {body ? <Prose className={onInk ? 'text-ink-foreground' : undefined}>{body}</Prose> : null}
    </div>
  );
}
