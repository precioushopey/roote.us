import { useParams } from 'react-router';
import { Check } from 'lucide-react';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
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
  PendingChip,
  CtaSection,
  SectionIntro,
} from '@/app/components/roote';
import { useAddedToCartPanel } from '@/app/components/cart/AddedToCartPanel';
import { useFitTitle } from '@/app/lib/useFitTitle';
import { useCart } from '@/store/cart';
import { PATHS } from '@/app/paths';
import { INGREDIENT_PHOTOS } from '@/app/components/roote/ingredientPhotos';
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
import graySerum from '@/assets/products/Gray Serum.png';
import regrowthShampoo from '@/assets/products/Regrowth Shampoo.png';

const PRODUCT_PHOTOS: Record<string, string> = {
  'density-6': level6,
  'density-10': level10,
  'density-15': level15,
  'gray-support': graySupport,
  'gray-serum': graySerum,
  'regrowth-shampoo': regrowthShampoo,
};

/** Product page template (brief §20). Primary action is a direct
 *  "Add to Cart" (2026-09-22, product-owner request) — no assessment
 *  required to buy. */
export function ProductDetail() {
  const { slug } = useParams();
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const titleRef = useFitTitle<HTMLHeadingElement>(3);
  const cart = useCart();
  const added = useAddedToCartPanel();
  const product = slug ? getProduct(slug) : undefined;
  const statusLabel: Record<ClaimStatus, string> = {
    approved: t('marketing.sci.status.approved'),
    working: t('marketing.sci.status.working'),
    'requires-review': t('marketing.sci.status.requiresReview'),
  };

  if (!product) return <PagePlaceholder title={t('notFound.product.title')} body={t('notFound.product.body')} />;

  const related = product.relatedProducts.map(getProduct).filter((p): p is NonNullable<typeof p> => !!p);
  const isGrayConcern = product.concern === 'gray' || product.concern === 'gray-support';
  const eyebrowLabel = isGrayConcern ? t('marketing.shop.filterGray') : t('marketing.shop.filterThinning');
  const badgeLabel: Record<(typeof product.badges)[number], string> = {
    vegan: t('marketing.pdp.badge.vegan'),
    'cruelty-free': t('marketing.pdp.badge.crueltyFree'),
    'fragrance-free': t('marketing.pdp.badge.fragranceFree'),
    'paraben-free': t('marketing.pdp.badge.parabenFree'),
    'sulfate-free': t('marketing.pdp.badge.sulfateFree'),
  };

  const details: Array<{ id: string; title: string; body: React.ReactNode }> = [
    {
      id: 'formula',
      title: t('marketing.pdp.formula'),
      body: product.formulaReference
        ? `${pickLocalized(product.formulaReference, cl)} ${t('marketing.pdp.formulaNote')}`
        : t('marketing.pdp.formulaNote'),
    },
    {
      id: 'prescription',
      title: t('marketing.pdp.faqPrescription.q'),
      body: product.requiresMedicalReview
        ? t('marketing.pdp.faqPrescription.aYes')
        : t('marketing.pdp.faqPrescription.aNo'),
    },
    ...(product.slug.startsWith('density-')
      ? [{ id: 'strength', title: t('marketing.pdp.faqStrength.q'), body: t('marketing.pdp.faqStrength.a') }]
      : []),
    ...PRODUCT_FAQS_COMMON.map((f) => ({
      id: f.id,
      title: pickLocalized(f.q, cl),
      body: pickLocalized(f.a, cl),
    })),
  ];

  return (
    <>
      {added.panel}
      <Section tone="teal" width="content" className="py-12 md:py-12">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          {PRODUCT_PHOTOS[product.slug] ? (
            <img
              src={PRODUCT_PHOTOS[product.slug]}
              alt={t('common.packagingAlt', { name: product.name })}
              loading="lazy"
              className="aspect-square w-full rounded-sm object-contain lg:w-1/2"
            />
          ) : (
            <MediaPlaceholder
              tone={isGrayConcern ? 'cream' : 'card'}
              ratio="1"
              alt={t('common.packagingAlt', { name: product.name })}
              label={`${product.name}: product photography, ${product.requiresMedicalReview ? 'dark-teal' : 'cream'} packaging`}
              className="w-full lg:w-1/2"
            />
          )}
          <div className="flex w-full flex-col items-start gap-4 text-start lg:w-1/2">
            <Eyebrow className="text-ink-foreground">{eyebrowLabel}</Eyebrow>
            <DisplayTitle ref={titleRef} as="h1" className="!font-normal">
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
            <div className="mt-4 w-full sm:w-auto">
              <Button
                caps
                className="w-full sm:w-auto"
                onClick={() => {
                  cart.add(product.slug);
                  added.show(product.slug, 1);
                }}
              >
                {t('cart.add')}
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="cream" width="content" gap={4}>
        <SectionIntro title={t('marketing.pdp.fitTitle')} body={t('marketing.pdp.fitBody')} />
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-lg md:text-xl text-foreground">{t('marketing.pdp.keyBenefits')}</h3>
          <ul className="flex flex-col gap-2">
            {product.keyBenefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 font-body text-sm md:text-base text-muted-foreground">
                <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                <span>{pickLocalized(benefit, cl)}</span>
              </li>
            ))}
          </ul>
        </div>
        {product.overview ? (
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-lg md:text-xl text-foreground">{t('marketing.pdp.overview')}</h3>
            <Prose>{pickLocalized(product.overview, cl)}</Prose>
          </div>
        ) : (
          <Prose>{pickLocalized(product.shortDescription, cl)}</Prose>
        )}
      </Section>

      <Section tone="cream" width="content" gap={8} className="-mt-24">
        <SectionIntro title={t('marketing.pdp.activesTitle')} body={t('marketing.pdp.activesBody')} />
        {product.ingredients.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {product.ingredients.map((ing) => (
              <IngredientCard
                key={ing.name}
                name={ing.strength ? `${ing.name} ${ing.strength}` : ing.name}
                note={pickLocalized(ing.note, cl)}
                status={ing.claimStatus}
                statusLabel={ing.claimStatus === 'approved' ? statusLabel[ing.claimStatus] : undefined}
                image={INGREDIENT_PHOTOS[ing.name]}
              />
            ))}
          </div>
        ) : null}
        {product.fullIngredientList.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-lg md:text-xl text-foreground">{t('marketing.pdp.fullIngredients')}</h3>
            <ul className="grid max-w-[62rem] list-disc grid-cols-1 gap-x-8 gap-y-1 ps-5 font-body text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
              {product.fullIngredientList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <Section tone="grid" width="content" gap={8} className="-mt-24">
        <SectionIntro title={t('marketing.pdp.directionsTitle')} body={t('marketing.pdp.directionsBody')} />
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-lg md:text-xl text-foreground">{t('marketing.pdp.howToUse')}</h2>
          <Prose>{pickLocalized(product.usage, cl)}</Prose>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-lg md:text-xl text-foreground">{t('marketing.pdp.safety')}</h3>
          <Prose>{pickLocalized(product.safety, cl)}</Prose>
        </div>
        {product.storage ? (
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-lg md:text-xl text-foreground">{t('marketing.pdp.storage')}</h3>
            <Prose>{pickLocalized(product.storage, cl)}</Prose>
          </div>
        ) : null}
        {product.badges.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {product.badges.map((b) => (
              <Badge key={b} tone="neutral">
                {badgeLabel[b]}
              </Badge>
            ))}
          </div>
        ) : null}
      </Section>

      {product.supplementFacts ? (
        <Section tone="grid" width="content" gap={8} className="-mt-24">
          <SectionIntro
            title={t('marketing.pdp.supplementFacts.title')}
            body={`${t('marketing.pdp.supplementFacts.servingSize')}: ${product.supplementFacts.servingSize} · ${t('marketing.pdp.supplementFacts.servingsPerContainer')}: ${product.supplementFacts.servingsPerContainer}`}
          />
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-body text-sm">
                <thead>
                  <tr className="border-b border-border text-start text-muted-foreground">
                    <th className="py-2 text-start font-medium">&nbsp;</th>
                    <th className="py-2 text-start font-medium">{t('marketing.pdp.supplementFacts.amountPerServing')}</th>
                    <th className="py-2 text-start font-medium">{t('marketing.pdp.supplementFacts.dailyValue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {product.supplementFacts.rows.map((row) => (
                    <tr key={row.name} className="border-b border-border/60">
                      <td className="py-2 text-foreground">{row.name}</td>
                      <td className="py-2 text-muted-foreground">{row.amount}</td>
                      <td className="py-2 text-muted-foreground">{row.dailyValue ?? '*'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="font-body text-xs text-muted-foreground">{t('marketing.pdp.supplementFacts.dvFootnote')}</p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-lg md:text-xl text-foreground">
              {t('marketing.pdp.supplementFacts.otherIngredients')}
            </h3>
            <Prose>{product.supplementFacts.otherIngredients}</Prose>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-lg md:text-xl text-foreground">
              {t('marketing.pdp.supplementFacts.allergenWarning')}
            </h3>
            <Prose>{pickLocalized(product.supplementFacts.allergenWarning, cl)}</Prose>
          </div>
        </Section>
      ) : null}

      <Section tone="grid" width="content" gap={8} className="-mt-24">
        <SectionIntro title={t('marketing.pdp.detailsTitle')} body={t('marketing.pdp.detailsBody')} />
        <Accordion items={details} />
      </Section>

      {related.length > 0 ? (
        <Section tone="cream" width="content" gap={8} className="-mt-24">
          <SectionIntro title={t('marketing.pdp.relatedTitle')} body={t('marketing.pdp.relatedBody')} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            {related.map((p) => (
              <ProductCard
                key={p.slug}
                name={p.name}
                subtitle={pickLocalized(p.subtitle, cl)}
                to={withLocale(PATHS.product(p.slug))}
                priceLabel={p.price === null ? null : formatMoney(p.price, rooteContent.currency, cl).formatted}
                mediaAlt={t('common.packagingAlt', { name: p.name })}
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
