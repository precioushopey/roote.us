import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  SectionIntro,
  SegmentedControl,
  Accordion,
  Button,
  PendingChip,
  MediaPlaceholder,
} from '@/app/components/roote';
import { INGREDIENT_PHOTOS } from '@/app/components/roote/ingredientPhotos';
import { SnippetIllustration } from '@/app/components/marketing/SnippetIllustration';
import { useReducedMotion } from '@/app/lib/useReducedMotion';
import { cn } from '@/app/components/ui/utils';
import { PATHS } from '@/app/paths';
import { isPending } from '@/content/pending';
import {
  LEVEL_SLUGS,
  buildLevelComparison,
  type LevelColumn,
  type LevelComparisonModel,
  type LevelSlug,
  type Meter as MeterModel,
} from '@/content/levelComparison';
import level6 from '@/assets/products/Level 6.png';
import level10 from '@/assets/products/Level 10.png';
import level15 from '@/assets/products/Level 15.png';

const LEVEL_PHOTOS: Record<LevelSlug, string> = {
  'density-6': level6,
  'density-10': level10,
  'density-15': level15,
};

/** A single ingredient's strength bar. Fills once on scroll-in; with
 *  `prefers-reduced-motion` it renders already filled. */
function Meter({ label, meter }: { label: string; meter: MeterModel }) {
  const t = useT();
  const reduced = useReducedMotion();
  const value = meter.value;
  const pending = isPending(value);
  const width = `${Math.round(meter.fill * 100)}%`;
  const aria = pending ? label : t('marketing.levels.meterAria', { label, value: String(value) });
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-body text-sm text-muted-foreground">{label}</span>
        <span className="font-display text-xl text-foreground">
          {pending ? <PendingChip label={value.label} /> : `${value}%`}
        </span>
      </div>
      <div role="img" aria-label={aria} className="h-2 w-full overflow-hidden rounded-full bg-border">
        {reduced ? (
          <div className="h-full rounded-full bg-primary" style={{ width }} />
        ) : (
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            whileInView={{ width }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
      </div>
    </div>
  );
}

function Column({ col, current, visible }: { col: LevelColumn; current: boolean; visible: boolean }) {
  const t = useT();
  return (
    <article
      aria-label={col.name}
      className={cn(
        'flex-col gap-6 rounded-2xl border bg-card p-6',
        current ? 'border-deep-600' : 'border-border',
        visible ? 'flex' : 'hidden md:flex',
      )}
    >
      <img
        src={LEVEL_PHOTOS[col.slug]}
        alt={t('common.packagingAlt', { name: col.name })}
        className="mx-auto aspect-square w-full max-w-[14rem] object-contain"
      />
      <header className="flex flex-col gap-1">
        <h3 className="font-display text-2xl text-foreground">{col.name}</h3>
        <p className="font-body text-base text-muted-foreground">{col.tagline}</p>
        {current && (
          <span className="mt-1 w-fit rounded-full border border-deep-600 px-3 py-0.5 font-body text-xs text-deep-900">
            {t('marketing.levels.thisLevel')}
          </span>
        )}
      </header>
      <Meter label={t('marketing.levels.minoxidilLabel')} meter={col.minoxidil} />
      <Meter label={t('marketing.levels.finasterideLabel')} meter={col.finasteride} />
      <div className="flex flex-col gap-3">
        <h4 className="font-body text-sm text-muted-foreground">{t('marketing.levels.extrasLabel')}</h4>
        {col.extras.length === 0 ? (
          <p className="font-body text-sm text-foreground">{t('marketing.levels.noExtras')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {col.extras.map((x) => (
              <li key={x.name} className="flex items-start gap-3">
                {INGREDIENT_PHOTOS[x.name] && (
                  <img
                    src={INGREDIENT_PHOTOS[x.name]}
                    alt=""
                    aria-hidden
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                )}
                <div className="flex flex-col">
                  <span className="font-body text-sm text-foreground">
                    {x.name}{' '}
                    {isPending(x.strength) ? <PendingChip label={x.strength.label} /> : x.strength}
                  </span>
                  <span className="font-body text-sm text-muted-foreground">{x.note}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-auto rounded-xl bg-cream-100 p-4">
        <h4 className="font-body text-xs uppercase tracking-wide text-muted-foreground">
          {t('marketing.levels.suitsLabel')}
        </h4>
        <p className="mt-1 font-body text-sm text-foreground">{col.suits}</p>
      </div>
    </article>
  );
}

/** Presentational: renders a resolved `LevelComparisonModel`. No config / domain
 *  copy lookups here — the model is already localized and pending-flagged. */
export function LevelComparison({ model, highlight }: { model: LevelComparisonModel; highlight?: LevelSlug }) {
  const t = useT();
  const withLocale = useLocalizedPath();
  const [active, setActive] = useState<LevelSlug>(highlight ?? LEVEL_SLUGS[0]);

  return (
    <div className="flex flex-col gap-8">
      <div className="md:hidden">
        <SegmentedControl<LevelSlug>
          label={t('marketing.levels.tabsLabel')}
          value={active}
          onChange={setActive}
          options={model.columns.map((c) => ({ value: c.slug, label: c.name }))}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {model.columns.map((c) => (
          <Column key={c.slug} col={c} current={c.slug === highlight} visible={c.slug === active} />
        ))}
      </div>

      <div className="flex flex-col items-start gap-4 rounded-2xl bg-cream-100 p-6 md:p-8">
        <h3 className="font-display text-2xl text-foreground">{t('marketing.levels.stripTitle')}</h3>
        <p className="max-w-[45rem] font-body text-base text-muted-foreground">{model.notARanking}</p>
        <Button to={withLocale(PATHS.analysis)} caps>
          {t('marketing.nav.cta')}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-display text-2xl text-foreground">{t('marketing.levels.snippetsTitle')}</h3>
        <Accordion
          items={model.snippets.map((s) => ({
            id: s.id,
            title: s.title,
            body: (
              <div className="flex items-start gap-4">
                <SnippetIllustration id={s.id} />
                <p className="font-body text-base text-muted-foreground">{s.body}</p>
              </div>
            ),
          }))}
        />
        <p className="font-body text-xs text-muted-foreground">{t('marketing.levels.legalNote')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {model.pendingMedia.map((m) => (
          <MediaPlaceholder
            key={m.label}
            alt={m.label}
            label={m.label}
            kind={/video/i.test(m.label) ? 'video' : 'image'}
            ratio="16 / 9"
            tone="card"
          />
        ))}
      </div>
    </div>
  );
}

/** Section wrapper: builds the model for the active locale and adds the intro. */
export function LevelComparisonSection({ highlight }: { highlight?: LevelSlug }) {
  const t = useT();
  const cl = useLocale().locale;
  const model = useMemo(() => buildLevelComparison(cl), [cl]);
  return (
    <Section tone="cream" width="content" gap={8} id="levels">
      <SectionIntro title={t('marketing.levels.title')} body={t('marketing.levels.body')} />
      <LevelComparison model={model} highlight={highlight} />
    </Section>
  );
}
