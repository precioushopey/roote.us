import { cn } from '@/app/components/ui/utils';

export function ProgressRail({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="progress">
      {steps.map((label, i) => (
        <li
          key={label}
          aria-current={i === current ? 'step' : undefined}
          className={cn(
            'flex-1 rounded-full px-2 py-1 text-center text-[11px] tracking-wide',
            i === current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
          )}
        >
          {label}
        </li>
      ))}
    </ol>
  );
}
