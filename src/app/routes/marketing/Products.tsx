import { useEffect, useRef, useState } from 'react';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  ProductCard,
  SegmentedControl,
  PendingChip,
  MediaPlaceholder,
} from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { PRODUCTS, getProduct, type Product } from '@/content/products';
import { SHOP_BUNDLES } from '@/content/bundles';
import { useCart } from '@/store/cart';
import catalogHero from '@/assets/images/catalog-hero.png';
import level6 from '@/assets/images/Level 6.png';
import level10 from '@/assets/images/Level 10.png';
import level15 from '@/assets/images/Level 15.png';
import graySupport from '@/assets/images/Gray Support.png';
import regrowthShampoo from '@/assets/images/Regrowth Shampoo.png';
import graySerum from '@/assets/images/Gray Serum.png';
import grayBundleWomen from '@/assets/images/gray-bundle-women.png';
import grayBundleMen from '@/assets/images/gray-bundle-men.png';
import systemWomen from '@/assets/images/system-women.png';
import systemMen from '@/assets/images/system-men.png';
import regrowthBundleMen from '@/assets/images/regrowth-bundle-men.png';
import regrowthBundleWomen from '@/assets/images/regrowth-bundle-women.png';

const PRODUCT_PHOTOS: Record<string, string> = {
  'density-6': level6,
  'density-10': level10,
  'density-15': level15,
  'gray-support': graySupport,
  'regrowth-shampoo': regrowthShampoo,
  'gray-serum': graySerum,
};

const BUNDLE_PHOTOS: Record<string, string> = {
  'complete-system-men': systemMen,
  'complete-system-women': systemWomen,
  'gray-support-bundle-men': grayBundleMen,
  'gray-support-bundle-women': grayBundleWomen,
  'hair-growth-bundle-men': regrowthBundleMen,
  'hair-growth-bundle-women': regrowthBundleWomen,
};

function bundleRequiresReview(bundle: (typeof SHOP_BUNDLES)[number]) {
  return bundle.skus.some((slug) => getProduct(slug)?.requiresMedicalReview);
}

type Filter = 'all' | 'thinning' | 'gray';

function matches(p: Product, f: Filter) {
  if (f === 'all') return true;
  if (f === 'thinning') return p.concern === 'thinning' || p.concern === 'thinning-support';
  return p.concern === 'gray' || p.concern === 'gray-support';
}

function AddToBagButton({ sku }: { sku: string }) {
  const t = useT();
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      aria-live="polite"
      onClick={() => {
        cart.add(sku);
        setAdded(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1600);
      }}
      className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-primary px-4 py-2 font-body text-xs font-medium tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {added ? t('cart.added') : t('cart.add')}
    </button>
  );
}

/* A fixed "buy the set" bundle — one product line in one packaging colorway.
   Price stays [PENDING] until the client supplies a price list — never
   invented. */
function BundleCard({ bundle }: { bundle: (typeof SHOP_BUNDLES)[number] }) {
  const t = useT();
  const cl = useContentLocale();
  const cart = useCart();
  const requiresReview = bundleRequiresReview(bundle);
  const image = BUNDLE_PHOTOS[bundle.id];
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="relative flex flex-col rounded-xl border border-border bg-card p-6">
      <span className="absolute -top-3 start-6 rounded-full bg-deep-950 px-3 py-1 font-body text-2xs font-semibold uppercase tracking-wide text-cream-100">
        {bundle.packaging === 'men' ? t('marketing.home.gray.forMen') : t('marketing.home.gray.forWomen')}
      </span>
      {image ? (
        <div className="mb-4 aspect-[4/3] w-full rounded-lg border border-gold-500 bg-white p-4">
          <img src={image} alt={pickLocalized(bundle.name, cl)} className="h-full w-full object-contain" />
        </div>
      ) : (
        <MediaPlaceholder
          className="mb-4"
          alt={pickLocalized(bundle.name, cl)}
          label={`${pickLocalized(bundle.name, cl)} — product photography`}
          ratio="4 / 3"
          rounded="lg"
          tone={bundle.packaging === 'men' ? 'teal' : 'cream'}
        />
      )}
      <p className="font-display text-lg text-foreground">{pickLocalized(bundle.name, cl)}</p>
      <p className="mt-2 font-body text-sm text-muted-foreground">{pickLocalized(bundle.summary, cl)}</p>
      <div className="mt-4 font-body text-sm text-foreground">
        {bundle.price === null ? <PendingChip label="price" /> : bundle.price}
      </div>
      {requiresReview ? (
        <p className="mt-6 font-body text-xs text-muted-foreground">{t('marketing.shop.reviewNote')}</p>
      ) : (
        <button
          type="button"
          aria-live="polite"
          onClick={() => {
            for (const sku of bundle.skus) cart.add(sku);
            setAdded(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setAdded(false), 1600);
          }}
          className="mt-6 h-11 rounded-full border border-border font-body text-sm font-medium text-foreground transition-colors hover:border-deep-700"
        >
          {added ? t('cart.added') : t('marketing.shop.bundles.cta')}
        </button>
      )}
    </div>
  );
}

/* "Bundle & save" — 3 product lines × 2 packaging colorways = 6 fixed sets.
   Gray Support Bundle is non-prescription and adds to bag in one click;
   Complete System and Hair Growth Bundle both include Density, so their
   cards show a review note instead (see `bundleRequiresReview`) — Density
   itself stays assessment + review gated. */
function BundleSection() {
  const t = useT();
  return (
    <Section tone="cream" width="content">
      <Eyebrow>{t('marketing.shop.bundles.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
        {t('marketing.shop.bundles.heading')}
      </DisplayTitle>
      <Prose className="mt-4 max-w-2xl">{t('marketing.shop.bundles.body')}</Prose>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SHOP_BUNDLES.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>
      <p className="mt-6 font-body text-xs text-muted-foreground">{t('marketing.shop.bundles.note')}</p>
    </Section>
  );
}

/* Closing CTA — mirrors the teal final-CTA band used on Home/About. */
function ShopFinalCta() {
  const t = useT();
  const withLocale = useLocalizedPath();
  return (
    <Section tone="teal" width="readable" className="border-b border-gold-500 text-center">
      <div className="flex flex-col items-center gap-5">
        <DisplayTitle as="h2" step="xl" onDark align="center">
          {t('marketing.shop.finalCta.heading')}
        </DisplayTitle>
        <Prose onDark size="lg" className="mx-auto text-center">
          {t('marketing.shop.finalCta.body')}
        </Prose>
        <Button
          to={withLocale(PATHS.analysis)}
          size="lg"
          caps
          className="bg-gold-500 text-ink text-sm md:text-base font-bold hover:bg-gold-600"
        >
          {t('marketing.nav.cta')}
        </Button>
      </div>
    </Section>
  );
}

/**
 * The à-la-carte shop — a kept, secondary "refills & add-ons" surface. Programs
 * with a prescription-strength component still require the assessment; this page
 * makes that explicit. Prices render as [PENDING].
 */
export function Products() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const [filter, setFilter] = useState<Filter>('all');
  const items = PRODUCTS.filter((p) => matches(p, filter));

  return (
    <>
      <Section tone="teal" width="content" animate={false}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow onDark className="rounded-full border border-gold-500 px-4 py-1.5">
              {t('marketing.nav.products')}
            </Eyebrow>
            <DisplayTitle as="h1" step="lg" onDark>
              {t('marketing.shop.heading')}
            </DisplayTitle>
            <Prose onDark size="lg" className="max-w-lg">
              {t('marketing.shop.body')}
            </Prose>
            <Button
              to={withLocale(PATHS.analysis)}
              size="lg"
              caps
              className="bg-gold-500 text-ink text-sm md:text-base font-bold hover:bg-gold-600"
            >
              {t('marketing.nav.cta')}
            </Button>
          </div>
          <img
            src={catalogHero}
            alt={t('marketing.shop.heroMediaAlt')}
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        </div>
      </Section>

      <Section tone="cream" width="content">
        <DisplayTitle as="h2" step="lg">
          {t('marketing.shop.catalogHeading')}
        </DisplayTitle>
        <SegmentedControl<Filter>
          className="mt-10"
          label={t('marketing.shop.filterLabel')}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('marketing.shop.filterAll') },
            { value: 'thinning', label: t('marketing.shop.filterThinning') },
            { value: 'gray', label: t('marketing.shop.filterGray') },
          ]}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.slug} className="flex flex-col">
              <ProductCard
                name={p.name}
                subtitle={pickLocalized(p.subtitle, cl)}
                to={withLocale(PATHS.product(p.slug))}
                priceLabel={p.price === null ? null : String(p.price)}
                packaging={p.concern === 'gray' || p.concern === 'gray-support' ? 'women' : 'men'}
                reviewRequired={p.requiresMedicalReview}
                mediaAlt={`${p.name} packaging`}
                mediaLabel={`${p.name} — product photography`}
                image={PRODUCT_PHOTOS[p.slug]}
              />
              {p.requiresMedicalReview ? (
                <p className="mt-2 font-body text-xs text-muted-foreground">
                  {t('marketing.shop.reviewNote')}
                </p>
              ) : (
                <AddToBagButton sku={p.slug} />
              )}
            </div>
          ))}
        </div>
      </Section>

      <BundleSection />
      <ShopFinalCta />
    </>
  );
}
