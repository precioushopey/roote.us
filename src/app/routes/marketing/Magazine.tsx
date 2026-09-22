import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  SectionIntro,
  Button,
  IngredientCard,
  MediaCaption,
  MediaPlaceholder,
  TextLink,
  Hero,
  CtaSection,
} from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import type { ClaimStatus } from '@/content/claims';
import {
  HAIR_LOSS_SCIENCE,
  dedupedIngredients,
  INGREDIENT_CATEGORY,
  INGREDIENT_EXPLANATIONS,
  FORMAT_EXPLANATIONS,
  type IngredientCategory,
} from '@/content/magazine';
import type { MessageKey } from '@/i18n/messages';
import { INGREDIENT_PHOTOS } from '@/app/components/roote/ingredientPhotos';
import concernThinning from '@/assets/concerns/concern-thinning.png';
import level10 from '@/assets/products/Level 10.png';
import graySupport from '@/assets/products/Gray Support.png';
import graySerum from '@/assets/products/Gray Serum.png';
import regrowthShampoo from '@/assets/products/Regrowth Shampoo.png';

/** One representative real SKU photo per format — reuses the same product
 *  assets ProductDetail.tsx uses, not new photography. */
const FORMAT_PHOTOS: Record<string, string> = {
  'topical-solution': level10,
  'capsule-supplement': graySupport,
  serum: graySerum,
  shampoo: regrowthShampoo,
};

/** Same 4 categories `/hair-scan`'s "Your plan" section shows, same i18n keys. */
const CATEGORY_LABEL_KEY: Record<IngredientCategory, MessageKey> = {
  dht: 'marketing.sci.mechanism.dhtTitle',
  regrowth: 'marketing.sci.mechanism.regrowthTitle',
  pigment: 'marketing.sci.mechanism.pigmentTitle',
  conditioning: 'marketing.sci.mechanism.conditioningTitle',
};
const CATEGORY_ORDER: IngredientCategory[] = ['dht', 'regrowth', 'pigment', 'conditioning'];

/** Keys added in Task 4 Step 6 — dedicated Magazine format labels, not reused
 *  from the old Science page's SKU-group labels (different meaning: format,
 *  not SKU line). */
const FORMAT_LABEL_KEY: Record<string, MessageKey> = {
  'topical-solution': 'marketing.magazine.formatLabel.topicalSolution',
  'capsule-supplement': 'marketing.magazine.formatLabel.capsuleSupplement',
  serum: 'marketing.magazine.formatLabel.serum',
  shampoo: 'marketing.magazine.formatLabel.shampoo',
};

export function Magazine() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const statusLabel: Record<ClaimStatus, string> = {
    approved: t('marketing.sci.status.approved'),
    working: t('marketing.sci.status.working'),
    'requires-review': t('marketing.sci.status.requiresReview'),
  };
  // Supplier-proprietary actives (Procapil®, Greyverse™, Darkenyl™, Capixyl™)
  // have no approved copy yet and would only render as a [PENDING] card —
  // left out of the library grid entirely rather than shown pending. Not a
  // content change: nothing is written for them, they're just not listed.
  const byCategory = (cat: IngredientCategory) =>
    dedupedIngredients().filter(
      (ing) => INGREDIENT_CATEGORY[ing.name] === cat && ing.claimStatus !== 'requires-review',
    );

  return (
    <>
      <Hero
        title={t('marketing.magazine.title')}
        body={t('marketing.magazine.body')}
        cta={
          <Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        }
      />

      <Section id="why" tone="cream" width="content">
        <div className="grid lg:grid-cols-2 items-center gap-12">
          <div className="flex flex-col items-start gap-8">
            <SectionIntro
              eyebrow={t('marketing.magazine.whyEyebrow')}
              title={t('marketing.magazine.whyHeading')}
              body={pickLocalized(HAIR_LOSS_SCIENCE, cl)}
            />
            <TextLink to="#ingredients" withArrow>
              {t('marketing.magazine.whyCta')}
            </TextLink>
          </div>
          <img
            src={concernThinning}
            alt={t('marketing.magazine.whyMediaAlt')}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
        </div>
      </Section>

      <Section id="ingredients" tone="cream" width="content" gap={12} className="-mt-24">
        <SectionIntro
          eyebrow={t('marketing.magazine.ingredientsEyebrow')}
          title={t('marketing.magazine.ingredientsHeading')}
        />
        <div className="flex flex-col gap-12">
          {CATEGORY_ORDER.map((cat) => {
            const ingredients = byCategory(cat);
            if (ingredients.length === 0) return null;
            return (
              <div key={cat} className="flex flex-col gap-8">
                <h3 className="font-display text-xl md:text-2xl text-foreground">{t(CATEGORY_LABEL_KEY[cat])}</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                  {ingredients.map((ing) => {
                    const explanation = INGREDIENT_EXPLANATIONS[ing.name];
                    const note = explanation ? pickLocalized(explanation, cl) : pickLocalized(ing.note, cl);
                    return (
                      <IngredientCard
                        key={ing.name}
                        name={ing.name}
                        note={note}
                        status={ing.claimStatus}
                        statusLabel={ing.claimStatus === 'working' ? undefined : statusLabel[ing.claimStatus]}
                        image={INGREDIENT_PHOTOS[ing.name]}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section tone="cream" width="content" gap={12} className="-mt-24">
        <SectionIntro
          eyebrow={t('marketing.magazine.formatsEyebrow')}
          title={t('marketing.magazine.formatsHeading')}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {(Object.keys(FORMAT_EXPLANATIONS) as Array<keyof typeof FORMAT_EXPLANATIONS>).map((format) => (
            <MediaCaption
              key={format}
              media={
                FORMAT_PHOTOS[format] ? (
                  <img
                    src={FORMAT_PHOTOS[format]}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="aspect-square w-full rounded-sm object-contain"
                  />
                ) : (
                  <MediaPlaceholder
                    alt={t(FORMAT_LABEL_KEY[format])}
                    label={`${t(FORMAT_LABEL_KEY[format])}: product photography`}
                    ratio="1"
                    className="w-full"
                  />
                )
              }
              title={t(FORMAT_LABEL_KEY[format])}
              description={pickLocalized(FORMAT_EXPLANATIONS[format], cl)}
            />
          ))}
        </div>
        <div className="flex justify-center">
          <Button to={withLocale(PATHS.products)} caps className="w-full sm:w-auto">
            {t('app.nav.shop')}
          </Button>
        </div>
      </Section>

      <CtaSection
        title={t('marketing.magazine.ctaHeading')}
        body={t('marketing.magazine.ctaBody')}
      />
    </>
  );
}
