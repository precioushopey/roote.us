import { useState } from 'react';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  DisplayTitle,
  SectionIntro,
  Button,
  ProductCard,
  SegmentedControl,
  PendingChip,
  MediaPlaceholder,
  Hero,
  CtaSection,
  renderWithEmphasis,
} from '@/app/components/roote';
import { useAddedToCartPanel } from '@/app/components/cart/AddedToCartPanel';
import { useCart } from '@/store/cart';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { PRODUCTS, type Product } from '@/content/products';
import { SHOP_BUNDLES } from '@/content/bundles';
import { rooteContent } from '@/content/roote.config';
import { formatMoney } from '@/domain/report/money';
import heroImage from '@/assets/heroes/Hero.png';
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

/* Every bundle image was the same superseded dark-green/cream packaging
   mockup as the individual SKUs above — pulled project-wide (2026-09-22), no
   replacement shot yet. `BundleCard` renders a `MediaPlaceholder` when a
   bundle id has no entry here. */
const BUNDLE_PHOTOS: Record<string, string> = {};

type Filter = 'all' | 'thinning' | 'gray';

function matches(p: Product, f: Filter) {
  if (f === 'all') return true;
  if (f === 'thinning') return p.concern === 'thinning' || p.concern === 'thinning-support';
  return p.concern === 'gray' || p.concern === 'gray-support';
}

/* Shared quantity stepper, extracted from the two "flanking Add to Cart"
   rows below (product and bundle) so the stepper markup and behavior — reset
   to 1 after each add, clamp 1–20 — stay in one place instead of drifting
   apart. Quantity is local to the row (not the cart's own qty — that's
   edited on /cart). */
function QtyStepper({ qty, setQty }: { qty: number; setQty: (fn: (q: number) => number) => void }) {
  const t = useT();
  return (
    <div className="inline-flex shrink-0 items-center rounded-full border border-border">
      <button
        type="button"
        aria-label={t('cart.decrease')}
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className="px-3 py-2.5 font-body text-sm text-foreground"
      >
        −
      </button>
      <span className="min-w-7 text-center font-body text-sm tabular-nums text-foreground">{qty}</span>
      <button
        type="button"
        aria-label={t('cart.increase')}
        onClick={() => setQty((q) => Math.min(20, q + 1))}
        className="px-3 py-2.5 font-body text-sm text-foreground"
      >
        +
      </button>
    </div>
  );
}

/* Inline quantity stepper + Add to Cart, flanking each other below a product card. */
function AddToCartRow({ slug }: { slug: string }) {
  const t = useT();
  const cart = useCart();
  const added = useAddedToCartPanel();
  const [qty, setQty] = useState(1);

  return (
    <div className="flex items-center gap-2">
      {added.panel}
      <QtyStepper qty={qty} setQty={setQty} />
      <Button
        caps
        className="flex-1"
        onClick={() => {
          cart.add(slug, qty);
          added.show(slug, qty);
          setQty(1);
        }}
      >
        {t('cart.add')}
      </Button>
    </div>
  );
}

/* A fixed "buy the set" bundle — one product line in one packaging colorway,
   with its own direct Add to Cart (2026-09-23, matching the individual
   products above — no assessment required to buy here either). `compareAtPrice`
   (the real sum of the bundle's own components) renders struck through with a
   "Save $X" badge when it's set and higher than `price` — both are derived
   numbers, never invented (see bundles.ts). */
function BundleCard({ bundle }: { bundle: (typeof SHOP_BUNDLES)[number] }) {
  const t = useT();
  const cl = useLocale().locale;
  const cart = useCart();
  const added = useAddedToCartPanel();
  const [qty, setQty] = useState(1);
  const image = BUNDLE_PHOTOS[bundle.id];
  const hasDiscount = bundle.price !== null && bundle.compareAtPrice !== null && bundle.compareAtPrice > bundle.price;

  return (
    <div className="flex flex-col place-content-between gap-4">
      {added.panel}
      {image ? (
        <img src={image} alt={pickLocalized(bundle.name, cl)} loading="lazy" className="aspect-[3/4] w-full rounded-sm object-contain" />
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
        <div className="flex shrink-0 flex-col items-end gap-2">
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
      <div className="flex items-center gap-2">
        <QtyStepper qty={qty} setQty={setQty} />
        <Button
          caps
          className="flex-1"
          onClick={() => {
            cart.addBundle(bundle.id, qty);
            added.showBundle(bundle.id, qty);
            setQty(1);
          }}
        >
          {t('cart.add')}
        </Button>
      </div>
    </div>
  );
}

/* "Bundle & save" — 3 product lines × 2 packaging colorways = 6 fixed sets. */
function BundleSection() {
  const t = useT();
  return (
    <Section tone="cream" width="content" gap={8} className="-mt-24">
      <SectionIntro
        eyebrow={t('marketing.shop.bundles.eyebrow')}
        title={t('marketing.shop.bundles.heading')}
        body={t('marketing.shop.bundles.body')}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
        {SHOP_BUNDLES.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>
    </Section>
  );
}

/* Closing CTA — the shared teal final-CTA band used on every marketing page. */
function ShopFinalCta() {
  const t = useT();
  return <CtaSection title={t('marketing.shop.finalCta.heading')} body={t('marketing.shop.finalCta.body')} />;
}

/**
 * The catalogue browse page — every product has a direct "Add to Cart"
 * button (2026-09-22, product-owner request: no need to complete the
 * assessment before buying). Prices render as [PENDING].
 */
export function Products() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const [filter, setFilter] = useState<Filter>('all');
  const items = PRODUCTS.filter((p) => matches(p, filter));

  return (
    <>
      <Hero
        title={renderWithEmphasis(t('marketing.shop.heading'))}
        body={t('marketing.shop.body')}
        cta={
          <Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        }
        image={{
          src: heroImage,
          alt: t('marketing.shop.heroMediaAlt'),
          className: 'aspect-[4/3] w-full object-contain shadow-product',
        }}
      />

      <Section tone="cream" width="content" gap={8}>
        <div className="flex flex-col gap-12">
          <DisplayTitle as="h2" step="lg">
            {t('marketing.shop.catalogHeading')}
          </DisplayTitle>
          <SegmentedControl<Filter>
            label={t('marketing.shop.filterLabel')}
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: t('marketing.shop.filterAll') },
              { value: 'thinning', label: t('marketing.shop.filterThinning') },
              { value: 'gray', label: t('marketing.shop.filterGray') },
            ]}
            className="w-fit"
          />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
          {items.map((p) => (
            <div key={p.slug} className="flex flex-col place-content-between gap-4">
              <ProductCard
                name={p.name}
                subtitle={pickLocalized(p.subtitle, cl)}
                to={withLocale(PATHS.product(p.slug))}
                priceLabel={p.price === null ? null : formatMoney(p.price, rooteContent.currency, cl).formatted}
                packaging={p.concern === 'gray' || p.concern === 'gray-support' ? 'women' : 'men'}
                mediaAlt={t('common.packagingAlt', { name: p.name })}
                mediaLabel={`${p.name}: product photography`}
                image={PRODUCT_PHOTOS[p.slug]}
              />
              <AddToCartRow slug={p.slug} />
            </div>
          ))}
        </div>
      </Section>

      <BundleSection />
      <ShopFinalCta />
    </>
  );
}
