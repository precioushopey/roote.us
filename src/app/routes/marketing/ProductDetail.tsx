import { useParams } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  Badge,
  Card,
  Accordion,
  MediaPlaceholder,
  IngredientCard,
  ProductCard,
  LegalNotice,
  PendingChip,
  CtaSection,
} from '@/app/components/roote';
import { PATHS, EXTERNAL_ASSESSMENT_URL } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { getProduct } from '@/content/products';
import { rooteContent } from '@/content/roote.config';
import { formatMoney } from '@/domain/report/money';
import type { ClaimStatus } from '@/content/claims';
import { PRODUCT_FAQS_COMMON } from '@/content/faqs';
import { PagePlaceholder } from '@/app/routes/shared/PagePlaceholder';
import level6 from '@/assets/products/Level 6.png';
import level10 from '@/assets/products/Level 10.png';
import level15 from '@/assets/products/Level 15.png';
import graySupport from '@/assets/products/Gray Support.png';
import regrowthShampoo from '@/assets/products/Regrowth Shampoo.png';
import graySerum from '@/assets/products/Gray Serum.png';

const PRODUCT_PHOTOS: Record<string, string> = {
  'density-6': level6,
  'density-10': level10,
  'density-15': level15,
  'gray-support': graySupport,
  'regrowth-shampoo': regrowthShampoo,
  'gray-serum': graySerum,
};

/** Product page template (brief §20). Secondary to the assessment — the primary
 *  action is always "Start free hair analysis". */
export function ProductDetail() {
  const { slug } = useParams();
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const product = slug ? getProduct(slug) : undefined;
  const statusLabel: Record<ClaimStatus, string> = {
    approved: t('marketing.sci.status.approved'),
    working: t('marketing.sci.status.working'),
    'requires-review': t('marketing.sci.status.requiresReview'),
  };

  if (!product) return <PagePlaceholder title="Product" body="This product could not be found." />;

  const related = product.relatedProducts.map(getProduct).filter((p): p is NonNullable<typeof p> => !!p);
  const isGrayConcern = product.concern === 'gray' || product.concern === 'gray-support';
  const eyebrowLabel = isGrayConcern ? t('marketing.shop.filterGray') : t('marketing.shop.filterThinning');
  const [spotlightIngredient, ...restIngredients] = product.ingredients;

  const details: Array<{ id: string; title: string; body: React.ReactNode }> = [
    {
      id: 'formula',
      title: t('marketing.pdp.formula'),
      body: product.formulaReference
        ? `${pickLocalized(product.formulaReference, cl)} ${t('marketing.pdp.formulaNote')}`
        : t('marketing.pdp.formulaNote'),
    },
    ...PRODUCT_FAQS_COMMON.map((f) => ({
      id: f.id,
      title: pickLocalized(f.q, cl),
      body: pickLocalized(f.a, cl),
    })),
  ];

  return (
    <>
      <Section tone="teal" width="content" className="py-12 md:py-12">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {PRODUCT_PHOTOS[product.slug] ? (
            <img
              src={PRODUCT_PHOTOS[product.slug]}
              alt={`${product.name} packaging`}
              loading="lazy"
              className="aspect-square w-full rounded-sm object-contain"
            />
          ) : (
            <MediaPlaceholder
              tone={isGrayConcern ? 'cream' : 'card'}
              ratio="1"
              alt={`${product.name} packaging`}
              label={`${product.name}: product photography, ${product.requiresMedicalReview ? 'dark-teal' : 'cream'} packaging`}
            />
          )}
          <div className="flex flex-col items-start gap-4">
            <Eyebrow className="text-ink-foreground">{eyebrowLabel}</Eyebrow>
            <DisplayTitle as="h1" step="md" className="!font-normal">
              {product.name}
            </DisplayTitle>
            <Prose className="text-ink-foreground">
              {pickLocalized(product.heroCopy, cl)}
            </Prose>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{t('marketing.pdp.format', { size: product.size })}</Badge>
              <Badge tone={product.requiresMedicalReview ? 'review' : 'success'}>
                {product.requiresMedicalReview
                  ? t('marketing.pdp.requiresReview')
                  : t('marketing.pdp.noPrescriptionNeeded')}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-body text-sm text-foreground">{t('marketing.pdp.priceLabel')}</span>
              <span className="font-display text-2xl font-bold text-foreground">
                {product.price === null ? (
                  <PendingChip label="price" />
                ) : (
                  formatMoney(product.price, rooteContent.currency, cl).formatted
                )}
              </span>
            </div>
            <Button to={EXTERNAL_ASSESSMENT_URL} external caps className="w-full sm:w-auto">
              {t('marketing.nav.cta')}
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="cream" width="content" gap={4}>
        <div className="flex max-w-[45rem] flex-col gap-4">
          <h2 className="font-display text-lg md:text-xl text-foreground">{t('marketing.pdp.fitTitle')}</h2>
          <Prose>{pickLocalized(product.shortDescription, cl)}</Prose>
          <Prose>{t('marketing.pdp.fitBody')}</Prose>
        </div>
      </Section>

      <Section tone="cream" width="content" gap={8} className="-mt-24">
        <h2 className="font-display text-lg md:text-xl text-foreground">{t('marketing.pdp.activesTitle')}</h2>
        {spotlightIngredient ? (
          <Card tone="cream" bordered className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-xl md:text-2xl text-foreground">{spotlightIngredient.name}</p>
              {spotlightIngredient.claimStatus === 'approved' ? (
                <Badge tone="success">{statusLabel.approved}</Badge>
              ) : null}
            </div>
            <div className="max-w-[62ch] font-body text-sm md:text-base text-muted-foreground">
              {spotlightIngredient.claimStatus === 'requires-review' ? (
                <PendingChip label={`${spotlightIngredient.name} claim`} />
              ) : (
                pickLocalized(spotlightIngredient.note, cl)
              )}
            </div>
          </Card>
        ) : null}
        {restIngredients.length > 0 ? (
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-md text-foreground">{t('marketing.pdp.alsoInFormula')}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {restIngredients.slice(0, 5).map((ing) => (
                <IngredientCard
                  key={ing.name}
                  name={ing.name}
                  note={pickLocalized(ing.note, cl)}
                  status={ing.claimStatus}
                  statusLabel={ing.claimStatus === 'approved' ? statusLabel[ing.claimStatus] : undefined}
                />
              ))}
            </div>
          </div>
        ) : null}
      </Section>

      <Section tone="grid" width="content" gap={4} className="-mt-24">
        <div className="flex max-w-[45rem] flex-col gap-4">
          <h2 className="font-display text-lg md:text-xl text-foreground">{t('marketing.pdp.howToUse')}</h2>
          <Prose>{pickLocalized(product.usage, cl)}</Prose>
          <p className="font-body text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{t('marketing.pdp.safety')}: </span>
            {pickLocalized(product.safety, cl)}
          </p>
        </div>
      </Section>

      <Section tone="grid" width="content" gap={8} className="-mt-24">
        <div className="flex max-w-[45rem] flex-col gap-8">
          <h2 className="font-display text-lg text-foreground">{t('marketing.pdp.detailsTitle')}</h2>
          <Accordion items={details} />
          <LegalNotice>{t('marketing.pdp.evidenceNote')}</LegalNotice>
        </div>
      </Section>

      {related.length > 0 ? (
        <Section tone="cream" width="content" gap={8} className="-mt-24">
          <h2 className="font-display text-lg md:text-xl text-foreground">{t('marketing.pdp.relatedTitle')}</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard
                key={p.slug}
                name={p.name}
                subtitle={pickLocalized(p.subtitle, cl)}
                to={withLocale(PATHS.product(p.slug))}
                priceLabel={p.price === null ? null : formatMoney(p.price, rooteContent.currency, cl).formatted}
                mediaAlt={`${p.name} packaging`}
                mediaLabel={`${p.name}: product photography`}
                image={PRODUCT_PHOTOS[p.slug]}
              />
            ))}
          </div>
        </Section>
      ) : null}

      <CtaSection title={t('marketing.pdp.ctaHeading')} />
    </>
  );
}
