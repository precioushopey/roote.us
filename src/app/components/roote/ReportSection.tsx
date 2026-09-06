import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

/**
 * A titled block in the personalized report. Kept deliberately plain — the
 * report reads like an Apple Health summary / a medical report, not a marketing
 * page. One resolved model → a stack of these.
 */
export function ReportSection({
  index,
  title,
  children,
  className,
}: {
  /** 1-based section number for the report's running order */
  index?: number;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border-t border-border py-8 first:border-t-0', className)}>
      <div className="mb-4 flex items-baseline gap-3">
        {index != null ? (
          <span aria-hidden className="font-body text-sm text-accent">
            {String(index).padStart(2, '0')}
          </span>
        ) : null}
        <h2 className="font-display text-lg text-foreground">{title}</h2>
      </div>
      <div className="font-body text-sm leading-[1.65] text-muted-foreground">{children}</div>
    </section>
  );
}
