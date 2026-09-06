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
} from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { PRODUCTS, type Product } from '@/content/products';
import { useCart } from '@/store/cart';

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
        <div className="max-w-2xl">
          <Eyebrow onDark>{t('marketing.nav.products')}</Eyebrow>
          <DisplayTitle as="h1" step="lg" onDark className="mt-2">
            {t('marketing.shop.heading')}
          </DisplayTitle>
          <Prose onDark size="lg" className="mt-4">
            {t('marketing.shop.body')}
          </Prose>
          <Button to={withLocale(PATHS.analysis)} caps className="mt-6">
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>

      <Section tone="cream" width="content">
        <SegmentedControl<Filter>
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
    </>
  );
}
