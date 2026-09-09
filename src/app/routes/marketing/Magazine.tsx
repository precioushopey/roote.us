import { useT, useContentLocale } from '@/i18n/LocaleProvider';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  IngredientCard,
} from '@/app/components/roote';
import { EXTERNAL_ASSESSMENT_URL } from '@/app/paths';
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
  const cl = useContentLocale();
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
      <Section tone="teal" width="content" animate={false} className="py-12 md:py-24 text-center">
        <DisplayTitle as="h1" step="lg" align="center" className="mx-auto !font-medium max-w-2xl">
          {t('marketing.magazine.title')}
        </DisplayTitle>
        <Prose size="lg" className="mx-auto mt-4 max-w-2xl text-center text-ink-foreground/75">
          {t('marketing.magazine.body')}
        </Prose>
        <div className="mt-6 flex justify-center">
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps className="w-full text-sm sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>

      <Section id="why" tone="cream" width="content">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>{t('marketing.magazine.whyEyebrow')}</Eyebrow>
            <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
              {t('marketing.magazine.whyHeading')}
            </DisplayTitle>
            <Prose size="lg" className="mt-4 max-w-2xl">
              {pickLocalized(HAIR_LOSS_SCIENCE, cl)}
            </Prose>
          </div>
          <img
            src={concernThinning}
            alt={t('marketing.magazine.whyMediaAlt')}
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
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
                <div className="mt-4 grid gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
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

      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.magazine.formatsEyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.magazine.formatsHeading')}
        </DisplayTitle>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(FORMAT_EXPLANATIONS) as Array<keyof typeof FORMAT_EXPLANATIONS>).map((format) => (
            <div key={format} className="flex flex-col items-center gap-4 text-center">
              <img
                src={FORMAT_PHOTOS[format]}
                alt=""
                aria-hidden
                className="aspect-square w-full rounded-sm object-contain"
              />
              <div className="flex flex-col gap-2">
                <p className="font-display text-md text-foreground">{t(FORMAT_LABEL_KEY[format])}</p>
                <Prose className="mt-1">{pickLocalized(FORMAT_EXPLANATIONS[format], cl)}</Prose>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="teal" width="readable" className="border-b border-accent text-center">
        <div className="flex flex-col items-center gap-5">
          <DisplayTitle as="h2" step="xl" align="center">
            {t('marketing.magazine.ctaHeading')}
          </DisplayTitle>
          <Prose size="lg" className="mx-auto text-center text-ink-foreground/75">
            {t('marketing.magazine.ctaBody')}
          </Prose>
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps className="w-full text-sm font-bold sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>
    </>
  );
}
