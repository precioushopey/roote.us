import { cn } from '@/app/components/ui/utils';

export type Step = { id: string; label: string };

type Props = {
  steps: Step[];
  /** 0-based index of the active step */
  current: number;
  label: string;
  className?: string;
};

/**
 * Assessment progress rail. A genuine ordered sequence, so numbered markers are
 * appropriate here. Non-interactive — an indicator, not navigation.
 */
export function Stepper({ steps, current, label, className }: Props) {
  return (
    <ol aria-label={label} className={cn('flex items-center gap-2', className)}>
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              aria-current={state === 'current' ? 'step' : undefined}
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-body text-2xs font-semibold',
                state === 'done' && 'border-deep-800 bg-deep-800 text-cream-50',
                state === 'current' && 'border-deep-800 text-deep-900',
                state === 'upcoming' && 'border-border text-muted-foreground',
              )}
            >
              {state === 'done' ? (
                <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden fill="none">
                  <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span
              className={cn(
                'hidden truncate font-body text-xs sm:block',
                state === 'current' ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden className={cn('h-px flex-1 sm:mx-1', i < current ? 'bg-deep-800' : 'bg-border')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
