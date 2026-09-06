import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/app/components/ui/utils';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { StrandMark } from './StrandMark';
import { Badge } from './Badge';
import { MediaPlaceholder } from '@/app/components/media/MediaPlaceholder';

/* --- ConcernCard -----------------------------------------------------
   "What would you like to understand?" — thinning / gray / both. Routes into
   the assessment. */
export function ConcernCard({
  title,
  description,
  to,
  cta,
  mediaAlt,
  mediaLabel,
}: {
  title: string;
  description: string;
  to: string;
  cta: string;
  mediaAlt: string;
  mediaLabel: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-deep-700"
    >
      <MediaPlaceholder alt={mediaAlt} label={mediaLabel} ratio="4 / 3" rounded="none" />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg text-foreground">{title}</h3>
        <p className="font-body text-sm text-muted-foreground">{description}</p>
        <span className="mt-auto pt-3 font-body text-sm font-medium text-deep-800 underline decoration-1 underline-offset-4">
          {cta}
        </span>
      </div>
    </Link>
  );
}

/* --- ProductCard ---------------------------------------------------------
   A product summary. `packaging` themes the media strip (men = dark teal,
   women = cream) — presentation only. Price shows a [PENDING] chip until
   supplied. */
export function ProductCard({
  name,
  subtitle,
  to,
  priceLabel,
  packaging = 'women',
  reviewRequired = false,
  mediaAlt,
  mediaLabel,
}: {
  name: string;
  subtitle: string;
  to: string;
  /** resolved price string, or null → [PENDING] */
  priceLabel: string | null;
  packaging?: 'men' | 'women';
  reviewRequired?: boolean;
  mediaAlt: string;
  mediaLabel: string;
}) {
  return (
    <Link
      to={to}
      data-pack={packaging}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-deep-700"
    >
      <MediaPlaceholder
        alt={mediaAlt}
        label={mediaLabel}
        ratio="1"
        rounded="none"
        tone={packaging === 'men' ? 'teal' : 'cream'}
      />
      <div className="flex flex-1 flex-col gap-1 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-md text-foreground">{name}</h3>
          {reviewRequired ? <Badge tone="review">Review</Badge> : null}
        </div>
        <p className="font-body text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-3 font-body text-sm text-foreground">
          {priceLabel === null ? <PendingChip label="price" /> : priceLabel}
        </div>
      </div>
    </Link>
  );
}

/* --- ProgramCard ------------------------------------------------------
   A duration option on the program page. `tier` drives the ribbon label. */
export function ProgramCard({
  durationLabel,
  tierLabel,
  emphasised = false,
  priceLabel,
  perDayLabel,
  includes,
  selected = false,
  onSelect,
  selectLabel,
}: {
  durationLabel: string;
  tierLabel?: string;
  emphasised?: boolean;
  priceLabel: string | null;
  perDayLabel: string | null;
  includes: string[];
  selected?: boolean;
  onSelect?: () => void;
  selectLabel: string;
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border bg-card p-6',
        selected ? 'border-deep-800 ring-1 ring-deep-800' : emphasised ? 'border-deep-700' : 'border-border',
      )}
    >
      {tierLabel ? (
        <span className="absolute -top-3 start-6 rounded-full bg-deep-950 px-3 py-1 font-body text-2xs font-semibold uppercase tracking-wide text-cream-100">
          {tierLabel}
        </span>
      ) : null}
      <p className="font-display text-xl text-foreground">{durationLabel}</p>
      <div className="mt-2 font-body text-sm text-foreground">
        {priceLabel === null ? <PendingChip label="program price" /> : priceLabel}
      </div>
      <div className="mt-1 font-body text-xs text-muted-foreground">
        {perDayLabel === null ? <PendingChip label="per day" /> : perDayLabel}
      </div>
      <ul className="mt-4 flex flex-col gap-1.5 font-body text-sm text-muted-foreground">
        {includes.map((line) => (
          <li key={line} className="flex items-start gap-2">
            <StrandMark size={14} className="mt-0.5 text-accent" />
            {line}
          </li>
        ))}
      </ul>
      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={cn(
            'mt-6 h-11 rounded-full font-body text-sm font-medium transition-colors',
            selected ? 'bg-deep-950 text-cream-100' : 'border border-border text-foreground hover:border-deep-700',
          )}
        >
          {selectLabel}
        </button>
      ) : null}
    </div>
  );
}

/* --- IngredientCard --------------------------------------------------
   Name + short purpose + optional "Read more". Claim-status aware: a
   `requires-review` note renders as a pending chip, never as plain copy. */
export function IngredientCard({
  name,
  note,
  status = 'working',
  onReadMore,
  readMoreLabel = 'Read more',
}: {
  name: string;
  note: ReactNode;
  status?: 'approved' | 'working' | 'requires-review';
  onReadMore?: () => void;
  readMoreLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="font-display text-md text-foreground">{name}</p>
      <div className="mt-1 font-body text-sm text-muted-foreground">
        {status === 'requires-review' ? <PendingChip label={`${name} — claim`} /> : note}
      </div>
      {onReadMore ? (
        <button
          type="button"
          onClick={onReadMore}
          className="mt-3 font-body text-xs font-medium text-deep-800 underline underline-offset-4"
        >
          {readMoreLabel}
        </button>
      ) : null}
    </div>
  );
}
