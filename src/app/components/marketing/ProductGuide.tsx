import { Link } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section, SectionIntro, Prose, PendingChip } from '@/app/components/roote';
import { RoutineGraphic, SystemMap } from '@/app/components/marketing/ProductVisuals';
import { PATHS } from '@/app/paths';
import type { ProductGuideModel } from '@/content/productGuides';

/**
 * The guide sections of the product-page template (who it's for, how it works,
 * routine fit, comparison, what to expect). Each takes the resolved
 * `ProductGuideModel` — already localized and pending-flagged — and renders it.
 * The step-by-step usage graphic (`HowToUseSteps`) is mounted by ProductDetail
 * inside its directions section.
 */

export function GuideWho({ guide }: { guide: ProductGuideModel }) {
  const t = useT();
  return (
    <Section tone="cream" width="content" gap={4} className="-mt-24">
      <SectionIntro title={t('marketing.guide.whoTitle')} />
      <Prose>{guide.whoFor}</Prose>
    </Section>
  );
}

export function GuideHow({ guide }: { guide: ProductGuideModel }) {
  const t = useT();
  return (
    <Section tone="cream" width="content" gap={4} className="-mt-24">
      <SectionIntro title={t('marketing.guide.howTitle')} />
      <Prose>{guide.howItWorks}</Prose>
    </Section>
  );
}

export function GuideRoutine({ guide }: { guide: ProductGuideModel }) {
  const t = useT();
  return (
    <Section tone="cream" width="content" gap={8} className="-mt-24">
      <SectionIntro title={t('marketing.guide.routineTitle')} body={guide.routineFit} />
      <RoutineGraphic highlight={guide.slug} />
      <SystemMap highlight={guide.slug} />
    </Section>
  );
}

/** Non-Level products: a short row per similar product. (The three Levels use the
 *  shared `LevelComparisonSection` instead — see ProductDetail.) */
export function GuideCompare({ guide }: { guide: ProductGuideModel }) {
  const t = useT();
  const withLocale = useLocalizedPath();
  if (guide.compare.length === 0) return null;
  return (
    <Section tone="cream" width="content" gap={4} className="-mt-24">
      <SectionIntro title={t('marketing.guide.compareTitle')} />
      <ul className="flex flex-col gap-3">
        {guide.compare.map((row) => (
          <li key={row.label} className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
            {row.slug ? (
              <Link
                to={withLocale(PATHS.product(row.slug))}
                className="w-fit font-display text-lg text-foreground underline underline-offset-4"
              >
                {row.label}
              </Link>
            ) : (
              <Link
                to={`${withLocale(PATHS.products)}#levels`}
                className="w-fit font-display text-lg text-foreground underline underline-offset-4"
              >
                {row.label}
              </Link>
            )}
            <p className="font-body text-sm text-muted-foreground">{row.diff}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function GuideExpect({ guide }: { guide: ProductGuideModel }) {
  const t = useT();
  return (
    <Section tone="cream" width="content" gap={4} className="-mt-24">
      <SectionIntro title={t('marketing.guide.expectTitle')} />
      <Prose>{guide.expect}</Prose>
      <p className="flex flex-wrap items-center gap-2 font-body text-sm text-muted-foreground">
        <span>{t('marketing.guide.timelineLabel')}:</span>
        <PendingChip label={guide.expectTimeline.label} />
      </p>
    </Section>
  );
}
