import { useParams } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  Badge,
  Accordion,
  MediaPlaceholder,
  IngredientCard,
  ProductCard,
  LegalNotice,
} from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { getProduct } from '@/content/products';
import { PRODUCT_FAQS_COMMON } from '@/content/faqs';
import { PagePlaceholder } from '@/app/routes/shared/PagePlaceholder';

/** Product page template (brief §20). Secondary to the assessment — the primary
 *  action is always "Start free hair analysis". */
export function ProductDetail() {
  const { slug } = useParams();
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const product = slug ? getProduct(slug) : undefined;

  if (!product) return <PagePlaceholder title="Product" body="This product could not be found." />;

  const related = product.relatedProducts.map(getProduct).filter((p): p is NonNullable<typeof p> => !!p);

  const details: Array<{ id: string; title: string; body: React.ReactNode }> = [
    {
      id: 'usage',
      title: t('marketing.pdp.howToUse'),
      body: pickLocalized(product.usage, cl),
    },
    {
      id: 'safety',
      title: t('marketing.pdp.safety'),
      body: pickLocalized(product.safety, cl),
    },
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
      <Section tone="teal" width="content" animate={false}>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <MediaPlaceholder
            tone={product.concern === 'gray' || product.concern === 'gray-support' ? 'cream' : 'card'}
            ratio="1"
            alt={`${product.name} packaging`}
            label={`${product.name} — product photography, ${product.requiresMedicalReview ? 'dark-teal' : 'cream'} packaging`}
          />
          <div className="flex flex-col items-start gap-4">
            <Eyebrow onDark>{pickLocalized(product.subtitle, cl)}</Eyebrow>
            <DisplayTitle as="h1" step="md" onDark>
              {product.name}
            </DisplayTitle>
            <Prose onDark size="lg" className="max-w-lg">
              {pickLocalized(product.heroCopy, cl)}
            </Prose>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-body text-sm text-cream-100">{t('marketing.pdp.priceLabel')}</span>
              <Badge tone="review">{t('marketing.pdp.pricePending')}</Badge>
            </div>
            {product.requiresMedicalReview ? (
              <Badge tone="review">{t('marketing.pdp.reviewBadge')}</Badge>
            ) : null}
            <Button to={withLocale(PATHS.analysis)} caps className="mt-2">
              {t('marketing.nav.cta')}
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="cream" width="content">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-lg text-foreground">{t('marketing.pdp.fitTitle')}</h2>
            <Prose className="mt-2">{t('marketing.pdp.fitBody')}</Prose>
            <p className="mt-4 font-body text-sm text-muted-foreground">
              {t('marketing.pdp.format', { size: product.size })}
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg text-foreground">{t('marketing.pdp.activesTitle')}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {product.ingredients.slice(0, 6).map((ing) => (
                <IngredientCard
                  key={ing.name}
                  name={ing.name}
                  note={pickLocalized(ing.note, cl)}
                  status={ing.claimStatus}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="grid" width="readable">
        <h2 className="font-display text-lg text-foreground">{t('marketing.pdp.detailsTitle')}</h2>
        <Accordion className="mt-6" items={details} />
        <LegalNotice reviewRequired className="mt-6">
          {t('marketing.pdp.evidenceNote')}
        </LegalNotice>
      </Section>

      {related.length > 0 ? (
        <Section tone="cream" width="content">
          <h2 className="font-display text-lg text-foreground">{t('marketing.pdp.relatedTitle')}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard
                key={p.slug}
                name={p.name}
                subtitle={pickLocalized(p.subtitle, cl)}
                to={withLocale(PATHS.product(p.slug))}
                priceLabel={p.price === null ? null : String(p.price)}
                reviewRequired={p.requiresMedicalReview}
                mediaAlt={`${p.name} packaging`}
                mediaLabel={`${p.name} — product photography`}
              />
            ))}
          </div>
        </Section>
      ) : null}

      <Section tone="teal" width="readable" className="text-center">
        <DisplayTitle as="h2" step="lg" onDark align="center">
          {t('marketing.pdp.ctaHeading')}
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
