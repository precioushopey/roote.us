import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { GlassCard } from './Surface';

export type MetricLevel = 'low' | 'medium' | 'high' | null;

/* --- AnalysisMetric -------------------------------------------------
   One measured row: a label and a three-segment level indicator. A null level
   renders as [PENDING] — the analysis returns word-band levels, never invented
   percentages, until a real provider is wired. */
export function AnalysisMetric({
  label,
  level,
  onDark = false,
}: {
  label: string;
  level: MetricLevel;
  onDark?: boolean;
}) {
  const filled = level === 'low' ? 1 : level === 'medium' ? 2 : level === 'high' ? 3 : 0;
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className={cn('font-body text-sm', onDark ? 'text-cream-100/80' : 'text-muted-foreground')}>{label}</span>
      {level === null ? (
        <PendingChip label={label} />
      ) : (
        <span className="flex items-center gap-1" aria-label={level}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 w-6 rounded-full',
                i < filled ? 'bg-accent' : onDark ? 'bg-cream-100/20' : 'bg-border',
              )}
            />
          ))}
        </span>
      )}
    </div>
  );
}

/* --- ScanCard ------------------------------------------------------------
   The recurring "data as a surface" object: the assessment result shown as a
   calm translucent panel. Same object on the homepage teaser, in the report,
   and on the dashboard. Every value is optional → [PENDING]-safe. */
export function ScanCard({
  title,
  rows,
  footnote,
  tone = 'light',
  className,
}: {
  title: string;
  rows: Array<{ label: string; value: ReactNode | null; pendingLabel?: string }>;
  footnote?: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <GlassCard tone={tone} className={cn('w-full', className)}>
      <p
        className={cn(
          'u-caps font-body text-2xs font-semibold',
          tone === 'dark' ? 'text-cream-100/60' : 'text-muted-foreground',
        )}
      >
        {title}
      </p>
      <dl className="mt-3 divide-y divide-border/60">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className={cn('font-body text-sm', tone === 'dark' ? 'text-cream-100/80' : 'text-muted-foreground')}>
              {r.label}
            </dt>
            <dd className={cn('font-display text-md', tone === 'dark' ? 'text-cream-100' : 'text-foreground')}>
              {r.value === null ? <PendingChip label={r.pendingLabel ?? r.label} /> : r.value}
            </dd>
          </div>
        ))}
      </dl>
      {footnote ? (
        <p className={cn('mt-3 font-body text-xs', tone === 'dark' ? 'text-cream-100/55' : 'text-muted-foreground')}>
          {footnote}
        </p>
      ) : null}
    </GlassCard>
  );
}

/* --- ScanGuide -----------------------------------------------------------
   Framing silhouette for a guided photo angle. Decorative outline over the
   camera preview / example slot. */
export function ScanGuide({ angle, className }: { angle: 'front' | 'top' | 'crown' | 'hairline'; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={cn('text-deep-700/50', className)} fill="none">
      <rect x="4" y="4" width="112" height="112" rx="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" />
      {angle === 'front' && <ellipse cx="60" cy="58" rx="30" ry="38" stroke="currentColor" strokeWidth="1.5" />}
      {angle === 'top' && <path d="M30 78c6-34 54-34 60 0" stroke="currentColor" strokeWidth="1.5" />}
      {angle === 'crown' && <circle cx="60" cy="60" r="30" stroke="currentColor" strokeWidth="1.5" />}
      {angle === 'hairline' && <path d="M28 46c10-14 54-14 64 0" stroke="currentColor" strokeWidth="1.5" />}
    </svg>
  );
}
