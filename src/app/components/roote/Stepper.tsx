import { Check } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

export type Step = { id: string; label: string };

type Props = {
  steps: Step[];
  /** 0-based index of the active/in-progress step. Pass -1 when nothing is
   *  actively in progress (e.g. the whole sequence is finished) — combine
   *  with `doneThrough` so the completed steps still show as done. */
  current: number;
  /** How many leading steps show as done, independent of `current`. Defaults
   *  to `current` (the existing behavior: everything before the active step
   *  is done, nothing past it is). Set this explicitly when steps are done
   *  but none is actively "current" anymore — e.g. an order-success page,
   *  where every step up to Payment is complete and nothing is in progress. */
  doneThrough?: number;
  label: string;
  className?: string;
};

/**
 * Assessment progress rail. A genuine ordered sequence, so numbered markers are
 * appropriate here. Non-interactive — an indicator, not navigation.
 */
export function Stepper({ steps, current, doneThrough, label, className }: Props) {
  const doneUpTo = doneThrough ?? current;
  return (
    <ol aria-label={label} className={cn('flex items-center gap-2', className)}>
      {steps.map((step, i) => {
        const state = i < doneUpTo ? 'done' : i === current ? 'current' : 'upcoming';
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              aria-current={state === 'current' ? 'step' : undefined}
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-body text-sm font-semibold',
                state === 'done' && 'border-deep-800 bg-deep-800 text-cream-50',
                state === 'current' && 'border-deep-800 text-deep-900',
                state === 'upcoming' && 'border-border text-muted-foreground',
              )}
            >
              {state === 'done' ? <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden /> : i + 1}
            </span>
            <span
              className={cn(
                'hidden truncate font-body text-sm lg:block',
                state === 'current' ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden className={cn('h-px flex-1 lg:mx-1', i < doneUpTo ? 'bg-deep-800' : 'bg-border')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
