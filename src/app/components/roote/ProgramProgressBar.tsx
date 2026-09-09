import { cn } from '@/app/components/ui/utils';

type Props = {
  currentDay: number;
  durationDays: number;
  /** localized "Day 0" / "Day {n}" formatter */
  dayLabel: (n: number) => string;
  /** optional checkpoint ticks along the track */
  checkpoints?: { day: number; done?: boolean }[];
  className?: string;
};

/**
 * The program timeline bar (spec §1): Day 0 ──●── Day N, with the current day
 * marked and any checkpoints ticked along the track.
 */
export function ProgramProgressBar({ currentDay, durationDays, dayLabel, checkpoints = [], className }: Props) {
  const pct = Math.max(0, Math.min(100, (currentDay / durationDays) * 100));
  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-2 w-full rounded-full bg-cream-200">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        {checkpoints.map((c) => (
          <span
            key={c.day}
            aria-hidden
            className={cn(
              'absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border',
              c.done ? 'border-accent bg-accent' : 'border-muted-foreground/40 bg-card',
            )}
            style={{ insetInlineStart: `${(c.day / durationDays) * 100}%` }}
          />
        ))}
        <span
          aria-hidden
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-deep-800 bg-cream-50 rtl:translate-x-1/2"
          style={{ insetInlineStart: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between font-body text-sm text-muted-foreground">
        <span>{dayLabel(0)}</span>
        <span className="font-medium text-foreground">{dayLabel(currentDay)}</span>
        <span>{dayLabel(durationDays)}</span>
      </div>
    </div>
  );
}
