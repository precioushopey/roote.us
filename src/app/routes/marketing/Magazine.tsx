import { Link } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  IngredientCard,
  PendingChip,
} from '@/app/components/roote';
import { EXTERNAL_ASSESSMENT_URL, PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { PRODUCTS } from '@/content/products';
import type { ClaimStatus } from '@/content/claims';
import {
  HAIR_LOSS_SCIENCE,
  RESULTS_TIMELINE_CLAIM,
  dedupedIngredients,
  INGREDIENT_CATEGORY,
  INGREDIENT_EXPLANATIONS,
  FORMAT_EXPLANATIONS,
  type IngredientCategory,
} from '@/content/magazine';
import type { MessageKey } from '@/i18n/messages';

/** Same 4 categories `/science` shows, same i18n keys — the two pages agree. */
const CATEGORY_LABEL_KEY: Record<IngredientCategory, MessageKey> = {
  dht: 'marketing.sci.mechanism.dhtTitle',
  regrowth: 'marketing.sci.mechanism.regrowthTitle',
  pigment: 'marketing.sci.mechanism.pigmentTitle',
  conditioning: 'marketing.sci.mechanism.conditioningTitle',
};
const CATEGORY_ORDER: IngredientCategory[] = ['dht', 'regrowth', 'pigment', 'conditioning'];

/** Keys added in Task 4 Step 6 — dedicated Magazine format labels, not reused
 *  from /science's SKU-group labels (different meaning: format, not SKU line). */
const FORMAT_LABEL_KEY: Record<string, MessageKey> = {
  'topical-solution': 'marketing.magazine.formatLabel.topicalSolution',
  'capsule-supplement': 'marketing.magazine.formatLabel.capsuleSupplement',
  serum: 'marketing.magazine.formatLabel.serum',
  shampoo: 'marketing.magazine.formatLabel.shampoo',
};

export function Magazine() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const statusLabel: Record<ClaimStatus, string> = {
    approved: t('marketing.sci.status.approved'),
    working: t('marketing.sci.status.working'),
    'requires-review': t('marketing.sci.status.requiresReview'),
  };
  const timelineClaim = RESULTS_TIMELINE_CLAIM[cl];
  const byCategory = (cat: IngredientCategory) =>
    dedupedIngredients().filter((ing) => INGREDIENT_CATEGORY[ing.name] === cat);

  return (
    <>
      <Section tone="teal" width="content" animate={false}>
        <Eyebrow className="rounded-full border border-accent px-4 py-1.5">
          {t('marketing.magazine.eyebrow')}
        </Eyebrow>
        <DisplayTitle as="h1" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.magazine.title')}
        </DisplayTitle>
        <Prose size="lg" className="mt-4 max-w-2xl">
          {t('marketing.magazine.body')}
        </Prose>
      </Section>

      <Section id="why" tone="cream" width="content">
        <Eyebrow>{t('marketing.magazine.whyEyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.magazine.whyHeading')}
        </DisplayTitle>
        <Prose size="lg" className="mt-4 max-w-2xl">
          {pickLocalized(HAIR_LOSS_SCIENCE, cl)}
        </Prose>
      </Section>

      <Section tone="cream" width="content">
        <DisplayTitle as="h2" step="lg" className="max-w-2xl">
          {t('marketing.magazine.timelineHeading')}
        </DisplayTitle>
        <div className="mt-4 max-w-2xl">
          {timelineClaim.status === 'requires-review' ? (
            <PendingChip label={t('marketing.magazine.timelinePendingLabel')} />
          ) : (
            <Prose size="lg">{timelineClaim.text}</Prose>
          )}
        </div>
      </Section>

      <Section id="ingredients" tone="cream" width="content">
        <Eyebrow>{t('marketing.magazine.ingredientsEyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.magazine.ingredientsHeading')}
        </DisplayTitle>
        <div className="mt-10 flex flex-col gap-12">
          {CATEGORY_ORDER.map((cat) => {
            const ingredients = byCategory(cat);
            if (ingredients.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="font-display text-lg text-foreground">{t(CATEGORY_LABEL_KEY[cat])}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ingredients.map((ing) => {
                    const explanation = INGREDIENT_EXPLANATIONS[ing.name];
                    const note = explanation ? pickLocalized(explanation, cl) : pickLocalized(ing.note, cl);
                    return (
                      <IngredientCard
                        key={ing.name}
                        name={ing.name}
                        note={note}
                        status={ing.claimStatus}
                        statusLabel={statusLabel[ing.claimStatus]}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.magazine.formatsEyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.magazine.formatsHeading')}
        </DisplayTitle>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(FORMAT_EXPLANATIONS) as Array<keyof typeof FORMAT_EXPLANATIONS>).map((format) => (
            <div key={format} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6">
              <p className="font-display text-md text-foreground">{t(FORMAT_LABEL_KEY[format])}</p>
              <Prose className="mt-1">{pickLocalized(FORMAT_EXPLANATIONS[format], cl)}</Prose>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.magazine.productsEyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.magazine.productsHeading')}
        </DisplayTitle>
        {/* Reuses each product's own already-approved shortDescription as the
            teaser, rather than drafting new copy that could drift from /products. */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <Link
              key={p.slug}
              to={withLocale(PATHS.product(p.slug))}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 transition-colors hover:border-deep-700"
            >
              <p className="font-display text-md text-foreground">{p.name}</p>
              <Prose className="mt-1">{pickLocalized(p.shortDescription, cl)}</Prose>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="teal" width="readable" className="border-b border-accent text-center">
        <DisplayTitle as="h2" step="lg" align="center">
          {t('marketing.magazine.ctaHeading')}
        </DisplayTitle>
        <div className="mt-6 flex justify-center">
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps>
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>
    </>
  );
}
