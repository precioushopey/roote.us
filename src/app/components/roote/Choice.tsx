import { useId, type ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

/* --- RadioCard ------------------------------------------------------------
   A large selectable card wrapping a visually-hidden radio input. Used for
   the gender step, concern step, one-per-screen answers, and plan durations.
   Styling keys off `:checked` via `has-[]` so there is no JS state here. */
export function RadioCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  aside,
  disabled = false,
  className,
}: {
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        'group relative flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-card p-5 text-start transition-colors',
        'hover:border-deep-700 has-[:checked]:border-deep-800 has-[:checked]:bg-cream-100',
        'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border peer-checked:border-deep-800 peer-checked:bg-deep-800"
      >
        <span className="h-2 w-2 rounded-full bg-cream-50 opacity-0 peer-checked:opacity-100" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-body font-medium text-foreground">{title}</span>
        {description ? (
          <span className="mt-1 block font-body text-sm text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {aside ? <span className="shrink-0">{aside}</span> : null}
    </label>
  );
}

/* --- SegmentedControl --------------------------------------------------
   A compact radio group rendered as a pill bar. For 2–4 mutually exclusive
   options (before/after view mode, short duration switch). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Array<{ value: T; label: ReactNode }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex rounded-full border border-border bg-cream-100 p-1', className)}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-full px-4 py-1.5 font-body text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected ? 'bg-deep-950 text-cream-100' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
