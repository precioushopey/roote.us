import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DISPLAY_CLAMP } from '@/app/components/marketing/displayScale';
import { SectionHeading } from '@/app/components/marketing/SectionHeading';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CtaButton } from '@/app/components/marketing/CtaButton';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { cn } from '@/app/components/ui/utils';
import { CATALOG, type CatalogProduct } from '@/content/catalog';
import { useCart } from '@/store/cart';
import { rooteContent } from '@/content/roote.config';
import productLineup from '@/assets/product-lineup.png';
import minoxidilPhoto from '@/assets/PRODUCTS/minoxidil_roote_product_image_2026.png';
import finasteridePhoto from '@/assets/PRODUCTS/finaesteride_roote_product_image_2026.png';
import azelaicPhoto from '@/assets/PRODUCTS/azelaic acid_roote_product_image_2026.png';
import abnPhoto from '@/assets/PRODUCTS/ABN Complex_roote_product_image_2026.png';

const INGREDIENT_PHOTOS: Record<string, string> = {
  minoxidil: minoxidilPhoto,
  finasteride: finasteridePhoto,
  azelaic: azelaicPhoto,
  abn: abnPhoto,
};

const ROLE_KEYS = {
  'regrowth-stimulant': 'marketing.home.products.role.regrowth-stimulant',
  'dht-blocker': 'marketing.home.products.role.dht-blocker',
  'dht-support': 'marketing.home.products.role.dht-support',
  'proprietary-support': 'marketing.home.products.role.proprietary-support',
} as const;

const ACTIVES_KEY = 'actives';
const ALL_KEY = 'all';

function AddToBagButton({ sku }: { sku: string }) {
  const t = useT();
  const cart = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleAdd() {
    cart.add(sku);
    setJustAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-live="polite"
      className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-primary px-4 py-2 text-xs font-medium tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {justAdded ? t('cart.added') : t('cart.add')}
    </button>
  );
}

function IngredientGrid() {
  const t = useT();
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
      {rooteContent.formula.ingredients.map((ing) => (
        <article key={ing.key} className="flex flex-col overflow-hidden rounded-xl border border-border bg-background">
          <div className="bg-secondary/40">
            <img src={INGREDIENT_PHOTOS[ing.key]} alt="" className="img-editorial aspect-square w-full object-cover" />
          </div>
          <div className="flex flex-1 flex-col gap-1 p-5">
            <p className="font-display text-base font-medium">{ing.name}</p>
            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
              {t(ROLE_KEYS[ing.role as keyof typeof ROLE_KEYS])}
            </p>
            {rooteContent.formula.displayPercentagesPublicly && ing.percentage != null && (
              <p className="mt-1 text-sm text-foreground">{ing.percentage}%</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function ProductGrid({ items }: { items: CatalogProduct[] }) {
  const t = useT();
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
      {items.map((p) => (
        <article key={p.sku} className="flex flex-col overflow-hidden rounded-xl border border-border bg-background">
          <div className="bg-secondary/40">
            <img src={p.photo} alt="" className="img-editorial aspect-square w-full object-cover" />
          </div>
          <div className="flex flex-1 flex-col gap-2 p-5">
            <p className="font-display text-base font-medium">{p.name}</p>
            <p className="text-sm text-muted-foreground">{t(p.descKey)}</p>
            <div className="mt-auto pt-2">
              <PendingChip label={`${p.name} price`} />
              <AddToBagButton sku={p.sku} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function FullRangeSection() {
  const t = useT();
  const [active, setActive] = useState<string>(CATALOG[0].titleKey);

  const tabs = [
    { key: ACTIVES_KEY, label: t('marketing.science.ingredients.title') },
    ...CATALOG.map((c) => ({ key: c.titleKey, label: t(c.titleKey) })),
  ];

  return (
    <Section>
      <span aria-hidden className="block font-body text-2xl leading-none tracking-[0.18em] text-accent">
        01
      </span>
      <h2
        className="mt-4 text-balance font-display font-medium uppercase leading-[0.95] tracking-[-0.02em] text-foreground"
        style={{ fontSize: DISPLAY_CLAMP }}
      >
        {t('marketing.products.catalog.title')}
      </h2>
      <Prose size="m" className="mt-5 max-w-xl">{t('marketing.products.catalog.body')}</Prose>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(160px,1fr)_3.4fr]">
        <div className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
          <button
            type="button"
            onClick={() => setActive(ALL_KEY)}
            className={cn(
              'inline-flex w-fit items-center gap-2 text-xs uppercase tracking-[0.18em] transition-colors',
              active === ALL_KEY ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t('marketing.products.range.viewAll')}
            <span aria-hidden>&rarr;</span>
          </button>
          <ul className="flex flex-col gap-3 border-t border-border pt-5">
            {tabs.map((tab) => (
              <li key={tab.key}>
                <button
                  type="button"
                  onClick={() => setActive(tab.key)}
                  aria-current={active === tab.key ? 'true' : undefined}
                  className={cn(
                    'text-start text-sm uppercase tracking-[0.12em] transition-colors',
                    active === tab.key
                      ? 'font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          {active === ALL_KEY ? (
            <div className="flex flex-col gap-14">
              <div>
                <h3 className="mb-6 font-display text-2xl font-medium">{t('marketing.science.ingredients.title')}</h3>
                <IngredientGrid />
              </div>
              {CATALOG.map((cat) => (
                <div key={cat.titleKey}>
                  <h3 className="mb-6 font-display text-2xl font-medium">{t(cat.titleKey)}</h3>
                  <ProductGrid items={cat.items} />
                </div>
              ))}
            </div>
          ) : active === ACTIVES_KEY ? (
            <IngredientGrid />
          ) : (
            <ProductGrid items={(CATALOG.find((c) => c.titleKey === active) ?? CATALOG[0]).items} />
          )}
        </div>
      </div>
    </Section>
  );
}

export function Products() {
  const t = useT();

  return (
    <>
      <Section tone="ink" className="overflow-hidden pt-28 text-center md:pt-32">
        <div className="relative flex flex-col items-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[85%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl"
          />
          <DisplayHeading as="h1" clamp={DISPLAY_CLAMP} onInk text={t('marketing.products.hero.title')} className="mx-auto max-w-3xl uppercase" />
          <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.products.hero.body')}</Prose>
          <div className="mt-8">
            <CtaButton to="/diagnosis" size="lg" className="w-full sm:w-auto">{t('marketing.nav.cta')}</CtaButton>
          </div>
        </div>
      </Section>

      <FullRangeSection />

      <Section tone="ink" className="overflow-hidden">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <SectionHeading index="02" onInk clamp={DISPLAY_CLAMP}>
              {t('marketing.products.customized.title')}
            </SectionHeading>
            <Prose size="l" onInk className="max-w-xl">{t('marketing.products.customized.body')}</Prose>
            <CtaButton to="/diagnosis" size="lg" className="mt-2 w-full sm:w-auto">
              {t('marketing.nav.cta')}
            </CtaButton>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden className="absolute inset-0 -z-10 scale-90 rounded-full bg-accent/40 blur-3xl" />
            <img src={productLineup} alt="" className="img-editorial w-full rounded-2xl object-cover" />
          </div>
        </div>
      </Section>
    </>
  );
}
