import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/app/components/ui/utils';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { Badge, type BadgeTone } from './Badge';
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
  image,
}: {
  title: string;
  description: string;
  to: string;
  cta: string;
  mediaAlt: string;
  mediaLabel: string;
  /** Real photography. Falls back to the placeholder when omitted. */
  image?: string;
}) {
  return (
    <Link to={to} className="group flex flex-col items-center gap-4 text-center">
      {image ? (
        <img
          src={image}
          alt={mediaAlt}
          className="aspect-[3/4] w-full border border-gold-500 object-cover [border-radius:50%_50%_0_0/10rem_10rem_0_0]"
        />
      ) : (
        <MediaPlaceholder
          alt={mediaAlt}
          label={mediaLabel}
          ratio="3 / 4"
          rounded="none"
          className="w-full border border-gold-500 [border-radius:50%_50%_0_0/10rem_10rem_0_0]"
        />
      )}
      <div className="flex flex-col gap-2">
        <h3 className="u-caps font-body text-sm text-foreground">{title}</h3>
        <p className="font-body text-sm text-muted-foreground">{description}</p>
        <span className="mt-1 font-body text-sm font-medium text-deep-800 underline decoration-1 underline-offset-4">
          {cta}
        </span>
      </div>
    </Link>
  );
}

/* --- ProductCard ---------------------------------------------------------
   A product summary. Same arch-framed-image + plain-caption layout as the
   Home page Density System spotlight — no card border/background, just the
   gold-bordered arch image and centered text. `packaging` themes the
   placeholder media only (men = dark teal, women = cream) — presentation
   only. Price shows a [PENDING] chip until supplied. */
export function ProductCard({
  name,
  subtitle,
  to,
  priceLabel,
  packaging = 'women',
  reviewRequired = false,
  mediaAlt,
  mediaLabel,
  image,
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
  /** Real product photography. Falls back to the placeholder when omitted. */
  image?: string;
}) {
  return (
    <Link to={to} data-pack={packaging} className="group flex flex-col items-center gap-4 text-center">
      {image ? (
        <div className="aspect-[3/4] w-full border border-gold-500 bg-white p-4 [border-radius:50%_50%_0_0/10rem_10rem_0_0]">
          <img src={image} alt={mediaAlt} className="h-full w-full object-contain" />
        </div>
      ) : (
        <MediaPlaceholder
          alt={mediaAlt}
          label={mediaLabel}
          ratio="3 / 4"
          rounded="none"
          tone={packaging === 'men' ? 'teal' : 'cream'}
          className="w-full border border-gold-500 [border-radius:50%_50%_0_0/10rem_10rem_0_0]"
        />
      )}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-md text-foreground">{name}</h3>
          {reviewRequired ? <Badge tone="review">Review</Badge> : null}
        </div>
        <p className="font-body text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-1 font-body text-sm text-foreground">
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
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
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
const STATUS_BADGE_TONE: Record<'approved' | 'working' | 'requires-review', BadgeTone> = {
  approved: 'success',
  working: 'info',
  'requires-review': 'review',
};

export function IngredientCard({
  name,
  note,
  status = 'working',
  statusLabel,
  onReadMore,
  readMoreLabel = 'Read more',
}: {
  name: string;
  note: ReactNode;
  status?: 'approved' | 'working' | 'requires-review';
  /** Visible label for the evidence-status badge. Omit to hide the badge. */
  statusLabel?: string;
  onReadMore?: () => void;
  readMoreLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-md text-foreground">{name}</p>
        {statusLabel ? <Badge tone={STATUS_BADGE_TONE[status]}>{statusLabel}</Badge> : null}
      </div>
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
