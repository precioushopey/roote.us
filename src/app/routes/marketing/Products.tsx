import { useRef, useState, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import { SHOP_BUNDLES, findBundle, bundleDisplayName, type ShopBundle } from '@/content/bundles';
import { BUNDLE_PHOTOS } from '@/content/bundlePhotos';
import { rooteContent } from '@/content/roote.config';
import { formatMoney } from '@/domain/report/money';
import catalogHero from '@/assets/heroes/catalog-hero.png';
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

/* Level-selector controls (chevrons + dots) overlaid on a bundle's photo,
   rendered only when a bundle has multiple density-level variants (Hair
   Growth: 6/10/15). Purely presentational; the caller owns which variant is
   selected. */
function LevelSelectorControls({ count, index, onGo }: { count: number; index: number; onGo: (i: number) => void }) {
  const t = useT();
  return (
    <>
      <button
        type="button"
        aria-label={t('marketing.shop.bundles.carousel.previous')}
        onClick={() => onGo((index - 1 + count) % count)}
        className="absolute inset-y-0 start-0 flex items-center px-2 text-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <ChevronLeft aria-hidden className="h-6 w-6 rounded-full bg-background/80" />
      </button>
      <button
        type="button"
        aria-label={t('marketing.shop.bundles.carousel.next')}
        onClick={() => onGo((index + 1) % count)}
        className="absolute inset-y-0 end-0 flex items-center px-2 text-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <ChevronRight aria-hidden className="h-6 w-6 rounded-full bg-background/80" />
      </button>
      <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={t('marketing.shop.bundles.carousel.goToImage', { index: String(i + 1) })}
            aria-current={i === index}
            onClick={() => onGo(i)}
            className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-foreground' : 'bg-foreground/30'}`}
          />
        ))}
      </div>
    </>
  );
}

const SWIPE_MIN_PX = 40;

/* Horizontal swipe for touch and pen input (mouse users have the hover
   chevrons). Spread the result onto the swipeable element and give it
   `touch-pan-y` so the browser keeps handling vertical scroll: a vertical pan
   fires pointercancel, which discards the gesture. Dragging toward the start
   edge means "next" in LTR and "previous" in RTL, mirroring how the chevrons
   sit on the start and end sides. */
function useSwipe(onPrev: () => void, onNext: () => void) {
  const { dir } = useLocale();
  const origin = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: PointerEvent) => {
      origin.current = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: PointerEvent) => {
      const from = origin.current;
      origin.current = null;
      if (!from) return;
      const dx = e.clientX - from.x;
      const dy = e.clientY - from.y;
      if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) <= Math.abs(dy)) return;
      const towardNext = dir === 'rtl' ? dx > 0 : dx < 0;
      (towardNext ? onNext : onPrev)();
    },
    onPointerCancel: () => {
      origin.current = null;
    },
  };
}

/* A fixed "buy the set" bundle — one product line in one packaging colorway,
   with its own direct Add to Cart (2026-09-23, matching the individual
   products above, no assessment required to buy here either). `variants`
   is length 1 for a bundle with no level choice (Complete System, Gray
   Support) and length 3 for Hair Growth (Level 6/10/15): the selector
   switches photo, title, price, and what "Add to cart" actually adds, all
   together (2026-09-23; previously the photo cycled through three levels
   while price/SKU stayed silently fixed at Level 15). `compareAtPrice` (the
   real sum of the bundle's own components) renders struck through with a
   "Save $X" badge when it's set and higher than `price` — both are derived
   numbers, never invented (see bundles.ts). */
function BundleCard({ variants }: { variants: ShopBundle[] }) {
  const t = useT();
  const cl = useLocale().locale;
  const cart = useCart();
  const added = useAddedToCartPanel();
  const [qty, setQty] = useState(1);
  const [index, setIndex] = useState(0);
  const count = variants.length;
  const swipe = useSwipe(
    () => setIndex((i) => (i - 1 + count) % count),
    () => setIndex((i) => (i + 1) % count),
  );
  const bundle = variants[index];
  const image = BUNDLE_PHOTOS[bundle.id];
  const name = bundleDisplayName(bundle, cl);
  const hasDiscount = bundle.price !== null && bundle.compareAtPrice !== null && bundle.compareAtPrice > bundle.price;

  return (
    <div className="flex flex-col place-content-between gap-4">
      {added.panel}
      <div className="group relative w-full touch-pan-y touch-pinch-zoom" {...swipe}>
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            draggable={false}
            className="aspect-[3/4] w-full rounded-sm object-contain"
          />
        ) : (
          <MediaPlaceholder
            alt={name}
            label={`${name}: product photography`}
            ratio="3 / 4"
            tone={bundle.packaging === 'men' ? 'teal' : 'cream'}
            className="w-full"
          />
        )}
        {variants.length > 1 && <LevelSelectorControls count={variants.length} index={index} onGo={setIndex} />}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-md text-foreground">{name}</h3>
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

const LEVELS = [6, 10, 15] as const;
/* Product lines with a 3-level (6/10/15) selector: id prefix, matching
   `content/bundles.ts`'s `hair-growth-bundle-<packaging>-<level>` /
   `complete-system-<packaging>-<level>` ids. Gray Support Bundle has no
   density SKU, so it stays a single-variant card. */
const LEVELED_LINES = ['complete-system', 'hair-growth-bundle'];

function levelVariants(idPrefix: string, packaging: 'men' | 'women'): ShopBundle[] {
  return LEVELS.map((level) => findBundle(`${idPrefix}-${packaging}-${level}`)!);
}

/* "Bundle & save": 3 product lines × 2 packaging colorways = 6 cards.
   Complete System and Hair Growth Bundle each contribute 6 SHOP_BUNDLES
   entries (2 packagings × 3 levels) that collapse into 2 cards apiece, each
   a level selector over its own 3 variants (see BundleCard). */
function BundleSection() {
  const t = useT();
  const singleBundles = SHOP_BUNDLES.filter((b) => !LEVELED_LINES.some((prefix) => b.id.startsWith(`${prefix}-`)));
  return (
    <Section tone="cream" width="content" gap={8} className="-mt-24">
      <SectionIntro
        eyebrow={t('marketing.shop.bundles.eyebrow')}
        title={t('marketing.shop.bundles.heading')}
        body={t('marketing.shop.bundles.body')}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
        <BundleCard key="complete-system-men" variants={levelVariants('complete-system', 'men')} />
        <BundleCard key="complete-system-women" variants={levelVariants('complete-system', 'women')} />
        {singleBundles.map((bundle) => (
          <BundleCard key={bundle.id} variants={[bundle]} />
        ))}
        <BundleCard key="hair-growth-men" variants={levelVariants('hair-growth-bundle', 'men')} />
        <BundleCard key="hair-growth-women" variants={levelVariants('hair-growth-bundle', 'women')} />
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
          src: catalogHero,
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
