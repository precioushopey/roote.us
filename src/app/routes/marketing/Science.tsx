import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  Badge,
  IngredientCard,
  LegalNotice,
} from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { getProduct } from '@/content/products';
import type { ClaimStatus } from '@/content/claims';
import type { MessageKey } from '@/i18n/messages';
import scienceFormulation from '@/assets/images/science-formulation.png';
import scienceOversight from '@/assets/images/science-oversight.png';

const GROUPS: Array<{ labelKey: MessageKey; slug: string }> = [
  { labelKey: 'marketing.sci.groupDensity', slug: 'density-10' },
  { labelKey: 'marketing.sci.groupGray', slug: 'gray-serum' },
  { labelKey: 'marketing.sci.groupShampoo', slug: 'regrowth-shampoo' },
];

export function Science() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const statusLabel: Record<ClaimStatus, string> = {
    approved: t('marketing.sci.status.approved'),
    working: t('marketing.sci.status.working'),
    'requires-review': t('marketing.sci.status.requiresReview'),
  };
  const mechanisms = [
    { title: t('marketing.sci.mechanism.dhtTitle'), body: t('marketing.sci.mechanism.dhtBody') },
    { title: t('marketing.sci.mechanism.regrowthTitle'), body: t('marketing.sci.mechanism.regrowthBody') },
    { title: t('marketing.sci.mechanism.pigmentTitle'), body: t('marketing.sci.mechanism.pigmentBody') },
    { title: t('marketing.sci.mechanism.conditioningTitle'), body: t('marketing.sci.mechanism.conditioningBody') },
  ];
  return (
    <>
      <Section tone="teal" width="content" animate={false}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow onDark className="rounded-full border border-gold-500 px-4 py-1.5">
              {t('marketing.sci.eyebrow')}
            </Eyebrow>
            <DisplayTitle as="h1" step="lg" onDark>
              {t('marketing.sci.heading')}
            </DisplayTitle>
            <Prose onDark size="lg" className="max-w-lg">
              {t('marketing.sci.body')}
            </Prose>
            <Button
              to={withLocale(PATHS.analysis)}
              size="lg"
              caps
              className="bg-gold-500 text-ink text-xs md:text-sm font-bold hover:bg-gold-600"
            >
              {t('marketing.nav.cta')}
            </Button>
          </div>
          <img
            src={scienceFormulation}
            alt={t('marketing.sci.heroMediaAlt')}
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        </div>
      </Section>

      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.sci.mechanism.eyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.sci.mechanism.heading')}
        </DisplayTitle>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mechanisms.map((m) => (
            <div key={m.title} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6">
              <p className="font-display text-md text-foreground">{m.title}</p>
              <Prose className="mt-1">{m.body}</Prose>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" width="content">
        <DisplayTitle as="h2" step="lg" className="max-w-2xl">
          {t('marketing.sci.ingredientsHeading')}
        </DisplayTitle>
        <div className="mt-10 flex flex-col gap-12">
          {GROUPS.map((g) => {
            const product = getProduct(g.slug)!;
            return (
              <div key={g.slug}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-lg text-foreground">{t(g.labelKey)}</h3>
                  <span className="font-body text-xs text-muted-foreground">{product.name}</span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {product.ingredients.map((ing) => (
                    <IngredientCard
                      key={ing.name}
                      name={ing.name}
                      note={pickLocalized(ing.note, cl)}
                      status={ing.claimStatus}
                      statusLabel={statusLabel[ing.claimStatus]}
                      readMoreLabel={t('marketing.sci.readMore')}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <LegalNotice reviewRequired className="mt-10">
          {t('marketing.sci.note')}
        </LegalNotice>
      </Section>

      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.sci.evidenceLabels.eyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.sci.evidenceLabels.heading')}
        </DisplayTitle>
        <Prose className="mt-4 max-w-2xl">{t('marketing.sci.evidenceLabels.body')}</Prose>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-start gap-3">
            <Badge tone="success">{t('marketing.sci.status.approved')}</Badge>
            <Prose>{t('marketing.sci.evidenceLabels.approvedBody')}</Prose>
          </div>
          <div className="flex flex-col items-start gap-3">
            <Badge tone="info">{t('marketing.sci.status.working')}</Badge>
            <Prose>{t('marketing.sci.evidenceLabels.workingBody')}</Prose>
          </div>
          <div className="flex flex-col items-start gap-3">
            <Badge tone="review">{t('marketing.sci.status.requiresReview')}</Badge>
            <Prose>{t('marketing.sci.evidenceLabels.requiresReviewBody')}</Prose>
          </div>
        </div>
      </Section>

      <Section tone="cream" width="content">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <Eyebrow>{t('marketing.sci.oversightEyebrow')}</Eyebrow>
            <DisplayTitle as="h2" step="lg" className="mt-1 max-w-lg">
              {t('marketing.sci.oversightHeading')}
            </DisplayTitle>
            <Prose size="lg" className="max-w-lg">
              {t('marketing.sci.oversightBody')}
            </Prose>
            <p className="mt-2 font-body text-xs text-muted-foreground">{t('marketing.sci.referencesNote')}</p>
          </div>
          <img
            src={scienceOversight}
            alt={t('marketing.sci.oversightMediaAlt')}
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        </div>
      </Section>

      <Section tone="teal" width="readable" className="border-b border-gold-500 text-center">
        <DisplayTitle as="h2" step="lg" onDark align="center">
          {t('marketing.sci.ctaHeading')}
        </DisplayTitle>
        <div className="mt-6 flex justify-center">
          <Button to={withLocale(PATHS.analysis)} size="lg" caps>
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>
    </>
  );
}
