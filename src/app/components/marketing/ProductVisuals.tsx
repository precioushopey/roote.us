import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  ChevronRight,
  Clock,
  Droplet,
  Droplets,
  Hand,
  Moon,
  Pill,
  ShowerHead,
  Sparkles,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { useT } from '@/i18n/LocaleProvider';
import { useReducedMotion } from '@/app/lib/useReducedMotion';
import { cn } from '@/app/components/ui/utils';
import { getProduct } from '@/content/products';
import { LEVEL_SLUGS } from '@/content/levelComparison';
import { ROUTINE_LANES, SYSTEM_GROUPS, type GuideStep, type StepIcon } from '@/content/productGuides';
import { PRODUCT_PHOTOS } from '@/app/components/marketing/productPhotos';

/**
 * Visual explainers for the product pages and the /magazine learn hub: how-to-use
 * steps, hair-growth cycle, follicle comparison, pigment, outside/inside, daily
 * routine and the treatment/supportive/Gray system map. Illustrations are plain
 * inline SVG (theme colours via `currentColor`, `aria-hidden` — the adjacent text
 * carries the meaning). Every animation falls back to a static render under
 * `prefers-reduced-motion`. Layout uses logical utilities only (RTL-safe).
 *
 * Product slugs here are structure only; names are locale-invariant proper nouns
 * read from the catalogue, and all labels come from `marketing.learn.*` messages.
 */

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
}

const STEP_ICON: Record<StepIcon, LucideIcon> = {
  droplet: Droplet,
  hand: Hand,
  clock: Clock,
  pill: Pill,
  shower: ShowerHead,
  sparkles: Sparkles,
  glass: Droplets,
};

/** Numbered, icon-led "how to use it" steps. */
export function HowToUseSteps({ steps }: { steps: GuideStep[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((s, i) => {
        const Icon = STEP_ICON[s.icon];
        return (
          <li key={i}>
            <Reveal delay={i * 0.06} className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4">
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm text-primary-foreground"
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-2">
                <Icon aria-hidden className="h-5 w-5 text-primary" strokeWidth={1.75} />
                <p className="font-body text-sm text-foreground">{s.text}</p>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}

function CycleStage({ hair, club }: { hair: number; club?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 80"
      className="h-24 w-16 text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
    >
      <path d="M8 40h48" opacity={0.3} strokeWidth={2} />
      <circle cx="32" cy="64" r="9" />
      <path d={`M32 55V${55 - hair}`} />
      {club && <circle cx="32" cy={55 - hair} r="3" fill="currentColor" />}
    </svg>
  );
}

/** Growth → transition → rest, as three small follicle drawings. */
export function HairCycleDiagram() {
  const t = useT();
  const stages = [
    { label: t('marketing.learn.cycle.grow'), hair: 46 },
    { label: t('marketing.learn.cycle.transition'), hair: 30 },
    { label: t('marketing.learn.cycle.rest'), hair: 16, club: true },
  ];
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-6">
      {stages.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2 sm:gap-6">
          <Reveal delay={i * 0.12} className="flex flex-col items-center gap-1">
            <CycleStage hair={s.hair} club={s.club} />
            <span className="font-body text-sm text-foreground">{s.label}</span>
          </Reveal>
          {i < stages.length - 1 && (
            <ChevronRight aria-hidden className="h-5 w-5 text-muted-foreground rtl:rotate-180" />
          )}
        </div>
      ))}
    </div>
  );
}

function Follicle({ bulb, shaft, hair }: { bulb: number; shaft: number; hair: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 120"
      className="h-28 w-28 text-primary"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <path d="M4 44c14-6 28 6 42 0s28 6 42 0 22 4 28 2" opacity={0.35} strokeWidth={2} />
      <circle cx="60" cy={96 - bulb / 2} r={bulb} strokeWidth={2} />
      <path d={`M60 ${96 - bulb}V44`} strokeWidth={shaft} />
      <path d={`M60 44V${44 - hair}`} strokeWidth={shaft} />
    </svg>
  );
}

/** A healthy follicle next to one that shrinks over time (the DHT picture). */
export function FollicleCompare() {
  const t = useT();
  return (
    <div className="flex items-end justify-center gap-6 sm:gap-10">
      <div className="flex flex-col items-center gap-1 text-center">
        <Follicle bulb={20} shaft={7} hair={38} />
        <span className="font-body text-sm text-foreground">{t('marketing.learn.follicle.healthy')}</span>
      </div>
      <ChevronRight aria-hidden className="mb-10 h-5 w-5 text-muted-foreground rtl:rotate-180" />
      <div className="flex flex-col items-center gap-1 text-center">
        <Follicle bulb={10} shaft={3} hair={16} />
        <span className="font-body text-sm text-foreground">{t('marketing.learn.follicle.shrinking')}</span>
      </div>
    </div>
  );
}

function Pigment({ dots }: { dots: number }) {
  const spots = [
    [48, 78], [72, 78], [60, 66], [50, 58], [70, 58], [60, 88], [52, 70], [68, 70],
  ].slice(0, dots);
  return (
    <svg aria-hidden viewBox="0 0 120 120" className="h-24 w-24 text-primary" fill="none" stroke="currentColor" strokeLinecap="round">
      <path d="M4 40h112" opacity={0.35} strokeWidth={2} />
      <path d="M60 94V40M60 40V12" strokeWidth={5} opacity={dots > 3 ? 1 : 0.4} />
      <ellipse cx="60" cy="76" rx="22" ry="20" strokeWidth={2} />
      {spots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

/** Pigment-making cells at the follicle: plenty, then fewer over time. */
export function PigmentDiagram() {
  return (
    <div className="flex items-center justify-center gap-6">
      <Pigment dots={8} />
      <ChevronRight aria-hidden className="h-5 w-5 text-muted-foreground rtl:rotate-180" />
      <Pigment dots={2} />
    </div>
  );
}

function ProductThumb({ slug, className }: { slug: string; className?: string }) {
  const src = PRODUCT_PHOTOS[slug];
  const name = getProduct(slug)?.name ?? slug;
  if (!src) return null;
  return <img src={src} alt={name} loading="lazy" className={cn('aspect-square object-contain', className)} />;
}

/** Gray Serum (outside / topical) vs Gray Support (inside / nutritional). */
export function GrayInOutDiagram() {
  const t = useT();
  const items = [
    { slug: 'gray-serum', tag: t('marketing.learn.outside'), desc: t('marketing.learn.outsideDesc'), Icon: Droplet },
    { slug: 'gray-support', tag: t('marketing.learn.inside'), desc: t('marketing.learn.insideDesc'), Icon: Pill },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((it, i) => (
        <Reveal key={it.slug} delay={i * 0.1} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <ProductThumb slug={it.slug} className="h-24 w-24 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 font-display text-lg text-foreground">
              <it.Icon aria-hidden className="h-5 w-5 text-primary" strokeWidth={1.75} />
              {it.tag}
            </span>
            <span className="font-body text-sm text-muted-foreground">{getProduct(it.slug)?.name}</span>
            <span className="font-body text-sm text-muted-foreground">{it.desc}</span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

const LANE_ICON: Record<(typeof ROUTINE_LANES)[number]['id'], LucideIcon> = {
  morning: Sun,
  evening: Moon,
  anytime: Clock,
  washday: ShowerHead,
};

function isLevelGroup(slugs: string[]) {
  return slugs.length === LEVEL_SLUGS.length && slugs.every((s) => (LEVEL_SLUGS as readonly string[]).includes(s));
}

/** Morning / evening / any-time / wash-day lanes; with `highlight`, the lanes
 *  that don't include that product are dimmed. */
export function RoutineGraphic({ highlight }: { highlight?: string }) {
  const t = useT();
  const laneLabel = {
    morning: t('marketing.learn.routine.morning'),
    evening: t('marketing.learn.routine.evening'),
    anytime: t('marketing.learn.routine.anytime'),
    washday: t('marketing.learn.routine.washday'),
  };
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-xl text-foreground">{t('marketing.learn.routine.title')}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ROUTINE_LANES.map((lane, i) => {
          const Icon = LANE_ICON[lane.id];
          const dim = highlight !== undefined && !lane.slugs.includes(highlight);
          return (
            <Reveal
              key={lane.id}
              delay={i * 0.08}
              className={cn('flex flex-col gap-3 rounded-2xl border border-border bg-card p-4', dim && 'opacity-50')}
            >
              <span className="flex items-center gap-2 font-display text-lg text-foreground">
                <Icon aria-hidden className="h-5 w-5 text-primary" strokeWidth={1.75} />
                {laneLabel[lane.id]}
              </span>
              {isLevelGroup(lane.slugs) ? (
                <div className="flex flex-col gap-2">
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    {lane.slugs.map((s) => (
                      <ProductThumb key={s} slug={s} className="h-12 w-12 rounded-full border border-border bg-background" />
                    ))}
                  </div>
                  <span className="font-body text-sm text-muted-foreground">{t('marketing.learn.routine.yourLevel')}</span>
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {lane.slugs.map((s) => (
                    <li key={s} className="flex items-center gap-2">
                      <ProductThumb slug={s} className="h-12 w-12" />
                      <span className="font-body text-sm text-foreground">{getProduct(s)?.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

/** Which products are treatment, which are supportive, and the two-sided Gray
 *  system — so the roles are clear at a glance. */
export function SystemMap({ highlight }: { highlight?: string }) {
  const t = useT();
  const copy = {
    treatment: { title: t('marketing.learn.system.treatment'), body: t('marketing.learn.system.treatmentBody') },
    supportive: { title: t('marketing.learn.system.supportive'), body: t('marketing.learn.system.supportiveBody') },
    gray: { title: t('marketing.learn.system.gray'), body: t('marketing.learn.system.grayBody') },
  };
  const sideTag: Record<string, string> = {
    'gray-serum': t('marketing.learn.outside'),
    'gray-support': t('marketing.learn.inside'),
  };
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-xl text-foreground">{t('marketing.learn.system.title')}</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {SYSTEM_GROUPS.map((g, i) => {
          const dim = highlight !== undefined && !g.slugs.includes(highlight);
          return (
            <Reveal
              key={g.id}
              delay={i * 0.1}
              className={cn(
                'flex flex-col gap-3 rounded-2xl border bg-card p-5',
                g.id === 'treatment' ? 'border-deep-600' : 'border-border',
                dim && 'opacity-50',
              )}
            >
              <h4 className="font-display text-lg text-foreground">{copy[g.id].title}</h4>
              <p className="font-body text-sm text-muted-foreground">{copy[g.id].body}</p>
              <div className="mt-auto flex flex-wrap items-end gap-3">
                {g.slugs.map((s) => (
                  <figure key={s} className="flex w-20 flex-col items-center gap-1 text-center">
                    <ProductThumb slug={s} className="h-16 w-16" />
                    <figcaption className="font-body text-xs text-foreground">
                      {isLevelGroup(g.slugs) ? getProduct(s)?.name.replace('ROOTÉ ', '') : getProduct(s)?.name}
                      {sideTag[s] && g.id === 'gray' ? (
                        <span className="block text-muted-foreground">{sideTag[s]}</span>
                      ) : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
