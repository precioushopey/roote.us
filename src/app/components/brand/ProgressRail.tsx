import { useT } from '@/i18n/LocaleProvider';
import { cn } from '@/app/components/ui/utils';

export function ProgressRail({ steps, current }: { steps: string[]; current: number }) {
  const t = useT();
  return (
    <ol className="flex items-center gap-3" aria-label={t('common.progressLabel')}>
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
        return (
          <li key={label} className="flex flex-1 flex-col gap-1.5">
            <span
              aria-hidden
              className={cn(
                'h-1 rounded-full transition-colors',
                state === 'upcoming' ? 'bg-border' : 'bg-accent',
              )}
            />
            <span
              aria-current={state === 'current' ? 'step' : undefined}
              className={cn(
                'text-[11px] tracking-[0.12em]',
                state === 'current' ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
