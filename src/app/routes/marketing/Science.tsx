import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section, DisplayTitle, Prose, Eyebrow, Button, IngredientCard, LegalNotice } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { getProduct } from '@/content/products';
import type { MessageKey } from '@/i18n/messages';

const GROUPS: Array<{ labelKey: MessageKey; slug: string }> = [
  { labelKey: 'marketing.sci.groupDensity', slug: 'density-10' },
  { labelKey: 'marketing.sci.groupGray', slug: 'gray-serum' },
  { labelKey: 'marketing.sci.groupShampoo', slug: 'regrowth-shampoo' },
];

export function Science() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  return (
    <>
      <Section tone="teal" width="content" animate={false} className="text-center">
        <Eyebrow onDark>{t('marketing.sci.eyebrow')}</Eyebrow>
        <DisplayTitle as="h1" step="lg" onDark align="center" className="mx-auto mt-2 max-w-2xl">
          {t('marketing.sci.heading')}
        </DisplayTitle>
        <Prose onDark size="lg" className="mx-auto mt-4 text-center">
          {t('marketing.sci.body')}
        </Prose>
      </Section>

      <Section tone="cream" width="content">
        <div className="flex flex-col gap-12">
          {GROUPS.map((g) => {
            const product = getProduct(g.slug)!;
            return (
              <div key={g.slug}>
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-lg text-foreground">{t(g.labelKey)}</h2>
                  <span className="font-body text-xs text-muted-foreground">{product.name}</span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {product.ingredients.map((ing) => (
                    <IngredientCard
                      key={ing.name}
                      name={ing.name}
                      note={pickLocalized(ing.note, cl)}
                      status={ing.claimStatus}
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

      <Section tone="grid" width="readable">
        <DisplayTitle as="h2" step="md">
          {t('marketing.sci.oversightHeading')}
        </DisplayTitle>
        <Prose className="mt-3">{t('marketing.sci.oversightBody')}</Prose>
        <p className="mt-6 font-body text-xs text-muted-foreground">{t('marketing.sci.referencesNote')}</p>
      </Section>

      <Section tone="teal" width="readable" className="text-center">
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
