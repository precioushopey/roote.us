import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

/* --- Timeline -------------------------------------------------------------
   Baseline → final scan milestones (Day 0 / 30 / 60 / 90 / 180). A genuine
   ordered sequence, so day markers are appropriate. */
export type TimelineMilestone = {
  id: string;
  dayLabel: string;
  title: string;
  caption?: string;
  state: 'done' | 'current' | 'upcoming';
  media?: ReactNode;
};

export function Timeline({ milestones, className }: { milestones: TimelineMilestone[]; className?: string }) {
  return (
    <ol className={cn('relative flex flex-col gap-6 ps-6', className)}>
      <span aria-hidden className="absolute inset-y-2 start-[7px] w-px bg-border" />
      {milestones.map((m) => (
        <li key={m.id} className="relative">
          <span
            aria-hidden
            className={cn(
              'absolute -start-6 top-1 h-3.5 w-3.5 rounded-full border-2',
              m.state === 'done' && 'border-deep-800 bg-deep-800',
              m.state === 'current' && 'border-deep-800 bg-cream-50',
              m.state === 'upcoming' && 'border-border bg-cream-50',
            )}
          />
          <p className="u-caps font-body text-2xs font-semibold text-muted-foreground">{m.dayLabel}</p>
          <p className="mt-0.5 font-body font-medium text-foreground">{m.title}</p>
          {m.caption ? <p className="font-body text-sm text-muted-foreground">{m.caption}</p> : null}
          {m.media ? <div className="mt-2">{m.media}</div> : null}
        </li>
      ))}
    </ol>
  );
}

/* --- TreatmentChecklist -----------------------------------------------
   Daily routine list. Presentational — the parent owns completion state. */
export type ChecklistTask = { key: string; name: string; detail?: string; done: boolean };

export function TreatmentChecklist({
  tasks,
  onToggle,
  className,
}: {
  tasks: ChecklistTask[];
  onToggle: (key: string) => void;
  className?: string;
}) {
  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {tasks.map((task) => (
        <li key={task.key}>
          <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => onToggle(task.key)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
            />
            <span className="min-w-0">
              <span
                className={cn(
                  'block font-body text-sm text-foreground',
                  task.done && 'text-muted-foreground line-through',
                )}
              >
                {task.name}
              </span>
              {task.detail ? (
                <span className="mt-0.5 block font-body text-xs text-muted-foreground">{task.detail}</span>
              ) : null}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}

/* --- ProgressPhotoCard ---------------------------------------------------
   One dated check-in photo cell (or an empty slot). */
export function ProgressPhotoCard({
  dateLabel,
  angleLabel,
  thumbUrl,
  emptyLabel,
}: {
  dateLabel: string;
  angleLabel: string;
  thumbUrl?: string;
  emptyLabel: string;
}) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-cream-100">
      <div className="aspect-square w-full">
        {thumbUrl ? (
          <img src={thumbUrl} alt={`${angleLabel} — ${dateLabel}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center font-body text-xs text-muted-foreground">
            {emptyLabel}
          </div>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-2 px-3 py-2 font-body text-2xs text-muted-foreground">
        <span>{angleLabel}</span>
        <span>{dateLabel}</span>
      </figcaption>
    </figure>
  );
}
