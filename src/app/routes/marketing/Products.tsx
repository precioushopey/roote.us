import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
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
import { PATHS, EXTERNAL_ASSESSMENT_URL } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { PRODUCTS, getProduct, type Product } from '@/content/products';
import { SHOP_BUNDLES } from '@/content/bundles';
import { rooteContent } from '@/content/roote.config';
import { formatMoney } from '@/domain/report/money';
import { useCart } from '@/store/cart';
import catalogHero from '@/assets/heroes/catalog-hero.png';
import level6 from '@/assets/products/Level 6.png';
import level10 from '@/assets/products/Level 10.png';
import level15 from '@/assets/products/Level 15.png';
import graySupport from '@/assets/products/Gray Support.png';
import regrowthShampoo from '@/assets/products/Regrowth Shampoo.png';
import graySerum from '@/assets/products/Gray Serum.png';
import grayBundleWomen from '@/assets/bundles/gray-bundle-women.png';
import grayBundleMen from '@/assets/bundles/gray-bundle-men.png';
import systemWomen from '@/assets/bundles/system-women.png';
import systemMen from '@/assets/bundles/system-men.png';
import regrowthBundleMen from '@/assets/bundles/regrowth-bundle-men.png';
import regrowthBundleWomen from '@/assets/bundles/regrowth-bundle-women.png';

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

const OUTLINE_CTA_CLASS =
  'inline-flex w-full items-center justify-center rounded-xs border border-accent px-4 py-2.5 font-body text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground';

const MAX_QTY = 20;

/** Pre-add quantity picker — matches the same +/- stepper already used to
 *  edit line quantities on /bag (BagPage.tsx), just not yet in the cart. */
function QuantityStepper({ qty, onChange }: { qty: number; onChange: (qty: number) => void }) {
  const t = useT();
  return (
    <div className="inline-flex w-fit items-center self-start rounded-xs border border-border">
      <button
        type="button"
        aria-label={t('cart.decrease')}
        onClick={() => onChange(Math.max(1, qty - 1))}
        className="px-3 py-2.5 text-sm"
      >
        –
      </button>
      <span className="min-w-7 text-center text-sm tabular-nums">{qty}</span>
      <button
        type="button"
        aria-label={t('cart.increase')}
        onClick={() => onChange(Math.min(MAX_QTY, qty + 1))}
        className="px-3 py-2.5 text-sm"
      >
        +
      </button>
    </div>
  );
}

function AddToBagButton({ sku }: { sku: string }) {
  const t = useT();
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="mt-3 flex flex-row items-center gap-2">
      <QuantityStepper qty={qty} onChange={setQty} />
      <button
        type="button"
        aria-live="polite"
        onClick={() => {
          for (let i = 0; i < qty; i += 1) cart.add(sku);
          setAdded(true);
          setQty(1);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setAdded(false), 1600);
        }}
        className={`flex-1 ${OUTLINE_CTA_CLASS}`}
      >
        {added ? t('cart.added') : t('cart.add')}
      </button>
    </div>
  );
}

/* Density SKUs (and bundles that include one) are assessment + review gated —
   no direct add-to-bag. Point people at the free hair analysis instead of a
   bare "Review" badge or review note. `spaced` adds the top margin needed
   when there's no gap-providing parent (the catalog grid's wrapper), vs.
   bundle cards, whose `gap-4` column already spaces it. */
function FindYourMatchCta({ spaced = false }: { spaced?: boolean }) {
  const t = useT();
  return (
    <Link
      to={EXTERNAL_ASSESSMENT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={spaced ? `mt-3 ${OUTLINE_CTA_CLASS}` : OUTLINE_CTA_CLASS}
    >
      {t('marketing.shop.findYourMatchCta')}
    </Link>
  );
}

/* A fixed "buy the set" bundle — one product line in one packaging colorway.
   Price stays [PENDING] until the client supplies a price list — never
   invented. `compareAtPrice` (the real sum of the bundle's own components)
   renders struck through with a "Save $X" badge when it's set and higher
   than `price` — both are derived numbers, never invented (see bundles.ts). */
function BundleCard({ bundle }: { bundle: (typeof SHOP_BUNDLES)[number] }) {
  const t = useT();
  const cl = useContentLocale();
  const cart = useCart();
  const requiresReview = bundleRequiresReview(bundle);
  const image = BUNDLE_PHOTOS[bundle.id];
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const hasDiscount = bundle.price !== null && bundle.compareAtPrice !== null && bundle.compareAtPrice > bundle.price;

  return (
    <div className="flex flex-col place-content-between gap-4">
      {image ? (
        <img src={image} alt={pickLocalized(bundle.name, cl)} className="aspect-[3/4] w-full rounded-sm object-contain" />
      ) : (
        <MediaPlaceholder
          alt={pickLocalized(bundle.name, cl)}
          label={`${pickLocalized(bundle.name, cl)}: product photography`}
          ratio="3 / 4"
          tone={bundle.packaging === 'men' ? 'teal' : 'cream'}
          className="w-full"
        />
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-md text-foreground">{pickLocalized(bundle.name, cl)}</h3>
          <p className="font-body text-sm text-muted-foreground">{pickLocalized(bundle.summary, cl)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          {hasDiscount && (
            <span className="font-body text-sm text-muted-foreground line-through">
              {formatMoney(bundle.compareAtPrice!, rooteContent.currency, cl).formatted}
            </span>
          )}
          <span className="font-display text-3xl font-bold text-foreground">
            {bundle.price === null ? (
              <PendingChip label="price" />
            ) : (
              formatMoney(bundle.price, rooteContent.currency, cl).formatted
            )}
          </span>
          {hasDiscount && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 font-body text-sm font-semibold text-accent">
              {t('marketing.shop.bundles.save', {
                amount: formatMoney(bundle.compareAtPrice! - bundle.price!, rooteContent.currency, cl).formatted,
              })}
            </span>
          )}
        </div>
      </div>
      {requiresReview ? (
        <FindYourMatchCta />
      ) : (
        <div className="flex flex-row items-center gap-2">
          <QuantityStepper qty={qty} onChange={setQty} />
          <button
            type="button"
            aria-live="polite"
            onClick={() => {
              for (let i = 0; i < qty; i += 1) {
                for (const sku of bundle.skus) cart.add(sku);
              }
              setAdded(true);
              setQty(1);
              clearTimeout(timer.current);
              timer.current = setTimeout(() => setAdded(false), 1600);
            }}
            className={`flex-1 ${OUTLINE_CTA_CLASS}`}
          >
            {added ? t('cart.added') : t('marketing.shop.bundles.cta')}
          </button>
        </div>
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
      <DisplayTitle as="h2" step="lg" className="mt-2">
        {t('marketing.shop.bundles.heading')}
      </DisplayTitle>
      <Prose className="mt-4 max-w-2xl">{t('marketing.shop.bundles.body')}</Prose>
      <div className="mt-8 grid gap-x-6 gap-y-12 md:gap-y-18 sm:grid-cols-2 lg:grid-cols-3">
        {SHOP_BUNDLES.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>
    </Section>
  );
}

/* Closing CTA — mirrors the teal final-CTA band used on Home/About. */
function ShopFinalCta() {
  const t = useT();
  return (
    <Section tone="teal" width="readable" className="border-b border-accent text-center">
      <div className="flex flex-col items-center gap-5">
        <DisplayTitle as="h2" step="xl" align="center">
          {t('marketing.shop.finalCta.heading')}
        </DisplayTitle>
        <Prose size="lg" className="mx-auto text-center text-ink-foreground/75">
          {t('marketing.shop.finalCta.body')}
        </Prose>
        <Button
          to={EXTERNAL_ASSESSMENT_URL}
          external
          size="lg"
          caps
          className="text-sm font-bold"
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
      <Section tone="teal" width="content" animate={false} className="py-12 md:py-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <DisplayTitle as="h1" step="lg" className="!font-medium">
              {t('marketing.shop.heading')}
            </DisplayTitle>
            <Prose size="lg" className="max-w-lg text-ink-foreground/75">
              {t('marketing.shop.body')}
            </Prose>
            <Button
              to={EXTERNAL_ASSESSMENT_URL}
              external
              size="lg"
              caps
              className="text-sm"
            >
              {t('marketing.nav.cta')}
            </Button>
          </div>
          <img
            src={catalogHero}
            alt={t('marketing.shop.heroMediaAlt')}
            className="aspect-[4/3] w-full object-contain drop-shadow-[0_30px_40px_rgba(6,46,49,0.18)]"
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
        <div className="mt-8 grid gap-x-6 gap-y-12 md:gap-y-18 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.slug} className="flex flex-col">
              <ProductCard
                name={p.name}
                subtitle={pickLocalized(p.subtitle, cl)}
                to={withLocale(PATHS.product(p.slug))}
                priceLabel={p.price === null ? null : formatMoney(p.price, rooteContent.currency, cl).formatted}
                packaging={p.concern === 'gray' || p.concern === 'gray-support' ? 'women' : 'men'}
                mediaAlt={`${p.name} packaging`}
                mediaLabel={`${p.name}: product photography`}
                image={PRODUCT_PHOTOS[p.slug]}
              />
              {p.requiresMedicalReview ? <FindYourMatchCta spaced /> : <AddToBagButton sku={p.slug} />}
            </div>
          ))}
        </div>
      </Section>

      <BundleSection />
      <ShopFinalCta />
    </>
  );
}
