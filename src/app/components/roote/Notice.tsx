import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

/* --- LegalNotice ----------------------------------------------------------
   Inline callout for medical / legal disclaimers. While a draft is unapproved
   AND the build is dev, it is prefixed with a visible review marker. */
export function LegalNotice({
  children,
  reviewRequired = false,
  className,
}: {
  children: ReactNode;
  reviewRequired?: boolean;
  className?: string;
}) {
  const showMarker = reviewRequired && Boolean(import.meta.env?.DEV);
  return (
    <aside
      className={cn(
        'rounded-lg border border-border bg-cream-100 p-4 font-body text-xs leading-relaxed text-muted-foreground',
        className,
      )}
    >
      {showMarker ? (
        <span className="mb-1 block font-semibold uppercase tracking-wide text-warning">
          Legal review required — draft, not approved
        </span>
      ) : null}
      {children}
    </aside>
  );
}

/* --- ConsentPanel -------------------------------------------------------
   Reusable data / photo consent control (brief §26). A required checkbox plus
   an expandable "what this means" explanation. Controlled. */
export function ConsentPanel({
  checked,
  onChange,
  label,
  summary,
  details,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** short consent statement next to the checkbox */
  label: ReactNode;
  /** one-line reason shown under the label */
  summary: ReactNode;
  /** the "why we need photos / how used / retention / deletion" detail */
  details: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const detailId = useId();
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
        />
        <span className="min-w-0">
          <span className="block font-body text-sm text-foreground">{label}</span>
          <span className="mt-0.5 block font-body text-xs text-muted-foreground">{summary}</span>
        </span>
      </label>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailId}
        onClick={() => setOpen((v) => !v)}
        className="mt-3 font-body text-xs font-medium text-deep-800 underline underline-offset-4"
      >
        {open ? 'Hide details' : 'What this means'}
      </button>
      <div id={detailId} hidden={!open} className="mt-2 font-body text-xs leading-relaxed text-muted-foreground">
        {details}
      </div>
    </div>
  );
}
